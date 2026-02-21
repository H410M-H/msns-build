import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

const generateReportCardSchema = z.object({
  studentId: z.string().cuid(),
  examId: z.string().cuid(),
});

export const reportCardRouter = createTRPCRouter({
  generateReportCard: publicProcedure
    .input(generateReportCardSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get all marks for the student in the exam
        const marks = await ctx.db.marks.findMany({
          where: {
            studentId: input.studentId,
            examId: input.examId,
          },
          include: {
            Exam: {
              select: {
                sessionId: true,
                classId: true,
                passingMarks: true,
                totalMarks: true,
              },
            },
          },
        });

        if (marks.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No marks found for this student and exam",
          });
        }

        // Check if all subjects have marks
        const exam = await ctx.db.exam.findUnique({
          where: { examId: input.examId },
        });

        if (!exam) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Exam not found",
          });
        }

        const classSubjects = await ctx.db.classSubject.findMany({
          where: { classId: exam.classId },
          select: { subjectId: true },
        });

        const uploadedSubjects = new Set(marks.map((m) => m.subjectId));
        if (uploadedSubjects.size !== classSubjects.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not all subject marks are uploaded yet",
          });
        }

        // Calculate totals
        let totalObtained = 0;
        let totalMax = 0;
        const reportDetails: {
          subjectId: string;
          totalMarks: number;
          obtainedMarks: number;
          percentage: number;
          remarks?: string;
        }[] = [];

        marks.forEach((mark) => {
          totalObtained += mark.obtainedMarks;
          totalMax += mark.totalMarks;

          const percentage = (mark.obtainedMarks / mark.totalMarks) * 100;
          reportDetails.push({
            subjectId: mark.subjectId,
            totalMarks: mark.totalMarks,
            obtainedMarks: mark.obtainedMarks,
            percentage,
            remarks:
              percentage >= exam.passingMarks ? "Passed" : "Failed",
          });
        });

        const overallPercentage = (totalObtained / totalMax) * 100;
        const status =
          overallPercentage >= exam.passingMarks ? "PASSED" : "FAILED";

        // Check if report card already exists
        const existingReport = await ctx.db.reportCard.findFirst({
          where: {
            studentId: input.studentId,
            examId: input.examId,
          },
        });

        let reportCard;
        if (existingReport) {
          // Update existing report card
          reportCard = await ctx.db.reportCard.update({
            where: { reportCardId: existingReport.reportCardId },
            data: {
              totalObtainedMarks: totalObtained,
              totalMaxMarks: totalMax,
              percentage: overallPercentage,
              status: status as "PASSED" | "FAILED" | "PENDING",
              ReportCardDetail: {
                deleteMany: {},
                create: reportDetails.map((detail) => ({
                  subjectId: detail.subjectId,
                  totalMarks: detail.totalMarks,
                  obtainedMarks: detail.obtainedMarks,
                  percentage: detail.percentage,
                  remarks: detail.remarks,
                })),
              },
            },
            include: { ReportCardDetail: true },
          });
        } else {
          // Create new report card
          reportCard = await ctx.db.reportCard.create({
            data: {
              studentId: input.studentId,
              examId: input.examId,
              sessionId: marks[0]!.Exam.sessionId,
              classId: marks[0]!.Exam.classId,
              totalObtainedMarks: totalObtained,
              totalMaxMarks: totalMax,
              percentage: overallPercentage,
              status: status as "PASSED" | "FAILED" | "PENDING",
              ReportCardDetail: {
                create: reportDetails.map((detail) => ({
                  subjectId: detail.subjectId,
                  totalMarks: detail.totalMarks,
                  obtainedMarks: detail.obtainedMarks,
                  percentage: detail.percentage,
                  remarks: detail.remarks,
                })),
              },
            },
            include: { ReportCardDetail: true },
          });
        }

        return {
          success: true,
          message: "Report card generated successfully",
          reportCard,
        };
      } catch (error) {
        console.error("Error generating report card:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate report card",
        });
      }
    }),

  updateReportCard: publicProcedure
    .input(
      z.object({
        reportCardId: z.string().cuid(),
        details: z.array(
          z.object({
            subjectId: z.string().cuid(),
            obtainedMarks: z.number().min(0),
            totalMarks: z.number().min(1),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const report = await ctx.db.reportCard.findUnique({
          where: { reportCardId: input.reportCardId },
          include: { Exam: true },
        });

        if (!report) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Report card not found",
          });
        }

        let totalObtained = 0;
        let totalMax = 0;

        const updatedDetailsChunks = input.details.map((detail) => {
          totalObtained += detail.obtainedMarks;
          totalMax += detail.totalMarks;
          const percentage = (detail.obtainedMarks / detail.totalMarks) * 100;
          return {
            reportCardId: input.reportCardId,
            subjectId: detail.subjectId,
            obtainedMarks: detail.obtainedMarks,
            totalMarks: detail.totalMarks,
            percentage,
            remarks: percentage >= report.Exam.passingMarks ? "Passed" : "Failed",
          };
        });

        const overallPercentage = (totalObtained / totalMax) * 100;
        const status =
          overallPercentage >= report.Exam.passingMarks ? "PASSED" : "FAILED";

        const updatedReportCard = await ctx.db.$transaction([
          ctx.db.reportCardDetail.deleteMany({
            where: { reportCardId: input.reportCardId },
          }),
          ctx.db.reportCardDetail.createMany({
            data: updatedDetailsChunks,
          }),
          ctx.db.reportCard.update({
            where: { reportCardId: input.reportCardId },
            data: {
              totalObtainedMarks: totalObtained,
              totalMaxMarks: totalMax,
              percentage: overallPercentage,
              status: status,
            },
            include: { ReportCardDetail: true },
          }),
        ]);

        return {
          success: true,
          message: "Report card updated successfully",
          reportCard: updatedReportCard[2],
        };
      } catch (error) {
        console.error("Error updating report card:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update report card",
        });
      }
    }),

  getStudentReportCard: publicProcedure
    .input(
      z.object({
        studentId: z.string().cuid(),
        examId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const reportCard = await ctx.db.reportCard.findFirst({
          where: {
            studentId: input.studentId,
            examId: input.examId,
          },
          include: {
            Students: {
              select: {
                studentName: true,
                registrationNumber: true,
                admissionNumber: true,
              },
            },
            Exam: {
              select: {
                examTypeEnum: true,
                startDate: true,
                endDate: true,
              },
            },
            ReportCardDetail: {
              include: {
                Subject: { select: { subjectName: true } },
              },
            },
          },
        });

        return reportCard;
      } catch (error) {
        console.error("Error fetching report card:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch report card",
        });
      }
    }),

  getClassReportCards: publicProcedure
    .input(
      z.object({
        examId: z.string().cuid(),
        classId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const reportCards = await ctx.db.reportCard.findMany({
          where: {
            examId: input.examId,
            classId: input.classId,
          },
          include: {
            Students: {
              select: {
                studentName: true,
                admissionNumber: true,
                registrationNumber: true,
              },
            },
            Exam: { select: { examTypeEnum: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        return reportCards;
      } catch (error) {
        console.error("Error fetching class report cards:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch report cards",
        });
      }
    }),

  getStudentSessionReports: publicProcedure
    .input(
      z.object({
        studentId: z.string().cuid(),
        sessionId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const reports = await ctx.db.reportCard.findMany({
          where: {
            studentId: input.studentId,
            sessionId: input.sessionId,
          },
          include: {
            Exam: {
              select: {
                examTypeEnum: true,
                startDate: true,
                totalMarks: true,
              },
            },
            ReportCardDetail: true,
          },
          orderBy: { createdAt: "desc" },
        });

        return reports;
      } catch (error) {
        console.error("Error fetching student session reports:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch student reports",
        });
      }
    }),

  deleteReportCard: publicProcedure
    .input(z.object({ reportCardId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Delete associated details first
        await ctx.db.reportCardDetail.deleteMany({
          where: { reportCardId: input.reportCardId },
        });

        // Delete report card
        await ctx.db.reportCard.delete({
          where: { reportCardId: input.reportCardId },
        });

        return {
          success: true,
          message: "Report card deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting report card:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete report card",
        });
      }
    }),
});

import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { generatePdf } from "~/lib/pdf-reports";

type FeeWithRelations = Prisma.FeesGetPayload<{
  include: {
    FeeStudentClass: true;
  };
}>;

export const feeRouter = createTRPCRouter({
  getAllFees: publicProcedure.query<FeeWithRelations[]>(async ({ ctx }) => {
    try {
      return await ctx.db.fees.findMany({
        select: {
          feeId: true,
          level: true,
          admissionFee: true,
          tuitionFee: true,
          examFund: true,
          computerLabFund: true,
          studentIdCardFee: true,
          infoAndCallsFee: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          FeeStudentClass: true,
        },
      });
    } catch (error) {
      console.error("Error in getAllFees:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve fees",
      });
    }
  }),

  createFee: publicProcedure
    .input(
      z.object({
        level: z.string().min(1, "Level is required"),
        admissionFee: z.number().min(0).default(5000),
        tuitionFee: z.number().min(0, "Tuition fee required"),
        examFund: z.number().min(0).default(0),
        computerLabFund: z.number().min(0).optional(),
        studentIdCardFee: z.number().min(0).default(500),
        infoAndCallsFee: z.number().min(0).default(500),
      })
    )
    .mutation<FeeWithRelations>(async ({ ctx, input }) => {
      try {
        return await ctx.db.fees.create({
          data: {
            ...input,
            updatedAt: new Date(),
          },
          select: {
            feeId: true,
            level: true,
            admissionFee: true,
            tuitionFee: true,
            examFund: true,
            computerLabFund: true,
            studentIdCardFee: true,
            infoAndCallsFee: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            FeeStudentClass: true,
          },
        });
      } catch (error) {
        console.error("Error in createFee:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create fee",
        });
      }
    }),

    deleteFeesByIds: publicProcedure
  .input(z.object({ feeIds: z.array(z.string().cuid()) }))
  .mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.fees.deleteMany({
        where: {
          feeId: {
            in: input.feeIds,
          },
        },
      })
    } catch (error) {
      console.error("Error deleting fees:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete fees",
      })
    }
  }),

  assignFeeToStudent: publicProcedure
    .input(
      z.object({
        feeId: z.string().cuid(),
        classId: z.string().cuid(),
        studentId: z.string().cuid(),
        sessionId: z.string().cuid(),
        discount: z.number().min(0),
        discountbypercent: z.number().min(0).max(100),
        discountDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const studentClass = await ctx.db.studentClass.findFirst({
          where: {
            studentId: input.studentId,
            classId: input.classId,
            sessionId: input.sessionId,
          },
        });

        if (!studentClass) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "StudentClass not found",
          });
        }

        return await ctx.db.feeStudentClass.create({
          data: {
            fees: { connect: { feeId: input.feeId } },
            StudentClass: {
              connect: {
                scId: studentClass.scId,
              },
            },
            discount: input.discount,
            discountByPercent: input.discountbypercent,
            discountDescription: input.discountDescription ?? "",
          },
        });
      } catch (error) {
        console.error("Error assigning fee:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign fee",
        });
      }
    }),

  updateFeeAssignment: publicProcedure
    .input(
      z.object({
        sfcId: z.string().cuid(),
        discount: z.number().min(0),
        discountbypercent: z.number().min(0).max(100),
        discountDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.feeStudentClass.update({
          where: { sfcId: input.sfcId },
          data: {
            discount: input.discount,
            discountByPercent: input.discountbypercent,
            discountDescription: input.discountDescription,
          },
        });
      } catch (error) {
        console.error("Error updating fee assignment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update fee assignment",
        });
      }
    }),

  removeFeeAssignment: publicProcedure
    .input(z.object({ sfcId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.feeStudentClass.delete({
          where: { sfcId: input.sfcId },
        });
      } catch (error) {
        console.error("Error removing fee assignment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove fee assignment",
        });
      }
    }),

  updateFee: publicProcedure
    .input(
      z.object({
        feeId: z.string().cuid(),
        data: z.object({
          level: z.string().optional(),
          admissionFee: z.number().min(0).optional(),
          tuitionFee: z.number().min(0).optional(),
          examFund: z.number().min(0).optional(),
          computerLabFund: z.number().min(0).optional(),
          studentIdCardFee: z.number().min(0).optional(),
          infoAndCallsFee: z.number().min(0).optional(),
          type: z.enum(["MonthlyFee", "AnnualFee"]).optional(),
        }),
      })
    )
    .mutation<FeeWithRelations>(async ({ ctx, input }) => {
      try {
        return await ctx.db.fees.update({
          where: { feeId: input.feeId },
          data: input.data,
          select: {
            feeId: true,
            level: true,
            admissionFee: true,
            tuitionFee: true,
            examFund: true,
            computerLabFund: true,
            studentIdCardFee: true,
            infoAndCallsFee: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            FeeStudentClass: true,
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Fee not found",
            });
          }
        }
        console.error("Error in updateFee:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update fee",
        });
      }
    }),

    getFeeAssignmentsByClassAndSession: publicProcedure
    .input(
      z.object({
        classId: z.string().cuid(),
        sessionId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const feeAssignments = await ctx.db.feeStudentClass.findMany({
        where: {
          StudentClass: {
            classId: input.classId,
            sessionId: input.sessionId,
          },
        },
        select: {
          sfcId: true,
          studentClassId: true,
          feeId: true,
          tuitionPaid: true,
          examFundPaid: true,
          computerLabPaid: true,
          studentIdCardPaid: true,
          infoAndCallsPaid: true,
          discount: true,
          discountByPercent: true,
          discountDescription: true,
          createdAt: true,
          updatedAt: true,
          fees: {
            select: {
              tuitionFee: true,
              examFund: true,
              computerLabFund: true,
              studentIdCardFee: true,
              infoAndCallsFee: true,
              admissionFee: true,
              type: true,
              level: true,
            },
          },
          StudentClass: {
            select: {
              Students: {
                select: {
                  studentId: true,
                  registrationNumber: true,
                  studentName: true,
                },
              },
              Grades: {
                select: {
                  grade: true,
                  section: true,
                },
              },
            },
          },
        },
      });
      return feeAssignments.map((assignment) => {
        // Explicitly type the nested relations
        const student = assignment.StudentClass.Students;
        const grade = assignment.StudentClass.Grades;
        
        return {
          ...assignment,
          studentClass: {
            student: {
              studentId: student.studentId,
              registrationNumber: student.registrationNumber,
              studentName: student.studentName
            },
            class: {
              grade: grade.grade,
              section: grade.section
            }
          },
        };
      });
    }),

    updatePaymentStatus: publicProcedure
  .input(z.object({
    sfcId: z.string().cuid(),
    feeType: z.enum([
      "tuition", 
      "examFund", 
      "computerLab", 
      "studentIdCard", 
      "infoAndCalls"
    ]),
    paid: z.boolean()
  }))
  .mutation(async ({ ctx, input }) => {
    const updateData = {
      [input.feeType + "Paid"]: input.paid
    };
    
    return ctx.db.feeStudentClass.update({
      where: { sfcId: input.sfcId },
      data: updateData
    });
  }),

  generateFeeReport: publicProcedure
    .query<{ pdf: string; filename: string }>(async ({ ctx }) => {
      try {
        const fees = await ctx.db.fees.findMany({
          select: {
            feeId: true,
            level: true,
            tuitionFee: true,
            type: true,
            createdAt: true,
          },
        });

        const headers = [
          { key: "feeId", label: "Fee ID" },
          { key: "level", label: "Level" },
          { key: "admissionFee", label: "Admission Fee" },
          { key: "tuitionFee", label: "Tuition Fee" },
          { key: "computerLabFund", label: "Computer Lab" },
          { key: "studentCount", label: "Students" },
        ];
        const pdfBuffer = await generatePdf(fees, headers, "Fee Structure Report");

        return {
          pdf: Buffer.from(pdfBuffer).toString("base64"),
          filename: `fee-report-${Date.now()}.pdf`,
        };
      } catch (error) {
        console.error("Error generating fee report:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate fee report",
        });
      }
    }),

  // New procedure: getFeeByEachMonth
  getFeeByEachMonth: publicProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get all fee payments for the specified month/year
        const feePayments = await ctx.db.feeStudentClass.findMany({
          where: {
            createdAt: {
              gte: new Date(input.year, input.month - 1, 1),
              lt: new Date(input.year, input.month, 1),
            },
          },
          include: {
            fees: true,
            StudentClass: {
              include: {
                Grades: true,
                Students: true,
              },
            },
          },
        })

        // Group by class and calculate totals
        type ClassFeeSummary = {
          className: string;
          totalPaid: number;
          studentCount: number;
          payments: {
            studentName: string;
            amount: number;
            discount: number;
          }[];
        };

        const feesByClass = feePayments.reduce(
          (acc: Record<string, ClassFeeSummary>, payment) => {
            const className = `${payment.StudentClass.Grades.grade} - ${payment.StudentClass.Grades.section}`;

            if (!acc[className]) {
              acc[className] = {
                className,
                totalPaid: 0,
                studentCount: 0,
                payments: [],
              };
            }

            // Calculate total paid for this student
            let studentTotal = 0;
            if (payment.tuitionPaid) studentTotal += payment.fees.tuitionFee;
            if (payment.examFundPaid) studentTotal += payment.fees.examFund;
            if (payment.computerLabPaid) studentTotal += payment.fees.computerLabFund ?? 0;
            if (payment.studentIdCardPaid) studentTotal += payment.fees.studentIdCardFee;
            if (payment.infoAndCallsPaid) studentTotal += payment.fees.infoAndCallsFee;

            // Apply discount
            const discountAmount =
              payment.discountByPercent > 0 ? (studentTotal * payment.discountByPercent) / 100 : payment.discount;

            studentTotal -= discountAmount;

            acc[className].totalPaid += studentTotal;
            acc[className].studentCount += 1;
            acc[className].payments.push({
              studentName: payment.StudentClass.Students.studentName,
              amount: studentTotal,
              discount: discountAmount,
            });

            return acc;
          },
          {} as Record<string, ClassFeeSummary>,
        );

        const result = Object.values(feesByClass)
        const grandTotal = result.reduce((sum, classData) => sum + classData.totalPaid, 0)

        return {
          feesByClass: result,
          grandTotal,
          month: input.month,
          year: input.year,
        }
      } catch (error) {
        console.error("Error fetching monthly fees:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch monthly fees",
        })
      }
    }),
});
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, managementProcedure } from "../trpc";
import { z } from "zod";

interface SessionProps {
  sessionId: string;
  sessionName: string;
  sessionFrom: Date;
  sessionTo: Date;
  isActive: boolean;
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)");

export const SessionRouter = createTRPCRouter({
  getActiveSession: protectedProcedure.query<SessionProps | null>(
    async ({ ctx }) => {
      try {
        const session = await ctx.db.sessions.findFirst({
          where: { isActive: true },
          select: {
            sessionId: true,
            sessionName: true,
            sessionFrom: true,
            sessionTo: true,
            isActive: true,
          },
        });

        if (!session) return null;

        return {
          sessionId: session.sessionId,
          sessionName: session.sessionName,
          sessionFrom: new Date(session.sessionFrom),
          sessionTo: new Date(session.sessionTo),
          isActive: session.isActive,
        };
      } catch (error) {
        console.error("Error in getActiveSession:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve active session",
        });
      }
    },
  ),

  getSessions: protectedProcedure.query<SessionProps[]>(async ({ ctx }) => {
    try {
      const sessions = await ctx.db.sessions.findMany({
        orderBy: { sessionFrom: "desc" },
        select: {
          sessionId: true,
          sessionName: true,
          sessionFrom: true,
          sessionTo: true,
          isActive: true,
        },
      });

      return sessions.map((s) => ({
        sessionId: s.sessionId,
        sessionName: s.sessionName,
        sessionFrom: new Date(s.sessionFrom),
        sessionTo: new Date(s.sessionTo),
        isActive: s.isActive,
      }));
    } catch (error) {
      console.error("Error in getSessions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve sessions",
      });
    }
  }),

  getGroupedSessions: protectedProcedure.query<
    { year: string; sessions: SessionProps[] }[]
  >(async ({ ctx }) => {
    try {
      const sessions = await ctx.db.sessions.findMany({
        orderBy: { sessionFrom: "desc" },
        select: {
          sessionId: true,
          sessionName: true,
          sessionFrom: true,
          sessionTo: true,
          isActive: true,
        },
      });

      const groupedSessions = sessions.reduce((acc, session) => {
        const sessionFromDate = new Date(session.sessionFrom);
        const year = sessionFromDate.getFullYear().toString();
        const existing = acc.get(year) ?? [];

        acc.set(year, [
          ...existing,
          {
            sessionId: session.sessionId,
            sessionName: session.sessionName,
            sessionFrom: new Date(session.sessionFrom),
            sessionTo: new Date(session.sessionTo),
            isActive: session.isActive,
          },
        ]);

        return acc;
      }, new Map<string, SessionProps[]>());

      return Array.from(groupedSessions, ([year, sessions]) => ({
        year,
        sessions,
      }));
    } catch (error) {
      console.error("Error in getGroupedSessions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve grouped sessions",
      });
    }
  }),

  createSession: managementProcedure
    .input(
      z.object({
        sessionName: z.string().min(1, "Session name is required"),
        sessionFrom: dateSchema,
        sessionTo: dateSchema,
      }),
    )
    .mutation<SessionProps>(async ({ ctx, input }) => {
      try {
        // Validate that sessionFrom is before sessionTo
        const fromDate = new Date(input.sessionFrom);
        const toDate = new Date(input.sessionTo);

        if (fromDate >= toDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Session end date must be after start date",
          });
        }

        const newSession = await ctx.db.sessions.create({
          data: {
            sessionName: input.sessionName,
            sessionFrom: fromDate.toISOString(),
            sessionTo: toDate.toISOString(),
            isActive: false,
          },
          select: {
            sessionId: true,
            sessionName: true,
            sessionFrom: true,
            sessionTo: true,
            isActive: true,
          },
        });

        return {
          sessionId: newSession.sessionId,
          sessionName: newSession.sessionName,
          sessionFrom: new Date(newSession.sessionFrom),
          sessionTo: new Date(newSession.sessionTo),
          isActive: newSession.isActive,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Error in createSession:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create session",
        });
      }
    }),

  deleteSessionsByIds: managementProcedure
    .input(z.object({ sessionIds: z.array(z.string()) }))
    .mutation<{ count: number }>(async ({ ctx, input }) => {
      try {
        const sessions = await ctx.db.sessions.findMany({
          where: { sessionId: { in: input.sessionIds } },
        });

        // Prevent deleting active session
        const activeSession = sessions.find(s => s.isActive);
        if (activeSession) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete active session",
          });
        }

        let deletedCount = 0;

        await ctx.db.$transaction(async (tx) => {
          for (const sessionId of input.sessionIds) {
            // Delete related Timetable entries
            await tx.timetable.deleteMany({ where: { sessionId } });

            // Delete ClassSubject
            const classSubjects = await tx.classSubject.findMany({ where: { sessionId } });
            const csIds = classSubjects.map(cs => cs.csId);
            if (csIds.length > 0) {
              await tx.marks.deleteMany({ where: { classSubjectId: { in: csIds } } });
              await tx.subjectDiary.deleteMany({ where: { classSubjectId: { in: csIds } } });
              await tx.classSubject.deleteMany({ where: { sessionId } });
            }

            // Delete StudentAttendance
            await tx.studentAttendance.deleteMany({ where: { sessionId } });

            // Delete FeeStudentClass before StudentClass
            const studentClasses = await tx.studentClass.findMany({
              where: { sessionId },
              select: { scId: true },
            });
            const scIds = studentClasses.map(sc => sc.scId);
            if (scIds.length > 0) {
              await tx.feeStudentClass.deleteMany({ where: { studentClassId: { in: scIds } } });
            }
            await tx.studentClass.deleteMany({ where: { sessionId } });

            // Delete Exams and their relations
            const exams = await tx.exam.findMany({ where: { sessionId } });
            const examIds = exams.map(e => e.examId);
            if (examIds.length > 0) {
              await tx.marks.deleteMany({ where: { examId: { in: examIds } } });
              await tx.examDatesheet.deleteMany({ where: { examId: { in: examIds } } });
              await tx.examinationMarkingSession.deleteMany({ where: { examId: { in: examIds } } });
              await tx.promotionEligibilityResult.deleteMany({ where: { examId: { in: examIds } } });
              await tx.exam.deleteMany({ where: { sessionId } });
            }

            // Delete ReportCard
            const reportCards = await tx.reportCard.findMany({ where: { sessionId } });
            const rcIds = reportCards.map(rc => rc.reportCardId);
            if (rcIds.length > 0) {
              await tx.reportCardDetail.deleteMany({ where: { reportCardId: { in: rcIds } } });
              await tx.reportCard.deleteMany({ where: { sessionId } });
            }

            // Delete LeaveBalances
            await tx.leaveBalance.deleteMany({ where: { sessionId } });

            // Delete SalaryAssignment & Salary
            await tx.salaryAssignment.deleteMany({ where: { sessionId } });
            await tx.salary.deleteMany({ where: { sessionId } });

            // Delete PromotionHistory & BulkPromotionBatch
            await tx.promotionHistory.deleteMany({
              where: { OR: [{ fromSessionId: sessionId }, { toSessionId: sessionId }] }
            });
            const bulkBatches = await tx.bulkPromotionBatch.findMany({
              where: { OR: [{ fromSessionId: sessionId }, { toSessionId: sessionId }] }
            });
            const batchIds = bulkBatches.map(b => b.batchId);
            if (batchIds.length > 0) {
              await tx.bulkPromotionBatchItem.deleteMany({ where: { batchId: { in: batchIds } } });
              await tx.bulkPromotionBatch.deleteMany({ where: { batchId: { in: batchIds } } });
            }

            // Delete BulkSalaryCreationBatch
            const bulkSalaryBatches = await tx.bulkSalaryCreationBatch.findMany({
              where: { toSessionId: sessionId }
            });
            const bulkSalaryBatchIds = bulkSalaryBatches.map(b => b.batchId);
            if (bulkSalaryBatchIds.length > 0) {
              await tx.bulkSalaryCreationItem.deleteMany({ where: { batchId: { in: bulkSalaryBatchIds } } });
              await tx.bulkSalaryCreationBatch.deleteMany({ where: { batchId: { in: bulkSalaryBatchIds } } });
            }

            // Delete BudgetPlans and allocations
            const budgetPlans = await tx.budgetPlan.findMany({
              where: { sessionId },
              select: { budgetPlanId: true },
            });
            const planIds = budgetPlans.map(bp => bp.budgetPlanId);
            if (planIds.length > 0) {
              await tx.budgetAllocation.deleteMany({ where: { budgetPlanId: { in: planIds } } });
              await tx.budgetReallocation.deleteMany({ where: { budgetPlanId: { in: planIds } } });
              await tx.budgetPlan.deleteMany({ where: { sessionId } });
            }

            // Delete PettyCashRegister
            const pettyCash = await tx.pettyCashRegister.findUnique({
              where: { sessionId },
            });
            if (pettyCash) {
              await tx.pettyCashDisbursement.deleteMany({ where: { registerId: pettyCash.registerId } });
              await tx.pettyCashReconciliation.deleteMany({ where: { registerId: pettyCash.registerId } });
              await tx.pettyCashRegister.delete({ where: { sessionId } });
            }
          }

          const result = await tx.sessions.deleteMany({
            where: { sessionId: { in: input.sessionIds } },
          });
          deletedCount = result.count;

          for (const session of sessions) {
            await tx.broadcast.create({
              data: {
                router: "session.deleteSessionsByIds",
                action: "DELETE",
                message: `Deleted session: ${session.sessionName}`,
              },
            });
          }
        });

        return { count: deletedCount };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Error in deleteSessionsByIds:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete sessions",
        });
      }
    }),

  setActiveSession: managementProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation<SessionProps>(async ({ ctx, input }) => {
      try {
        await ctx.db.$transaction([
          ctx.db.sessions.updateMany({
            where: { isActive: true },
            data: { isActive: false },
          }),
          ctx.db.sessions.update({
            where: { sessionId: input.sessionId },
            data: { isActive: true },
            select: {
              sessionId: true,
              sessionName: true,
              sessionFrom: true,
              sessionTo: true,
              isActive: true,
            },
          }),
        ]);

        const activatedSession = await ctx.db.sessions.findUniqueOrThrow({
          where: { sessionId: input.sessionId },
          select: {
            sessionId: true,
            sessionName: true,
            sessionFrom: true,
            sessionTo: true,
            isActive: true,
          },
        });

        return {
          sessionId: activatedSession.sessionId,
          sessionName: activatedSession.sessionName,
          sessionFrom: new Date(activatedSession.sessionFrom),
          sessionTo: new Date(activatedSession.sessionTo),
          isActive: Boolean(activatedSession.isActive),
        };
      } catch (error) {
        console.error("Error in setActiveSession:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set active session",
        });
      }
    }),

  setSessionCompleted: managementProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation<SessionProps>(async ({ ctx, input }) => {
      try {
        const session = await ctx.db.sessions.update({
          where: { sessionId: input.sessionId },
          data: { isActive: false },
          select: {
            sessionId: true,
            sessionName: true,
            sessionFrom: true,
            sessionTo: true,
            isActive: true,
          },
        });

        return {
          sessionId: session.sessionId,
          sessionName: session.sessionName,
          sessionFrom: new Date(session.sessionFrom),
          sessionTo: new Date(session.sessionTo),
          isActive: Boolean(session.isActive),
        };
      } catch (error) {
        console.error("Error in setSessionCompleted:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark session as completed",
        });
      }
    }),

  // Validate all relational logics for all modules within a session
  validateSessionRelations: protectedProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const session = await ctx.db.sessions.findUnique({
          where: { sessionId: input.sessionId },
        });
        if (!session) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Session not found",
          });
        }

        const issues: Array<{
          module: string;
          severity: "error" | "warning";
          message: string;
          count?: number;
        }> = [];

        // 1. Validate Timetable & ClassSubject Relations
        const timetableEntries = await ctx.db.timetable.findMany({
          where: { sessionId: input.sessionId },
          include: { Grades: true, Subject: true, Employees: true },
        });

        for (const entry of timetableEntries) {
          if (!entry.Grades) {
            issues.push({
              module: "Timetable",
              severity: "error",
              message: `Timetable slot ${entry.timetableId} refers to non-existent class (${entry.classId}).`,
            });
          }
          if (!entry.Subject) {
            issues.push({
              module: "Timetable",
              severity: "error",
              message: `Timetable slot ${entry.timetableId} refers to non-existent subject (${entry.subjectId}).`,
            });
          }
          if (!entry.Employees) {
            issues.push({
              module: "Timetable",
              severity: "error",
              message: `Timetable slot ${entry.timetableId} refers to non-existent employee (${entry.employeeId}).`,
            });
          } else {
            if (entry.Employees.status !== "Active") {
              issues.push({
                module: "Timetable",
                severity: "warning",
                message: `Timetable slot (${entry.dayOfWeek} L${entry.lectureNumber}) assigned to inactive employee ${entry.Employees.employeeName} (${entry.Employees.status}).`,
              });
            }
            if (entry.Employees.designation === "WORKER") {
              issues.push({
                module: "Timetable",
                severity: "error",
                message: `Timetable slot assigned to WORKER (${entry.Employees.employeeName}).`,
              });
            }
          }
        }

        // 2. Validate ClassSubject Allotments
        const classSubjects = await ctx.db.classSubject.findMany({
          where: { sessionId: input.sessionId },
          include: { Grades: true, Subject: true, Employees: true },
        });

        for (const cs of classSubjects) {
          if (!cs.Employees) {
            issues.push({
              module: "ClassSubject",
              severity: "error",
              message: `ClassSubject ${cs.csId} has invalid employee reference.`,
            });
          } else if (cs.Employees.designation === "WORKER") {
            issues.push({
              module: "ClassSubject",
              severity: "error",
              message: `Subject allotment assigned to employee with WORKER designation: ${cs.Employees.employeeName}.`,
            });
          }
        }

        // 3. Validate StudentClass Enrollments
        const studentEnrollments = await ctx.db.studentClass.findMany({
          where: { sessionId: input.sessionId },
          include: { Students: true, Grades: true },
        });

        const orphanEnrollments = studentEnrollments.filter(
          (e) => !e.Students || !e.Grades,
        );
        if (orphanEnrollments.length > 0) {
          issues.push({
            module: "Enrollments",
            severity: "error",
            message: `Found ${orphanEnrollments.length} orphan enrollment records in session.`,
            count: orphanEnrollments.length,
          });
        }

        // 4. Validate Fee Assignments
        const feeAssignments = await ctx.db.feeStudentClass.findMany({
          where: { StudentClass: { sessionId: input.sessionId } },
          include: {
            fees: true,
            StudentClass: {
              include: {
                Students: true,
                Grades: true,
              },
            },
          },
        });

        const orphanFees = feeAssignments.filter(
          (f) => !f.StudentClass?.Students || !f.StudentClass?.Grades || !f.fees,
        );
        if (orphanFees.length > 0) {
          issues.push({
            module: "Fees",
            severity: "error",
            message: `Found ${orphanFees.length} fee records with broken relational links.`,
            count: orphanFees.length,
          });
        }

        // 5. Validate Exams
        const exams = await ctx.db.exam.findMany({
          where: { sessionId: input.sessionId },
          include: { ExamType: true, Grades: true, ExamDatesheet: true },
        });

        for (const exam of exams) {
          if (!exam.ExamType) {
            issues.push({
              module: "Exams",
              severity: "error",
              message: `Exam ${exam.examId} has invalid examType reference.`,
            });
          }
          if (!exam.Grades) {
            issues.push({
              module: "Exams",
              severity: "error",
              message: `Exam ${exam.examId} has invalid class reference.`,
            });
          }
        }

        return {
          sessionId: session.sessionId,
          sessionName: session.sessionName,
          isValid: issues.filter((i) => i.severity === "error").length === 0,
          summary: {
            timetableSlots: timetableEntries.length,
            classSubjectAllotments: classSubjects.length,
            studentEnrollments: studentEnrollments.length,
            feeAssignments: feeAssignments.length,
            examsCount: exams.length,
            totalErrors: issues.filter((i) => i.severity === "error").length,
            totalWarnings: issues.filter((i) => i.severity === "warning").length,
          },
          issues,
        };
      } catch (error) {
        console.error("Error validating session relations:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate session relations",
        });
      }
    }),
});

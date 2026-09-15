// File: user.ts
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { generatePdf } from "~/lib/pdf-reports";
import { generateUniqueUserCredentials } from "~/server/utils/credential-generator";
import type { Designation } from "@prisma/client";

import dayjs from "dayjs";
import { hash } from "bcryptjs";
const userSchema = z.object({
  username: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  accountType: z.enum([
    "STUDENT",
    "FACULTY",
    "ADMIN",
    "WORKER",
    "HEAD",
    "PRINCIPAL",
    "CLERK",
    "TEACHER",
    "NONE",
    "ALL",
  ]),
});

export const UserRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          accountId: true,
          username: true,
          email: true,
          accountType: true,
          createdAt: true,
        },
      });
      return users;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  getUserById: protectedProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findUnique({
        where: { id: ctx.session?.user.id ?? "" },
        select: {
          id: true,
          accountId: true,
          username: true,
          email: true,
          accountType: true,
          createdAt: true,
        },
      });
      return users;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  getUnAllocatedUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          accountId: true,
          username: true,
          email: true,
          accountType: true,
          createdAt: true,
        },
      });
      return users;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  createUser: adminProcedure
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const password = await hash(input.password, 10);
        return await ctx.db.$transaction(async (tx) => {
          const existing = await tx.user.findFirst({
            where: {
              OR: [
                { username: input.username },
                { email: input.email },
              ],
            },
          });
          if (existing) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "User with this username or email already exists.",
            });
          }

          const credentials = await generateUniqueUserCredentials(tx, input.accountType);
          const username = input.username?.trim() || credentials.username;
          const email = input.email?.trim() || credentials.email;

          return await tx.user.create({
            data: {
              accountId: credentials.accountId,
              username,
              email: email.toLowerCase(),
              password,
              accountType: input.accountType as Designation,
            },
            select: {
              id: true,
              accountId: true,
              username: true,
              email: true,
              accountType: true,
              createdAt: true,
            },
          });
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  deleteEmployeesByIds: adminProcedure
    .input(
      z.object({
        employeeIds: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const employeesToDelete = await ctx.db.employees.findMany({
          where: {
            employeeId: {
              in: input.employeeIds,
            },
          },
          select: {
            registrationNumber: true,
          },
        });
        const regNumbers = employeesToDelete.map((e) => e.registrationNumber);

        const classSubjectsToDelete = await ctx.db.classSubject.findMany({
          where: { employeeId: { in: input.employeeIds } },
          select: { csId: true },
        });
        const csIdsToDelete = classSubjectsToDelete.map((c) => c.csId);

        const bulkPromoBatches = await ctx.db.bulkPromotionBatch.findMany({
          where: { initiatedBy: { in: input.employeeIds } },
          select: { batchId: true },
        });
        const bulkPromoBatchIds = bulkPromoBatches.map((b) => b.batchId);

        const bulkSalaryBatches = await ctx.db.bulkSalaryCreationBatch.findMany({
          where: { initiatedBy: { in: input.employeeIds } },
          select: { batchId: true },
        });
        const bulkSalaryBatchIds = bulkSalaryBatches.map((b) => b.batchId);

        const leaveApps = await ctx.db.leaveApplication.findMany({
          where: { employeeId: { in: input.employeeIds } },
          select: { applicationId: true },
        });
        const leaveAppIds = leaveApps.map((l) => l.applicationId);

        const pos = await ctx.db.purchaseOrder.findMany({
          where: {
            OR: [
              { createdBy: { in: input.employeeIds } },
              { approvalL1By: { in: input.employeeIds } },
              { approvalL2By: { in: input.employeeIds } },
            ],
          },
          select: { poId: true },
        });
        const poIds = pos.map((p) => p.poId);

        const poLineItems = await ctx.db.purchaseOrderLineItem.findMany({
          where: { poId: { in: poIds } },
          select: { lineItemId: true },
        });
        const poLineItemIds = poLineItems.map((p) => p.lineItemId);

        const grns = await ctx.db.goodsReceiptNote.findMany({
          where: {
            OR: [
              { receivedBy: { in: input.employeeIds } },
              { poId: { in: poIds } },
            ],
          },
          select: { grnId: true },
        });
        const grnIds = grns.map((g) => g.grnId);

        const [
          bioMetricDel,
          marksDel,
          subjectDiaryDel,
          classSubjectDel,
          timetableDel,
          salaryDel,
          salaryAssignmentDel,
          salaryIncrementDel,
          employeeAttendanceDel,
          leaveBalanceDel,
          promotionHistoryDel,
          bulkPromoBatchItemDel,
          bulkPromoBatchDel,
          bulkSalaryCreationItemDel,
          bulkSalaryCreationBatchDel,
          leaveApprovalDel,
          leaveApplicationDel,
          grnLineItemDel,
          goodsReceiptNoteDel,
          purchaseOrderLineItemDel,
          purchaseOrderDel,
          directExpenseDel,
          budgetReallocationDel,
          stockReconciliationDel,
          assetTransferDel,
          pettyCashDisbursementDel,
          pettyCashReconciliationDel,
          financialLedgerEntryDel,
          approvalRecordDel,
          approvalDelegationDel,
          costCentreUpd,
          stockTransactionUpd,
          assetUpd,
          userDel,
          employeeDel
        ] = await ctx.db.$transaction([
          ctx.db.bioMetric.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.marks.deleteMany({
            where: {
              OR: [
                { uploadedBy: { in: input.employeeIds } },
                { classSubjectId: { in: csIdsToDelete } },
              ],
            },
          }),
          ctx.db.subjectDiary.deleteMany({
            where: {
              OR: [
                { teacherId: { in: input.employeeIds } },
                { classSubjectId: { in: csIdsToDelete } },
              ],
            },
          }),
          ctx.db.classSubject.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.timetable.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.salary.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.salaryAssignment.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.salaryIncrement.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.employeeAttendance.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.leaveBalance.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.promotionHistory.deleteMany({ where: { promotedBy: { in: input.employeeIds } } }),
          
          ctx.db.bulkPromotionBatchItem.deleteMany({ where: { batchId: { in: bulkPromoBatchIds } } }),
          ctx.db.bulkPromotionBatch.deleteMany({ where: { batchId: { in: bulkPromoBatchIds } } }),
          ctx.db.bulkSalaryCreationItem.deleteMany({
            where: {
              OR: [
                { batchId: { in: bulkSalaryBatchIds } },
                { employeeId: { in: input.employeeIds } }
              ]
            }
          }),
          ctx.db.bulkSalaryCreationBatch.deleteMany({ where: { batchId: { in: bulkSalaryBatchIds } } }),
          
          ctx.db.leaveApproval.deleteMany({
            where: {
              OR: [
                { applicationId: { in: leaveAppIds } },
                { approverId: { in: input.employeeIds } }
              ]
            }
          }),
          ctx.db.leaveApplication.deleteMany({ where: { applicationId: { in: leaveAppIds } } }),
          
          ctx.db.gRNLineItem.deleteMany({
            where: {
              OR: [
                { poLineItemId: { in: poLineItemIds } },
                { grnId: { in: grnIds } },
              ],
            },
          }),
          ctx.db.goodsReceiptNote.deleteMany({ where: { grnId: { in: grnIds } } }),
          ctx.db.purchaseOrderLineItem.deleteMany({ where: { poId: { in: poIds } } }),
          ctx.db.purchaseOrder.deleteMany({ where: { poId: { in: poIds } } }),
          ctx.db.directExpense.deleteMany({
            where: {
              OR: [
                { createdBy: { in: input.employeeIds } },
                { approvedBy: { in: input.employeeIds } },
              ],
            },
          }),
          ctx.db.budgetReallocation.deleteMany({ where: { authorisedBy: { in: input.employeeIds } } }),
          ctx.db.stockReconciliation.deleteMany({ where: { performedBy: { in: input.employeeIds } } }),
          ctx.db.assetTransfer.deleteMany({ where: { authorisedBy: { in: input.employeeIds } } }),
          ctx.db.pettyCashDisbursement.deleteMany({ where: { recordedBy: { in: input.employeeIds } } }),
          ctx.db.pettyCashReconciliation.deleteMany({ where: { performedBy: { in: input.employeeIds } } }),
          ctx.db.financialLedgerEntry.deleteMany({ where: { createdBy: { in: input.employeeIds } } }),
          ctx.db.approvalRecord.deleteMany({ where: { approverId: { in: input.employeeIds } } }),
          ctx.db.approvalDelegation.deleteMany({
            where: {
              OR: [
                { delegatorId: { in: input.employeeIds } },
                { delegateId: { in: input.employeeIds } },
              ],
            },
          }),
          
          ctx.db.costCentre.updateMany({
            where: { managerId: { in: input.employeeIds } },
            data: { managerId: null },
          }),
          ctx.db.stockTransaction.updateMany({
            where: { recipientId: { in: input.employeeIds } },
            data: { recipientId: null },
          }),
          ctx.db.asset.updateMany({
            where: { assignedToId: { in: input.employeeIds } },
            data: { assignedToId: null },
          }),
          
          ctx.db.user.deleteMany({ where: { accountId: { in: regNumbers } } }),
          ctx.db.employees.deleteMany({
            where: {
              employeeId: {
                in: input.employeeIds,
              },
            },
          }),
        ]);

        return {
          success: true,
          message: "Employees and all their related records successfully deleted/updated.",
          summary: {
            employeesDeleted: employeeDel.count,
            usersDeleted: userDel.count,
            biometricsDeleted: bioMetricDel.count,
            classSubjectsDeleted: classSubjectDel.count,
            timetablesDeleted: timetableDel.count,
            salariesDeleted: salaryDel.count,
            salaryAssignmentsDeleted: salaryAssignmentDel.count,
            salaryIncrementsDeleted: salaryIncrementDel.count,
            attendanceRecordsDeleted: employeeAttendanceDel.count,
            leaveBalancesDeleted: leaveBalanceDel.count,
            marksUploadedDeleted: marksDel.count,
            promotionHistoryDeleted: promotionHistoryDel.count,
            subjectDiariesDeleted: subjectDiaryDel.count,
            bulkPromotionItemsDeleted: bulkPromoBatchItemDel.count,
            bulkPromotionBatchesDeleted: bulkPromoBatchDel.count,
            bulkSalaryItemsDeleted: bulkSalaryCreationItemDel.count,
            bulkSalaryBatchesDeleted: bulkSalaryCreationBatchDel.count,
            leaveApprovalsDeleted: leaveApprovalDel.count,
            leaveApplicationsDeleted: leaveApplicationDel.count,
            goodsReceiptNotesDeleted: goodsReceiptNoteDel.count,
            purchaseOrdersDeleted: purchaseOrderDel.count,
            directExpensesDeleted: directExpenseDel.count,
            budgetReallocationsDeleted: budgetReallocationDel.count,
            stockReconciliationsDeleted: stockReconciliationDel.count,
            assetTransfersDeleted: assetTransferDel.count,
            pettyCashDisbursementsDeleted: pettyCashDisbursementDel.count,
            pettyCashReconciliationsDeleted: pettyCashReconciliationDel.count,
            ledgerEntriesDeleted: financialLedgerEntryDel.count,
            approvalRecordsDeleted: approvalRecordDel.count,
            approvalDelegationsDeleted: approvalDelegationDel.count,
            costCentresUpdated: costCentreUpd.count,
            stockTransactionsUpdated: stockTransactionUpd.count,
            assetsUpdated: assetUpd.count,
          },
          reasons: [
            "Cleaned up all database relations to prevent foreign key constraint violations.",
            "Nullified manager, recipient, and assignee associations where the employee was set to maintain transaction history."
          ]
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }
    }),

  getEmployeesByDesignation: protectedProcedure
    .input(
      z.object({
        designation: z.enum([
          "ADMIN",
          "PRINCIPAL",
          "HEAD",
          "CLERK",
          "TEACHER",
          "WORKER",
        ]),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.employees.findMany({
          where: {
            designation: input.designation,
          },
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }
    }),

  generateEmployeeReport: protectedProcedure.query(async ({ ctx }) => {
    const employees = await ctx.db.employees.findMany();
    const headers = [
      { key: "employeeId", label: "Employee ID" },
      { key: "employeeName", label: "Employee Name" },
      { key: "designation", label: "Designation" },
      { key: "registrationNumber", label: "Registration Number" },
    ];

    return {
      pdf: await generatePdf(employees, headers, "Employee Report"),
    };
  }),
});

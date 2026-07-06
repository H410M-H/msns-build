import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { generatePdf } from "~/lib/pdf-reports";
import { userReg } from "~/lib/utils";
import { hash } from "bcryptjs";

// Define schema locally
const employeeSchema = z.object({
  employeeName: z.string().min(2).max(100),
  fatherName: z.string().min(2).max(100),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
  dob: z.string(),
  cnic: z.string().min(13).max(15),
  maritalStatus: z.enum(["Married", "Unmarried", "Widow", "Divorced"]),
  doj: z.string(),
  designation: z.enum([
    "ADMIN",
    "PRINCIPAL",
    "HEAD",
    "CLERK",
    "TEACHER",
    "WORKER",
  ]),
  residentialAddress: z.string(),
  mobileNo: z.string().max(13),
  additionalContact: z.string().max(25).optional(),
  education: z.string().min(2).max(100),
  profilePic: z.string().optional(),
  cv: z.string().optional(),
  status: z.enum(["Active", "Retired", "Left"]).optional(),
});

type AccountTypeEnum =
  | "ADMIN"
  | "PRINCIPAL"
  | "HEAD"
  | "CLERK"
  | "TEACHER"
  | "WORKER";

export const EmployeeRouter = createTRPCRouter({
  // Get employee profile by User ID (via accountId matching registrationNumber)
  getProfileByUserId: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = ctx.session.user;
      if (!user.accountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User account ID not found",
        });
      }

      const employee = await ctx.db.employees.findUnique({
        where: { registrationNumber: user.accountId },
        include: {
          BioMetric: true,
          ClassSubject: {
            include: {
              Subject: true,
              Grades: true,
            },
          },
        },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee profile not found",
        });
      }

      return employee;
    } catch (error) {
      console.error(error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch employee profile",
      });
    }
  }),
  getEmployees: protectedProcedure.query(async ({ ctx }) => {
    try {
      const employees = await ctx.db.employees.findMany({
        // FIX: Changed from 'createdAt' (which doesn't exist) to 'employeeName'
        orderBy: { employeeName: "asc" },
        include: {
          BioMetric: {
            select: {
              fingerId: true,
            },
          },
        },
      });

      return employees.map((employee) => {
        if (employee.profilePic && employee.profilePic.startsWith("/uploads/")) {
          return { ...employee, profilePic: `/api${employee.profilePic}` };
        }
        return employee;
      });
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  getAllEmployeesForTimeTable: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.employees.findMany({
        select: {
          employeeId: true,
          employeeName: true,
          designation: true,
          education: true,
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

  getEmployeeById: protectedProcedure
    .input(z.object({ employeeId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.employees.findUnique({
        where: { employeeId: input.employeeId },
      });
      if (!employee) throw new TRPCError({ code: "NOT_FOUND" });
      if (employee.profilePic && employee.profilePic.startsWith("/uploads/")) {
        employee.profilePic = `/api${employee.profilePic}`;
      }
      return employee;
    }),

  // Get employee profile with linked User account details
  getEmployeeWithUser: protectedProcedure
    .input(z.object({ employeeId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.employees.findUnique({
        where: { employeeId: input.employeeId },
      });
      if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });

      // Find linked user via registrationNumber === accountId
      const user = await ctx.db.user.findFirst({
        where: { accountId: employee.registrationNumber },
        select: {
          id: true,
          username: true,
          email: true,
          accountType: true,
          accountId: true,
          createdAt: true,
          profilePic: true,
        },
      });

      if (employee.profilePic && employee.profilePic.startsWith("/uploads/")) {
        employee.profilePic = `/api${employee.profilePic}`;
      }

      if (user?.profilePic && user.profilePic.startsWith("/uploads/")) {
        user.profilePic = `/api${user.profilePic}`;
      }

      return { ...employee, user: user ?? null };
    }),

  getUnAllocateEmployees: protectedProcedure.query(async ({ ctx }) => {
    try {
      const employees = await ctx.db.employees.findMany({
        where: {
          isAssign: false,
        },
      });
      return employees;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  createEmployee: protectedProcedure
    .input(employeeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const usersCount = await ctx.db.user.count({
          where: { accountType: input.designation as AccountTypeEnum },
        });

        const userInfo = userReg(usersCount, input.designation);

        const newEmployee = await ctx.db.employees.create({
          data: {
            ...input,
            registrationNumber: userInfo.accountId,
            admissionNumber: userInfo.admissionNumber,
          },
        });

        const password = await hash(userInfo.admissionNumber, 10);
        await ctx.db.user.create({
          data: {
            accountId: userInfo.accountId,
            username: userInfo.username,
            email: userInfo.email.toLowerCase(),
            password,
            accountType: input.designation as AccountTypeEnum,
          },
        });
        return newEmployee;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create employee",
        });
      }
    }),

  updateEmployee: protectedProcedure
    .input(employeeSchema.extend({ employeeId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { employeeId, ...data } = input;

        return await ctx.db.employees.update({
          where: { employeeId },
          data: {
            ...data,
          },
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update employee",
        });
      }
    }),

  // Update both employee record and linked User account (username + email + designation)
  updateEmployeeAndUser: protectedProcedure
    .input(
      employeeSchema.extend({
        employeeId: z.string().cuid(),
        username: z.string().min(2).max(100).optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { employeeId, username, email, ...employeeData } = input;

        // Find the employee first to get their registrationNumber
        const existing = await ctx.db.employees.findUnique({
          where: { employeeId },
          select: { registrationNumber: true },
        });

        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
        }

        // Run both updates in a transaction
        const [updatedEmployee] = await ctx.db.$transaction([
          ctx.db.employees.update({
            where: { employeeId },
            data: employeeData,
          }),
          ...(username ?? email
            ? [
              ctx.db.user.updateMany({
                where: { accountId: existing.registrationNumber },
                data: {
                  ...(username ? { username } : {}),
                  ...(email ? { email: email.toLowerCase() } : {}),
                  // Sync accountType if designation changed
                  accountType: employeeData.designation as AccountTypeEnum,
                },
              }),
            ]
            : []),
        ]);

        return updatedEmployee;
      } catch (error) {
        console.error(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update employee and user account",
        });
      }
    }),

  deleteEmployeesByIds: protectedProcedure
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
          classSubjectDel,
          timetableDel,
          salaryDel,
          salaryAssignmentDel,
          salaryIncrementDel,
          employeeAttendanceDel,
          leaveBalanceDel,
          marksDel,
          promotionHistoryDel,
          subjectDiaryDel,
          bulkPromoBatchItemDel,
          bulkPromoBatchDel,
          bulkSalaryCreationItemDel,
          bulkSalaryCreationBatchDel,
          leaveApprovalDel,
          leaveApplicationDel,
          goodsReceiptNoteDel,
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
          ctx.db.classSubject.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.timetable.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.salary.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.salaryAssignment.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.salaryIncrement.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.employeeAttendance.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.leaveBalance.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.marks.deleteMany({ where: { uploadedBy: { in: input.employeeIds } } }),
          ctx.db.promotionHistory.deleteMany({ where: { promotedBy: { in: input.employeeIds } } }),
          ctx.db.subjectDiary.deleteMany({ where: { teacherId: { in: input.employeeIds } } }),
          
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
          
          ctx.db.goodsReceiptNote.deleteMany({ where: { grnId: { in: grnIds } } }),
          ctx.db.purchaseOrder.deleteMany({ where: { poId: { in: poIds } } }),
          
          ctx.db.directExpense.deleteMany({
            where: {
              OR: [
                { createdBy: { in: input.employeeIds } },
                { approvedBy: { in: input.employeeIds } }
              ]
            }
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
                { delegateId: { in: input.employeeIds } }
              ]
            }
          }),
          
          ctx.db.costCentre.updateMany({
            where: { managerId: { in: input.employeeIds } },
            data: { managerId: null }
          }),
          ctx.db.stockTransaction.updateMany({
            where: { recipientId: { in: input.employeeIds } },
            data: { recipientId: null }
          }),
          ctx.db.asset.updateMany({
            where: { assignedToId: { in: input.employeeIds } },
            data: { assignedToId: null }
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
          message: "Failed to delete employees.",
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
        const employees = await ctx.db.employees.findMany({
          where: {
            designation: input.designation,
          },
        });
        return employees;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }
    }),

  generateEmployeeReport: protectedProcedure.query(async ({ ctx }) => {
    try {
      const employees = await ctx.db.employees.findMany();
      // Map data to match report requirements
      const reportData = employees.map((emp) => ({
        ...emp,
        additionalContact: emp.additionalContact ?? "N/A",
        profilePic: emp.profilePic ?? "",
      }));

      const headers = [
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee Name" },
        { key: "designation", label: "Designation" },
        { key: "registrationNumber", label: "Registration Number" },
        { key: "mobileNo", label: "Mobile" },
      ];

      const pdfBuffer = await generatePdf(
        reportData,
        headers,
        "Employee Report",
      );

      return {
        pdf: Buffer.from(pdfBuffer).toString("base64"),
      };
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate report",
      });
    }
  }),

  getInactiveEmployees: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.employees.findMany({
        where: {
          status: {
            in: ["Retired", "Left"],
          },
        },
        orderBy: { employeeName: "asc" },
      });
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch inactive employees",
      });
    }
  }),
});

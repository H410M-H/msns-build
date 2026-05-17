-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('Draft', 'PendingApprovalL1', 'PendingApprovalL2', 'Approved', 'Ordered', 'Received', 'Invoiced', 'Paid', 'Cancelled');

-- CreateEnum
CREATE TYPE "StockTransactionType" AS ENUM ('StockIn', 'StockOut', 'Adjustment', 'ReconciliationVariance');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('New', 'Good', 'Fair', 'Poor', 'UnderMaintenance', 'Disposed');

-- CreateEnum
CREATE TYPE "DepreciationMethod" AS ENUM ('StraightLine', 'DecliningBalance');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('Preventive', 'Corrective', 'Emergency');

-- CreateEnum
CREATE TYPE "DisposalMethod" AS ENUM ('Sale', 'Scrap', 'Donation', 'Loss');

-- CreateEnum
CREATE TYPE "PettyCashTransactionType" AS ENUM ('Disbursement', 'Replenishment', 'ReconciliationAdjustment');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('Approved', 'Rejected', 'Delegated', 'PendingInfo');

-- CreateEnum
CREATE TYPE "PromotionEligibilityStatus" AS ENUM ('Eligible', 'Conditional', 'Ineligible');

-- CreateEnum
CREATE TYPE "BulkPromotionOutcome" AS ENUM ('Promoted', 'Withheld', 'Overridden');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('Draft', 'PendingApprovalL1', 'PendingApprovalL2', 'Approved', 'Rejected', 'Withdrawn', 'Cancelled');

-- CreateEnum
CREATE TYPE "LeaveTypeEnum" AS ENUM ('Annual', 'Sick', 'Casual', 'MaternityPaternity', 'Unpaid', 'Compensatory');

-- CreateEnum
CREATE TYPE "CostCentreStatus" AS ENUM ('Active', 'Inactive');

-- CreateTable
CREATE TABLE "CostCentre" (
    "costCentreId" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "managerId" TEXT,
    "status" "CostCentreStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostCentre_pkey" PRIMARY KEY ("costCentreId")
);

-- CreateTable
CREATE TABLE "BudgetPlan" (
    "budgetPlanId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetPlan_pkey" PRIMARY KEY ("budgetPlanId")
);

-- CreateTable
CREATE TABLE "BudgetAllocation" (
    "allocationId" TEXT NOT NULL,
    "budgetPlanId" TEXT NOT NULL,
    "costCentreId" TEXT NOT NULL,
    "expenseCategory" VARCHAR(50) NOT NULL,
    "allocatedAmount" DOUBLE PRECISION NOT NULL,
    "alert75Triggered" BOOLEAN NOT NULL DEFAULT false,
    "alert90Triggered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetAllocation_pkey" PRIMARY KEY ("allocationId")
);

-- CreateTable
CREATE TABLE "BudgetReallocation" (
    "reallocationId" TEXT NOT NULL,
    "budgetPlanId" TEXT NOT NULL,
    "fromCategory" TEXT NOT NULL,
    "toCategory" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "justification" TEXT NOT NULL,
    "authorisedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetReallocation_pkey" PRIMARY KEY ("reallocationId")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "poId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "supplierName" VARCHAR(200) NOT NULL,
    "supplierContact" TEXT,
    "costCentreId" TEXT NOT NULL,
    "expenseCategory" VARCHAR(50) NOT NULL,
    "requiredByDate" TIMESTAMP(3),
    "justification" TEXT NOT NULL,
    "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedTotal" DOUBLE PRECISION NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'Draft',
    "approvalL1By" TEXT,
    "approvalL1At" TIMESTAMP(3),
    "approvalL2By" TEXT,
    "approvalL2At" TIMESTAMP(3),
    "poDocumentUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("poId")
);

-- CreateTable
CREATE TABLE "PurchaseOrderLineItem" (
    "lineItemId" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "estimatedUnitPrice" DOUBLE PRECISION NOT NULL,
    "totalEstimatedCost" DOUBLE PRECISION NOT NULL,
    "inventoryItemId" TEXT,

    CONSTRAINT "PurchaseOrderLineItem_pkey" PRIMARY KEY ("lineItemId")
);

-- CreateTable
CREATE TABLE "GoodsReceiptNote" (
    "grnId" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "receivedBy" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoodsReceiptNote_pkey" PRIMARY KEY ("grnId")
);

-- CreateTable
CREATE TABLE "GRNLineItem" (
    "grnLineItemId" TEXT NOT NULL,
    "grnId" TEXT NOT NULL,
    "poLineItemId" TEXT NOT NULL,
    "quantityOrdered" DOUBLE PRECISION NOT NULL,
    "quantityReceived" DOUBLE PRECISION NOT NULL,
    "condition" VARCHAR(50) NOT NULL,
    "discrepancyNote" TEXT,

    CONSTRAINT "GRNLineItem_pkey" PRIMARY KEY ("grnLineItemId")
);

-- CreateTable
CREATE TABLE "DirectExpense" (
    "directExpenseId" TEXT NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "costCentreId" TEXT NOT NULL,
    "expenseCategory" VARCHAR(50) NOT NULL,
    "paymentChannel" VARCHAR(50) NOT NULL,
    "paymentReference" TEXT,
    "receiptUrl" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectExpense_pkey" PRIMARY KEY ("directExpenseId")
);

-- CreateTable
CREATE TABLE "RecurringExpenseTemplate" (
    "templateId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseCategory" VARCHAR(50) NOT NULL,
    "costCentreId" TEXT,
    "scheduleType" VARCHAR(20) NOT NULL,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringExpenseTemplate_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "inventoryItemId" TEXT NOT NULL,
    "itemName" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "quantityOnHand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplierRef" TEXT,
    "costPerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "storageLocation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("inventoryItemId")
);

-- CreateTable
CREATE TABLE "StockTransaction" (
    "transactionId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "transactionType" "StockTransactionType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" VARCHAR(200),
    "recipientId" TEXT,
    "purpose" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("transactionId")
);

-- CreateTable
CREATE TABLE "StockReconciliation" (
    "reconciliationId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "systemQuantity" DOUBLE PRECISION NOT NULL,
    "physicalCount" DOUBLE PRECISION NOT NULL,
    "variance" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockReconciliation_pkey" PRIMARY KEY ("reconciliationId")
);

-- CreateTable
CREATE TABLE "AssetCategory" (
    "assetCategoryId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("assetCategoryId")
);

-- CreateTable
CREATE TABLE "Asset" (
    "assetId" TEXT NOT NULL,
    "assetTag" VARCHAR(100) NOT NULL,
    "serialNumber" TEXT,
    "assetName" VARCHAR(200) NOT NULL,
    "assetCategoryId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "purchaseCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "condition" "AssetCondition" NOT NULL DEFAULT 'New',
    "location" TEXT,
    "assignedToId" TEXT,
    "warrantyExpiry" TIMESTAMP(3),
    "photoUrl" TEXT,
    "depreciationMethod" "DepreciationMethod" NOT NULL DEFAULT 'StraightLine',
    "usefulLifeYears" INTEGER NOT NULL DEFAULT 5,
    "isDisposed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("assetId")
);

-- CreateTable
CREATE TABLE "AssetDepreciation" (
    "depreciationId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "depreciationAmount" DOUBLE PRECISION NOT NULL,
    "netBookValue" DOUBLE PRECISION NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetDepreciation_pkey" PRIMARY KEY ("depreciationId")
);

-- CreateTable
CREATE TABLE "AssetMaintenance" (
    "maintenanceId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "maintenanceType" "MaintenanceType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "vendorName" TEXT,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outcome" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetMaintenance_pkey" PRIMARY KEY ("maintenanceId")
);

-- CreateTable
CREATE TABLE "AssetTransfer" (
    "transferId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT,
    "fromEmployeeId" TEXT,
    "toEmployeeId" TEXT,
    "transferDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorisedBy" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "AssetTransfer_pkey" PRIMARY KEY ("transferId")
);

-- CreateTable
CREATE TABLE "AssetDisposal" (
    "disposalId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "disposalDate" TIMESTAMP(3) NOT NULL,
    "disposalMethod" "DisposalMethod" NOT NULL,
    "proceedsReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "authorisationRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetDisposal_pkey" PRIMARY KEY ("disposalId")
);

-- CreateTable
CREATE TABLE "PettyCashRegister" (
    "registerId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL,
    "minimumBalance" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PettyCashRegister_pkey" PRIMARY KEY ("registerId")
);

-- CreateTable
CREATE TABLE "PettyCashDisbursement" (
    "disbursementId" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "payee" VARCHAR(200) NOT NULL,
    "purpose" VARCHAR(500) NOT NULL,
    "expenseCategory" VARCHAR(50) NOT NULL,
    "costCentreId" TEXT,
    "voucherRef" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PettyCashDisbursement_pkey" PRIMARY KEY ("disbursementId")
);

-- CreateTable
CREATE TABLE "PettyCashReconciliation" (
    "reconciliationId" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "systemBalance" DOUBLE PRECISION NOT NULL,
    "physicalCount" DOUBLE PRECISION NOT NULL,
    "variance" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PettyCashReconciliation_pkey" PRIMARY KEY ("reconciliationId")
);

-- CreateTable
CREATE TABLE "FinancialLedgerEntry" (
    "ledgerEntryId" TEXT NOT NULL,
    "entryType" VARCHAR(20) NOT NULL,
    "accountType" VARCHAR(50) NOT NULL,
    "accountCode" VARCHAR(50) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceType" VARCHAR(50) NOT NULL,
    "sourceId" TEXT,
    "counterEntryId" TEXT,
    "justification" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialLedgerEntry_pkey" PRIMARY KEY ("ledgerEntryId")
);

-- CreateTable
CREATE TABLE "ApprovalPolicy" (
    "policyId" TEXT NOT NULL,
    "transactionType" VARCHAR(50) NOT NULL,
    "approvalLevel" INTEGER NOT NULL,
    "authorityRole" VARCHAR(50) NOT NULL,
    "financialThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalPolicy_pkey" PRIMARY KEY ("policyId")
);

-- CreateTable
CREATE TABLE "ApprovalRecord" (
    "approvalRecordId" TEXT NOT NULL,
    "transactionType" VARCHAR(50) NOT NULL,
    "transactionId" TEXT NOT NULL,
    "approvalLevel" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "decision" "ApprovalDecision" NOT NULL,
    "comments" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalRecord_pkey" PRIMARY KEY ("approvalRecordId")
);

-- CreateTable
CREATE TABLE "ApprovalDelegation" (
    "delegationId" TEXT NOT NULL,
    "delegatorId" TEXT NOT NULL,
    "delegateId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "transactionTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalDelegation_pkey" PRIMARY KEY ("delegationId")
);

-- CreateTable
CREATE TABLE "PromotionEligibilityRule" (
    "ruleId" TEXT NOT NULL,
    "examTypeEnum" VARCHAR(50) NOT NULL,
    "triggersPromotion" BOOLEAN NOT NULL DEFAULT false,
    "minAggregatePercent" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "mustPassAllSubjects" BOOLEAN NOT NULL DEFAULT false,
    "minSubjectsToPass" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionEligibilityRule_pkey" PRIMARY KEY ("ruleId")
);

-- CreateTable
CREATE TABLE "PromotionEligibilityResult" (
    "resultId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "eligibilityStatus" "PromotionEligibilityStatus" NOT NULL,
    "aggregatePercent" DOUBLE PRECISION NOT NULL,
    "subjectBreakdown" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionEligibilityResult_pkey" PRIMARY KEY ("resultId")
);

-- CreateTable
CREATE TABLE "BulkPromotionBatch" (
    "batchId" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "fromClassId" TEXT NOT NULL,
    "toClassId" TEXT NOT NULL,
    "fromSessionId" TEXT NOT NULL,
    "toSessionId" TEXT NOT NULL,
    "totalProcessed" INTEGER NOT NULL DEFAULT 0,
    "totalPromoted" INTEGER NOT NULL DEFAULT 0,
    "totalWithheld" INTEGER NOT NULL DEFAULT 0,
    "totalOverrides" INTEGER NOT NULL DEFAULT 0,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkPromotionBatch_pkey" PRIMARY KEY ("batchId")
);

-- CreateTable
CREATE TABLE "BulkPromotionBatchItem" (
    "batchItemId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "eligibilityStatus" "PromotionEligibilityStatus" NOT NULL,
    "isOverridden" BOOLEAN NOT NULL DEFAULT false,
    "overrideJustification" TEXT,
    "outcome" "BulkPromotionOutcome" NOT NULL,

    CONSTRAINT "BulkPromotionBatchItem_pkey" PRIMARY KEY ("batchItemId")
);

-- CreateTable
CREATE TABLE "ExaminationMarkingSession" (
    "markingSessionId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExaminationMarkingSession_pkey" PRIMARY KEY ("markingSessionId")
);

-- CreateTable
CREATE TABLE "BulkSalaryCreationBatch" (
    "batchId" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "fromSessionId" TEXT,
    "toSessionId" TEXT NOT NULL,
    "globalIncrementType" VARCHAR(20),
    "globalIncrementValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalCreated" INTEGER NOT NULL DEFAULT 0,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkSalaryCreationBatch_pkey" PRIMARY KEY ("batchId")
);

-- CreateTable
CREATE TABLE "BulkSalaryCreationItem" (
    "batchItemId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "previousSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newSalary" DOUBLE PRECISION NOT NULL,
    "isOverridden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BulkSalaryCreationItem_pkey" PRIMARY KEY ("batchItemId")
);

-- CreateTable
CREATE TABLE "LeaveType" (
    "leaveTypeId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "typeEnum" "LeaveTypeEnum" NOT NULL,
    "annualDays" INTEGER NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("leaveTypeId")
);

-- CreateTable
CREATE TABLE "LeaveApplication" (
    "applicationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveApplication_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "LeaveApproval" (
    "leaveApprovalId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "approvalLevel" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "decision" "ApprovalDecision" NOT NULL,
    "comments" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveApproval_pkey" PRIMARY KEY ("leaveApprovalId")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "balanceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "entitlement" INTEGER NOT NULL DEFAULT 0,
    "daysTaken" INTEGER NOT NULL DEFAULT 0,
    "daysPending" INTEGER NOT NULL DEFAULT 0,
    "daysRemaining" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("balanceId")
);

-- CreateTable
CREATE TABLE "ParentGuardian" (
    "guardentId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "linkedStudentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notificationPrefs" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentGuardian_pkey" PRIMARY KEY ("guardentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CostCentre_code_key" ON "CostCentre"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsReceiptNote_poId_key" ON "GoodsReceiptNote"("poId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_name_key" ON "AssetCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "AssetDisposal_assetId_key" ON "AssetDisposal"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "PettyCashRegister_sessionId_key" ON "PettyCashRegister"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionEligibilityResult_studentId_examId_key" ON "PromotionEligibilityResult"("studentId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_name_key" ON "LeaveType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_leaveTypeId_sessionId_key" ON "LeaveBalance"("employeeId", "leaveTypeId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentGuardian_username_key" ON "ParentGuardian"("username");

-- AddForeignKey
ALTER TABLE "CostCentre" ADD CONSTRAINT "CostCentre_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employees"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetPlan" ADD CONSTRAINT "BudgetPlan_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_budgetPlanId_fkey" FOREIGN KEY ("budgetPlanId") REFERENCES "BudgetPlan"("budgetPlanId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_costCentreId_fkey" FOREIGN KEY ("costCentreId") REFERENCES "CostCentre"("costCentreId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetReallocation" ADD CONSTRAINT "BudgetReallocation_budgetPlanId_fkey" FOREIGN KEY ("budgetPlanId") REFERENCES "BudgetPlan"("budgetPlanId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetReallocation" ADD CONSTRAINT "BudgetReallocation_authorisedBy_fkey" FOREIGN KEY ("authorisedBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_costCentreId_fkey" FOREIGN KEY ("costCentreId") REFERENCES "CostCentre"("costCentreId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_approvalL1By_fkey" FOREIGN KEY ("approvalL1By") REFERENCES "Employees"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_approvalL2By_fkey" FOREIGN KEY ("approvalL2By") REFERENCES "Employees"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLineItem" ADD CONSTRAINT "PurchaseOrderLineItem_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"("poId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLineItem" ADD CONSTRAINT "PurchaseOrderLineItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("inventoryItemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptNote" ADD CONSTRAINT "GoodsReceiptNote_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"("poId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptNote" ADD CONSTRAINT "GoodsReceiptNote_receivedBy_fkey" FOREIGN KEY ("receivedBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GRNLineItem" ADD CONSTRAINT "GRNLineItem_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "GoodsReceiptNote"("grnId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GRNLineItem" ADD CONSTRAINT "GRNLineItem_poLineItemId_fkey" FOREIGN KEY ("poLineItemId") REFERENCES "PurchaseOrderLineItem"("lineItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectExpense" ADD CONSTRAINT "DirectExpense_costCentreId_fkey" FOREIGN KEY ("costCentreId") REFERENCES "CostCentre"("costCentreId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectExpense" ADD CONSTRAINT "DirectExpense_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectExpense" ADD CONSTRAINT "DirectExpense_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "Employees"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("inventoryItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Employees"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReconciliation" ADD CONSTRAINT "StockReconciliation_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("inventoryItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReconciliation" ADD CONSTRAINT "StockReconciliation_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assetCategoryId_fkey" FOREIGN KEY ("assetCategoryId") REFERENCES "AssetCategory"("assetCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Employees"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDepreciation" ADD CONSTRAINT "AssetDepreciation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("assetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("assetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTransfer" ADD CONSTRAINT "AssetTransfer_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("assetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTransfer" ADD CONSTRAINT "AssetTransfer_authorisedBy_fkey" FOREIGN KEY ("authorisedBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDisposal" ADD CONSTRAINT "AssetDisposal_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("assetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashRegister" ADD CONSTRAINT "PettyCashRegister_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashDisbursement" ADD CONSTRAINT "PettyCashDisbursement_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "PettyCashRegister"("registerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashDisbursement" ADD CONSTRAINT "PettyCashDisbursement_costCentreId_fkey" FOREIGN KEY ("costCentreId") REFERENCES "CostCentre"("costCentreId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashDisbursement" ADD CONSTRAINT "PettyCashDisbursement_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashReconciliation" ADD CONSTRAINT "PettyCashReconciliation_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "PettyCashRegister"("registerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashReconciliation" ADD CONSTRAINT "PettyCashReconciliation_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialLedgerEntry" ADD CONSTRAINT "FinancialLedgerEntry_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRecord" ADD CONSTRAINT "ApprovalRecord_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalDelegation" ADD CONSTRAINT "ApprovalDelegation_delegatorId_fkey" FOREIGN KEY ("delegatorId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalDelegation" ADD CONSTRAINT "ApprovalDelegation_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionEligibilityResult" ADD CONSTRAINT "PromotionEligibilityResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionEligibilityResult" ADD CONSTRAINT "PromotionEligibilityResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("examId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPromotionBatch" ADD CONSTRAINT "BulkPromotionBatch_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPromotionBatch" ADD CONSTRAINT "BulkPromotionBatch_fromClassId_fkey" FOREIGN KEY ("fromClassId") REFERENCES "Grades"("classId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPromotionBatch" ADD CONSTRAINT "BulkPromotionBatch_toClassId_fkey" FOREIGN KEY ("toClassId") REFERENCES "Grades"("classId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPromotionBatch" ADD CONSTRAINT "BulkPromotionBatch_fromSessionId_fkey" FOREIGN KEY ("fromSessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPromotionBatch" ADD CONSTRAINT "BulkPromotionBatch_toSessionId_fkey" FOREIGN KEY ("toSessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPromotionBatchItem" ADD CONSTRAINT "BulkPromotionBatchItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BulkPromotionBatch"("batchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPromotionBatchItem" ADD CONSTRAINT "BulkPromotionBatchItem_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExaminationMarkingSession" ADD CONSTRAINT "ExaminationMarkingSession_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("examId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkSalaryCreationBatch" ADD CONSTRAINT "BulkSalaryCreationBatch_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkSalaryCreationBatch" ADD CONSTRAINT "BulkSalaryCreationBatch_toSessionId_fkey" FOREIGN KEY ("toSessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkSalaryCreationItem" ADD CONSTRAINT "BulkSalaryCreationItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BulkSalaryCreationBatch"("batchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkSalaryCreationItem" ADD CONSTRAINT "BulkSalaryCreationItem_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("leaveTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApproval" ADD CONSTRAINT "LeaveApproval_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LeaveApplication"("applicationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApproval" ADD CONSTRAINT "LeaveApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("leaveTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

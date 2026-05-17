/**
 * ERP Expense Management System — Main Router
 * SRS v2.0 Section 3.27 | NFR-MNT-05
 *
 * Self-contained tRPC router for all ERP functionality.
 * Sub-routers: purchaseOrders, budget, stock, assets, pettyCash, ledger, directExpense
 */
import { createTRPCRouter } from "../../trpc";
import { purchaseOrdersRouter } from "./purchaseOrders";
import { budgetRouter } from "./budget";
import { stockRouter } from "./stock";
import { assetsRouter } from "./assets";
import { pettyCashRouter } from "./pettyCash";
import { ledgerRouter } from "./ledger";
import { directExpenseRouter } from "./directExpense";

export const erpRouter = createTRPCRouter({
  // FR-ERP-06 to FR-ERP-12: Purchase Order lifecycle
  purchaseOrders: purchaseOrdersRouter,

  // FR-ERP-01 to FR-ERP-05: Cost Centres & Budget Governance
  budget: budgetRouter,

  // FR-ERP-18 to FR-ERP-23: Stock & Inventory Management
  stock: stockRouter,

  // FR-ERP-24 to FR-ERP-29: Asset Lifecycle Management
  assets: assetsRouter,

  // FR-ERP-30 to FR-ERP-33: Petty Cash Management
  pettyCash: pettyCashRouter,

  // FR-ERP-34 to FR-ERP-39: Financial Ledger & P&L
  ledger: ledgerRouter,

  // FR-ERP-13 to FR-ERP-17: Direct Expense Recording
  directExpense: directExpenseRouter,
});

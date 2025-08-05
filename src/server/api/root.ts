import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { StudentRouter } from "./routers/student";
import { EmployeeRouter } from "./routers/employee";
import { ReportRouter } from "./routers/report";
import { SalaryRouter } from "./routers/salary";
import { SessionRouter } from "./routers/session";
import { SubjectRouter } from "./routers/subject";
import { ClassRouter } from "./routers/class";
import { feeRouter } from "./routers/fee";
import { AllotmentRouter } from "./routers/allotment";
import { UserRouter } from "./routers/user";
import { EventRouter } from "./routers/event";

export const appRouter = createTRPCRouter({
  user: UserRouter,
  allotment: AllotmentRouter,
  student: StudentRouter,
  employee: EmployeeRouter,
  report: ReportRouter,
  fee: feeRouter,
  salary: SalaryRouter,
  session: SessionRouter,
  event: EventRouter,
  subject: SubjectRouter,
  class: ClassRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = createCallerFactory(appRouter);

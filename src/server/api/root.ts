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
import { ProfileRouter } from "./routers/profile";
import { expensesRouter } from "./routers/expense";
import { fingerRouter } from "./routers/finger";
import { attendanceRouter } from "./routers/attendance";
import { timetableRouter } from "./routers/timetable";

export const appRouter = createTRPCRouter({
  user: UserRouter,
  profile: ProfileRouter,
  allotment: AllotmentRouter,
  student: StudentRouter,
  employee: EmployeeRouter,
  report: ReportRouter,
  fee: feeRouter,
  expense: expensesRouter,
  salary: SalaryRouter,
  session: SessionRouter,
  event: EventRouter,
  subject: SubjectRouter,
  class: ClassRouter,
  finger: fingerRouter,
  attendance: attendanceRouter,
  timetable: timetableRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);

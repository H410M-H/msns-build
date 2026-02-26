import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { StudentRouter } from "./routers/student";
import { EmployeeRouter } from "./routers/employee";
import { SessionRouter } from "./routers/session";
import { subjectRouter } from "./routers/subject";
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
import { reportRouter } from "./routers/report";
import { salaryRouter } from "./routers/salary";
import { examRouter } from "./routers/exam";
import { marksRouter } from "./routers/marks";
import { promotionRouter } from "./routers/promotion";
import { reportCardRouter } from "./routers/reportcard";
import { subjectDiaryRouter } from "./routers/subjectDiary";

export const appRouter = createTRPCRouter({
  user: UserRouter,
  profile: ProfileRouter,
  allotment: AllotmentRouter,
  student: StudentRouter,
  employee: EmployeeRouter,
  fee: feeRouter,
  expense: expensesRouter,
  salary: salaryRouter,
  report: reportRouter,
  session: SessionRouter,
  event: EventRouter,
  subject: subjectRouter,
  class: ClassRouter,
  finger: fingerRouter,
  attendance: attendanceRouter,
  timetable: timetableRouter,
  exam: examRouter,
  marks: marksRouter,
  reportCard: reportCardRouter,
  promotion: promotionRouter,
  subjectDiary: subjectDiaryRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL +
        (process.env.DATABASE_URL?.includes("?") ? "&" : "?") +
        "connect_timeout=60&pool_timeout=60",
    },
  },
});

const SESSION_ID = "cmlbxf0gz0000kw04wrflwvgw";

async function verify() {
  console.log("=== 1. VERIFY EXAMS IN SESSION 2026 - 2027 ===");
  const exams = await prisma.exam.findMany({
    where: { sessionId: SESSION_ID, examTypeEnum: "FIRST_TIME" },
    include: {
      Grades: true,
      ExamDatesheet: { include: { Subject: true } },
      _count: {
        select: {
          Marks: true,
          ReportCard: true,
        },
      },
    },
    orderBy: [{ Grades: { grade: "asc" } }, { Grades: { section: "asc" } }],
  });

  console.log(`Total First Term Exams Created: ${exams.length}`);
  console.table(
    exams.map((e) => ({
      examId: e.examId,
      class: `${e.Grades.grade} ${e.Grades.section}`,
      totalMarks: e.totalMarks,
      passingMarks: e.passingMarks,
      datesheetPapers: e.ExamDatesheet.length,
      marksCount: e._count.Marks,
      reportCardsCount: e._count.ReportCard,
      status: e.status,
    }))
  );

  console.log("\n=== 2. VERIFY REPORT CARDS SUMMARY ===");
  const reportCards = await prisma.reportCard.findMany({
    where: { sessionId: SESSION_ID },
    include: {
      Students: true,
      Grades: true,
      _count: {
        select: { ReportCardDetail: true },
      },
    },
    orderBy: [{ Grades: { grade: "asc" } }, { totalObtainedMarks: "desc" }],
  });

  console.log(`Total Report Cards in 2026 - 2027: ${reportCards.length}`);
  const passed = reportCards.filter((r) => r.status === "PASSED").length;
  const failed = reportCards.filter((r) => r.status === "FAILED").length;
  console.log(`Passed: ${passed}, Failed: ${failed}`);

  console.log("\n=== 3. VERIFY TOTAL MARKS RECORDS ===");
  const totalMarks = await prisma.marks.count({
    where: { Exam: { sessionId: SESSION_ID, examTypeEnum: "FIRST_TIME" } },
  });
  console.log(`Total Marks Records: ${totalMarks}`);

  console.log("\n=== 4. VERIFY TOTAL DATESHEET ENTRIES ===");
  const totalDatesheets = await prisma.examDatesheet.count({
    where: { Exam: { sessionId: SESSION_ID, examTypeEnum: "FIRST_TIME" } },
  });
  console.log(`Total Datesheet Entries: ${totalDatesheets}`);

  console.log("\n=== 5. SAMPLE REPORT CARDS WITH DETAILS ===");
  const sampleReports = await prisma.reportCard.findMany({
    where: { sessionId: SESSION_ID },
    take: 3,
    include: {
      Students: true,
      Grades: true,
      ReportCardDetail: {
        include: { Subject: true },
      },
    },
  });

  for (const sr of sampleReports) {
    console.log(`\nStudent: ${sr.Students.studentName} | Class: ${sr.Grades.grade} ${sr.Grades.section} | Total: ${sr.totalObtainedMarks}/${sr.totalMaxMarks} (${sr.percentage}%) | Status: ${sr.status}`);
    console.log("Subjects:");
    sr.ReportCardDetail.forEach((d) => {
      console.log(`  - ${d.Subject.subjectName}: ${d.obtainedMarks}/${d.totalMarks} (${d.percentage}%) [${d.remarks}]`);
    });
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

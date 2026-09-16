import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.sessions.findMany();
  console.log("=== SESSIONS ===");
  console.log(sessions);

  const activeSession = sessions.find(s => s.isActive) || sessions[0];
  console.log("Active Session:", activeSession);

  console.log("\n=== GRADES & ENROLLED STUDENTS IN SESSION ===");
  const grades = await prisma.grades.findMany({
    orderBy: [{ grade: "asc" }, { section: "asc" }],
    include: {
      StudentClass: {
        where: { sessionId: activeSession.sessionId },
        include: {
          Students: true
        }
      },
      ClassSubject: {
        where: { sessionId: activeSession.sessionId },
        include: {
          Subject: true,
          Employees: true
        }
      }
    }
  });

  for (const g of grades) {
    console.log(`\nGrade: ${g.grade} | Section: ${g.section} | Category: ${g.category} | ClassId: ${g.classId}`);
    console.log(`  Enrolled Students (${g.StudentClass.length}):`, g.StudentClass.map(sc => `${sc.Students.studentName} (${sc.Students.studentId})`));
    console.log(`  Class Subjects (${g.ClassSubject.length}):`, g.ClassSubject.map(cs => `${cs.Subject.subjectName} [csId: ${cs.csId}]`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.sessions.findMany({
    include: {
      _count: {
        select: {
          StudentClass: true,
          ClassSubject: true,
          Exam: true,
          ReportCard: true,
        }
      }
    }
  });
  console.log("=== ALL SESSIONS ===");
  console.log(sessions);

  // Let's check some student names from Merged_Results_Data.md:
  // e.g. "ALI AHMAD", "M.AHMAD SHAHID", "M.HUZAIFA FARID", "FAIZ-UL-RASOOL", "ADAN QAISAR", "M. AHMAD", "JAWAD AHMED", "M. AHMAD AKBAR", "DAMAN FATIMA", "ARHAM DASTGIR", "HAIDER ALI"
  const sampleNames = [
    "ALI AHMAD", "M.AHMAD SHAHID", "M.HUZAIFA FARID", "FAIZ-UL-RASOOL", "ADAN QAISAR", 
    "M. AHMAD", "JAWAD AHMED", "M. AHMAD AKBAR", "DAMAN FATIMA", "ARHAM DASTGIR", "HAIDER ALI"
  ];

  console.log("\n=== MATCHING STUDENTS ===");
  for (const name of sampleNames) {
    const matched = await prisma.students.findMany({
      where: {
        studentName: {
          contains: name.split(" ")[0],
          mode: "insensitive"
        }
      },
      include: {
        StudentClass: {
          include: { Grades: true, Sessions: true }
        }
      }
    });
    console.log(`Query "${name}" -> found ${matched.length} matches:`, matched.map(m => ({
      id: m.studentId,
      name: m.studentName,
      father: m.fatherName,
      classes: m.StudentClass.map(sc => `${sc.Grades.grade} ${sc.Grades.section} (${sc.Sessions.sessionName})`)
    })));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

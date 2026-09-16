import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=30&pool_timeout=30",
    },
  },
});

const namesToSearch = [
  "UZAIR", "REHEEM", "RAHEEM", "AYAN", "MAMOON", "ABDULROUF", "ROUF", "ZAINAB", "UMAIR", "SEHAR", "SHUJA"
];

async function searchStudents() {
  for (const n of namesToSearch) {
    const found = await prisma.students.findMany({
      where: {
        studentName: {
          contains: n,
          mode: "insensitive"
        }
      },
      include: {
        StudentClass: {
          include: { Grades: true, Sessions: true }
        }
      }
    });
    console.log(`\n--- Searching for "${n}" (found ${found.length}) ---`);
    found.forEach(s => {
      console.log(`  [ID: ${s.studentId}] ${s.studentName} | Father: ${s.fatherName} | Reg: ${s.registrationNumber} | Classes: ${s.StudentClass.map(sc => `${sc.Grades.grade} ${sc.Grades.section} (${sc.Sessions.sessionName})`).join(", ")}`);
    });
  }
}

searchStudents().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const grades = await prisma.grades.findMany({
    orderBy: [{ grade: "asc" }, { section: "asc" }],
  });
  console.log("=== ALL GRADES ===");
  console.table(grades.map(g => ({
    classId: g.classId,
    grade: g.grade,
    section: g.section,
    category: g.category
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());

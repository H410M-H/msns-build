import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=30&pool_timeout=30",
    },
  },
});

async function main() {
  const subjects = await prisma.subject.findMany({
    orderBy: { subjectName: "asc" },
  });
  console.log("Existing Subjects in DB:", subjects.map(s => ({ id: s.subjectId, name: s.subjectName })));
}

main().catch(console.error).finally(() => prisma.$disconnect());

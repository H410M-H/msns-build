import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.sessions.findMany();
  console.log("=== SESSIONS ===");
  console.log(JSON.stringify(sessions, null, 2));

  for (const s of sessions) {
    const scCount = await prisma.studentClass.count({ where: { sessionId: s.sessionId } });
    const examCount = await prisma.exam.count({ where: { sessionId: s.sessionId } });
    console.log(`Session: ${s.sessionName} (id: ${s.sessionId}, active: ${s.isActive}) -> StudentClass count: ${scCount}, Exam count: ${examCount}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.sessions.findMany();
  console.log("Sessions:");
  for (const s of sessions) {
    const studentClassCount = await prisma.studentClass.count({
      where: { sessionId: s.sessionId }
    });
    console.log(`- ${s.sessionName} (ID: ${s.sessionId}), Active: ${s.isActive}, StudentClass assignments: ${studentClassCount}`);
  }

  const studentCount = await prisma.students.count();
  console.log(`Total students in Students table: ${studentCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

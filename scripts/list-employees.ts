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
  const employees = await prisma.employees.findMany({
    select: {
      employeeId: true,
      employeeName: true,
      designation: true,
    },
    orderBy: { employeeName: "asc" },
  });
  console.log("All Employees:", employees);
}

main().catch(console.error).finally(() => prisma.$disconnect());

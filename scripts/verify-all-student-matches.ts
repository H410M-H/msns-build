import "dotenv/config";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=30&pool_timeout=30",
    },
  },
});

async function runWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      console.log(`Attempt ${i + 1} failed: ${err.message}. Retrying in ${delay}ms...`);
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Failed after retries");
}

async function checkAll() {
  const content = fs.readFileSync("scripts/Merged_Results_Data.md", "utf-8");
  const sections = content.split(/## File:\s*/g).filter(Boolean);

  const allDbStudents = await runWithRetry(() => prisma.students.findMany({
    include: {
      StudentClass: {
        include: { Grades: true, Sessions: true }
      }
    }
  }));

  console.log(`Total students fetched: ${allDbStudents.length}`);

  const unmatched: any[] = [];
  const matchedList: any[] = [];

  for (const sec of sections) {
    const lines = sec.split("\n").map(l => l.trim()).filter(Boolean);
    const fileName = lines[0];
    const classLine = lines.find(l => l.includes("CLASS:")) || "";
    
    const tableLines = lines.filter(l => l.startsWith("|"));
    let headerIdx = tableLines.findIndex(l => l.toUpperCase().includes("NAME") && l.toUpperCase().includes("STUDENT"));
    if (headerIdx === -1) continue;

    for (let i = headerIdx + 1; i < tableLines.length; i++) {
      const row = tableLines[i];
      if (row.includes("---") || row.includes(":---")) continue;
      const cols = row.split("|").map(c => c.trim()).filter(Boolean);
      if (cols.length < 3) continue;
      if (cols.some(c => c.toUpperCase().includes("GRAND TOTAL") || c.toUpperCase().includes("TOTAL") || c.toUpperCase().includes("SIGNATURE"))) continue;

      let name = cols[1];
      if (/^\d+$/.test(name) && cols.length > 2) {
        name = cols[2];
      }
      if (!isNaN(Number(name))) {
        const alpha = cols.find(c => /[a-zA-Z]/.test(c) && !c.match(/^\d+(st|nd|rd|th)$/i) && !c.match(/^[A-F][\+\-]?$/));
        if (alpha) name = alpha;
      }

      const norm = name.toUpperCase().replace(/[^A-Z]/g, "");

      let exact = allDbStudents.filter(s => s.studentName.toUpperCase().replace(/[^A-Z]/g, "") === norm);
      
      if (exact.length === 0) {
        exact = allDbStudents.filter(s => {
          const dbNorm = s.studentName.toUpperCase().replace(/[^A-Z]/g, "");
          return dbNorm.includes(norm) || norm.includes(dbNorm);
        });
      }

      if (exact.length === 0) {
        unmatched.push({ fileName, classLine, name, cols });
      } else {
        matchedList.push({ fileName, classLine, name, matchedCount: exact.length, candidates: exact.map(e => ({ id: e.studentId, name: e.studentName, father: e.fatherName, reg: e.registrationNumber, enrolled: e.StudentClass.map(sc => `${sc.Grades.grade} ${sc.Grades.section}`) })) });
      }
    }
  }

  console.log(`Matched: ${matchedList.length}, Unmatched: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log("Unmatched students:", JSON.stringify(unmatched, null, 2));
  }
}

checkAll().catch(console.error).finally(() => prisma.$disconnect());

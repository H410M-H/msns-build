import "dotenv/config";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeName(name: string) {
  return name.trim().toUpperCase().replace(/\s+/g, " ").replace(/\./g, ". ");
}

async function matchStudents() {
  const content = fs.readFileSync("scripts/Merged_Results_Data.md", "utf-8");
  const sections = content.split(/## File:\s*/g).filter(Boolean);

  const allDbStudents = await prisma.students.findMany({
    select: {
      studentId: true,
      registrationNumber: true,
      studentName: true,
      fatherName: true,
      StudentClass: {
        include: { Grades: true, Sessions: true }
      }
    }
  });

  console.log(`Total students in DB: ${allDbStudents.length}`);

  for (const sec of sections) {
    const lines = sec.split("\n").map(l => l.trim()).filter(Boolean);
    const fileName = lines[0];
    const classLine = lines.find(l => l.includes("CLASS:")) || "";
    console.log(`\n========================================`);
    console.log(`File: ${fileName} | ${classLine}`);

    const tableLines = lines.filter(l => l.startsWith("|"));
    let headerIdx = tableLines.findIndex(l => l.toUpperCase().includes("NAME") && l.toUpperCase().includes("STUDENT"));
    if (headerIdx === -1) continue;

    const headerCols = tableLines[headerIdx].split("|").map(c => c.trim()).filter(Boolean);
    console.log("Headers:", headerCols);

    for (let i = headerIdx + 1; i < tableLines.length; i++) {
      const row = tableLines[i];
      if (row.includes("---") || row.includes(":---")) continue;
      const cols = row.split("|").map(c => c.trim()).filter(Boolean);
      if (cols.length < 3) continue;
      if (cols.some(c => c.toUpperCase().includes("GRAND TOTAL") || c.toUpperCase().includes("TOTAL") || c.toUpperCase().includes("SIGNATURE"))) continue;

      let name = cols[1];
      // Check if name is actually in cols[2] due to leading empty column
      if (/^\d+$/.test(name) && cols.length > 2) {
        name = cols[2];
      } else if (!isNaN(Number(name)) && cols[0] === "" && cols.length > 2) {
        name = cols[2];
      }
      // If name is numeric (e.g. AIZA had no sr no, cols[0] was empty, cols[1] was AIZA or 97)
      if (!isNaN(Number(name)) && cols.length > 1) {
        // Find first alphabetical column
        const alphaCol = cols.find(c => /[a-zA-Z]/.test(c) && !c.includes("1st") && !c.includes("2nd") && !c.includes("3rd"));
        if (alphaCol) name = alphaCol;
      }

      // Match against DB
      const cleanName = name.trim().toLowerCase().replace(/[^a-z]/g, "");
      const matched = allDbStudents.filter(s => {
        const dbClean = s.studentName.toLowerCase().replace(/[^a-z]/g, "");
        return dbClean === cleanName || dbClean.includes(cleanName) || cleanName.includes(dbClean);
      });

      console.log(`Student in sheet: "${name}" -> Matched in DB (${matched.length}):`);
      matched.forEach(m => {
        console.log(`    [ID: ${m.studentId}] ${m.studentName} | Father: ${m.fatherName} | Reg: ${m.registrationNumber} | Enrolled: ${m.StudentClass.map(sc => `${sc.Grades.grade} ${sc.Grades.section} (${sc.Sessions.sessionName})`).join(", ")}`);
      });
      if (matched.length === 0) {
        console.log(`    *** NO DIRECT MATCH for "${name}" ***`);
      }
    }
  }
}

matchStudents().catch(console.error).finally(() => prisma.$disconnect());

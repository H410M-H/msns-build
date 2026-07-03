import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function cleanName(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function getBaseName(name: string): string {
  let clean = cleanName(name);
  if (clean.startsWith("MUHAMMAD")) {
    clean = "M" + clean.slice(8);
  }
  return clean;
}

// Simple Levenshtein distance
function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

function getSimilarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1.0;
  return 1.0 - getLevenshteinDistance(a, b) / maxLength;
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'prisma', 'fee-collections-2025.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  const activeSession = await prisma.sessions.findFirst({
    where: { isActive: true }
  });

  if (!activeSession) {
    console.error("No active session.");
    return;
  }

  const allStudents = await prisma.students.findMany();
  const allStudentClasses = await prisma.studentClass.findMany({
    where: { sessionId: activeSession.sessionId },
    include: { Grades: true }
  });

  // Collect all unique unmatched student names from the JSON
  const unmatchedJsonNames = new Map<string, string>(); // name -> class

  for (const monthData of data.months) {
    for (const student of monthData.students) {
      const studentName = student.name || '';
      const targetBases = [getBaseName(studentName)];
      
      const matches = allStudents.filter(s => {
        const sBase = getBaseName(s.studentName);
        return targetBases.includes(sBase);
      });

      let matched = matches.length > 0;
      if (matched) {
        let targetStudent = matches[0];
        let studentClass = allStudentClasses.find(sc => sc.studentId === targetStudent.studentId);
        if (matches.length > 1) {
          const classMatch = matches.find(m => {
            const sc = allStudentClasses.find(c => c.studentId === m.studentId);
            return sc && sc.Grades.grade.toUpperCase().includes(student.class.toUpperCase());
          });
          if (classMatch) {
            studentClass = allStudentClasses.find(sc => sc.studentId === classMatch.studentId);
          }
        }
        if (!studentClass) {
          matched = false;
        }
      }

      if (!matched) {
        unmatchedJsonNames.set(studentName, student.class);
      }
    }
  }

  console.log(`Found ${unmatchedJsonNames.size} unique unmatched names in the JSON.`);

  const mappingsProposed: any[] = [];

  for (const [jsonName, jsonClass] of unmatchedJsonNames.entries()) {
    // Find students in the DB with high similarity
    const candidates = allStudents.map(s => {
      const dbClass = allStudentClasses.find(sc => sc.studentId === s.studentId);
      const dbClassName = dbClass ? dbClass.Grades.grade : '';
      
      const sim = getSimilarity(cleanName(jsonName), cleanName(s.studentName));
      return {
        student: s,
        className: dbClassName,
        similarity: sim
      };
    });

    candidates.sort((a, b) => b.similarity - a.similarity);

    const best = candidates[0];
    if (best && best.similarity > 0.6) {
      mappingsProposed.push({
        jsonName,
        jsonClass,
        dbName: best.student.studentName,
        dbClass: best.className,
        similarity: best.similarity
      });
    }
  }

  console.log(`Proposed matches: ${mappingsProposed.length}`);
  console.log("Samples of proposed matches:");
  for (const match of mappingsProposed.slice(0, 50)) {
    console.log(`JSON: "${match.jsonName}" (${match.jsonClass}) -> DB: "${match.dbName}" (${match.dbClass}) [Sim: ${(match.similarity * 100).toFixed(0)}%]`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

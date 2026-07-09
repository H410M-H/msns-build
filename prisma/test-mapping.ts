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

function mapJsonClassToDbGrade(jsonClass: string): { grade: string; section: string } {
  const normClass = jsonClass.toUpperCase().trim();
  let grade = normClass;
  let section = "ROSE"; // default section

  if (normClass === "PLAYGROUP" || normClass === "PLAY GROUP") {
    grade = "PLAYGROUP";
  } else if (normClass === "NURSERY") {
    grade = "NURSERY";
  } else if (normClass === "PREP") {
    grade = "PREP";
  } else if (normClass === "ONE" || normClass === "CLASS ONE") {
    grade = "ONE";
  } else if (normClass === "TWO" || normClass === "CLASS TWO") {
    grade = "TWO";
  } else if (normClass === "THREE" || normClass === "CLASS THREE") {
    grade = "THREE";
  } else if (normClass === "FOUR" || normClass === "CLASS FOUR") {
    grade = "FOUR";
  } else if (normClass === "FIVE" || normClass === "CLASS FIVE") {
    grade = "FIVE";
  } else if (normClass === "SIX" || normClass === "CLASS SIX") {
    grade = "SIX";
  } else if (normClass === "SEVEN" || normClass === "CLASS SEVEN") {
    grade = "SEVEN";
  } else if (normClass === "NINE" || normClass === "9TH JUNIOR" || normClass === "9TH J" || normClass === "PRE 9") {
    grade = "PRE 9";
  } else if (normClass === "9TH SENIOR" || normClass === "9TH S" || normClass === "NINE S") {
    grade = "NINE";
  } else if (normClass === "TEN" || normClass === "10TH") {
    grade = "TEN";
  }

  return { grade, section };
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'prisma', 'fee-collections-2025.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  // Active session
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
  const allGrades = await prisma.grades.findMany();

  let matchedCount = 0;
  let unmatchedCount = 0;
  let enrolledCount = 0;

  console.log(`Starting simulation with ${allStudents.length} students in DB.`);

  for (const monthData of data.months) {
    for (const student of monthData.students) {
      const jsonName = student.name || '';
      const jsonClass = student.class || '';

      // Try exact base name match first
      const cleanJson = getBaseName(jsonName);
      let targetStudent = allStudents.find(s => getBaseName(s.studentName) === cleanJson);

      // If not found, try fuzzy match
      if (!targetStudent) {
        let bestSim = 0;
        let bestStudent = null;
        for (const s of allStudents) {
          const sim = getSimilarity(cleanName(jsonName), cleanName(s.studentName));
          if (sim > bestSim) {
            bestSim = sim;
            bestStudent = s;
          }
        }
        if (bestStudent && bestSim > 0.75) {
          targetStudent = bestStudent;
        }
      }

      if (targetStudent) {
        // Find StudentClass assignment
        let studentClass = allStudentClasses.find(sc => sc.studentId === targetStudent!.studentId);
        if (!studentClass) {
          // If they aren't assigned, find the grade to assign them to
          const mapped = mapJsonClassToDbGrade(jsonClass);
          const gradeRecord = allGrades.find(g => 
            g.grade.toUpperCase() === mapped.grade && 
            g.section.toUpperCase() === mapped.section
          );
          if (gradeRecord) {
            enrolledCount++;
            matchedCount++;
          } else {
            // Grade not found
            unmatchedCount++;
          }
        } else {
          matchedCount++;
        }
      } else {
        unmatchedCount++;
      }
    }
  }

  console.log(`Simulation complete:`);
  console.log(`- Matched: ${matchedCount}`);
  console.log(`- Unmatched: ${unmatchedCount}`);
  console.log(`- Will be auto-enrolled: ${enrolledCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

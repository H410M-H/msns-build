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

  const allStudents = await prisma.students.findMany();

  const unmatchedUnique = new Set<string>();

  for (const monthData of data.months) {
    for (const student of monthData.students) {
      const jsonName = student.name || '';
      
      const cleanJson = getBaseName(jsonName);
      let targetStudent = allStudents.find(s => getBaseName(s.studentName) === cleanJson);

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

      if (!targetStudent) {
        unmatchedUnique.add(`${jsonName} (${student.class})`);
      }
    }
  }

  console.log(`Unmatched unique names (${unmatchedUnique.size}):`);
  const arr = Array.from(unmatchedUnique);
  for (const item of arr.slice(0, 100)) {
    console.log(`- ${item}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

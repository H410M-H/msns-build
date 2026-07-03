import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function getMonthNumber(monthName: string): number {
  const months: Record<string, number> = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
  };
  return months[monthName.toLowerCase().trim()] || 1;
}

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
  console.log('--- Seeding Fee Collections for 2025 (Fuzzy Matching + Auto-enroll) ---');

  const filePath = path.join(process.cwd(), 'prisma', 'fee-collections-2025.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('fee-collections-2025.json not found');
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);

  // Get target session (2025-26)
  const targetSession = await prisma.sessions.findFirst({
    where: { sessionName: '2025-26' }
  });

  if (!targetSession) {
    throw new Error("Session 2025-26 not found.");
  }
  console.log(`Using session: ${targetSession.sessionName} (${targetSession.sessionId})`);

  // Load all students, grades and their class assignments for this session
  const allStudents = await prisma.students.findMany();
  const allStudentClasses = await prisma.studentClass.findMany({
    where: { sessionId: targetSession.sessionId },
    include: { Grades: true }
  });
  const allGrades = await prisma.grades.findMany();

  // Get the default fee structure for mapping
  const allFees = await prisma.fees.findMany();
  let defaultFee = allFees[0];
  if (!defaultFee) {
    console.log("No fee structure found, creating a default one...");
    defaultFee = await prisma.fees.create({
      data: {
        level: "DEFAULT",
        tuitionFee: 2000,
        examFund: 500,
        computerLabFund: 0,
        type: "MonthlyFee"
      }
    });
  }

  let successCount = 0;
  let notFoundCount = 0;
  let autoEnrolledCount = 0;

  // Cache to store matched students to speed up lookups across months
  const matchedCache = new Map<string, any>(); // jsonName -> dbStudent
  const scCache = new Map<string, any>(); // studentId -> studentClass

  for (const monthData of data.months) {
    const month = getMonthNumber(monthData.month);
    const year = monthData.year || 2025;
    
    console.log(`Processing ${monthData.month} ${year}... (${monthData.students.length} student records)`);

    for (const record of monthData.students) {
      const jsonName = record.name || '';
      const jsonClass = record.class || '';

      // Check cache first
      let targetStudent;
      if (matchedCache.has(jsonName)) {
        targetStudent = matchedCache.get(jsonName);
      } else {
        // Find exact or fuzzy match in DB
        const cleanJson = getBaseName(jsonName);
        targetStudent = allStudents.find(s => getBaseName(s.studentName) === cleanJson);

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

        matchedCache.set(jsonName, targetStudent || null);
      }

      if (!targetStudent) {
        console.warn(`[!] Student not found in DB: ${jsonName} (Class: ${jsonClass})`);
        notFoundCount++;
        continue;
      }

      // Find if they are assigned to a class in the target session
      let studentClass = scCache.get(targetStudent.studentId) || allStudentClasses.find(sc => sc.studentId === targetStudent.studentId);

      if (!studentClass) {
        // Auto-enroll student into the grade specified in the JSON
        const mapped = mapJsonClassToDbGrade(jsonClass);
        const gradeRecord = allGrades.find(g => 
          g.grade.toUpperCase() === mapped.grade && 
          g.section.toUpperCase() === mapped.section
        );

        if (gradeRecord) {
          try {
            studentClass = await prisma.studentClass.create({
              data: {
                studentId: targetStudent.studentId,
                classId: gradeRecord.classId,
                sessionId: targetSession.sessionId
              },
              include: { Grades: true }
            });
            
            // Add to list and cache
            allStudentClasses.push(studentClass);
            scCache.set(targetStudent.studentId, studentClass);
            autoEnrolledCount++;
          } catch (err) {
            console.error(`Error auto-enrolling student ${targetStudent.studentName} into class ${mapped.grade}:`, err);
            notFoundCount++;
            continue;
          }
        } else {
          console.warn(`[!] Grade record not found in DB: ${mapped.grade} ${mapped.section} for student ${targetStudent.studentName}`);
          notFoundCount++;
          continue;
        }
      } else {
        scCache.set(targetStudent.studentId, studentClass);
      }

      const paidAtDate = record.date ? new Date(record.date) : new Date();

      try {
        // Upsert the FeeStudentClass record
        await prisma.feeStudentClass.upsert({
          where: {
            studentClassId_feeId_month_year: {
              studentClassId: studentClass.scId,
              feeId: defaultFee.feeId,
              month: month,
              year: year
            }
          },
          update: {
            tuitionPaid: true,
            paidAt: paidAtDate,
            discountDescription: record.comments || '',
          },
          create: {
            studentClassId: studentClass.scId,
            feeId: defaultFee.feeId,
            month: month,
            year: year,
            tuitionPaid: true,
            paidAt: paidAtDate,
            discountDescription: record.comments || '',
            discount: 0,
            discountByPercent: 0
          }
        });
        successCount++;
      } catch (err) {
        console.error(`Error saving fee for ${targetStudent.studentName}:`, err);
      }
    }
  }

  console.log('--- Seeding Complete ---');
  console.log(`Successfully recorded fees for: ${successCount} student-months`);
  console.log(`Failed to match/record: ${notFoundCount} records`);
  console.log(`Total students auto-enrolled into classes: ${autoEnrolledCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

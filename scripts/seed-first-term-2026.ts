import "dotenv/config";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL +
        (process.env.DATABASE_URL?.includes("?") ? "&" : "?") +
        "connect_timeout=60&pool_timeout=60",
    },
  },
});

async function runWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      console.log(`[DB Retry] Attempt ${i + 1} failed: ${err.message}. Retrying in ${delay}ms...`);
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Failed after retries");
}

// Teacher Incharge map
const TEACHER_MAP: Record<string, string> = {
  AYESHA_JAMIL: "cmg2xm34h0000jm041luehhh1",
  MALAIKA_SHAHID: "cmfwaw3xa0004la04uwfcqd0c",
  LARAIB_SULTAN: "cmjohtppv0000jo04zzqra22w",
  ZAINAB_JAMSHAID: "cmnjxa2v10000jp044df92dpi",
  MEHRAB_TABASSUM: "cmfp0t4250006fzccfqv1sewk",
  AMINAH_NOOR: "cmh539p9e0000la04h2jy60e8",
  DEFAULT_ADMIN: "cmf2764310000lb04fyci1oy2",
};

// Target Session ID for 2026 - 2027
const SESSION_ID = "cmlbxf0gz0000kw04wrflwvgw";

// Datesheet definitions
// Start time: 08:30 AM, End time: 12:00 PM
const DATESHEET_SCHEDULES: Record<
  string,
  Array<{ subjectName: string; date: string; maxMarks: number; startTime?: string; endTime?: string }>
> = {
  PLAYGROUP_ROSE: [
    { subjectName: "English Written", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English Reading", date: "2026-05-13T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Urdu Reading", date: "2026-05-14T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Urdu Written", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "World Around Me", date: "2026-05-18T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Drawing", date: "2026-05-19T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Spoken English", date: "2026-05-20T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Mathematics Oral", date: "2026-05-21T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Mathematics Written", date: "2026-05-23T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Islamiyat Oral", date: "2026-05-25T08:30:00.000Z", maxMarks: 100 },
  ],
  NURSERY_ROSE: [
    { subjectName: "Urdu Written", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu Reading", date: "2026-05-13T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "English Reading", date: "2026-05-14T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "English Written", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "World Around Me", date: "2026-05-18T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Spoken English", date: "2026-05-19T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Drawing", date: "2026-05-20T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Mathematics Oral", date: "2026-05-21T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Mathematics Written", date: "2026-05-23T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Islamiyat Oral", date: "2026-05-25T08:30:00.000Z", maxMarks: 100 },
  ],
  PREP_ROSE: [
    { subjectName: "English Written", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English Reading", date: "2026-05-13T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Urdu Reading", date: "2026-05-14T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Urdu Written", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Drawing", date: "2026-05-18T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Islamiyat Oral", date: "2026-05-19T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "World Around Me", date: "2026-05-20T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Spoken English", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Mathematics Written", date: "2026-05-23T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Mathematics Oral", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
  ONE_ROSE: [
    { subjectName: "English A", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu A", date: "2026-05-13T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Islamiyat", date: "2026-05-14T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English B", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Mathematics", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Spoken English", date: "2026-05-19T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Primary History", date: "2026-05-20T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Urdu B", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Meri Duniya", date: "2026-05-23T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Drawing", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Computer", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
  TWO_ROSE: [
    { subjectName: "English A", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu A", date: "2026-05-13T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Islamiyat", date: "2026-05-14T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English B", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu B", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Primary History", date: "2026-05-19T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Computer", date: "2026-05-20T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Mathematics", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Meri Duniya", date: "2026-05-23T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Spoken English", date: "2026-05-25T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Drawing", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
  THREE_ROSE: [
    { subjectName: "English A", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu A", date: "2026-05-13T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Islamiyat", date: "2026-05-14T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English B", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Mathematics", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Computer", date: "2026-05-19T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Primary History", date: "2026-05-20T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Meri Duniya", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu B", date: "2026-05-23T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Drawing", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
  FOUR_ROSE: [
    { subjectName: "English A", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Islamiyat", date: "2026-05-13T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Computer", date: "2026-05-14T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Mathematics", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu A", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Social Studies", date: "2026-05-20T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu B", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Science", date: "2026-05-23T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English B", date: "2026-05-25T08:30:00.000Z", maxMarks: 100 },
  ],
  FIVE_ROSE: [
    { subjectName: "English A", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu B", date: "2026-05-13T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Computer", date: "2026-05-14T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Mathematics", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English B", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Science", date: "2026-05-20T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu A", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Islamiyat", date: "2026-05-23T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Social Studies", date: "2026-05-25T08:30:00.000Z", maxMarks: 100 },
  ],
  SIX_ROSE: [
    { subjectName: "Science", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu A", date: "2026-05-13T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu B", date: "2026-05-14T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English A", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Mathematics", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-19T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Computer", date: "2026-05-20T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English B", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "History", date: "2026-05-22T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Geography", date: "2026-05-23T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Islamiyat", date: "2026-05-25T08:30:00.000Z", maxMarks: 100 },
  ],
  SIX_TULIP: [
    { subjectName: "Science", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu A", date: "2026-05-13T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu B", date: "2026-05-14T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English A", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Mathematics", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-19T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Computer", date: "2026-05-20T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English B", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "History", date: "2026-05-22T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Geography", date: "2026-05-23T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Islamiyat", date: "2026-05-25T08:30:00.000Z", maxMarks: 100 },
  ],
  SEVEN_ROSE: [
    { subjectName: "Mathematics", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu A", date: "2026-05-13T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Science", date: "2026-05-14T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu B", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English A", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-19T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Islamiyat", date: "2026-05-20T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Computer", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "History", date: "2026-05-22T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Geography", date: "2026-05-23T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "English B", date: "2026-05-25T08:30:00.000Z", maxMarks: 100 },
  ],
  SEVEN_TULIP: [
    { subjectName: "Mathematics", date: "2026-05-12T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu A", date: "2026-05-13T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Science", date: "2026-05-14T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Urdu B", date: "2026-05-16T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "English A", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-19T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Islamiyat", date: "2026-05-20T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Computer", date: "2026-05-21T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "History", date: "2026-05-22T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "Geography", date: "2026-05-23T08:30:00.000Z", maxMarks: 50 },
    { subjectName: "English B", date: "2026-05-25T08:30:00.000Z", maxMarks: 100 },
  ],
  PRE_9_ROSE: [
    { subjectName: "Mathematics", date: "2026-05-12T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Biology/Computer", date: "2026-05-14T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "English", date: "2026-05-16T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Islamiyat", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Chemistry", date: "2026-05-20T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Urdu", date: "2026-05-21T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Physics", date: "2026-05-23T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
  PRE_9_TULIP: [
    { subjectName: "Mathematics", date: "2026-05-12T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Biology/Computer", date: "2026-05-14T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "English", date: "2026-05-16T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Islamiyat", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Chemistry", date: "2026-05-20T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Urdu", date: "2026-05-21T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Physics", date: "2026-05-23T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
  NINE_ROSE: [
    { subjectName: "Mathematics", date: "2026-05-12T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Biology/Computer", date: "2026-05-14T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "English", date: "2026-05-16T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Islamiyat", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Chemistry", date: "2026-05-20T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Urdu", date: "2026-05-21T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Physics", date: "2026-05-23T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
  NINE_TULIP: [
    { subjectName: "Mathematics", date: "2026-05-12T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Biology/Computer", date: "2026-05-14T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "English", date: "2026-05-16T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Islamiyat", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Chemistry", date: "2026-05-20T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Urdu", date: "2026-05-21T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Physics", date: "2026-05-23T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
  TEN_ROSE: [
    { subjectName: "Mathematics", date: "2026-05-12T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Biology/Computer", date: "2026-05-14T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "English", date: "2026-05-16T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Islamiyat", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Chemistry", date: "2026-05-20T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Urdu", date: "2026-05-21T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Physics", date: "2026-05-23T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
  TEN_TULIP: [
    { subjectName: "Mathematics", date: "2026-05-12T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Biology/Computer", date: "2026-05-14T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "English", date: "2026-05-16T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Islamiyat", date: "2026-05-18T08:30:00.000Z", maxMarks: 100 },
    { subjectName: "Chemistry", date: "2026-05-20T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Urdu", date: "2026-05-21T08:30:00.000Z", maxMarks: 75 },
    { subjectName: "Physics", date: "2026-05-23T08:30:00.000Z", maxMarks: 60 },
    { subjectName: "Tarjama-tul-Quran", date: "2026-05-25T08:30:00.000Z", maxMarks: 50 },
  ],
};

async function main() {
  console.log("=== STEP 1: VERIFY/CREATE SUBJECTS ===");
  const requiredSubjects = [
    "English", "English A", "English B", "Urdu", "Urdu A", "Urdu B",
    "Math", "Mathematics", "Science", "Social Studies", "Computer",
    "Islamiyat", "Tarjama-tul-Quran", "History", "Geography",
    "Primary History", "Meri Duniya", "Drawing", "Spoken English",
    "World Around Me", "English Reading", "English Written",
    "Urdu Reading", "Urdu Written", "Mathematics Oral", "Mathematics Written",
    "Islamiyat Oral", "Physics", "Chemistry", "Biology/Computer",
    "Summer Vacation Task"
  ];

  const subjectMap = new Map<string, string>();
  for (const name of requiredSubjects) {
    let sub = await runWithRetry(() =>
      prisma.subject.findFirst({
        where: { subjectName: { equals: name, mode: "insensitive" } },
      })
    );
    if (!sub) {
      sub = await runWithRetry(() =>
        prisma.subject.create({
          data: { subjectName: name },
        })
      );
      console.log(`Created new subject: "${name}" [${sub.subjectId}]`);
    }
    subjectMap.set(name.toLowerCase(), sub.subjectId);
  }

  console.log(`Total subjects mapped: ${subjectMap.size}`);

  console.log("\n=== STEP 2: VERIFY/CREATE EXAM TYPE ===");
  let examType = await runWithRetry(() =>
    prisma.examType.findFirst({
      where: { name: "FIRST_TIME" },
    })
  );
  if (!examType) {
    examType = await runWithRetry(() =>
      prisma.examType.create({
        data: {
          name: "FIRST_TIME",
          description: "First Term Examination 2026",
          category: "STANDARD",
        },
      })
    );
    console.log(`Created ExamType FIRST_TIME [${examType.examTypeId}]`);
  } else {
    console.log(`Found ExamType FIRST_TIME [${examType.examTypeId}]`);
  }

  console.log("\n=== STEP 3: ENSURE 18 CLASSES & CLASS_SUBJECT MAPPINGS & EXAMS ===");
  const allGrades = await runWithRetry(() => prisma.grades.findMany());
  const gradeKeyMap = new Map<string, string>();
  for (const g of allGrades) {
    const key = `${g.grade.toUpperCase().replace(/\s+/g, "_")}_${g.section.toUpperCase()}`;
    gradeKeyMap.set(key, g.classId);
  }

  // Define default teacher per class
  const classTeacherMap: Record<string, string> = {
    PLAYGROUP_ROSE: TEACHER_MAP.DEFAULT_ADMIN,
    NURSERY_ROSE: TEACHER_MAP.DEFAULT_ADMIN,
    PREP_ROSE: TEACHER_MAP.DEFAULT_ADMIN,
    ONE_ROSE: TEACHER_MAP.ZAINAB_JAMSHAID,
    TWO_ROSE: TEACHER_MAP.MEHRAB_TABASSUM,
    THREE_ROSE: TEACHER_MAP.MALAIKA_SHAHID,
    FOUR_ROSE: TEACHER_MAP.DEFAULT_ADMIN,
    FIVE_ROSE: TEACHER_MAP.MEHRAB_TABASSUM,
    SIX_ROSE: TEACHER_MAP.AYESHA_JAMIL,
    SIX_TULIP: TEACHER_MAP.AYESHA_JAMIL,
    SEVEN_ROSE: TEACHER_MAP.AYESHA_JAMIL,
    SEVEN_TULIP: TEACHER_MAP.AYESHA_JAMIL,
    PRE_9_ROSE: TEACHER_MAP.LARAIB_SULTAN,
    PRE_9_TULIP: TEACHER_MAP.LARAIB_SULTAN,
    NINE_ROSE: TEACHER_MAP.AMINAH_NOOR,
    NINE_TULIP: TEACHER_MAP.AMINAH_NOOR,
    TEN_ROSE: TEACHER_MAP.AMINAH_NOOR,
    TEN_TULIP: TEACHER_MAP.AMINAH_NOOR,
  };

  const examMap = new Map<string, string>(); // classKey -> examId
  const classSubjectLookup = new Map<string, string>(); // `${classId}_${subjectId}` -> csId

  for (const [classKey, schedule] of Object.entries(DATESHEET_SCHEDULES)) {
    const classId = gradeKeyMap.get(classKey);
    if (!classId) {
      console.error(`Class not found for key: ${classKey}`);
      continue;
    }

    const teacherId = classTeacherMap[classKey] || TEACHER_MAP.DEFAULT_ADMIN;

    // 1. Ensure ClassSubject records for session
    for (const item of schedule) {
      const subjectId = subjectMap.get(item.subjectName.toLowerCase());
      if (!subjectId) {
        console.error(`Subject ID not found for ${item.subjectName}`);
        continue;
      }

      let cs = await runWithRetry(() =>
        prisma.classSubject.findFirst({
          where: {
            classId,
            subjectId,
            sessionId: SESSION_ID,
          },
        })
      );

      if (!cs) {
        cs = await runWithRetry(() =>
          prisma.classSubject.create({
            data: {
              classId,
              subjectId,
              employeeId: teacherId,
              sessionId: SESSION_ID,
            },
          })
        );
        console.log(`Created ClassSubject for ${classKey} - ${item.subjectName} [${cs.csId}]`);
      }
      classSubjectLookup.set(`${classId}_${subjectId}`, cs.csId);
    }

    // 2. Ensure Exam record for this class
    let exam = await runWithRetry(() =>
      prisma.exam.findFirst({
        where: {
          sessionId: SESSION_ID,
          classId,
          examTypeEnum: "FIRST_TIME",
        },
      })
    );

    // Calculate total max marks for this class from schedule
    const totalMaxMarks = schedule.reduce((sum, s) => sum + s.maxMarks, 0);
    const passingMarks = Math.round(totalMaxMarks * 0.4);

    if (!exam) {
      exam = await runWithRetry(() =>
        prisma.exam.create({
          data: {
            examTypeId: examType.examTypeId,
            sessionId: SESSION_ID,
            classId,
            examTypeEnum: "FIRST_TIME",
            startDate: new Date("2026-05-12T00:00:00.000Z"),
            endDate: new Date("2026-05-25T23:59:59.000Z"),
            totalMarks: totalMaxMarks,
            passingMarks: passingMarks,
            status: "COMPLETED",
          },
        })
      );
      console.log(`Created Exam for ${classKey} [${exam.examId}], Total: ${totalMaxMarks}`);
    } else {
      exam = await runWithRetry(() =>
        prisma.exam.update({
          where: { examId: exam.examId },
          data: {
            totalMarks: totalMaxMarks,
            passingMarks: passingMarks,
            status: "COMPLETED",
          },
        })
      );
      console.log(`Updated Exam for ${classKey} [${exam.examId}]`);
    }
    examMap.set(classKey, exam.examId);

    // 3. Populate ExamDatesheet
    for (const item of schedule) {
      const subjectId = subjectMap.get(item.subjectName.toLowerCase())!;
      const existingDs = await runWithRetry(() =>
        prisma.examDatesheet.findFirst({
          where: {
            examId: exam.examId,
            subjectId,
          },
        })
      );

      if (!existingDs) {
        await runWithRetry(() =>
          prisma.examDatesheet.create({
            data: {
              examId: exam.examId,
              subjectId,
              date: new Date(item.date),
              startTime: "08:30 AM",
              endTime: "12:00 PM",
            },
          })
        );
      } else {
        await runWithRetry(() =>
          prisma.examDatesheet.update({
            where: { id: existingDs.id },
            data: {
              date: new Date(item.date),
              startTime: "08:30 AM",
              endTime: "12:00 PM",
            },
          })
        );
      }
    }
    console.log(`Populated datesheet (${schedule.length} subjects) for ${classKey}`);
  }

  console.log("\n=== STEP 4: PARSE AND INGEST STUDENT MARKS & REPORT CARDS ===");
  await ingestResultsData(subjectMap, gradeKeyMap, examMap, classSubjectLookup);

  console.log("\n=== FIRST TERM 2026 SETUP COMPLETED SUCCESSFULLY ===");
}

async function ingestResultsData(
  subjectMap: Map<string, string>,
  gradeKeyMap: Map<string, string>,
  examMap: Map<string, string>,
  classSubjectLookup: Map<string, string>
) {
  const content = fs.readFileSync("scripts/Merged_Results_Data.md", "utf-8");
  const sections = content.split(/## File:\s*/g).filter(Boolean);

  const allDbStudents = await runWithRetry(() =>
    prisma.students.findMany({
      include: {
        StudentClass: {
          include: { Grades: true, Sessions: true },
        },
      },
    })
  );

  let nextRegCounter = 3250;

  for (const sec of sections) {
    const lines = sec.split("\n").map((l) => l.trim()).filter(Boolean);
    const fileName = lines[0];
    const classLine = lines.find((l) => l.includes("CLASS:")) || "";
    
    // Determine target class key
    let classKey = "";
    let teacherId = TEACHER_MAP.DEFAULT_ADMIN;

    if (fileName.includes("CLASS 7TH") || classLine.includes("SEVEN")) {
      classKey = "SEVEN_ROSE"; // or Rose+Tulip combined in 7th
      teacherId = TEACHER_MAP.AYESHA_JAMIL;
    } else if (fileName.includes("THREE") || classLine.includes("THREE")) {
      classKey = "THREE_ROSE";
      teacherId = TEACHER_MAP.MALAIKA_SHAHID;
    } else if (fileName.includes("PRE-9TH") || classLine.includes("PRE-9TH")) {
      classKey = "PRE_9_ROSE";
      teacherId = TEACHER_MAP.LARAIB_SULTAN;
    } else if (fileName.includes("ONE") || classLine.includes("ONE")) {
      classKey = "ONE_ROSE";
      teacherId = TEACHER_MAP.ZAINAB_JAMSHAID;
    } else if (fileName.includes("TWO") || classLine.includes("TWO")) {
      classKey = "TWO_ROSE";
      teacherId = TEACHER_MAP.MEHRAB_TABASSUM;
    } else if (fileName.includes("9TH SENIOR") || classLine.includes("9th  SENIOR")) {
      classKey = "NINE_ROSE"; // 9th Senior mapped to NINE_ROSE
      teacherId = TEACHER_MAP.AMINAH_NOOR;
    } else if (fileName.includes("FIVE") || classLine.includes("FIVE")) {
      classKey = "FIVE_ROSE";
      teacherId = TEACHER_MAP.MEHRAB_TABASSUM;
    }

    if (!classKey) {
      console.log(`Skipping unknown section: ${fileName}`);
      continue;
    }

    const classId = gradeKeyMap.get(classKey)!;
    const examId = examMap.get(classKey)!;

    console.log(`\n--------------------------------------------------`);
    console.log(`Processing ${fileName} -> Target Class: ${classKey} [${classId}], Exam: [${examId}]`);

    const tableLines = lines.filter((l) => l.startsWith("|"));
    const headerIdx = tableLines.findIndex((l) => l.toUpperCase().includes("NAME") && l.toUpperCase().includes("STUDENT"));
    if (headerIdx === -1) continue;

    const headerCols = tableLines[headerIdx].split("|").map((c) => c.trim()).filter(Boolean);

    // Identify subject column indices
    // Find where subjects start and where total/summary starts
    const subjectCols: Array<{ index: number; colName: string; subjectName: string; maxMarks: number }> = [];

    headerCols.forEach((col, idx) => {
      const up = col.toUpperCase();
      if (
        up === "NO." ||
        up === "SR NO." ||
        up === "SR. NO." ||
        up.includes("NAME") ||
        up.includes("OBTAINED") ||
        up.includes("PERCENT") ||
        up.includes("GRADE") ||
        up.includes("STATUS") ||
        up.includes("POSITION") ||
        up.includes("ATTENDANCE") ||
        up.includes("%")
      ) {
        return;
      }

      // Map colName to canonical subject
      let subName = "";
      let maxMarks = 100;

      if (up === "ENGLISH" || up === "ENGLISH A" || up === "ENGLISH(A)") {
        subName = up.includes("A") ? "English A" : (classKey.startsWith("PRE_9") || classKey.startsWith("NINE") ? "English" : "English A");
        if (classKey.startsWith("PRE_9") || classKey.startsWith("NINE")) maxMarks = 75;
      } else if (up === "ENGLISH B" || up === "ENGLISH(B)") {
        subName = "English B";
      } else if (up === "URDU" || up === "URDU A" || up === "URDU(A)") {
        subName = up.includes("A") ? "Urdu A" : (classKey.startsWith("PRE_9") || classKey.startsWith("NINE") ? "Urdu" : "Urdu A");
        if (classKey.startsWith("PRE_9") || classKey.startsWith("NINE")) maxMarks = 75;
      } else if (up === "URDU B" || up === "URDU(B)") {
        subName = "Urdu B";
      } else if (up === "MATH" || up === "MATHEMATICS") {
        subName = "Mathematics";
        if (classKey.startsWith("PRE_9") || classKey.startsWith("NINE")) maxMarks = 75;
      } else if (up === "ISLAMIYAT" || up === "ISLAMYAT") {
        subName = "Islamiyat";
      } else if (up.includes("TARJAMA") || up.includes("TARJUMA")) {
        subName = "Tarjama-tul-Quran";
        maxMarks = 50;
      } else if (up === "SCIENCE") {
        subName = "Science";
      } else if (up.includes("GEOGRAPHY") && !up.includes("HISTORY")) {
        subName = "Geography";
        maxMarks = 50;
      } else if (up.includes("HISTORY") && !up.includes("PRIMARY") && !up.includes("GEOGRAPHY")) {
        subName = "History";
        maxMarks = 50;
      } else if (up.includes("PRIMARY HISTORY")) {
        subName = "Primary History";
        maxMarks = 50;
      } else if (up.includes("MERI DUNIYA") || up.includes("MERI DUNYIA") || col.includes("میری دنیا")) {
        subName = "Meri Duniya";
      } else if (up.includes("COMPUTER")) {
        subName = "Computer";
        if (classKey === "ONE_ROSE" || classKey === "TWO_ROSE" || classKey === "THREE_ROSE") maxMarks = 50;
      } else if (up === "DRAWING") {
        subName = "Drawing";
        maxMarks = 50;
      } else if (up.includes("SPOKEN ENGLISH")) {
        subName = "Spoken English";
      } else if (up.includes("SOCIAL STUDIES")) {
        subName = "Social Studies";
      } else if (up.includes("PHYSICS")) {
        subName = "Physics";
        maxMarks = 60;
      } else if (up.includes("CHEMISTRY")) {
        subName = "Chemistry";
        maxMarks = 60;
      } else if (up.includes("BIO")) {
        subName = "Biology/Computer";
        maxMarks = 60;
      } else if (up.includes("SUMMER VACATION")) {
        subName = "Summer Vacation Task";
        maxMarks = 50;
      }

      if (subName) {
        subjectCols.push({
          index: idx,
          colName: col,
          subjectName: subName,
          maxMarks,
        });
      }
    });

    console.log(`Mapped ${subjectCols.length} subjects for table:`, subjectCols.map((s) => `${s.colName} -> ${s.subjectName} (${s.maxMarks})`));

    // Process rows
    for (let i = headerIdx + 1; i < tableLines.length; i++) {
      const rowLine = tableLines[i];
      if (rowLine.includes("---") || rowLine.includes(":---")) continue;
      const cols = rowLine.split("|").map((c) => c.trim()).filter(Boolean);
      if (cols.length < 3) continue;
      if (cols.some((c) => c.toUpperCase().includes("GRAND TOTAL") || c.toUpperCase().includes("TOTAL") || c.toUpperCase().includes("SIGNATURE"))) continue;

      // Extract Student Name
      let studentName = cols[1];
      if (/^\d+$/.test(studentName) && cols.length > 2) {
        studentName = cols[2];
      }
      if (!isNaN(Number(studentName))) {
        const alpha = cols.find((c) => /[a-zA-Z]/.test(c) && !c.match(/^\d+(st|nd|rd|th)$/i) && !c.match(/^[A-F][\+\-]?$/));
        if (alpha) studentName = alpha;
      }

      studentName = studentName.trim();
      if (!studentName || studentName.toUpperCase() === "TOTAL") continue;

      // Resolve student in DB
      let student = resolveStudent(allDbStudents, studentName, classKey);
      if (!student) {
        // Create student in DB
        const regNum = `MSN-S-26-${nextRegCounter++}`;
        const admNum = `S26${nextRegCounter}`;
        student = await runWithRetry(() =>
          prisma.students.create({
            data: {
              registrationNumber: regNum,
              admissionNumber: admNum,
              studentName: studentName,
              gender: "MALE",
              fatherName: "Father of " + studentName,
            },
            include: {
              StudentClass: {
                include: { Grades: true, Sessions: true },
              },
            },
          })
        );
        allDbStudents.push(student as any);
        console.log(`Created new student: "${studentName}" [Reg: ${regNum}, ID: ${student.studentId}]`);
      }

      // Ensure StudentClass enrollment for 2026 - 2027
      let sc = await runWithRetry(() =>
        prisma.studentClass.findFirst({
          where: {
            studentId: student.studentId,
            classId,
            sessionId: SESSION_ID,
          },
        })
      );

      if (!sc) {
        sc = await runWithRetry(() =>
          prisma.studentClass.create({
            data: {
              studentId: student.studentId,
              classId,
              sessionId: SESSION_ID,
            },
          })
        );
        console.log(`Enrolled "${studentName}" into ${classKey} [scId: ${sc.scId}]`);
      }

      // Record Marks
      let totalObtained = 0;
      let totalMax = 0;
      const reportDetailsData: Array<{ subjectId: string; obtainedMarks: number; totalMarks: number; percentage: number; remarks: string }> = [];

      for (const scItem of subjectCols) {
        // Look up column value
        let rawVal = cols[scItem.index] || "0";
        // Clean value (e.g. "17*", "A", "Absent", "44.5")
        let marksObtained = 0;
        if (rawVal.toUpperCase() === "A" || rawVal.toUpperCase() === "ABSENT" || rawVal.trim() === "") {
          marksObtained = 0;
        } else {
          const parsed = parseFloat(rawVal.replace(/[^0-9\.]/g, ""));
          marksObtained = isNaN(parsed) ? 0 : parsed;
        }

        const subjectId = subjectMap.get(scItem.subjectName.toLowerCase())!;
        
        // Ensure ClassSubject exists for this class & subject
        let csId = classSubjectLookup.get(`${classId}_${subjectId}`);
        if (!csId) {
          const newCs = await runWithRetry(() =>
            prisma.classSubject.create({
              data: {
                classId,
                subjectId,
                employeeId: teacherId,
                sessionId: SESSION_ID,
              },
            })
          );
          csId = newCs.csId;
          classSubjectLookup.set(`${classId}_${subjectId}`, csId);
        }

        // Upsert Marks
        const existingMark = await runWithRetry(() =>
          prisma.marks.findFirst({
            where: {
              examId,
              studentId: student.studentId,
              subjectId,
            },
          })
        );

        if (!existingMark) {
          await runWithRetry(() =>
            prisma.marks.create({
              data: {
                examId,
                studentId: student.studentId,
                subjectId,
                classSubjectId: csId,
                obtainedMarks: marksObtained,
                totalMarks: scItem.maxMarks,
                uploadedBy: teacherId,
              },
            })
          );
        } else {
          await runWithRetry(() =>
            prisma.marks.update({
              where: { marksId: existingMark.marksId },
              data: {
                obtainedMarks: marksObtained,
                totalMarks: scItem.maxMarks,
                classSubjectId: csId,
                uploadedBy: teacherId,
              },
            })
          );
        }

        totalObtained += marksObtained;
        totalMax += scItem.maxMarks;
        const pct = (marksObtained / scItem.maxMarks) * 100;
        reportDetailsData.push({
          subjectId,
          obtainedMarks: marksObtained,
          totalMarks: scItem.maxMarks,
          percentage: Math.round(pct * 10) / 10,
          remarks: pct >= 40 ? "Passed" : "Failed",
        });
      }

      // Upsert Report Card
      const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const status = overallPercentage >= 40 ? "PASSED" : "FAILED";

      const existingReport = await runWithRetry(() =>
        prisma.reportCard.findFirst({
          where: {
            studentId: student.studentId,
            examId,
          },
        })
      );

      if (existingReport) {
        await runWithRetry(() =>
          prisma.reportCard.update({
            where: { reportCardId: existingReport.reportCardId },
            data: {
              totalObtainedMarks: totalObtained,
              totalMaxMarks: totalMax,
              percentage: Math.round(overallPercentage * 10) / 10,
              status,
              ReportCardDetail: {
                deleteMany: {},
                create: reportDetailsData,
              },
            },
          })
        );
      } else {
        await runWithRetry(() =>
          prisma.reportCard.create({
            data: {
              studentId: student.studentId,
              examId,
              sessionId: SESSION_ID,
              classId,
              totalObtainedMarks: totalObtained,
              totalMaxMarks: totalMax,
              percentage: Math.round(overallPercentage * 10) / 10,
              status,
              ReportCardDetail: {
                create: reportDetailsData,
              },
            },
          })
        );
      }

      console.log(`✓ Report Card generated for "${studentName}" (${student.studentId}): ${totalObtained}/${totalMax} (${overallPercentage.toFixed(1)}%) -> ${status}`);
    }
  }
}

function resolveStudent(allDbStudents: any[], name: string, classKey: string): any {
  const norm = name.toUpperCase().replace(/[^A-Z]/g, "");

  // 1. Exact match on normalized name
  const exact = allDbStudents.filter((s) => s.studentName.toUpperCase().replace(/[^A-Z]/g, "") === norm);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) {
    // Pick the one enrolled in corresponding class or active session
    const matchedClass = exact.find((s) => s.StudentClass.some((sc: any) => sc.Grades.grade.toUpperCase().includes(classKey.split("_")[0])));
    if (matchedClass) return matchedClass;
    return exact[0];
  }

  // 2. Fuzzy / Includes match
  const partial = allDbStudents.filter((s) => {
    const dbNorm = s.studentName.toUpperCase().replace(/[^A-Z]/g, "");
    return dbNorm.includes(norm) || norm.includes(dbNorm);
  });
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) {
    const matchedClass = partial.find((s) => s.StudentClass.some((sc: any) => sc.Grades.grade.toUpperCase().includes(classKey.split("_")[0])));
    if (matchedClass) return matchedClass;
    return partial[0];
  }

  return null;
}

main()
  .catch((err) => {
    console.error("Fatal Execution Error:", err);
  })
  .finally(() => prisma.$disconnect());

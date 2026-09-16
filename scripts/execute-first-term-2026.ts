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

const TEACHER_MAP: Record<string, string> = {
  AYESHA_JAMIL: "cmg2xm34h0000jm041luehhh1",
  MALAIKA_SHAHID: "cmfwaw3xa0004la04uwfcqd0c",
  LARAIB_SULTAN: "cmjohtppv0000jo04zzqra22w",
  ZAINAB_JAMSHAID: "cmnjxa2v10000jp044df92dpi",
  MEHRAB_TABASSUM: "cmfp0t4250006fzccfqv1sewk",
  AMINAH_NOOR: "cmh539p9e0000la04h2jy60e8",
  DEFAULT_ADMIN: "cmf2764310000lb04fyci1oy2",
};

const SESSION_ID = "cmlbxf0gz0000kw04wrflwvgw";

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
  console.log("==================================================");
  console.log("FIRST TERM EXAMS 2026: DATABASE INGESTION STARTING");
  console.log("==================================================");

  // 1. Map all subjects
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
      console.log(`Created subject: "${name}" [${sub.subjectId}]`);
    }
    subjectMap.set(name.toLowerCase(), sub.subjectId);
  }

  // 2. ExamType
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
  }

  // 3. Classes and ClassSubjects
  const allGrades = await runWithRetry(() => prisma.grades.findMany());
  const gradeKeyMap = new Map<string, string>();
  for (const g of allGrades) {
    const key = `${g.grade.toUpperCase().replace(/\s+/g, "_")}_${g.section.toUpperCase()}`;
    gradeKeyMap.set(key, g.classId);
  }

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

  const examMap = new Map<string, string>();
  const classSubjectLookup = new Map<string, string>();

  for (const [classKey, schedule] of Object.entries(DATESHEET_SCHEDULES)) {
    const classId = gradeKeyMap.get(classKey);
    if (!classId) continue;
    const teacherId = classTeacherMap[classKey] || TEACHER_MAP.DEFAULT_ADMIN;

    for (const item of schedule) {
      const subjectId = subjectMap.get(item.subjectName.toLowerCase())!;
      let cs = await runWithRetry(() =>
        prisma.classSubject.findFirst({
          where: { classId, subjectId, sessionId: SESSION_ID },
        })
      );
      if (!cs) {
        cs = await runWithRetry(() =>
          prisma.classSubject.create({
            data: { classId, subjectId, employeeId: teacherId, sessionId: SESSION_ID },
          })
        );
      }
      classSubjectLookup.set(`${classId}_${subjectId}`, cs.csId);
    }

    const totalMaxMarks = schedule.reduce((sum, s) => sum + s.maxMarks, 0);
    const passingMarks = Math.round(totalMaxMarks * 0.4);

    let exam = await runWithRetry(() =>
      prisma.exam.findFirst({
        where: { sessionId: SESSION_ID, classId, examTypeEnum: "FIRST_TIME" },
      })
    );

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
    } else {
      exam = await runWithRetry(() =>
        prisma.exam.update({
          where: { examId: exam.examId },
          data: { totalMarks: totalMaxMarks, passingMarks: passingMarks, status: "COMPLETED" },
        })
      );
    }
    examMap.set(classKey, exam.examId);

    // Populate Datesheet
    for (const item of schedule) {
      const subjectId = subjectMap.get(item.subjectName.toLowerCase())!;
      const existingDs = await runWithRetry(() =>
        prisma.examDatesheet.findFirst({
          where: { examId: exam.examId, subjectId },
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
  }

  // 4. Ingest All Student Marks and Generate Report Cards
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

  let nextRegCounter = 3270;
  const processedFiles = new Set<string>();

  for (const sec of sections) {
    const lines = sec.split("\n").map((l) => l.trim()).filter(Boolean);
    const fileName = lines[0];

    const baseName = fileName.replace(/\s*\(\d+\)\.xlsx$/i, ".xlsx");
    if (processedFiles.has(baseName)) continue;
    processedFiles.add(baseName);

    const classLine = lines.find((l) => l.includes("CLASS:")) || "";
    let classKey = "";
    let teacherId = TEACHER_MAP.DEFAULT_ADMIN;

    if (fileName.includes("CLASS 7TH") || classLine.includes("SEVEN")) {
      classKey = "SEVEN_ROSE";
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
      classKey = "NINE_ROSE";
      teacherId = TEACHER_MAP.AMINAH_NOOR;
    } else if (fileName.includes("FIVE") || classLine.includes("FIVE")) {
      classKey = "FIVE_ROSE";
      teacherId = TEACHER_MAP.MEHRAB_TABASSUM;
    }

    if (!classKey) continue;

    const classId = gradeKeyMap.get(classKey)!;
    const examId = examMap.get(classKey)!;

    console.log(`\n======================================================`);
    console.log(`Ingesting File: ${fileName} -> Class: ${classKey} [${classId}], Exam: [${examId}]`);

    const tableLines = lines.filter((l) => l.startsWith("|"));
    const headerIdx = tableLines.findIndex((l) => l.toUpperCase().includes("NAME") && l.toUpperCase().includes("STUDENT"));
    if (headerIdx === -1) continue;

    const rawHeaders = tableLines[headerIdx].split("|").map((c) => c.trim());

    for (let i = headerIdx + 1; i < tableLines.length; i++) {
      if (tableLines[i].includes("---") || tableLines[i].includes(":---")) continue;
      const rawCols = tableLines[i].split("|").map((c) => c.trim());
      const rowObj: Record<string, string> = {};
      rawHeaders.forEach((h, idx) => {
        if (h) rowObj[h] = rawCols[idx] || "";
      });

      const nameKey = Object.keys(rowObj).find((k) => k.toUpperCase().includes("NAME") && k.toUpperCase().includes("STUDENT"));
      if (!nameKey) continue;

      const studentName = rowObj[nameKey]?.trim();
      if (!studentName || studentName.toUpperCase().includes("TOTAL") || studentName.toUpperCase().includes("SIGNATURE")) continue;

      // Match student
      let student = resolveStudent(allDbStudents, studentName, classKey);
      if (!student) {
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
        console.log(`Created new student: "${studentName}" [${regNum}]`);
      }

      // Enroll in StudentClass
      let sc = await runWithRetry(() =>
        prisma.studentClass.findFirst({
          where: { studentId: student.studentId, classId, sessionId: SESSION_ID },
        })
      );
      if (!sc) {
        sc = await runWithRetry(() =>
          prisma.studentClass.create({
            data: { studentId: student.studentId, classId, sessionId: SESSION_ID },
          })
        );
      }

      // Process subjects
      let totalObtained = 0;
      let totalMax = 0;
      const reportDetailsData: Array<{ subjectId: string; obtainedMarks: number; totalMarks: number; percentage: number; remarks: string }> = [];

      for (const [colName, val] of Object.entries(rowObj)) {
        const up = colName.toUpperCase();
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
          continue;
        }

        // Map column to subject name & max marks
        let canonicalSubName = "";
        let maxMarks = 100;

        if (up === "ENGLISH" || up === "ENGLISH A" || up === "ENGLISH(A)") {
          canonicalSubName = up.includes("A") ? "English A" : (classKey.startsWith("PRE_9") || classKey.startsWith("NINE") ? "English" : "English A");
          if (classKey.startsWith("PRE_9") || classKey.startsWith("NINE")) maxMarks = 75;
        } else if (up === "ENGLISH B" || up === "ENGLISH(B)") {
          canonicalSubName = "English B";
        } else if (up === "URDU" || up === "URDU A" || up === "URDU(A)") {
          canonicalSubName = up.includes("A") ? "Urdu A" : (classKey.startsWith("PRE_9") || classKey.startsWith("NINE") ? "Urdu" : "Urdu A");
          if (classKey.startsWith("PRE_9") || classKey.startsWith("NINE")) maxMarks = 75;
        } else if (up === "URDU B" || up === "URDU(B)") {
          canonicalSubName = "Urdu B";
        } else if (up === "MATH" || up === "MATHEMATICS") {
          canonicalSubName = "Mathematics";
          if (classKey.startsWith("PRE_9") || classKey.startsWith("NINE")) maxMarks = 75;
        } else if (up === "ISLAMIYAT" || up === "ISLAMYAT") {
          canonicalSubName = "Islamiyat";
        } else if (up.includes("TARJAMA") || up.includes("TARJUMA")) {
          canonicalSubName = "Tarjama-tul-Quran";
          maxMarks = 50;
        } else if (up === "SCIENCE") {
          canonicalSubName = "Science";
        } else if (up.includes("GEOGRAPHY") && !up.includes("HISTORY")) {
          canonicalSubName = "Geography";
          maxMarks = 50;
        } else if (up.includes("HISTORY") && !up.includes("PRIMARY") && !up.includes("GEOGRAPHY")) {
          canonicalSubName = "History";
          maxMarks = 50;
        } else if (up.includes("PRIMARY HISTORY")) {
          canonicalSubName = "Primary History";
          maxMarks = 50;
        } else if (up.includes("MERI DUNIYA") || up.includes("MERI DUNYIA") || colName.includes("میری دنیا")) {
          canonicalSubName = "Meri Duniya";
        } else if (up.includes("COMPUTER")) {
          canonicalSubName = "Computer";
          if (classKey === "ONE_ROSE" || classKey === "TWO_ROSE" || classKey === "THREE_ROSE") maxMarks = 50;
        } else if (up === "DRAWING") {
          canonicalSubName = "Drawing";
          maxMarks = 50;
        } else if (up.includes("SPOKEN ENGLISH")) {
          canonicalSubName = "Spoken English";
        } else if (up.includes("SOCIAL STUDIES")) {
          canonicalSubName = "Social Studies";
        } else if (up.includes("PHYSICS")) {
          canonicalSubName = "Physics";
          maxMarks = 60;
        } else if (up.includes("CHEMISTRY")) {
          canonicalSubName = "Chemistry";
          maxMarks = 60;
        } else if (up.includes("BIO")) {
          canonicalSubName = "Biology/Computer";
          maxMarks = 60;
        } else if (up.includes("SUMMER VACATION")) {
          // If empty in sheet, we can omit or include with 0
          if (!val.trim()) continue;
          canonicalSubName = "Summer Vacation Task";
          maxMarks = 50;
        }

        if (!canonicalSubName) continue;

        const subjectId = subjectMap.get(canonicalSubName.toLowerCase())!;
        let marksObtained = 0;
        if (val.toUpperCase() === "A" || val.toUpperCase() === "ABSENT" || val.trim() === "") {
          marksObtained = 0;
        } else {
          const parsed = parseFloat(val.replace(/[^0-9\.]/g, ""));
          marksObtained = isNaN(parsed) ? 0 : parsed;
        }

        // ClassSubject lookup
        let csId = classSubjectLookup.get(`${classId}_${subjectId}`);
        if (!csId) {
          const newCs = await runWithRetry(() =>
            prisma.classSubject.create({
              data: { classId, subjectId, employeeId: teacherId, sessionId: SESSION_ID },
            })
          );
          csId = newCs.csId;
          classSubjectLookup.set(`${classId}_${subjectId}`, csId);
        }

        // Upsert Marks
        const existingMark = await runWithRetry(() =>
          prisma.marks.findFirst({
            where: { examId, studentId: student.studentId, subjectId },
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
                totalMarks: maxMarks,
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
                totalMarks: maxMarks,
                classSubjectId: csId,
                uploadedBy: teacherId,
              },
            })
          );
        }

        totalObtained += marksObtained;
        totalMax += maxMarks;
        const pct = (marksObtained / maxMarks) * 100;
        reportDetailsData.push({
          subjectId,
          obtainedMarks: marksObtained,
          totalMarks: maxMarks,
          percentage: Math.round(pct * 10) / 10,
          remarks: pct >= 40 ? "Passed" : "Failed",
        });
      }

      // Upsert Report Card
      const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const status = overallPercentage >= 40 ? "PASSED" : "FAILED";

      const existingReport = await runWithRetry(() =>
        prisma.reportCard.findFirst({
          where: { studentId: student.studentId, examId },
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

      console.log(`✓ [${classKey}] Report Card: "${studentName}" -> ${totalObtained}/${totalMax} (${overallPercentage.toFixed(1)}%) [${status}]`);
    }
  }

  console.log("\n==================================================");
  console.log("FIRST TERM EXAMS 2026 INGESTION FULLY COMPLETE!");
  console.log("==================================================");
}

function resolveStudent(allDbStudents: any[], name: string, classKey: string): any {
  const norm = name.toUpperCase().replace(/[^A-Z]/g, "");

  const exact = allDbStudents.filter((s) => s.studentName.toUpperCase().replace(/[^A-Z]/g, "") === norm);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) {
    const matchedClass = exact.find((s) => s.StudentClass.some((sc: any) => sc.Grades.grade.toUpperCase().includes(classKey.split("_")[0])));
    if (matchedClass) return matchedClass;
    return exact[0];
  }

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
  .catch(console.error)
  .finally(() => prisma.$disconnect());

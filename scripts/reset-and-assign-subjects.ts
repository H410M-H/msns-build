import pg from "pg";

const DEFAULT_CLASS_SUBJECTS: Record<string, string[]> = {
  PLAYGROUP: [
    "English",
    "Urdu (Khushkhati)",
    "Urdu (Kalian)",
    "Spoken English + Sounds",
    "Lunch",
    "World Around Me/Drawing",
    "Math",
    "Rhymes",
    "Movies/Games",
  ],
  NURSERY: [
    "English",
    "Math",
    "Spoken English + Sounds",
    "Urdu (Gulab)",
    "World Around Me/Drawing",
    "Urdu (Khushkhati)",
    "Rhymes",
  ],
  PREP: [
    "English",
    "Math/N.B",
    "Urdu/N.B",
    "Urdu (Khushkhati)",
    "Lunch + Diary",
    "Spoken English + Sounds",
    "Islamiat + Nazra Qur'an",
    "Rhymes",
    "World Around Us",
  ],
  "CLASS ONE": [
    "Math",
    "Urdu A",
    "English B",
    "English A",
    "Urdu B",
    "Meri Duniya",
    "Computer/Spoken English",
    "Islamiat + Nazra Qur'an",
    "World Around Us/Drawing",
  ],
  "CLASS TWO": [
    "Math",
    "Urdu A",
    "English B",
    "English A",
    "Urdu B",
    "Meri Duniya",
    "Computer/Spoken English",
    "Islamiat + Nazra Qur'an",
    "Pakistan History + Drawing",
  ],
  "CLASS THREE": [
    "Islamiat + Nazra Qur'an",
    "Pakistan History",
    "English A",
    "Math",
    "Computer",
    "Meri Duniya",
    "Urdu A",
    "English B/Spoken",
    "Urdu B",
  ],
  "CLASS FOUR": [
    "Math",
    "Urdu A",
    "Computer",
    "English B",
    "Social Studies",
    "English A",
    "Urdu B",
    "Islamiat + Nazra Qur'an",
    "Science",
  ],
  "CLASS FIVE": [
    "Social Studies",
    "Islamiat + Tarjuma Qur'an",
    "Science",
    "Computer",
    "Urdu A",
    "English A",
    "Math",
    "Urdu B",
    "English B",
  ],
  "CLASS SIX": [
    "English A",
    "Urdu A",
    "Science",
    "History/Geography",
    "Islamiat + Tarjuma Qur'an",
    "Math",
    "English B",
    "Urdu B",
    "Computer",
  ],
  "CLASS SEVEN": [
    "Math",
    "Urdu A",
    "Islamiat + Tarjuma Qur'an",
    "English A",
    "English B",
    "Urdu B",
    "Geography/History",
    "Computer",
    "Science",
    "Islamiat",
  ],
  "9TH JUNIOR": [
    "Physics",
    "Math",
    "English B",
    "Islamiat + Tarjuma Qur'an",
    "Chemistry",
    "Biology/Computer",
    "Urdu",
    "English A",
    "Health & Physical Education",
    "Science",
    "Islamiat (Elective)",
    "Chemistry/Science",
  ],
  "PRE-9TH + 9TH SENIOR": [
    "Urdu",
    "Math",
    "Biology/Computer",
    "Islamiat + Tarjuma Qur'an",
    "English B",
    "Physics",
    "Chemistry",
    "English A",
  ],
  "9TH SENIOR": [
    "Physics",
    "English A",
    "Math",
    "English B",
    "Urdu",
    "Computer",
    "Islamiat + Tarjuma Qur'an",
    "Chemistry",
    "Health & Physical Education",
    "Science",
    "Islamiat (Elective)",
  ],
  "10TH": [
    "Math",
    "Chemistry",
    "Pakistan Studies",
    "Physics",
    "Biology/Computer",
    "Tarjuma Qur'an",
    "Urdu",
    "English A+B",
  ],
};

function getDefaultSubjectsForGrade(grade: string, category?: string): string[] {
  const norm = grade.toUpperCase().replace(/\s+/g, " ").trim();

  if (norm.includes("PLAYGROUP") || norm.includes("PLAY GROUP") || norm.includes("PLAY")) {
    return DEFAULT_CLASS_SUBJECTS["PLAYGROUP"]!;
  }
  if (norm.includes("NURSERY")) {
    return DEFAULT_CLASS_SUBJECTS["NURSERY"]!;
  }
  if (norm.includes("PREP")) {
    return DEFAULT_CLASS_SUBJECTS["PREP"]!;
  }
  if (norm.includes("ONE") || norm.includes("1ST") || norm.includes(" 1")) {
    return DEFAULT_CLASS_SUBJECTS["CLASS ONE"]!;
  }
  if (norm.includes("TWO") || norm.includes("2ND") || norm.includes(" 2")) {
    return DEFAULT_CLASS_SUBJECTS["CLASS TWO"]!;
  }
  if (norm.includes("THREE") || norm.includes("3RD") || norm.includes(" 3")) {
    return DEFAULT_CLASS_SUBJECTS["CLASS THREE"]!;
  }
  if (norm.includes("FOUR") || norm.includes("4TH") || norm.includes(" 4")) {
    return DEFAULT_CLASS_SUBJECTS["CLASS FOUR"]!;
  }
  if (norm.includes("FIVE") || norm.includes("5TH") || norm.includes(" 5")) {
    return DEFAULT_CLASS_SUBJECTS["CLASS FIVE"]!;
  }
  if (norm.includes("SIX") || norm.includes("6TH") || norm.includes(" 6")) {
    return DEFAULT_CLASS_SUBJECTS["CLASS SIX"]!;
  }
  if (norm.includes("SEVEN") || norm.includes("7TH") || norm.includes(" 7")) {
    return DEFAULT_CLASS_SUBJECTS["CLASS SEVEN"]!;
  }
  // DB's "9th Junior" is Pre-9th → uses "PRE-9TH + 9TH SENIOR" subjects
  if (norm.includes("PRE-9TH") || norm.includes("PRE 9TH") || norm.includes("9TH JUNIOR") || norm.includes("9 JUNIOR")) {
    return DEFAULT_CLASS_SUBJECTS["PRE-9TH + 9TH SENIOR"]!;
  }
  if (norm.includes("9TH SENIOR") || norm.includes("9 SENIOR")) {
    return DEFAULT_CLASS_SUBJECTS["9TH SENIOR"]!;
  }
  if (norm.includes("9TH") || norm.includes("9 ")) {
    return DEFAULT_CLASS_SUBJECTS["9TH SENIOR"]!;
  }
  if (norm.includes("10TH") || norm.includes("10")) {
    return DEFAULT_CLASS_SUBJECTS["10TH"]!;
  }

  if (category === "Montessori") {
    return DEFAULT_CLASS_SUBJECTS["PLAYGROUP"]!;
  }

  return ["English", "Urdu", "Math", "Science", "Islamiyat", "Computer"];
}

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL || "postgresql://u0_a535@localhost:5432/msns-auth",
  });
  await client.connect();

  console.log("Deleting existing subject records from database...");
  await client.query('DELETE FROM "Marks"');
  await client.query('DELETE FROM "SubjectDiary"');
  await client.query('DELETE FROM "Timetable"');
  await client.query('DELETE FROM "ExamDatesheet"');
  await client.query('DELETE FROM "ReportCardDetail"');
  await client.query('DELETE FROM "ClassSubject"');
  await client.query('DELETE FROM "Subject"');
  console.log("Successfully deleted all existing subjects and class subject assignments.");

  const gradesRes = await client.query('SELECT "classId", "grade", "category", "section" FROM "Grades"');
  const grades = gradesRes.rows;

  const sessionRes = await client.query('SELECT "sessionId" FROM "Sessions" WHERE "isActive" = true LIMIT 1');
  let sessionId = sessionRes.rows[0]?.sessionId;
  if (!sessionId) {
    const fallbackSess = await client.query('SELECT "sessionId" FROM "Sessions" LIMIT 1');
    sessionId = fallbackSess.rows[0]?.sessionId;
  }

  const empRes = await client.query('SELECT "employeeId" FROM "Employees" WHERE "status" = \'Active\' LIMIT 1');
  let employeeId = empRes.rows[0]?.employeeId;
  if (!employeeId) {
    const fallbackEmp = await client.query('SELECT "employeeId" FROM "Employees" LIMIT 1');
    employeeId = fallbackEmp.rows[0]?.employeeId;
  }

  console.log(`Using sessionId: ${sessionId}, employeeId: ${employeeId}`);

  let subjectIdCounter = 1;
  let csIdCounter = 1;

  for (const cls of grades) {
    const defaultSubs = getDefaultSubjectsForGrade(cls.grade, cls.category);
    console.log(`\nAssigning ${defaultSubs.length} subjects to ${cls.grade} (${cls.section}):`);
    defaultSubs.forEach(s => console.log(`  - ${s}`));

    for (const subName of defaultSubs) {
      let subRes = await client.query('SELECT "subjectId" FROM "Subject" WHERE LOWER("subjectName") = LOWER($1)', [subName]);
      let subjectId: string;

      if (subRes.rows.length > 0) {
        subjectId = subRes.rows[0].subjectId;
      } else {
        subjectId = `sub-gen-${Date.now()}-${subjectIdCounter++}`;
        await client.query(
          'INSERT INTO "Subject" ("subjectId", "subjectName", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
          [subjectId, subName]
        );
      }

      const csId = `cs-gen-${Date.now()}-${csIdCounter++}`;
      await client.query(
        'INSERT INTO "ClassSubject" ("csId", "classId", "subjectId", "employeeId", "sessionId") VALUES ($1, $2, $3, $4, $5)',
        [csId, cls.classId, subjectId, employeeId, sessionId]
      );
    }
  }

  // Final summary
  const totalSubs = await client.query('SELECT COUNT(*) FROM "Subject"');
  const totalCs = await client.query('SELECT COUNT(*) FROM "ClassSubject"');
  console.log(`\n✅ Done! ${totalSubs.rows[0].count} subjects, ${totalCs.rows[0].count} class-subject assignments.`);
  await client.end();
}

main().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});

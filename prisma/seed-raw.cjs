const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/msns-auth'
});

const dataset = [
  {
    grade: "PLAYGROUP",
    section: "ROSE",
    category: "Montessori",
    incharge: "ZOYA NAZ",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH", "ENGLISH READING", "URDU", "URDU READING", "MATH", "MATH ORAL", "DRAWING", "SPOKEN ENGLISH", "ISLAMIYAT", "WORLD AROUND ME", "SUMMER VACTION TAST"],
    students: [
      { name: "JANNAT NAZIA", marks: [100, 48, 100, 50, 100, 45, 50, 100, 100, 50, 100], gender: "FEMALE", attendance: 66, position: "1st" },
      { name: "HARRAM NOOR", marks: [100, 50, 100, 50, 100, 50, 50, 100, 100, 50, 100], gender: "FEMALE", attendance: 77, position: "1st" },
      { name: "M.ALI IJAZ", marks: [100, 50, 100, 50, 100, 50, 50, 100, 100, 50, 98], gender: "MALE", attendance: 85, position: "1st" },
      { name: "M.AREESH", marks: [83, 40, 94, 45, 100, 40, 50, 100, 100, 44, 91], gender: "MALE", attendance: 49, position: "3rd" },
      { name: "M.AHMED", marks: [100, 50, 100, 50, 100, 50, 50, 100, 100, 50, 100], gender: "MALE", attendance: 81, position: "1st" },
      { name: "AYESHA ALI", marks: [100, 50, 100, 50, 100, 50, 50, 100, 100, 50, 100], gender: "FEMALE", attendance: 91, position: "1st" },
      { name: "EMAN FATIMA", marks: [100, 45, 100, 45, 100, 50, 50, 100, 100, 50, 98], gender: "FEMALE", attendance: 51, position: "2nd" },
      { name: "M.AHMED UMAR", marks: [100, 50, 100, 50, 100, 50, 50, 100, 100, 50, 100], gender: "MALE", attendance: 65, position: "1st" },
      { name: "M.ARHAM USMAN", marks: [100, 45, 100, 48, 100, 48, 50, 100, 100, 50, 98], gender: "MALE", attendance: 75, position: "1st" },
      { name: "ANAS IRFAN", marks: [100, 50, 100, 50, 100, 50, 50, 100, 100, 50, 100], gender: "MALE", attendance: 90, position: "1st" },
      { name: "MIRHA TANVEER", marks: [100, 45, 100, 48, 100, 40, 49, 100, 100, 50, 96], gender: "FEMALE", attendance: 78, position: "2nd" },
      { name: "HAROON NASIR", marks: [100, 48, 100, 48, 100, 48, 46, 100, 100, 50, 97], gender: "MALE", attendance: 87, position: "2nd" },
      { name: "ABRESH ZAIN", marks: [100, 45, 100, 48, 100, 40, 46, 100, 100, 45, 100], gender: "MALE", attendance: 73, position: "2nd" },
      { name: "HARAM FATIMA", marks: [100, 50, 95, 50, 100, 50, 50, 100, 100, 50, null], gender: "FEMALE", attendance: 79, position: "1st" },
      { name: "MIRHA WARIS", marks: [100, 15, 71, 30, 61, 20, 43, 30, 50, 34, null], gender: "FEMALE", attendance: 82, position: "4th" },
      { name: "ARSHIA NOOR", marks: [100, 15, 69, 40, 88, 20, 40, 25, 30, 41, null], gender: "FEMALE", attendance: 80, position: "5th" },
      { name: "M.IRTAZA ASFAND", marks: [100, 50, 100, 45, 100, 50, 50, 100, 80, 50, null], gender: "MALE", attendance: 79, position: "2nd" },
      { name: "KHADIJA RANI", marks: [78, 10, 72, 30, 74, 20, 27, 20, 30, 29, null], gender: "FEMALE", attendance: 66, position: "6th" }
    ]
  },
  {
    grade: "NURSERY",
    section: "ROSE",
    category: "Montessori",
    incharge: "MAHNOOR KHALID",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH WRITTEN", "ENGLISH ORAL", "URDU WRITTEN", "URDU ORAL", "MATH WRITTEN", "MATH ORAL", "DRAWING", "SPOKEN ENGLISH", "ISLAMIYAT", "WORLD AROUND ME", "SUMMER VACTION TASK"],
    students: [
      { name: "HARRAM SHEHZADI", marks: [97, 49, 100, 50, 99, 50, 50, 100, 100, 50, 98], gender: "FEMALE", attendance: 83, position: "1st" },
      { name: "HUZAIMA MUBARAK", marks: [95, 48, 99, 49, 98, 47, 50, 100, 100, 50, 97], gender: "FEMALE", attendance: 75, position: "2nd" },
      { name: "M. AZAAN", marks: [97, 48, 100, 50, 99, 49, 50, 100, 100, 50, 98], gender: "MALE", attendance: 71, position: "1st" },
      { name: "AYAN ANSAR", marks: [95, 47, 99, 49, 99, 47, 50, 100, 84, 50, 98], gender: "MALE", attendance: 69, position: "3rd" }
    ]
  },
  {
    grade: "PREP",
    section: "NONE",
    category: "Montessori",
    incharge: "FARAH NAZ",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH", "ENGLISH READING", "URDU", "URDU READING", "MATH", "MATH ORAL", "DRAWING", "SPOKEN ENGLISH", "ISLAMIYAT", "WORLD AROUND ME", "SUMMER VACATION TASK"],
    students: [
      { name: "M. AHMAD AKBAR", marks: [98, 48, 99, 50, 100, 50, 47, 100, 100, 50, 90], gender: "MALE", attendance: 87, position: "2nd" },
      { name: "JANNAT SHAHZADI", marks: [45, 23, 93, 23, 97, 50, 43, 80, 90, 50, 95], gender: "FEMALE", attendance: 85, position: "3rd" },
      { name: "HUZAIFA MUBARAK", marks: [97, 50, 99, 47, 100, 50, 46, 100, 100, 50, 90], gender: "MALE", attendance: 87, position: "2nd" },
      { name: "MUHAMMAD AHMAD", marks: [97, 50, 100, 45, 100, 50, 42, 100, 100, 50, 90], gender: "MALE", attendance: 84, position: "2nd" },
      { name: "ZAINAB ABU BAKAR", marks: [100, 50, 100, 50, 99, 50, 50, 100, 100, 50, 100], gender: "FEMALE", attendance: 84, position: "1st" },
      { name: "TARFA HANIA", marks: [100, 48, 93, 45, 99, 50, 49, 100, 100, 50, 98], gender: "FEMALE", attendance: 80, position: "2nd" },
      { name: "SHAZIL BILAL", marks: [99, 50, 100, 50, 100, 50, 48, 100, 100, 50, 100], gender: "MALE", attendance: 76, position: "1st" },
      { name: "CHASHMAN JALAL", marks: [99, 50, 100, 50, 100, 50, 49, 100, 100, 50, 95], gender: "MALE", attendance: 89, position: "1st" },
      { name: "UMAIR TANVEER", marks: [94, 50, 100, 40, 99, 50, 47, 100, 100, 50, 98], gender: "MALE", attendance: 88, position: "2nd" },
      { name: "M.HASHIM", marks: [99, 50, 100, 47, 100, 50, 46, 100, 100, 50, 90], gender: "MALE", attendance: 58, position: "2nd" },
      { name: "SEERAT FATIMA", marks: [98, 50, 98, 45, 100, 50, 50, 100, 100, 50, 87], gender: "FEMALE", attendance: 84, position: "2nd" },
      { name: "M.HASHIM CHEEMA", marks: [99, 48, 98, 48, 100, 50, 48, 100, 100, 50, 90], gender: "MALE", attendance: 79, position: "2nd" }
    ]
  },
  {
    grade: "ONE",
    section: "ROSE",
    category: "Primary",
    incharge: "MEHRAB TABASSUM",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH A", "ENGLISH B", "URDU A", "URDU B", "MATH", "MERI DUNYIA", "DRAWING", "SPOKEN ENGLISH", "ISLAMIYAT", "COMPUTER", "PRIMARY HISTORY", "SUMMER VACATION TASK"],
    students: [
      { name: "DAMAN FATIMA", marks: [99, 100, 99, 96, 100, 100, 50, 100, 98, 50, 48, 96], gender: "FEMALE", attendance: 87, position: "1st" },
      { name: "ANAYA NAVEED", marks: [88, 86, 94, 76, 97, 98, 46, 98, 86, 44, 46, 92], gender: "FEMALE", attendance: 89, position: "2nd" },
      { name: "M.ARHAM", marks: [57, 54, 87, 45, 77, 98, 37, 93, 64, 40, 35, 0], gender: "MALE", attendance: 73, position: "4th" }
    ]
  },
  {
    grade: "TWO",
    section: "ROSE",
    category: "Primary",
    incharge: "MEHRAB TABASUM",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH A", "ENGLISH B", "URDU A", "URDU B", "MATH", "SPOKEN", "PRIMARY HISTORY", "MERI DUNIYA", "ISLAMIYAT", "COMPUTER", "DRAWING", "SUMMER VACATION TASK"],
    students: [
      { name: "M. AHMAD", marks: [93, 97, 92, 95, 98, 97, 48, 98, 90, 47, 48, 96], gender: "MALE", attendance: 88, position: "2nd" },
      { name: "M. FURQAN", marks: [45, 52, 78, 47, 85, 88, 35, 88, 60, 48, 44, 91], gender: "MALE", attendance: 90, position: "3rd" },
      { name: "M.AYYAN ALI", marks: [95, 93, 99, 95, 93, 99, 47, 98, 96, 48, 48, 97], gender: "MALE", attendance: 81, position: "2nd" },
      { name: "HARRAM FATIMA", marks: [98, 99, 99, 98, 100, 100, 49, 100, 96, 50, 49, 98], gender: "FEMALE", attendance: 90, position: "1st" },
      { name: "RAFIA ABU BAKAR", marks: [98, 100, 99, 99, 100, 100, 49, 100, 97, 50, 49, 98], gender: "FEMALE", attendance: 87, position: "1st" },
      { name: "AYAT NOOR", marks: [98, 99, 98, 95, 99, 100, 49, 100, 95, 50, 49, 0], gender: "FEMALE", attendance: 84, position: "1st" }
    ]
  },
  {
    grade: "THREE",
    section: "NONE",
    category: "Primary",
    incharge: "MALAIKA SHAHID",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH A", "ENGLISH B", "URDU A", "URDU B", "MATH", "MERI DUNIYA", "DRAWING", "ISLAMIYAT", "COMPUTER", "PRIMARY HISTORY", "SUMMER VACTION TASK"],
    students: [
      { name: "ANAYA ZUBAIR", marks: [99, 96, 100, 97, 98, 99, 50, 100, 49, 50, 98], gender: "FEMALE", attendance: 82, position: "1st" },
      { name: "MUHAMMAD ARYAN", marks: [100, 96, 100, 93, 100, 99, 50, 99, 49, 50, 99], gender: "MALE", attendance: 89, position: "1st" },
      { name: "ALEEHA AKBAR", marks: [91, 76, 99, 70, 98, 94, 49, 96, 44, 49, 97], gender: "FEMALE", attendance: 88, position: "3rd" },
      { name: "FATIMA ZAHRA", marks: [99, 99, 100, 85, 99, 99, 50, 100, 50, 49, 98], gender: "FEMALE", attendance: 83, position: "2nd" },
      { name: "M.HUSNAIN", marks: [100, 95, 100, 95, 98, 99, 50, 98, 50, 50, 98], gender: "MALE", attendance: 89, position: "1st" }
    ]
  },
  {
    grade: "FOUR",
    section: "NONE",
    category: "Primary",
    incharge: "MALAIKA SHAHID",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH A", "ENGLISH B", "URDU A", "URDU B", "MATH", "SCIENCE", "ISLAMIYAT", "COMPUTER", "SOCIAL STUDIES", "SUMMER VACATION TASK"],
    students: [
      { name: "HAIDER ALI", marks: [96, 99, 95, 95, 90, 100, 95, 95, 88, 97], gender: "MALE", attendance: 86, position: "2nd" },
      { name: "M. HUZAIFA", marks: [99, 99, 99, 98, 98, 100, 100, 90, 94, 97], gender: "MALE", attendance: 88, position: "1st" },
      { name: "ASIFA ANSAR", marks: [99, 99, 99, 96, 96, 92, 97, 100, 96, 99], gender: "FEMALE", attendance: 86, position: "1st" },
      { name: "AMINA RANI", marks: [98, 99, 99, 92, 97, 99, 99, 100, 95, 99], gender: "FEMALE", attendance: 88, position: "1st" },
      { name: "SULEMAN", marks: [95, 84, 98, 94, 93, 66, 95, 87, 90, 94], gender: "MALE", attendance: 83, position: "3rd" },
      { name: "INTASHAL FATIMA", marks: [99, 98, 96, 88, 71, 81, 95, 100, 92, 96], gender: "FEMALE", attendance: 86, position: "2nd" },
      { name: "M.ARSLAN", marks: [91, 70, 74, 78, 84, 77, 82, 89, 50, 0], gender: "MALE", attendance: 80, position: "4th" },
      { name: "M.SAQLAIN", marks: [99, 100, 99, 95, 96, 84, 98, 99, 93, 99], gender: "MALE", attendance: 88, position: "1st" },
      { name: "M.IBRAHIM", marks: [99, 100, 98, 87, 90, 100, 98, 100, 92, 97], gender: "MALE", attendance: 87, position: "1st" }
    ]
  },
  {
    grade: "FIVE",
    section: "NONE",
    category: "Primary",
    incharge: "KINZA NOREEN",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH A", "ENGLISH B", "URDU A", "URDU B", "S.STUDIES", "MATHEMATICS", "COMPUTER", "SCIENCE", "ISLAMIYAT", "SUMMER VACTION TASK"],
    students: [
      { name: "M.MATEEN AHMAD", marks: [100, 99, 98, 96, 98, 100, 98, 95, 95, 96], gender: "MALE", attendance: 89, position: "1st" },
      { name: "NOOR FATIMA IJAZ", marks: [99, 96, 96, 99, 99, 93, 99, 86, 97, 96], gender: "FEMALE", attendance: 91, position: "1st" },
      { name: "ALI SHER KHALID", marks: [72, 65, 59, 65, 47, 70, 97, 62, 54, 93], gender: "MALE", attendance: 81, position: "4th" },
      { name: "M. HASHIM AKBAR", marks: [82, 79, 88, 84, 51, 86, 97, 75, 63, 95], gender: "MALE", attendance: 90, position: "2nd" },
      { name: "M.RIZWAN", marks: [91, 74, 77, 80, 53, 98, 97, 76, 62, 95], gender: "MALE", attendance: 86, position: "2nd" },
      { name: "M.ADNAN", marks: [72, 45, 68, 57, 34, 68, 84, 50, 46, 95], gender: "MALE", attendance: 87, position: "5th" },
      { name: "HUSSAIN ALI", marks: [92, 75, 73, 64, 47, 74, 97, 74, 50, 93], gender: "MALE", attendance: 80, position: "3rd" }
    ]
  },
  {
    grade: "SIX",
    section: "ROSE",
    category: "Middle",
    incharge: "LARAIB SULTAN",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH A", "ENGLISH B", "URDU A", "URDU B", "SCIENCE", "Geography", "History", "ISLAMIYAT", "MATHEMATICS", "TARJAMA-TUL-QURAN", "COMPUTER", "SUMMER VACTION TASK"],
    students: [
      { name: "ADAN QAISAR", marks: [100, 100, 98, 95, 97, 47, 48, 100, 100, 50, 100, 97], gender: "FEMALE", attendance: 87, position: "2nd" },
      { name: "AIMA ZAHRA", marks: [100, 100, 99, 98, 92, 45, 50, 97, 98, 49, 97, 99], gender: "FEMALE", attendance: 87, position: "2nd" },
      { name: "ALI AHMAD", marks: [81, 96, 90, 92, 65, 29, 39, 70, 60, 47, 93, 80], gender: "MALE", attendance: 78, position: "4th" },
      { name: "M.AHMAD HASSAN", marks: [51, 65, 65, 48, 47, 27, 29, 65, 67, 29, 77, 0], gender: "MALE", attendance: 58, position: "5th" },
      { name: "M.HUZAIF FAREED", marks: [100, 100, 99, 97, 99, 49, 50, 99, 100, 50, 100, 99], gender: "MALE", attendance: 85, position: "1st" },
      { name: "FAIZ-UL-RASOOL", marks: [96, 92, 95, 97, 99, 42, 47, 96, 84, 50, 97, 95], gender: "MALE", attendance: 84, position: "3rd" }
    ]
  },
  {
    grade: "SEVEN",
    section: "ROSE",
    category: "Middle",
    incharge: "HAMNA RAZZAQ",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH A", "ENGLISH B", "URDU A", "URDU B", "SCIENCE", "GEOGRAPHY", "HISTORY", "ISLAMIYAT", "MATHEMATICS", "TARJAMA-TUL-QURAN", "COMPUTER", "SUMMER VACTION TASK"],
    students: [
      { name: "ZAINAB SHAHZADI", marks: [65, 65, 61, 86, 42, 20, 43, 54, 75, 40, 91, 95], gender: "FEMALE", attendance: 86, position: "6th" },
      { name: "MOMINA RANI", marks: [100, 90, 83, 96, 68, 45, 47, 87, 92, 49, 99, 96], gender: "FEMALE", attendance: 87, position: "3rd" },
      { name: "JAWAD AHMED", marks: [100, 100, 89, 97, 97, 48, 50, 100, 100, 49, 100, 97], gender: "MALE", attendance: 87, position: "1st" },
      { name: "M.UMAIS ABU BAKAR", marks: [90, 92, 58, 90, 71, 47, 48, 80, 86, 46, 98, 96], gender: "MALE", attendance: 87, position: "4th" },
      { name: "M.ABDULLAH", marks: [59, 78, 72, 91, 68, 45, 45, 85, 93, 42, 99, 92], gender: "MALE", attendance: 81, position: "5th" },
      { name: "ABDUL REHEEM", marks: [37, 62, 24, 50, 56, 21, 32, 61, 95, 23, 50, 91], gender: "MALE", attendance: 83, position: "8th" },
      { name: "M.ANAS", marks: [97, 98, 90, 86, 97, 47, 50, 97, 100, 48, 100, 100], gender: "MALE", attendance: 91, position: "2nd" },
      { name: "HANAN SHAHID", marks: [87, null, 80, 91, 81, null, null, null, 100, null, null, 96], gender: "MALE", attendance: 84, position: "9th" },
      { name: "MUHAMMAD AHMAD", marks: [98, 96, 92, 98, 92, 49, 50, 92, 100, 49, 100, 97], gender: "MALE", attendance: 87, position: "2nd" },
      { name: "HASSAN ALI", marks: [51, 57, 44, 73, 63, 30, 26, 64, 95, 28, 93, 93], gender: "MALE", attendance: 79, position: "7th" },
      { name: "ABDUL REHMAN", marks: [91, 91, 82, 93, 83, 39, 47, 88, 96, 45, 98, 95], gender: "MALE", attendance: 88, position: "3rd" },
      { name: "AYAN IJAZ", marks: [null, null, 58, null, 50, 20, 41, 74, 85, null, null, 91], gender: "MALE", attendance: 81, position: "10th" }
    ]
  },
  {
    grade: "PRE NINE",
    section: "ROSE",
    category: "SSC_I",
    incharge: "SIR WAQAS",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ISLAMIYAT", "TARJUMA TUL QURAN", "URDU", "ENGLISH", "PHYSICS/ ISLAMIAT ELECTIVE", "CHEMISTRY/PHYSICAL EDUCATION", "MATH", "COMPUTER/GENERAL SCIENCE"],
    students: [
      { name: "ARHAM DASTGIR", marks: [50, 31, 23, 34, 28, 36, 32, 36], gender: "MALE", attendance: 89, position: "" },
      { name: "M. BILAL CHEEMA", marks: [62, 34, 30, 29, 29, 24, 29, 33], gender: "MALE", attendance: 72, position: "" },
      { name: "M. AWAIS CHEEMA", marks: [60, 42, 25, 40, 31, 26, 33, 31], gender: "MALE", attendance: 49, position: "" },
      { name: "IMRAN ALI", marks: [63, 23, 33, 27, 45, 32, 27, 47], gender: "MALE", attendance: 78, position: "" },
      { name: "UMAR", marks: [33, 26, 11, 10, 17, 18, 28, 25], gender: "MALE", attendance: 31, position: "" }
    ]
  },
  {
    grade: "PRE NINE",
    section: "TULIP",
    category: "SSC_I",
    incharge: "AMINAH NOOR",
    examType: "FINAL",
    examCategory: "STANDARD",
    subjects: ["ENGLISH", "URDU", "BIO\\COM", "CHEMISTRY", "ISLAMIYAT/  اخلاقیات", "QURAN", "MATH", "PHYSICS"],
    students: [
      { name: "HAWA TEHREEM", marks: [41, 38, 39, 21, 71, 27, 35, 29], gender: "FEMALE", attendance: 96, position: "8th" },
      { name: "HARRAM SHEHZAD", marks: [41, 42, 41, 22, 64, 27, 42, 29], gender: "FEMALE", attendance: 99, position: "7th" },
      { name: "MISHAAL FATIMA", marks: [58, 56, 32, 24, 79, 42, 35, 36], gender: "FEMALE", attendance: 88, position: "5th" },
      { name: "FAQIHA MAHFOOZ", marks: [59, 71, 42, 51, 97, 49, 72, 57], gender: "FEMALE", attendance: 94, position: "1st" },
      { name: "REEHA MUBEEN", marks: [65, 66, 38, 53, 99, 49, 66, 53], gender: "FEMALE", attendance: 99, position: "2nd" },
      { name: "HADIA KHURAM", marks: [64, 70, 38, 53, 90, 48, 55, 53], gender: "FEMALE", attendance: 95, position: "3rd" },
      { name: "ZAINAB FATIMA", marks: [52, 48, 43, 29, 84, 47, 32, 14], gender: "FEMALE", attendance: 84, position: "6th" },
      { name: "ABEEHA FATIMA", marks: [33, 27, 33, 22, 59, 38, 31, 27], gender: "FEMALE", attendance: 82, position: "9th" },
      { name: "CAROL SHAKEEL", marks: [50, 52, 40, 23, 47, null, 32, 31], gender: "FEMALE", attendance: 66, position: "8th" },
      { name: "MAHEM NOOR", marks: [47, 63, 44, 34, 91, 49, 44, 37], gender: "FEMALE", attendance: 81, position: "4th" },
      { name: "HAMNA ABID", marks: [34, 39, 28, 21, 64, 29, 31, 15], gender: "FEMALE", attendance: 76, position: "10th" }
    ]
  },
  {
    grade: "NINE",
    section: "ROSE",
    category: "SSC_I",
    incharge: "ESHA MUNIR",
    examType: "PHASE_1",
    examCategory: "PHASE_TEST",
    subjects: ["ISLAMIAT", "TARJUMA TUL QURAN", "URDU", "ENGLISH", "PHYSICS", "CHEMISTRY", "MATH", "BIOLOGY", "COMPUTER"],
    students: [
      { name: "M. SAAD KHOKHAR", marks: [86, 45, 58, 50, 53, 46, 30, null, 41], gender: "MALE", attendance: 100, position: "2nd" },
      { name: "MUHAMMAD UMAIR", marks: [84, 47, 57, 44, 52, 23, 28, null, 44], gender: "MALE", attendance: 100, position: "3rd" },
      { name: "M. SUBHAN AZHAR", marks: [81, 39, 56, 45, 54, 50, 45, null, 45], gender: "MALE", attendance: 100, position: "1st" },
      { name: "M. FAIZAN ADNAN", marks: [63, 35, 50, 27, 23, 14, 30, 27, null], gender: "MALE", attendance: 100, position: "4th" }
    ]
  },
  {
    grade: "NINE",
    section: "TULIP",
    category: "SSC_I",
    incharge: "SHAGUFTA TAWAKUL",
    examType: "PHASE_1",
    examCategory: "PHASE_TEST",
    subjects: ["ENGLISH", "MATHEMATICS", "URDU", "PHYSICS", "CHEMISTRY", "ISLAMIYAT/اخلاقیات", "BIOLOGY", "TARJAMA-TUL-QURAN", "COMPUTER"],
    students: [
      { name: "ANISHA ZUBAIR", marks: [43, 50, 69, 44, 38, 95, null, 48, 44], gender: "FEMALE", attendance: 100, position: "5th" },
      { name: "RAMEEN FATIMA", marks: [70, 74, 70, 60, 58, 96, 59, 49, null], gender: "FEMALE", attendance: 100, position: "1st" },
      { name: "MALAIKA FAROOQ", marks: [68, 71, 68, 60, 54, 98, null, 50, 48], gender: "FEMALE", attendance: 100, position: "1st" },
      { name: "AYESHA QAISAR", marks: [54, 58, 55, 57, 44, 87, null, 44, 46], gender: "FEMALE", attendance: 100, position: "4th" },
      { name: "MINAHAL FATIMA", marks: [42, 0, 68, 59, 49, 99, 57, 50, null], gender: "FEMALE", attendance: 100, position: "6th" },
      { name: "AREEBA TAHIR", marks: [null, null, 62, 45, 40, 82, null, 47, 46], gender: "FEMALE", attendance: 100, position: "7th" },
      { name: "ZEEMAL FATIMA", marks: [53, 42, 66, 53, 44, 87, 43, 49, null], gender: "FEMALE", attendance: 100, position: "5th" },
      { name: "AROUSH FATIMA", marks: [64, 56, 69, 59, 53, 97, 57, 50, null], gender: "FEMALE", attendance: 100, position: "2nd" },
      { name: "UROOJ AKBAR", marks: [47, 60, 69, 48, 47, 92, 38, 49, null], gender: "FEMALE", attendance: 100, position: "4th" },
      { name: "EMAN SHAKEEL", marks: [56, 64, 65, 60, 47, 50, 57, null, null], gender: "FEMALE", attendance: 100, position: "3rd" },
      { name: "AREEBA IJAZ", marks: [30, 18, 57, null, 22, 74, 23, 44, null], gender: "FEMALE", attendance: 100, position: "8th" }
    ]
  },
  {
    grade: "TEN",
    section: "ROSE",
    category: "SSC_II",
    incharge: "M. REHAN YOUNUS",
    examType: "PHASE_1",
    examCategory: "PHASE_TEST",
    subjects: ["Pak. Studies", "TARJUMA TUL QURAN", "URDU", "ENGLISH", "PHYSICS/PHYSICAL EDUCATION", "CHEMISTRY/ G.SCIENCE", "MATH", "COMPUTER/ _x000D_ISL. ELECTIVE"],
    students: [
      { name: "FAIZAN ALI", marks: [68, 49, 46, 36, 37, 33, 56, 36], gender: "MALE", attendance: 100, position: "4th" },
      { name: "SUBHAN ALI", marks: [62, 43, 32, 33, 42, 33, 56, 39], gender: "MALE", attendance: 100, position: "6th" },
      { name: "REHAN AKHTAR", marks: [80, 47, 68, 59, 56, 56, 64, 50], gender: "MALE", attendance: 100, position: "1st" },
      { name: "AMEER HAMZA", marks: [28, 21, 22, 19, 27, 11, 25, 15], gender: "MALE", attendance: 100, position: "9th" },
      { name: "M. AHMAD", marks: [49, 38, 46, 38, 36, 39, 49, 47], gender: "MALE", attendance: 100, position: "5th" },
      { name: "M.MAHIR YAR", marks: [45, 43, 40, 17, 32, 33, 35, 30], gender: "MALE", attendance: 100, position: "8th" },
      { name: "M.ABDULLAH", marks: [45, 46, 38, 49, 53, 54, 51, 43], gender: "MALE", attendance: 100, position: "3rd" },
      { name: "M.SUBHAN JAMIL", marks: [45, 26, 43, 16, 48, 55, 71, 44], gender: "MALE", attendance: 100, position: "7th" },
      { name: "M. SHUJA AHMED", marks: [84, 50, 63, 41, 54, 54, 53, 47], gender: "MALE", attendance: 100, position: "2nd" }
    ]
  },
  {
    grade: "TEN",
    section: "TULIP",
    category: "SSC_II",
    incharge: "FAIZA MUSHTAQ",
    examType: "PHASE_1",
    examCategory: "PHASE_TEST",
    subjects: ["PAK-STUDIES", "TARJUMA TUL QURAN", "URDU", "ENGLISH", "PHYSICS", "CHEMISTRY", "BIOLOGY", "MATH", "COMPUTER"],
    students: [
      { name: "ATEEQA NOREEN", marks: [97, 49, 69, 59, 56, 58, 56, 62, null], gender: "FEMALE", attendance: 100, position: "2nd" },
      { name: "JANNAT SHAHZAD", marks: [70, 46, 59, 30, 40, 51, 31, 59, null], gender: "FEMALE", attendance: 100, position: "5th" },
      { name: "NOOR  FATIMA", marks: [null, null, null, null, null, null, null, null, null], gender: "FEMALE", attendance: 100, position: "" },
      { name: "HIRA TARIQ", marks: [55, 41, 56, 25, 29, 29, null, 42, 33], gender: "FEMALE", attendance: 100, position: "7th" },
      { name: "SAIRA NASIR", marks: [79, 49, 52, 49, 38, 42, null, 51, 47], gender: "FEMALE", attendance: 100, position: "4th" },
      { name: "UMAMA SHAHBAZ", marks: [56, 44, 43, 41, 52, 51, 30, 59, null], gender: "FEMALE", attendance: 100, position: "6th" },
      { name: "MOMNA MANSHA", marks: [95, 50, 68, 66, 60, 58, null, 72, 49], gender: "FEMALE", attendance: 100, position: "1st" },
      { name: "ARMAAN ANSAR", marks: [68, 49, 64, 59, 57, 44, 54, 42, null], gender: "FEMALE", attendance: 100, position: "3rd" }
    ]
  }
];

const nameTranslationMap = {
  "Play Group": {
    "JANNAT NAZIA": "JANNAT NAZIA",
    "HARRAM NOOR": "HARRAM NOOR",
    "M.ALI IJAZ": "MUHAMMAD ALI IJAZ",
    "M.AREESH": "M.AREESH",
    "M.AHMED": "M.AHMED",
    "AYESHA ALI": "AYESHA ALI",
    "EMAN FATIMA": "EMAN FATIMA",
    "M.AHMED UMAR": "MUHAMMAD AHMED UMAR  ",
    "M.ARHAM USMAN": "M.ARHAM USMAN",
    "ANAS IRFAN": "MUHAMMAD ANAS IRFAN",
    "MIRHA TANVEER": "MIRHA TANVEER",
    "HAROON NASIR": "HAROON NASIR",
    "ABRESH ZAIN": "ABREESH ZAIN",
    "HARAM FATIMA": "HARAM FATIMA",
    "MIRHA WARIS": "MIRHA WARIS",
    "ARSHIA NOOR": "ARSHIA NOOR",
    "M.IRTAZA ASFAND": "M.IRTAZA ASFAND",
    "KHADIJA RANI": "KHADIJA RANI",
  },
  "Nursery": {
    "HARRAM SHEHZADI": "HARAM SHEHZADI",
    "HUZAIMA MUBARAK": "HUZAIMA MUBARIK",
    "M. AZAAN": "M. Azaan",
    "AYAN ANSAR": "M. AYAN ANSAR",
  },
  "Prep": {
    "M. AHMAD AKBAR": "M. AHMAD AKBAR",
    "JANNAT SHAHZADI": "JANNAT SHAHZADI",
    "HUZAIFA MUBARAK": "HUZAIFA MUBARAK CHATTHA",
    "MUHAMMAD AHMAD": "MUHAMMAD AHMAD",
    "ZAINAB ABU BAKAR": "ZAINAB ABU BAKAR",
    "TARFA HANIA": "TARFA HANIA",
    "SHAZIL BILAL": "SHAZIL BILAL",
    "CHASHMAN JALAL": "CHASHMAN JALAL",
    "UMAIR TANVEER": "M.UMAIR",
    "M.HASHIM": "MUHAMMAD HASHIM",
    "SEERAT FATIMA": "SEERAT FATIMA",
    "M.HASHIM CHEEMA": "M.HASHIM CHEEMA",
  },
  "Class One": {
    "DAMAN FATIMA": "DAMAN FATIMA",
    "ANAYA NAVEED": "ANAYA NAVEED",
    "M.ARHAM": "M.ARHAM",
  },
  "Class Two": {
    "M. AHMAD": "MUHAMMAD AHMAD",
    "M. FURQAN": "M. FURQAN",
    "M.AYYAN ALI": "MUHAMMAD AYYAN ALI",
    "HARRAM FATIMA": "HARAM FATIMA",
    "RAFIA ABU BAKAR": "RAFIA ABU BAKAR",
    "AYAT NOOR": "AYAT NOOR",
  },
  "Class Three": {
    "ANAYA ZUBAIR": "ANAYA ZUBAIR",
    "MUHAMMAD ARYAN": "MUHAMMAD ARYAN  ",
    "ALEEHA AKBAR": "ALEEHA AKBAR",
    "FATIMA ZAHRA": "FATIMA ZAHRA",
    "M.HUSNAIN": "HUSNAIN",
  },
  "Class Four": {
    "HAIDER ALI": "Haider Ali",
    "M. HUZAIFA": "M. HUZAIFA",
    "ASIFA ANSAR": "ASIFA ANSAR",
    "AMINA RANI": "AMINA RANI",
    "SULEMAN": "M. SULEMAN AFZAL",
    "INTASHAL FATIMA": "INTASHAL FATIMA",
    "M.ARSLAN": "SAQLAIN",
    "M.SAQLAIN": "SAQLAIN",
    "M.IBRAHIM": "MUHAMMAD IBRAHIM  ",
  },
  "Class Five": {
    "M.MATEEN AHMAD": "MATEEN AHMAD",
    "NOOR FATIMA IJAZ": "NOOR FATIMA",
    "ALI SHER KHALID": "ALI SHAIR CHEEMA",
    "M. HASHIM AKBAR": "M. HASHIM AKBAR",
    "M.RIZWAN": "MUUHAMMAD RIZWAN",
    "M.ADNAN": "MUHAMMAD ADNAN",
    "HUSSAIN ALI": "HUSSAIN ALI",
  },
  "Class Six": {
    "ADAN QAISAR": "ADAN QAISAR",
    "AIMA ZAHRA": "AIMA ZAHRA",
    "ALI AHMAD": "ALI AHMAD  ",
    "M.AHMAD HASSAN": "M.AHMAD SHAHID",
    "M.HUZAIF FAREED": "M.HUZAIFA FAREED",
    "FAIZ-UL-RASOOL": "FAIZ-UL-RASOOL",
  },
  "Class Seven": {
    "ZAINAB SHAHZADI": "ZAINAB SHAHZADI",
    "MOMINA RANI": "MOMINA RANI",
    "JAWAD AHMED": "JAWAD AHMAD CHEEMA",
    "M.UMAIS ABU BAKAR": " M UMAIS ABU BAKER",
    "M.ABDULLAH": "M.ABDULLAH",
    "ABDUL REHEEM": "ABDUL RAHEEM  ",
    "M.ANAS": "M.ANAS",
    "HANAN SHAHID": "ABDUL HANAN SHAHID",
    "MUHAMMAD AHMAD": "MUHAMMAD AHMAD",
    "HASSAN ALI": "HASSAN ALI",
    "ABDUL REHMAN": "ABDUL REHMAN",
    "AYAN IJAZ": "AYAN IJAZ",
  },
  "9th Junior": {
    "ARHAM DASTGIR": "ARHAM DASTGIR",
    "M. BILAL CHEEMA": "M. BILAL CHEEMA",
    "M. AWAIS CHEEMA": "M. AWAIS CHEEMA",
    "IMRAN ALI": "IMRAN ALI",
    "UMAR": "UMAR",
    "HAWA TEHREEM": "HAWA TEHREEM",
    "HARRAM SHEHZAD": "HARRAM SHAHZAD",
    "MISHAAL FATIMA": "MISHAAL FATIMA",
    "FAQIHA MAHFOOZ": "FAQIHA MAHFOOZ",
    "REEHA MUBEEN": "REEHA MUBEEN",
    "HADIA KHURAM": "HADIA KHURAM",
    "ZAINAB FATIMA": "ZAINAB FATIMA",
    "ABEEHA FATIMA": "ABEEHA FATIMA",
    "CAROL SHAKEEL": "CAROL SHAKEEL",
    "MAHEM NOOR": "MAHEM NOOR",
    "HAMNA ABID": "HAMNA ABID",
  },
  "9th Senior": {
    "M. SAAD KHOKHAR": "M. SAAD KHOKHAR",
    "MUHAMMAD UMAIR": "UMAIR DASTGIR",
    "M. SUBHAN AZHAR": "MUHAMMAD SUBHAN",
    "M. FAIZAN ADNAN": "M. FAIZAN ADNAN",
    "ANISHA ZUBAIR": "ANISHA ZUBBAIR",
    "RAMEEN FATIMA": "RAMEEN FATIMA",
    "MALAIKA FAROOQ": "MALAIKA FAROOQ",
    "AYESHA QAISAR": "AYESHA QAISAR",
    "MINAHAL FATIMA": "MINAHAL FATIMA",
    "AREEBA TAHIR": "AREEBA TAHIR",
    "ZEEMAL FATIMA": "ZEEMAL FATIMA",
    "AROUSH FATIMA": "AROOSH FATIMA",
    "UROOJ AKBAR": "AROOJ AKBAR",
    "EMAN SHAKEEL": "EMAN SHAKEEL",
    "AREEBA IJAZ": "AREEBA IJAZ",
  },
  "10th": {
    "FAIZAN ALI": "FAIZAN ALI",
    "SUBHAN ALI": "SUBHAN ALI",
    "REHAN AKHTAR": "REHAN AKHTAR",
    "AMEER HAMZA": "Ameer Hamza",
    "M. AHMAD": "M. AHMAD",
    "M.MAHIR YAR": "M.MAHIR YAR",
    "M.ABDULLAH": "M.ABDULLAH",
    "M.SUBHAN JAMIL": "M.SUBHAN JAMIL",
    "M. SHUJA AHMED": "M. SHUJA AHMED",
    "ATEEQA NOREEN": "Ateeqa Noureen",
    "JANNAT SHAHZADI": "Jannat Shahzad",
    "NOOR  FATIMA": "NOOR FATIMA",
    "HIRA TARIQ": "HIRA TARIQ",
    "SAIRA NASIR": "SAIRA NASIR",
    "UMAMA SHAHBAZ": "UMAMA SHAHBAZ",
    "MOMNA MANSHA": "MOMINA",
    "ARMAAN ANSAR": "M. Arman Unsar",
  }
};

function cleanName(name) {
  return name.toUpperCase().replace(/[^A-Z]/g, "");
}

function getBaseName(name) {
  let clean = cleanName(name);
  if (clean.startsWith("MUHAMMAD")) {
    clean = "M" + clean.slice(8);
  }
  return clean;
}

function findStudentInDatabase(seedName, gradeName, allDbStudents) {
  const dbName = nameTranslationMap[gradeName]?.[seedName] || seedName;
  const targetBases = [getBaseName(dbName), getBaseName(seedName)];

  return allDbStudents.find(s => {
    const sBase = getBaseName(s.studentName);
    return targetBases.includes(sBase);
  });
}

function findEmployeeByName(name, employees) {
  const normName = name.toLowerCase().trim().replace(/\s+/g, ' ');
  const manualMappings = {
    "zoya naz": "zoya naz",
    "mahnoor khalid": "mahnoor khalid",
    "farah naz": "farah naz",
    "mehrab tabasum": "mehrab tabassum",
    "mehrab tabassum": "mehrab tabassum",
    "malaika shahid": "maliaka shahid",
    "kinza noreen": "kinza noreen",
    "laraib sultan": "laraib sultan",
    "hamna razzaq": "hamna razzaq",
    "sir waqas": "waqas ahmad",
    "waqas ahmad": "waqas ahmad",
    "aminah noor": "aminah noor",
    "esha munir": "esha munir",
    "shagufta tawakul": "shagufta akbar",
    "shagufta akbar": "shagufta akbar",
    "m. rehan younus": "muhammad rehan younas",
    "muhammad rehan younas": "muhammad rehan younas",
    "faiza mushtaq": "faiza mushtaq",
  };

  const targetName = manualMappings[normName] || normName;

  return employees.find(emp => {
    const dbName = emp.employeeName.toLowerCase().trim().replace(/\s+/g, ' ');
    return dbName === targetName || dbName === normName || dbName.replace(/[^a-z]/g, '') === targetName.replace(/[^a-z]/g, '');
  });
}

function getSubjectMaxMarks(className, subjectName) {
  const normName = subjectName.toUpperCase().trim();
  const normClass = className.toUpperCase().trim();

  if (normName.includes("QURAN")) {
    return 50;
  }

  if (normClass.includes("PLAY GROUP") || normClass.includes("NURSERY") || normClass.includes("PREP")) {
    if (
      normName.includes("READING") ||
      normName.includes("ORAL") ||
      normName === "DRAWING" ||
      normName.includes("WORLD AROUND ME")
    ) {
      return 50;
    }
  }

  if (normName === "DRAWING" || normName === "COMPUTER" || normName === "PRIMARY HISTORY" || normName === "GEOGRAPHY" || normName === "HISTORY") {
    return 50;
  }

  return 100;
}

async function main() {
  console.log('--- Starting Raw SQL Seed Script ---');
  await client.connect();
  console.log('Connected to database.');

  const empRes = await client.query('SELECT "employeeId", "employeeName", "registrationNumber" FROM "Employees"');
  const allDbEmployees = empRes.rows;

  const stuAllRes = await client.query('SELECT "studentId", "studentName", "registrationNumber" FROM "Students"');
  const allDbStudents = stuAllRes.rows;

  await client.query('BEGIN');
  try {
    // 0. Clean up existing session 2025-2026 data to ensure idempotent run
    console.log('Cleaning up existing session 2025-2026 data...');
    await client.query(`
      DELETE FROM "ReportCardDetail" WHERE "reportCardId" IN (
        SELECT "reportCardId" FROM "ReportCard" WHERE "sessionId" = 'session-2025-2026'
      )
    `);
    await client.query('DELETE FROM "ReportCard" WHERE "sessionId" = \'session-2025-2026\'');
    await client.query(`
      DELETE FROM "Marks" WHERE "examId" IN (
        SELECT "examId" FROM "Exam" WHERE "sessionId" = 'session-2025-2026'
      )
    `);
    await client.query('DELETE FROM "Exam" WHERE "sessionId" = \'session-2025-2026\'');

    await client.query('DELETE FROM "StudentClass" WHERE "sessionId" = \'session-2025-2026\'');
    await client.query('DELETE FROM "ClassSubject" WHERE "sessionId" = \'session-2025-2026\'');
    
    // Clean up empty classes (classes with no students in any session)
    console.log('Cleaning up empty classes...');
    const emptyClassesRes = await client.query(`
      SELECT "classId" FROM "Grades" g
      WHERE NOT EXISTS (
        SELECT 1 FROM "StudentClass" sc WHERE sc."classId" = g."classId"
      )
    `);
    const emptyClassIds = emptyClassesRes.rows.map(r => r.classId);
    if (emptyClassIds.length > 0) {
      const placeholders = emptyClassIds.map((_, idx) => `$${idx + 1}`).join(', ');
      
      // Delete ClassSubject
      await client.query(`DELETE FROM "ClassSubject" WHERE "classId" IN (${placeholders})`, emptyClassIds);
      
      // Delete Timetable
      await client.query(`DELETE FROM "Timetable" WHERE "classId" IN (${placeholders})`, emptyClassIds);
      
      // Delete Exam-dependent Marks, ExamDatesheet, and Exam
      const examsRes = await client.query(`SELECT "examId" FROM "Exam" WHERE "classId" IN (${placeholders})`, emptyClassIds);
      const examIds = examsRes.rows.map(r => r.examId);
      if (examIds.length > 0) {
        const examPlaceholders = examIds.map((_, idx) => `$${idx + 1}`).join(', ');
        await client.query(`DELETE FROM "Marks" WHERE "examId" IN (${examPlaceholders})`, examIds);
        await client.query(`DELETE FROM "ExamDatesheet" WHERE "examId" IN (${examPlaceholders})`, examIds);
        await client.query(`DELETE FROM "Exam" WHERE "classId" IN (${placeholders})`, emptyClassIds);
      }
      
      // Delete ReportCardDetail and ReportCard
      const rcRes = await client.query(`SELECT "reportCardId" FROM "ReportCard" WHERE "classId" IN (${placeholders})`, emptyClassIds);
      const reportCardIds = rcRes.rows.map(r => r.reportCardId);
      if (reportCardIds.length > 0) {
        const rcPlaceholders = reportCardIds.map((_, idx) => `$${idx + 1}`).join(', ');
        await client.query(`DELETE FROM "ReportCardDetail" WHERE "reportCardId" IN (${rcPlaceholders})`, reportCardIds);
        await client.query(`DELETE FROM "ReportCard" WHERE "classId" IN (${placeholders})`, emptyClassIds);
      }
      
      // Delete PromotionHistory
      await client.query(`DELETE FROM "PromotionHistory" WHERE "fromClassId" IN (${placeholders}) OR "toClassId" IN (${placeholders})`, emptyClassIds);
      
      // Delete StudentAttendance
      await client.query(`DELETE FROM "StudentAttendance" WHERE "classId" IN (${placeholders})`, emptyClassIds);
      
      // Delete BulkPromotionBatch
      await client.query(`DELETE FROM "BulkPromotionBatch" WHERE "fromClassId" IN (${placeholders}) OR "toClassId" IN (${placeholders})`, emptyClassIds);
      
      // Delete Grades
      await client.query(`DELETE FROM "Grades" WHERE "classId" IN (${placeholders})`, emptyClassIds);
      console.log(`Deleted ${emptyClassIds.length} empty classes.`);
    }
    console.log('Cleanup completed.');

    // 1. Create or Find Session "2025-2026"
    await client.query(`
      INSERT INTO "Sessions" ("sessionId", "sessionName", "sessionFrom", "sessionTo", "isActive")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("sessionId") DO UPDATE SET "isActive" = EXCLUDED."isActive"
    `, ['session-2025-2026', '2025-2026', '2025', '2026', true]);
    console.log('Session seeded.');

    // 2. Load standard Exam Types
    await client.query(`
      INSERT INTO "ExamType" ("examTypeId", "name", "category", "description", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT ("examTypeId") DO NOTHING
    `, ['exam-type-standard', 'Standard Examination', 'STANDARD', 'Regular Term Final Exams']);

    await client.query(`
      INSERT INTO "ExamType" ("examTypeId", "name", "category", "description", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT ("examTypeId") DO NOTHING
    `, ['exam-type-phase', 'Phase Test Examination', 'PHASE_TEST', 'Phase Examinations']);
    console.log('Exam types seeded.');

    const createdEmployees = {};
    const createdSubjects = {};

    for (const classData of dataset) {
      console.log(`Processing class: ${classData.grade} (${classData.section})`);

      // Find Incharge Employee
      let employeeId = createdEmployees[classData.incharge];
      if (!employeeId) {
        const match = findEmployeeByName(classData.incharge, allDbEmployees);
        if (match) {
          employeeId = match.employeeId;
        } else {
          throw new Error(`Incharge employee not found in database: ${classData.incharge}`);
        }
        createdEmployees[classData.incharge] = employeeId;
      }

      // Create Grade (Class)
      const classKey = `${classData.grade}-${classData.section}`.replace(/\s+/g, '-').toLowerCase();
      const classId = `class-${classKey}`;
      await client.query(`
        INSERT INTO "Grades" ("classId", "grade", "section", "category", "fee")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT ("classId") DO NOTHING
      `, [classId, classData.grade, classData.section, classData.category, 1500]);

      // Create subjects and ClassSubjects
      const subjectRecords = {};
      for (const subName of classData.subjects) {
        let subjectId = createdSubjects[subName];
        if (!subjectId) {
          const subKey = subName.replace(/[\/\s+]/g, '-').toLowerCase();
          subjectId = `sub-${subKey}`;
          await client.query(`
            INSERT INTO "Subject" ("subjectId", "subjectName", "createdAt", "updatedAt")
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT ("subjectId") DO NOTHING
          `, [subjectId, subName]);
          createdSubjects[subName] = subjectId;
        }
        subjectRecords[subName] = subjectId;

        // ClassSubject link
        const csId = `cs-${classId}-${subjectId}`.toLowerCase();
        await client.query(`
          INSERT INTO "ClassSubject" ("csId", "classId", "subjectId", "employeeId", "sessionId")
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT ("csId") DO NOTHING
        `, [csId, classId, subjectId, employeeId, 'session-2025-2026']);
      }

      // Create Exam
      const examId = `exam-${classId}-${classData.examType.toLowerCase()}`;
      const examTypeId = classData.examCategory === 'STANDARD' ? 'exam-type-standard' : 'exam-type-phase';
      await client.query(`
        INSERT INTO "Exam" ("examId", "examTypeId", "sessionId", "classId", "examTypeEnum", "startDate", "endDate", "totalMarks", "passingMarks", "status", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, '2025-11-01', '2025-11-30', 100, 40, 'COMPLETED', NOW(), NOW())
        ON CONFLICT ("examId") DO NOTHING
      `, [examId, examTypeId, 'session-2025-2026', classId, classData.examType]);

      // Find students
      for (const student of classData.students) {
        const studentRecord = findStudentInDatabase(student.name, classData.grade, allDbStudents);
        if (!studentRecord) {
          throw new Error(`Student not found in database: ${student.name} (grade: ${classData.grade})`);
        }
        const studentId = studentRecord.studentId;

        // Link student to class
        const scId = `sc-${studentId}-${classId}`;
        await client.query(`
          INSERT INTO "StudentClass" ("scId", "studentId", "classId", "sessionId")
          VALUES ($1, $2, $3, $4)
          ON CONFLICT ("scId") DO NOTHING
        `, [scId, studentId, classId, 'session-2025-2026']);

        // Insert marks
        let totalObtained = 0;
        let totalMax = 0;
        let marksEntered = false;
        const marksDetailsToCreate = [];

        for (let i = 0; i < classData.subjects.length; i++) {
          const subName = classData.subjects[i];
          const markVal = student.marks[i];

          if (markVal === null) {
            continue;
          }

          const maxMark = getSubjectMaxMarks(classData.grade, subName);
          totalObtained += markVal;
          totalMax += maxMark;
          marksEntered = true;

          const subjectId = subjectRecords[subName];
          const csId = `cs-${classId}-${subjectId}`.toLowerCase();
          const marksId = `marks-${examId}-${studentId}-${subjectId}`;

          await client.query(`
            INSERT INTO "Marks" ("marksId", "examId", "studentId", "subjectId", "classSubjectId", "obtainedMarks", "totalMarks", "uploadedBy", "uploadedAt", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
            ON CONFLICT ("examId", "studentId", "subjectId") DO UPDATE SET "obtainedMarks" = EXCLUDED."obtainedMarks", "totalMarks" = EXCLUDED."totalMarks"
          `, [marksId, examId, studentId, subjectId, csId, markVal, maxMark, employeeId]);

          marksDetailsToCreate.push({
            subjectId,
            totalMarks: maxMark,
            obtainedMarks: markVal,
            percentage: maxMark > 0 ? (markVal / maxMark) * 100 : 0
          });
        }

        // If marks entered, create ReportCard
        if (marksEntered) {
          const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
          const status = percentage >= 40 ? 'PASSED' : 'FAILED';
          const rcId = `rc-${examId}-${studentId}`;

          await client.query(`
            INSERT INTO "ReportCard" ("reportCardId", "studentId", "examId", "sessionId", "classId", "totalObtainedMarks", "totalMaxMarks", "percentage", "status", "generatedAt", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
            ON CONFLICT ("reportCardId") DO UPDATE SET "totalObtainedMarks" = EXCLUDED."totalObtainedMarks", "totalMaxMarks" = EXCLUDED."totalMaxMarks", "percentage" = EXCLUDED."percentage", "status" = EXCLUDED."status"
          `, [rcId, studentId, examId, 'session-2025-2026', classId, totalObtained, totalMax, parseFloat(percentage.toFixed(2)), status]);

          // Insert ReportCardDetail
          for (const detail of marksDetailsToCreate) {
            const rcdId = `rcd-${rcId}-${detail.subjectId}`;
            const remarks = detail.percentage >= 80 ? 'Excellent' : detail.percentage >= 60 ? 'Good' : 'Needs Improvement';
            await client.query(`
              INSERT INTO "ReportCardDetail" ("reportCardDetailId", "reportCardId", "subjectId", "totalMarks", "obtainedMarks", "percentage", "remarks", "createdAt")
              VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
              ON CONFLICT ("reportCardDetailId") DO UPDATE SET "obtainedMarks" = EXCLUDED."obtainedMarks", "percentage" = EXCLUDED."percentage", "remarks" = EXCLUDED."remarks"
            `, [rcdId, rcId, detail.subjectId, detail.totalMarks, detail.obtainedMarks, parseFloat(detail.percentage.toFixed(2)), remarks]);
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('Database successfully seeded!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding transaction failed and rolled back:', err);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

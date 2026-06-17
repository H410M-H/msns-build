import { 
  PrismaClient, 
  ClassCategory, 
  Designation, 
  Gender, 
  MaritalStatus, 
  ExamCategory, 
  ExamTypeEnum, 
  ExamStatus, 
  ReportCardStatus 
} from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

interface StudentInput {
  name: string;
  marks: (number | null)[];
  gender: 'MALE' | 'FEMALE';
  attendance: number;
  position: string;
}

interface ClassInput {
  grade: string;
  section: string;
  category: ClassCategory;
  incharge: string;
  examType: ExamTypeEnum;
  examCategory: ExamCategory;
  subjects: string[];
  students: StudentInput[];
}

const dataset: ClassInput[] = [
  {
    grade: "Play Group",
    section: "ROSE",
    category: ClassCategory.Montessori,
    incharge: "ZOYA NAZ",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "Nursery",
    section: "ROSE",
    category: ClassCategory.Montessori,
    incharge: "MAHNOOR KHALID",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
    subjects: ["ENGLISH WRITTEN", "ENGLISH ORAL", "URDU WRITTEN", "URDU ORAL", "MATH WRITTEN", "MATH ORAL", "DRAWING", "SPOKEN ENGLISH", "ISLAMIYAT", "WORLD AROUND ME", "SUMMER VACTION TASK"],
    students: [
      { name: "HARRAM SHEHZADI", marks: [97, 49, 100, 50, 99, 50, 50, 100, 100, 50, 98], gender: "FEMALE", attendance: 83, position: "1st" },
      { name: "HUZAIMA MUBARAK", marks: [95, 48, 99, 49, 98, 47, 50, 100, 100, 50, 97], gender: "FEMALE", attendance: 75, position: "2nd" },
      { name: "M. AZAAN", marks: [97, 48, 100, 50, 99, 49, 50, 100, 100, 50, 98], gender: "MALE", attendance: 71, position: "1st" },
      { name: "AYAN ANSAR", marks: [95, 47, 99, 49, 99, 47, 50, 100, 84, 50, 98], gender: "MALE", attendance: 69, position: "3rd" }
    ]
  },
  {
    grade: "Prep",
    section: "NONE",
    category: ClassCategory.Montessori,
    incharge: "FARAH NAZ",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "Class One",
    section: "ROSE",
    category: ClassCategory.Primary,
    incharge: "MEHRAB TABASSUM",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
    subjects: ["ENGLISH A", "ENGLISH B", "URDU A", "URDU B", "MATH", "MERI DUNYIA", "DRAWING", "SPOKEN ENGLISH", "ISLAMIYAT", "COMPUTER", "PRIMARY HISTORY", "SUMMER VACATION TASK"],
    students: [
      { name: "DAMAN FATIMA", marks: [99, 100, 99, 96, 100, 100, 50, 100, 98, 50, 48, 96], gender: "FEMALE", attendance: 87, position: "1st" },
      { name: "ANAYA NAVEED", marks: [88, 86, 94, 76, 97, 98, 46, 98, 86, 44, 46, 92], gender: "FEMALE", attendance: 89, position: "2nd" },
      { name: "M.ARHAM", marks: [57, 54, 87, 45, 77, 98, 37, 93, 64, 40, 35, 0], gender: "MALE", attendance: 73, position: "4th" }
    ]
  },
  {
    grade: "Class Two",
    section: "ROSE",
    category: ClassCategory.Primary,
    incharge: "MEHRAB TABASUM",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "Class Three",
    section: "NONE",
    category: ClassCategory.Primary,
    incharge: "MALAIKA SHAHID",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "Class Four",
    section: "NONE",
    category: ClassCategory.Primary,
    incharge: "MALAIKA SHAHID",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "Class Five",
    section: "NONE",
    category: ClassCategory.Primary,
    incharge: "KINZA NOREEN",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "Class Six",
    section: "ROSE",
    category: ClassCategory.Middle,
    incharge: "LARAIB SULTAN",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "Class Seven",
    section: "ROSE",
    category: ClassCategory.Middle,
    incharge: "HAMNA RAZZAQ",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "9th Junior",
    section: "ROSE",
    category: ClassCategory.SSC_I,
    incharge: "SIR WAQAS",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "9th Junior",
    section: "TULIP",
    category: ClassCategory.SSC_I,
    incharge: "AMINAH NOOR",
    examType: ExamTypeEnum.FINAL,
    examCategory: ExamCategory.STANDARD,
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
    grade: "9th Senior",
    section: "ROSE",
    category: ClassCategory.SSC_I,
    incharge: "ESHA MUNIR",
    examType: ExamTypeEnum.PHASE_1,
    examCategory: ExamCategory.PHASE_TEST,
    subjects: ["ISLAMIAT", "TARJUMA TUL QURAN", "URDU", "ENGLISH", "PHYSICS", "CHEMISTRY", "MATH", "BIOLOGY", "COMPUTER"],
    students: [
      { name: "M. SAAD KHOKHAR", marks: [86, 45, 58, 50, 53, 46, 30, null, 41], gender: "MALE", attendance: 100, position: "2nd" },
      { name: "MUHAMMAD UMAIR", marks: [84, 47, 57, 44, 52, 23, 28, null, 44], gender: "MALE", attendance: 100, position: "3rd" },
      { name: "M. SUBHAN AZHAR", marks: [81, 39, 56, 45, 54, 50, 45, null, 45], gender: "MALE", attendance: 100, position: "1st" },
      { name: "M. FAIZAN ADNAN", marks: [63, 35, 50, 27, 23, 14, 30, 27, null], gender: "MALE", attendance: 100, position: "4th" }
    ]
  },
  {
    grade: "9th Senior",
    section: "TULIP",
    category: ClassCategory.SSC_I,
    incharge: "SHAGUFTA TAWAKUL",
    examType: ExamTypeEnum.PHASE_1,
    examCategory: ExamCategory.PHASE_TEST,
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
    grade: "10th",
    section: "ROSE",
    category: ClassCategory.SSC_II,
    incharge: "M. REHAN YOUNUS",
    examType: ExamTypeEnum.PHASE_1,
    examCategory: ExamCategory.PHASE_TEST,
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
    grade: "10th",
    section: "TULIP",
    category: ClassCategory.SSC_II,
    incharge: "FAIZA MUSHTAQ",
    examType: ExamTypeEnum.PHASE_1,
    examCategory: ExamCategory.PHASE_TEST,
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

function getSubjectMaxMarks(className: string, subjectName: string): number {
  const normName = subjectName.toUpperCase().trim();
  const normClass = className.toUpperCase().trim();

  // Quran subjects always 50 marks
  if (normName.includes("QURAN")) {
    return 50;
  }

  // Reading / oral / drawing / world around me subjects in Montessori (PG, Nursery, Prep) are 50 marks
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

  // Primary & Middle specific 50 mark subjects
  if (normName === "DRAWING" || normName === "COMPUTER" || normName === "PRIMARY HISTORY" || normName === "GEOGRAPHY" || normName === "HISTORY") {
    return 50;
  }

  return 100;
}

const nameTranslationMap: { [gradeName: string]: { [seedName: string]: string } } = {
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

function mapDatasetToDbClass(grade: string, section: string) {
  const normGrade = grade.toUpperCase().trim();
  const normSection = section.toUpperCase().trim();

  let targetGrade = normGrade;
  let targetSection = normSection;

  if (normGrade === "PLAY GROUP") targetGrade = "PLAYGROUP";
  else if (normGrade === "CLASS ONE") targetGrade = "ONE";
  else if (normGrade === "CLASS TWO") targetGrade = "TWO";
  else if (normGrade === "CLASS THREE") { targetGrade = "THREE"; targetSection = "ROSE"; }
  else if (normGrade === "CLASS FOUR") { targetGrade = "FOUR"; targetSection = "ROSE"; }
  else if (normGrade === "CLASS FIVE") { targetGrade = "FIVE"; targetSection = "ROSE"; }
  else if (normGrade === "CLASS SIX") targetGrade = "SIX";
  else if (normGrade === "CLASS SEVEN") targetGrade = "SEVEN";
  else if (normGrade === "PREP") targetSection = "ROSE";
  else if (normGrade === "9TH JUNIOR") targetGrade = "PRE 9";
  else if (normGrade === "9TH SENIOR") targetGrade = "NINE";
  else if (normGrade === "10TH") targetGrade = "TEN";

  return { grade: targetGrade, section: targetSection };
}

async function generateStudentReg(usersCount: number) {
  const currentYear = "25";
  const numStr = (usersCount + 1).toString().padStart(4, "0");
  return {
    registrationNumber: `MSN-S-${currentYear}-${numStr}`,
    admissionNumber: `S${currentYear}${numStr}`,
    username: `MSN-STUDENT-${currentYear}-${numStr}`,
    email: `S${currentYear}${numStr}@msns.edu.pk`
  };
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

let allStudents: any[] = [];
let sessionStudentClasses: any[] = [];

async function findStudentInDatabase(seedName: string, gradeName: string, classId: string, sessionId: string) {
  const dbName = nameTranslationMap[gradeName]?.[seedName] || seedName;
  const targetBases = [getBaseName(dbName), getBaseName(seedName)];

  const getMatches = () => {
    return allStudents.filter(s => {
      const sBase = getBaseName(s.studentName);
      return targetBases.includes(sBase);
    });
  };

  const matches = getMatches();
  if (matches.length === 0) return null;

  // 1. Same name student already assigned to this class in this session
  const inClass = matches.find(s =>
    sessionStudentClasses.some(sc => sc.studentId === s.studentId && sc.classId === classId)
  );
  if (inClass) return inClass;

  // 2. Same name student who is NOT assigned in this session
  const unassigned = matches.find(s =>
    !sessionStudentClasses.some(sc => sc.studentId === s.studentId)
  );
  if (unassigned) return unassigned;

  // 3. Same name student anywhere
  return matches[0];
}

function findEmployeeByName(name: string, employees: any[]) {
  const normName = name.toLowerCase().trim().replace(/\s+/g, ' ');
  
  const manualMappings: { [key: string]: string } = {
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

async function main() {
  console.log('--- Starting Seed Script (Targeting Session 2025-26) ---');

  // 1. Fetch Session "2025-26"
  const session = await prisma.sessions.upsert({
    where: { sessionId: 'cmf2holu40002jv041uwwcqpv' },
    update: { isActive: true },
    create: {
      sessionId: 'cmf2holu40002jv041uwwcqpv',
      sessionName: '2025-26',
      sessionFrom: '2025-04-01T00:00:00.000Z',
      sessionTo: '2026-04-01T00:00:00.000Z',
      isActive: true,
    },
  });
  console.log(`Using Session: ${session.sessionName} (ID: ${session.sessionId})`);

  // Load existing records in memory to optimize lookups and resolve latency
  allStudents = await prisma.students.findMany();
  sessionStudentClasses = await prisma.studentClass.findMany({
    where: { sessionId: session.sessionId }
  });

  // 2. Load standard Exam Types
  const examTypeStandard = await prisma.examType.upsert({
    where: { examTypeId: 'exam-type-standard' },
    update: {},
    create: {
      examTypeId: 'exam-type-standard',
      name: 'Standard Examination',
      category: ExamCategory.STANDARD,
      description: 'Regular Term Final Exams'
    }
  });

  const examTypePhase = await prisma.examType.upsert({
    where: { examTypeId: 'exam-type-phase' },
    update: {},
    create: {
      examTypeId: 'exam-type-phase',
      name: 'Phase Test Examination',
      category: ExamCategory.PHASE_TEST,
      description: 'Phase Examinations'
    }
  });

  const createdEmployees: { [name: string]: string } = {};
  const createdSubjects: { [name: string]: string } = {};
  const allDbEmployees = await prisma.employees.findMany();

  for (const classData of dataset) {
    const mappedClass = mapDatasetToDbClass(classData.grade, classData.section);
    console.log(`Processing class: ${classData.grade} (${classData.section}) -> Mapped to DB: ${mappedClass.grade} (${mappedClass.section})`);

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

    // Find the Grade (Class) record in the DB
    const gradeRecord = await prisma.grades.findFirst({
      where: {
        grade: { equals: mappedClass.grade, mode: 'insensitive' },
        section: { equals: mappedClass.section, mode: 'insensitive' }
      }
    });

    if (!gradeRecord) {
      throw new Error(`Grade not found in database: ${mappedClass.grade} ${mappedClass.section}`);
    }

    // Create subjects and ClassSubject assignments
    const subjectRecords: { [name: string]: string } = {};

    for (const subName of classData.subjects) {
      let subjectId = createdSubjects[subName];
      if (!subjectId) {
        const subKey = subName.replace(/[\/\s+]/g, '-').toLowerCase();
        const sub = await prisma.subject.upsert({
          where: { subjectId: `sub-${subKey}` },
          update: {},
          create: {
            subjectId: `sub-${subKey}`,
            subjectName: subName,
          }
        });
        subjectId = sub.subjectId;
        createdSubjects[subName] = subjectId;
      }
      subjectRecords[subName] = subjectId;

      // Assign to Class (ClassSubject)
      const csKey = `${gradeRecord.classId}-${subjectId}`.toLowerCase();
      await prisma.classSubject.upsert({
        where: { csId: `cs-${csKey}` },
        update: {},
        create: {
          csId: `cs-${csKey}`,
          classId: gradeRecord.classId,
          subjectId: subjectId,
          employeeId: employeeId,
          sessionId: session.sessionId,
        }
      });
    }

    // Create Exam
    const examKey = `exam-${gradeRecord.classId}-${classData.examType.toLowerCase()}`;
    const examTypeId = classData.examCategory === ExamCategory.STANDARD ? examTypeStandard.examTypeId : examTypePhase.examTypeId;
    const examRecord = await prisma.exam.upsert({
      where: { examId: examKey },
      update: {},
      create: {
        examId: examKey,
        examTypeId: examTypeId,
        sessionId: session.sessionId,
        classId: gradeRecord.classId,
        examTypeEnum: classData.examType,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-30'),
        status: ExamStatus.COMPLETED,
      }
    });

    // Create/Find students and marks
    for (const student of classData.students) {
      let studentRecord = await findStudentInDatabase(student.name, classData.grade, gradeRecord.classId, session.sessionId);

      if (!studentRecord) {
        throw new Error(`Student not found in database: ${student.name} (grade: ${classData.grade})`);
      }

      // Link Student to Class (StudentClass)
      const studentClassAssignments = await prisma.studentClass.findMany({
        where: {
          studentId: studentRecord.studentId,
          sessionId: session.sessionId
        }
      });

      let correctClassAssignment = studentClassAssignments.find(sc => sc.classId === gradeRecord.classId);
      
      if (!correctClassAssignment) {
        if (studentClassAssignments.length > 0) {
          console.log(`Reassigning student ${student.name} (${studentRecord.studentName}) to ${gradeRecord.grade} ${gradeRecord.section}`);
          await prisma.feeStudentClass.deleteMany({
            where: { studentClassId: { in: studentClassAssignments.map(sc => sc.scId) } }
          });
          await prisma.studentClass.deleteMany({
            where: { scId: { in: studentClassAssignments.map(sc => sc.scId) } }
          });
          sessionStudentClasses = sessionStudentClasses.filter(
            sc => !studentClassAssignments.some(deleted => deleted.scId === sc.scId)
          );
        }

        const scKey = `sc-${studentRecord.studentId}-${gradeRecord.classId}`;
        correctClassAssignment = await prisma.studentClass.create({
          data: {
            scId: scKey,
            studentId: studentRecord.studentId,
            classId: gradeRecord.classId,
            sessionId: session.sessionId,
          }
        });
        sessionStudentClasses.push(correctClassAssignment);
      }

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
        const csKey = `${gradeRecord.classId}-${subjectId}`.toLowerCase();

        await prisma.marks.upsert({
          where: {
            examId_studentId_subjectId: {
              examId: examRecord.examId,
              studentId: studentRecord.studentId,
              subjectId: subjectId,
            }
          },
          update: {
            obtainedMarks: markVal,
            totalMarks: maxMark,
          },
          create: {
            examId: examRecord.examId,
            studentId: studentRecord.studentId,
            subjectId: subjectId,
            classSubjectId: `cs-${csKey}`,
            obtainedMarks: markVal,
            totalMarks: maxMark,
            uploadedBy: employeeId,
          }
        });

        marksDetailsToCreate.push({
          subjectId: subjectId,
          totalMarks: maxMark,
          obtainedMarks: markVal,
          percentage: maxMark > 0 ? (markVal / maxMark) * 100 : 0,
        });
      }

      // Generate ReportCard
      if (marksEntered) {
        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
        const status = percentage >= 45 ? ReportCardStatus.PASSED : ReportCardStatus.FAILED;

        const rcKey = `rc-${examRecord.examId}-${studentRecord.studentId}`;
        const reportCard = await prisma.reportCard.upsert({
          where: { reportCardId: rcKey },
          update: {
            totalObtainedMarks: totalObtained,
            totalMaxMarks: totalMax,
            percentage: parseFloat(percentage.toFixed(2)),
            status: status,
          },
          create: {
            reportCardId: rcKey,
            studentId: studentRecord.studentId,
            examId: examRecord.examId,
            sessionId: session.sessionId,
            classId: gradeRecord.classId,
            totalObtainedMarks: totalObtained,
            totalMaxMarks: totalMax,
            percentage: parseFloat(percentage.toFixed(2)),
            status: status,
          }
        });

        for (const detail of marksDetailsToCreate) {
          const rcdKey = `rcd-${reportCard.reportCardId}-${detail.subjectId}`;
          await prisma.reportCardDetail.upsert({
            where: { reportCardDetailId: rcdKey },
            update: {
              obtainedMarks: detail.obtainedMarks,
              percentage: parseFloat(detail.percentage.toFixed(2)),
            },
            create: {
              reportCardDetailId: rcdKey,
              reportCardId: reportCard.reportCardId,
              subjectId: detail.subjectId,
              totalMarks: detail.totalMarks,
              obtainedMarks: detail.obtainedMarks,
              percentage: parseFloat(detail.percentage.toFixed(2)),
              remarks: detail.percentage >= 80 ? 'Excellent' : detail.percentage >= 60 ? 'Good' : 'Needs Improvement',
            }
          });
        }
      }
    }
  }

  console.log('--- Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



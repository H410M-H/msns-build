// This utility helps retrieve current student and class information
// In production, replace with actual session management

export async function getCurrentStudentInfo() {
  try {
    // This would typically come from your session/auth provider
    // For now, returning a structure that matches the schema
    return {
      studentId: process.env.NEXT_PUBLIC_STUDENT_ID ?? "default-student",
      classId: process.env.NEXT_PUBLIC_CLASS_ID ?? "default-class",
      studentName: process.env.NEXT_PUBLIC_STUDENT_NAME ?? "Student",
    };
  } catch (error) {
    console.error("Error getting student info:", error);
    return {
      studentId: "default-student",
      classId: "default-class",
      studentName: "Student",
    };
  }
}

export function getStudentIdFromUrl(url: string): string {
  const params = new URL(url).searchParams;
  return params.get("studentId") ?? "default-student";
}

export function getClassIdFromUrl(url: string): string {
  const params = new URL(url).searchParams;
  return params.get("classId") ?? "default-class";
}

import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { BookOpen, GraduationCap, Shield } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const userReg = (usersCount: number, accountType: string) => {
  const currentYear = dayjs().year().toString().slice(-2);
  return {
    accountId: `MSN-${accountType[0]}-${currentYear}-${(usersCount + 1).toString().padStart(4, "0")}`,
    username: `MSN-${accountType}-${currentYear}-${(usersCount + 1).toString().padStart(4, "0")}`,
    email: `${accountType[0]}${currentYear}${(usersCount + 1).toString().padStart(4, "0")}@msns.edu.pk`,
    admissionNumber: `${accountType[0]}${currentYear}${(usersCount + 1).toString().padStart(4, "0")}`,
  };
};

export function getParentagePrefix(gender?: string | null): "D/O" | "S/O" {
  if (!gender) return "S/O";
  const g = gender.trim().toUpperCase();
  return g === "FEMALE" || g === "F" ? "D/O" : "S/O";
}

export const checkIsAdmin = (accountType: string) => {
  const a = accountType?.toUpperCase();
  return (
    a === "ADMIN" ||
    a === "PRINCIPAL" ||
    a === "HEAD" ||
    a === "CLERK"
  );
};

export const checkIsTeacher = (accountType: string) => {
  const a = accountType?.toUpperCase();
  return a === "TEACHER" || a === "FACULTY";
};

export const checkIsStudent = (accountType: string) => {
  return accountType?.toUpperCase() === "STUDENT";
};

export const getRoleTheme = (accountType: string) => {
  const a = accountType?.toUpperCase();
  if (a === "ADMIN" || a === "PRINCIPAL" || a === "HEAD")
    return {
      gradient: "from-purple-500 to-indigo-600",
      bg: "from-purple-50 to-indigo-100",
      icon: Shield,
      badge: a === "ADMIN" ? "Administrator" : a === "PRINCIPAL" ? "Principal" : "Head",
    };
  else if (a === "CLERK")
    return {
      gradient: "from-teal-500 to-emerald-600",
      bg: "from-teal-50 to-emerald-100",
      icon: Shield,
      badge: "Clerk",
    };
  else if (a === "TEACHER" || a === "FACULTY")
    return {
      gradient: "from-blue-500 to-cyan-600",
      bg: "from-blue-50 to-cyan-100",
      icon: GraduationCap,
      badge: "Educator",
    };
  else if (a === "STUDENT")
    return {
      gradient: "from-green-500 to-emerald-600",
      bg: "from-green-50 to-emerald-100",
      icon: BookOpen,
      badge: "Student",
    };
  return {
    gradient: "from-green-500 to-emerald-600",
    bg: "from-green-50 to-emerald-100",
    icon: BookOpen,
    badge: "Student",
  };
};

export const getStatTheme = (accountType: string) => {
  const a = accountType?.toUpperCase();
  if (
    a === "ADMIN" ||
    a === "PRINCIPAL" ||
    a === "HEAD" ||
    a === "CLERK"
  )
    return {
      gradient: "from-purple-500 to-indigo-600",
      bg: "from-purple-50 to-indigo-100",
    };
  else if (a === "TEACHER" || a === "FACULTY")
    return {
      gradient: "from-blue-500 to-cyan-600",
      bg: "from-blue-50 to-cyan-100",
    };
  else if (a === "STUDENT")
    return {
      gradient: "from-green-500 to-emerald-600",
      bg: "from-green-50 to-emerald-100",
    };
  return {
    gradient: "from-green-500 to-emerald-600",
    bg: "from-green-50 to-emerald-100",
  };
};

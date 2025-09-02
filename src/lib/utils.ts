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

export const checkIsAdmin = (accountType: string) => {
  return (
    accountType === "ADMIN" ||
    accountType === "PRINCIPAL" ||
    accountType === "HEAD"
  );
};

export const checkIsTeacher = (accountType: string) => {
  return accountType === "TEACHER" || accountType === "FACULTY";
};

export const checkIsStudent = (accountType: string) => {
  return accountType === "STUDENT";
};

export const getRoleTheme = (accountType: string) => {
  if (
    accountType === "ADMIN" ||
    accountType === "PRINCIPAL" ||
    accountType === "HEAD"
  )
    return {
      gradient: "from-purple-500 to-indigo-600",
      bg: "from-purple-50 to-indigo-100",
      icon: Shield,
      badge: "Administrator",
    };
  else if (accountType === "TEACHER" || accountType === "FACULTY")
    return {
      gradient: "from-blue-500 to-cyan-600",
      bg: "from-blue-50 to-cyan-100",
      icon: GraduationCap,
      badge: "Educator",
    };
  else if (accountType === "STUDENT")
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

export const getStatTheme = (accountType: string)=> {
  if (
    accountType === "ADMIN" ||
    accountType === "PRINCIPAL" ||
    accountType === "HEAD"
  )
    return {
      gradient: "from-purple-500 to-indigo-600",
      bg: "from-purple-50 to-indigo-100",
    };
  else if (accountType === "TEACHER" || accountType === "FACULTY")
    return {
      gradient: "from-blue-500 to-cyan-600",
      bg: "from-blue-50 to-cyan-100",
    };
  else if (accountType === "STUDENT")
    return {
      gradient: "from-green-500 to-emerald-600",
      bg: "from-green-50 to-emerald-100",
    };
  return {
    gradient: "from-green-500 to-emerald-600",
    bg: "from-green-50 to-emerald-100",
  };
}

import { clsx, type ClassValue } from "clsx"
import dayjs from "dayjs"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const userReg = (usersCount:number,accountType:string) => {
  const currentYear = dayjs().year().toString().slice(-2)
  return {
      accountId: `MSN-${accountType[0]}-${currentYear}-${(usersCount + 1).toString().padStart(4, "0")}`,
      username: `MSN-${accountType}-${currentYear}-${(usersCount + 1).toString().padStart(4, "0")}`,
      email: `${accountType[0]}${currentYear}${(usersCount + 1).toString().padStart(4, "0")}@msns.edu.pk`,
      admissionNumber: `${accountType[0]}${currentYear}${(usersCount + 1).toString().padStart(4, "0")}`,
     
    }
}
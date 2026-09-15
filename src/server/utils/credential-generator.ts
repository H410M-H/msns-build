import dayjs from "dayjs";
import type { Prisma, PrismaClient, Designation } from "@prisma/client";

export interface UniqueCredentials {
  accountId: string;
  username: string;
  email: string;
  admissionNumber: string;
}

/**
 * Generates guaranteed collision-free credentials for an employee.
 * Checks both Employees and User tables, finding the true maximum sequence number
 * and verifying that none of registrationNumber, admissionNumber, username, or email collide.
 */
export async function generateUniqueEmployeeCredentials(
  tx: PrismaClient | Prisma.TransactionClient,
  designation: string,
): Promise<UniqueCredentials> {
  const currentYear = dayjs().year().toString().slice(-2);
  const typeChar = designation[0]?.toUpperCase() ?? "E";
  const admPrefix = `${typeChar}${currentYear}`; // e.g., T26, A26, C26
  const regPrefix = `MSN-${typeChar}-${currentYear}-`; // e.g., MSN-T-26-
  const userPrefix = `MSN-${designation.toUpperCase()}-${currentYear}-`; // e.g., MSN-TEACHER-26-
  const emailPrefix = `${typeChar.toLowerCase()}${currentYear}`; // e.g., t26

  // Fetch all existing employee records matching this prefix
  const [existingEmployees, existingUsers] = await Promise.all([
    tx.employees.findMany({
      where: {
        OR: [
          { admissionNumber: { startsWith: admPrefix } },
          { registrationNumber: { startsWith: regPrefix } },
          { admissionNumber: { startsWith: typeChar } },
        ],
      },
      select: {
        admissionNumber: true,
        registrationNumber: true,
      },
    }),
    tx.user.findMany({
      where: {
        OR: [
          { username: { startsWith: userPrefix } },
          { email: { startsWith: emailPrefix } },
          { accountId: { startsWith: regPrefix } },
        ],
      },
      select: {
        username: true,
        email: true,
        accountId: true,
      },
    }),
  ]);

  let maxSeq = 0;

  const extractSeq = (val: string | null | undefined, prefixStr: string) => {
    if (!val) return;
    if (val.toUpperCase().startsWith(prefixStr.toUpperCase())) {
      const rest = val.slice(prefixStr.length).split("@")[0] ?? "";
      const num = parseInt(rest, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  };

  for (const emp of existingEmployees) {
    extractSeq(emp.admissionNumber, admPrefix);
    extractSeq(emp.registrationNumber, regPrefix);
  }

  for (const u of existingUsers) {
    extractSeq(u.username, userPrefix);
    extractSeq(u.email, emailPrefix);
    extractSeq(u.accountId, regPrefix);
  }

  // Find candidate and verify complete uniqueness against all unique constraints
  let seq = maxSeq + 1;
  while (true) {
    const padded = seq.toString().padStart(4, "0");
    const accountId = `${regPrefix}${padded}`;
    const username = `${userPrefix}${padded}`;
    const email = `${emailPrefix}${padded}@msns.edu.pk`.toLowerCase();
    const admissionNumber = `${admPrefix}${padded}`;

    const [empByAdm, empByReg, userByUname, userByEmail] = await Promise.all([
      tx.employees.findUnique({ where: { admissionNumber } }),
      tx.employees.findUnique({ where: { registrationNumber: accountId } }),
      tx.user.findUnique({ where: { username } }),
      tx.user.findUnique({ where: { email } }),
    ]);

    if (!empByAdm && !empByReg && !userByUname && !userByEmail) {
      return {
        accountId,
        username,
        email,
        admissionNumber,
      };
    }
    seq++;
  }
}

/**
 * Generates guaranteed collision-free credentials for a student.
 */
export async function generateUniqueStudentCredentials(
  tx: PrismaClient | Prisma.TransactionClient,
): Promise<UniqueCredentials> {
  const currentYear = dayjs().year().toString().slice(-2);
  const typeChar = "S";
  const admPrefix = `S${currentYear}`; // e.g., S26
  const regPrefix = `MSN-S-${currentYear}-`; // e.g., MSN-S-26-
  const userPrefix = `MSN-STUDENT-${currentYear}-`; // e.g., MSN-STUDENT-26-
  const emailPrefix = `s${currentYear}`; // e.g., s26

  const [existingStudents, existingUsers] = await Promise.all([
    tx.students.findMany({
      where: {
        OR: [
          { admissionNumber: { startsWith: admPrefix } },
          { registrationNumber: { startsWith: regPrefix } },
          { admissionNumber: { startsWith: typeChar } },
        ],
      },
      select: {
        admissionNumber: true,
        registrationNumber: true,
      },
    }),
    tx.user.findMany({
      where: {
        OR: [
          { username: { startsWith: userPrefix } },
          { email: { startsWith: emailPrefix } },
          { accountId: { startsWith: regPrefix } },
        ],
      },
      select: {
        username: true,
        email: true,
        accountId: true,
      },
    }),
  ]);

  let maxSeq = 0;

  const extractSeq = (val: string | null | undefined, prefixStr: string) => {
    if (!val) return;
    if (val.toUpperCase().startsWith(prefixStr.toUpperCase())) {
      const rest = val.slice(prefixStr.length).split("@")[0] ?? "";
      const num = parseInt(rest, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  };

  for (const st of existingStudents) {
    extractSeq(st.admissionNumber, admPrefix);
    extractSeq(st.registrationNumber, regPrefix);
  }

  for (const u of existingUsers) {
    extractSeq(u.username, userPrefix);
    extractSeq(u.email, emailPrefix);
    extractSeq(u.accountId, regPrefix);
  }

  let seq = maxSeq + 1;
  while (true) {
    const padded = seq.toString().padStart(4, "0");
    const accountId = `${regPrefix}${padded}`;
    const username = `${userPrefix}${padded}`;
    const email = `${emailPrefix}${padded}@msns.edu.pk`.toLowerCase();
    const admissionNumber = `${admPrefix}${padded}`;

    const [stByAdm, stByReg, userByUname, userByEmail] = await Promise.all([
      tx.students.findUnique({ where: { admissionNumber } }),
      tx.students.findUnique({ where: { registrationNumber: accountId } }),
      tx.user.findUnique({ where: { username } }),
      tx.user.findUnique({ where: { email } }),
    ]);

    if (!stByAdm && !stByReg && !userByUname && !userByEmail) {
      return {
        accountId,
        username,
        email,
        admissionNumber,
      };
    }
    seq++;
  }
}

/**
 * Generates guaranteed collision-free credentials for any user account type.
 */
export async function generateUniqueUserCredentials(
  tx: PrismaClient | Prisma.TransactionClient,
  accountType: string,
): Promise<UniqueCredentials> {
  if (accountType.toUpperCase() === "STUDENT") {
    return generateUniqueStudentCredentials(tx);
  }
  return generateUniqueEmployeeCredentials(tx, accountType);
}

/**
 * Reliably finds the Employee record associated with the current session user.
 * Supports matching via registrationNumber (accountId), employeeId (user.id),
 * admissionNumber, and active staff fallbacks.
 */
export async function getSessionEmployee(ctx: {
  db: PrismaClient | Prisma.TransactionClient;
  session?: {
    user?: {
      id?: string;
      accountId?: string;
      username?: string;
      email?: string;
      accountType?: string;
    };
  } | null;
}) {
  const user = ctx.session?.user;
  if (!user) return null;

  const orConditions: Prisma.EmployeesWhereInput[] = [];

  if (user.accountId) {
    orConditions.push({ registrationNumber: user.accountId });
    orConditions.push({ admissionNumber: user.accountId });
  }
  if (user.id) {
    orConditions.push({ employeeId: user.id });
    orConditions.push({ admissionNumber: user.id });
  }
  if (user.username) {
    orConditions.push({ registrationNumber: user.username });
  }
  if (user.email) {
    const emailPrefix = user.email.split("@")[0]?.toUpperCase();
    if (emailPrefix) {
      orConditions.push({ admissionNumber: emailPrefix });
      orConditions.push({ registrationNumber: emailPrefix });
    }
  }

  let employee = null;
  if (orConditions.length > 0) {
    employee = await ctx.db.employees.findFirst({
      where: { OR: orConditions },
    });
  }

  // Fallback for administrators / management if an explicit employee profile wasn't found
  if (!employee && user.accountType && ["ADMIN", "PRINCIPAL", "HEAD", "CLERK"].includes(user.accountType.toUpperCase())) {
    employee = await ctx.db.employees.findFirst({
      where: {
        designation: user.accountType as Designation,
        status: "Active",
      },
    });
    if (!employee) {
      employee = await ctx.db.employees.findFirst({
        where: {
          designation: { in: ["ADMIN", "PRINCIPAL", "HEAD"] },
          status: "Active",
        },
      });
    }
  }

  return employee;
}

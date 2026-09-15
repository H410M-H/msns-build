import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { hash } from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { generateUniqueUserCredentials } from "~/server/utils/credential-generator";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { z } from "zod";
import type { Designation } from "@prisma/client";

const ALLOWED_ROLES = ["ADMIN", "PRINCIPAL", "HEAD", "CLERK"];

const registerSchema = z.object({
  accountType: z.enum([
    "STUDENT",
    "FACULTY",
    "ADMIN",
    "WORKER",
    "HEAD",
    "PRINCIPAL",
    "CLERK",
    "TEACHER",
    "NONE",
    "ALL",
  ]),
  password: z.string().min(6).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized — you must be signed in" },
        { status: 401 },
      );
    }

    // Role-based authorization — ADMIN, PRINCIPAL, HEAD, and CLERK can register users
    const userRole = session.user.accountType;
    if (!ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { message: "Forbidden — you do not have permission to register new users" },
        { status: 403 },
      );
    }

    // Validate input with Zod
    const body: unknown = await request.json();
    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const input = parseResult.data;
    const password = await hash(input.password, 10);
    const account = await db.$transaction(async (tx) => {
      const userInfo = await generateUniqueUserCredentials(tx, input.accountType);
      return tx.user.create({
        data: {
          accountId: userInfo.accountId,
          username: userInfo.username,
          email: userInfo.email,
          password,
          accountType: input.accountType as Designation,
        },
        select: {
          id: true,
          accountId: true,
          username: true,
          email: true,
          accountType: true,
        },
      });
    });
    return NextResponse.json(
      { message: "User added successfully", data: account },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof TRPCError) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else if (error instanceof TRPCClientError) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else if (error instanceof SyntaxError) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 400 },
    );
  }
}

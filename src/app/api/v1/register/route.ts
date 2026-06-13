import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { hash } from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { userReg } from "~/lib/utils";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { z } from "zod";

const ALLOWED_ROLES = ["ADMIN", "PRINCIPAL"];

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

    // Role-based authorization — only ADMIN and PRINCIPAL can register users
    const userRole = session.user.accountType;
    if (!ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { message: "Forbidden — only administrators can register new users" },
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
    const usersCount = await db.user.count({
      where: {
        accountType: input.accountType as AccountTypeEnum,
      },
    });
    const userInfo = userReg(usersCount, input.accountType);
    const password = await hash(input.password, 10);
    const account = await db.user.create({
      data: {
        accountId: userInfo.accountId,
        username: userInfo.username,
        email: userInfo.email,
        password,
        accountType: input.accountType as AccountTypeEnum,
      },
      select: {
        id: true,
        accountId: true,
        username: true,
        email: true,
        accountType: true,
        // Explicitly exclude password from response
      },
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

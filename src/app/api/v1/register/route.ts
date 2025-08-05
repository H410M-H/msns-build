import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { hash } from "bcrypt";
import { type NextRequest, NextResponse } from "next/server";
import { userReg } from "~/lib/utils";
import { db } from "~/server/db";


type RequestProps = {
    accountType: string
    password: string
}

export async function POST(request: NextRequest) {
    try {
        const input = await request.json() as RequestProps;
        const usersCount = await db.user.count({
            where: {
                accountType: input.accountType as AccountTypeEnum,
            }
        })
        const userInfo = userReg(usersCount, input.accountType)
        const password = await hash(input.password, 10)
        const account = await db.user.create({
            data: {
                accountId: userInfo.accountId,
                username: userInfo.username,
                email: userInfo.email,
                password,
                accountType: input.accountType as AccountTypeEnum,
            },
        })
        return NextResponse.json({ message: 'User added successfully', data: account }, { status: 202 });
    } catch (error) {

        if (error instanceof TRPCError) {
            console.error(error.message)
            return NextResponse.json({ message: error.message }, { status: 400 })
        }
        else if (error instanceof TRPCClientError) {
            console.error(error.message)
            return NextResponse.json({ message: error.message }, { status: 400 })
        }
        else if (error instanceof SyntaxError) {
            console.error(error.message)
            return NextResponse.json({ message: error.message }, { status: 400 })
        }
        console.error(error)
        return NextResponse.json({ message: 'Something went wrong' }, { status: 400 })
    }
}
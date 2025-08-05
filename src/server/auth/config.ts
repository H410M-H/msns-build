import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { compare } from "bcrypt";


declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            email: string;
            username: string;
            accountId: string;
            accountType: string;
        } & DefaultSession["user"];
    }

    interface User {
        username: string;
        accountId: string;
        accountType: string
    }
}

export const authConfig = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "Enter your email"
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Enter your password"
                },
            },
            async authorize(credentials) {
                try {
                    const { email, password } = credentials as { email: string, password: string };
                    if (!email || !password) {
                        throw new Error("Missing credentials");
                    }
                    const account = await db.user.findUnique({
                        where: { email: email.toLowerCase() },
                    })
                    if(!account) throw new Error("No account found with this email");

                    const isValidPassword = await compare(password, account.password);
                    if (!isValidPassword) throw new Error("Invalid password");

                    return {    
                        id:account.id,
                        email: account.email,
                        username: account.username,
                        accountId: account.accountId,
                        accountType: account.accountType,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    email: token.email!,
                    accountType: token.accountType as string,
                    accountId: token.accountId as string,
                    username: token.username as string,
                }
            };
        },
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    email: user.email,
                    accountId: user.accountId,
                    accountType: user.accountType,
                    username: user.username
                };
            }
            return token;
        },
    },
    pages: {
        signIn: '/',
        error: '/auth/error',

    },
    trustHost:true,
} satisfies NextAuthConfig;
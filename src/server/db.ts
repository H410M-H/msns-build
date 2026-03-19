import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const createPrismaClient = () => {
  const nodeEnv = (env as Record<string, unknown>).NODE_ENV as string | undefined;
  return new PrismaClient({
    log:
      nodeEnv === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

const nodeEnv = (env as Record<string, unknown>).NODE_ENV as string | undefined;
if ((nodeEnv ?? "production") !== "production") globalForPrisma.prisma = db;

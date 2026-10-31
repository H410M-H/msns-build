import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

let _prismaInstance: ReturnType<typeof createPrismaClient> | undefined;

function getPrismaInstance(): ReturnType<typeof createPrismaClient> {
  if (!_prismaInstance) {
    _prismaInstance = globalForPrisma.prisma ?? createPrismaClient();
    if (env.NODE_ENV !== "production") {
      globalForPrisma.prisma = _prismaInstance;
    }
  }
  return _prismaInstance;
}

export const db = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get(_target, prop, receiver) {
    const instance = getPrismaInstance();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

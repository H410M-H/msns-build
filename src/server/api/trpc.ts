import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();

  return {
    db,
    session,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

/** Enforces that the user is logged in and possesses one of the allowed account types/roles. */
export const enforceRoles = (allowedRoles: string[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const role = (ctx.session.user.accountType ?? "").toUpperCase();
    if (!allowedRoles.includes(role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Action not permitted for role ${role}`,
      });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

/** Procedures restricted by role */
export const adminProcedure = protectedProcedure.use(
  enforceRoles(["ADMIN"])
);

export const managementProcedure = protectedProcedure.use(
  enforceRoles(["ADMIN", "PRINCIPAL", "HEAD"])
);

export const clerkProcedure = protectedProcedure.use(
  enforceRoles(["ADMIN", "PRINCIPAL", "HEAD", "CLERK"])
);

export const teacherProcedure = protectedProcedure.use(
  enforceRoles(["ADMIN", "PRINCIPAL", "HEAD", "TEACHER"])
);

export const staffProcedure = protectedProcedure.use(
  enforceRoles(["ADMIN", "PRINCIPAL", "HEAD", "CLERK", "TEACHER"])
);


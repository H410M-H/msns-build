import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

interface SessionProps {
  sessionId: string;
  sessionName: string;
  sessionFrom: Date;
  sessionTo: Date;
  isActive: boolean;
}

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)");

export const SessionRouter = createTRPCRouter({
  getActiveSession: publicProcedure.query<SessionProps | null>(async ({ ctx }) => {
    try {
      const session = await ctx.db.sessions.findFirst({
        where: { isActive: true },
        select: {
          sessionId: true,
          sessionName: true,
          sessionFrom: true,
          sessionTo: true,
          isActive: true,
        },
      });

      if (!session) return null;

      return {
        sessionId: session.sessionId,
        sessionName: session.sessionName,
        sessionFrom: new Date(session.sessionFrom),
        sessionTo: new Date(session.sessionTo),
        isActive: session.isActive,
      };
    } catch (error) {
      console.error("Error in getActiveSession:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve active session",
      });
    }
  }),

  getSessions: publicProcedure.query<SessionProps[]>(async ({ ctx }) => {
    try {
      const sessions = await ctx.db.sessions.findMany({
        orderBy: { sessionFrom: "desc" },
        select: {
          sessionId: true,
          sessionName: true,
          sessionFrom: true,
          sessionTo: true,
          isActive: true,
        },
      });

      return sessions.map(s => ({
        sessionId: s.sessionId,
        sessionName: s.sessionName,
        sessionFrom: new Date(s.sessionFrom),
        sessionTo: new Date(s.sessionTo),
        isActive: s.isActive,
      }));
    } catch (error) {
      console.error("Error in getSessions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve sessions",
      });
    }
  }),

  getGroupedSessions: publicProcedure.query<{ year: string; sessions: SessionProps[] }[]>(
    async ({ ctx }) => {
      try {
        const sessions = await ctx.db.sessions.findMany({
          orderBy: { sessionFrom: "desc" },
          select: {
            sessionId: true,
            sessionName: true,
            sessionFrom: true,
            sessionTo: true,
            isActive: true,
          },
        });

        const groupedSessions = sessions.reduce((acc, session) => {
          const sessionFromDate = new Date(session.sessionFrom);
          const year = sessionFromDate.getFullYear().toString();
          const existing = acc.get(year) ?? [];
          
          acc.set(year, [...existing, {
            sessionId: session.sessionId,
            sessionName: session.sessionName,
            sessionFrom: new Date(session.sessionFrom),
            sessionTo: new Date(session.sessionTo),
            isActive: session.isActive,
          }]);
          
          return acc;
        }, new Map<string, SessionProps[]>());

        return Array.from(groupedSessions, ([year, sessions]) => ({
          year,
          sessions,
        }));
      } catch (error) {
        console.error("Error in getGroupedSessions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve grouped sessions",
        });
      }
    }
  ),

  createSession: publicProcedure
    .input(
      z.object({
        sessionName: z.string().min(1, "Session name is required"),
        sessionFrom: dateSchema,
        sessionTo: dateSchema,
      })
    )
    .mutation<SessionProps>(async ({ ctx, input }) => {
      try {
        // Validate that sessionFrom is before sessionTo
        const fromDate = new Date(input.sessionFrom);
        const toDate = new Date(input.sessionTo);
        
        if (fromDate >= toDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Session end date must be after start date",
          });
        }

        const newSession = await ctx.db.sessions.create({
          data: {
            sessionName: input.sessionName,
            sessionFrom: fromDate.toISOString(),
            sessionTo: toDate.toISOString(),
            isActive: false,
          },
          select: {
            sessionId: true,
            sessionName: true,
            sessionFrom: true,
            sessionTo: true,
            isActive: true,
          }
        });

        return {
          sessionId: newSession.sessionId,
          sessionName: newSession.sessionName,
          sessionFrom: new Date(newSession.sessionFrom),
          sessionTo: new Date(newSession.sessionTo),
          isActive: newSession.isActive,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("Error in createSession:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create session",
        });
      }
    }),

  deleteSessionsByIds: publicProcedure
    .input(z.object({ sessionIds: z.array(z.string().cuid()) }))
    .mutation<{ count: number }>(async ({ ctx, input }) => {
      try {
        // Prevent deleting active session
        const activeSession = await ctx.db.sessions.findFirst({
          where: { 
            sessionId: { in: input.sessionIds },
            isActive: true 
          },
        });

        if (activeSession) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete active session",
          });
        }

        const result = await ctx.db.sessions.deleteMany({
          where: { sessionId: { in: input.sessionIds } },
        });
        
        return { count: result.count };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("Error in deleteSessionsByIds:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete sessions",
        });
      }
    }),

  setActiveSession: publicProcedure
    .input(z.object({ sessionId: z.string().cuid() }))
    .mutation<SessionProps>(async ({ ctx, input }) => {
      try {
        await ctx.db.$transaction([
          ctx.db.sessions.updateMany({
            where: { isActive: true },
            data: { isActive: false },
          }),
          ctx.db.sessions.update({
            where: { sessionId: input.sessionId },
            data: { isActive: true },
            select: {
              sessionId: true,
              sessionName: true,
              sessionFrom: true,
              sessionTo: true,
              isActive: true,
            },
          })
        ]);

        const activatedSession = await ctx.db.sessions.findUniqueOrThrow({
          where: { sessionId: input.sessionId },
          select: {
            sessionId: true,
            sessionName: true,
            sessionFrom: true,
            sessionTo: true,
            isActive: true,
          },
        });

        return {
          sessionId: activatedSession.sessionId,
          sessionName: activatedSession.sessionName,
          sessionFrom: new Date(activatedSession.sessionFrom),
          sessionTo: new Date(activatedSession.sessionTo),
          isActive: activatedSession.isActive,
        };
      } catch (error) {
        console.error("Error in setActiveSession:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set active session",
        });
      }
    }),
});
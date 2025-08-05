import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { type Prisma } from '@prisma/client';
import { AttendeeStatusSchema, CreateEventSchema, EventStatusSchema, UpdateEventSchema } from '~/lib/event-schemas';
import { safeTransformEventForDatabase, safeTransformEventForFrontend, type FrontendEventData } from '~/lib/event-helpers';

export const EventRouter = createTRPCRouter({
  create: publicProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }): Promise<FrontendEventData> => {
      const eventData = safeTransformEventForDatabase(input);
      const event = await ctx.db.event.create({
        data: {
          ...eventData,
          User: { connect: { id: input.creatorId } },
          tags: input.tagIds
            ? {
                create: input.tagIds.map((tagId: string) => ({
                  tag: { connect: { id: tagId } },
                })),
              }
            : undefined,
          reminders: input.reminders
            ? {
                create: input.reminders.map((reminder) => ({
                  type: reminder.type,
                  minutesBefore: reminder.value,
                })),
              }
            : undefined,
          attendees: input.attendees
            ? {
                create: input.attendees.map((attendee) => ({
                  user: { connect: { id: attendee.userId } },
                  status: attendee.status,
                })),
              }
            : undefined,
        },
        include: {
          User: true,
          tags: { include: { tag: true } },
          attendees: { include: { user: true } },
          reminders: true,
        },
      });
      return safeTransformEventForFrontend(event);
    }),

  update: publicProcedure
    .input(UpdateEventSchema)
    .mutation(async ({ ctx, input }): Promise<FrontendEventData> => {
      const eventData = safeTransformEventForDatabase(input);
      const event = await ctx.db.event.update({
        where: { id: input.id },
        data: {
          ...eventData,
          User: { connect: { id: input.creatorId } },
          tags: input.tagIds
            ? {
                deleteMany: {},
                create: input.tagIds.map((tagId: string) => ({
                  tag: { connect: { id: tagId } },
                })),
              }
            : undefined,
          reminders: input.reminders
            ? {
                deleteMany: {},
                create: input.reminders.map((reminder) => ({
                  type: reminder.type,
                  minutesBefore: reminder.value,
                })),
              }
            : undefined,
          attendees: input.attendees
            ? {
                deleteMany: {},
                create: input.attendees.map((attendee) => ({
                  user: { connect: { id: attendee.userId } },
                  status: attendee.status,
                })),
              }
            : undefined,
        },
        include: {
          User: true,
          tags: { include: { tag: true } },
          attendees: { include: { user: true } },
          reminders: true,
        },
      });
      return safeTransformEventForFrontend(event);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, 'Event ID is required') }))
    .query(async ({ ctx, input }): Promise<FrontendEventData> => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.id },
        include: {
          User: true,
          tags: { include: { tag: true } },
          attendees: { include: { user: true } },
          reminders: true,
        },
      });
      if (!event) {
        throw new Error('Event not found');
      }
      return safeTransformEventForFrontend(event);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: EventStatusSchema.optional(),
        offset: z.number().int().nonnegative().default(0),
        limit: z.number().int().positive().default(10),
      })
    )
    .query(async ({ ctx, input }): Promise<{ events: FrontendEventData[]; total: number }> => {
      const where: Prisma.EventWhereInput = {
        AND: [
          input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: 'insensitive' } },
                  { description: { contains: input.search, mode: 'insensitive' } },
                  { location: { contains: input.search, mode: 'insensitive' } },
                ],
              }
            : {},
          input.status ? { status: input.status } : {},
        ],
      };

      const [events, total] = await Promise.all([
        ctx.db.event.findMany({
          where,
          include: {
            User: true,
            tags: { include: { tag: true } },
            attendees: { include: { user: true } },
            reminders: true,
          },
          skip: input.offset,
          take: input.limit,
        }),
        ctx.db.event.count({ where }),
      ]);

      return {
        events: events.map(safeTransformEventForFrontend),
        total,
      };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1, 'Event ID is required') }))
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      await ctx.db.event.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  updateAttendeeStatus: publicProcedure
    .input(
      z.object({
        eventId: z.string().min(1, 'Event ID is required'),
        userId: z.string().min(1, 'User ID is required'),
        status: AttendeeStatusSchema,
      })
    )
    .mutation(async ({ ctx, input }): Promise<{ userId: string; status: string }> => {
      const attendee = await ctx.db.attendee.upsert({
        where: {
          eventId_userId: { eventId: input.eventId, userId: input.userId },
        },
        update: { status: input.status },
        create: {
          eventId: input.eventId,
          userId: input.userId,
          status: input.status,
        },
        include: { user: true },
      });
      return { userId: attendee.userId, status: attendee.status };
    }),

  createTag: publicProcedure
    .input(z.object({ name: z.string().min(1, 'Tag name is required'), color: z.string().min(1, 'Tag color is required') }))
    .mutation(async ({ ctx, input }): Promise<{ id: string; name: string; color: string }> => {
      const tag = await ctx.db.tag.create({
        data: { name: input.name, color: input.color },
      });
      return { id: tag.id, name: tag.name, color: tag.color };
    }),

  getTags: publicProcedure
    .query(async ({ ctx }): Promise<{ id: string; name: string; color: string }[]> => {
      return ctx.db.tag.findMany();
    }),
});
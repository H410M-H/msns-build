import { z } from "zod";

export const EventStatusSchema = z.enum([
  "CONFIRMED",
  "TENTATIVE",
  "CANCELLED",
]);
export const ReminderTypeSchema = z.enum(["EMAIL", "PUSH", "SMS"]);
export const AttendeeStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "MAYBE",
]);
export const RecurrenceTypeSchema = z.enum([
  "NONE",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
]);
export const EventTypeSchema = z.enum([
  "MEETING",
  "WORKSHOP",
  "CONFERENCE",
  "TRAINING",
  "WEBINAR",
  "SOCIAL",
  "OTHER",
]);
export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const CreateEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDateTime: z.string().datetime({ offset: true }),
  endDateTime: z.string().datetime({ offset: true }),
  timezone: z.string().default("UTC"),
  location: z.string().optional(),
  isOnline: z.boolean().default(false),
  type: EventTypeSchema,
  priority: PrioritySchema,
  status: EventStatusSchema,
  recurring: RecurrenceTypeSchema,
  recurrenceEnd: z.string().datetime({ offset: true }).optional(),
  maxAttendees: z.number().int().positive().optional(),
  isPublic: z.boolean().default(false),
  notes: z.string().optional(),
  creatorId: z.string().min(1, "Creator ID is required"),
  tagIds: z.array(z.string()).optional(),
  reminders: z
    .array(
      z.object({
        type: ReminderTypeSchema,
        value: z.number().int().positive(),
      }),
    )
    .optional(),
  attendees: z
    .array(
      z.object({
        userId: z.string().min(1, "User ID is required"),
        status: AttendeeStatusSchema,
      }),
    )
    .optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  id: z.string().min(1, "Event ID is required"),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

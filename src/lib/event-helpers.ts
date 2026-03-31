import {
  type Prisma,
  type Event,
  type Tag,
  type Reminder,
  type User,
} from "@prisma/client";
import { CreateEventSchema } from "./event-schemas";

export type EventWithRelations = Event & {
  User: User[];
  tags: { tag: Tag }[];
  attendees: { user: User; status: string }[];
  reminders: Reminder[];
};

export interface FrontendEventData {
  organizer: User | null;
  id: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  location?: string;
  isOnline: boolean;
  type: string;
  priority: string;
  status: string;
  recurring: string;
  notes?: string;
  maxAttendees?: number;
  isPublic: boolean;
  creatorId: string;
  tagIds: string[];
  reminders: { type: string; value: number }[];
  attendees: { userId: string; status: string }[];
  recurrenceEnd?: string;
}

export function splitDateTime(dateTime: Date): { date: string; time: string } {
  if (!dateTime || !(dateTime instanceof Date) || isNaN(dateTime.getTime())) {
    return {
      date: new Date().toISOString().split("T")[0]!,
      time: "00:00",
    };
  }

  return {
    date: dateTime.toISOString().split("T")[0]!,
    time: dateTime.toTimeString().split(" ")[0]!.slice(0, 5),
  };
}

export function safeTransformEventForDatabase(
  input: unknown,
): Prisma.EventCreateInput {
  const parsed = CreateEventSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      `Invalid event data: ${JSON.stringify(parsed.error.issues)}`,
    );
  }

  const data = parsed.data;

  const startDateTime = new Date(data.startDateTime);
  const endDateTime = new Date(data.endDateTime);
  const recurrenceEnd = data.recurrenceEnd
    ? new Date(data.recurrenceEnd)
    : undefined;

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    throw new Error("Invalid date format");
  }

  return {
    title: data.title,
    description: data.description,
    startDateTime,
    endDateTime,
    timezone: data.timezone,
    location: data.location,
    isOnline: data.isOnline,
    type: data.type,
    priority: data.priority,
    status: data.status,
    recurring: data.recurring,
    notes: data.notes,
    maxAttendees: data.maxAttendees,
    isPublic: data.isPublic,
    recurrenceEnd,
    User: { connect: { id: data.creatorId } },
    tags: data.tagIds
      ? {
          create: data.tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        }
      : undefined,
    reminders: data.reminders
      ? {
          create: data.reminders.map((reminder) => ({
            type: reminder.type,
            minutesBefore: reminder.value,
          })),
        }
      : undefined,
    attendees: data.attendees
      ? {
          create: data.attendees.map((attendee) => ({
            user: { connect: { id: attendee.userId } },
            status: attendee.status,
          })),
        }
      : undefined,
  };
}

export function safeTransformEventForFrontend(
  event: EventWithRelations,
): FrontendEventData {
  const recurrenceEnd = event.recurrenceEnd
    ? event.recurrenceEnd.toISOString()
    : undefined;

  return {
    organizer: event.User[0] ?? null,
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    startDateTime: event.startDateTime.toISOString(),
    endDateTime: event.endDateTime.toISOString(),
    timezone: event.timezone,
    location: event.location ?? undefined,
    isOnline: event.isOnline,
    type: event.type,
    priority: event.priority,
    status: event.status,
    recurring: event.recurring,
    notes: event.notes ?? undefined,
    maxAttendees: event.maxAttendees ?? undefined,
    isPublic: event.isPublic,
    creatorId: event.User[0]?.id ?? "",
    tagIds: event.tags.map((t) => t.tag.id),
    reminders: event.reminders.map((r) => ({
      type: r.type,
      value: r.minutesBefore,
    })),
    attendees: event.attendees.map((a) => ({
      userId: a.user.id,
      status: a.status,
    })),
    recurrenceEnd,
  };
}

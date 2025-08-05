/*
  Warnings:

  - You are about to drop the `event_attendees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_reminders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_attendees" DROP CONSTRAINT "event_attendees_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_attendees" DROP CONSTRAINT "event_attendees_userId_fkey";

-- DropForeignKey
ALTER TABLE "event_reminders" DROP CONSTRAINT "event_reminders_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_tags" DROP CONSTRAINT "event_tags_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_tags" DROP CONSTRAINT "event_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_creatorId_fkey";

-- DropTable
DROP TABLE "event_attendees";

-- DropTable
DROP TABLE "event_reminders";

-- DropTable
DROP TABLE "event_tags";

-- DropTable
DROP TABLE "events";

-- DropTable
DROP TABLE "tags";

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "location" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "type" "EventType" NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "EventStatus" NOT NULL,
    "recurring" "RecurrenceType" NOT NULL,
    "recurrenceEnd" TIMESTAMP(3),
    "maxAttendees" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTag" (
    "eventId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "EventTag_pkey" PRIMARY KEY ("eventId","tagId")
);

-- CreateTable
CREATE TABLE "Attendee" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AttendeeStatus" NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "minutesBefore" INTEGER NOT NULL,
    "type" "ReminderType" NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventCreator" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventCreator_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventCreator_B_index" ON "_EventCreator"("B");

-- AddForeignKey
ALTER TABLE "EventTag" ADD CONSTRAINT "EventTag_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTag" ADD CONSTRAINT "EventTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventCreator" ADD CONSTRAINT "_EventCreator_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventCreator" ADD CONSTRAINT "_EventCreator_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

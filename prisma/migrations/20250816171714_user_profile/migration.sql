-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT DEFAULT '',
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileVisibility" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false;

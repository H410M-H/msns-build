/*
  Warnings:

  - The values [Principal,Admin,Head,Clerk,Teacher,Worker] on the enum `Designation` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Designation_new" AS ENUM ('PRINCIPAL', 'ADMIN', 'HEAD', 'CLERK', 'TEACHER', 'WORKER');
ALTER TABLE "User" ALTER COLUMN "accountType" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "accountType" TYPE "Designation_new" USING ("accountType"::text::"Designation_new");
ALTER TABLE "Employees" ALTER COLUMN "designation" TYPE "Designation_new" USING ("designation"::text::"Designation_new");
ALTER TYPE "Designation" RENAME TO "Designation_old";
ALTER TYPE "Designation_new" RENAME TO "Designation";
DROP TYPE "Designation_old";
ALTER TABLE "User" ALTER COLUMN "accountType" SET DEFAULT 'ADMIN';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "accountType" SET DEFAULT 'ADMIN';

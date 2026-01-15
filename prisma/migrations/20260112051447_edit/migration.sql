/*
  Warnings:

  - You are about to drop the column `c` on the `User` table. All the data in the column will be lost.
  - Made the column `sub` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "c",
ALTER COLUMN "sub" SET NOT NULL;

/*
  Warnings:

  - Added the required column `name` to the `GameSessionQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameSessionQuestion" ADD COLUMN     "name" TEXT NOT NULL;

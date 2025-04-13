/*
  Warnings:

  - You are about to drop the column `name` on the `GameSessionQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `timer` on the `GameSessionQuestion` table. All the data in the column will be lost.
  - Added the required column `name` to the `GameSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "_userRole" TEXT DEFAULT 'player',
ADD COLUMN     "defaultTimer" SMALLINT NOT NULL DEFAULT 30,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GameSessionQuestion" DROP COLUMN "name",
DROP COLUMN "timer";

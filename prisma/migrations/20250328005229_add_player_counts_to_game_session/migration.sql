-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "numberOfAiPlayers" SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfPlayers" SMALLINT NOT NULL DEFAULT 3;

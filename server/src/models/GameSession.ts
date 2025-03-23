import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GameSessionInput {
  gameId: string;
  currentTurn?: string; // Теперь это ID игрока, а не команды
}

export const GameSessionModel = {
  updateCurrentTurn: async (id: string, playerId: string) => {
    return prisma.gameSession.update({
      where: { id },
      data: {
        currentTurn: playerId
      }
    });
  },
}; 
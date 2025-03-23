import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface QuestionUpdateInput {
  question?: string;
  answer?: string;
  isAnswered?: boolean;
  answeredByPlayerId?: string;
}

export const QuestionModel = {
  markAsAnswered: async (id: string, playerId: string) => {
    return prisma.question.update({
      where: { id },
      data: {
        isAnswered: true,
        answeredByPlayerId: playerId
      }
    });
  }
}; 
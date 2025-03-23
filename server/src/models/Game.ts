import { Prisma, PrismaClient, GameRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface GameWithRelations extends Game {
  creator: User;
  categories: Category[];
  questionRows: QuestionRow[];
  players: Player[];
  gameSession?: GameSession;
}

export const GameModel = {
  findById: async (id: string) => {
    return prisma.game.findUnique({
      where: { id },
      include: {
        creator: true,
        categories: {
          include: {
            questions: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        questionRows: {
          orderBy: {
            order: 'asc'
          }
        },
        players: true,
        gameSession: true
      }
    });
  },
}; 
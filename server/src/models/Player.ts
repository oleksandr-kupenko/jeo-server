import { Prisma, PrismaClient, GameRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface PlayerInput {
  name: string;
  gameId: string;
  userId: string;
  role?: GameRole;
}

export interface PlayerUpdateInput {
  name?: string;
  points?: number;
  role?: GameRole;
}

export const PlayerModel = {
  create: async (data: PlayerInput) => {
    return prisma.player.create({
      data: {
        name: data.name,
        game: { connect: { id: data.gameId } },
        user: { connect: { id: data.userId } },
        role: data.role || 'CONTESTANT'
      }
    });
  },

  findById: async (id: string) => {
    return prisma.player.findUnique({
      where: { id },
      include: {
        game: true,
        user: true
      }
    });
  },

  findByGameId: async (gameId: string) => {
    return prisma.player.findMany({
      where: { gameId },
      include: {
        user: true
      }
    });
  },

  update: async (id: string, data: PlayerUpdateInput) => {
    return prisma.player.update({
      where: { id },
      data
    });
  },

  delete: async (id: string) => {
    return prisma.player.delete({
      where: { id }
    });
  },

  updatePoints: async (id: string, points: number) => {
    return prisma.player.update({
      where: { id },
      data: {
        points: { increment: points }
      }
    });
  }
}; 
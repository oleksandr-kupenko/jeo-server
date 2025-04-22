import { Request, Response, NextFunction } from 'express';
import { SystemRole, GameRole } from '@prisma/client';
import {prisma} from "../config/prisma";

// Создание нового игрока
export const createPlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameSessionId, name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Проверяем, существует ли сессия
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
      include: {
        game: true,
        players: true
      }
    });

    if (!gameSession) {
      res.status(404).json({ message: 'Game session not found' });
      return;
    }

    // Проверяем, не является ли пользователь уже игроком в этой сессии
    const existingPlayer = gameSession.players.find(player => player.userId === userId);
    if (existingPlayer) {
      res.status(400).json({ message: 'User is already a player in this session' });
      return;
    }

    const player = await prisma.player.create({
      data: {
        name,
        userId,
        gameSessionId,
        role: GameRole.CONTESTANT
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
};

// Получение всех игроков сессии
export const getPlayersBySessionId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameSessionId } = req.params;

    const players = await prisma.player.findMany({
      where: { gameSessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(players);
  } catch (error) {
    next(error);
  }
};

// Обновление игрока
export const updatePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, points } = req.body;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === SystemRole.ADMIN;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        gameSession: {
          include: {
            game: true
          }
        }
      }
    });

    if (!player) {
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    // Проверяем права на обновление
    const isGameCreator = player.gameSession.game.creatorId === userId;
    const isOwner = player.userId === userId;

    if (!isAdmin && !isGameCreator && !isOwner) {
      res.status(403).json({ message: 'Not authorized to update this player' });
      return;
    }

    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        name,
        points
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(updatedPlayer);
  } catch (error) {
    next(error);
  }
};

// Удаление игрока
export const deletePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === SystemRole.ADMIN;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        gameSession: {
          include: {
            game: true
          }
        }
      }
    });

    if (!player) {
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    // Проверяем права на удаление
    const isGameCreator = player.gameSession.game.creatorId === userId;
    const isOwner = player.userId === userId;

    if (!isAdmin && !isGameCreator && !isOwner) {
      res.status(403).json({ message: 'Not authorized to remove this player' });
      return;
    }

    await prisma.player.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Получение игрока по ID
export const getPlayerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        gameSession: {
          select: {
            id: true,
            startedAt: true,
            game: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!player) {
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    res.json(player);
  } catch (error) {
    next(error);
  }
};

// Получение всех игроков
export const getAllPlayers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const players = await prisma.player.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        gameSession: {
          select: {
            id: true,
            game: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    res.json(players);
  } catch (error) {
    next(error);
  }
}; 
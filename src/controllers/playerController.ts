import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Получить всех игроков
export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await prisma.player.findMany({
      include: {
        user: true,
        gameSession: true,
        answeredQuestions: true,
      },
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения игроков' });
  }
};

// Получить игрока по ID
export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        gameSession: true,
        answeredQuestions: true,
      },
    });

    if (!player) {
      return res.status(404).json({ error: 'Игрок не найден' });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения игрока' });
  }
};

// Создать нового игрока
export const createPlayer = async (req: Request, res: Response) => {
  try {
    const { name, userId, gameSessionId, role } = req.body;
    
    // Проверяем существование gameSession
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId }
    });
    
    if (!gameSession) {
      return res.status(404).json({ message: 'Game session not found' });
    }
    
    const player = await prisma.player.create({
      data: {
        name,
        role: role || "CONTESTANT",
        user: {
          connect: { id: userId }
        },
        gameSession: {
          connect: { id: gameSessionId }
        }
      },
      include: {
        user: true,
        gameSession: true
      }
    });
    
    res.status(201).json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ message: 'Failed to create player' });
  }
};

// Обновить игрока
export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { name, points, role } = req.body;

    const player = await prisma.player.update({
      where: { id: req.params.id },
      data: {
        name,
        points,
        role,
      },
    });

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления игрока' });
  }
};

// Удалить игрока
export const deletePlayer = async (req: Request, res: Response) => {
  try {
    await prisma.player.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Игрок удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления игрока' });
  }
};

export const getPlayersByGameSession = async (req: Request, res: Response) => {
  try {
    const { gameSessionId } = req.params;
    
    const players = await prisma.player.findMany({
      where: {
        gameSessionId
      },
      include: {
        user: true
      }
    });
    
    res.json(players);
  } catch (error) {
    console.error('Error getting players by game session:', error);
    res.status(500).json({ message: 'Failed to get players' });
  }
}; 
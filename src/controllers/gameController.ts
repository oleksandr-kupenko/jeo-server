import { Request, Response, NextFunction } from 'express';
import { SystemRole } from '@prisma/client';
import { emptyGameTemplate } from '../data-templates/empty-game.template';
import {prisma} from "../config/prisma";

// Создание новой игры
export const createGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title } = req.body;
    const userId = (req as any).user.id;
    
    // Создаем игру с категориями и рядами вопросов
    const game = await prisma.game.create({
      data: {
        title,
        creator: {
          connect: { id: userId }
        },
        // Создаем категории
        categories: {
          create: emptyGameTemplate.categories
        },
        // Создаем ряды вопросов
        questionRows: {
          create: emptyGameTemplate.questionRows
        }
      },
      include: {
        creator: true,
        categories: true,
        questionRows: true
      }
    });

    // Создаем пустые вопросы для каждой категории и ряда
    const questions = [];
    for (const category of game.categories) {
      for (const row of game.questionRows) {
        questions.push({
          ...emptyGameTemplate.emptyQuestion,
          categoryId: category.id,
          rowId: row.id
        });
      }
    }

    // Создаем все вопросы одним запросом
    await prisma.question.createMany({
      data: questions
    });

    // Получаем полную игру со всеми связями
    const fullGame = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        creator: true,
        categories: {
          include: {
            questions: true
          }
        },
        questionRows: {
          include: {
            questions: true
          }
        }
      }
    });

    res.status(201).json(fullGame);
  } catch (error) {
    next(error);
  }
};

// Получение всех игр
export const getAllGames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const games = await prisma.game.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(games);
  } catch (error) {
    next(error);
  }
};

// Получение игры по ID
export const getGameById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        creator: true,
        categories: {
          include: {
            questions: true
          }
        },
        questionRows: {
          include: {
            questions: true
          }
        }
      }
    });
    
    if (!game) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }
    
    res.json(game);
  } catch (error) {
    next(error);
  }
};

// Обновление игры
export const updateGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const game = await prisma.game.findUnique({
      where: { id }
    });

    if (!game) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }

    // Проверяем, является ли пользователь создателем игры или админом
    if (game.creatorId !== userId && req.user?.role !== SystemRole.ADMIN) {
      res.status(403).json({ message: 'Not authorized to update this game' });
      return;
    }

    const updatedGame = await prisma.game.update({
      where: { id },
      data: { title }
    });

    res.json(updatedGame);
  } catch (error) {
    next(error);
  }
};

// Удаление игры
export const deleteGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const game = await prisma.game.findUnique({
      where: { id }
    });

    if (!game) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }

    // Проверяем, является ли пользователь создателем игры или админом
    if (game.creatorId !== userId && req.user?.role !== SystemRole.ADMIN) {
      res.status(403).json({ message: 'Not authorized to delete this game' });
      return;
    }

    await prisma.gameSessionQuestion.deleteMany({
      where: {
        gameSession: {
          gameId: id
        }
      }
    });

    await prisma.gameSession.deleteMany({
      where: { gameId: id }
    });

    await prisma.question.deleteMany({
      where: {
        category: {
          gameId: id
        }
      }
    });

    await prisma.category.deleteMany({
      where: { gameId: id }
    });

    await prisma.questionRow.deleteMany({
      where: { gameId: id }
    });

    await prisma.player.deleteMany({
      where: {
        gameSession: {
          gameId: id
        }
      }
    });

    await prisma.game.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 
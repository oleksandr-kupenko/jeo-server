import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Создание новой игры
export const createGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('createGame');
  try {
    const { title } = req.body;
    const userId = (req as any).user.id;
    
    const game = await prisma.game.create({
      data: {
        title,
        creator: {
          connect: { id: userId }
        }
      }
    });
    
    res.status(201).json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    next(error);
  }
};

// Получение всех игр
export const getAllGames = async (req: Request, res: Response, next: NextFunction) => {
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
    res.status(500).json({ error: 'Ошибка при получении игр' });
    next(error);
  }
};

// Получение игры по ID
export const getGameById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        creator: true,
        categories: true,
        questionRows: true,
      }
    });
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json(game);
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({ message: 'Failed to get game' });
    next(error);
  }
};

// Обновление игры
export const updateGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, isActive } = req.body;
    const userId = req.user?.id;

    // Проверяем, существует ли игра и является ли пользователь ее создателем
    const game = await prisma.game.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!game) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }

    if (game.creatorId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Нет доступа к редактированию игры' });
    }

    const updatedGame = await prisma.game.update({
      where: { id },
      data: {
        title,
        isActive
      }
    });

    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении игры' });
    next(error);
  }
};

// Удаление игры
export const deleteGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Проверяем, существует ли игра и является ли пользователь ее создателем
    const game = await prisma.game.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!game) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }

    if (game.creatorId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Нет доступа к удалению игры' });
    }

    // Удаляем связанные сущности
    // 1. Удаляем сессию игры и связанные вопросы сессии
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

    // 2. Удаляем вопросы
    await prisma.question.deleteMany({
      where: {
        category: {
          gameId: id
        }
      }
    });

    // 3. Удаляем категории и ряды вопросов
    await prisma.category.deleteMany({
      where: { gameId: id }
    });

    await prisma.questionRow.deleteMany({
      where: { gameId: id }
    });

    // 4. Удаляем участников команд и команды
    await prisma.teamMember.deleteMany({
      where: {
        team: {
          gameId: id
        }
      }
    });

    await prisma.team.deleteMany({
      where: { gameId: id }
    });

    // 5. Наконец, удаляем саму игру
    await prisma.game.delete({
      where: { id }
    });

    res.json({ message: 'Игра успешно удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении игры' });
    next(error);
  }
}; 
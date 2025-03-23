import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Создание новой категории
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { gameId, name, order } = req.body;
    const userId = req.user?.id;

    // Проверяем, существует ли игра и является ли пользователь ее создателем
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { creatorId: true }
    });

    if (!game) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }

    if (game.creatorId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Нет доступа к добавлению категорий' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        order,
        gameId
      }
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании категории' });
  }
};

// Получение всех категорий игры
export const getCategoriesByGameId = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    const categories = await prisma.category.findMany({
      where: { gameId },
      orderBy: { order: 'asc' },
      include: {
        questions: {
          include: {
            questionRow: true
          }
        }
      }
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
};

// Обновление категории
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;
    const userId = req.user?.id;

    // Проверяем, существует ли категория и имеет ли пользователь доступ
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        game: {
          select: { creatorId: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    if (category.game.creatorId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Нет доступа к редактированию категории' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        order
      }
    });

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении категории' });
  }
};

// Удаление категории
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Проверяем, существует ли категория и имеет ли пользователь доступ
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        game: {
          select: { creatorId: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    if (category.game.creatorId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Нет доступа к удалению категории' });
    }

    // Удаляем связанные вопросы
    await prisma.question.deleteMany({
      where: {
        categoryId: id
      }
    });

    // Удаляем категорию
    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении категории' });
  }
}; 
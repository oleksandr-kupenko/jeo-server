import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Создание новой категории
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, gameId, order } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        order,
        game: {
          connect: { id: gameId }
        }
      },
      include: {
        questions: true
      }
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// Получение всех категорий игры
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId } = req.params;

    const categories = await prisma.category.findMany({
      where: {
        gameId
      },
      include: {
        questions: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        questions: true
      }
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

// Обновление категории
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        order
      },
      include: {
        questions: true
      }
    });

    res.json(category);
  } catch (error) {
    next(error);
  }
};

// Удаление категории
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 
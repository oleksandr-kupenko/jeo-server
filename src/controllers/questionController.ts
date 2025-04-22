import { Request, Response, NextFunction } from 'express';
import { SystemRole } from '@prisma/client';
import {prisma} from "../config/prisma";

// Создание нового ряда вопросов
export const createQuestionRow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId, value, order } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Проверяем, существует ли игра и является ли пользователь её создателем
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }

    if (game.creatorId !== userId && req.user?.role !== SystemRole.ADMIN) {
      res.status(403).json({ message: 'Not authorized to create question rows for this game' });
      return;
    }

    const questionRow = await prisma.questionRow.create({
      data: {
        value,
        order,
        gameId
      }
    });

    res.status(201).json(questionRow);
  } catch (error) {
    next(error);
  }
};

// Получение всех рядов вопросов для игры
export const getQuestionRowsByGameId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId } = req.params;

    const questionRows = await prisma.questionRow.findMany({
      where: { gameId },
      orderBy: { order: 'asc' }
    });

    res.json(questionRows);
  } catch (error) {
    next(error);
  }
};

// Создание нового вопроса
export const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { question, answer, categoryId, rowId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Проверяем, существует ли игра и является ли пользователь её создателем
    const game = await prisma.game.findFirst({
      where: {
        categories: {
          some: { id: categoryId }
        }
      }
    });

    if (!game) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }

    if (game.creatorId !== userId && req.user?.role !== SystemRole.ADMIN) {
      res.status(403).json({ message: 'Not authorized to create questions for this game' });
      return;
    }

    const newQuestion = await prisma.question.create({
      data: {
        question,
        answer,
        categoryId,
        rowId
      }
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    next(error);
  }
};

// Получение всех вопросов игры
export const getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId } = req.query;

    const questions = await prisma.question.findMany({
      where: {
        category: {
          gameId: gameId as string
        }
      },
      include: {
        category: true,
        questionRow: true
      }
    });

    res.json(questions);
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        category: true,
        questionRow: true
      }
    });

    if (!question) {
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    res.json(question);
  } catch (error) {
    next(error);
  }
};

// Обновление вопроса
export const updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { question, answer, categoryId, rowId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Находим вопрос и связанную игру
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            game: true
          }
        }
      }
    });

    if (!existingQuestion) {
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    // Проверяем права доступа
    if (existingQuestion.category.game.creatorId !== userId && req.user?.role !== SystemRole.ADMIN) {
      res.status(403).json({ message: 'Not authorized to update this question' });
      return;
    }

    // Если указана новая категория, проверяем её принадлежность к той же игре
    if (categoryId && categoryId !== existingQuestion.categoryId) {
      const newCategory = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { game: true }
      });

      if (!newCategory || newCategory.game.id !== existingQuestion.category.game.id) {
        res.status(400).json({ message: 'Invalid category for this game' });
        return;
      }
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        question,
        answer,
        categoryId,
        rowId
      },
      include: {
        category: true,
        questionRow: true
      }
    });

    res.json(updatedQuestion);
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.question.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateQuestionRowValue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Находим ряд вопросов и связанную игру
    const questionRow = await prisma.questionRow.findUnique({
      where: { id },
      include: {
        game: true
      }
    });

    if (!questionRow) {
      res.status(404).json({ message: 'Question row not found' });
      return;
    }

    // Проверяем права доступа
    if (questionRow.game.creatorId !== userId && req.user?.role !== SystemRole.ADMIN) {
      res.status(403).json({ message: 'Not authorized to update this question row' });
      return;
    }

    const updatedRow = await prisma.questionRow.update({
      where: { id },
      data: { value }
    });

    res.json(updatedRow);
  } catch (error) {
    next(error);
  }
}; 
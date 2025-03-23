import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Создание нового ряда вопросов
export const createQuestionRow = async (req: Request, res: Response) => {
  try {
    const { gameId, value, order } = req.body;
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
      return res.status(403).json({ error: 'Нет доступа к добавлению рядов вопросов' });
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
    res.status(500).json({ error: 'Ошибка при создании ряда вопросов' });
  }
};

// Получение всех рядов вопросов игры
export const getQuestionRowsByGameId = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    const questionRows = await prisma.questionRow.findMany({
      where: { gameId },
      orderBy: { order: 'asc' }
    });

    res.json(questionRows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении рядов вопросов' });
  }
};

// Создание нового вопроса
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { categoryId, rowId, question, answer } = req.body;
    const userId = req.user?.id;

    // Проверяем, имеет ли пользователь доступ к созданию вопроса
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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
      return res.status(403).json({ error: 'Нет доступа к добавлению вопросов' });
    }

    // Проверяем, принадлежит ли ряд вопросов к этой же игре
    const questionRow = await prisma.questionRow.findUnique({
      where: { id: rowId },
      select: { gameId: true }
    });

    if (!questionRow || questionRow.gameId !== category.game.id) {
      return res.status(400).json({ error: 'Ряд вопросов не принадлежит к этой игре' });
    }

    // Проверяем, не существует ли уже вопрос для этой категории и ряда
    const existingQuestion = await prisma.question.findFirst({
      where: {
        categoryId,
        rowId
      }
    });

    if (existingQuestion) {
      return res.status(400).json({ error: 'Вопрос для этой категории и ряда уже существует' });
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
    res.status(500).json({ error: 'Ошибка при создании вопроса' });
  }
};

// Получение всех вопросов игры
export const getQuestionsByGameId = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    const questions = await prisma.question.findMany({
      where: {
        category: {
          gameId
        }
      },
      include: {
        category: true,
        questionRow: true
      }
    });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении вопросов' });
  }
};

// Обновление вопроса
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    const userId = req.user?.id;

    // Проверяем, существует ли вопрос и имеет ли пользователь доступ
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            game: {
              select: { creatorId: true }
            }
          }
        }
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: 'Вопрос не найден' });
    }

    if (existingQuestion.category.game.creatorId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Нет доступа к редактированию вопроса' });
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        question,
        answer
      }
    });

    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении вопроса' });
  }
}; 
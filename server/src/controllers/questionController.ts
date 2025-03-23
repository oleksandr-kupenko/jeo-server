import { Request, Response } from 'express';
import { QuestionModel, QuestionRowModel, PlayerModel } from '../models';
import { prisma } from '../lib/prisma';

export const questionController = {
  answerQuestion: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { playerId, answer } = req.body;
      
      if (!playerId || !answer) {
        return res.status(400).json({ error: 'Необходимы поля playerId и answer' });
      }
      
      const question = await QuestionModel.findById(id);
      
      if (!question) {
        return res.status(404).json({ error: 'Вопрос не найден' });
      }
      
      const isCorrect = question.answer.toLowerCase() === answer.toLowerCase();
      
      if (isCorrect) {
        await QuestionModel.markAsAnswered(id, playerId);
        
        const questionRow = await QuestionRowModel.findById(question.rowId);
        const points = questionRow?.value || 0;
        
        await PlayerModel.updatePoints(playerId, points);
      }
      
      res.json({ isCorrect });
    } catch (error) {
      console.error('Error answering question:', error);
      res.status(500).json({ error: 'Ошибка при ответе на вопрос' });
    }
  },

  getQuestionById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const question = await prisma.question.findUnique({
        where: { id },
        include: {
          category: true,
          questionRow: true,
          gameSessionQuestion: {
            include: {
              answeredBy: true
            }
          }
        }
      });
      
      if (!question) {
        return res.status(404).json({ error: "Вопрос не найден" });
      }
      
      return res.status(200).json(question);
    } catch (error) {
      console.error("Ошибка при получении вопроса:", error);
      return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  },

  createQuestion: async (req: Request, res: Response) => {
    try {
      const { question, answer, categoryId, rowId } = req.body;
      
      const newQuestion = await prisma.question.create({
        data: {
          question,
          answer,
          category: {
            connect: { id: categoryId }
          },
          questionRow: {
            connect: { id: rowId }
          }
        }
      });
      
      return res.status(201).json(newQuestion);
    } catch (error) {
      console.error("Ошибка при создании вопроса:", error);
      if (error.code === 'P2002') {
        return res.status(400).json({ error: "Вопрос с такой категорией и рядом уже существует" });
      }
      return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  },
}; 
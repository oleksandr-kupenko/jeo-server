import { Request, Response } from 'express';
import { GameSessionModel } from '../models/GameSession';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const gameSessionController = {
  updateCurrentTurn: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { playerId } = req.body;
      
      if (!playerId) {
        return res.status(400).json({ error: 'Необходимо поле playerId' });
      }
      
      const session = await GameSessionModel.updateCurrentTurn(id, playerId);
      
      res.json(session);
    } catch (error) {
      console.error('Error updating current turn:', error);
      res.status(500).json({ error: 'Ошибка при обновлении хода' });
    }
  },

  async answerQuestion(req: Request, res: Response) {
    try {
      const { gameSessionId, questionId, playerId, isCorrect } = req.body;

      // Проверяем существование сессии игры
      const gameSession = await prisma.gameSession.findUnique({
        where: { id: gameSessionId },
        include: { players: true }
      });
      
      if (!gameSession) {
        return res.status(404).json({ error: "Сессия игры не найдена" });
      }

      // Проверяем существование игрока
      const player = gameSession.players.find(p => p.id === playerId);
      if (!player) {
        return res.status(404).json({ error: "Игрок не найден" });
      }

      // Проверяем существование вопроса в сессии
      const sessionQuestion = await prisma.gameSessionQuestion.findUnique({
        where: {
          gameSessionId_questionId: {
            gameSessionId,
            questionId
          }
        },
        include: { question: true }
      });

      if (!sessionQuestion) {
        return res.status(404).json({ error: "Вопрос не найден в этой сессии" });
      }

      if (sessionQuestion.isAnswered) {
        return res.status(400).json({ error: "На этот вопрос уже дан ответ" });
      }

      // Обновляем информацию о вопросе
      await prisma.gameSessionQuestion.update({
        where: {
          gameSessionId_questionId: {
            gameSessionId,
            questionId
          }
        },
        data: {
          isAnswered: true,
          answeredByPlayerId: playerId
        }
      });

      // Обновляем очки игрока
      const questionValue = sessionQuestion.question.value || 0;
      const pointsChange = isCorrect ? questionValue : -questionValue;

      await prisma.player.update({
        where: { id: playerId },
        data: {
          points: {
            increment: pointsChange
          }
        }
      });

      return res.status(200).json({ success: true, pointsChange });
    } catch (error) {
      console.error("Ошибка при ответе на вопрос:", error);
      return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  },

  async startGameSession(req: Request, res: Response) {
    try {
      const { gameId, players } = req.body;
      
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: { categories: { include: { questions: true } } }
      });
      
      if (!game) {
        return res.status(404).json({ error: "Игра не найдена" });
      }
      
      // Создаем новую сессию игры
      const gameSession = await prisma.gameSession.create({
        data: {
          game: { connect: { id: gameId } },
          players: {
            create: players.map((player) => ({
              name: player.name,
              userId: player.userId,
              role: player.role || 'CONTESTANT'
            }))
          }
        },
        include: {
          players: true
        }
      });
      
      // Создаем записи GameSessionQuestion для всех вопросов
      const questionsToCreate = [];
      for (const category of game.categories) {
        for (const question of category.questions) {
          questionsToCreate.push({
            questionId: question.id,
            gameSessionId: gameSession.id,
            isRevealed: false,
            isAnswered: false
          });
        }
      }
      
      await prisma.gameSessionQuestion.createMany({
        data: questionsToCreate
      });
      
      return res.status(201).json(gameSession);
    } catch (error) {
      console.error("Ошибка при создании сессии игры:", error);
      return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  },

  async getGameSessionWithQuestions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const gameSession = await prisma.gameSession.findUnique({
        where: { id },
        include: {
          game: {
            include: {
              categories: true,
              questionRows: true
            }
          },
          players: true,
          questions: {
            include: {
              question: true,
              answeredBy: true
            }
          }
        }
      });
      
      if (!gameSession) {
        return res.status(404).json({ error: "Сессия игры не найдена" });
      }
      
      return res.status(200).json(gameSession);
    } catch (error) {
      console.error("Ошибка при получении сессии игры:", error);
      return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  },
}; 
import { Request, Response, NextFunction } from 'express';
import { Player, Game, SystemRole } from '@prisma/client';
import { prisma } from '../prisma';

// Создать новую игровую сессию
export const createGameSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId } = req.body;
    const session = await prisma.gameSession.create({
      data: {
        game: {
          connect: { id: gameId }
        },
        startedAt: new Date()
      },
      include: {
        game: true,
        players: true
      }
    });
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// Получить все игровые сессии
export const getAllGameSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === SystemRole.ADMIN;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const gameSessions = await prisma.gameSession.findMany({
      where: isAdmin ? undefined : {
        players: {
          some: {
            userId
          }
        }
      },
      include: {
        game: true,
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.json(gameSessions);
  } catch (error) {
    next(error);
  }
};

// Получить игровую сессию по ID
export const getGameSessionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await prisma.gameSession.findUnique({
      where: { id },
      include: {
        game: {
          include: {
            categories: {
              include: {
                questions: true
              }
            },
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

    if (!session) {
      res.status(404).json({ message: 'Game session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

// Получение активной сессии игры
export const getGameSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId } = req.params;

    const session = await prisma.gameSession.findFirst({
      where: { gameId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                category: true,
                questionRow: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      res.status(404).json({ error: 'Сессия игры не найдена' });
      return;
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

// Обновление статуса вопроса в сессии
export const updateSessionQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, questionId } = req.params;
    const { isRevealed, isAnswered, playerId } = req.body;
    const userId = req.user?.id;

    // Проверяем наличие сессии и доступ пользователя
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        game: {
          select: {
            creatorId: true
          }
        },
        players: {
          where: {
            role: 'GAME_MASTER',
            userId
          }
        }
      }
    });

    if (!session) {
      res.status(404).json({ error: 'Сессия игры не найдена' });
      return;
    }

    // Проверяем права: должен быть либо создатель игры, либо ведущий
    const isGameCreator = session.game.creatorId === userId;
    const isGameMaster = session.players.length > 0;
    const isAdmin = req.user?.role === SystemRole.ADMIN;

    if (!isGameCreator && !isGameMaster && !isAdmin) {
      res.status(403).json({ error: 'Нет доступа к управлению сессией' });
      return;
    }

    // Получаем вопрос сессии
    const sessionQuestion = await prisma.gameSessionQuestion.findFirst({
      where: {
        gameSessionId: sessionId,
        questionId
      }
    });

    if (!sessionQuestion) {
      res.status(404).json({ error: 'Вопрос не найден в данной сессии' });
      return;
    }

    // Обновляем статус вопроса
    const updatedSessionQuestion = await prisma.gameSessionQuestion.update({
      where: { id: sessionQuestion.id },
      data: {
        isRevealed,
        isAnswered,
        answeredByPlayerId: playerId
      }
    });

    res.json(updatedSessionQuestion);
  } catch (error) {
    next(error);
  }
};

// Обновить текущий ход в игровой сессии
export const updateCurrentTurn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentTurn } = req.body;
    const userId = req.user?.id;

    const session = await prisma.gameSession.findUnique({
      where: { id },
      include: {
        players: true
      }
    });

    if (!session) {
      res.status(404).json({ message: 'Game session not found' });
      return;
    }

    const isPlayer = session.players.some((player: Player) => player.userId === userId);

    if (!isPlayer) {
      res.status(403).json({ message: 'Not authorized to update game session' });
      return;
    }

    const updatedSession = await prisma.gameSession.update({
      where: { id },
      data: { currentTurn }
    });

    res.json(updatedSession);
  } catch (error) {
    next(error);
  }
};

// Завершить игровую сессию
export const endGameSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const gameSession = await prisma.gameSession.update({
      where: { id },
      data: {
        endedAt: new Date()
      },
      include: {
        players: true,
        game: true
      }
    });
    
    // Обновляем статистику для пользователей
    const winner = gameSession.players.reduce((prev, current) => 
      (prev.points > current.points) ? prev : current, gameSession.players[0]);
    
    if (winner) {
      // Обновляем профиль победителя
      await prisma.userProfile.update({
        where: { userId: winner.userId },
        data: {
          gamesWon: { increment: 1 },
          gamesPlayed: { increment: 1 }
        }
      });
      
      // Обновляем профили остальных игроков
      for (const player of gameSession.players) {
        if (player.id !== winner.id) {
          await prisma.userProfile.update({
            where: { userId: player.userId },
            data: {
              gamesPlayed: { increment: 1 }
            }
          });
        }
      }
    }
    
    res.json(gameSession);
  } catch (error) {
    next(error);
  }
};

export const markQuestionAnswered = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { questionId } = req.params;
    const { playerId, isCorrect } = req.body;

    const question = await prisma.gameSessionQuestion.update({
      where: { id: questionId },
      data: {
        isAnswered: true,
        answeredByPlayerId: playerId
      },
      include: {
        question: true,
        answeredBy: true
      }
    });

    res.json(question);
  } catch (error) {
    next(error);
  }
}; 
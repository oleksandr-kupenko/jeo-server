import { Request, Response, NextFunction } from 'express';
import { Player, Game, SystemRole, GameRole } from '@prisma/client';
import { GameSessionWithUserRole, UserSessionRole } from '../types/session';
import {prisma} from "../config/prisma";

// Создать новую игровую сессию
export const createGameSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId, name, numberOfPlayers, numberOfAiPlayers, defaultTimer } = req.body;
    
    // Валидация параметров
    if (!gameId || !name) {
      res.status(400).json({ message: 'Необходимы параметры gameId и name' });
      return;
    }
    
    // Проверка диапазонов числовых значений
    const playerCount = numberOfPlayers ? parseInt(numberOfPlayers) : 3;
    if (playerCount < 2 || playerCount > 10) {
      res.status(400).json({ message: 'Количество игроков должно быть от 2 до 10' });
      return;
    }
    
    const aiPlayerCount = numberOfAiPlayers ? parseInt(numberOfAiPlayers) : 0;
    if (aiPlayerCount < 0 || aiPlayerCount > playerCount) {
      res.status(400).json({ message: 'Количество ИИ игроков должно быть от 0 до значения numberOfPlayers' });
      return;
    }
    
    const timer = defaultTimer ? parseInt(defaultTimer) : 30;
    if (timer < 5 || timer > 120) {
      res.status(400).json({ message: 'Таймер должен быть от 5 до 120 секунд' });
      return;
    }
    
    const session = await prisma.gameSession.create({
      data: {
        name,
        game: {
          connect: { id: gameId }
        },
        startedAt: new Date(),
        numberOfPlayers: playerCount,
        numberOfAiPlayers: aiPlayerCount,
        defaultTimer: timer
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

// Определение роли пользователя в сессии
const determineUserRole = (session: any, userId: string): UserSessionRole => {
  // Проверяем, является ли пользователь создателем игры
  const isCreator = session.game.creator?.id === userId;
  
  // Проверяем, является ли пользователь ведущим (game master) в этой сессии
  const isGameMaster = session.players.some((player: Player) => 
    player.userId === userId && player.role === GameRole.GAME_MASTER
  );
  
  if (isCreator) {
    return 'host';
  } else if (isGameMaster) {
    return 'gamemaster';
  } else {
    return 'player';
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

    // Для отладки
    console.log(`Getting sessions for user ${userId}, isAdmin: ${isAdmin}`);

    const gameSessions = await prisma.gameSession.findMany({
      where: isAdmin 
        ? undefined 
        : {
            OR: [
              // Сессии, где пользователь является участником
              {
                players: {
                  some: {
                    userId
                  }
                }
              },
              // Сессии игр, созданных пользователем
              {
                game: {
                  creatorId: userId
                }
              }
            ]
          },
      include: {
        game: {
          include: {
            creator: {
              select: {
                id: true
              }
            }
          }
        },
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

    // Определяем роль пользователя для каждой сессии
    const sessionsWithRole = gameSessions.map(session => {
      const userRole = determineUserRole(session, userId);
      
      return {
        ...session,
        userRole
      } as GameSessionWithUserRole;
    });

    // Для отладки
    console.log(`Found ${sessionsWithRole.length} game sessions`);

    res.json(sessionsWithRole);
  } catch (error) {
    console.error('Error in getAllGameSessions:', error);
    next(error);
  }
};

// Получить игровую сессию по ID
export const getGameSessionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const session = await prisma.gameSession.findUnique({
      where: { id },
      include: {
        game: {
          include: {
            creator: {
              select: {
                id: true
              }
            },
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

    // Определяем роль пользователя в сессии
    const userRole = determineUserRole(session, userId);

    const sessionWithRole = {
      ...session,
      userRole
    } as GameSessionWithUserRole;

    res.json(sessionWithRole);
  } catch (error) {
    next(error);
  }
};

// Получение активной сессии игры
export const getGameSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const session = await prisma.gameSession.findFirst({
      where: { gameId },
      include: {
        game: {
          include: {
            creator: {
              select: {
                id: true
              }
            }
          }
        },
        players: true,
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

    // Определяем роль пользователя в сессии
    const userRole = determineUserRole(session, userId);

    const sessionWithRole = {
      ...session,
      userRole
    } as GameSessionWithUserRole;

    res.json(sessionWithRole);
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
    
    if (winner && winner.userId) {
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
        if (player.id !== winner.id && player.userId) {
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
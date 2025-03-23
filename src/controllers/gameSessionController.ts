import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Создать новую игровую сессию
export const createGameSession = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.body;
    
    // Проверяем существование игры
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Создаем сессию игры
    const gameSession = await prisma.gameSession.create({
      data: {
        game: {
          connect: { id: gameId }
        }
      },
      include: {
        game: true
      }
    });
    
    res.status(201).json(gameSession);
  } catch (error) {
    console.error('Error creating game session:', error);
    res.status(500).json({ message: 'Failed to create game session' });
  }
};

// Получить все игровые сессии
export const getAllGameSessions = async (req: Request, res: Response) => {
  try {
    const gameSessions = await prisma.gameSession.findMany({
      include: {
        game: true,
        players: true
      }
    });
    
    res.json(gameSessions);
  } catch (error) {
    console.error('Error getting game sessions:', error);
    res.status(500).json({ message: 'Failed to get game sessions' });
  }
};

// Получить игровую сессию по ID
export const getGameSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const gameSession = await prisma.gameSession.findUnique({
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
            question: true
          }
        }
      }
    });
    
    if (!gameSession) {
      return res.status(404).json({ message: 'Game session not found' });
    }
    
    res.json(gameSession);
  } catch (error) {
    console.error('Error getting game session:', error);
    res.status(500).json({ message: 'Failed to get game session' });
  }
};

// Получение активной сессии игры
export const getGameSession = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    const session = await prisma.gameSession.findUnique({
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
      return res.status(404).json({ error: 'Сессия игры не найдена' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении сессии игры' });
  }
};

// Обновление статуса вопроса в сессии
export const updateSessionQuestion = async (req: Request, res: Response) => {
  try {
    const { sessionId, questionId } = req.params;
    const { isRevealed, isAnswered, teamMemberId } = req.body;
    const userId = req.user?.id;

    // Проверяем наличие сессии и доступ пользователя
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        game: {
          select: {
            creatorId: true,
            teams: {
              include: {
                members: {
                  where: {
                    role: 'GAME_MASTER',
                    userId
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Сессия игры не найдена' });
    }

    // Проверяем права: должен быть либо создатель игры, либо ведущий в команде
    const isGameCreator = session.game.creatorId === userId;
    const isGameMaster = session.game.teams.some(team => team.members.length > 0);
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isGameCreator && !isGameMaster && !isAdmin) {
      return res.status(403).json({ error: 'Нет доступа к управлению сессией' });
    }

    // Получаем вопрос сессии
    const sessionQuestion = await prisma.gameSessionQuestion.findFirst({
      where: {
        gameSessionId: sessionId,
        questionId
      }
    });

    if (!sessionQuestion) {
      return res.status(404).json({ error: 'Вопрос не найден в данной сессии' });
    }

    // Обновляем статус вопроса
    const updatedSessionQuestion = await prisma.gameSessionQuestion.update({
      where: { id: sessionQuestion.id },
      data: {
        isRevealed,
        isAnswered
      }
    });

    // Если указан отвечающий игрок, обновляем вопрос
    if (isAnswered && teamMemberId) {
      await prisma.question.update({
        where: { id: questionId },
        data: {
          isAnswered: true,
          answeredByUserId: teamMemberId
        }
      });
    }

    res.json(updatedSessionQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении статуса вопроса' });
  }
};

// Обновить текущий ход в игровой сессии
export const updateCurrentTurn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;
    
    // Проверяем существование игрока
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    });
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    const gameSession = await prisma.gameSession.update({
      where: { id },
      data: {
        currentTurn: playerId
      },
      include: {
        players: true,
        game: true
      }
    });
    
    res.json(gameSession);
  } catch (error) {
    console.error('Error updating current turn:', error);
    res.status(500).json({ message: 'Failed to update current turn' });
  }
};

// Завершить игровую сессию
export const endGameSession = async (req: Request, res: Response) => {
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
    console.error('Error ending game session:', error);
    res.status(500).json({ message: 'Failed to end game session' });
  }
}; 
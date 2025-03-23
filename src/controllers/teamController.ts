import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Создание новой команды
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { gameId, name } = req.body;
    const userId = req.user?.id;

    // Проверяем, существует ли игра
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }

    const team = await prisma.team.create({
      data: {
        name,
        gameId,
        // Автоматически добавляем создателя команды как участника
        members: {
          create: [
            {
              role: 'GAME_MASTER', // Создатель команды становится ведущим по умолчанию
              userId
            }
          ]
        }
      },
      include: {
        members: {
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

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании команды' });
  }
};

// Получение всех команд игры
export const getTeamsByGameId = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    const teams = await prisma.team.findMany({
      where: { gameId },
      include: {
        members: {
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

    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении команд' });
  }
};

// Обновление команды
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, points } = req.body;
    const userId = req.user?.id;

    // Проверяем, существует ли команда и имеет ли пользователь доступ
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            userId,
            role: 'GAME_MASTER'
          }
        },
        game: {
          select: { creatorId: true }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }

    // Проверяем, имеет ли пользователь право редактировать команду
    const isGameMaster = team.members.length > 0;
    const isGameCreator = team.game.creatorId === userId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isGameMaster && !isGameCreator && !isAdmin) {
      return res.status(403).json({ error: 'Нет доступа к редактированию команды' });
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name,
        points: points !== undefined ? points : team.points
      },
      include: {
        members: {
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

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении команды' });
  }
};

// Добавление участника в команду
export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { userId, role = 'PLAYER' } = req.body;
    const currentUserId = req.user?.id;

    // Проверяем, существует ли команда
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: {
            userId: currentUserId,
            role: 'GAME_MASTER'
          }
        },
        game: {
          select: { creatorId: true }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }

    // Проверяем, имеет ли пользователь право добавлять участников
    const isGameMaster = team.members.length > 0;
    const isGameCreator = team.game.creatorId === currentUserId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isGameMaster && !isGameCreator && !isAdmin) {
      return res.status(403).json({ error: 'Нет доступа к добавлению участников' });
    }

    // Проверяем, не является ли пользователь уже участником этой команды
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Пользователь уже является участником этой команды' });
    }

    // Добавляем участника
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении участника' });
  }
};

// Удаление участника из команды
export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const currentUserId = req.user?.id;

    // Проверяем, существует ли команда и участник
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: {
        team: {
          include: {
            members: {
              where: {
                userId: currentUserId,
                role: 'GAME_MASTER'
              }
            },
            game: {
              select: { creatorId: true }
            }
          }
        }
      }
    });

    if (!teamMember || teamMember.teamId !== teamId) {
      return res.status(404).json({ error: 'Участник не найден' });
    }

    // Проверяем, имеет ли пользователь право удалять участников
    const isGameMaster = teamMember.team.members.length > 0;
    const isGameCreator = teamMember.team.game.creatorId === currentUserId;
    const isAdmin = req.user?.role === 'ADMIN';
    const isSelf = teamMember.userId === currentUserId;

    if (!isGameMaster && !isGameCreator && !isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Нет доступа к удалению участника' });
    }

    // Удаляем участника
    await prisma.teamMember.delete({
      where: { id: memberId }
    });

    res.json({ message: 'Участник успешно удален из команды' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении участника' });
  }
}; 
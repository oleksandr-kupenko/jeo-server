import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Создание/обновление профиля пользователя
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { avatar, bio } = req.body;
    
    // Проверяем, существует ли профиль
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    
    let profile;
    
    if (existingProfile) {
      // Обновляем существующий профиль
      profile = await prisma.userProfile.update({
        where: { userId },
        data: {
          avatar,
          bio
        }
      });
    } else {
      // Создаем новый профиль
      profile = await prisma.userProfile.create({
        data: {
          avatar,
          bio,
          userId
        }
      });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
};

// Получение профиля пользователя
export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
};

// Обновление игровой статистики
export const updateStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { gamesPlayed, gamesWon, rating } = req.body;
    
    // Проверяем, существует ли профиль
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    
    if (!existingProfile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    // Обновляем статистику
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        gamesPlayed: gamesPlayed !== undefined ? gamesPlayed : existingProfile.gamesPlayed,
        gamesWon: gamesWon !== undefined ? gamesWon : existingProfile.gamesWon,
        rating: rating !== undefined ? rating : existingProfile.rating
      }
    });
    
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении статистики' });
  }
}; 
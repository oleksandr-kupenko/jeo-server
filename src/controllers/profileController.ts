import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {prisma} from "../config/prisma";

const prismaClient = new PrismaClient();

// Создание/обновление профиля пользователя
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { avatar, bio } = req.body;
    
    // Проверяем, существует ли профиль
    const existingProfile = await prismaClient.userProfile.findUnique({
      where: { userId }
    });
    
    let profile;
    
    if (existingProfile) {
      // Обновляем существующий профиль
      profile = await prismaClient.userProfile.update({
        where: { userId },
        data: {
          avatar,
          bio
        }
      });
    } else {
      // Создаем новый профиль
      profile = await prismaClient.userProfile.create({
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
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// Обновление статистики пользователя
export const updateStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { gamesPlayed, gamesWon, rating } = req.body;

    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        gamesPlayed,
        gamesWon,
        rating
      }
    });

    res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
}; 
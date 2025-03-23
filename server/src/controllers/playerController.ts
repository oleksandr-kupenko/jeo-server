import { Request, Response } from 'express';
import { PlayerModel, PlayerInput, PlayerUpdateInput } from '../models/Player';

export const playerController = {
  createPlayer: async (req: Request, res: Response) => {
    try {
      const { name, gameId, userId, role }: PlayerInput = req.body;
      
      if (!name || !gameId || !userId) {
        return res.status(400).json({ error: 'Необходимые поля: name, gameId, userId' });
      }
      
      const player = await PlayerModel.create({
        name,
        gameId,
        userId,
        role
      });
      
      res.status(201).json(player);
    } catch (error) {
      console.error('Error creating player:', error);
      res.status(500).json({ error: 'Ошибка при создании игрока' });
    }
  },
  
  getPlayerById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const player = await PlayerModel.findById(id);
      
      if (!player) {
        return res.status(404).json({ error: 'Игрок не найден' });
      }
      
      res.json(player);
    } catch (error) {
      console.error('Error fetching player:', error);
      res.status(500).json({ error: 'Ошибка при получении данных игрока' });
    }
  },
  
  getPlayersByGameId: async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const players = await PlayerModel.findByGameId(gameId);
      
      res.json(players);
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ error: 'Ошибка при получении списка игроков' });
    }
  },
  
  updatePlayer: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data: PlayerUpdateInput = req.body;
      
      const player = await PlayerModel.update(id, data);
      
      res.json(player);
    } catch (error) {
      console.error('Error updating player:', error);
      res.status(500).json({ error: 'Ошибка при обновлении игрока' });
    }
  },
  
  deletePlayer: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await PlayerModel.delete(id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting player:', error);
      res.status(500).json({ error: 'Ошибка при удалении игрока' });
    }
  },
  
  updatePoints: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { points } = req.body;
      
      if (typeof points !== 'number') {
        return res.status(400).json({ error: 'Поле points должно быть числом' });
      }
      
      const player = await PlayerModel.updatePoints(id, points);
      
      res.json(player);
    } catch (error) {
      console.error('Error updating player points:', error);
      res.status(500).json({ error: 'Ошибка при обновлении очков игрока' });
    }
  }
}; 
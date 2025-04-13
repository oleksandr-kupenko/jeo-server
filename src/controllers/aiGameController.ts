import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma';
import { emptyGameTemplate } from '../data-templates/empty-game.template';
import { AutomaticallyGeneratedGameForm } from '../types/ai-game';
import geminiService from '../services/geminiService';

// Импортируем шаблон промпта
const { jeopardy } = require('../config/prompt');

// Хранилище задач генерации (в реальном приложении лучше использовать базу данных)
const generationTasks: Record<string, {
  status: 'pending' | 'completed' | 'failed',
  data?: any,
  error?: string,
  userId: string,
  formData: AutomaticallyGeneratedGameForm
}> = {};

// Валидация данных формы
const validateAiGameForm = (formData: AutomaticallyGeneratedGameForm): { isValid: boolean, errors: string[] } => {
  const errors: string[] = [];
  
  // Проверка обязательных полей (минимум одно из двух)
  if (!formData.theme && (!formData.categories || formData.categories.length === 0)) {
    errors.push('Требуется указать либо тему, либо список категорий');
  }
  
  // Проверка количества категорий
  if (formData.categories && (formData.categories.length < 2 || formData.categories.length > 10)) {
    errors.push('Количество категорий должно быть от 2 до 10');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Создание новой игры с помощью AI
export const generateGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const formData: AutomaticallyGeneratedGameForm = req.body;
    const userId = (req as any).user.id;
    
    // Валидация данных формы
    const validation = validateAiGameForm(formData);
    if (!validation.isValid) {
      res.status(400).json({ 
        success: false,
        errors: validation.errors 
      });
      return;
    }
    
    console.log('Форма генерации игры:', formData);
    
    // Создаем уникальный ID для задачи генерации
    const generationId = uuidv4();
    
    // Сохраняем задачу в хранилище
    generationTasks[generationId] = {
      status: 'pending',
      userId,
      formData
    };
    
    // Запускаем генерацию в фоновом режиме
    generateGameContent(generationId, formData, userId).catch(error => {
      console.error(`Ошибка при генерации игры ${generationId}:`, error);
      generationTasks[generationId].status = 'failed';
      generationTasks[generationId].error = error.message;
    });
    
    // Возвращаем ID задачи клиенту
    res.status(202).json({
      success: true,
      message: 'Запрос на генерацию игры принят',
      generationId
    });
  } catch (error) {
    next(error);
  }
};

// Получение статуса генерации игры
export const getGameGenerationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    // Проверяем существование задачи
    if (!generationTasks[id]) {
      res.status(404).json({
        success: false,
        message: 'Задача генерации не найдена'
      });
      return;
    }
    
    // Проверяем, принадлежит ли задача пользователю
    if (generationTasks[id].userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этой задаче'
      });
      return;
    }
    
    // Возвращаем статус и данные (если есть)
    const task = generationTasks[id];
    
    const response: any = {
      success: true,
      status: task.status,
      id
    };
    
    if (task.status === 'completed') {
      response.data = task.data;
    } else if (task.status === 'failed') {
      response.error = task.error;
    }
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Функция для фактической генерации контента игры
async function generateGameContent(generationId: string, formData: AutomaticallyGeneratedGameForm, userId: string): Promise<void> {
  try {
    // Подготовка параметров для шаблона
    const templateVariables = {
      language: 'English', // Для избежания проблем с кодировкой используем английский
      numCategories: formData.categories?.length || 5,
      numQuestions: 5,
      topic: formData.theme || formData.categories?.join(', ') || 'General Knowledge'
    };
    
    // Если пользователь указал категории, добавляем их в шаблон
    if (formData.categories && formData.categories.length > 0) {
      // Транслитерируем на всякий случай, или переводим категории если возможно
      templateVariables.topic = `Categories: ${formData.categories.join(', ')}`;
    }
    
    // Если есть дополнительные детали, добавляем их
    if (formData.details) {
      templateVariables.topic += `. Additional details: ${formData.details}`;
    }
    
    // Если есть примеры вопросов, добавляем их
    if (formData.exampleQuestions) {
      templateVariables.topic += `. Example questions: ${formData.exampleQuestions}`;
    }
    
    console.log('Отправка запроса к Gemini с параметрами:', templateVariables);
    
    // Отправляем запрос к Gemini API с использованием шаблона
    const generatedContent = await geminiService.generateFromTemplate(
      jeopardy.template,
      templateVariables
    );
    
    // Парсим ответ как JSON (удаляем возможное объявление переменной)
    const cleanedJson = generatedContent
      .replace(/^const\s+\w+\s*=\s*/, '')  // Удаляем объявление переменной
      .replace(/^\s*```(javascript|json)\s*/, '') // Удаляем маркер начала кода
      .replace(/\s*```\s*$/, ''); // Удаляем маркер конца кода
    
    // Преобразуем строку JSON в объект JavaScript
    const gameData = JSON.parse(cleanedJson);
    
    // Обновляем статус задачи
    generationTasks[generationId].status = 'completed';
    generationTasks[generationId].data = gameData;
    
    // Сохраняем созданную игру в базу данных
    const game = await prisma.game.create({
      data: {
        title: formData.theme || 'Автоматически созданная игра',
        creator: {
          connect: { id: userId }
        },
        // Создаем категории из полученных от AI данных
        categories: {
          create: gameData.categories.map((cat: any, index: number) => ({
            name: cat.name,
            order: index
          }))
        },
        // Создаем ряды вопросов
        questionRows: {
          create: Array.from({ length: gameData.categories[0].questions.length }, 
            (_, i) => ({ value: (i + 1) * 100, order: i }))
        }
      },
      include: {
        categories: true,
        questionRows: true
      }
    });

    // Создаем вопросы для каждой категории и ряда
    const questions = [];
    for (let catIndex = 0; catIndex < gameData.categories.length; catIndex++) {
      const category = game.categories[catIndex];
      const aiCategory = gameData.categories[catIndex];
      
      for (let qIndex = 0; qIndex < aiCategory.questions.length; qIndex++) {
        const aiQuestion = aiCategory.questions[qIndex];
        questions.push({
          question: aiQuestion.clue,
          answer: aiQuestion.answer,
          categoryId: category.id,
          rowId: game.questionRows[qIndex].id
        });
      }
    }

    // Создаем все вопросы одним запросом
    await prisma.question.createMany({
      data: questions
    });
    
    // Добавляем ID игры в данные задачи
    generationTasks[generationId].data.gameId = game.id;
    
    console.log(`Игра ${generationId} успешно сгенерирована и сохранена с ID: ${game.id}`);
  } catch (error) {
    console.error(`Ошибка при генерации игры ${generationId}:`, error);
    generationTasks[generationId].status = 'failed';
    generationTasks[generationId].error = error instanceof Error ? error.message : 'Неизвестная ошибка';
    throw error;
  }
} 
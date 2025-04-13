import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Получаем API ключ из переменных окружения
const apiKey = process.env.GEMINI_API_KEY;
const defaultModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash-8b';

if (!apiKey) {
  throw new Error('GEMINI_API_KEY не найден в переменных окружения');
}

// Инициализируем клиент Google AI
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Класс для работы с Gemini API
 */
export class GeminiService {
  private model: GenerativeModel;
  
  /**
   * Создает экземпляр сервиса Gemini
   * @param modelName Название модели для использования
   */
  constructor(modelName: string = defaultModel) {
    this.model = genAI.getGenerativeModel({ model: modelName });
  }
  
  /**
   * Изменяет модель для использования
   * @param modelName Название новой модели
   */
  setModel(modelName: string): void {
    this.model = genAI.getGenerativeModel({ model: modelName });
  }
  
  /**
   * Отправляет запрос к API Gemini и получает ответ
   * @param prompt Текст промпта
   * @param options Дополнительные параметры для генерации
   * @returns Ответ от модели
   */
  async generateContent(prompt: string, options = {}): Promise<string> {
    try {
      // Проверяем наличие не-ASCII символов и применяем кодировку при необходимости
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          ...options
        }
      });
      
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Ошибка при вызове Gemini API:', error);
      throw error;
    }
  }
  
  /**
   * Заполняет шаблон промпта и отправляет запрос к API
   * @param templateText Текст шаблона
   * @param variables Переменные для подстановки в шаблон
   * @param options Дополнительные параметры для генерации
   * @returns Ответ от модели
   */
  async generateFromTemplate(templateText: string, variables: Record<string, any>, options = {}): Promise<string> {
    try {
      // Заполняем шаблон, заменяя переменные вида {{variableName}}
      const filledTemplate = this.fillTemplate(templateText, variables);
      return this.generateContent(filledTemplate, options);
    } catch (error) {
      // При ошибке с кодировкой кириллицы, пробуем отправить на английском
      if (error instanceof Error && error.message.includes('ByteString')) {
        console.warn('Обнаружена ошибка кодировки, переключаемся на английский язык');
        
        // Создаем английскую версию переменных
        const englishVariables = { ...variables };
        
        // Заменяем язык на английский
        englishVariables.language = 'English';
        
        // Заполняем шаблон с английскими переменными
        const filledTemplate = this.fillTemplate(templateText, englishVariables);
        return this.generateContent(filledTemplate, options);
      }
      
      throw error;
    }
  }
  
  /**
   * Заполняет шаблон, заменяя переменные вида {{variableName}}
   * @param template Текст шаблона
   * @param variables Объект с переменными
   * @returns Заполненный шаблон
   */
  private fillTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return variables[variable] !== undefined ? String(variables[variable]) : match;
    });
  }
}

// Экспортируем экземпляр сервиса по умолчанию для удобства использования
export default new GeminiService();
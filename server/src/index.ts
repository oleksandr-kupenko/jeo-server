// Swagger документация
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jeopardy API',
      version: '1.0.0',
      description: 'API для игры Jeopardy',
    },
    components: {
      schemas: {
        // ... существующие схемы ...
        
        GameSessionQuestion: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            isRevealed: { type: 'boolean' },
            isAnswered: { type: 'boolean' },
            gameSessionId: { type: 'string' },
            questionId: { type: 'string' },
            answeredByPlayerId: { type: 'string', nullable: true }
          }
        },
        
        AnswerQuestionRequest: {
          type: 'object',
          required: ['gameSessionId', 'questionId', 'playerId', 'isCorrect'],
          properties: {
            gameSessionId: { type: 'string' },
            questionId: { type: 'string' },
            playerId: { type: 'string' },
            isCorrect: { type: 'boolean' }
          }
        },
        
        Player: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            points: { type: 'integer' },
            role: { type: 'string', enum: ['GAME_MASTER', 'CONTESTANT'] },
            gameSessionId: { type: 'string' },
            userId: { type: 'string' }
          }
        }
      },
    },
    paths: {
      // ... существующие пути ...
      
      '/api/game-sessions/answer-question': {
        post: {
          summary: 'Ответить на вопрос в игровой сессии',
          tags: ['Game Sessions'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AnswerQuestionRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Успешный ответ',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      pointsChange: { type: 'integer' }
                    }
                  }
                }
              }
            },
            400: { description: 'Неверный запрос' },
            404: { description: 'Не найдено' },
            500: { description: 'Внутренняя ошибка сервера' }
          }
        }
      }
    },
  },
  apis: ['./src/routes/*.ts'],
}; 
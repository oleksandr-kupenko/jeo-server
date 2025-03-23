import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jeopardy Game API',
      version: '1.0.0',
      description: 'API для игры "Своя Игра"',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'USER'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            avatar: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            rating: { type: 'integer' },
            gamesPlayed: { type: 'integer' },
            gamesWon: { type: 'integer' },
            userId: { type: 'string', format: 'uuid' },
          },
        },
        GameRole: {
          type: 'string',
          enum: ['GAME_MASTER', 'CONTESTANT'],
        },
        Player: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            points: { type: 'integer' },
            role: { $ref: '#/components/schemas/GameRole' },
            userId: { type: 'string', format: 'uuid' },
            gameSessionId: { type: 'string', format: 'uuid' },
            user: { $ref: '#/components/schemas/User' },
            gameSession: { $ref: '#/components/schemas/GameSession' },
            answeredQuestions: {
              type: 'array',
              items: { $ref: '#/components/schemas/GameSessionQuestion' }
            }
          },
        },
        Game: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            creatorId: { type: 'string', format: 'uuid' },
            creator: { $ref: '#/components/schemas/User' },
            categories: {
              type: 'array',
              items: { $ref: '#/components/schemas/Category' }
            },
            questionRows: {
              type: 'array',
              items: { $ref: '#/components/schemas/QuestionRow' }
            },
            gameSessions: {
              type: 'array',
              items: { $ref: '#/components/schemas/GameSession' }
            }
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            order: { type: 'integer' },
            gameId: { type: 'string', format: 'uuid' },
            questions: {
              type: 'array',
              items: { $ref: '#/components/schemas/Question' }
            }
          },
        },
        QuestionRow: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            value: { type: 'integer' },
            order: { type: 'integer' },
            gameId: { type: 'string', format: 'uuid' },
            questions: {
              type: 'array',
              items: { $ref: '#/components/schemas/Question' }
            }
          },
        },
        Question: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            question: { type: 'string' },
            answer: { type: 'string' },
            categoryId: { type: 'string', format: 'uuid' },
            rowId: { type: 'string', format: 'uuid' },
            gameSessionQuestion: {
              type: 'array',
              items: { $ref: '#/components/schemas/GameSessionQuestion' }
            }
          },
        },
        GameSession: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            startedAt: { type: 'string', format: 'date-time' },
            endedAt: { type: 'string', format: 'date-time', nullable: true },
            currentTurn: { type: 'string', format: 'uuid', nullable: true },
            gameId: { type: 'string', format: 'uuid' },
            game: { $ref: '#/components/schemas/Game' },
            players: { 
              type: 'array', 
              items: { $ref: '#/components/schemas/Player' } 
            },
            questions: {
              type: 'array',
              items: { $ref: '#/components/schemas/GameSessionQuestion' }
            }
          },
        },
        GameSessionQuestion: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            isRevealed: { type: 'boolean' },
            isAnswered: { type: 'boolean' },
            gameSessionId: { type: 'string', format: 'uuid' },
            questionId: { type: 'string', format: 'uuid' },
            question: { $ref: '#/components/schemas/Question' },
            answeredByPlayerId: { type: 'string', format: 'uuid', nullable: true },
            answeredBy: { 
              $ref: '#/components/schemas/Player',
              nullable: true 
            }
          },
        },
        PlayerInput: {
          type: 'object',
          required: ['name', 'gameSessionId', 'userId'],
          properties: {
            name: { type: 'string' },
            gameSessionId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            role: { $ref: '#/components/schemas/GameRole' },
          },
        },
        PlayerUpdateInput: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            points: { type: 'integer' },
            role: { $ref: '#/components/schemas/GameRole' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Операции авторизации',
      },
      {
        name: 'Users',
        description: 'Операции с пользователями',
      },
      {
        name: 'Games',
        description: 'Операции с играми',
      },
      {
        name: 'Categories',
        description: 'Операции с категориями',
      },
      {
        name: 'Questions',
        description: 'Операции с вопросами',
      },
      {
        name: 'Players',
        description: 'Операции с игроками',
      },
      {
        name: 'GameSessions',
        description: 'Операции с игровыми сессиями',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Пути к файлам с маршрутами
};

// Создаем спецификации Swagger
const specs = swaggerJSDoc(swaggerOptions);

// Экспортируем по умолчанию
export default specs; 
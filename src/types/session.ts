import { GameSession, Prisma } from '@prisma/client';

// Типы ролей пользователя в игровой сессии
export type UserSessionRole = 'host' | 'gamemaster' | 'player';

// Расширенная сессия с информацией о роли пользователя
export type GameSessionWithUserRole = GameSession & {
  userRole: UserSessionRole;
};

// Полная сессия с вложенными отношениями
export type FullGameSession = Prisma.GameSessionGetPayload<{
  include: {
    game: {
      include: {
        creator: true;
        categories: {
          include: {
            questions: true;
          }
        };
        questionRows: true;
      }
    };
    players: {
      include: {
        user: true;
      }
    };
    questions: {
      include: {
        question: {
          include: {
            category: true;
            questionRow: true;
          }
        };
        answeredBy: true;
      }
    };
  }
}>;

// Полная сессия с ролью пользователя
export type FullGameSessionWithUserRole = FullGameSession & {
  userRole: UserSessionRole;
}; 
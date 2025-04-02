-- Добавляем ограничение на количество игроков
ALTER TABLE "GameSession" ADD CONSTRAINT check_player_counts 
CHECK ("numberOfAiPlayers" <= "numberOfPlayers" AND "numberOfPlayers" <= 10); 
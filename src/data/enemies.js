export const enemyTypes = {
    // Map 1 Enemies
    spaceMinion: { health: 10, speed: 1.5, size: 30, color: 'red', xpValue: 3, damage: 10 },
    starBat: { health: 15, speed: 2.5, size: 40, color: 'gray', xpValue: 5, damage: 15 },
    spaceMite: { health: 30, speed: 2.0, size: 25, color: 'blue', xpValue: 2, damage: 8 },
    stardustSerpent: { health: 80, speed: 1.0, size: 60, color: 'purple', xpValue: 10, damage: 20 },

	// Bosses
	boss1: { id: 'boss1', size: 100, color: '#ff8c00', xpValue: 200, damage: 30, isBoss: true }, // DarkOrange
	boss2: { id: 'boss2', size: 100, color: '#e60000', xpValue: 300, damage: 35, isBoss: true }, // Bright Red
	boss3: { id: 'boss3', size: 150, color: '#9932cc', xpValue: 400, damage: 45, isBoss: true }, // DarkOrchid
	boss4: { id: 'boss4', size: 200, color: '#4b0082', xpValue: 500, damage: 60, isBoss: true }, // Indigo
};

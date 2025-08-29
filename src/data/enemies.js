export const enemyTypes = {
    // Regular enemies
    zombie: { health: 1, speed: 1.5, size: 30, color: 'red', xpValue: 1, damage: 10 },
    bat: { health: 0.5, speed: 2.5, size: 20, color: 'gray', xpValue: 2, damage: 5 },

    // Bosses
    boss1: { id: 'boss1', health: 50, speed: 1, size: 60, color: '#ff8c00', xpValue: 100, damage: 25, isBoss: true }, // DarkOrange
    boss2: { id: 'boss2', health: 75, speed: 1.2, size: 70, color: '#e60000', xpValue: 200, damage: 35, isBoss: true }, // Bright Red
    boss3: { id: 'boss3', health: 100, speed: 1.4, size: 80, color: '#9932cc', xpValue: 300, damage: 45, isBoss: true }, // DarkOrchid
    boss4: { id: 'boss4', health: 150, speed: 1.6, size: 90, color: '#4b0082', xpValue: 500, damage: 60, isBoss: true }, // Indigo
};

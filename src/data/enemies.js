export const enemyTypes = {
    // Map 1 Enemies
    spaceMinion: { health: 10, speed: 1.5, size: 30, color: 'red', xpValue: 3, damage: 10 },
    starBat: { health: 15, speed: 2.5, size: 40, color: 'gray', xpValue: 5, damage: 15 },
    spaceMite: { health: 30, speed: 2.0, size: 25, color: 'blue', xpValue: 2, damage: 8 },
    stardustSerpent: { health: 80, speed: 1.0, size: 60, color: 'purple', xpValue: 10, damage: 20 },

    // Mapa 2 Enemies
    asteroidGolem: { health: 30, speed: 0.8, size: 100, color: 'brown', xpValue: 10, damage: 25 },
    solarWasp: { health: 18, speed: 3.5, size: 35, color: 'yellow', xpValue: 6, damage: 18 },
    vortexPhantom: { health: 25, speed: 2.2, size: 45, color: 'cyan', xpValue: 8, damage: 22 },
    cometGuardian: { health: 40, speed: 1.2, size: 80, color: 'white', xpValue: 15, damage: 35 },

    // Mapa 3 Enemies
    nebulaLeviathan: { health: 60, speed: 1.5, size: 150, color: 'magenta', xpValue: 20, damage: 50 },
    darkMatterCreeper: { health: 15, speed: 2.8, size: 38, color: 'black', xpValue: 5, damage: 16 },
    voidHunter: { health: 28, speed: 3.2, size: 55, color: 'indigo', xpValue: 9, damage: 24 },
    cosmicAnomaly: { health: 35, speed: 1.8, size: 70, color: 'orange', xpValue: 12, damage: 30 },

    // Mapa 4 Enemies
    singularityLurker: { health: 50, speed: 0.5, size: 90, color: 'gray', xpValue: 18, damage: 45 },
    galacticDragon: { health: 80, speed: 2.5, size: 200, color: 'gold', xpValue: 30, damage: 70 },
    dimensionalRift: { health: 70, speed: 1.0, size: 120, color: 'purple', xpValue: 25, damage: 60 },
    hypergiantHydra: { health: 100, speed: 1.7, size: 250, color: 'crimson', xpValue: 40, damage: 85 },

    // Mapa 5 Enemies
    quantumColossus: { health: 50, speed: 1.5, size: 300, color: 'silver', xpValue: 30, damage: 60 },
    cosmicJelly: { health: 75, speed: 2.0, size: 150, color: 'green', xpValue: 10, damage: 50 },
    quantumMilossus: { health: 150, speed: 1.5, size: 300, color: 'silver', xpValue: 30, damage: 60 },
    cosmicCream: { health: 100, speed: 2.0, size: 150, color: 'green', xpValue: 10, damage: 50 },

	// Bosses
	// --- Map 1 Bosses ---
	boss1: { id: 'boss1', name: 'Primus', size: 100, color: '#ff8c00', xpValue: 200, damage: 30, isBoss: true },
	boss5: { id: 'boss5', name: 'Beam Sentinel', size: 80, color: '#ffae42', xpValue: 250, damage: 25, isBoss: true },
	boss6: { id: 'boss6', name: 'Phase Jumper', size: 70, color: '#ffd700', xpValue: 250, damage: 35, isBoss: true },
	boss7: { id: 'boss7', name: 'Mine Layer', size: 120, color: '#ff8c00', xpValue: 250, damage: 20, isBoss: true },
	boss8: { id: 'boss8', name: 'Orbitus', size: 90, color: '#ffb347', xpValue: 250, damage: 30, isBoss: true },
	// --- Map 2 Bosses ---
	boss2: { id: 'boss2', name: 'Secundus', size: 120, color: '#e60000', xpValue: 400, damage: 35, isBoss: true },
	boss9: { id: 'boss9', name: 'Solar Ray', size: 100, color: '#dc143c', xpValue: 450, damage: 40, isBoss: true },
	boss10: { id: 'boss10', name: 'Warp Stalker', size: 90, color: '#ff0000', xpValue: 450, damage: 50, isBoss: true },
	boss11: { id: 'boss11', name: 'Gravity Well', size: 140, color: '#cd5c5c', xpValue: 450, damage: 35, isBoss: true },
	boss12: { id: 'boss12', name: 'Pulsar', size: 110, color: '#f08080', xpValue: 450, damage: 45, isBoss: true },
	// --- Map 3 Bosses ---
	boss3: { id: 'boss3', name: 'Tertius', size: 150, color: '#9932cc', xpValue: 600, damage: 45, isBoss: true },
	boss13: { id: 'boss13', name: 'Void Beam', size: 130, color: '#8a2be2', xpValue: 650, damage: 60, isBoss: true },
	boss14: { id: 'boss14', name: 'Rift Skipper', size: 110, color: '#9400d3', xpValue: 650, damage: 75, isBoss: true },
	boss15: { id: 'boss15', name: 'Singularity', size: 170, color: '#ba55d3', xpValue: 650, damage: 55, isBoss: true },
	boss16: { id: 'boss16', name: 'Quasar', size: 140, color: '#dda0dd', xpValue: 650, damage: 70, isBoss: true },
	// --- Map 4 Bosses ---
	boss4: { id: 'boss4', name: 'Quartus', size: 200, color: '#4b0082', xpValue: 800, damage: 60, isBoss: true },
	boss17: { id: 'boss17', name: 'Galactic Cannon', size: 180, color: '#6a5acd', xpValue: 850, damage: 90, isBoss: true },
	boss18: { id: 'boss18', name: 'Dimension Drifter', size: 160, color: '#483d8b', xpValue: 850, damage: 110, isBoss: true },
	boss19: { id: 'boss19', name: 'Event Horizon', size: 220, color: '#800080', xpValue: 850, damage: 80, isBoss: true },
	boss20: { id: 'boss20', name: 'Supernova', size: 190, color: '#e0b0ff', xpValue: 850, damage: 100, isBoss: true },
};

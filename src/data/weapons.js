// Las funciones de ataque ahora devuelven un array de datos de proyectiles.
// El bucle principal se encargará de crear las instancias.
export const weapons = {
    magicWand: {
        id: 1,
        name: "Varita Mágica",
        shape: { type: 'circle', radius: 8 },
        description: "Dispara un proyectil al enemigo más cercano.",
        stats: { cooldown: 120, damage: 10, speed: 8 },
        attack: (player, enemies) => {
            if (enemies.length === 0) return [];

            let nearestEnemy = null;
            let minDistance = Infinity;

            enemies.forEach(enemy => {
                const dist = Math.hypot(player.position.x - enemy.position.x, player.position.y - enemy.position.y);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestEnemy = enemy;
                }
            });

            if (!nearestEnemy) return [];

            const angle = Math.atan2(nearestEnemy.position.y - player.position.y, nearestEnemy.position.x - player.position.x);
            return [{
                type: 'projectile',
                position: { ...player.position },
                velocity: { x: Math.cos(angle) * weapons.magicWand.stats.speed, y: Math.sin(angle) * weapons.magicWand.stats.speed },
                damage: weapons.magicWand.stats.damage,
                radius: 5
            }];
        }
    },
    knives: {
        id: 2,
        name: "Cuchillos",
        shape: { type: 'rectangle', width: 15, height: 5 },
        description: "Lanza cuchillos en la dirección que mira el jugador.",
        stats: { cooldown: 80, damage: 15, speed: 12 },
        attack: (player, enemies) => {
            // Asume que el jugador tiene una propiedad 'direction' (p.ej. 'right', 'left')
            // Por ahora, lanzará hacia la derecha por defecto.
            const directionX = player.direction === 'left' ? -1 : 1;
            return [{
                type: 'projectile',
                position: { ...player.position },
                velocity: { x: directionX * weapons.knives.stats.speed, y: 0 },
                damage: weapons.knives.stats.damage,
                width: 10,
                height: 4
            }];
        }
    },
    garlic: {
        id: 3,
        name: "Ajo",
        shape: { type: 'ring', outerRadius: 60, innerRadius: 50 },
        description: "Crea un aura dañina alrededor del jugador.",
        stats: { cooldown: 150, damage: 5, area: 100 },
        attack: (player, enemies) => {
            // El ajo no crea proyectiles, su lógica de daño se aplicará en el bucle principal
            // basándose en la proximidad. Devolvemos un tipo especial.
            return [{
                type: 'aura',
                position: { ...player.position },
                radius: weapons.garlic.stats.area,
                damage: weapons.garlic.stats.damage
            }];
        }
    },
    holyWater: {
        id: 4,
        name: "Agua Bendita",
        shape: { type: 'square', size: 12 },
        description: "Lanza un frasco que crea un área de daño en el suelo.",
        stats: { cooldown: 180, damage: 8, duration: 300 }, // 5 segundos
        attack: (player, enemies) => {
            return [{
                type: 'ground_area',
                position: { x: player.position.x + Math.random() * 100 - 50, y: player.position.y + Math.random() * 100 - 50 },
                radius: 80,
                damage: weapons.holyWater.stats.damage,
                duration: weapons.holyWater.stats.duration
            }];
        }
    },
    whip: {
        id: 5,
        name: "Látigo",
        shape: { type: 'line', length: 100 },
        description: "Ataca horizontalmente a ambos lados del jugador.",
        stats: { cooldown: 100, damage: 20, range: 120 },
        attack: (player, enemies) => {
            // El látigo es un ataque instantáneo, no un proyectil persistente.
            // Devolvemos un tipo especial para manejarlo en el bucle de colisiones.
            return [
                { type: 'hitbox', position: { ...player.position }, width: weapons.whip.stats.range, height: 20, side: 'left', damage: weapons.whip.stats.damage },
                { type: 'hitbox', position: { ...player.position }, width: weapons.whip.stats.range, height: 20, side: 'right', damage: weapons.whip.stats.damage }
            ];
        }
    }
};

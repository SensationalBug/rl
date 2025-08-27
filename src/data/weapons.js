// Este archivo define el arsenal de armas disponibles en el juego.
export const weapons = {
    magicWand: {
        id: 1,
        name: "Canon",
        shape: { type: 'circle', radius: 8 },
        description: "Dispara un proyectil de energía al enemigo más cercano.",
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
        name: "Arma de rayos unitarios",
        shape: { type: 'rectangle', width: 15, height: 5 },
        description: "Lanza un rayo de energía en la dirección de la nave.",
        stats: { cooldown: 80, damage: 15, speed: 12 },
        attack: (player, enemies) => {
            return [{
                type: 'projectile',
                position: { ...player.position },
                velocity: {
                    x: player.direction.x * weapons.knives.stats.speed,
                    y: player.direction.y * weapons.knives.stats.speed
                },
                damage: weapons.knives.stats.damage,
                width: 10,
                height: 4
            }];
        }
    },
    garlic: {
        id: 3,
        name: "Onda de repulsion",
        shape: { type: 'ring', outerRadius: 60, innerRadius: 50 },
        description: "Genera un pulso de energía que daña a los enemigos cercanos.",
        stats: { cooldown: 150, damage: 5, area: 100 },
        attack: (player, enemies) => {
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
        name: "Explosion estelar",
        shape: { type: 'square', size: 12 },
        description: "Lanza un contenedor que crea un campo de energía dañino.",
        stats: { cooldown: 180, damage: 8, duration: 300 },
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
        name: "Rayo horizontal",
        shape: { type: 'line', length: 100 },
        description: "Emite un rayo de energía a ambos lados de la nave.",
        stats: { cooldown: 100, damage: 20, range: 120 },
        attack: (player, enemies) => {
            return [
                { type: 'hitbox', position: { ...player.position }, width: weapons.whip.stats.range, height: 20, side: 'left', damage: weapons.whip.stats.damage },
                { type: 'hitbox', position: { ...player.position }, width: weapons.whip.stats.range, height: 20, side: 'right', damage: weapons.whip.stats.damage }
            ];
        }
    }
};

// Este archivo define el arsenal de armas disponibles en el juego.
export const weapons = {
    'canon': {
        name: "Canon",
        description: "Dispara un proyectil de energía al enemigo más cercano.",
        stats: { cooldown: 120, damage: 5, speed: 8, amount: 1, penetration: 1 },
        upgrades: [
            { level: 2, description: "+1 Proyectil", apply: (stats) => { stats.amount += 1; } },
            { level: 3, description: "+15% Daño", apply: (stats) => { stats.damage *= 1.15; } },
            { level: 4, description: "Aumenta el ratio de disparo un 15%", apply: (stats) => { stats.cooldown *= 0.85; } },
            { level: 5, evolution: true, name: "Hiper Canon", description: "Ahora dispara munición que explota.", apply: (stats) => { stats.damage *= 1.20; }}
        ],
        attack: (player, weaponInstance, enemies) => {
            const stats = weaponInstance.getStats();
            if (enemies.length === 0) return [];

            // This needs to be improved to select multiple unique enemies for multiple projectiles
            const targets = [...enemies].sort((a,b) => Math.hypot(player.position.x - a.position.x, player.position.y - a.position.y) - Math.hypot(player.position.x - b.position.x, player.position.y - b.position.y));

            const attacks = [];
            for (let i = 0; i < stats.amount && i < targets.length; i++) {
                const angle = Math.atan2(targets[i].position.y - player.position.y, targets[i].position.x - player.position.x);
                attacks.push({
                    type: 'projectile',
                    position: { ...player.position },
                    velocity: { x: Math.cos(angle) * stats.speed, y: Math.sin(angle) * stats.speed },
                    damage: stats.damage,
                });
            }
            return attacks;
        }
    },
    'arma-de-rayos-unitarios': {
        name: "Arma de rayos unitarios",
        description: "Lanza un rayo de energía en la dirección de la nave.",
        stats: { cooldown: 80, damage: 5, speed: 12, amount: 1, penetration: 1 },
        upgrades: [
            { level: 2, description: "+1 Proyectil", apply: (stats) => { stats.amount += 1; } },
            { level: 3, description: "+15% Daño", apply: (stats) => { stats.damage *= 1.15; } },
            { level: 4, description: "Aumenta el ratio de disparo un 15%", apply: (stats) => { stats.cooldown *= 0.85; } },
            { level: 5, evolution: true, name: "Arma de rayos Max", description: "Los disparos se dispersan al impactar.", apply: (stats) => { /* ... */ }}
        ],
        attack: (player, weaponInstance, enemies) => {
            const stats = weaponInstance.getStats();
            const attacks = [];
            // Creates a spread of projectiles
            const spreadAngle = Math.PI / 12; // 15 degrees spread
            for (let i = 0; i < stats.amount; i++) {
                const angleOffset = (i - (stats.amount - 1) / 2) * spreadAngle;
                const angle = Math.atan2(player.direction.y, player.direction.x) + angleOffset;
                attacks.push({
                    type: 'projectile',
                    position: { ...player.position },
                    velocity: { x: Math.cos(angle) * stats.speed, y: Math.sin(angle) * stats.speed },
                    damage: stats.damage,
                });
            }
            return attacks;
        }
    },
    'onda-de-repulsion': {
        name: "Onda de repulsion",
        description: "Genera un pulso de energía que daña a los enemigos cercanos.",
        stats: { cooldown: 480, duration: 240, damage: 10, area: 100, slow: 0 }, // Cooldown = duration + downtime
        upgrades: [
            { level: 2, description: "+25% Área", apply: (stats) => { stats.area *= 1.25; } },
            { level: 3, description: "+20% Duración", apply: (stats) => { stats.duration *= 1.20; } },
            { level: 4, description: "-15% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.85; } },
            { level: 5, evolution: true, name: "Agujero blanco", description: "Duplica el área del efecto y aumenta la ralentización.", apply: (stats) => {
                console.log(`Evolving to Agujero Blanco. Area before: ${stats.area}`);
                stats.area *= 2;
                console.log(`Area after: ${stats.area}`);
            }}
        ],
        attack: (player, weaponInstance, enemies) => {
            const stats = weaponInstance.getStats();
            return [{ type: 'aura', position: { ...player.position }, radius: stats.area, damage: stats.damage, duration: stats.duration }];
        }
    },
    'explosion-estelar': {
        name: "Explosion estelar",
        description: "Lanza un contenedor que crea un campo de energía dañino.",
        stats: { cooldown: 300, damage: 5, duration: 300, area: 80, amount: 1 },
        upgrades: [
            { level: 2, description: "+1 Contenedor", apply: (stats) => { stats.amount += 1; } },
            { level: 3, description: "+20% Área", apply: (stats) => { stats.area *= 1.20; } },
            { level: 4, description: "-15% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.85; } },
            { level: 5, evolution: true, name: "Polvo Estelar", description: "Deja un rastro que quema a los enemigos.", apply: (stats) => { /* ... */ }}
        ],
        attack: (player, weaponInstance, enemies) => {
            const stats = weaponInstance.getStats();
            const attacks = [];
            for (let i = 0; i < stats.amount; i++) {
                attacks.push({
                    type: 'ground_area',
                    position: { x: player.position.x + Math.random() * 200 - 100, y: player.position.y + Math.random() * 200 - 100 },
                    radius: stats.area,
                    damage: stats.damage,
                    duration: stats.duration
                });
            }
            return attacks;
        }
    },
    'rayo-horizontal': {
        name: "Rayo horizontal",
        description: "Emite un rayo de energía a ambos lados de la nave.",
        stats: { cooldown: 100, damage: 15, range: 120, amount: 1 },
        upgrades: [
            { level: 2, description: "+15% Daño", apply: (stats) => { stats.damage *= 1.15; } },
            { level: 3, description: "Añade un rayo en otra dirección", apply: (stats) => { stats.amount += 1; } },
            { level: 4, description: "-15% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.85; } },
            { level: 5, evolution: true, name: "Rayo desintegrador", description: "Dispara rayos en 4 direcciones y hace más daño.", apply: (stats) => { /* ... */ }}
        ],
        attack: (player, weaponInstance, enemies) => {
            const stats = weaponInstance.getStats();
            const attacks = [];
            attacks.push({ type: 'hitbox', position: { ...player.position }, width: stats.range, height: 20, side: 'left', damage: stats.damage });
            attacks.push({ type: 'hitbox', position: { ...player.position }, width: stats.range, height: 20, side: 'right', damage: stats.damage });
            if (stats.amount > 1) {
                attacks.push({ type: 'hitbox', position: { ...player.position }, width: stats.range, height: 20, side: 'top', damage: stats.damage });
                attacks.push({ type: 'hitbox', position: { ...player.position }, width: stats.range, height: 20, side: 'bottom', damage: stats.damage });
            }
            return attacks;
        }
    }
};

// Este archivo define el arsenal de armas disponibles en el juego.
export const weapons = {
    'canon': {
        name: "Canon",
        description: "Dispara un proyectil de energía al enemigo más cercano.",
        stats: { cooldown: 120, damage: 5, speed: 8, amount: 1, penetration: 1 },
        maxLevel: 8,
        upgradePool: [
            { description: "+10% Daño", apply: (stats) => { stats.damage *= 1.10; } },
            { description: "+1 Proyectil", apply: (stats) => { stats.amount += 1; }, max: 3 }, // max applications
            { description: "-8% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.92; } },
            { description: "+1 Penetración", apply: (stats) => { stats.penetration += 1; }, max: 2 },
        ],
        evolution: {
            name: "Hiper Canon",
            description: "Ahora dispara munición que explota.",
            apply: (stats) => { stats.damage *= 1.50; }
        },
        attack: (player, weaponInstance, enemies) => {
            const stats = weaponInstance.getStats();
            if (enemies.length === 0) return [];
            const targets = [...enemies].sort((a, b) => Math.hypot(player.position.x - a.position.x, player.position.y - a.position.y) - Math.hypot(player.position.x - b.position.x, player.position.y - b.position.y));
            const attacks = [];
            for (let i = 0; i < stats.amount && i < targets.length; i++) {
                const angle = Math.atan2(targets[i].position.y - player.position.y, targets[i].position.x - player.position.x);
                attacks.push({
                    type: 'projectile',
                    position: { ...player.position },
                    velocity: { x: Math.cos(angle) * stats.speed, y: Math.sin(angle) * stats.speed },
                    damage: stats.damage,
                    sourceWeapon: weaponInstance
                });
            }
            return attacks;
        }
    },
    'arma-de-rayos-unitarios': {
        name: "Arma de rayos unitarios",
        description: "Lanza un rayo de energía en la dirección de la nave.",
        stats: { cooldown: 80, damage: 5, speed: 12, amount: 1, penetration: 1 },
        maxLevel: 8,
        upgradePool: [
            { description: "+10% Daño", apply: (stats) => { stats.damage *= 1.10; } },
            { description: "+1 Proyectil", apply: (stats) => { stats.amount += 1; }, max: 4 },
            { description: "-8% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.92; } },
            { description: "+15% Velocidad de proyectil", apply: (stats) => { stats.speed *= 1.15; } }
        ],
        evolution: {
            name: "Arma de rayos Max",
            description: "Los disparos se dispersan al impactar.",
            apply: (stats) => { /* Logic for this will be in collision detection */ }
        },
        attack: (player, weaponInstance, enemies) => {
            const stats = weaponInstance.getStats();
            const attacks = [];
            const spreadAngle = Math.PI / 12; // 15 degrees spread
            for (let i = 0; i < stats.amount; i++) {
                const angleOffset = (i - (stats.amount - 1) / 2) * spreadAngle;
                const angle = Math.atan2(player.direction.y, player.direction.x) + angleOffset;
                attacks.push({
                    type: 'projectile',
                    position: { ...player.position },
                    velocity: { x: Math.cos(angle) * stats.speed, y: Math.sin(angle) * stats.speed },
                    damage: stats.damage,
                    sourceWeapon: weaponInstance
                });
            }
            return attacks;
        }
    },
    'onda-de-repulsion': {
        name: "Onda de repulsion",
        description: "Genera un pulso de energía que daña a los enemigos cercanos.",
        stats: { cooldown: 480, duration: 240, damage: 10, area: 100, slow: 0 },
        maxLevel: 8,
        upgradePool: [
            { description: "+15% Daño", apply: (stats) => { stats.damage *= 1.15; } },
            { description: "+20% Área", apply: (stats) => { stats.area *= 1.20; } },
            { description: "-8% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.92; } },
            { description: "+15% Duración", apply: (stats) => { stats.duration *= 1.15; } }
        ],
        evolution: {
            name: "Agujero blanco",
            description: "Duplica el área del efecto y aumenta la ralentización.",
            apply: (stats) => { stats.area *= 2; stats.slow = 0.5; }
        },
        attack: (player, weaponInstance, enemies) => {
            return []; // Logic is handled directly in main.js
        }
    },
    'explosion-estelar': {
        name: "Explosion estelar",
        description: "Lanza un contenedor que crea un campo de energía dañino.",
        stats: { cooldown: 300, damage: 5, duration: 300, area: 80, amount: 1 },
        maxLevel: 8,
        upgradePool: [
            { description: "+15% Daño", apply: (stats) => { stats.damage *= 1.15; } },
            { description: "+20% Área", apply: (stats) => { stats.area *= 1.20; } },
            { description: "-8% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.92; } },
            { description: "+1 Contenedor", apply: (stats) => { stats.amount += 1; }, max: 2 }
        ],
        evolution: {
            name: "Polvo Estelar",
            description: "Deja un rastro que quema a los enemigos.",
            apply: (stats) => { /* This would require a new mechanic */ }
        },
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
        maxLevel: 8,
        upgradePool: [
            { description: "+15% Daño", apply: (stats) => { stats.damage *= 1.15; } },
            { description: "+20% Alcance", apply: (stats) => { stats.range *= 1.20; } },
            { description: "-8% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.92; } }
        ],
        evolution: {
            name: "Rayo desintegrador",
            description: "Dispara rayos en 4 direcciones y hace más daño.",
            apply: (stats) => { stats.amount = 2; stats.damage *= 1.25; } // amount: 2 signifies 4 directions
        },
        attack: (player, weaponInstance, enemies) => {
            const stats = weaponInstance.getStats();
            const attacks = [];
            attacks.push({ type: 'hitbox', position: { ...player.position }, width: stats.range, height: 20, side: 'left', damage: stats.damage });
            attacks.push({ type: 'hitbox', position: { ...player.position }, width: stats.range, height: 20, side: 'right', damage: stats.damage });
            if (stats.amount > 1) { // The evolution sets amount to 2
                attacks.push({ type: 'hitbox', position: { ...player.position }, width: 20, height: stats.range, side: 'top', damage: stats.damage });
                attacks.push({ type: 'hitbox', position: { ...player.position }, width: 20, height: stats.range, side: 'bottom', damage: stats.damage });
            }
            return attacks;
        }
    }
};

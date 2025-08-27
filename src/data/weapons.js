// Este archivo define el arsenal de armas disponibles en el juego.
export const weapons = {
    magicWand: {
        id: 'magicWand',
        name: "Canon",
        description: "Dispara un proyectil de energía al enemigo más cercano.",
        stats: { cooldown: 120, damage: 10, speed: 8, amount: 1, penetration: 1 },
        upgrades: [
            { level: 2, description: "+10% Daño", apply: (stats) => { stats.damage *= 1.10; } },
            { level: 3, description: "+1 Proyectil", apply: (stats) => { stats.amount += 1; } },
            { level: 4, description: "Aumenta el ratio de disparo un 15%", apply: (stats) => { stats.cooldown *= 0.85; } },
            { level: 5, evolution: true, name: "Hiper Canon", description: "Ahora dispara munición que explota, inflingiendo daño en área.", apply: (weapon) => {
                weapon.name = "Hiper Canon";
                weapon.stats.damage *= 1.20;
                // La lógica de explosión se manejará en el sistema de colisiones.
                weapon.attack = (player, enemies) => { /* ... new attack logic ... */ };
            }}
        ],
        attack: (player, weaponInstance, enemies) => { /* ... */ }
    },
    knives: {
        id: 'knives',
        name: "Arma de rayos unitarios",
        description: "Lanza un rayo de energía en la dirección de la nave.",
        stats: { cooldown: 80, damage: 15, speed: 12, amount: 1, penetration: 1 },
        upgrades: [
            { level: 2, description: "+10% Daño", apply: (stats) => { stats.damage *= 1.10; } },
            { level: 3, description: "+1 Proyectil", apply: (stats) => { stats.amount += 1; } },
            { level: 4, description: "Aumenta el ratio de disparo un 15%", apply: (stats) => { stats.cooldown *= 0.85; } },
            { level: 5, evolution: true, name: "Arma de rayos Max", description: "Los disparos se dispersan al impactar.", apply: (weapon) => { /* ... */ }}
        ],
        attack: (player, weaponInstance, enemies) => { /* ... */ }
    },
    garlic: {
        id: 'garlic',
        name: "Onda de repulsion",
        description: "Genera un pulso de energía que daña a los enemigos cercanos.",
        stats: { cooldown: 150, damage: 5, area: 100, slow: 0 },
        upgrades: [
            { level: 2, description: "+15% Daño", apply: (stats) => { stats.damage *= 1.15; } },
            { level: 3, description: "+20% Área", apply: (stats) => { stats.area *= 1.20; } },
            { level: 4, description: "Ahora ralentiza a los enemigos un 20%", apply: (stats) => { stats.slow = 0.20; } },
            { level: 5, evolution: true, name: "Agujero blanco", description: "Duplica el daño y aumenta la ralentización al 50%.", apply: (weapon) => { /* ... */ }}
        ],
        attack: (player, weaponInstance, enemies) => { /* ... */ }
    },
    holyWater: {
        id: 'holyWater',
        name: "Explosion estelar",
        description: "Lanza un contenedor que crea un campo de energía dañino.",
        stats: { cooldown: 180, damage: 8, duration: 300, area: 80 },
        upgrades: [
            { level: 2, description: "+15% Daño", apply: (stats) => { stats.damage *= 1.15; } },
            { level: 3, description: "+20% Área", apply: (stats) => { stats.area *= 1.20; } },
            { level: 4, description: "-15% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.85; } },
            { level: 5, evolution: true, name: "Polvo Estelar", description: "Deja un rastro que quema a los enemigos.", apply: (weapon) => { /* ... */ }}
        ],
        attack: (player, weaponInstance, enemies) => { /* ... */ }
    },
    whip: {
        id: 'whip',
        name: "Rayo horizontal",
        description: "Emite un rayo de energía a ambos lados de la nave.",
        stats: { cooldown: 100, damage: 20, range: 120, amount: 1 },
        upgrades: [
            { level: 2, description: "+15% Daño", apply: (stats) => { stats.damage *= 1.15; } },
            { level: 3, description: "Añade un rayo diagonal", apply: (stats) => { stats.amount += 1; } },
            { level: 4, description: "-15% Enfriamiento", apply: (stats) => { stats.cooldown *= 0.85; } },
            { level: 5, evolution: true, name: "Rayo desintegrador", description: "Dispara en 4 direcciones y hace más daño.", apply: (weapon) => { /* ... */ }}
        ],
        attack: (player, weaponInstance, enemies) => { /* ... */ }
    }
};

// I'm leaving the attack functions empty for now. I will need to refactor them
// in a later step to account for multiple weapon instances and leveled-up stats.
// The core data structure is the important part of this step.
// The attack functions will now need to take the `weaponInstance` to get current level stats.
// For example: `velocity: { x: Math.cos(angle) * weaponInstance.stats.speed, ... }`
// The logic for handling multiple projectiles, penetration, etc., will also go here.
// But for now, I'll clear them to avoid confusion, as they need a big refactor.
Object.values(weapons).forEach(weapon => {
    weapon.attack = (player, weaponInstance, enemies) => { return []; };
});

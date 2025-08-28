// This file defines the permanent, global upgrades that can be purchased with gold.

export const globalUpgrades = {
    // Weapon-specific upgrades
    weapons: {
        'canon': {
            name: "Mejoras de Canon",
            upgrades: {
                'amount': {
                    name: "+1 Proyectil",
                    costs: [500, 1500, 5000],
                    apply: (stats) => { stats.amount += 1; }
                },
                'cooldown': {
                    name: "Enfriamiento -20%",
                    costs: [500, 1000, 3000],
                    apply: (stats) => { stats.cooldown *= 0.80; }
                },
                'damage': {
                    name: "Daño +25%",
                    costs: [1500, 5000, 10000],
                    apply: (stats) => { stats.damage *= 1.25; }
                }
            }
        },
        'arma-de-rayos-unitarios': {
            name: "Mejoras de Arma de Rayos",
            upgrades: {
                'amount': {
                    name: "+1 Proyectil",
                    costs: [500, 1500, 5000],
                    apply: (stats) => { stats.amount += 1; }
                },
                'cooldown': {
                    name: "Velocidad de ataque +20%", // This is a cooldown reduction
                    costs: [500, 1000, 3000],
                    apply: (stats) => { stats.cooldown *= 0.80; }
                },
                'damage': {
                    name: "Daño +20%",
                    costs: [1000, 3000, 7000],
                    apply: (stats) => { stats.damage *= 1.20; }
                }
            }
        },
        'onda-de-repulsion': {
            name: "Mejoras de Onda",
            upgrades: {
                'area': {
                    name: "Área de efecto +10%",
                    costs: [750, 2500, 6000],
                    apply: (stats) => { stats.area *= 1.10; }
                },
                'cooldown': {
                    name: "Enfriamiento -20%",
                    costs: [1000, 3000, 3000], // User provided same cost twice, keeping it
                    apply: (stats) => { stats.cooldown *= 0.80; }
                },
                'damage': {
                    name: "Daño +25%",
                    costs: [1500, 5000, 10000],
                    apply: (stats) => { stats.damage *= 1.25; }
                }
            }
        },
        'explosion-estelar': {
            name: "Mejoras de Explosión",
            upgrades: {
                'area': {
                    name: "Área de efecto +20%",
                    costs: [1500, 3500, 5500],
                    apply: (stats) => { stats.area *= 1.20; }
                },
                'cooldown': {
                    name: "Enfriamiento -20%",
                    costs: [500, 1000, 3000],
                    apply: (stats) => { stats.cooldown *= 0.80; }
                },
                'damage': {
                    name: "Daño +25%",
                    costs: [2500, 5000, 10000],
                    apply: (stats) => { stats.damage *= 1.25; }
                }
            }
        },
        'rayo-horizontal': {
            name: "Mejoras de Rayo Horizontal",
            upgrades: {
                'range': {
                    name: "Alcance +20%",
                    costs: [500, 1500, 5000],
                    apply: (stats) => { stats.range *= 1.20; }
                },
                'cooldown': {
                    name: "Enfriamiento -20%",
                    costs: [500, 1000, 3000],
                    apply: (stats) => { stats.cooldown *= 0.80; }
                },
                'damage': {
                    name: "Daño +25%",
                    costs: [1500, 5000, 10000],
                    apply: (stats) => { stats.damage *= 1.25; }
                }
            }
        }
    },
    // Player-specific upgrades
    player: {
        name: "Mejoras de Personaje",
        upgrades: {
            'revive': {
                name: "Vida Extra",
                description: "La primera vez que tu vida llega a 0, se rellena al 100%.",
                costs: [2000, 20000],
                apply: (playerStats) => { playerStats.revives += 1; }
            },
            'speed': {
                name: "Velocidad de Movimiento +10%",
                costs: [1000, 5000],
                apply: (playerStats) => { playerStats.speed *= 1.10; }
            },
            'damage': {
                name: "Daño +20%",
                costs: [2500, 10000], // Corrected user typo of 1000 for level 2
                apply: (playerStats) => { playerStats.damage_bonus += 0.20; }
            }
        }
    }
};

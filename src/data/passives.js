// Este archivo define las mejoras pasivas que el jugador puede obtener.
export const passives = [
    {
        id: 'health_up',
        name: "Casco Reforzado",
        description: "Aumenta la vida máxima en 20.",
        apply: (player) => {
            player.maxHealth += 20;
            player.health += 20; // Heal for the same amount
        }
    },
    {
        id: 'speed_up',
        name: "Propulsores Mejorados",
        description: "Aumenta la velocidad de movimiento en un 10%.",
        apply: (player) => {
            player.speed *= 1.10;
        }
    },
    {
        id: 'cooldown_down', // "Attack speed up"
        name: "Sistema de Enfriamiento",
        description: "Reduce el enfriamiento de todas las armas un 8%.",
        apply: (player) => {
            // This needs to be applied to all current and future weapons.
            // We can add a multiplier to the player stats.
            if (!player.cooldown_modifier) player.cooldown_modifier = 1;
            player.cooldown_modifier *= 0.92;
        }
    },
    {
        id: 'health_regen_percent',
        name: "Nanobots de Reparación",
        description: "Repara un 1% de la vida máxima por segundo.",
        apply: (player) => {
            if (!player.healthRegenPercent) player.healthRegenPercent = 0;
            player.healthRegenPercent += 0.01; // 1%
        }
    }
];

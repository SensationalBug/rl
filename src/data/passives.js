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
        id: 'cooldown_down',
        name: "Libro de Hechizos",
        description: "Reduce el enfriamiento de todas las armas un 8%.",
        apply: (player) => {
            if (!player.cooldown_modifier) player.cooldown_modifier = 1;
            player.cooldown_modifier *= 0.92;
        }
    },
    {
        id: 'pickup_radius_up',
        name: "Imán",
        description: "Aumenta el radio de recolección un 25%.",
        apply: (player) => {
            player.pickupRadius *= 1.25;
        }
    },
    {
        id: 'luck_up',
        name: "Trébol de 4 Hojas",
        description: "Aumenta la suerte un 10%. Afecta las recompensas y eventos.",
        apply: (player) => {
            if (!player.luck) player.luck = 1;
            player.luck *= 1.10;
        }
    },
    {
        id: 'projectile_count_up',
        name: "Duplicador",
        description: "Añade +1 proyectil a las armas que lo permitan.",
        apply: (player) => {
            if (!player.projectileCount) player.projectileCount = 1;
            player.projectileCount += 1;
        }
    },
    {
        id: 'health_regen_percent',
        name: "Nanobots de Reparación",
        description: "Repara un 1% de la vida máxima por segundo.",
        apply: (player) => {
            if (!player.healthRegenPercent) player.healthRegenPercent = 0;
            player.healthRegenPercent += 0.01;
        }
    }
];

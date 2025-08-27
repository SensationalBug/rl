// Las funciones de ataque ahora devuelven un array de datos de proyectiles.
// El bucle principal se encargará de crear las instancias.
export const weapons = {
    magicWand: {
        name: "Magic Wand",
        cooldown: 120,
        attack: (player, enemies) => {
            if (enemies.length === 0) return []; // Devuelve array vacío si no hay enemigos

            let nearestEnemy = enemies[0];
            let minDistance = Infinity;

            enemies.forEach(enemy => {
                const dist = Math.hypot(player.position.x - enemy.position.x, player.position.y - enemy.position.y);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestEnemy = enemy;
                }
            });

            const angle = Math.atan2(nearestEnemy.position.y - player.position.y, nearestEnemy.position.x - player.position.x);
            // Devolver los datos para un nuevo proyectil.
            return [{
                position: { x: player.position.x + player.width / 2, y: player.position.y + player.height / 2 },
                velocity: { x: Math.cos(angle) * 8, y: Math.sin(angle) * 8 }
            }];
        }
    }
};

export class GroundArea {
    constructor({ position, radius, damage, duration }) {
        this.position = position;
        this.radius = radius;
        this.damage = damage;
        this.duration = duration;
        this.isMarkedForDeletion = false;
    }

    update(enemies) {
        // Apply damage to enemies within the area
        enemies.forEach(enemy => {
            const dist = Math.hypot(this.position.x - enemy.position.x, this.position.y - enemy.position.y);
            if (dist < this.radius) {
                // In a real implementation, we would throttle this damage (e.g., once per second).
                // For now, we apply small damage each frame the enemy is in the area.
                enemy.takeDamage(this.damage / 60); // Assuming 60 FPS, applies total damage over 1 second.
            }
        });

        this.duration--;
        if (this.duration <= 0) {
            this.isMarkedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 180, 255, 0.3)'; // Light blue, semi-transparent
        ctx.fill();
    }
}

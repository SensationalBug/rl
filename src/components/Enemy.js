export class Enemy {
    constructor({ position, type }) {
        this.position = position;
        this.type = type;
        this.width = type.size;
        this.height = type.size;
        this.speed = type.speed;
        this.color = type.color;
        this.health = type.health;
        this.maxHealth = type.health; // Add maxHealth
        this.damage = type.damage;
        this.xpValue = type.xpValue;
        this.isMarkedForDeletion = false;
        this.slowMultiplier = 1; // 1 = no slow
    }

    draw(ctx) {
        // Draw the enemy
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Draw Health Bar
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
            const healthBarX = this.position.x;
            const healthBarY = this.position.y - healthBarHeight - 2; // 2px above the enemy

            const healthPercentage = this.health / this.maxHealth;

            // Background
            ctx.fillStyle = 'red';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

            // Foreground
            ctx.fillStyle = 'green';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
    }

    update(player) {
        const angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        const currentSpeed = this.speed * this.slowMultiplier;
        this.position.x += Math.cos(angle) * currentSpeed;
        this.position.y += Math.sin(angle) * currentSpeed;

        // Reset slow multiplier each frame, it will be re-applied by auras if necessary
        this.slowMultiplier = 1;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.isMarkedForDeletion = true;
        }
    }
}

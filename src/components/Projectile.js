export class Projectile {
    constructor({ position, velocity, damage, source, sourceWeapon = null, color = 'cyan', homing = false }) {
        this.position = position;
        this.velocity = velocity;
        this.damage = damage;
        this.source = source; // 'player' or 'enemy'
        this.sourceWeapon = sourceWeapon;
        this.radius = 5;
        this.color = color;
        this.isMarkedForDeletion = false;
        this.homing = homing;
        this.homingStrength = 0.05; // How sharply it turns
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(player) {
        if (this.homing && this.source === 'enemy' && player) {
            const angleToPlayer = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
            const currentAngle = Math.atan2(this.velocity.y, this.velocity.x);

            // Gently turn towards the player
            let angleDiff = angleToPlayer - currentAngle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            const newAngle = currentAngle + angleDiff * this.homingStrength;
            const speed = Math.hypot(this.velocity.x, this.velocity.y);

            this.velocity.x = Math.cos(newAngle) * speed;
            this.velocity.y = Math.sin(newAngle) * speed;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

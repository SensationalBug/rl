export class Projectile {
    constructor({ position, velocity, damage, source, sourceWeapon = null, color = 'cyan' }) {
        this.position = position;
        this.velocity = velocity;
        this.damage = damage;
        this.source = source; // 'player' or 'enemy'
        this.sourceWeapon = sourceWeapon;
        this.radius = 5;
        this.color = color;
        this.isMarkedForDeletion = false;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

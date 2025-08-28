export class Projectile {
    constructor({ position, velocity, damage, sourceWeapon }) {
        this.position = position;
        this.velocity = velocity;
        this.damage = damage;
        this.sourceWeapon = sourceWeapon;
        this.radius = 5;
        this.isMarkedForDeletion = false;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'cyan';
        ctx.fill();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

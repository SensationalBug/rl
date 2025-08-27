export class Enemy {
    constructor({ position, type }) {
        this.position = position;
        this.type = type;
        this.width = type.size;
        this.height = type.size;
        this.speed = type.speed;
        this.color = type.color;
        this.health = type.health;
        this.isMarkedForDeletion = false;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(player) {
        const angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        this.position.x += Math.cos(angle) * this.speed;
        this.position.y += Math.sin(angle) * this.speed;
    }
}

export class XPGem {
    constructor({ position, value = 1 }) {
        this.position = position;
        this.value = value;
        this.width = 10;
        this.height = 10;
        this.isMarkedForDeletion = false;
    }

    draw(ctx) {
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(player) {
        const dist = Math.hypot(player.position.x - this.position.x, player.position.y - this.position.y);
        if (dist < player.pickupRadius) {
            const angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
            this.position.x += Math.cos(angle) * 4;
            this.position.y += Math.sin(angle) * 4;
        }
    }
}

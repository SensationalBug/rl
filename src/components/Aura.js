export class Aura {
    constructor({ position, radius, duration }) {
        this.position = position;
        this.radius = radius;
        this.duration = duration;
        this.isMarkedForDeletion = false;
    }

    update(playerPosition) {
        // Aura follows the player
        this.position.x = playerPosition.x;
        this.position.y = playerPosition.y;

        this.duration--;
        if (this.duration <= 0) {
            this.isMarkedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 100, 0.8)'; // Yellowish color
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

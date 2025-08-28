export class VisualEffect {
    constructor({ position, width, height, color = 'yellow', duration = 10 }) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
        this.duration = duration;
        this.isMarkedForDeletion = false;
    }

    update() {
        this.duration--;
        if (this.duration <= 0) {
            this.isMarkedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

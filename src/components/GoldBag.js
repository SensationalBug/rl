export class GoldBag {
    constructor({ position, value = 10 }) {
        this.position = position;
        this.value = value;
        this.width = 15;
        this.height = 15;
        this.isMarkedForDeletion = false;
    }

    draw(ctx) {
        ctx.fillStyle = 'gold';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
}

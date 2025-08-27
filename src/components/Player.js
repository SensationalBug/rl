export class Player {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.weapon = null;
        this.attackCooldown = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 10;
        this.pickupRadius = 150;
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.level++;
            this.xp -= this.xpToNextLevel;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
            return true; // Leveled up
        }
        return false; // Did not level up
    }
}

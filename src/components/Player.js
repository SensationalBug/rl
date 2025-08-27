import { drawPolygon } from '../utils/drawing.js';

export class Player {
    /**
     * @param {object} character - The character data object from characters.js.
     */
    constructor(character) {
        // Core properties
        this.position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.velocity = { x: 0, y: 0 };
        this.width = 40;
        this.height = 40;

        // Stats from the selected character
        this.speed = character.stats.speed;
        this.health = character.stats.health;
        this.maxHealth = character.stats.health;
        this.damage_bonus = character.stats.damage_bonus;
        this.pickupRadius = character.stats.pickup_radius;

        // Visual representation
        this.shape = character.shape;

        // Weapon and attack properties
        this.weapon = null; // This will be set in the main init() function
        this.attackCooldown = 0;

        // Leveling properties
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 10;
    }

    draw(ctx) {
        if (this.shape.type === 'polygon') {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            drawPolygon(ctx, this.position.x, this.position.y, this.width / 2, this.shape.sides);
        } else {
            // Fallback to a rectangle if no shape is defined
            ctx.fillStyle = 'white';
            ctx.fillRect(this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
        }
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

export class Player {
    /**
     * @param {object} character - The character data object from characters.js.
     */
    constructor(character) {
        // Core properties
        this.position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.velocity = { x: 0, y: 0 };
        this.width = 40; // The hitbox width
        this.height = 40; // The hitbox height
        this.direction = { x: 0, y: -1 }; // Start facing up, as per the new assets

        // Stats from the selected character
        this.speed = character.stats.speed;
        this.health = character.stats.health;
        this.maxHealth = character.stats.health;
        this.damage_bonus = character.stats.damage_bonus;
        this.pickupRadius = character.stats.pickup_radius;

        // Visual representation
        this.image = new Image();
        this.image.src = character.imageSrc;
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.onerror = () => {
            console.error(`Failed to load image at: ${character.imageSrc}`);
        };


        // Weapon and attack properties
        this.weapons = []; // Player can have multiple weapon instances

        // Modifiers from passive upgrades
        this.cooldown_modifier = 1;
        this.health_regen = 0;

        // Leveling properties
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 10;
    }

    draw(ctx) {
        ctx.save();
        // Translate context to the player's position
        ctx.translate(this.position.x, this.position.y);

        // Calculate rotation angle
        // The angle is calculated from the direction vector, with an offset because the image faces up
        const angle = Math.atan2(this.direction.y, this.direction.x) + Math.PI / 2;
        ctx.rotate(angle);

        // Draw the image if it's loaded, otherwise draw a fallback shape
        if (this.imageLoaded) {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // Fallback to a triangle if the image hasn't loaded yet
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(-this.width / 2, this.height / 2);
            ctx.lineTo(this.width / 2, this.height / 2);
            ctx.closePath();
            ctx.fillStyle = 'white';
            ctx.fill();
        }

        ctx.restore();

        // Draw Health Bar
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthBarX = this.position.x - healthBarWidth / 2;
        const healthBarY = this.position.y + this.height / 2 + 5; // 5px below the player

        const healthPercentage = this.health / this.maxHealth;

        // Background
        ctx.fillStyle = 'red';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        // Foreground
        ctx.fillStyle = 'green';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
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

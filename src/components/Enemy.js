export class Enemy {
    constructor({ position, type, stats = null }) {
        this.position = position;
        this.type = type;

        // Use provided stats for dynamic scaling, or fallback to the base type stats
        const currentStats = stats || type;

        this.width = currentStats.size;
        this.height = currentStats.size;
        this.speed = currentStats.speed;
        this.originalColor = currentStats.color;
        this.color = currentStats.color;
        this.health = currentStats.health;
        this.maxHealth = currentStats.health;
        this.damage = currentStats.damage;
        this.xpValue = currentStats.xpValue;
        this.isBoss = currentStats.isBoss || false;

        this.isMarkedForDeletion = false;
        this.slowMultiplier = 1; // 1 = no slow

        if (this.isBoss) {
            this.attackCooldown = 0;
            this.attackTimer = 120; // Attacks every 2 seconds
            this.bossState = 'MOVING'; // MOVING, CHARGING, DASHING
            this.bossStateTimer = 0;
            this.dashTarget = { x: 0, y: 0 };
        }
    }

    draw(ctx) {
        // Draw the enemy
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Draw Health Bar
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
            const healthBarX = this.position.x;
            const healthBarY = this.position.y - healthBarHeight - 2; // 2px above the enemy

            const healthPercentage = this.health / this.maxHealth;

            // Background
            ctx.fillStyle = 'red';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

            // Foreground
            ctx.fillStyle = 'green';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
    }

    update(player) {
        if (this.isBoss && this.type.id === 'boss4' && this.bossState !== 'DASHING') {
            this.bossStateTimer--;
            if (this.bossState === 'CHARGING') {
                if (this.bossStateTimer <= 0) {
                    this.bossState = 'DASHING';
                    this.bossStateTimer = 60; // Dash duration
                    this.color = this.originalColor;
                }
                // Don't move while charging
                return;
            }
            if (this.bossStateTimer <= 0) {
                this.bossState = 'CHARGING';
                this.bossStateTimer = 90; // Charge duration
                this.color = 'white'; // Charge indicator
                this.dashTarget = { ...player.position };
            }
        }

        const target = (this.isBoss && this.bossState === 'DASHING') ? this.dashTarget : player.position;
        const angle = Math.atan2(target.y - this.position.y, target.x - this.position.x);
        let currentSpeed = this.speed * this.slowMultiplier;

        if (this.isBoss && this.bossState === 'DASHING') {
            currentSpeed *= 3; // Dash speed
            this.bossStateTimer--;
            if (this.bossStateTimer <= 0) {
                this.bossState = 'MOVING';
            }
        }

        this.position.x += Math.cos(angle) * currentSpeed;
        this.position.y += Math.sin(angle) * currentSpeed;

        if (this.isBoss) {
            this.attackCooldown--;
        }

        // Reset slow multiplier each frame, it will be re-applied by auras if necessary
        this.slowMultiplier = 1;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.isMarkedForDeletion = true;
        }
    }

    attack(player) {
        if (!this.isBoss || this.attackCooldown > 0 || this.bossState === 'DASHING' || this.bossState === 'CHARGING') {
            return [];
        }

        const distance = Math.hypot(player.position.x - this.position.x, player.position.y - this.position.y);
        if (distance > 200) {
            return [];
        }

        this.attackCooldown = this.attackTimer;
        const angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        const projectileSpeed = 3;
        let attacks = [];

        // Basic attack for all bosses
        attacks.push({
            type: 'projectile',
            position: { ...this.position },
            velocity: { x: Math.cos(angle) * projectileSpeed, y: Math.sin(angle) * projectileSpeed },
            damage: this.damage, source: 'enemy', color: 'orange'
        });

        // Unique attack for Boss 3
        if (this.type.id === 'boss3') {
            for (let i = -1; i <= 1; i++) {
                if (i === 0) continue;
                const spreadAngle = angle + (i * 0.2); // 0.2 radians spread
                attacks.push({
                    type: 'projectile',
                    position: { ...this.position },
                    velocity: { x: Math.cos(spreadAngle) * projectileSpeed, y: Math.sin(spreadAngle) * projectileSpeed },
                    damage: this.damage * 0.7, source: 'enemy', color: '#ff4500' // OrangeRed
                });
            }
        }

        // Unique attack for Boss 4
        if (this.type.id === 'boss4') {
             for (let i = -1; i <= 1; i++) {
                if (i === 0) continue;
                const spreadAngle = angle + (i * 0.2);
                attacks.push({
                    type: 'projectile',
                    position: { ...this.position },
                    velocity: { x: Math.cos(spreadAngle) * projectileSpeed, y: Math.sin(spreadAngle) * projectileSpeed },
                    damage: this.damage * 0.7, source: 'enemy', color: '#ff4500'
                });
            }
        }

        return attacks;
    }
}

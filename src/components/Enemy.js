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
            this.attackCooldown = 120; // Initial delay before first attack
            this.attackTimer = 180; // Base attack every 3 seconds
            this.bossState = 'MOVING';
            this.bossStateTimer = 0;
            this.dashTarget = { x: 0, y: 0 };
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Draw Health Bar
        if (this.health < this.maxHealth) {
            const healthBarWidth = this.width;
            const healthBarHeight = 5;
            const healthBarX = this.position.x;
            const healthBarY = this.position.y - healthBarHeight - 2;
            const healthPercentage = this.health / this.maxHealth;
            ctx.fillStyle = 'red';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
            ctx.fillStyle = 'green';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
        }
    }

    update(player) {
        if (this.isBoss) {
            this.bossStateTimer--;

            // --- Boss-specific state updates ---
            if (this.type.id === 'boss2') { // Charger
                if (this.bossState === 'MOVING' && this.bossStateTimer <= 0) {
                    this.bossState = 'CHARGING';
                    this.bossStateTimer = 90;
                    this.color = 'white';
                    this.dashTarget = { ...player.position };
                } else if (this.bossState === 'CHARGING' && this.bossStateTimer <= 0) {
                    this.bossState = 'DASHING';
                    this.bossStateTimer = 60;
                    this.color = this.originalColor;
                } else if (this.bossState === 'DASHING' && this.bossStateTimer <= 0) {
                    this.bossState = 'MOVING';
                    this.bossStateTimer = 300;
                }
            }
            if (this.type.id === 'boss4') { // Aura Tank
                const auraRadius = this.width * 1.5;
                if (Math.hypot(player.position.x - this.position.x, player.position.y - this.position.y) < auraRadius) {
                    player.takeDamage(this.damage * 0.1 / 60);
                }
            }

            // --- Movement ---
            if (this.bossState !== 'CHARGING') {
                this.move(player);
            }

            this.attackCooldown--;
        } else {
            // Regular enemy logic
            this.move(player);
        }

        this.slowMultiplier = 1;
    }

    move(player){
        let target = player.position;
        let currentSpeed = this.speed * this.slowMultiplier;

        if (this.isBoss && this.bossState === 'DASHING' && this.type.id === 'boss2') {
            target = this.dashTarget;
            currentSpeed *= 4; // Dash speed multiplier
        }

        const angle = Math.atan2(target.y - this.position.y, target.x - this.position.x);
        this.position.x += Math.cos(angle) * currentSpeed;
        this.position.y += Math.sin(angle) * currentSpeed;
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

        this.attackCooldown = this.attackTimer;
        const angleToPlayer = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        const projectileSpeed = 3;
        let attacks = [];

        // --- Boss-specific attack patterns ---
        switch (this.type.id) {
            case 'boss1': // Standard Shooter
                attacks.push({
                    type: 'projectile', position: { ...this.position },
                    velocity: { x: Math.cos(angleToPlayer) * projectileSpeed, y: Math.sin(angleToPlayer) * projectileSpeed },
                    damage: this.damage, source: 'enemy', color: 'orange'
                });
                break;

            case 'boss2': // Charger - only attacks when not charging/dashing
                if (this.bossState === 'MOVING') {
                    attacks.push({
                        type: 'projectile', position: { ...this.position },
                        velocity: { x: Math.cos(angleToPlayer) * projectileSpeed, y: Math.sin(angleToPlayer) * projectileSpeed * 0.5 },
                        damage: this.damage * 0.5, source: 'enemy', color: 'yellow'
                    });
                }
                break;

            case 'boss3': // Spawner
                this.attackCooldown = this.attackTimer * 2; // Spawns less frequently
                attacks.push({ type: 'spawn', count: 2 });
                break;

            case 'boss4': // Tank - Shotgun blast
                this.attackCooldown = this.attackTimer * 1.5; // Slower, more powerful attack
                for (let i = -2; i <= 2; i++) {
                    const spreadAngle = angleToPlayer + (i * 0.15); // 0.15 radians spread
                    attacks.push({
                        type: 'projectile', position: { ...this.position },
                        velocity: { x: Math.cos(spreadAngle) * projectileSpeed, y: Math.sin(spreadAngle) * projectileSpeed },
                        damage: this.damage * 0.8, source: 'enemy', color: '#9932cc'
                    });
                }
                break;

            default: // Default attack for any other boss
                attacks.push({
                    type: 'projectile', position: { ...this.position },
                    velocity: { x: Math.cos(angleToPlayer) * projectileSpeed, y: Math.sin(angleToPlayer) * projectileSpeed },
                    damage: this.damage, source: 'enemy', color: 'orange'
                });
        }

        return attacks;
    }
}

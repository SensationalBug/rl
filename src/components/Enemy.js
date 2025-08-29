import { maps } from '../data/maps.js';

export class Enemy {
    constructor({ position, type, stats = null }) {
        this.position = position;
        this.type = type;

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
        this.slowMultiplier = 1;

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
        // --- Boss-specific state updates ---
        if (this.isBoss) {
            this.bossStateTimer--;

            // Boss 2: Charger Logic
            if (this.type.id === 'boss2') {
                if (this.bossState === 'MOVING' && this.bossStateTimer <= 0) {
                    this.bossState = 'CHARGING';
                    this.bossStateTimer = 90; // 1.5 seconds charge time
                    this.color = 'white'; // Charge indicator
                    this.dashTarget = { ...player.position }; // Lock on to player's position
                } else if (this.bossState === 'CHARGING' && this.bossStateTimer <= 0) {
                    this.bossState = 'DASHING';
                    this.bossStateTimer = 60; // 1 second dash duration
                    this.color = this.originalColor;
                } else if (this.bossState === 'DASHING' && this.bossStateTimer <= 0) {
                    this.bossState = 'MOVING';
                    this.bossStateTimer = 300; // 5 seconds cooldown before next charge
                }
            }

            // Boss 4: Tank/Area Denial Aura
            if (this.type.id === 'boss4') {
                const auraRadius = this.width * 1.5;
                const distance = Math.hypot(player.position.x - this.position.x, player.position.y - this.position.y);
                if (distance < auraRadius) {
                    player.takeDamage(this.damage * 0.1 / 60); // Apply 10% of its damage per second
                }
            }
        }

        // --- Movement ---
        let target = player.position;
        let currentSpeed = this.speed * this.slowMultiplier;

        if (this.isBoss && this.bossState === 'DASHING' && this.type.id === 'boss2') {
            target = this.dashTarget;
            currentSpeed *= 4; // Dash speed multiplier
        }

        // Don't move if charging
        if (!(this.isBoss && this.bossState === 'CHARGING')) {
            const angle = Math.atan2(target.y - this.position.y, target.x - this.position.x);
            this.position.x += Math.cos(angle) * currentSpeed;
            this.position.y += Math.sin(angle) * currentSpeed;
        }

        if (this.isBoss) {
            this.attackCooldown--;
        }
        this.slowMultiplier = 1;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.isMarkedForDeletion = true;
        }
    }

    attack(player, currentMap) {
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
                const enemiesToSpawn = currentMap.allowedEnemies.slice(0, 2); // Spawn the first two enemy types of the map
                for (const enemyKey of enemiesToSpawn) {
                    attacks.push({ type: 'spawn', enemyKey: enemyKey });
                }
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

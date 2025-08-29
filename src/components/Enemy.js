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
        this.isVisible = true;

        if (this.isBoss) {
            this.attackCooldown = 120; // Initial delay before first attack
            this.attackTimer = 180; // Base attack every 3 seconds
            this.bossState = 'MOVING';
            this.bossStateTimer = 0;
            this.dashTarget = { x: 0, y: 0 };
            this.laserAngle = 0; // For laser telegraphing
        }
    }

    draw(ctx) {
        if (!this.isVisible) return;

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

        // Draw laser telegraph
        if (this.bossState === 'CHARGING_LASER') {
            ctx.beginPath();
            ctx.moveTo(this.position.x + this.width / 2, this.position.y + this.height / 2);
            ctx.lineTo(
                this.position.x + this.width / 2 + Math.cos(this.laserAngle) * 2000,
                this.position.y + this.height / 2 + Math.sin(this.laserAngle) * 2000
            );
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 10;
            ctx.stroke();
            ctx.lineWidth = 1;
        }
    }

    update(player) {
        if (this.isBoss) {
            this.bossStateTimer--;
            this.handleBossState(player);
        }

        if (this.bossState.includes('CHARGING') || this.bossState.includes('TELEPORTING')) {
            // No movement during these states
        } else {
            this.move(player);
        }

        if (this.isBoss) this.attackCooldown--;
        this.slowMultiplier = 1;
    }

    handleBossState(player) {
        const teleporterIds = ['boss6', 'boss10', 'boss14', 'boss18'];
        const laserIds = ['boss5', 'boss9', 'boss13', 'boss17'];

        // --- Teleporter Logic ---
        if (teleporterIds.includes(this.type.id)) {
            if (this.bossState === 'MOVING' && this.bossStateTimer <= 0) {
                this.bossState = 'TELEPORTING_OUT';
                this.bossStateTimer = 30; // 0.5s fade out
            } else if (this.bossState === 'TELEPORTING_OUT') {
                this.isVisible = false;
                if (this.bossStateTimer <= 0) {
                    this.position.x = player.position.x + (Math.random() - 0.5) * 800;
                    this.position.y = player.position.y + (Math.random() - 0.5) * 800;
                    this.bossState = 'TELEPORTING_IN';
                    this.bossStateTimer = 30; // 0.5s fade in
                }
            } else if (this.bossState === 'TELEPORTING_IN' && this.bossStateTimer <= 0) {
                this.isVisible = true;
                this.bossState = 'MOVING';
                this.bossStateTimer = 240; // 4s cooldown before next teleport
            }
        }

        // --- Laser Logic ---
        if (laserIds.includes(this.type.id)) {
            if (this.bossState === 'MOVING' && this.attackCooldown <= 60 && this.attackCooldown > 0) {
                this.bossState = 'CHARGING_LASER';
                this.laserAngle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
            } else if (this.bossState === 'CHARGING_LASER' && this.attackCooldown <= 0) {
                this.bossState = 'MOVING';
            }
        }

        // --- Existing Boss Logic ---
        if (this.type.id === 'boss2') { // Charger
             if (this.bossState === 'MOVING' && this.bossStateTimer <= 0) {
                this.bossState = 'CHARGING'; this.bossStateTimer = 90; this.color = 'white';
                this.dashTarget = { ...player.position };
            } else if (this.bossState === 'CHARGING' && this.bossStateTimer <= 0) {
                this.bossState = 'DASHING'; this.bossStateTimer = 60; this.color = this.originalColor;
            } else if (this.bossState === 'DASHING' && this.bossStateTimer <= 0) {
                this.bossState = 'MOVING'; this.bossStateTimer = 300;
            }
        }
        if (this.type.id === 'boss4') { // Aura Tank
            const auraRadius = this.width * 1.5;
            if (Math.hypot(player.position.x - this.position.x, player.position.y - this.position.y) < auraRadius) {
                player.takeDamage(this.damage * 0.1 / 60);
            }
        }
    }

    move(player){
        let target = player.position;
        let currentSpeed = this.speed * this.slowMultiplier;

        if (this.isBoss && this.bossState === 'DASHING' && this.type.id === 'boss2') {
            target = this.dashTarget;
            currentSpeed *= 4;
        }

        const angle = Math.atan2(target.y - this.position.y, target.x - this.position.x);
        this.position.x += Math.cos(angle) * currentSpeed;
        this.position.y += Math.sin(angle) * currentSpeed;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) this.isMarkedForDeletion = true;
    }

    attack(player) {
        if (!this.isBoss || this.attackCooldown > 0 || !this.isVisible || this.bossState.includes('CHARGING') || this.bossState.includes('DASHING') || this.bossState.includes('TELEPORTING')) {
            return [];
        }

        this.attackCooldown = this.attackTimer;
        const angleToPlayer = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
        let attacks = [];
        const projectileSpeed = 4;

        const laserIds = ['boss5', 'boss9', 'boss13', 'boss17'];
        if (laserIds.includes(this.type.id)) {
            this.attackCooldown = this.attackTimer * 1.5;
            attacks.push({ type: 'laser', angle: this.laserAngle, damage: this.damage, duration: 60 });
            return attacks;
        }

        const trapperIds = ['boss7', 'boss11', 'boss15', 'boss19'];
        if (trapperIds.includes(this.type.id)) {
            this.attackCooldown = this.attackTimer * 1.2;
            attacks.push({ type: 'ground_area', position: { ...this.position }, radius: this.width, damage: this.damage, duration: 600 });
            return attacks;
        }

        switch (this.type.id) {
            // --- Base Game Bosses ---
            case 'boss1':
                attacks.push({ type: 'projectile', position: { ...this.position }, velocity: { x: Math.cos(angleToPlayer) * projectileSpeed, y: Math.sin(angleToPlayer) * projectileSpeed }, damage: this.damage, source: 'enemy' });
                break;
            case 'boss2': // Charger
                if (this.bossState === 'MOVING') {
                     attacks.push({ type: 'projectile', position: { ...this.position }, velocity: { x: Math.cos(angleToPlayer) * projectileSpeed, y: Math.sin(angleToPlayer) * projectileSpeed }, damage: this.damage * 0.5, source: 'enemy' });
                }
                break;
            case 'boss3': // Spawner
                this.attackCooldown = this.attackTimer * 2;
                attacks.push({ type: 'spawn', count: 2 });
                break;
            case 'boss4': // Tank - Shotgun blast
                this.attackCooldown = this.attackTimer * 1.5;
                for (let i = -2; i <= 2; i++) {
                    const spreadAngle = angleToPlayer + (i * 0.15);
                    attacks.push({ type: 'projectile', position: { ...this.position }, velocity: { x: Math.cos(spreadAngle) * projectileSpeed, y: Math.sin(spreadAngle) * projectileSpeed }, damage: this.damage * 0.8, source: 'enemy' });
                }
                break;

            // --- Extra Bosses ---
            case 'boss8': // Orbitus - Spiral Shot
                 for (let i = 0; i < 8; i++) {
                    const angle = (Date.now() / 500) + (i * Math.PI / 4);
                    attacks.push({ type: 'projectile', position: { ...this.position }, velocity: { x: Math.cos(angle) * projectileSpeed * 0.8, y: Math.sin(angle) * projectileSpeed * 0.8 }, damage: this.damage * 0.7, source: 'enemy' });
                }
                break;
            case 'boss12': // Pulsar - Nova Burst
                for (let i = 0; i < 12; i++) {
                    const angle = (i * Math.PI / 6);
                    attacks.push({ type: 'projectile', position: { ...this.position }, velocity: { x: Math.cos(angle) * projectileSpeed, y: Math.sin(angle) * projectileSpeed }, damage: this.damage, source: 'enemy' });
                }
                break;
            case 'boss16': // Quasar - Homing Shots
                 attacks.push({ type: 'projectile', position: { ...this.position }, velocity: { x: Math.cos(angleToPlayer) * projectileSpeed, y: Math.sin(angleToPlayer) * projectileSpeed }, damage: this.damage, source: 'enemy', homing: true });
                break;
            case 'boss20': // Supernova - Giga Blast
                this.attackCooldown = this.attackTimer * 2;
                for (let i = 0; i < 24; i++) {
                    const angle = (i * Math.PI / 12);
                    attacks.push({ type: 'projectile', position: { ...this.position }, velocity: { x: Math.cos(angle) * projectileSpeed * 1.5, y: Math.sin(angle) * projectileSpeed * 1.5 }, damage: this.damage, source: 'enemy' });
                }
                break;
        }
        return attacks;
    }
}

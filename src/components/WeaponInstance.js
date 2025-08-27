import { weapons } from '../data/weapons.js';

export class WeaponInstance {
    constructor(weaponId) {
        this.baseData = weapons[weaponId];
        this.id = weaponId;

        this.stats = JSON.parse(JSON.stringify(this.baseData.stats));

        this.level = 1;
        this.cooldown = this.stats.cooldown;

        // State for persistent weapons like auras
        this.isActive = false;
        this.activeTimer = 0;
    }

    getStats() {
        return this.stats;
    }

    getName() {
        return this.baseData.name;
    }

    getDescription() {
        return this.baseData.description;
    }

    levelUp() {
        if (this.level >= this.baseData.upgrades.length) {
            console.log(`${this.getName()} is already max level.`);
            return;
        }

        const upgrade = this.baseData.upgrades[this.level - 1];
        if (upgrade) {
            upgrade.apply(this.stats);
            this.level++;
            console.log(`${this.getName()} leveled up to ${this.level}!`);
        }
    }

    // The main loop will call this, not the attack function directly for stateful weapons
    update() {
        if (this.isActive) {
            this.activeTimer--;
            if (this.activeTimer <= 0) {
                this.isActive = false;
            }
        } else if (this.cooldown > 0) {
            this.cooldown--;
        }
    }

    // The attack function is now used to get the attack data, but activation is handled outside
    attack(player, enemies) {
        return this.baseData.attack(player, this, enemies);
    }
}

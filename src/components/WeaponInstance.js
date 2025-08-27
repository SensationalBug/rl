import { weapons } from '../data/weapons.js';

export class WeaponInstance {
    constructor(weaponId) {
        // Deep copy the base weapon data to avoid modifying the original object
        this.baseData = JSON.parse(JSON.stringify(weapons[weaponId]));
        this.level = 1;
        this.cooldown = this.baseData.stats.cooldown;
    }

    getStats() {
        return this.baseData.stats;
    }

    getName() {
        return this.baseData.name;
    }

    getDescription() {
        return this.baseData.description;
    }

    levelUp() {
        if (this.level >= this.baseData.upgrades.length + 1) {
            console.log(`${this.getName()} is already max level.`);
            return;
        }

        const upgrade = this.baseData.upgrades[this.level - 1];
        if (upgrade) {
            upgrade.apply(this.baseData); // Apply the upgrade to this instance's data
            this.level++;
            console.log(`${this.getName()} leveled up to ${this.level}!`);
        }
    }

    attack(player, enemies) {
        // The attack function from the data file needs the instance-specific stats
        return this.baseData.attack(player, this, enemies);
    }
}

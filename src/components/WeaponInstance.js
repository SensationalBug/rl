import { weapons } from '../data/weapons.js';

export class WeaponInstance {
    constructor(weaponId) {
        // Store a reference to the base weapon data (which includes the attack function)
        this.baseData = weapons[weaponId];
        this.id = weaponId;

        // Deep copy the stats so that upgrades only affect this instance
        this.stats = JSON.parse(JSON.stringify(this.baseData.stats));

        this.level = 1;
        this.cooldown = this.stats.cooldown;
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
            // Apply the upgrade to this instance's stats, not the base data
            upgrade.apply(this.stats);
            this.level++;
            console.log(`${this.getName()} leveled up to ${this.level}!`);
        }
    }

    attack(player, enemies) {
        // Call the attack function from the base data, passing the player and this instance
        return this.baseData.attack(player, this, enemies);
    }
}

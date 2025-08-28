import { weapons } from '../data/weapons.js';
import { getPlayerData } from '../data/playerData.js';
import { globalUpgrades } from '../data/globalUpgrades.js';

export class WeaponInstance {
    constructor(weaponId) {
        this.baseData = weapons[weaponId];
        this.id = weaponId;

        this.stats = JSON.parse(JSON.stringify(this.baseData.stats));

        // Apply global upgrades
        const playerData = getPlayerData();
        if (playerData.globalUpgrades) {
            for (const upgradeId in playerData.globalUpgrades) {
                const level = playerData.globalUpgrades[upgradeId];
                if (level === 0) continue;

                const idParts = upgradeId.split('.');
                // Check if the upgrade is for this specific weapon
                if (idParts[0] === 'weapons' && idParts[1] === this.id) {
                    const upgradeKey = idParts[2];
                    const upgradeDefinition = globalUpgrades.weapons[this.id].upgrades[upgradeKey];
                    if (upgradeDefinition) {
                        for (let i = 0; i < level; i++) {
                            upgradeDefinition.apply(this.stats);
                        }
                    }
                }
            }
        }

        this.level = 1;
        this.maxLevel = this.baseData.maxLevel;
        this.upgradeHistory = {}; // To track limited upgrades

        this.cooldown = this.stats.cooldown;
        this.isActive = false;
        this.activeTimer = 0;
    }

    getStats() {
        return this.stats;
    }

    getName() {
        // Return evolution name if evolved
        if (this.level >= this.maxLevel) {
            return this.baseData.evolution.name;
        }
        return this.baseData.name;
    }

    applyUpgrade(upgrade) {
        if (this.level >= this.maxLevel -1) {
             console.log(`${this.getName()} is ready for evolution, but cannot level up further.`);
            return;
        }
        upgrade.apply(this.stats);
        this.level++;

        // Track how many times this specific upgrade has been applied
        this.upgradeHistory[upgrade.description] = (this.upgradeHistory[upgrade.description] || 0) + 1;

        console.log(`${this.getName()} leveled up to ${this.level}! Applied: ${upgrade.description}`);
    }

    evolve() {
        if (this.level < this.maxLevel - 1) {
            console.error("Attempted to evolve weapon before it reached pre-evolution max level.");
            return;
        }
        const evolution = this.baseData.evolution;
        evolution.apply(this.stats);
        this.level = this.maxLevel; // Set to max level
        console.log(`${this.baseData.name} evolved into ${evolution.name}!`);
    }

    update() {
        if (this.isActive) {
            this.activeTimer--;
            if (this.activeTimer <= 0) {
                this.isActive = false;
            }
        }

        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }

    attack(player, enemies) {
        return this.baseData.attack(player, this, enemies);
    }
}

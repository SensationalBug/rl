// =================================================================================
//                                  IMPORTS
// =================================================================================
import { Player } from './components/Player.js';
import { Enemy } from './components/Enemy.js';
import { Projectile } from './components/Projectile.js';
import { XPGem } from './components/XPGem.js';
import { GroundArea } from './components/GroundArea.js';
import { VisualEffect } from './components/VisualEffect.js';
import { GoldBag } from './components/GoldBag.js';
import { WeaponInstance } from './components/WeaponInstance.js';
import { enemyTypes } from './data/enemies.js';
import { waveTimeline } from './data/waves.js';
import { weapons } from './data/weapons.js';
import { characters } from './data/characters.js';
import { passives } from './data/passives.js';
import { globalUpgrades } from './data/globalUpgrades.js';
import { loadPlayerData, getGold, addGold, getPlayerData } from './data/playerData.js';

// =================================================================================
//                                  GAME SETUP
// =================================================================================
window.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const startScreen = document.getElementById('start-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const characterSelectionScreen = document.getElementById('character-selection-screen');
    const characterList = document.getElementById('character-list');
    const gameContainer = document.getElementById('game-container');
    const joystickBase = document.getElementById('joystick-base');
    const joystickKnob = document.getElementById('joystick-knob');
    const levelUpScreen = document.getElementById('level-up-screen');
    const upgradeCardsContainer = document.getElementById('upgrade-cards-container');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverSummary = document.getElementById('game-over-summary');
    const globalUpgradesScreen = document.getElementById('global-upgrades-screen');
    const globalUpgradesContainer = document.getElementById('global-upgrades-container');

    // --- Button References ---
    const startGameBtn = document.getElementById('start-game-btn');
    const charactersBtn = document.getElementById('characters-btn');
    const upgradesBtn = document.getElementById('upgrades-btn');
    const charSelectBackBtn = document.getElementById('char-select-back-btn');
    const upgradesBackBtn = document.getElementById('upgrades-back-btn');
    const restartBtn = document.getElementById('restart-btn');

    // --- UI Elements ---
    const goldCounter = mainMenuScreen.querySelector('.gold-counter');

    // --- Canvas Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- Game State & Core Variables ---
    let player, keys, enemies, projectiles, groundAreas, xpGems, visualEffects, goldBags, gameState, gameTimer, spawnTimers, randomXpOrbTimer, goldBagSpawnTimer;

    // --- Input State ---
    let joystick = { active: false, baseX: 0, baseY: 0, knobX: 0, knobY: 0, radius: 60 };
    let lastInputMethod = 'keyboard';

    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function changeState(newState) {
        gameState = newState;

        // Set display and z-index for all screens based on the new state
        startScreen.style.display = (newState === 'startScreen') ? 'flex' : 'none';
        startScreen.style.zIndex = (newState === 'startScreen') ? '100' : '0';

        mainMenuScreen.style.display = (newState === 'mainMenu') ? 'flex' : 'none';
        mainMenuScreen.style.zIndex = (newState === 'mainMenu') ? '100' : '0';

        characterSelectionScreen.style.display = (newState === 'characterSelection') ? 'flex' : 'none';
        characterSelectionScreen.style.zIndex = (newState === 'characterSelection') ? '100' : '0';

        gameContainer.style.display = (newState === 'running' || newState === 'levelUp') ? 'block' : 'none';

        levelUpScreen.style.display = (newState === 'levelUp') ? 'flex' : 'none';
        levelUpScreen.style.zIndex = (newState === 'levelUp') ? '110' : '0'; // Higher z-index for overlays

        gameOverScreen.style.display = (newState === 'gameOver') ? 'flex' : 'none';
        gameOverScreen.style.zIndex = (newState === 'gameOver') ? '120' : '0'; // Highest z-index

        globalUpgradesScreen.style.display = (newState === 'globalUpgrades') ? 'flex' : 'none';
        globalUpgradesScreen.style.zIndex = (newState === 'globalUpgrades') ? '100' : '0';

        // Special logic for level up screen
        if (newState === 'levelUp') {
            const options = getUpgradeOptions();
            populateLevelUpScreen(options);
        }

        // Special logic for game over screen
        if (newState === 'gameOver') {
            const timeSurvived = Math.floor(gameTimer / 60); // seconds
            const goldEarned = timeSurvived; // 1 gold per second
            addGold(goldEarned);
            gameOverSummary.textContent = `Sobreviviste ${timeSurvived} segundos y ganaste ${goldEarned} de oro.`;
            updateGoldDisplay(); // Update the main menu counter in the background
        }

        if (newState === 'mainMenu') {
            updateGoldDisplay();
        }
    }

    function updateGoldDisplay() {
        goldCounter.textContent = `Oro: ${getGold()}`;
    }

    function populateCharacterSelection() {
        characterList.innerHTML = '';
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.style.cursor = 'pointer';
            const startingWeaponName = weapons[char.startingWeapon].name;
            card.innerHTML = `
                <img src="${char.imageSrc}" alt="${char.name}" class="ship-preview-img">
                <h2>${char.name}</h2>
                <p>${char.description}</p>
                <p class="ability">${char.ability}</p>
                <p class="starting-weapon">Arma Inicial: <strong>${startingWeaponName}</strong></p>`;
            card.addEventListener('click', () => init(char));
            characterList.appendChild(card);
        });
    }

    function populateLevelUpScreen(options) {
        upgradeCardsContainer.innerHTML = '';
        if (options.length === 0) {
            options.push({ name: "Recuperación", description: "Recupera 25 de vida.", apply: () => { player.health = Math.min(player.maxHealth, player.health + 25); }});
        }
        options.forEach(option => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `<h3>${option.name}</h3><p>${option.description}</p>`;
            card.addEventListener('click', () => {
                option.apply();
                changeState('running');
            });
            upgradeCardsContainer.appendChild(card);
        });
    }

    function getUpgradeOptions() {
        const pool = [];

        // Weapon Upgrades & Evolutions
        player.weapons.forEach(w => {
            if (w.level < w.maxLevel - 1) {
                // Get a specific, random upgrade from the weapon's pool
                const availableUpgrades = w.baseData.upgradePool.filter(upgrade => {
                    if (!upgrade.max) return true;
                    const timesApplied = w.upgradeHistory[upgrade.description] || 0;
                    return timesApplied < upgrade.max;
                });

                if (availableUpgrades.length > 0) {
                    const randomUpgrade = availableUpgrades[Math.floor(Math.random() * availableUpgrades.length)];
                    pool.push({
                        type: 'weapon_upgrade',
                        name: `Mejorar ${w.getName()}`,
                        description: randomUpgrade.description,
                        apply: () => w.applyUpgrade(randomUpgrade)
                    });
                }

            } else if (w.level === w.maxLevel - 1) {
                const evolution = w.baseData.evolution;
                pool.push({
                    type: 'weapon_evolution',
                    name: `Evolucionar: ${evolution.name}`,
                    description: evolution.description,
                    apply: () => w.evolve()
                });
            }
        });

        // New Weapons
        const ownedIds = player.weapons.map(w => w.id);
        if (ownedIds.length < 6) {
            Object.keys(weapons).filter(id => !ownedIds.includes(id)).forEach(id => {
                pool.push({
                    type: 'new_weapon',
                    name: `Nueva Arma: ${weapons[id].name}`,
                    description: weapons[id].description,
                    apply: () => player.weapons.push(new WeaponInstance(id))
                });
            });
        }

        // Passive Upgrades
        passives.forEach(p => {
            pool.push({
                type: 'passive',
                name: p.name,
                description: p.description,
                apply: () => p.apply(player)
            });
        });

        return pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    function init(character) {
        setupCanvas();
        player = new Player(character);
        player.weapons.push(new WeaponInstance(character.startingWeapon));
        keys = { up: false, down: false, left: false, right: false };
        enemies = []; projectiles = []; groundAreas = []; xpGems = []; visualEffects = []; goldBags = [];
        gameTimer = 0;
        spawnTimers = {};
        waveTimeline.forEach((wave, i) => { spawnTimers[i] = wave.rate; });
        randomXpOrbTimer = 300; // Spawn first random orb after 5 seconds
        goldBagSpawnTimer = 600; // Spawn first gold bag after 10 seconds
        changeState('running');
    }

    function updateEnemySpawns() {
        if (gameState !== 'running') return;
        gameTimer++;
        const gameTimeInSeconds = Math.floor(gameTimer / 60);
        waveTimeline.forEach((wave, index) => {
            if (gameTimeInSeconds >= wave.time && --spawnTimers[index] <= 0) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.max(canvas.width, canvas.height) * 0.7;
                const x = player.position.x + Math.cos(angle) * radius;
                const y = player.position.y + Math.sin(angle) * radius;
                enemies.push(new Enemy({ position: { x, y }, type: enemyTypes[wave.type] }));
                spawnTimers[index] = wave.rate;
            }
        });
    }

    function drawUI() {
        if (!player) return;

        // --- Game Timer ---
        const minutes = Math.floor(gameTimer / 3600).toString().padStart(2, '0');
        const seconds = Math.floor((gameTimer % 3600) / 60).toString().padStart(2, '0');
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(`${minutes}:${seconds}`, canvas.width / 2, 50);

        // --- XP Bar ---
        const xpBarWidth = canvas.width * 0.6;
        const xpBarHeight = 20;
        const xpBarX = (canvas.width - xpBarWidth) / 2;
        const xpBarY = canvas.height - xpBarHeight - 20;

        // Background
        ctx.fillStyle = '#444';
        ctx.fillRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight);

        // Foreground (current XP)
        const xpPercentage = player.xp / player.xpToNextLevel;
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(xpBarX, xpBarY, xpBarWidth * xpPercentage, xpBarHeight);

        // Border
        ctx.strokeStyle = 'white';
        ctx.strokeRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight);

        // --- Health Bar ---
        const healthBarYOffset = 10; // 10px above the XP bar
        const healthBarHeight = 20;
        const healthBarX = xpBarX;
        const healthBarY = xpBarY - healthBarHeight - healthBarYOffset;

        // Background
        ctx.fillStyle = '#440000'; // Dark red
        ctx.fillRect(healthBarX, healthBarY, xpBarWidth, healthBarHeight);

        // Foreground
        const healthPercentage = player.health / player.maxHealth;
        ctx.fillStyle = '#00ff00'; // Bright green
        ctx.fillRect(healthBarX, healthBarY, xpBarWidth * healthPercentage, healthBarHeight);

        // Border
        ctx.strokeStyle = 'white';
        ctx.strokeRect(healthBarX, healthBarY, xpBarWidth, healthBarHeight);

        // Text
        ctx.font = '14px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.ceil(player.health)} / ${player.maxHealth}`, canvas.width / 2, healthBarY + healthBarHeight / 2);
    }

    function animate() {
        requestAnimationFrame(animate);

        // 1. Handle non-game states (menus, etc.) by returning early.
        // If we are not running and not leveling up, we are in a menu. Do nothing.
        if (gameState !== 'running' && gameState !== 'levelUp') {
            return;
        }

        // 2. Handle game logic updates, which only happen when the game is 'running'.
        if (gameState === 'running') {
            if (player.health <= 0) {
                changeState('gameOver');
                return; // Stop the rest of the game logic from running
            }
            updateEnemySpawns();

            // --- Random XP Orb Spawning ---
            if (--randomXpOrbTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * (canvas.width * 0.5) + 100; // Spawn within a ring around the player
                const position = {
                    x: player.position.x + Math.cos(angle) * radius,
                    y: player.position.y + Math.sin(angle) * radius,
                };
                xpGems.push(new XPGem({ position, value: 5 })); // Random orbs are worth more
                randomXpOrbTimer = 300 + Math.random() * 300; // Spawn next orb in 5-10 seconds
            }

            // --- Gold Bag Spawning ---
            if (--goldBagSpawnTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * (canvas.width * 0.5) + 100;
                const position = {
                    x: player.position.x + Math.cos(angle) * radius,
                    y: player.position.y + Math.sin(angle) * radius,
                };
                goldBags.push(new GoldBag({ position, value: 25 }));
                goldBagSpawnTimer = 900 + Math.random() * 600; // Spawn next bag in 15-25 seconds
            }

            // --- Player Movement ---
            player.velocity.x = 0; player.velocity.y = 0;
            if (keys.up) player.velocity.y = -player.speed;
            if (keys.down) player.velocity.y = player.speed;
            if (keys.left) player.velocity.x = -player.speed;
            if (keys.right) player.velocity.x = player.speed;

            if (joystick.active) {
                const dx = joystick.knobX - joystick.baseX;
                const dy = joystick.knobY - joystick.baseY;
                const mag = Math.hypot(dx, dy);
                if (mag > 0) {
                    player.velocity.x = (dx / mag) * player.speed;
                    player.velocity.y = (dy / mag) * player.speed;
                    lastInputMethod = 'joystick';
                }
            }

            // Normalize for keyboard diagonal
            if (!joystick.active && player.velocity.x !== 0 && player.velocity.y !== 0) {
                player.velocity.x /= Math.sqrt(2);
                player.velocity.y /= Math.sqrt(2);
            }

            // Update direction based on velocity, with special handling for joystick release
            if (player.velocity.x !== 0 || player.velocity.y !== 0) {
                if (lastInputMethod === 'joystick' && !joystick.active) {
                    // Do not update direction, preserving the last joystick direction
                } else {
                    player.direction = { x: player.velocity.x, y: player.velocity.y };
                }
            }

            // --- Health Regeneration ---
            if (player.healthRegenPercent > 0 && player.health < player.maxHealth) {
                const regenAmount = (player.maxHealth * player.healthRegenPercent) / 60; // per-frame amount
                player.health = Math.min(player.maxHealth, player.health + regenAmount);
            }

            player.update();

            // --- Weapon Updates & Attacks ---
            player.weapons.forEach(w => {
                w.update();
                if (w.id === 'onda-de-repulsion') {
                    if (w.cooldown <= 0 && !w.isActive) {
                        w.isActive = true;
                        w.activeTimer = w.getStats().duration;
                        w.cooldown = w.getStats().cooldown;
                    }
                     // Aura damage is applied every frame it is active
                    if (w.isActive) {
                        const stats = w.getStats();
                        enemies.forEach(enemy => {
                            const dist = Math.hypot(player.position.x - enemy.position.x, player.position.y - enemy.position.y);
                            if (dist < stats.area) {
                                enemy.takeDamage(stats.damage / 60); // damage per frame
                                if (stats.slow > 0) {
                                    enemy.slowMultiplier = 1 - stats.slow;
                                }
                            }
                        });
                    }
                } else if (w.cooldown <= 0) {
                    const newAttacks = w.attack(player, enemies);
                    newAttacks.forEach(attackData => {
                        if (attackData.type === 'projectile') projectiles.push(new Projectile(attackData));
                        else if (attackData.type === 'hitbox') {
                            const hitbox = { x: attackData.side === 'left' ? player.position.x - attackData.width : player.position.x, y: player.position.y - (attackData.height / 2), width: attackData.width, height: attackData.height };
                            visualEffects.push(new VisualEffect({ position: {x: hitbox.x, y: hitbox.y}, width: hitbox.width, height: hitbox.height, color: 'rgba(255, 255, 0, 0.5)' }));
                            enemies.forEach(enemy => {
                                if (hitbox.x < enemy.position.x + enemy.width && hitbox.x + hitbox.width > enemy.position.x && hitbox.y < enemy.position.y + enemy.height && hitbox.y + hitbox.height > enemy.position.y) enemy.takeDamage(attackData.damage);
                            });
                        } else if (attackData.type === 'ground_area') groundAreas.push(new GroundArea(attackData));
                    });
                    w.cooldown = w.getStats().cooldown * player.cooldown_modifier;
                }
            });

            // --- Entity Updates & Cleanup ---
            enemies.forEach(e => e.update(player));
            projectiles.forEach(p => p.update());
            groundAreas.forEach(area => area.update(enemies));
            visualEffects.forEach(v => v.update());
            // Gold bags don't have an update method, they are static

            // --- Collision Detection ---
            // Player-Enemy Collision
            enemies.forEach(e => {
                const dx = player.position.x - e.position.x;
                const dy = player.position.y - e.position.y;
                const distance = Math.hypot(dx, dy);
                if (distance < player.width / 2 + e.width / 2) {
                    player.takeDamage(e.damage);
                }
            });

            // Projectile-Enemy Collision
            projectiles.forEach(p => {
                enemies.forEach(e => {
                    if (e.isMarkedForDeletion) return;
                    const dist = Math.hypot(p.position.x - e.position.x, p.position.y - e.position.y);
                    if (dist < e.width / 2) { // Simple circle collision
                        e.takeDamage(p.damage);
                        p.isMarkedForDeletion = true;

                        // Check for Hiper Canon explosion
                        if (p.sourceWeapon.id === 'canon' && p.sourceWeapon.level >= 5) {
                            groundAreas.push(new GroundArea({
                                position: { ...e.position },
                                radius: 40, // Explosion radius
                                damage: p.damage * 0.5, // Explosion does 50% of projectile damage
                                duration: 20 // Lasts for 1/3 of a second
                            }));
                        }
                    }
                });
            });

            // Spawn XP gems from defeated enemies
            enemies.forEach(e => {
                if (e.isMarkedForDeletion) {
                    xpGems.push(new XPGem({ position: { ...e.position }, value: e.xpValue }));
                }
            });

            enemies = enemies.filter(e => !e.isMarkedForDeletion);
            projectiles = projectiles.filter(p => !p.isMarkedForDeletion);
            groundAreas = groundAreas.filter(a => !a.isMarkedForDeletion);
            visualEffects = visualEffects.filter(v => !v.isMarkedForDeletion);

            xpGems.forEach(gem => {
                if (Math.hypot(player.position.x - gem.position.x, player.position.y - gem.position.y) < player.pickupRadius) {
                    if (player.addXP(gem.value)) changeState('levelUp');
                    gem.isMarkedForDeletion = true;
                }
            });
            xpGems = xpGems.filter(g => !g.isMarkedForDeletion);

            goldBags.forEach(bag => {
                if (Math.hypot(player.position.x - bag.position.x, player.position.y - bag.position.y) < player.pickupRadius) {
                    addGold(bag.value);
                    updateGoldDisplay();
                    bag.isMarkedForDeletion = true;
                }
            });
            goldBags = goldBags.filter(b => !b.isMarkedForDeletion);
        }

        // 3. Handle all drawing, which happens for both 'running' and 'levelUp' states.
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (player) {
            ctx.save();
            ctx.translate(canvas.width / 2 - player.position.x, canvas.height / 2 - player.position.y);

            groundAreas.forEach(area => area.draw(ctx));
            visualEffects.forEach(v => v.draw(ctx));

            // --- Draw Repulsion Wave Aura ---
            player.weapons.forEach(w => {
                if (w.isActive && w.id === 'onda-de-repulsion') {
                    const stats = w.getStats();
                    ctx.beginPath();
                    ctx.arc(player.position.x, player.position.y, stats.area, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200, 0, 255, 0.15)';
                    ctx.fill();
                }
            });

            xpGems.forEach(gem => gem.draw(ctx));
            goldBags.forEach(b => b.draw(ctx));
            enemies.forEach(e => e.draw(ctx));
            projectiles.forEach(p => p.draw(ctx));
            player.draw(ctx);
            ctx.restore();
        }

        drawUI();
    }

    function populateGlobalUpgradesScreen() {
        globalUpgradesContainer.innerHTML = ''; // Clear previous content
        const playerData = getPlayerData();
        if (!playerData.globalUpgrades) {
            playerData.globalUpgrades = {}; // Ensure the upgrades object exists
        }

        const createLevelBoxes = (maxLevels, currentLevel) => {
            let boxesHTML = '';
            for (let i = 0; i < maxLevels; i++) {
                boxesHTML += `<div class="upgrade-level-box ${i < currentLevel ? 'unlocked' : ''}"></div>`;
            }
            return boxesHTML;
        };

        const processCategory = (categoryData, categoryKey, container) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'upgrade-category';
            let categoryHTML = `<h2>${categoryData.name}</h2>`;

            for (const itemKey in categoryData.upgrades) {
                const item = categoryData.upgrades[itemKey];
                const upgradeId = `${categoryKey}.${itemKey}`;
                const currentLevel = playerData.globalUpgrades[upgradeId] || 0;
                const maxLevels = item.costs.length;
                const isMaxed = currentLevel >= maxLevels;
                const cost = isMaxed ? 'MAX' : `${item.costs[currentLevel]} Oro`;
                const canAfford = !isMaxed && getGold() >= item.costs[currentLevel];

                categoryHTML += `
                    <div class="upgrade-item">
                        <div class="upgrade-item-info">
                            <p>${item.name}</p>
                            <button class="buy-upgrade-btn" data-upgrade-id="${upgradeId}" ${isMaxed || !canAfford ? 'disabled' : ''}>
                                ${cost}
                            </button>
                        </div>
                        <div class="upgrade-levels">
                            ${createLevelBoxes(maxLevels, currentLevel)}
                        </div>
                    </div>`;
            }
            categoryDiv.innerHTML = categoryHTML;
            container.appendChild(categoryDiv);
        };

        // Process Player Upgrades
        processCategory(globalUpgrades.player, 'player', globalUpgradesContainer);

        // Process Weapon Upgrades (which are nested)
        const weaponsCategoryDiv = document.createElement('div');
        weaponsCategoryDiv.className = 'upgrade-category';
        weaponsCategoryDiv.innerHTML = `<h2>Mejoras de Armas</h2>`;

        for (const weaponKey in globalUpgrades.weapons) {
            const weapon = globalUpgrades.weapons[weaponKey];
            const weaponDiv = document.createElement('div');
            weaponDiv.className = 'upgrade-weapon-group';
            let weaponHTML = `<h3>${weapon.name}</h3>`;

            for (const upgradeKey in weapon.upgrades) {
                const upgrade = weapon.upgrades[upgradeKey];
                const upgradeId = `weapons.${weaponKey}.${upgradeKey}`; // e.g., weapons.canon.damage
                const currentLevel = playerData.globalUpgrades[upgradeId] || 0;
                const maxLevels = upgrade.costs.length;
                const isMaxed = currentLevel >= maxLevels;
                const cost = isMaxed ? 'MAX' : `${upgrade.costs[currentLevel]} Oro`;
                const canAfford = !isMaxed && getGold() >= upgrade.costs[currentLevel];

                weaponHTML += `
                    <div class="upgrade-item">
                        <div class="upgrade-item-info">
                            <p>${upgrade.name}</p>
                            <button class="buy-upgrade-btn" data-upgrade-id="${upgradeId}" ${isMaxed || !canAfford ? 'disabled' : ''}>
                                ${cost}
                            </button>
                        </div>
                        <div class="upgrade-levels">
                            ${createLevelBoxes(maxLevels, currentLevel)}
                        </div>
                    </div>`;
            }
            weaponDiv.innerHTML = weaponHTML;
            weaponsCategoryDiv.appendChild(weaponDiv);
        }
        globalUpgradesContainer.appendChild(weaponsCategoryDiv);
    }

    // Add all event listeners
    startScreen.addEventListener('click', () => changeState('mainMenu'));
    startGameBtn.addEventListener('click', () => changeState('characterSelection'));
    charactersBtn.addEventListener('click', () => changeState('characterSelection'));
    upgradesBtn.addEventListener('click', () => {
        populateGlobalUpgradesScreen();
        changeState('globalUpgrades');
    });
    charSelectBackBtn.addEventListener('click', () => changeState('mainMenu'));
    upgradesBackBtn.addEventListener('click', () => changeState('mainMenu'));
    restartBtn.addEventListener('click', () => changeState('mainMenu'));

    globalUpgradesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-upgrade-btn')) {
            const button = e.target;
            const upgradeId = button.dataset.upgradeId;
            const idParts = upgradeId.split('.'); // e.g., ['weapons', 'canon', 'damage'] or ['player', 'speed']

            let upgradeData;
            if (idParts.length === 3) { // Weapon upgrade
                upgradeData = globalUpgrades[idParts[0]][idParts[1]].upgrades[idParts[2]];
            } else { // Player upgrade
                upgradeData = globalUpgrades[idParts[0]].upgrades[idParts[1]];
            }

            if (!upgradeData) {
                console.error(`Upgrade with ID ${upgradeId} not found.`);
                return;
            }

            const playerData = getPlayerData();
            const currentLevel = playerData.globalUpgrades[upgradeId] || 0;

            if (currentLevel < upgradeData.costs.length) {
                const cost = upgradeData.costs[currentLevel];
                if (getGold() >= cost) {
                    addGold(-cost); // Using addGold with a negative value to subtract
                    playerData.globalUpgrades[upgradeId] = currentLevel + 1;
                    savePlayerData();
                    // Repopulate the screen to reflect the change
                    populateGlobalUpgradesScreen();
                    updateGoldDisplay(); // Also update gold on the main menu in the background
                }
            }
        }
    });

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (gameState === 'levelUp' && key === 'enter') changeState('running');
        if(keys){
            lastInputMethod = 'keyboard';
            if (key === 'w' || key === 'arrowup') keys.up = true;
            if (key === 's' || key === 'arrowdown') keys.down = true;
            if (key === 'a' || key === 'arrowleft') keys.left = true;
            if (key === 'd' || key === 'arrowright') keys.right = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if(keys){
            if (key === 'w' || key === 'arrowup') keys.up = false;
            if (key === 's' || key === 'arrowdown') keys.down = false;
            if (key === 'a' || key === 'arrowleft') keys.left = false;
            if (key === 'd' || key === 'arrowright') keys.right = false;
        }
    });

    window.addEventListener('resize', () => {
        if (gameState === 'running' || gameState === 'levelUp') setupCanvas();
    });

    gameContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState !== 'running') return;
        const touch = e.touches[0];
        joystick.active = true;
        lastInputMethod = 'joystick';
        joystick.baseX = touch.clientX;
        joystick.baseY = touch.clientY;
        joystick.knobX = touch.clientX;
        joystick.knobY = touch.clientY;
        joystickBase.style.display = 'block';
        joystickKnob.style.display = 'block';
        joystickBase.style.left = `${joystick.baseX}px`;
        joystickBase.style.top = `${joystick.baseY}px`;
        joystickKnob.style.left = `${joystick.knobX}px`;
        joystickKnob.style.top = `${joystick.knobY}px`;
    });

    gameContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!joystick.active) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - joystick.baseX;
        const deltaY = touch.clientY - joystick.baseY;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > joystick.radius) {
            joystick.knobX = joystick.baseX + (deltaX / distance) * joystick.radius;
            joystick.knobY = joystick.baseY + (deltaY / distance) * joystick.radius;
        } else {
            joystick.knobX = touch.clientX;
            joystick.knobY = touch.clientY;
        }
        joystickKnob.style.left = `${joystick.knobX}px`;
        joystickKnob.style.top = `${joystick.knobY}px`;
    });

    gameContainer.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!joystick.active) return;
        joystick.active = false;
        joystickBase.style.display = 'none';
        joystickKnob.style.display = 'none';
        if (player) {
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    });

    // Initial setup
    loadPlayerData();
    updateGoldDisplay();
    populateCharacterSelection();
    changeState('startScreen');
    animate(); // Start the main game loop

});

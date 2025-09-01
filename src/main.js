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
import { maps } from './data/maps.js';
import { weapons } from './data/weapons.js';
import { characters } from './data/characters.js';
import { passives } from './data/passives.js';
import { globalUpgrades } from './data/globalUpgrades.js';
import { loadPlayerData, getGold, addGold, getPlayerData, savePlayerData } from './data/playerData.js';

// =================================================================================
//                                  GAME SETUP
// =================================================================================
window.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const startScreen = document.getElementById('start-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const characterSelectionScreen = document.getElementById('character-selection-screen');
    const characterList = document.getElementById('character-list');
    const mapSelectionScreen = document.getElementById('map-selection-screen');
    const mapList = document.getElementById('map-list');
    const gameContainer = document.getElementById('game-container');
    const joystickBase = document.getElementById('joystick-base');
    const joystickKnob = document.getElementById('joystick-knob');
    const levelUpScreen = document.getElementById('level-up-screen');
    const upgradeCardsContainer = document.getElementById('upgrade-cards-container');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverSummary = document.getElementById('game-over-summary');
    const globalUpgradesScreen = document.getElementById('global-upgrades-screen');
    const globalUpgradesContainer = document.getElementById('global-upgrades-container');
    const pauseScreen = document.getElementById('pause-screen');
    const pauseUpgradesList = document.getElementById('pause-upgrades-list');

    // --- Button References ---
    const startGameBtn = document.getElementById('start-game-btn');
    const charactersBtn = document.getElementById('characters-btn');
    const upgradesBtn = document.getElementById('upgrades-btn');
    const charSelectBackBtn = document.getElementById('char-select-back-btn');
    const mapSelectBackBtn = document.getElementById('map-select-back-btn');
    const upgradesBackBtn = document.getElementById('upgrades-back-btn');
    const restartBtn = document.getElementById('restart-btn');
    const victoryBackBtn = document.getElementById('victory-back-btn');
    const victoryScreen = document.getElementById('victory-screen');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const exitGameBtn = document.getElementById('exit-game-btn');


    // --- UI Elements ---
    const goldCounter = mainMenuScreen.querySelector('.gold-counter');

    // --- Canvas Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- Game State & Core Variables ---
    let player, keys, enemies, projectiles, groundAreas, xpGems, visualEffects, goldBags, gameState, gameTimer, waveCount, randomXpOrbTimer, goldBagSpawnTimer, bossSpawnPauseTimer, selectedCharacter, selectedMap, isGranAtractorMode, granAtractorBossCount, granAtractorNextBossTimer, lastBossStats, granAtractorWaveTimer;
    const bossTimes = [300, 600, 900, 1200];
    const granAtractorBossOrder = [ 'boss1', 'boss5', 'boss6', 'boss7', 'boss8', 'boss2', 'boss9', 'boss10', 'boss11', 'boss12', 'boss3', 'boss13', 'boss14', 'boss15', 'boss16', 'boss4', 'boss17', 'boss18', 'boss19', 'boss20' ];
    let bossesSpawned = [false, false, false, false];
    let nextWaveTimer, nextEnemySpawnTimer, enemySpawnInterval, enemiesLeftToSpawn;

    // --- Input State ---
    let joystick = { active: false, baseX: 0, baseY: 0, knobX: 0, knobY: 0, radius: 60 };
    let lastInputMethod = 'keyboard';

    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function changeState(newState) {
        gameState = newState;
        startScreen.style.display = (newState === 'startScreen') ? 'flex' : 'none';
        mainMenuScreen.style.display = (newState === 'mainMenu') ? 'flex' : 'none';
        characterSelectionScreen.style.display = (newState === 'characterSelection') ? 'flex' : 'none';
        mapSelectionScreen.style.display = (newState === 'mapSelection') ? 'flex' : 'none';
        gameContainer.style.display = (newState === 'running' || newState === 'levelUp' || newState === 'paused') ? 'block' : 'none';
        pauseBtn.style.display = (newState === 'running') ? 'block' : 'none';
        levelUpScreen.style.display = (newState === 'levelUp') ? 'flex' : 'none';
        pauseScreen.style.display = (newState === 'paused') ? 'flex' : 'none';
        gameOverScreen.style.display = (newState === 'gameOver') ? 'flex' : 'none';
        globalUpgradesScreen.style.display = (newState === 'globalUpgrades') ? 'flex' : 'none';
        victoryScreen.style.display = (newState === 'victory') ? 'flex' : 'none';

        if (newState === 'paused') populatePauseScreen();
        if (newState === 'levelUp') populateLevelUpScreen(getUpgradeOptions());
        if (newState === 'gameOver') {
            const timeSurvived = Math.floor(gameTimer / 60);
            addGold(timeSurvived);
            gameOverSummary.textContent = `Sobreviviste ${timeSurvived} segundos y ganaste ${timeSurvived} de oro.`;
            updateGoldDisplay();
        }
        if (newState === 'mainMenu') updateGoldDisplay();
    }

    function updateGoldDisplay() { goldCounter.textContent = `Oro: ${getGold()}`; }

    function populateCharacterSelection() {
        characterList.innerHTML = '';
        const unlockedCharacters = getPlayerData().unlockedCharacters;
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            const startingWeaponName = weapons[char.startingWeapon].name;
            if (unlockedCharacters.includes(char.id)) {
                card.style.cursor = 'pointer';
                card.innerHTML = `<img src="${char.imageSrc}" alt="${char.name}" class="ship-preview-img"><h2>${char.name}</h2><p>${char.description}</p><p class="ability">${char.ability}</p><p class="starting-weapon">Arma Inicial: <strong>${startingWeaponName}</strong></p>`;
                card.addEventListener('click', () => { selectedCharacter = char; populateMapSelectionScreen(); changeState('mapSelection'); });
            } else {
                card.classList.add('locked');
                card.innerHTML = `<img src="${char.imageSrc}" alt="${char.name}" class="ship-preview-img" style="filter: grayscale(1) brightness(0.5);"><h2>${char.name}</h2><p class="locked-text">BLOQUEADO</p>`;
            }
            characterList.appendChild(card);
        });
    }

    function populateLevelUpScreen(options) {
        upgradeCardsContainer.innerHTML = '';
        if (options.length === 0) options.push({ name: "Recuperación", description: "Recupera 25 de vida.", apply: () => { player.health = Math.min(player.maxHealth, player.health + 25); }});
        options.forEach(option => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `<h3>${option.name}</h3><p>${option.description}</p>`;
            card.addEventListener('click', () => { option.apply(); changeState('running'); });
            upgradeCardsContainer.appendChild(card);
        });
    }

    function getUpgradeOptions() {
        const pool = [];
        player.weapons.forEach(w => {
            if (w.level < w.maxLevel - 1) {
                const availableUpgrades = w.baseData.upgradePool.filter(upgrade => {
                    if (!upgrade.max) return true;
                    const timesApplied = w.upgradeHistory[upgrade.description] || 0;
                    return timesApplied < upgrade.max;
                });
                if (availableUpgrades.length > 0) {
                    const randomUpgrade = availableUpgrades[Math.floor(Math.random() * availableUpgrades.length)];
                    pool.push({ type: 'weapon_upgrade', name: `Mejorar ${w.getName()}`, description: randomUpgrade.description, apply: () => w.applyUpgrade(randomUpgrade) });
                }
            } else if (w.level === w.maxLevel - 1 && w.baseData.evolution && !w.baseData.isEvolved) {
                const evolution = w.baseData.evolution;
                if (player.passives.map(p => p.id).includes(evolution.requires)) {
                    pool.push({
                        type: 'weapon_evolution', name: `Evolucionar: ${evolution.name}`, description: evolution.description,
                        apply: () => {
                            const weaponIndex = player.weapons.findIndex(weapon => weapon.id === w.id);
                            if (weaponIndex !== -1) {
                                const oldWeapon = player.weapons[weaponIndex];
                                const newWeapon = new WeaponInstance(evolution.evolvedId);
                                newWeapon.stats = oldWeapon.stats;
                                newWeapon.level = oldWeapon.maxLevel;
                                player.weapons[weaponIndex] = newWeapon;
                            }
                        }
                    });
                }
            }
        });
        const ownedWeaponIds = player.weapons.map(w => w.id);
        if (ownedWeaponIds.length < 6) {
            Object.keys(weapons).filter(id => !ownedWeaponIds.includes(id) && !weapons[id].isEvolved).forEach(id => {
                pool.push({ type: 'new_weapon', name: `Nueva Arma: ${weapons[id].name}`, description: weapons[id].description, apply: () => player.weapons.push(new WeaponInstance(id)) });
            });
        }
        const ownedPassiveIds = player.passives.map(p => p.id);
        passives.filter(p => !ownedPassiveIds.includes(p.id)).forEach(p => {
            pool.push({ type: 'passive', name: p.name, description: p.description, apply: () => { p.apply(player); player.passives.push(p); } });
        });
        return pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    function populatePauseScreen() {
        pauseUpgradesList.innerHTML = '';
        const weaponsTitle = document.createElement('h3');
        weaponsTitle.textContent = 'Armas';
        pauseUpgradesList.appendChild(weaponsTitle);
        player.weapons.forEach(w => {
            const item = document.createElement('div');
            item.textContent = `${w.getName()} - Nivel ${w.level}`;
            pauseUpgradesList.appendChild(item);
        });
        const passivesTitle = document.createElement('h3');
        passivesTitle.textContent = 'Pasivas';
        pauseUpgradesList.appendChild(passivesTitle);
        player.passives.forEach(passive => {
            const item = document.createElement('div');
            item.textContent = passive.name;
            pauseUpgradesList.appendChild(item);
        });
    }

    function populateMapSelectionScreen() {
        mapList.innerHTML = '';
        const unlockedMaps = getPlayerData().unlockedMaps;
        maps.forEach(map => {
            const card = document.createElement('div');
            card.className = 'map-card';
            card.style.backgroundColor = map.backgroundColor;
            if (unlockedMaps.includes(map.id)) {
                card.innerHTML = `<h3>${map.name}</h3>`;
                card.addEventListener('click', () => init(selectedCharacter, map));
            } else {
                card.innerHTML = `<h3>???</h3><p>Bloqueado</p>`;
                card.classList.add('locked');
            }
            mapList.appendChild(card);
        });
    }

    function init(character, map) {
        selectedMap = map;
        setupCanvas();
        player = new Player(character);
        player.weapons.push(new WeaponInstance(character.startingWeapon));
        keys = { up: false, down: false, left: false, right: false };
        enemies = []; projectiles = []; groundAreas = []; xpGems = []; visualEffects = []; goldBags = [];
        gameTimer = 0; waveCount = 0; bossSpawnPauseTimer = 0;
        bossesSpawned = [false, false, false, false];
        isGranAtractorMode = selectedMap.id === 'map5';
        if (isGranAtractorMode) {
            granAtractorBossCount = 0;
            granAtractorNextBossTimer = 300;
            granAtractorWaveTimer = 1800;
            lastBossStats = null;
        }
        nextWaveTimer = 60; nextEnemySpawnTimer = 0; enemySpawnInterval = 0; enemiesLeftToSpawn = 0;
        randomXpOrbTimer = 300; goldBagSpawnTimer = 600;
        changeState('running');
    }

    function updateGranAtractor() {
        granAtractorNextBossTimer--;
        if (granAtractorNextBossTimer <= 0 && granAtractorBossCount < 20) {
            granAtractorBossCount++;
            granAtractorNextBossTimer = 3600;
            const bossBaseTypeKey = granAtractorBossOrder[granAtractorBossCount - 1];
            const bossBaseType = enemyTypes[bossBaseTypeKey];
            let newStats;
            if (lastBossStats === null) newStats = { ...bossBaseType };
            else newStats = { ...lastBossStats, health: lastBossStats.health * 1.5, damage: lastBossStats.damage * 1.5, size: Math.min(400, lastBossStats.size * 1.1) };
            lastBossStats = newStats;
            const angle = Math.random() * Math.PI * 2, radius = Math.max(canvas.width, canvas.height) * 0.7;
            const x = player.position.x + Math.cos(angle) * radius, y = player.position.y + Math.sin(angle) * radius;
            enemies.push(new Enemy({ position: { x, y }, type: bossBaseType, stats: newStats }));
        }
        granAtractorWaveTimer--;
        if (granAtractorWaveTimer <= 0) {
            granAtractorWaveTimer = 1800;
            for (let i = 0; i < 30; i++) {
                const enemyTypeKey = selectedMap.allowedEnemies[Math.floor(Math.random() * selectedMap.allowedEnemies.length)];
                const scaledStats = getScaledStats(enemyTypeKey, gameTimer / 60);
                const angle = Math.random() * Math.PI * 2, radius = Math.max(canvas.width, canvas.height) * 0.7;
                const x = player.position.x + Math.cos(angle) * radius, y = player.position.y + Math.sin(angle) * radius;
                enemies.push(new Enemy({ position: { x, y }, type: enemyTypes[enemyTypeKey], stats: scaledStats }));
            }
        }
    }

    function getScaledStats(enemyType, gameTimeInSeconds) {
        const wave = Math.floor(gameTimeInSeconds / 30);
        const maxWaves = 40; // 20 minutes
        const currentWave = Math.min(wave, maxWaves);
        const healthDamageMultiplier = 1 + (0.25 * currentWave);
        const speedMultiplier = 1 + (0.05 * currentWave);
        const baseStats = enemyTypes[enemyType];
        return { ...baseStats, health: baseStats.health * healthDamageMultiplier, damage: baseStats.damage * healthDamageMultiplier, speed: baseStats.speed * speedMultiplier };
    }

    function updateEnemySpawns() {
        gameTimer++;
        if (isGranAtractorMode) { updateGranAtractor(); return; }
        nextWaveTimer--; nextEnemySpawnTimer--;
        const gameTimeInSeconds = Math.floor(gameTimer / 60);
        if (!isGranAtractorMode) {
            for (let i = 0; i < bossTimes.length; i++) {
                if (!bossesSpawned[i] && gameTimeInSeconds >= bossTimes[i]) {
                    bossesSpawned[i] = true;
                    bossSpawnPauseTimer = 300;
                    const isFinalBossTime = i === bossTimes.length - 1;
                    let bossId = isFinalBossTime ? selectedMap.finalBoss : selectedMap.bossPool.filter(id => id !== selectedMap.finalBoss)[Math.floor(Math.random() * (selectedMap.bossPool.length - 1))];
                    if (bossId) {
                        const angle = Math.random() * Math.PI * 2, radius = Math.max(canvas.width, canvas.height) * 0.7;
                        const x = player.position.x + Math.cos(angle) * radius, y = player.position.y + Math.sin(angle) * radius;
                        enemies.push(new Enemy({ position: { x, y }, type: enemyTypes[bossId] }));
                    }
                    break;
                }
            }
        }
        if (bossSpawnPauseTimer > 0) { bossSpawnPauseTimer--; return; }
        if (gameTimeInSeconds >= 1200) return;
        if (nextWaveTimer <= 0) {
            waveCount++; nextWaveTimer = 1800;
            enemiesLeftToSpawn = 30 + (waveCount - 1) * 30;
            enemySpawnInterval = 1800 / enemiesLeftToSpawn; nextEnemySpawnTimer = 0;
        }
        if (nextEnemySpawnTimer <= 0 && enemiesLeftToSpawn > 0) {
            nextEnemySpawnTimer += enemySpawnInterval; enemiesLeftToSpawn--;
            let availableEnemies = selectedMap.allowedEnemies.slice(0, 2);
            const enemyTypeKey = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
            const scaledStats = getScaledStats(enemyTypeKey, gameTimeInSeconds);
            const angle = Math.random() * Math.PI * 2, radius = Math.max(canvas.width, canvas.height) * 0.7;
            const x = player.position.x + Math.cos(angle) * radius, y = player.position.y + Math.sin(angle) * radius;
            enemies.push(new Enemy({ position: { x, y }, type: enemyTypes[enemyTypeKey], stats: scaledStats }));
        }
    }

    function drawUI() {
        if (!player) return;
        const baseFontSize = canvas.width / 60;
        const minutes = Math.floor(gameTimer / 3600).toString().padStart(2, '0');
        const seconds = Math.floor((gameTimer % 3600) / 60).toString().padStart(2, '0');
        ctx.font = `${Math.max(20, baseFontSize)}px Arial`;
        ctx.fillStyle = 'white'; ctx.textAlign = 'center';
        ctx.fillText(`${minutes}:${seconds}`, canvas.width / 2, 50);
        const xpBarWidth = canvas.width * 0.6, xpBarHeight = 20;
        const xpBarX = (canvas.width - xpBarWidth) / 2, xpBarY = canvas.height - xpBarHeight - 20;
        ctx.fillStyle = '#444'; ctx.fillRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight);
        const xpPercentage = player.xp / player.xpToNextLevel;
        ctx.fillStyle = '#00e5ff'; ctx.fillRect(xpBarX, xpBarY, xpBarWidth * xpPercentage, xpBarHeight);
        ctx.strokeStyle = 'white'; ctx.strokeRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight);
        const healthBarHeight = 20, healthBarX = xpBarX, healthBarY = xpBarY - healthBarHeight - 10;
        ctx.fillStyle = '#440000'; ctx.fillRect(healthBarX, healthBarY, xpBarWidth, healthBarHeight);
        const healthPercentage = player.health / player.maxHealth;
        ctx.fillStyle = '#00ff00'; ctx.fillRect(healthBarX, healthBarY, xpBarWidth * healthPercentage, healthBarHeight);
        ctx.strokeStyle = 'white'; ctx.strokeRect(healthBarX, healthBarY, xpBarWidth, healthBarHeight);
        ctx.font = `${Math.max(12, baseFontSize * 0.7)}px Arial`;
        ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(player.health)} / ${Math.round(player.maxHealth)}`, canvas.width / 2, healthBarY + healthBarHeight / 2);
        ctx.font = `${Math.max(16, baseFontSize * 0.9)}px Arial`;
        ctx.fillStyle = 'gold'; ctx.textAlign = 'right';
        ctx.fillText(`Nivel: ${player.level}`, xpBarX - 10, healthBarY + healthBarHeight / 2);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (gameState !== 'running' && gameState !== 'levelUp') return;
        if (gameState === 'running') {
            if (player.health <= 0) { changeState('gameOver'); return; }
            updateEnemySpawns();
            player.velocity.x = 0; player.velocity.y = 0;
            if (keys.up) player.velocity.y = -player.speed;
            if (keys.down) player.velocity.y = player.speed;
            if (keys.left) player.velocity.x = -player.speed;
            if (keys.right) player.velocity.x = player.speed;
            if (joystick.active) {
                const dx = joystick.knobX - joystick.baseX, dy = joystick.knobY - joystick.baseY, mag = Math.hypot(dx, dy);
                if (mag > 0) { player.velocity.x = (dx / mag) * player.speed; player.velocity.y = (dy / mag) * player.speed; }
            }
            if (!joystick.active && player.velocity.x !== 0 && player.velocity.y !== 0) {
                player.velocity.x /= Math.sqrt(2); player.velocity.y /= Math.sqrt(2);
            }
            player.update();
            player.weapons.forEach(w => {
                w.update();
                const stats = w.getStats(player);
                if (w.id === 'onda-de-repulsion') {
                    if (w.cooldown <= 0 && !w.isActive) { w.isActive = true; w.activeTimer = stats.duration; w.cooldown = stats.cooldown; }
                    if (w.isActive) { enemies.forEach(enemy => { if (Math.hypot(player.position.x - (enemy.position.x+enemy.width/2), player.position.y - (enemy.position.y+enemy.height/2)) < stats.area) enemy.takeDamage(stats.damage / 60); }); }
                } else if (w.cooldown <= 0) {
                    const newAttacks = w.attack(player, enemies);
                    newAttacks.forEach(attackData => {
                        if (attackData.type === 'projectile') projectiles.push(new Projectile(attackData));
                        else if (attackData.type === 'ground_area') groundAreas.push(new GroundArea(attackData));
                    });
                    w.cooldown = stats.cooldown;
                }
            });
            enemies.forEach(e => {
                e.update(player);
                if (e.isBoss) {
                    const attackDataArray = e.attack(player);
                    if (attackDataArray.length > 0) {
                        attackDataArray.forEach(attackData => {
                            if (attackData.type === 'projectile') projectiles.push(new Projectile(attackData));
                            else if (attackData.type === 'spawn') {
                                for (let i = 0; i < attackData.count; i++) {
                                    const enemyKey = selectedMap.allowedEnemies[Math.floor(Math.random() * selectedMap.allowedEnemies.length)];
                                    enemies.push(new Enemy({ position: { x: e.position.x + (Math.random() - 0.5) * 200, y: e.position.y + (Math.random() - 0.5) * 200 }, type: enemyTypes[enemyKey] }));
                                }
                            } else if (attackData.type === 'laser') {
                                visualEffects.push(new VisualEffect({ position: { x: e.position.x + e.width / 2, y: e.position.y + e.height / 2 }, width: 2000, height: 10, color: 'rgba(255, 100, 100, 0.7)', duration: attackData.duration, angle: attackData.angle }));
                                const dx = player.position.x - (e.position.x + e.width / 2), dy = player.position.y - (e.position.y + e.height / 2);
                                if (Math.abs(dx * Math.sin(attackData.angle) - dy * Math.cos(attackData.angle)) < player.width / 2 + 5) player.takeDamage(attackData.damage);
                            }
                        });
                    }
                }
            });
            projectiles.forEach(p => p.update(player, canvas));
            groundAreas.forEach(area => area.update(enemies));
            visualEffects.forEach(v => v.update());
            enemies.forEach(e => {
                const playerLeft = player.position.x - player.width / 2, playerRight = player.position.x + player.width / 2;
                const playerTop = player.position.y - player.height / 2, playerBottom = player.position.y + player.height / 2;
                const enemyLeft = e.position.x, enemyRight = e.position.x + e.width, enemyTop = e.position.y, enemyBottom = e.position.y + e.height;
                if (playerLeft < enemyRight && playerRight > enemyLeft && playerTop < enemyBottom && playerBottom > enemyTop) player.takeDamage(e.damage);
            });
            projectiles.forEach(p => {
                if (p.isMarkedForDeletion) return;
                const projLeft = p.position.x - p.radius, projRight = p.position.x + p.radius, projTop = p.position.y - p.radius, projBottom = p.position.y + p.radius;
                if (p.source === 'player') {
                    enemies.forEach(e => {
                        if (e.isMarkedForDeletion) return;
                        const enemyLeft = e.position.x, enemyRight = e.position.x + e.width, enemyTop = e.position.y, enemyBottom = e.position.y + e.height;
                        if (projLeft < enemyRight && projRight > enemyLeft && projTop < enemyBottom && projBottom > enemyTop) {
                            e.takeDamage(p.damage); if(p.causesExplosion) groundAreas.push(new GroundArea({ position: { ...e.position }, radius: 40, damage: p.damage * 0.5, duration: 20 }));
                            if (!p.bounces) p.isMarkedForDeletion = true;
                        }
                    });
                } else if (p.source === 'enemy') {
                    const playerLeft = player.position.x - player.width / 2, playerRight = player.position.x + player.width / 2;
                    const playerTop = player.position.y - player.height / 2, playerBottom = player.position.y + player.height / 2;
                    if (projLeft < playerRight && projRight > playerLeft && projTop < playerBottom && projBottom > playerTop) {
                        player.takeDamage(p.damage); p.isMarkedForDeletion = true;
                    }
                }
            });
            enemies.forEach(e => {
                if (e.isMarkedForDeletion) {
                    xpGems.push(new XPGem({ position: { ...e.position }, value: e.xpValue }));
                    let victory = false;
                    if (isGranAtractorMode) {
                        if (e.isBoss && granAtractorBossCount >= 20 && enemies.filter(en => !en.isMarkedForDeletion).length === 1) victory = true;
                    } else if (selectedMap.finalBoss && e.type.id === selectedMap.finalBoss) {
                        victory = true;
                    }
                    if (victory) {
                        const playerData = getPlayerData();
                        const currentMapIndex = maps.findIndex(m => m.id === selectedMap.id);
                        const nextMap = maps[currentMapIndex + 1];
                        if (nextMap && !playerData.unlockedMaps.includes(nextMap.id)) playerData.unlockedMaps.push(nextMap.id);
                        const characterToUnlockId = currentMapIndex + 3;
                        const characterToUnlock = characters.find(c => c.id === characterToUnlockId);
                        if (characterToUnlock && !playerData.unlockedCharacters.includes(characterToUnlock.id)) playerData.unlockedCharacters.push(characterToUnlock.id);
                        addGold(isGranAtractorMode ? 5000 : 1000);
                        changeState('victory');
                    }
                }
            });
            enemies = enemies.filter(e => !e.isMarkedForDeletion);
            projectiles = projectiles.filter(p => !p.isMarkedForDeletion);
            groundAreas = groundAreas.filter(a => !a.isMarkedForDeletion);
            visualEffects = visualEffects.filter(v => !v.isMarkedForDeletion);
            xpGems.forEach(gem => { if (Math.hypot(player.position.x - gem.position.x, player.position.y - gem.position.y) < player.pickupRadius) { if (player.addXP(gem.value)) changeState('levelUp'); gem.isMarkedForDeletion = true; } });
            xpGems = xpGems.filter(g => !g.isMarkedForDeletion);
        }
        ctx.fillStyle = selectedMap ? selectedMap.backgroundColor : '#0a0a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (player) {
            ctx.save();
            ctx.translate(canvas.width / 2 - player.position.x, canvas.height / 2 - player.position.y);
            groundAreas.forEach(area => area.draw(ctx));
            visualEffects.forEach(v => v.draw(ctx));
            xpGems.forEach(gem => gem.draw(ctx));
            enemies.forEach(e => e.draw(ctx));
            projectiles.forEach(p => p.draw(ctx));
            player.draw(ctx);
            ctx.restore();
        }
        drawUI();
    }
    loadPlayerData();
    updateGoldDisplay();
    populateCharacterSelection();
    changeState('startScreen');
    animate();
});

// =================================================================================
//                                  IMPORTS
// =================================================================================
import { Player } from './components/Player.js';
import { Enemy } from './components/Enemy.js';
import { Projectile } from './components/Projectile.js';
import { XPGem } from './components/XPGem.js';
import { GroundArea } from './components/GroundArea.js';
import { Aura } from './components/Aura.js';
import { WeaponInstance } from './components/WeaponInstance.js';
import { enemyTypes } from './data/enemies.js';
import { waveTimeline } from './data/waves.js';
import { weapons } from './data/weapons.js';
import { characters } from './data/characters.js';
import { passives } from './data/passives.js';

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

    // --- Button References ---
    const startGameBtn = document.getElementById('start-game-btn');
    const charactersBtn = document.getElementById('characters-btn');
    const charSelectBackBtn = document.getElementById('char-select-back-btn');

    // --- Canvas Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- Game State & Core Variables ---
    let player, keys, enemies, projectiles, groundAreas, activeAuras, xpGems, gameState, gameTimer, spawnTimers;

    // --- Joystick State ---
    let joystick = { active: false, baseX: 0, baseY: 0, knobX: 0, knobY: 0, radius: 60 };

    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function changeState(newState) {
        gameState = newState;
        startScreen.style.display = 'none';
        mainMenuScreen.style.display = 'none';
        characterSelectionScreen.style.display = 'none';
        gameContainer.style.display = 'none';
        levelUpScreen.style.display = 'none';

        switch (newState) {
            case 'startScreen': startScreen.style.display = 'flex'; break;
            case 'mainMenu': mainMenuScreen.style.display = 'flex'; break;
            case 'characterSelection': characterSelectionScreen.style.display = 'flex'; break;
            case 'running': gameContainer.style.display = 'block'; break;
            case 'levelUp':
                gameContainer.style.display = 'block';
                levelUpScreen.style.display = 'flex';
                const options = getUpgradeOptions();
                populateLevelUpScreen(options);
                break;
        }
    }

    // =================================================================================
    //                               UI POPULATION
    // =================================================================================
    function populateCharacterSelection() {
        characterList.innerHTML = '';
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <img src="${char.imageSrc}" alt="${char.name}" class="ship-preview-img">
                <h2>${char.name}</h2>
                <p>${char.description}</p>
                <p class="ability">${char.ability}</p>
            `;
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

    // =================================================================================
    //                          LEVEL-UP and UPGRADE LOGIC
    // =================================================================================
    function getUpgradeOptions() {
        const upgradePool = [];
        player.weapons.forEach(weaponInstance => {
            const nextUpgrade = weaponInstance.baseData.upgrades[weaponInstance.level - 1];
            if (nextUpgrade) {
                upgradePool.push({
                    type: 'weapon_upgrade',
                    name: nextUpgrade.evolution ? nextUpgrade.name : `Mejorar ${weaponInstance.getName()}`,
                    description: nextUpgrade.description,
                    apply: () => weaponInstance.levelUp(),
                });
            }
        });
        const ownedWeaponIds = player.weapons.map(w => w.baseData.id);
        if (ownedWeaponIds.length < 6) {
            const availableNewWeapons = Object.values(weapons).filter(w => !ownedWeaponIds.includes(w.id));
            availableNewWeapons.forEach(weaponData => {
                upgradePool.push({
                    type: 'new_weapon',
                    name: `Nueva Arma: ${weaponData.name}`,
                    description: weaponData.description,
                    apply: () => player.weapons.push(new WeaponInstance(weaponData.id)),
                });
            });
        }
        passives.forEach(passive => {
            upgradePool.push({ type: 'passive', ...passive });
        });
        const shuffled = upgradePool.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }

    // =================================================================================
    //                               CORE GAME LOGIC
    // =================================================================================
    function init(character) {
        setupCanvas();
        player = new Player(character);
        player.weapons.push(new WeaponInstance(character.startingWeapon));
        keys = { up: false, down: false, left: false, right: false };
        enemies = [];
        projectiles = [];
        groundAreas = [];
        activeAuras = [];
        xpGems = [];
        gameTimer = 0;
        spawnTimers = {};
        waveTimeline.forEach((wave, i) => { spawnTimers[i] = wave.rate; });
        changeState('running');
        animate();
    }

    function updateEnemySpawns() {
        if (gameState !== 'running') return;
        gameTimer++;
        const gameTimeInSeconds = Math.floor(gameTimer / 60);
        waveTimeline.forEach((wave, index) => {
            if (gameTimeInSeconds >= wave.time) {
                spawnTimers[index]--;
                if (spawnTimers[index] <= 0) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.max(canvas.width, canvas.height) * 0.7;
                    const x = player.position.x + Math.cos(angle) * radius;
                    const y = player.position.y + Math.sin(angle) * radius;
                    enemies.push(new Enemy({ position: { x, y }, type: enemyTypes[wave.type] }));
                    spawnTimers[index] = wave.rate;
                }
            }
        });
    }

    function drawUI() {
        ctx.fillStyle = 'grey';
        ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
        ctx.fillStyle = 'cyan';
        const xpWidth = (player.xp / player.xpToNextLevel) * canvas.width;
        ctx.fillRect(0, canvas.height - 10, xpWidth > 0 ? xpWidth : 0, 10);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        const minutes = Math.floor(gameTimer / 3600).toString().padStart(2, '0');
        const seconds = Math.floor((gameTimer % 3600) / 60).toString().padStart(2, '0');
        ctx.fillText(`${minutes}:${seconds}`, canvas.width / 2, 40);
        ctx.textAlign = 'left';
    }

    function animate() {
        requestAnimationFrame(animate);
        if (gameState === 'levelUp') {
            return;
        }
        if (gameState !== 'running') return;

        updateEnemySpawns();
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        player.velocity.x = 0;
        player.velocity.y = 0;
        if (keys.up) player.velocity.y = -player.speed;
        if (keys.down) player.velocity.y = player.speed;
        if (keys.left) player.velocity.x = -player.speed;
        if (keys.right) player.velocity.x = player.speed;

        if (joystick.active) {
            const dx = joystick.knobX - joystick.baseX;
            const dy = joystick.knobY - joystick.baseY;
            const magnitude = Math.hypot(dx, dy);
            if (magnitude > 0) {
                player.velocity.x = (dx / magnitude) * player.speed;
                player.velocity.y = (dy / magnitude) * player.speed;
            }
        }

        if (player.velocity.x !== 0 && player.velocity.y !== 0) {
            player.velocity.x /= Math.sqrt(2);
            player.velocity.y /= Math.sqrt(2);
        }

        if (player.velocity.x !== 0 || player.velocity.y !== 0) {
            const magnitude = Math.hypot(player.velocity.x, player.velocity.y);
            player.direction = { x: player.velocity.x / magnitude, y: player.velocity.y / magnitude };
        }
        player.update();

        player.weapons.forEach(weaponInstance => {
            if (weaponInstance.cooldown > 0) {
                weaponInstance.cooldown--;
            } else {
                const newAttacks = weaponInstance.attack(player, enemies);
                newAttacks.forEach(attackData => {
                    if (attackData.type === 'projectile') projectiles.push(new Projectile(attackData));
                    else if (attackData.type === 'aura') activeAuras.push(new Aura({ ...attackData, duration: 5 }));
                    else if (attackData.type === 'hitbox') {
                        enemies.forEach(enemy => {
                            const hitbox = {
                                x: attackData.side === 'left' ? player.position.x - attackData.width : player.position.x,
                                y: player.position.y - (attackData.height / 2),
                                width: attackData.width,
                                height: attackData.height
                            };
                            if (hitbox.x < enemy.position.x + enemy.width && hitbox.x + hitbox.width > enemy.position.x &&
                                hitbox.y < enemy.position.y + enemy.height && hitbox.y + hitbox.height > enemy.position.y) {
                                enemy.takeDamage(attackData.damage);
                            }
                        });
                    } else if (attackData.type === 'ground_area') groundAreas.push(new GroundArea(attackData));
                });
                weaponInstance.cooldown = weaponInstance.getStats().cooldown * player.cooldown_modifier;
            }
        });

        xpGems.forEach(gem => gem.update(player));
        enemies.forEach(e => e.update(player));
        projectiles.forEach(p => p.update());
        groundAreas.forEach(area => area.update(enemies));
        activeAuras.forEach(aura => aura.update(player.position));

        ctx.save();
        const cameraX = player.position.x - canvas.width / 2;
        const cameraY = player.position.y - canvas.height / 2;
        ctx.translate(-cameraX, -cameraY);

        groundAreas.forEach(area => area.draw(ctx));
        activeAuras.forEach(aura => aura.draw(ctx));
        xpGems.forEach(gem => gem.draw(ctx));
        enemies.forEach(e => e.draw(ctx));
        projectiles.forEach(p => p.draw(ctx));
        player.draw(ctx);

        ctx.restore();

        projectiles.forEach(proj => {
            enemies.forEach(enemy => {
                if (enemy.isMarkedForDeletion) return;
                const dist = Math.hypot(proj.position.x - enemy.position.x, proj.position.y - enemy.position.y);
                if (dist < proj.radius + enemy.width / 2) {
                    proj.isMarkedForDeletion = true;
                    enemy.takeDamage(proj.damage);
                }
            });
        });

        activeAuras.forEach(aura => {
            enemies.forEach(enemy => {
                if (enemy.isMarkedForDeletion) return;
                const dist = Math.hypot(aura.position.x - enemy.position.x, aura.position.y - enemy.position.y);
                if (dist < aura.radius) {
                    enemy.takeDamage(aura.damage / 60);
                }
            });
        });

        enemies.forEach(enemy => {
            if (enemy.isMarkedForDeletion) {
                xpGems.push(new XPGem({ position: { ...enemy.position } }));
            }
        });

        xpGems.forEach(gem => {
            const dist = Math.hypot(player.position.x - gem.position.x, player.position.y - gem.position.y);
            if (dist < player.pickupRadius) {
                if (player.addXP(gem.value)) {
                    changeState('levelUp');
                }
                gem.isMarkedForDeletion = true;
            }
        });

        drawUI();
        projectiles = projectiles.filter(p => !p.isMarkedForDeletion);
        groundAreas = groundAreas.filter(a => !a.isMarkedForDeletion);
        activeAuras = activeAuras.filter(a => !a.isMarkedForDeletion);
        enemies = enemies.filter(e => !e.isMarkedForDeletion);
        xpGems = xpGems.filter(g => !g.isMarkedForDeletion);
    }

    startScreen.addEventListener('click', () => changeState('mainMenu'));
    startGameBtn.addEventListener('click', () => changeState('characterSelection'));
    charactersBtn.addEventListener('click', () => changeState('characterSelection'));
    charSelectBackBtn.addEventListener('click', () => changeState('mainMenu'));

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (gameState === 'levelUp' && key === 'enter') changeState('running');
        if (key === 'w' || key === 'arrowup') keys.up = true;
        if (key === 's' || key === 'arrowdown') keys.down = true;
        if (key === 'a' || key === 'arrowleft') keys.left = true;
        if (key === 'd' || key === 'arrowright') keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') keys.up = false;
        if (key === 's' || key === 'arrowdown') keys.down = false;
        if (key === 'a' || key === 'arrowleft') keys.left = false;
        if (key === 'd' || key === 'arrowright') keys.right = false;
    });

    window.addEventListener('resize', () => {
        if (gameState === 'running' || gameState === 'levelUp') setupCanvas();
    });

    gameContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState !== 'running') return;
        const touch = e.touches[0];
        joystick.active = true;
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

    populateCharacterSelection();
    changeState('startScreen');
});

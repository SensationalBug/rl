// =================================================================================
//                                  IMPORTS
// =================================================================================
import { Player } from './components/Player.js';
import { Enemy } from './components/Enemy.js';
import { Projectile } from './components/Projectile.js';
import { XPGem } from './components/XPGem.js';
import { GroundArea } from './components/GroundArea.js';
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
    let player, keys, enemies, projectiles, groundAreas, xpGems, gameState, gameTimer, spawnTimers;

    // --- Joystick State ---
    let joystick = { active: false, baseX: 0, baseY: 0, knobX: 0, knobY: 0, radius: 60 };

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

        // Special logic for level up screen
        if (newState === 'levelUp') {
            const options = getUpgradeOptions();
            populateLevelUpScreen(options);
        }
    }

    function populateCharacterSelection() {
        characterList.innerHTML = '';
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `<img src="${char.imageSrc}" alt="${char.name}" class="ship-preview-img"><h2>${char.name}</h2><p>${char.description}</p><p class="ability">${char.ability}</p>`;
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
        player.weapons.forEach(w => {
            const nextUp = w.baseData.upgrades[w.level - 1];
            if(nextUp) pool.push({ type: 'weapon_upgrade', name: nextUp.evolution ? nextUp.name : `Mejorar ${w.getName()}`, description: nextUp.description, apply: () => w.levelUp() });
        });
        const ownedIds = player.weapons.map(w => w.id);
        if(ownedIds.length < 6) Object.keys(weapons).filter(id => !ownedIds.includes(id)).forEach(id => pool.push({ type: 'new_weapon', name: `Nueva Arma: ${weapons[id].name}`, description: weapons[id].description, apply: () => player.weapons.push(new WeaponInstance(id)) }));
        passives.forEach(p => pool.push({ type: 'passive', ...p }));
        return pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    function init(character) {
        setupCanvas();
        player = new Player(character);
        player.weapons.push(new WeaponInstance(character.startingWeapon));
        keys = { up: false, down: false, left: false, right: false };
        enemies = []; projectiles = []; groundAreas = []; xpGems = [];
        gameTimer = 0;
        spawnTimers = {};
        waveTimeline.forEach((wave, i) => { spawnTimers[i] = wave.rate; });
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
            updateEnemySpawns();

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
                }
            }

            if (player.velocity.x !== 0 && player.velocity.y !== 0) {
                player.velocity.x /= Math.sqrt(2);
                player.velocity.y /= Math.sqrt(2);
            }

            if (player.velocity.x !== 0 || player.velocity.y !== 0) {
                player.direction = { x: player.velocity.x, y: player.velocity.y };
            }
            player.update();

            // --- Weapon Updates & Attacks ---
            player.weapons.forEach(w => {
                w.update();
                if (w.baseData.id === 'onda-de-repulsion') {
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
                            if (dist < stats.area) enemy.takeDamage(stats.damage / 60); // damage per frame
                        });
                    }
                } else if (w.cooldown <= 0) {
                    const newAttacks = w.attack(player, enemies);
                    newAttacks.forEach(attackData => {
                        if (attackData.type === 'projectile') projectiles.push(new Projectile(attackData));
                        else if (attackData.type === 'hitbox') {
                            enemies.forEach(enemy => {
                                const hitbox = { x: attackData.side === 'left' ? player.position.x - attackData.width : player.position.x, y: player.position.y - (attackData.height / 2), width: attackData.width, height: attackData.height };
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

            // --- Collision Detection ---
            projectiles.forEach(p => {
                enemies.forEach(e => {
                    if (e.isMarkedForDeletion) return;
                    const dist = Math.hypot(p.position.x - e.position.x, p.position.y - e.position.y);
                    if (dist < e.width / 2) { // Simple circle collision
                        e.takeDamage(p.damage);
                        p.isMarkedForDeletion = true;
                    }
                });
            });

            enemies = enemies.filter(e => !e.isMarkedForDeletion);
            projectiles = projectiles.filter(p => !p.isMarkedForDeletion);
            xpGems.forEach(gem => {
                if (Math.hypot(player.position.x - gem.position.x, player.position.y - gem.position.y) < player.pickupRadius) {
                    if (player.addXP(gem.value)) changeState('levelUp');
                    gem.isMarkedForDeletion = true;
                }
            });
            xpGems = xpGems.filter(g => !g.isMarkedForDeletion);
        }

        // 3. Handle all drawing, which happens for both 'running' and 'levelUp' states.
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (player) {
            ctx.save();
            ctx.translate(canvas.width / 2 - player.position.x, canvas.height / 2 - player.position.y);

            groundAreas.forEach(area => area.draw(ctx));

            // --- Draw Repulsion Wave Aura ---
            player.weapons.forEach(w => {
                if (w.isActive && w.baseData.id === 'onda-de-repulsion') {
                    const stats = w.getStats();
                    ctx.beginPath();
                    ctx.arc(player.position.x, player.position.y, stats.area, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200, 0, 255, 0.15)';
                    ctx.fill();
                }
            });

            xpGems.forEach(gem => gem.draw(ctx));
            enemies.forEach(e => e.draw(ctx));
            projectiles.forEach(p => p.draw(ctx));
            player.draw(ctx);
            ctx.restore();
        }

        drawUI();
    }

    // Add all event listeners
    startScreen.addEventListener('click', () => changeState('mainMenu'));
    startGameBtn.addEventListener('click', () => changeState('characterSelection'));
    charactersBtn.addEventListener('click', () => changeState('characterSelection'));
    charSelectBackBtn.addEventListener('click', () => changeState('mainMenu'));

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (gameState === 'levelUp' && key === 'enter') changeState('running');
        if(keys){
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
    populateCharacterSelection();
    changeState('startScreen');
    animate(); // Start the main game loop

});

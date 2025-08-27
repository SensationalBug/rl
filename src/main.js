// =================================================================================
//                                  IMPORTS
// =================================================================================
import { Player } from './components/Player.js';
import { Enemy } from './components/Enemy.js';
import { Projectile } from './components/Projectile.js';
import { XPGem } from './components/XPGem.js';
import { GroundArea } from './components/GroundArea.js';
import { enemyTypes } from './data/enemies.js';
import { waveTimeline } from './data/waves.js';
import { weapons } from './data/weapons.js';
import { characters } from './data/characters.js';
import { drawPolygon } from './utils/drawing.js';

// =================================================================================
//                                  GAME SETUP
// =================================================================================
window.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const startScreen = document.getElementById('start-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const characterSelectionScreen = document.getElementById('character-selection-screen');
    const weaponViewScreen = document.getElementById('weapon-view-screen');
    const characterList = document.getElementById('character-list');
    const weaponList = document.getElementById('weapon-list');

    // --- Button References ---
    const startGameBtn = document.getElementById('start-game-btn');
    const charactersBtn = document.getElementById('characters-btn');
    const weaponsBtn = document.getElementById('weapons-btn');
    const charSelectBackBtn = document.getElementById('char-select-back-btn');
    const weaponViewBackBtn = document.getElementById('weapon-view-back-btn');

    // --- Canvas Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- Game State & Core Variables ---
    let player, keys, enemies, projectiles, groundAreas, xpGems, gameState, gameTimer, spawnTimers;

    /**
     * Sets the canvas dimensions to fill the window.
     */
    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    /**
     * Manages the visibility of different game screens.
     * @param {string} newState - The new state to transition to (e.g., 'mainMenu', 'running').
     */
    function changeState(newState) {
        gameState = newState;
        // Hide all screens first for a clean transition
        startScreen.style.display = 'none';
        mainMenuScreen.style.display = 'none';
        characterSelectionScreen.style.display = 'none';
        weaponViewScreen.style.display = 'none';
        canvas.style.display = 'none';

        // Show the correct screen based on the new state
        switch (gameState) {
            case 'startScreen':
                startScreen.style.display = 'flex';
                break;
            case 'mainMenu':
                mainMenuScreen.style.display = 'flex';
                break;
            case 'characterSelection':
                characterSelectionScreen.style.display = 'flex';
                break;
            case 'weaponView':
                weaponViewScreen.style.display = 'flex';
                break;
            case 'running':
            case 'levelUp':
                canvas.style.display = 'block';
                break;
        }
    }

    // =================================================================================
    //                               UI POPULATION & DRAWING
    // =================================================================================

    /**
     * Draws a geometric shape on a canvas, used for weapon representation.
     * @param {HTMLCanvasElement} canvas - The canvas to draw on.
     * @param {object} shape - An object describing the shape to draw.
     */
    function drawWeaponShape(canvas, shape) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#ff8a80';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(255, 138, 128, 0.3)';

        switch (shape.type) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(centerX, centerY, shape.radius * 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fill();
                break;
            case 'rectangle':
                ctx.strokeRect(centerX - shape.width, centerY - shape.height / 2, shape.width * 2, shape.height * 2);
                ctx.fillRect(centerX - shape.width, centerY - shape.height / 2, shape.width * 2, shape.height * 2);
                break;
            case 'ring':
                ctx.beginPath();
                ctx.arc(centerX, centerY, shape.outerRadius / 2, 0, Math.PI * 2);
                ctx.moveTo(centerX + shape.innerRadius / 2, centerY);
                ctx.arc(centerX, centerY, shape.innerRadius / 2, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.fill();
                break;
            case 'square':
                 ctx.strokeRect(centerX - shape.size, centerY - shape.size, shape.size * 2, shape.size * 2);
                 ctx.fillRect(centerX - shape.size, centerY - shape.size, shape.size * 2, shape.size * 2);
                break;
            case 'line':
                ctx.beginPath();
                ctx.moveTo(centerX - shape.length / 2, centerY);
                ctx.lineTo(centerX + shape.length / 2, centerY);
                ctx.stroke();
                break;
        }
    }

    /**
     * Creates and injects the character cards into the selection screen.
     */
    function populateCharacterSelection() {
        characterList.innerHTML = ''; // Clear existing content
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.style.cursor = 'pointer'; // Make it look clickable
            card.innerHTML = `
                <canvas class="shape-canvas" id="canvas-char-${char.id}" width="100" height="100"></canvas>
                <h2>${char.name}</h2>
                <p>${char.description}</p>
                <p class="ability">${char.ability}</p>
            `;

            card.addEventListener('click', () => {
                init(char); // Start game with the selected character
            });

            characterList.appendChild(card);

            const shapeCanvas = document.getElementById(`canvas-char-${char.id}`);
            const shapeCtx = shapeCanvas.getContext('2d');
            shapeCtx.strokeStyle = '#ffc107';
            shapeCtx.lineWidth = 3;
            shapeCtx.fillStyle = 'rgba(255, 193, 7, 0.3)';
            drawPolygon(shapeCtx, shapeCanvas.width / 2, shapeCanvas.height / 2, shapeCanvas.width / 2 * 0.8, char.shape.sides);
        });
    }

    /**
     * Creates and injects the weapon cards into the viewing screen.
     */
    function populateWeaponView() {
        weaponList.innerHTML = ''; // Clear existing content
        Object.values(weapons).forEach(weapon => {
            const card = document.createElement('div');
            card.className = 'weapon-card';
            card.innerHTML = `
                <canvas class="shape-canvas" id="canvas-weapon-${weapon.id}" width="100" height="100"></canvas>
                <h2>${weapon.name}</h2>
                <p>${weapon.description}</p>
            `;
            weaponList.appendChild(card);

            const shapeCanvas = document.getElementById(`canvas-weapon-${weapon.id}`);
            drawWeaponShape(shapeCanvas, weapon.shape);
        });
    }


    // =================================================================================
    //                               CORE GAME LOGIC
    // =================================================================================

    /**
     * Initializes or resets the game state for a new run.
     * @param {object} character - The character object chosen by the player.
     */
    function init(character) {
        setupCanvas();
        player = new Player(character);
        keys = { up: { pressed: false }, down: { pressed: false }, left: { pressed: false }, right: { pressed: false } };
        enemies = [];
        projectiles = [];
        groundAreas = [];
        xpGems = [];
        gameTimer = 0;
        spawnTimers = {};
        waveTimeline.forEach((wave, index) => {
            spawnTimers[index] = wave.rate;
        });

        // Assign starting weapon from character data
        player.weapon = weapons[character.startingWeapon];
        player.attackCooldown = player.weapon.stats.cooldown;

        changeState('running');
        animate(); // Start the game loop
    }

    /**
     * Handles the spawning of enemies based on the game timer and wave data.
     */
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
                }
            }
        });
    }

    /**
     * Draws the "Level Up" overlay.
     */
    function drawLevelUpScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡NIVEL ALCANZADO!', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '20px Arial';
        ctx.fillText('Presiona Enter para continuar (por ahora)', canvas.width / 2, canvas.height / 2 + 50);
        ctx.textAlign = 'left';
    }

    /**
     * Draws the in-game UI (XP bar, timer).
     */
    function drawUI() {
        // XP Bar
        ctx.fillStyle = 'grey';
        ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
        ctx.fillStyle = 'cyan';
        const xpWidth = (player.xp / player.xpToNextLevel) * canvas.width;
        ctx.fillRect(0, canvas.height - 10, xpWidth > 0 ? xpWidth : 0, 10);

        // Game Timer
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        const minutes = Math.floor(gameTimer / 3600).toString().padStart(2, '0');
        const seconds = Math.floor((gameTimer % 3600) / 60).toString().padStart(2, '0');
        ctx.fillText(`${minutes}:${seconds}`, canvas.width / 2, 40);
        ctx.textAlign = 'left';
    }

    /**
     * The main game loop, called recursively with requestAnimationFrame.
     */
    function animate() {
        requestAnimationFrame(animate);

        // Pause animation if the game is not in a running state
        if (gameState === 'levelUp') {
            drawLevelUpScreen();
            return;
        }
        if (gameState !== 'running') return;

        // --- Updates ---
        updateEnemySpawns();

        // --- Drawing ---
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Player movement
        player.velocity.x = 0;
        player.velocity.y = 0;
        if (keys.up.pressed) player.velocity.y = -player.speed;
        if (keys.down.pressed) player.velocity.y = player.speed;
        if (keys.left.pressed) player.velocity.x = -player.speed;
        if (keys.right.pressed) player.velocity.x = player.speed;
        if (player.velocity.x !== 0 && player.velocity.y !== 0) {
            player.velocity.x /= Math.sqrt(2);
            player.velocity.y /= Math.sqrt(2);
        }
        player.update();

        // Weapon attack
        if (player.attackCooldown > 0) {
            player.attackCooldown--;
        } else {
            const newAttacks = player.weapon.attack(player, enemies);
            newAttacks.forEach(attackData => {
                if (attackData.type === 'projectile') {
                    projectiles.push(new Projectile(attackData));
                } else if (attackData.type === 'aura') {
                    enemies.forEach(enemy => {
                        const dist = Math.hypot(attackData.position.x - enemy.position.x, attackData.position.y - enemy.position.y);
                        if (dist < attackData.radius) {
                            enemy.takeDamage(attackData.damage);
                        }
                    });
                } else if (attackData.type === 'hitbox') {
                    enemies.forEach(enemy => {
                        const hitbox = {
                            x: attackData.side === 'left' ? attackData.position.x - attackData.width : attackData.position.x,
                            y: attackData.position.y - (attackData.height / 2),
                            width: attackData.width,
                            height: attackData.height
                        };
                        if (
                            hitbox.x < enemy.position.x + enemy.width &&
                            hitbox.x + hitbox.width > enemy.position.x &&
                            hitbox.y < enemy.position.y + enemy.height &&
                            hitbox.y + hitbox.height > enemy.position.y
                        ) {
                            enemy.takeDamage(attackData.damage);
                        }
                    });
                } else if (attackData.type === 'ground_area') {
                    groundAreas.push(new GroundArea(attackData));
                } else {
                    console.log(`Unhandled attack type: ${attackData.type}`);
                }
            });
            player.attackCooldown = player.weapon.stats.cooldown;
        }

        // Update all game objects
        xpGems.forEach(gem => gem.update(player));
        enemies.forEach(e => e.update(player));
        projectiles.forEach(p => p.update());
        groundAreas.forEach(area => area.update(enemies));

        // Camera translation to follow player
        ctx.save();
        const cameraX = player.position.x - canvas.width / 2 + player.width / 2;
        const cameraY = player.position.y - canvas.height / 2 + player.height / 2;
        ctx.translate(-cameraX, -cameraY);

        // Draw all game objects relative to the camera
        groundAreas.forEach(area => area.draw(ctx));
        xpGems.forEach(gem => gem.draw(ctx));
        enemies.forEach(e => e.draw(ctx));
        projectiles.forEach(p => p.draw(ctx));
        player.draw(ctx);

        // --- Collision Detection & Post-update checks ---
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

        enemies.forEach(enemy => {
            if (enemy.isMarkedForDeletion) {
                xpGems.push(new XPGem({ position: { ...enemy.position } }));
            }
        });

        xpGems.forEach(gem => {
            const dist = Math.hypot(player.position.x - gem.position.x, player.position.y - gem.position.y);
            if (dist < player.width / 2 + gem.width / 2) {
                if (player.addXP(gem.value)) {
                    changeState('levelUp');
                }
                gem.isMarkedForDeletion = true;
            }
        });

        ctx.restore(); // Reset camera transform

        // --- UI & Cleanup ---
        drawUI();
        projectiles = projectiles.filter(p => !p.isMarkedForDeletion);
        groundAreas = groundAreas.filter(a => !a.isMarkedForDeletion);
        enemies = enemies.filter(e => !e.isMarkedForDeletion);
        xpGems = xpGems.filter(g => !g.isMarkedForDeletion);
    }

    // =================================================================================
    //                               EVENT LISTENERS
    // =================================================================================
    startScreen.addEventListener('click', () => changeState('mainMenu'));
    startGameBtn.addEventListener('click', () => changeState('characterSelection'));
    charactersBtn.addEventListener('click', () => changeState('characterSelection'));
    weaponsBtn.addEventListener('click', () => changeState('weaponView'));
    charSelectBackBtn.addEventListener('click', () => changeState('mainMenu'));
    weaponViewBackBtn.addEventListener('click', () => changeState('mainMenu'));

    window.addEventListener('keydown', ({ key: k }) => {
        const key = k.toLowerCase();
        if (key === 'enter' && gameState === 'levelUp') {
            changeState('running');
            return;
        }
        if (keys && (key === 'w' || key === 'arrowup')) keys.up.pressed = true;
        if (keys && (key === 's' || key === 'arrowdown')) keys.down.pressed = true;
        if (keys && (key === 'a' || key === 'arrowleft')) keys.left.pressed = true;
        if (keys && (key === 'd' || key === 'arrowright')) keys.right.pressed = true;
    });

    window.addEventListener('keyup', ({ key: k }) => {
        const key = k.toLowerCase();
        if (keys && (key === 'w' || key === 'arrowup')) keys.up.pressed = false;
        if (keys && (key === 's' || key === 'arrowdown')) keys.down.pressed = false;
        if (keys && (key === 'a' || key === 'arrowleft')) keys.left.pressed = false;
        if (keys && (key === 'd' || key === 'arrowright')) keys.right.pressed = false;
    });

    window.addEventListener('resize', () => {
        if (gameState === 'running' || gameState === 'levelUp') {
            setupCanvas();
        }
    });

    // =================================================================================
    //                               INITIAL SCRIPT EXECUTION
    // =================================================================================
    populateCharacterSelection();
    populateWeaponView();
    changeState('startScreen');
});

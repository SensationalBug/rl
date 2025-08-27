import { Player } from './components/Player.js';
import { Enemy } from './components/Enemy.js';
import { Projectile } from './components/Projectile.js';
import { XPGem } from './components/XPGem.js';
import { enemyTypes } from './data/enemies.js';
import { waveTimeline } from './data/waves.js';
import { weapons } from './data/weapons.js';

// Comentario: Configuración inicial del lienzo (canvas)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- Variables y Datos del Juego ---
let player, keys, enemies, projectiles, xpGems, gameState, gameTimer, spawnTimers;

// --- Funciones Principales ---
function init() {
    player = new Player();
    keys = { up: { pressed: false }, down: { pressed: false }, left: { pressed: false }, right: { pressed: false } };
    enemies = [];
    projectiles = [];
    xpGems = [];
    gameState = 'running';
    gameTimer = 0;
    spawnTimers = {};
    waveTimeline.forEach((wave, index) => {
        spawnTimers[index] = wave.rate;
    });

    player.weapon = weapons.magicWand;
    player.attackCooldown = player.weapon.cooldown;
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
                enemies.push(new Enemy({ position: { x, y }, type: wave.type }));
                spawnTimers[index] = wave.rate;
            }
        }
    });
}

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
        drawLevelUpScreen();
        return;
    }

    updateEnemySpawns();
    ctx.fillStyle = '#0a0a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Lógica del Juego ---
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

    if (player.attackCooldown > 0) player.attackCooldown--;
    else {
        const newProjectilesData = player.weapon.attack(player, enemies);
        newProjectilesData.forEach(data => {
            projectiles.push(new Projectile(data));
        });
        player.attackCooldown = player.weapon.cooldown;
    }

    xpGems.forEach(gem => gem.update(player));
    enemies.forEach(e => e.update(player));
    projectiles.forEach(p => p.update());

    // --- Cámara y Dibujo ---
    ctx.save();
    const cameraX = player.position.x - canvas.width / 2 + player.width / 2;
    const cameraY = player.position.y - canvas.height / 2 + player.height / 2;
    ctx.translate(-cameraX, -cameraY);

    xpGems.forEach(gem => gem.draw(ctx));
    enemies.forEach(e => e.draw(ctx));
    projectiles.forEach(p => p.draw(ctx));
    player.draw(ctx);

    // --- Colisiones ---
    projectiles.forEach(proj => {
        enemies.forEach(enemy => {
            const dist = Math.hypot(proj.position.x - enemy.position.x, proj.position.y - enemy.position.y);
            if (dist < proj.radius + enemy.width / 2) {
                proj.isMarkedForDeletion = true;
                enemy.isMarkedForDeletion = true;
                xpGems.push(new XPGem({ position: { ...enemy.position } }));
            }
        });
    });

    xpGems.forEach(gem => {
        const dist = Math.hypot(player.position.x - gem.position.x, player.position.y - gem.position.y);
        if (dist < player.width / 2 + gem.width / 2) {
            if (player.addXP(gem.value)) {
                gameState = 'levelUp';
            }
            gem.isMarkedForDeletion = true;
        }
    });

    ctx.restore();

    // --- UI y Limpieza ---
    drawUI();
    projectiles = projectiles.filter(p => !p.isMarkedForDeletion);
    enemies = enemies.filter(e => !e.isMarkedForDeletion);
    xpGems = xpGems.filter(g => !g.isMarkedForDeletion);
}

// --- Inicialización y Event Listeners ---
init();
animate();

window.addEventListener('keydown', ({ key: k }) => {
    const key = k.toLowerCase();
    if (key === 'enter' && gameState === 'levelUp') {
        gameState = 'running';
        return;
    }
    if (key === 'w' || key === 'arrowup') keys.up.pressed = true;
    if (key === 's' || key === 'arrowdown') keys.down.pressed = true;
    if (key === 'a' || key === 'arrowleft') keys.left.pressed = true;
    if (key === 'd' || key === 'arrowright') keys.right.pressed = true;
});
window.addEventListener('keyup', ({ key: k }) => {
    const key = k.toLowerCase();
    if (key === 'w' || key === 'arrowup') keys.up.pressed = false;
    if (key === 's' || key === 'arrowdown') keys.down.pressed = false;
    if (key === 'a' || key === 'arrowleft') keys.left.pressed = false;
    if (key === 'd' || key === 'arrowright') keys.right.pressed = false;
});


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos de la interfaz
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best-score");
const levelElement = document.getElementById("level");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");
const finalScoreElement = document.getElementById("final-score");

// Configuración
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND = 245;
const GRAVITY = 0.65;
const JUMP_FORCE = -13;

let tux;
let obstacles = [];
let score = 0;
let bestScore = Number(localStorage.getItem("tuxBest")) || 0;
let speed = 5;
let level = 1;
let spawnTimer = 0;
let nextSpawn = 100;
let gameRunning = false;
let animationId = null;
let lastTime = 0;
let elapsed = 0;
let backgroundOffset = 0;

bestElement.textContent = bestScore;

// Crear al personaje
function createTux() {
    return {
        x: 85,
        y: GROUND - 62,
        width: 43,
        height: 62,
        velocityY: 0,
        jumping: false,
        legAnimation: 0
    };
}

// Dibujar Tux
function drawTux() {
    const x = tux.x;
    const y = tux.y;

    tux.legAnimation += 0.15;

    // Patas
    const legMove = Math.sin(tux.legAnimation) * 5;

    ctx.fillStyle = "#ff9f1c";
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 58 + (tux.jumping ? 0 : legMove),
        9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + 32, y + 58 - (tux.jumping ? 0 : legMove),
        9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo
    ctx.fillStyle = "#171522";
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 34, 21, 29, 0, 0, Math.PI * 2);
    ctx.fill();

    // Barriga blanca
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 40, 14, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeza
    ctx.fillStyle = "#171522";
    ctx.beginPath();
    ctx.arc(x + 22, y + 13, 17, 0, Math.PI * 2);
    ctx.fill();

    // Cara blanca
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 18, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ojos
    ctx.fillStyle = "#171522";
    ctx.beginPath();
    ctx.arc(x + 16, y + 12, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 28, y + 12, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Pico
    ctx.fillStyle = "#ff9f1c";
    ctx.beginPath();
    ctx.moveTo(x + 17, y + 21);
    ctx.lineTo(x + 27, y + 21);
    ctx.lineTo(x + 22, y + 27);
    ctx.closePath();
    ctx.fill();
}

// Fondo
function drawBackground() {
    // Cielo
    ctx.fillStyle = "#21183d";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Estrellas
    ctx.fillStyle = "#bda9ff";

    for (let i = 0; i < 35; i++) {
        const x = (i * 97 - backgroundOffset * 0.3) % WIDTH;
        const y = 20 + (i * 43) % 160;

        ctx.fillRect(
            x < 0 ? x + WIDTH : x,
            y,
            2,
            2
        );
    }

    // Edificios del fondo
    for (let i = 0; i < 9; i++) {
        const buildingX =
            (i * 110 - backgroundOffset * 0.5) % (WIDTH + 110);

        const x = buildingX < -70 ? buildingX + WIDTH + 110 : buildingX;
        const height = 45 + (i % 4) * 18;

        ctx.fillStyle = "#30234f";
        ctx.fillRect(x, GROUND - height, 65, height);

        ctx.fillStyle = "#a78bfa";

        for (let j = 0; j < 3; j++) {
            ctx.fillRect(x + 12 + j * 16, GROUND - height + 12, 5, 5);
        }
    }

    // Suelo
    ctx.fillStyle = "#a78bfa";
    ctx.fillRect(0, GROUND, WIDTH, 3);

    ctx.fillStyle = "#514078";

    for (let i = 0; i < 25; i++) {
        const x = (i * 45 - backgroundOffset) % WIDTH;
        ctx.fillRect(x < 0 ? x + WIDTH : x, GROUND + 15, 20, 2);
    }
}

// Crear obstáculos
function createObstacle() {
    const types = ["virus", "malware", "firewall"];
    const type = types[Math.floor(Math.random() * types.length)];

    const obstacle = {
        x: WIDTH + 20,
        y: GROUND - 42,
        width: type === "firewall" ? 32 : 38,
        height: type === "firewall" ? 42 : 38,
        type: type
    };

    obstacles.push(obstacle);
}

// Dibujar obstáculos
function drawObstacles() {
    obstacles.forEach(obstacle => {
        const x = obstacle.x;
        const y = obstacle.y;

        if (obstacle.type === "virus") {
            // Virus
            ctx.fillStyle = "#ff5470";
            ctx.beginPath();
            ctx.arc(x + 19, y + 19, 15, 0, Math.PI * 2);
            ctx.fill();

            // Picos
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;

                ctx.beginPath();
                ctx.moveTo(
                    x + 19 + Math.cos(angle) * 13,
                    y + 19 + Math.sin(angle) * 13
                );
                ctx.lineTo(
                    x + 19 + Math.cos(angle) * 21,
                    y + 19 + Math.sin(angle) * 21
                );
                ctx.lineWidth = 5;
                ctx.strokeStyle = "#ff5470";
                ctx.stroke();
            }

            // Ojos
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 12, y + 14, 4, 4);
            ctx.fillRect(x + 23, y + 14, 4, 4);

        } else if (obstacle.type === "malware") {
            // Malware
            ctx.fillStyle = "#fbbf24";
            ctx.fillRect(x + 4, y + 4, 30, 30);

            ctx.fillStyle = "#21183d";
            ctx.fillRect(x + 10, y + 12, 5, 5);
            ctx.fillRect(x + 23, y + 12, 5, 5);
            ctx.fillRect(x + 15, y + 23, 10, 3);

        } else {
            // Firewall
            ctx.fillStyle = "#fb7185";
            ctx.fillRect(x, y, 32, 42);

            ctx.fillStyle = "#fecdd3";
            ctx.fillRect(x + 4, y + 6, 24, 5);
            ctx.fillRect(x + 4, y + 18, 24, 5);
            ctx.fillRect(x + 4, y + 30, 24, 5);
        }
    });
}

// Salto
function jump() {
    if (gameRunning && !tux.jumping) {
        tux.velocityY = JUMP_FORCE;
        tux.jumping = true;
    }
}

// Actualizar personaje
function updateTux(delta) {
    tux.velocityY += GRAVITY * delta;
    tux.y += tux.velocityY * delta;

    if (tux.y >= GROUND - tux.height) {
        tux.y = GROUND - tux.height;
        tux.velocityY = 0;
        tux.jumping = false;
    }
}

// Colisiones
function checkCollision(a, b) {
    const margin = 7;

    return (
        a.x + margin < b.x + b.width - margin &&
        a.x + a.width - margin > b.x + margin &&
        a.y + margin < b.y + b.height - margin &&
        a.y + a.height - margin > b.y + margin
    );
}

// Actualizar obstáculos
function updateObstacles(delta) {
    spawnTimer += delta;

    if (spawnTimer >= nextSpawn) {
        createObstacle();
        spawnTimer = 0;
        nextSpawn = 75 + Math.random() * 55;
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= speed * delta;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    for (const obstacle of obstacles) {
        if (checkCollision(tux, obstacle)) {
            endGame();
            return;
        }
    }
}

// Actualizar puntuación y dificultad
function updateScore(delta) {
    elapsed += delta;
    score = Math.floor(elapsed * 0.5);

    level = Math.floor(score / 100) + 1;
    speed = Math.min(5 + (level - 1) * 0.8, 13);

    scoreElement.textContent = score;
    levelElement.textContent = level;
}

// Bucle principal
function gameLoop(timestamp) {
    if (!gameRunning) return;

    const delta = lastTime
        ? Math.min((timestamp - lastTime) / 16.67, 2)
        : 1;

    lastTime = timestamp;

    updateScore(delta);
    backgroundOffset += speed * delta;

    updateTux(delta);
    updateObstacles(delta);

    drawBackground();
    drawTux();
    drawObstacles();

    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Iniciar partida
function startGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    score = 0;
    speed = 5;
    level = 1;
    elapsed = 0;
    spawnTimer = 0;
    nextSpawn = 100;
    backgroundOffset = 0;
    lastTime = 0;

    obstacles = [];
    tux = createTux();

    scoreElement.textContent = "0";
    levelElement.textContent = "1";

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    gameRunning = true;
    animationId = requestAnimationFrame(gameLoop);
}

// Finalizar partida
function endGame() {
    gameRunning = false;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("tuxBest", bestScore);
        bestElement.textContent = bestScore;
    }

    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove("hidden");
}

// Botones
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// Controles: teclado
document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
    }
});

// Controles: pantalla táctil o clic en el juego
canvas.addEventListener("pointerdown", event => {
    event.preventDefault();
    jump();
});

// Dibujar pantalla inicial
tux = createTux();
drawBackground();
drawTux();
drawObstacles();

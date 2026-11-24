
// Elementos del juego
const board = document.getElementById("game-board");
const timerDisplay = document.getElementById("timer");
const movesDisplay = document.getElementById("moves");
const matchesDisplay = document.getElementById("matches");
const restartBtn = document.getElementById("restart-btn");
const victory = document.getElementById("victory");
const finalScore = document.getElementById("final-score");
const playAgain = document.getElementById("play-again");

// Cartas de ciberseguridad
const symbols = [
    "🔐", "💻", "🛡️", "🦠",
    "🔑", "🌐", "👾", "🔒"
];

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let seconds = 0;
let timerInterval = null;
let gameStarted = false;

// Mezclar las cartas aleatoriamente
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Crear el tablero
function createBoard() {
    board.innerHTML = "";

    cards = shuffle([...symbols, ...symbols]);

    cards.forEach((symbol, index) => {
        const card = document.createElement("button");

        card.classList.add("card");
        card.textContent = "?";
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.setAttribute("aria-label", "Carta oculta");

        card.addEventListener("click", () => flipCard(card));

        board.appendChild(card);
    });
}

// Voltear una carta
function flipCard(card) {
    if (
        lockBoard ||
        card === firstCard ||
        card.classList.contains("matched") ||
        card.classList.contains("revealed")
    ) {
        return;
    }

    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    card.textContent = card.dataset.symbol;
    card.classList.add("revealed");
    card.setAttribute("aria-label", "Carta " + card.dataset.symbol);

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    moves++;

    movesDisplay.textContent = moves;

    checkMatch();
}

// Comprobar si son iguales
function checkMatch() {
    const isMatch =
        firstCard.dataset.symbol === secondCard.dataset.symbol;

    if (isMatch) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        firstCard.disabled = true;
        secondCard.disabled = true;

        matches++;

        matchesDisplay.textContent = matches + "/8";

        resetTurn();

        if (matches === 8) {
            finishGame();
        }

    } else {
        lockBoard = true;

        setTimeout(() => {
            firstCard.textContent = "?";
            secondCard.textContent = "?";

            firstCard.classList.remove("revealed");
            secondCard.classList.remove("revealed");

            firstCard.setAttribute("aria-label", "Carta oculta");
            secondCard.setAttribute("aria-label", "Carta oculta");

            resetTurn();
        }, 900);
    }
}

// Reiniciar turno
function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// Iniciar cronómetro
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        timerDisplay.textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(remainingSeconds).padStart(2, "0");

    }, 1000);
}

// Finalizar partida
function finishGame() {
    clearInterval(timerInterval);

    finalScore.textContent =
        "Movimientos: " + moves +
        " | Tiempo: " + timerDisplay.textContent;

    victory.classList.remove("hidden");
}

// Nueva partida
function restartGame() {
    clearInterval(timerInterval);

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matches = 0;
    seconds = 0;
    gameStarted = false;

    movesDisplay.textContent = "0";
    matchesDisplay.textContent = "0/8";
    timerDisplay.textContent = "00:00";

    victory.classList.add("hidden");

    createBoard();
}

// Botones
restartBtn.addEventListener("click", restartGame);
playAgain.addEventListener("click", restartGame);

// Iniciar juego
createBoard();

// Accessibility Features
let liveRegion = document.createElement('div');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.className = 'sr-only';
document.body.appendChild(liveRegion);

function announce(message) {
    liveRegion.textContent = message;
}

// Game Engine
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let currentGame = null;
let recognition = null;
let isPaused = false;

// Voice Recognition Setup
function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition not supported in your browser");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        processCommand(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };
}

// Command Processing
function processCommand(command) {
    const normalized = command.toLowerCase().trim();
    announce(`Heard: ${normalized}`);

    if (normalized.includes('help')) {
        showHelp();
        return;
    }

    if (normalized.includes('menu')) {
        returnToMenu();
        return;
    }

    if (!currentGame) {
        if (normalized.includes('snake')) startSnake();
        else if (normalized.includes('crossy')) startCrossy();
        return;
    }

    if (currentGame === 'snake') {
        if (normalized.includes('up')) snakeDirection = 'up';
        else if (normalized.includes('down')) snakeDirection = 'down';
        else if (normalized.includes('left')) snakeDirection = 'left';
        else if (normalized.includes('right')) snakeDirection = 'right';
        else if (normalized.includes('pause')) togglePause();
    }
    
    if (currentGame === 'crossy') {
        if (normalized.includes('forward') || normalized.includes('go')) movePlayer(0, -50);
        else if (normalized.includes('left')) movePlayer(-50, 0);
        else if (normalized.includes('right')) movePlayer(50, 0);
    }
}

// Snake Game Implementation
let snake = [];
let snakeDirection = 'right';
let food = null;

function startSnake() {
    currentGame = 'snake';
    canvas.style.display = 'block';
    document.getElementById('gameSelection').style.display = 'none';
    document.getElementById('returnToMenu').style.display = 'inline-block';

    // Initialize snake
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    spawnFood();
    gameLoop();
}

function gameLoop() {
    if (isPaused) return;

    // Move snake
    const head = {...snake[0]};
    switch(snakeDirection) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Check collisions
    if (head.x < 0 || head.x >= 60 || head.y < 0 || head.y >= 40 ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);
    
    // Check food
    if (head.x === food.x && head.y === food.y) {
        spawnFood();
    } else {
        snake.pop();
    }

    draw();
    setTimeout(gameLoop, 150);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
        ctx.fillRect(segment.x * 10, segment.y * 10, 10, 10);
    });

    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(food.x * 10 + 5, food.y * 10 + 5, 5, 0, Math.PI * 2);
    ctx.fill();
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * 60),
        y: Math.floor(Math.random() * 40)
    };
}

function gameOver() {
    alert(`Game Over! Score: ${snake.length - 3}`);
    returnToMenu();
}

// Crossy Road Implementation
let player = {x: 300, y: 350};

function startCrossy() {
    currentGame = 'crossy';
    canvas.style.display = 'block';
    document.getElementById('gameSelection').style.display = 'none';
    document.getElementById('returnToMenu').style.display = 'inline-block';
    gameLoopCrossy();
}

function movePlayer(dx, dy) {
    player.x = Math.max(0, Math.min(canvas.width - 30, player.x + dx));
    player.y = Math.max(0, Math.min(canvas.height - 30, player.y + dy));
}

function gameLoopCrossy() {
    if (isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(player.x, player.y, 30, 30);
    
    requestAnimationFrame(gameLoopCrossy);
}

// Common Functions
function togglePause() {
    isPaused = !isPaused;
    document.getElementById('voiceStatus').textContent = 
        isPaused ? 'Game Paused' : 'Game Resumed';
}

function returnToMenu() {
    currentGame = null;
    canvas.style.display = 'none';
    document.getElementById('gameSelection').style.display = 'flex';
    document.getElementById('returnToMenu').style.display = 'none';
    isPaused = false;
}

function showHelp() {
    const helpMessage = currentGame ? 
        `Current game commands: ${getGameCommands()}` :
        "Say 'Play Snake' or 'Play Crossy Road' to start a game";
    
    alert(helpMessage);
    announce(helpMessage);
}

function getGameCommands() {
    return currentGame === 'snake' ? 
        "Up, Down, Left, Right, Pause, Menu" :
        "Forward, Left, Right, Pause, Menu";
}

// Event Listeners
document.getElementById('startVoice').addEventListener('click', () => {
    initVoice();
    recognition.start();
    document.getElementById('voiceStatus').textContent = 'Listening...';
});

document.getElementById('stopVoice').addEventListener('click', () => {
    recognition.stop();
    document.getElementById('voiceStatus').textContent = 'Voice Stopped';
});

document.getElementById('returnToMenu').addEventListener('click', returnToMenu);

// Keyboard Accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') returnToMenu();
    if (e.altKey && e.key.toLowerCase() === 'v') recognition.start();
});
<<<<<<< HEAD
// Main Game Application
class GameApp {
    constructor() {
        console.log('Initializing GameApp...');
        
        // DOM Elements
        this.gameSelection = document.getElementById('game-selection');
        this.gameContainer = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get canvas context!');
            return;
        }
        
        // Set initial canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Enable font smoothing
        this.ctx.imageSmoothingEnabled = true;
        
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.emotionElement = document.getElementById('emotion');
        this.micButton = document.getElementById('mic-btn');
        this.commandDisplay = document.getElementById('command-display');
        this.commandList = document.getElementById('command-list');
        this.backButton = document.querySelector('.back-btn');
        this.emotionFeedback = document.getElementById('emotion-feedback');
        
        // Game State
        this.currentGame = null;
        this.games = {};  // Initialize empty
        
        // Initialize games with proper canvas sizes
        this.initializeGames();
        
        // Speech Recognition
        this.recognition = null;
        this.emotionAnalyzer = new EmotionAnalyzer();
        this.setupSpeechRecognition();
        
        // Init
        this.bindEvents();
        this.showGameSelection();
        
        // Draw initial screen
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Select a game to start playing!', this.canvas.width / 2, this.canvas.height / 2);
        
        console.log('GameApp initialization complete');
    }
    
    initializeGames() {
        console.log('Initializing games...');
        // Initialize each game with proper settings
        this.games = {
            snake: new SnakeGame(this),
            crossy: new CrossyRoadsGame(this),
            chess: new ChessGame(this)
        };

        // Set specific canvas sizes for each game
        this.games.snake.gridSize = 20;
        this.games.crossy.gridSize = 40;
        this.games.chess.squareSize = 60;
        console.log('Games initialized:', Object.keys(this.games));
    }
    
    bindEvents() {
        // Game selection buttons
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            const playBtn = card.querySelector('.play-btn');
            playBtn.addEventListener('click', () => {
                const gameType = card.getAttribute('data-game');
                this.startGame(gameType);
            });
        });
        
        // Back button
        this.backButton.addEventListener('click', () => {
            this.stopGame();
            this.showGameSelection();
        });
        
        // Mic button
        this.micButton.addEventListener('click', () => {
            this.toggleVoiceRecognition();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    startGame(gameType) {
        console.log('Starting game:', gameType);
        // Stop current game if any
        if (this.currentGame) {
            this.currentGame.stop();
        }

        // Reset canvas size based on game type
        switch(gameType) {
            case 'snake':
                this.canvas.width = 800;
                this.canvas.height = 600;
                break;
            case 'crossy':
                this.canvas.width = 800;
                this.canvas.height = 600;
                break;
            case 'chess':
                this.canvas.width = 480;  // 8 squares * 60px
                this.canvas.height = 480;
                break;
        }

        this.currentGame = this.games[gameType];
        if (!this.currentGame) {
            console.error('Game not found:', gameType);
            return;
        }

        // Clear the canvas before starting
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        console.log('Canvas dimensions set to:', this.canvas.width, 'x', this.canvas.height);
        this.showGameCanvas();
        this.populateCommandList(gameType);
        this.currentGame.start();
        this.startVoiceRecognition();
    }
    
    stopGame() {
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }
        this.stopVoiceRecognition();
    }
    
    showGameSelection() {
        this.gameSelection.style.display = 'flex';
        this.gameContainer.style.display = 'none';
    }
    
    showGameCanvas() {
        this.gameSelection.style.display = 'none';
        this.gameContainer.style.display = 'flex';
    }
    
    resizeCanvas() {
        if (this.currentGame) {
            const containerWidth = this.gameContainer.clientWidth;
            const maxWidth = Math.min(containerWidth - 40, 800);
            
            this.canvas.style.width = `${maxWidth}px`;
            this.canvas.style.height = 'auto';
            
            this.currentGame.handleResize();
        }
    }
    
    populateCommandList(gameType) {
        this.commandList.innerHTML = '';
        
        let commands;
        switch(gameType) {
            case 'snake':
                commands = [
                    { command: "Go Up", action: "Move snake up" },
                    { command: "Go Down", action: "Move snake down" },
                    { command: "Go Left", action: "Move snake left" },
                    { command: "Go Right", action: "Move snake right" },
                    { command: "Pause", action: "Pause game" },
                    { command: "Resume", action: "Resume game" }
                ];
                break;
            case 'crossy':
                commands = [
                    { command: "Forward", action: "Move forward" },
                    { command: "Back", action: "Move backward" },
                    { command: "Left", action: "Move left" },
                    { command: "Right", action: "Move right" },
                    { command: "Jump", action: "Jump over obstacle" },
                    { command: "Pause", action: "Pause game" }
                ];
                break;
            case 'chess':
                commands = [
                    { command: "Select [position]", action: "E.g., 'Select E2'" },
                    { command: "Move to [position]", action: "E.g., 'Move to E4'" },
                    { command: "Castle kingside", action: "Perform kingside castling" },
                    { command: "Castle queenside", action: "Perform queenside castling" },
                    { command: "Undo", action: "Undo last move" },
                    { command: "Restart", action: "Restart game" }
                ];
                break;
        }
        
        commands.forEach(cmd => {
            const cmdItem = document.createElement('div');
            cmdItem.className = 'command-item';
            cmdItem.innerHTML = `
                <span class="command-phrase">"${cmd.command}"</span>
                <span class="command-action">${cmd.action}</span>
            `;
            this.commandList.appendChild(cmdItem);
        });
    }
    
    setupSpeechRecognition() {
        // Check if browser supports speech recognition
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            this.isListening = false;
            
            this.recognition.onstart = () => {
                console.log('Speech recognition started');
                this.micButton.classList.add('listening');
                this.commandDisplay.textContent = 'Listening...';
            };
            
            this.recognition.onresult = (event) => {
                const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
                console.log('Voice command received:', command);
                this.commandDisplay.textContent = `"${command}"`;
                
                // Process command based on current game
                if (this.currentGame) {
                    this.currentGame.processVoiceCommand(command);
                    
                    // Analyze emotion from speech
                    const emotion = this.emotionAnalyzer.analyzeEmotion(command);
                    this.updateEmotionDisplay(emotion);
                }
            };
            
            this.recognition.onend = () => {
                console.log('Speech recognition ended');
                this.micButton.classList.remove('listening');
                this.commandDisplay.textContent = 'Click microphone to start listening';
                
                // Auto restart in game mode if not manually stopped
                if (this.currentGame && this.isListening) {
                    try {
                        this.recognition.start();
                        console.log('Voice recognition restarted');
                    } catch (error) {
                        console.error('Failed to restart speech recognition:', error);
                        this.commandDisplay.textContent = 'Error: Could not restart voice recognition';
                    }
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.micButton.classList.remove('listening');
                this.isListening = false;
                this.commandDisplay.textContent = `Error: ${event.error}`;
                
                // Try to restart if it's a temporary error
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    setTimeout(() => {
                        if (this.currentGame && this.isListening) {
                            try {
                                this.recognition.start();
                                console.log('Voice recognition restarted after error');
                            } catch (error) {
                                console.error('Failed to restart speech recognition:', error);
                                this.commandDisplay.textContent = 'Error: Could not restart voice recognition';
                            }
                        }
                    }, 1000);
                }
            };
        } else {
            console.error('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
            this.micButton.disabled = true;
            this.micButton.title = 'Speech recognition not supported';
            this.commandDisplay.textContent = 'Speech recognition not supported in this browser';
        }
    }
    
    startVoiceRecognition() {
        if (this.recognition) {
            try {
                this.isListening = true;
                this.recognition.start();
                this.micButton.classList.add('listening');
                console.log('Voice recognition started');
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
                this.isListening = false;
                this.micButton.classList.remove('listening');
            }
        }
    }
    
    stopVoiceRecognition() {
        if (this.recognition) {
            try {
                this.isListening = false;
                this.recognition.stop();
                this.micButton.classList.remove('listening');
                console.log('Voice recognition stopped');
            } catch (error) {
                console.error('Failed to stop speech recognition:', error);
            }
        }
    }
    
    toggleVoiceRecognition() {
        if (this.micButton.classList.contains('listening')) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }
    
    updateScore(score) {
        this.scoreElement.textContent = score;
    }
    
    updateLevel(level) {
        this.levelElement.textContent = level;
    }
    
    updateEmotionDisplay(emotion) {
        this.emotionElement.textContent = emotion.name;
        
        // Update feedback based on emotion
        let feedback = '';
        switch(emotion.name) {
            case 'Excited':
                feedback = 'You sound excited! Increasing the challenge!';
                break;
            case 'Frustrated':
                feedback = 'Sensing frustration. Easing difficulty to keep it fun!';
                break;
            case 'Happy':
                feedback = 'Glad you\'re enjoying! Slightly increasing pace.';
                break;
            case 'Calm':
                feedback = 'You\'re playing calmly. Maintaining current difficulty.';
                break;
            case 'Stressed':
                feedback = 'You seem stressed. Reducing difficulty a bit.';
                break;
            default:
                feedback = 'We\'ll adapt game difficulty based on your emotions';
        }
        
        this.emotionFeedback.textContent = feedback;
        
        // Apply difficulty adjustment in current game
        if (this.currentGame) {
            this.currentGame.adjustDifficultyByEmotion(emotion);
        }
    }
}

// Emotion Analysis System
class EmotionAnalyzer {
    constructor() {
        // Keywords associated with different emotions
        this.emotionKeywords = {
            excited: ['wow', 'amazing', 'awesome', 'yes', 'cool', 'great', 'nice', 'fantastic'],
            frustrated: ['damn', 'crap', 'darn', 'no', 'stop', 'terrible', 'bad', 'stupid', 'why'],
            happy: ['good', 'happy', 'love', 'fun', 'enjoy', 'excellent', 'perfect'],
            calm: ['okay', 'fine', 'alright', 'sure', 'proceed', 'continue'],
            stressed: ['hurry', 'quick', 'fast', 'nervous', 'wait', 'difficult', 'hard']
        };
        
        // Emotion state
        this.currentEmotion = { name: 'Neutral', intensity: 0.5 };
        this.emotionHistory = [];
    }
    
    analyzeEmotion(speech) {
        // Default to neutral if no speech
        if (!speech) return this.currentEmotion;
        
        // Convert to lowercase for matching
        speech = speech.toLowerCase();
        
        // Count matches for each emotion
        const emotionScores = {};
        let totalMatches = 0;
        
        for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
            emotionScores[emotion] = 0;
            
            keywords.forEach(keyword => {
                if (speech.includes(keyword)) {
                    emotionScores[emotion]++;
                    totalMatches++;
                }
            });
        }
        
        // Find dominant emotion
        let dominantEmotion = 'Neutral';
        let highestScore = 0;
        
        for (const [emotion, score] of Object.entries(emotionScores)) {
            if (score > highestScore) {
                highestScore = score;
                dominantEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);
            }
        }
        
        // Calculate intensity (0.5 is neutral, ranges from 0.1 to 1.0)
        let intensity = 0.5; // Default neutral
        if (totalMatches > 0) {
            intensity = Math.min(0.5 + (highestScore / totalMatches) * 0.5, 1.0);
        }
        
        // Update emotion with smoothing from history
        this.emotionHistory.push({ name: dominantEmotion, intensity });
        if (this.emotionHistory.length > 5) {
            this.emotionHistory.shift();
        }
        
        // Smooth emotions based on recent history
        this.currentEmotion = this.smoothEmotions();
        
        return this.currentEmotion;
    }
    
    smoothEmotions() {
        if (this.emotionHistory.length === 0) {
            return { name: 'Neutral', intensity: 0.5 };
        }
        
        // Count occurrences of each emotion
        const emotionCounts = {};
        let totalIntensity = 0;
        
        this.emotionHistory.forEach(entry => {
            if (!emotionCounts[entry.name]) {
                emotionCounts[entry.name] = 0;
            }
            emotionCounts[entry.name]++;
            totalIntensity += entry.intensity;
        });
        
        // Find most frequent emotion
        let mostFrequent = 'Neutral';
        let highestCount = 0;
        
        for (const [emotion, count] of Object.entries(emotionCounts)) {
            if (count > highestCount) {
                highestCount = count;
                mostFrequent = emotion;
            }
        }
        
        // Average intensity
        const avgIntensity = totalIntensity / this.emotionHistory.length;
        
        return { name: mostFrequent, intensity: avgIntensity };
    }
}

// Base Game Class
class Game {
    constructor(app) {
        this.app = app;
        this.canvas = app.canvas;
        this.ctx = app.ctx;
        this.isRunning = false;
        this.isPaused = false;
        this.frameId = null;
        this.lastFrameTime = 0;
        this.score = 0;
        this.level = 1;
        this.difficulty = 0.1;
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    stop() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }
    
    pause() {
        this.isPaused = true;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }
    
    resume() {
        if (this.isRunning) {
            this.isPaused = false;
            this.lastFrameTime = performance.now();
            this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning || this.isPaused) return;
        
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Update game state
        this.update(deltaTime);
        
        // Render frame
        this.render();
        
        // Schedule next frame
        this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        // To be implemented by child classes
    }
    
    render() {
        // To be implemented by child classes
    }
    
    processVoiceCommand(command) {
        // Basic commands that work across all games
        command = command.toLowerCase().trim();
        
        if (command === 'pause') {
            this.pause();
            return true;
        } else if (command === 'resume' || command === 'continue') {
            this.resume();
            return true;
        } else if (command === 'restart' && this.gameOver) {
            this.start();
            return true;
        }
        
        return false;
    }
    
    adjustDifficultyByEmotion(emotion) {
        // Adjust difficulty based on player's emotional state
        const adjustments = {
            happy: 0.1,    // Slightly increase difficulty when player is happy
            excited: 0.2,  // More increase when excited
            frustrated: -0.1,  // Decrease when frustrated
            angry: -0.2,   // More decrease when angry
            neutral: 0     // No change for neutral
        };
        
        const adjustment = adjustments[emotion] || 0;
        this.difficulty = Math.max(0.1, Math.min(1, this.difficulty + adjustment));
    }
    
    handleResize() {
        // Default resize behavior
        this.render();
    }
    
    updateUi() {
        if (this.app.scoreElement) {
            this.app.scoreElement.textContent = this.score;
        }
        if (this.app.levelElement) {
            this.app.levelElement.textContent = this.level;
        }
    }
}

// Snake Game Implementation
class SnakeGame extends Game {
    constructor(app) {
        super(app);
        
        // Game properties
        this.gridSize = 20;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.lastUpdateTime = 0;
        this.updateInterval = 150; // ms between moves (adjusted by difficulty)
        this.gameOver = false;
    }
    
    initializeSnake() {
        // Get grid dimensions
        const gridWidth = Math.floor(this.canvas.width / this.gridSize);
        const gridHeight = Math.floor(this.canvas.height / this.gridSize);
        
        // Start snake in the middle
        const startX = Math.floor(gridWidth / 4);
        const startY = Math.floor(gridHeight / 2);
        
        // Create initial snake with 3 segments
        this.snake = [
            {x: startX, y: startY},
            {x: startX - 1, y: startY},
            {x: startX - 2, y: startY}
        ];
        
        // Create initial food
        this.createFood();
    }
    
    start() {
        super.start();
        this.initializeSnake();
        this.direction = 'right';
        this.nextDirection = 'right';
        this.lastUpdateTime = Date.now();
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.updateUi();
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning || this.isPaused) return;
        
        const deltaTime = timestamp - this.lastFrameTime;
        
        // Update game state based on update interval
        if (deltaTime >= this.updateInterval) {
            this.update(deltaTime);
            this.lastFrameTime = timestamp;
        }
        
        // Always render
        this.render();
        
        // Schedule next frame
        this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    stop() {
        super.stop();
        this.gameOver = true;
    }
    
    processVoiceCommand(command) {
        if (!this.isRunning || this.gameOver) return;
        
        // Handle common commands first
        if (super.processVoiceCommand(command)) return;
        
        command = command.toLowerCase().trim();
        
        const directions = {
            'up': 'up',
            'down': 'down',
            'left': 'left',
            'right': 'right',
            'go up': 'up',
            'go down': 'down',
            'go left': 'left',
            'go right': 'right',
            'move up': 'up',
            'move down': 'down',
            'move left': 'left',
            'move right': 'right',
            'turn up': 'up',
            'turn down': 'down',
            'turn left': 'left',
            'turn right': 'right',
            'head up': 'up',
            'head down': 'down',
            'head left': 'left',
            'head right': 'right'
        };
        
        const newDirection = directions[command];
        if (newDirection) {
            // Prevent 180-degree turns
            const opposites = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };
            
            if (opposites[newDirection] !== this.direction) {
                this.nextDirection = newDirection;
            }
        }
    }
    
    update(deltaTime) {
        if (!this.isRunning || this.isPaused || this.gameOver) return;
        
        const now = Date.now();
        const elapsed = now - this.lastUpdateTime;
        
        // Adjust speed based on difficulty
        const speedFactor = 1 + this.difficulty;
        const currentInterval = this.updateInterval / speedFactor;
        
        if (elapsed < currentInterval) return;
        
        this.lastUpdateTime = now;
        
        // Update direction
        this.direction = this.nextDirection;
        
        // Move snake
        const head = {...this.snake[0]};
        
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Get canvas grid dimensions
        const gridWidth = Math.floor(this.canvas.width / this.gridSize);
        const gridHeight = Math.floor(this.canvas.height / this.gridSize);
        
        // Check boundaries and wrap around
        if (head.x < 0) head.x = gridWidth - 1;
        if (head.x >= gridWidth) head.x = 0;
        if (head.y < 0) head.y = gridHeight - 1;
        if (head.y >= gridHeight) head.y = 0;
        
        // Check self collision
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
                this.endGame();
                return;
            }
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check if food eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            // Increase score
            this.score += 10 * this.level;
            this.updateUi();
            
            // Create new food
            this.createFood();
            
            // Level up potentially
            if (this.snake.length % 5 === 0) {
                this.level = Math.min(10, this.level + 1);
                this.difficulty = this.level / 10;
                this.updateUi();
            }
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines for visibility
        this.ctx.strokeStyle = '#3a3a3a';
        this.ctx.lineWidth = 0.5;
        
        const gridWidth = Math.floor(this.canvas.width / this.gridSize);
        const gridHeight = Math.floor(this.canvas.height / this.gridSize);
        
        // Draw grid
        for (let x = 0; x <= gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake with rounded corners
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            // Make head slightly different
            if (i === 0) {
                this.ctx.fillStyle = '#03dac6';  // Cyan for head
            } else {
                this.ctx.fillStyle = '#bb86fc';  // Purple for body
            }
            
            // Draw rounded rectangle for each segment
            this.ctx.beginPath();
            this.ctx.roundRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2,
                5  // Border radius
            );
            this.ctx.fill();
        }
        
        // Draw food as a glowing circle
        if (this.food) {
            // Draw glow effect
            const gradient = this.ctx.createRadialGradient(
                this.food.x * this.gridSize + this.gridSize / 2,
                this.food.y * this.gridSize + this.gridSize / 2,
                0,
                this.food.x * this.gridSize + this.gridSize / 2,
                this.food.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 1.5
            );
            gradient.addColorStop(0, '#cf6679');
            gradient.addColorStop(1, 'rgba(207, 102, 121, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(
                this.food.x * this.gridSize + this.gridSize / 2,
                this.food.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 1.5,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Draw the actual food
            this.ctx.fillStyle = '#cf6679';
            this.ctx.beginPath();
            this.ctx.arc(
                this.food.x * this.gridSize + this.gridSize / 2,
                this.food.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 3,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
        
        // Draw game over if applicable
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    
    createFood() {
        const gridWidth = Math.floor(this.canvas.width / this.gridSize);
        const gridHeight = Math.floor(this.canvas.height / this.gridSize);
        
        // Generate random position
        let x, y;
        let validPosition = false;
        
        while (!validPosition) {
            x = Math.floor(Math.random() * gridWidth);
            y = Math.floor(Math.random() * gridHeight);
            
            validPosition = true;
            
            // Check if position collides with snake
            for (const segment of this.snake) {
                if (segment.x === x && segment.y === y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        this.food = { x, y };
    }
    
    endGame() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }
    
    drawGameOver() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game over text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '40px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Score text
        this.ctx.font = '24px sans-serif';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        
        // Restart instruction
        this.ctx.font = '18px sans-serif';
        this.ctx.fillText('Say "Restart" to play again', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    handleResize() {
        // Adjust grid size based on canvas size
        const minDimension = Math.min(this.canvas.width, this.canvas.height);
        this.gridSize = Math.max(10, Math.floor(minDimension / 30));
    }
}

// Crossy Roads Game Implementation
class CrossyRoadsGame extends Game {
    constructor(app) {
        super(app);
        
        // Game properties
        this.gridSize = 40;
        this.player = { x: 0, y: 0 };
        this.lanes = [];
        this.laneTypes = ['road', 'grass', 'water'];
        this.obstacles = [];
        this.lastMoveTime = 0;
        this.moveInterval = 50; // milliseconds between obstacle movements
        this.canMove = true;
        this.moveDelay = 150; // Time between player moves
        this.gameOver = false;
    }
    
    start() {
        super.start();
        
        // Reset player position
        this.player = {
            x: Math.floor(this.canvas.width / (2 * this.gridSize)),
            y: Math.floor(this.canvas.height / this.gridSize) - 2
        };
        
        // Create initial lanes
        this.createLanes();
        
        // Create initial obstacles
        this.createObstacles();
        
        // Reset game state
        this.lastMoveTime = Date.now();
        this.canMove = true;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.updateUi();
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning || this.isPaused) return;
        
        const deltaTime = timestamp - this.lastFrameTime;
        
        // Update game state based on move interval
        if (deltaTime >= this.moveInterval) {
            this.update(deltaTime);
            this.lastFrameTime = timestamp;
        }
        
        // Always render
        this.render();
        
        // Schedule next frame
        this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    stop() {
        super.stop();
        this.gameOver = true;
    }
    
    processVoiceCommand(command) {
        if (!this.isRunning || this.gameOver) return;
        
        // Handle common commands first
        if (super.processVoiceCommand(command)) return;
        
        command = command.toLowerCase().trim();
        
        const actions = {
            'up': 'up',
            'down': 'down',
            'left': 'left',
            'right': 'right',
            'forward': 'up',
            'back': 'down',
            'backward': 'down',
            'go up': 'up',
            'go down': 'down',
            'go left': 'left',
            'go right': 'right',
            'move up': 'up',
            'move down': 'down',
            'move left': 'left',
            'move right': 'right',
            'jump': 'jump',
            'hop': 'jump',
            'leap': 'jump'
        };
        
        const action = actions[command];
        if (action) {
            if (action === 'jump') {
                // Jump over obstacle - move up twice quickly
                this.movePlayer('up');
                setTimeout(() => this.movePlayer('up'), 50);
            } else {
                this.movePlayer(action);
            }
            return true;
        }
        
        return false;
    }
    
    movePlayer(direction) {
        if (!this.canMove || this.gameOver) return;
        
        const gridWidth = Math.floor(this.canvas.width / this.gridSize);
        const gridHeight = Math.floor(this.canvas.height / this.gridSize);
        
        // Store original position
        const originalX = this.player.x;
        const originalY = this.player.y;
        
        // Update position based on direction
        switch (direction) {
            case 'up':
                if (this.player.y > 0) {
                    this.player.y--;
                }
                break;
            case 'down':
                if (this.player.y < gridHeight - 1) {
                    this.player.y++;
                }
                break;
            case 'left':
                if (this.player.x > 0) {
                    this.player.x--;
                }
                break;
            case 'right':
                if (this.player.x < gridWidth - 1) {
                    this.player.x++;
                }
                break;
        }
        
        // Check for collisions after moving
        if (this.checkCollisions()) {
            // Revert to original position if collision
            this.player.x = originalX;
            this.player.y = originalY;
            return;
        }
        
        // Movement cooldown
        this.canMove = false;
        setTimeout(() => {
            this.canMove = true;
        }, this.moveDelay);
        
        // If moved forward successfully, add points
        if (direction === 'up' && this.player.y < originalY) {
            this.score += 10;
            this.updateUi();
            
            // Level up after certain score thresholds
            if (this.score > 0 && this.score % 50 === 0) {
                this.level = Math.min(10, this.level + 1);
                this.difficulty = this.level / 10;
                this.moveInterval = Math.max(30, 50 - (this.level * 2));
                this.updateUi();
            }
        }
    }
    
    endGame() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }
    
    drawGameOver() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game over text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '40px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Score text
        this.ctx.font = '24px sans-serif';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        
        // Restart instruction
        this.ctx.font = '18px sans-serif';
        this.ctx.fillText('Say "Restart" to play again', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    handleResize() {
        // Adjust grid size based on canvas size
        const minDimension = Math.min(this.canvas.width, this.canvas.height);
        this.gridSize = Math.max(20, Math.floor(minDimension / 15));
    }
    
    createLanes() {
        this.lanes = [];
        const numLanes = Math.ceil(this.canvas.height / this.gridSize);
        
        // First lane is always grass (safe)
        this.lanes.push('grass');
        
        // Generate random lanes
        for (let i = 1; i < numLanes; i++) {
            // Make sure we don't have too many water lanes in a row
            let waterCount = 0;
            for (let j = Math.max(0, i - 3); j < i; j++) {
                if (this.lanes[j] === 'water') waterCount++;
            }
            
            if (waterCount >= 2) {
                // Too many water lanes, force a non-water lane
                const options = ['road', 'grass'];
                this.lanes.push(options[Math.floor(Math.random() * options.length)]);
            } else {
                // Random lane
                const laneType = this.laneTypes[Math.floor(Math.random() * this.laneTypes.length)];
                this.lanes.push(laneType);
            }
        }
    }
    
    createObstacles() {
        this.obstacles = [];
        const numLanes = Math.ceil(this.canvas.height / this.gridSize);
        const gridWidth = Math.floor(this.canvas.width / this.gridSize);
        
        for (let y = 0; y < numLanes; y++) {
            const laneType = this.lanes[y % this.lanes.length];
            
            // Generate obstacles based on lane type
            switch (laneType) {
                case 'road':
                    // Add cars or trucks
                    const numVehicles = Math.floor(Math.random() * 3) + 1;
                    const vehicleDir = Math.random() < 0.5 ? 1 : -1;
                    
                    for (let i = 0; i < numVehicles; i++) {
                        const isHardMode = this.difficulty > 0.7;
                        const isTruck = Math.random() < 0.3;
                        const obstacleWidth = isTruck ? 2 : 1;
                        
                        const vehicleSpacing = gridWidth / numVehicles;
                        let obstacleX = i * vehicleSpacing;
                        
                        // Add some randomness to position
                        obstacleX += Math.random() * vehicleSpacing / 2;
                        
                        this.obstacles.push({
                            x: obstacleX,
                            y: y,
                            width: obstacleWidth,
                            height: 1,
                            type: isTruck ? 'truck' : 'car',
                            direction: vehicleDir,
                            speed: 0.1 + Math.random() * 0.1 * (isHardMode ? 2 : 1)
                        });
                    }
                    break;
                    
                case 'water':
                    // Add logs to float on
                    const numLogs = Math.floor(Math.random() * 2) + 1;
                    const logDir = Math.random() < 0.5 ? 1 : -1;
                    
                    for (let i = 0; i < numLogs; i++) {
                        const logWidth = Math.floor(Math.random() * 2) + 2;
                        const logSpacing = gridWidth / numLogs;
                        let logX = i * logSpacing;
                        
                        // Add some randomness to position
                        logX += Math.random() * logSpacing / 3;
                        
                        this.obstacles.push({
                            x: logX,
                            y: y,
                            width: logWidth,
                            height: 1,
                            type: 'log',
                            direction: logDir,
                            speed: 0.05 + Math.random() * 0.05
                        });
                    }
                    break;
                    
                case 'grass':
                    // Maybe add rocks or nothing
                    if (Math.random() < 0.3) {
                        const rockX = Math.floor(Math.random() * gridWidth);
                        
                        this.obstacles.push({
                            x: rockX,
                            y: y,
                            width: 1,
                            height: 1,
                            type: 'rock',
                            direction: 0,
                            speed: 0
                        });
                    }
                    break;
            }
        }
    }
    
    moveObstacles() {
        const gridWidth = Math.floor(this.canvas.width / this.gridSize);
        
        for (const obstacle of this.obstacles) {
            if (obstacle.direction !== 0) {
                obstacle.x += obstacle.direction * obstacle.speed;
                
                // Wrap around when off-screen
                if (obstacle.x > gridWidth) {
                    obstacle.x = -obstacle.width;
                } else if (obstacle.x + obstacle.width < 0) {
                    obstacle.x = gridWidth;
                }
            }
        }
        
        // Check if player is on a moving log in water
        if (this.isPlayerOnWater()) {
            const log = this.getLogUnderPlayer();
            if (log) {
                this.player.x += log.direction * log.speed;
                
                // Check if player fell off log
                if (this.player.x < 0 || this.player.x >= gridWidth) {
                    this.endGame();
                }
            } else {
                // Player is in water without log - game over
                this.endGame();
            }
        }
    }
    
    isPlayerOnWater() {
        const laneIndex = this.player.y % this.lanes.length;
        return this.lanes[laneIndex] === 'water';
    }
    
    getLogUnderPlayer() {
        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'log' && 
                obstacle.y === this.player.y &&
                this.player.x >= obstacle.x && 
                this.player.x < obstacle.x + obstacle.width) {
                return obstacle;
            }
        }
        return null;
    }
    
    checkCollisions() {
        // Check collisions with obstacles
        for (const obstacle of this.obstacles) {
            // Skip logs (they help rather than hurt)
            if (obstacle.type === 'log') continue;
            
            // Check for collision
            if (this.player.y === obstacle.y &&
                this.player.x >= obstacle.x &&
                this.player.x < obstacle.x + obstacle.width) {
                return true;
            }
        }
        
        // Check if in water without a log
        if (this.isPlayerOnWater() && !this.getLogUnderPlayer()) {
            return true;
        }
        
        return false;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw lanes
        const laneHeight = this.gridSize;
        for (let y = 0; y < this.lanes.length; y++) {
            const laneType = this.lanes[y];
            switch (laneType) {
                case 'road':
                    this.ctx.fillStyle = '#454545';
                    break;
                case 'grass':
                    this.ctx.fillStyle = '#2a5e21';
                    break;
                case 'water':
                    this.ctx.fillStyle = '#1e3f66';
                    break;
            }
            this.ctx.fillRect(0, y * laneHeight, this.canvas.width, laneHeight);
            
            // Draw lane markers on roads
            if (laneType === 'road') {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.setLineDash([this.gridSize / 2, this.gridSize / 2]);
                this.ctx.beginPath();
                this.ctx.moveTo(0, y * laneHeight + laneHeight / 2);
                this.ctx.lineTo(this.canvas.width, y * laneHeight + laneHeight / 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
        
        // Draw obstacles
        for (const obstacle of this.obstacles) {
            switch (obstacle.type) {
                case 'car':
                    this.drawCar(obstacle);
                    break;
                case 'truck':
                    this.drawTruck(obstacle);
                    break;
                case 'log':
                    this.drawLog(obstacle);
                    break;
                case 'rock':
                    this.drawRock(obstacle);
                    break;
            }
        }
        
        // Draw player
        this.drawPlayer();
        
        // Draw game over if applicable
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    
    drawPlayer() {
        const x = this.player.x * this.gridSize;
        const y = this.player.y * this.gridSize;
        
        // Draw player shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + this.gridSize / 2 + 2,
            y + this.gridSize * 0.9 + 2,
            this.gridSize / 3,
            this.gridSize / 6,
            0,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw player body
        this.ctx.fillStyle = '#bb86fc';
        this.ctx.beginPath();
        this.ctx.roundRect(
            x + this.gridSize * 0.2,
            y + this.gridSize * 0.2,
            this.gridSize * 0.6,
            this.gridSize * 0.6,
            5
        );
        this.ctx.fill();
        
        // Draw player eyes
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize * 0.35,
            y + this.gridSize * 0.4,
            this.gridSize * 0.1,
            0,
            Math.PI * 2
        );
        this.ctx.arc(
            x + this.gridSize * 0.65,
            y + this.gridSize * 0.4,
            this.gridSize * 0.1,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    drawCar(obstacle) {
        const x = obstacle.x * this.gridSize;
        const y = obstacle.y * this.gridSize;
        
        // Draw car body
        this.ctx.fillStyle = '#cf6679';
        this.ctx.beginPath();
        this.ctx.roundRect(
            x + this.gridSize * 0.1,
            y + this.gridSize * 0.2,
            this.gridSize * 0.8,
            this.gridSize * 0.6,
            8
        );
        this.ctx.fill();
        
        // Draw windows
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(
            x + this.gridSize * 0.25,
            y + this.gridSize * 0.3,
            this.gridSize * 0.2,
            this.gridSize * 0.2
        );
        this.ctx.fillRect(
            x + this.gridSize * 0.55,
            y + this.gridSize * 0.3,
            this.gridSize * 0.2,
            this.gridSize * 0.2
        );
    }
    
    drawTruck(obstacle) {
        const x = obstacle.x * this.gridSize;
        const y = obstacle.y * this.gridSize;
        
        // Draw truck body
        this.ctx.fillStyle = '#03dac6';
        this.ctx.beginPath();
        this.ctx.roundRect(
            x + this.gridSize * 0.1,
            y + this.gridSize * 0.2,
            this.gridSize * 1.8,
            this.gridSize * 0.6,
            8
        );
        this.ctx.fill();
        
        // Draw cabin
        this.ctx.fillStyle = '#018786';
        this.ctx.beginPath();
        this.ctx.roundRect(
            x + this.gridSize * 0.1,
            y + this.gridSize * 0.2,
            this.gridSize * 0.5,
            this.gridSize * 0.6,
            8
        );
        this.ctx.fill();
        
        // Draw window
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(
            x + this.gridSize * 0.2,
            y + this.gridSize * 0.3,
            this.gridSize * 0.3,
            this.gridSize * 0.2
        );
    }
    
    drawLog(obstacle) {
        const x = obstacle.x * this.gridSize;
        const y = obstacle.y * this.gridSize;
        
        // Draw log
        this.ctx.fillStyle = '#8b4513';
        this.ctx.beginPath();
        this.ctx.roundRect(
            x + this.gridSize * 0.1,
            y + this.gridSize * 0.2,
            this.gridSize * obstacle.width * 0.8,
            this.gridSize * 0.6,
            8
        );
        this.ctx.fill();
        
        // Draw wood grain
        this.ctx.strokeStyle = '#6b3410';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < obstacle.width; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.gridSize * (0.2 + i * 0.8), y + this.gridSize * 0.3);
            this.ctx.lineTo(x + this.gridSize * (0.2 + i * 0.8), y + this.gridSize * 0.7);
            this.ctx.stroke();
        }
    }
    
    drawRock(obstacle) {
        const x = obstacle.x * this.gridSize;
        const y = obstacle.y * this.gridSize;
        
        // Draw rock shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + this.gridSize / 2 + 2,
            y + this.gridSize * 0.9 + 2,
            this.gridSize / 2,
            this.gridSize / 4,
            0,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw rock
        this.ctx.fillStyle = '#808080';
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.gridSize * 0.3, y + this.gridSize * 0.7);
        this.ctx.lineTo(x + this.gridSize * 0.7, y + this.gridSize * 0.7);
        this.ctx.lineTo(x + this.gridSize * 0.8, y + this.gridSize * 0.4);
        this.ctx.lineTo(x + this.gridSize * 0.6, y + this.gridSize * 0.2);
        this.ctx.lineTo(x + this.gridSize * 0.4, y + this.gridSize * 0.3);
        this.ctx.lineTo(x + this.gridSize * 0.2, y + this.gridSize * 0.5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw highlights
        this.ctx.strokeStyle = '#a0a0a0';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.gridSize * 0.4, y + this.gridSize * 0.3);
        this.ctx.lineTo(x + this.gridSize * 0.6, y + this.gridSize * 0.4);
        this.ctx.stroke();
    }
}

// Chess Game Implementation
class ChessGame extends Game {
    constructor(app) {
        super(app);
        
        // Game properties
        this.boardSize = 8;
        this.squareSize = 60;
        this.board = [];
        this.selectedPiece = null;
        this.validMoves = [];
        this.turn = 'white';
        this.history = [];
        this.aiThinking = false;
        this.aiMoveDelay = 1000;
        this.gameOver = false;
    }
    
    initializeBoard() {
        // Initialize empty board
        this.board = new Array(this.boardSize);
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = new Array(this.boardSize).fill(null);
        }
        
        // Set up pawns
        for (let col = 0; col < this.boardSize; col++) {
            this.board[1][col] = { type: 'pawn', color: 'black' };
            this.board[6][col] = { type: 'pawn', color: 'white' };
        }
        
        // Set up other pieces
        const setupRow = [
            'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
        ];
        
        for (let col = 0; col < this.boardSize; col++) {
            this.board[0][col] = { type: setupRow[col], color: 'black' };
            this.board[7][col] = { type: setupRow[col], color: 'white' };
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw chessboard
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // Determine square color
                const isLightSquare = (row + col) % 2 === 0;
                this.ctx.fillStyle = isLightSquare ? '#f0d9b5' : '#b58863';
                
                // Draw square
                this.ctx.fillRect(
                    col * this.squareSize,
                    row * this.squareSize,
                    this.squareSize,
                    this.squareSize
                );
                
                // Highlight selected piece
                if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
                    this.ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
                    this.ctx.fillRect(
                        col * this.squareSize,
                        row * this.squareSize,
                        this.squareSize,
                        this.squareSize
                    );
                }
                
                // Highlight valid moves
                if (this.validMoves.some(move => move.row === row && move.col === col)) {
                    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                    this.ctx.fillRect(
                        col * this.squareSize,
                        row * this.squareSize,
                        this.squareSize,
                        this.squareSize
                    );
                }
                
                // Draw piece if present
                const piece = this.board[row][col];
                if (piece) {
                    this.drawPiece(piece.type, piece.color, row, col);
                }
            }
        }
        
        // Draw coordinates
        this.drawBoardCoordinates();
        
        // Draw turn indicator
        this.drawTurnIndicator();
        
        // Draw game over if applicable
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    
    drawPiece(type, color, row, col) {
        const symbols = {
            'king': { 'white': '♔', 'black': '♚' },
            'queen': { 'white': '♕', 'black': '♛' },
            'rook': { 'white': '♖', 'black': '♜' },
            'bishop': { 'white': '♗', 'black': '♝' },
            'knight': { 'white': '♘', 'black': '♞' },
            'pawn': { 'white': '♙', 'black': '♟' }
        };
        
        const symbol = symbols[type][color];
        this.ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        this.ctx.font = `bold ${Math.floor(this.squareSize * 0.7)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw piece shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillText(
            symbol,
            col * this.squareSize + this.squareSize / 2 + 1,
            row * this.squareSize + this.squareSize / 2 + 1
        );
        
        // Draw piece
        this.ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        this.ctx.fillText(
            symbol,
            col * this.squareSize + this.squareSize / 2,
            row * this.squareSize + this.squareSize / 2
        );
    }
    
    drawBoardCoordinates() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'center';
        
        // Draw column letters (a-h)
        for (let col = 0; col < this.boardSize; col++) {
            this.ctx.fillText(
                String.fromCharCode(97 + col), // 'a' is 97 in ASCII
                col * this.squareSize + this.squareSize / 2,
                this.boardSize * this.squareSize + 20
            );
        }
        
        // Draw row numbers (1-8)
        this.ctx.textAlign = 'right';
        for (let row = 0; row < this.boardSize; row++) {
            this.ctx.fillText(
                (this.boardSize - row).toString(),
                -10,
                row * this.squareSize + this.squareSize / 2
            );
        }
    }
    
    drawTurnIndicator() {
        const turnText = this.turn === 'white' ? 'Your Turn' : 'AI Thinking...';
        
        this.ctx.fillStyle = this.turn === 'white' ? '#ffffff' : '#000000';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        // Draw indicator circle
        this.ctx.beginPath();
        this.ctx.arc(
            this.boardSize * this.squareSize + 60,
            50,
            20,
            0,
            Math.PI * 2
        );
        
        if (this.turn === 'white') {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
        
        // Draw text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            turnText,
            this.boardSize * this.squareSize + 60,
            80
        );
    }
    
    drawGameOver() {
        // Display game over message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '36px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'Game Over',
            this.canvas.width / 2,
            this.canvas.height / 2 - 20
        );
        
        this.ctx.font = '24px sans-serif';
        this.ctx.fillText(
            'Say "Restart" to play again',
            this.canvas.width / 2,
            this.canvas.height / 2 + 20
        );
    }
    
    processVoiceCommand(command) {
        if (!this.isRunning || this.gameOver) return;
        
        command = command.toLowerCase().trim();
        
        // Parse algebraic notation
        if (command.includes('select')) {
            const match = command.match(/select\\s+([a-h])(\\d)/i);
            if (match) {
                const col = match[1].charCodeAt(0) - 97; // 'a' is 97 in ASCII
                const row = 8 - parseInt(match[2]);
                
                if (this.isValidPosition(row, col)) {
                    this.selectSquare(row, col);
                    return true;
                }
            }
        } else if (command.includes('move to')) {
            const match = command.match(/move to\\s+([a-h])(\\d)/i);
            if (match) {
                const col = match[1].charCodeAt(0) - 97;
                const row = 8 - parseInt(match[2]);
                
                if (this.selectedPiece && this.isValidPosition(row, col)) {
                    this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                    return true;
                }
            }
        } else if (command === 'castle kingside') {
            return this.tryCastle('kingside');
        } else if (command === 'castle queenside') {
            return this.tryCastle('queenside');
        } else if (command === 'undo') {
            this.undoMove();
            return true;
        }
        
        return false;
    }
    
    selectSquare(row, col) {
        const piece = this.board[row][col];
        
        // If selecting a piece of the current player's color
        if (piece && piece.color === this.turn) {
            this.selectedPiece = { row, col };
            this.validMoves = this.getValidMoves(row, col);
        }
        // If selecting a destination for the selected piece
        else if (this.selectedPiece) {
            if (this.validMoves.some(move => move.row === row && move.col === col)) {
                this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.selectedPiece = null;
                this.validMoves = [];
            } else {
                this.selectedPiece = null;
                this.validMoves = [];
            }
        }
    }
    
    movePiece(fromRow, fromCol, toRow, toCol) {
        // Store move in history
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        this.history.push({
            piece: { ...piece },
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            captured: capturedPiece ? { ...capturedPiece } : null
        });
        
        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Switch turns
        this.turn = this.turn === 'white' ? 'black' : 'white';
        
        // If it's black's turn, schedule AI move
        if (this.turn === 'black' && !this.gameOver) {
            this.aiThinking = true;
            setTimeout(() => {
                this.makeAIMove();
                this.aiThinking = false;
            }, this.aiMoveDelay);
        }
    }
    
    start() {
        super.start();
        this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.turn = 'white';
        this.history = [];
        this.gameOver = false;
        this.score = 0;
        this.updateUi();
    }
    
    tryCastle(side) {
        // Simplified castle implementation (not checking for all chess rules)
        const row = 7; // White's back rank
        const kingCol = 4;
        
        // Check if king is in the right position
        const king = this.board[row][kingCol];
        if (!king || king.type !== 'king' || king.color !== 'white') {
            return false;
        }
        
        if (side === 'kingside') {
            const rookCol = 7;
            const rook = this.board[row][rookCol];
            
            // Check if rook is in position
            if (!rook || rook.type !== 'rook' || rook.color !== 'white') {
                return false;
            }
            
            // Check if path is clear
            for (let col = kingCol + 1; col < rookCol; col++) {
                if (this.board[row][col]) {
                    return false;
                }
            }
            
            // Move king and rook
            this.board[row][kingCol + 2] = king;
            this.board[row][kingCol + 1] = rook;
            this.board[row][kingCol] = null;
            this.board[row][rookCol] = null;
            
            // Switch turn
            this.turn = 'black';
            return true;
            
        } else if (side === 'queenside') {
            const rookCol = 0;
            const rook = this.board[row][rookCol];
            
            // Check if rook is in position
            if (!rook || rook.type !== 'rook' || rook.color !== 'white') {
                return false;
            }
            
            // Check if path is clear
            for (let col = rookCol + 1; col < kingCol; col++) {
                if (this.board[row][col]) {
                    return false;
                }
            }
            
            // Move king and rook
            this.board[row][kingCol - 2] = king;
            this.board[row][kingCol - 1] = rook;
            this.board[row][kingCol] = null;
            this.board[row][rookCol] = null;
            
            // Switch turn
            this.turn = 'black';
            return true;
        }
        
        return false;
    }
    
    undoMove() {
        if (this.history.length === 0) return;
        
        // Get the last move
        const lastMove = this.history.pop();
        
        // Restore the piece to its original position
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        
        // Restore captured piece if any
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
        
        // Switch turn back
        this.turn = this.turn === 'white' ? 'black' : 'white';
        
        // Update score if a piece was uncaptured
        if (lastMove.captured && lastMove.captured.color === 'black') {
            const pieceValues = {
                pawn: 1,
                knight: 3,
                bishop: 3,
                rook: 5,
                queen: 9,
                king: 0
            };
            
            const value = pieceValues[lastMove.captured.type] || 1;
            this.score -= value * 10;
            this.updateUi();
        }
    }
    
    makeAIMove() {
        if (!this.isRunning || this.isPaused || this.turn !== 'black') return;
        
        // Simple AI - find all possible moves and choose one randomly
        const allMoves = [];
        
        // Find all black pieces and their valid moves
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === 'black') {
                    const moves = this.getValidMoves(row, col);
                    moves.forEach(move => {
                        allMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            score: this.evaluateMove(row, col, move.row, move.col)
                        });
                    });
                }
            }
        }
        
        // If no moves available, game over
        if (allMoves.length === 0) {
            this.endGame('white');
            return;
        }
        
        // Sort moves by score (descending)
        allMoves.sort((a, b) => b.score - a.score);
        
        // Choose a move (prefer good moves but add some randomness)
        const topMoves = allMoves.slice(0, Math.min(5, allMoves.length));
        const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
        
        // Execute the move
        this.movePiece(selectedMove.fromRow, selectedMove.fromCol, selectedMove.toRow, selectedMove.toCol);
        
        // Switch turn back to player
        this.turn = 'white';
    }
    
    evaluateMove(fromRow, fromCol, toRow, toCol) {
        let score = 0;
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        
        // Prefer capturing pieces
        if (targetPiece) {
            const pieceValues = {
                pawn: 10,
                knight: 30,
                bishop: 30,
                rook: 50,
                queen: 90,
                king: 900
            };
            
            score += pieceValues[targetPiece.type] || 10;
        }
        
        // Prefer center control for knights and bishops
        if (piece.type === 'knight' || piece.type === 'bishop') {
            const centerProximity = 
                (Math.abs(3.5 - toRow) + Math.abs(3.5 - toCol)) / 7;
            score += 5 * (1 - centerProximity);
        }
        
        // Pawns prefer moving forward
        if (piece.type === 'pawn') {
            score += (fromRow - toRow); // Black pawns move down the board
        }
        
        // Add some randomness
        score += Math.random() * 3;
        
        return score;
    }
    
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        
        switch (piece.type) {
            case 'pawn':
                this.getPawnMoves(row, col, piece.color, moves);
                break;
            case 'rook':
                this.getRookMoves(row, col, piece.color, moves);
                break;
            case 'knight':
                this.getKnightMoves(row, col, piece.color, moves);
                break;
            case 'bishop':
                this.getBishopMoves(row, col, piece.color, moves);
                break;
            case 'queen':
                this.getQueenMoves(row, col, piece.color, moves);
                break;
            case 'king':
                this.getKingMoves(row, col, piece.color, moves);
                break;
        }
        
        return moves;
    }
    
    getPawnMoves(row, col, color, moves) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Move forward one square
        if (row + direction >= 0 && row + direction < this.boardSize && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col: col });
            
            // Move forward two squares from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col: col });
            }
        }
        
        // Capture diagonally
        const captureOffsets = [{ row: direction, col: -1 }, { row: direction, col: 1 }];
        captureOffsets.forEach(offset => {
            const newRow = row + offset.row;
            const newCol = col + offset.col;
            
            if (this.isValidPosition(newRow, newCol) && 
                this.board[newRow][newCol] && 
                this.board[newRow][newCol].color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
        });
    }
    
    getRookMoves(row, col, color, moves) {
        const directions = [
            { row: -1, col: 0 }, // Up
            { row: 1, col: 0 },  // Down
            { row: 0, col: -1 }, // Left
            { row: 0, col: 1 }   // Right
        ];
        
        this.getLinearMoves(row, col, color, moves, directions);
    }
    
    getBishopMoves(row, col, color, moves) {
        const directions = [
            { row: -1, col: -1 }, // Up-left
            { row: -1, col: 1 },  // Up-right
            { row: 1, col: -1 },  // Down-left
            { row: 1, col: 1 }    // Down-right
        ];
        
        this.getLinearMoves(row, col, color, moves, directions);
    }
    
    getQueenMoves(row, col, color, moves) {
        // Queen = Rook + Bishop
        this.getRookMoves(row, col, color, moves);
        this.getBishopMoves(row, col, color, moves);
    }
    
    getKnightMoves(row, col, color, moves) {
        const offsets = [
            { row: -2, col: -1 },
            { row: -2, col: 1 },
            { row: -1, col: -2 },
            { row: -1, col: 2 },
            { row: 1, col: -2 },
            { row: 1, col: 2 },
            { row: 2, col: -1 },
            { row: 2, col: 1 }
        ];
        
        offsets.forEach(offset => {
            const newRow = row + offset.row;
            const newCol = col + offset.col;
            
            if (this.isValidPosition(newRow, newCol) && 
                (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== color)) {
                moves.push({ row: newRow, col: newCol });
            }
        });
    }
    
    getKingMoves(row, col, color, moves) {
        const offsets = [
            { row: -1, col: -1 },
            { row: -1, col: 0 },
            { row: -1, col: 1 },
            { row: 0, col: -1 },
            { row: 0, col: 1 },
            { row: 1, col: -1 },
            { row: 1, col: 0 },
            { row: 1, col: 1 }
        ];
        
        offsets.forEach(offset => {
            const newRow = row + offset.row;
            const newCol = col + offset.col;
            
            if (this.isValidPosition(newRow, newCol) && 
                (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== color)) {
                moves.push({ row: newRow, col: newCol });
            }
        });
        
        // Castle not implemented in this version for simplicity
    }
    
    getLinearMoves(row, col, color, moves, directions) {
        directions.forEach(dir => {
            let curRow = row + dir.row;
            let curCol = col + dir.col;
            
            while (this.isValidPosition(curRow, curCol)) {
                const targetPiece = this.board[curRow][curCol];
                
                if (!targetPiece) {
                    // Empty square - valid move
                    moves.push({ row: curRow, col: curCol });
                } else {
                    // Occupied square
                    if (targetPiece.color !== color) {
                        // Opponent's piece - can capture
                        moves.push({ row: curRow, col: curCol });
                    }
                    // Cannot move further in this direction
                    break;
                }
                
                curRow += dir.row;
                curCol += dir.col;
            }
        });
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }
    
    endGame(winner) {
        this.isRunning = false;
        
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        
        // Display winner
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '36px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            winner === 'white' ? 'You win!' : 'AI wins!',
            this.canvas.width / 2,
            this.canvas.height / 2 - 20
        );
        
        this.ctx.font = '24px sans-serif';
        this.ctx.fillText(
            'Say "Restart" to play again',
            this.canvas.width / 2,
            this.canvas.height / 2 + 20
        );
    }
    
    handleResize() {
        // Calculate new square size
        const minDimension = Math.min(this.canvas.width, this.canvas.height);
        this.squareSize = Math.floor(minDimension / this.boardSize);
    }
}

// Initialize the game app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new GameApp();
    console.log('Game app initialized');
});

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and store the app instance
    window.gameApp = new GameApp();
    
    // Add keyboard controls
    document.addEventListener('keydown', (event) => {
        if (!window.gameApp || !window.gameApp.currentGame) return;
        
        switch (event.key) {
            case 'ArrowUp':
                if (window.gameApp.currentGame instanceof SnakeGame) {
                    if (window.gameApp.currentGame.direction !== 'down') window.gameApp.currentGame.nextDirection = 'up';
                } else if (window.gameApp.currentGame instanceof CrossyRoadsGame) {
                    window.gameApp.currentGame.movePlayer('up');
                }
                break;
            case 'ArrowDown':
                if (window.gameApp.currentGame instanceof SnakeGame) {
                    if (window.gameApp.currentGame.direction !== 'up') window.gameApp.currentGame.nextDirection = 'down';
                } else if (window.gameApp.currentGame instanceof CrossyRoadsGame) {
                    window.gameApp.currentGame.movePlayer('down');
                }
                break;
            case 'ArrowLeft':
                if (window.gameApp.currentGame instanceof SnakeGame) {
                    if (window.gameApp.currentGame.direction !== 'right') window.gameApp.currentGame.nextDirection = 'left';
                } else if (window.gameApp.currentGame instanceof CrossyRoadsGame) {
                    window.gameApp.currentGame.movePlayer('left');
                }
                break;
            case 'ArrowRight':
                if (window.gameApp.currentGame instanceof SnakeGame) {
                    if (window.gameApp.currentGame.direction !== 'left') window.gameApp.currentGame.nextDirection = 'right';
                } else if (window.gameApp.currentGame instanceof CrossyRoadsGame) {
                    window.gameApp.currentGame.movePlayer('right');
                }
                break;
            case ' ':
                if (window.gameApp.currentGame.isPaused) {
                    window.gameApp.currentGame.resume();
                } else {
                    window.gameApp.currentGame.pause();
                }
                break;
        }
    });

    // Add click handler for chess game
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        canvas.addEventListener('click', (event) => {
            if (!window.gameApp || !(window.gameApp.currentGame instanceof ChessGame)) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const col = Math.floor(x / window.gameApp.currentGame.squareSize);
            const row = Math.floor(y / window.gameApp.currentGame.squareSize);
            
            if (window.gameApp.currentGame.isValidPosition(row, col)) {
                window.gameApp.currentGame.selectSquare(row, col);
            }
        });
    }
=======
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
>>>>>>> 837635e9c24ae639705547f69f82ee61601a1bbf
});
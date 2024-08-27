// DOM Elements
const score = document.getElementById("score");
const highestScoreElem = document.getElementById("highest-score");
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Constants
const BOARD_HEIGHT = 500;
const BOARD_WIDTH = 500;
const BLOCK = 25;
const GAME_SPEED = 100;

// snake and food
let snakeArray = [];
let snakeDirX;
let snakeDirY;
let foodX;
let foodY;

// game states
let directionChanged = false;
let collided = false;
let gameRunning = false;
let timeoutId; // to keep track of the timeout

// player states
let totalScore = 0;
let highestScore = localStorage.getItem("highest-score") || 0;

// Initialize game
function initializeGame() {
  snakeArray = [
    { x: 75, y: 0 },
    { x: 50, y: 0 },
    { x: 25, y: 0 },
    { x: 0, y: 0 },
  ];
  snakeDirX = 1;
  snakeDirY = 0;
  collided = false;
  gameRunning = true;
  totalScore = 0;
  score.textContent = totalScore;
  highestScore = localStorage.getItem("highest-score") || 0;
  highestScoreElem.textContent = highestScore;
  generateFoodCoordinates();
  drawSnake();
  drawFood();
  if (timeoutId) {
    clearTimeout(timeoutId); // Clear any existing timeout from previous game session
  }
  main();
}

//Game Loop
function main() {
  if (!collided) {
    if (gameRunning) {
      eraseBoard();
      drawSnake();
      drawFood();
      directionChanged = false; // Reset the flag after moving the snake
      moveSnake();
      checkCollision();
      timeoutId = setTimeout(main, GAME_SPEED); // Set new timeout
    } else {
      showPauseMessage();
    }
  } else {
    showGameOverMessage();
  }
}

function drawSnake() {
  snakeArray.forEach((part, i) => {
    drawRect(part.x, part.y, i === 0 ? "blue" : "lightblue");
  });
}

function eraseBoard() {
  ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
}

function generateFoodCoordinates() {
  const availableSpaces = [];
  for (let x = 0; x < BOARD_WIDTH; x += BLOCK) {
    for (let y = 0; y < BOARD_HEIGHT; y += BLOCK) {
      // if the coordinate (x, y) is not occupied by any snake segment , add it to available space Array
      if (!snakeArray.some((part) => part.x === x && part.y === y)) {
        availableSpaces.push({ x, y });
      }
    }
  }
  if (availableSpaces.length > 0) {
    const foodLocation =
      availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
    foodX = foodLocation.x;
    foodY = foodLocation.y;
  } else {
    gameRunning = false; // Game over - snake has filled the board
    collided = true;
  }
}

function drawFood() {
  drawRect(foodX, foodY, "red");
}

function checkCollision() {
  // Check if snake eats food
  if (snakeArray[0].x === foodX && snakeArray[0].y === foodY) {
    // Duplicate the last segment to grow the snake
    const lastSegment = { ...snakeArray[snakeArray.length - 1] };
    snakeArray.push(lastSegment);

    // Update score
    totalScore += 1;
    score.textContent = totalScore;
    // Generate new food coordinates
    generateFoodCoordinates();
  }

  // Check if snake collides with the wall
  const head = snakeArray[0];
  if (
    head.x >= BOARD_WIDTH ||
    head.x < 0 ||
    head.y >= BOARD_HEIGHT ||
    head.y < 0
  ) {
    gameRunning = false;
    collided = true;
    showGameOverMessage(); // Optionally, display a game-over message
    return; // Exit early to prevent further checks
  }

  // Check if snake collides with its own tail
  for (let i = 1; i < snakeArray.length; i++) {
    if (head.x === snakeArray[i].x && head.y === snakeArray[i].y) {
      gameRunning = false;
      collided = true;
      showGameOverMessage(); // Optionally, display a game-over message
      return; // Exit early after collision detection
    }
  }
}

function changeSnakeDirection(event) {
  if (directionChanged) return; // Prevent multiple direction changes within the same iteration of main loop

  const keyPressed = event.key;

  let goingLeft = snakeDirX < 0;
  let goingRight = snakeDirX > 0;
  let goingUp = snakeDirY < 0;
  let goingDown = snakeDirY > 0;

  if (keyPressed === "ArrowRight" && !goingLeft && gameRunning) {
    snakeDirX = 1;
    snakeDirY = 0;
    directionChanged = true;
  } else if (keyPressed === "ArrowLeft" && !goingRight && gameRunning) {
    snakeDirX = -1;
    snakeDirY = 0;
    directionChanged = true;
  } else if (keyPressed === "ArrowUp" && !goingDown && gameRunning) {
    snakeDirY = -1;
    snakeDirX = 0;
    directionChanged = true;
  } else if (keyPressed === "ArrowDown" && !goingUp && gameRunning) {
    snakeDirY = 1;
    snakeDirX = 0;
    directionChanged = true;
  } else if (keyPressed === " ") {
    if (!collided) {
      gameRunning = !gameRunning;
      if (gameRunning) {
        main(); // Restart the game loop
      } else {
        showPauseMessage();
      }
    }
  } else if (keyPressed === "r") {
    initializeGame(); // Corrected typo
  }
}

function moveSnake() {
  const oldSnakeArray = snakeArray.map((part) => ({ ...part }));
  snakeArray.forEach((part, i) => {
    if (i === 0) {
      part.x += BLOCK * snakeDirX;
      part.y += BLOCK * snakeDirY;
    } else {
      part.x = oldSnakeArray[i - 1].x;
      part.y = oldSnakeArray[i - 1].y;
    }
  });
}

function showGameOverMessage() {
  // Update the highest score if the new score is greater
  if (totalScore > highestScore) {
    highestScore = totalScore;
    highestScoreElem.textContent = highestScore;
    localStorage.setItem("highest-score", highestScore);
  }

  // Display the game over message with the appropriate text
  showMessage("Game Over!", `Score: ${totalScore}`, "Press 'R' to Restart");
}

function showPauseMessage() {
  showMessage("Game Paused", "Press Space to Resume");
}

function showMessage(mainText, subText, extraText = "") {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText(mainText, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 - 30);
  ctx.fillText(subText, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 10);
  if (extraText) {
    ctx.fillText(extraText, BOARD_WIDTH / 2, BOARD_HEIGHT / 2 + 50);
  }
}
function drawRect(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, BLOCK, BLOCK);
  ctx.strokeStyle = "black" ;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, BLOCK, BLOCK);
}

document.addEventListener("keydown", changeSnakeDirection);
initializeGame();

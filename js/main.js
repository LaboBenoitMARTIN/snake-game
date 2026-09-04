const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const restartBtn = document.getElementById('restart');

const CELL_SIZE = 20;
const GRID_SIZE = canvas.width / CELL_SIZE;
const INITIAL_SPEED_MS = 130;
const BEST_SCORE_KEY = 'snake-best-score';

let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore;
let speed;
let gameLoopId;

function loadBestScore() {
  return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
}

function saveBestScore(value) {
  localStorage.setItem(BEST_SCORE_KEY, String(value));
}

function randomCell() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
}

function spawnFood() {
  let cell;
  do {
    cell = randomCell();
  } while (snake.some((segment) => segment.x === cell.x && segment.y === cell.y));
  return cell;
}

function updateScoreDisplay() {
  scoreEl.textContent = String(score);
  bestScoreEl.textContent = String(bestScore);
}

function resetGame() {
  snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  speed = INITIAL_SPEED_MS;
  bestScore = loadBestScore();
  food = spawnFood();
  updateScoreDisplay();
  restartBtn.hidden = true;

  clearInterval(gameLoopId);
  gameLoopId = setInterval(tick, speed);
  draw();
}

function restartLoop() {
  clearInterval(gameLoopId);
  gameLoopId = setInterval(tick, speed);
}

function speedUp() {
  if (speed <= 60) return;
  speed -= 3;
  restartLoop();
}

function tick() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitsWall = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
  const hitsSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitsWall || hitsSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score > bestScore) {
      bestScore = score;
      saveBestScore(bestScore);
    }
    food = spawnFood();
    updateScoreDisplay();
    speedUp();
  } else {
    snake.pop();
  }

  draw();
}

function endGame() {
  clearInterval(gameLoopId);
  restartBtn.hidden = false;
  ctx.fillStyle = 'rgba(10, 10, 10, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e0e0e0';
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Perdu !', canvas.width / 2, canvas.height / 2);
}

function draw() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ea5e63';
  ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#2563eb' : '#5b8def';
    ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  });
}

const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  z: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  q: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

window.addEventListener('keydown', (event) => {
  const requested = KEY_DIRECTIONS[event.key];
  if (!requested) return;
  const isOpposite = requested.x === -direction.x && requested.y === -direction.y;
  if (!isOpposite) nextDirection = requested;
});

restartBtn.addEventListener('click', resetGame);

resetGame();

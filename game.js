const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverEl = document.getElementById('gameOver');
const scoreEl = document.getElementById('score');
const recordEl = document.getElementById('record');
const shieldUI = document.getElementById('shieldUI');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

canvas.width = 360;
canvas.height = 640;

let gameState = 'start';
let highscore = parseInt(localStorage.getItem('highscore') || '0');
recordEl.textContent = 'Record: ' + highscore;

let player = {
  x: 160,
  y: 500,
  width: 30,
  height: 30,
  dy: 0,
  gravity: 0.2,
  jump: -6,
  color: '#00796b'
};

let platforms = [];
let score = 0;
let keys = { left: false, right: false };
let platformGap = 60;
let hasShield = false;

function difficulty() {
  return Math.min(score / 5000, 1);
}

function createPlatform(y) {
  const diff = difficulty();
  const r = Math.random();
  let type = 'normal';
  if (r < diff * 0.1) type = 'deadly';
  else if (r < 0.1 + diff * 0.2) type = 'break';
  else if (r < 0.3 + diff * 0.2) type = 'moving';

  let boost = null;
  if (Math.random() < 0.05) {
    const br = Math.random();
    if (br < 0.34) boost = 'spring';
    else if (br < 0.67) boost = 'rocket';
    else boost = 'shield';
  }

  return {
    x: Math.random() * (canvas.width - 60),
    y,
    width: 60,
    height: 10,
    type,
    boost,
    used: false,
    dx: type === 'moving' ? (Math.random() < 0.5 ? -1 : 1) * (1 + diff) : 0
  };
}

function resetGame() {
  player.x = 160;
  player.y = 500;
  player.dy = 0;
  platforms = [];
  score = 0;
  platformGap = 60;
  hasShield = false;
  // starting platform at the bottom under the player
  platforms.push({
    x: player.x - 15,
    y: canvas.height - 50,
    width: 60,
    height: 10,
    type: 'normal',
    boost: null,
    used: false,
    dx: 0
  });
  for (let i = 1; i < 10; i++) {
    platforms.push(createPlatform(canvas.height - 50 - i * platformGap));
  }
  scoreEl.textContent = 'Score: 0';
  shieldUI.style.display = 'none';
}

function update() {
  const diff = difficulty();
  const scrollSpeed = 1 + diff;

  player.gravity = 0.2 + diff * 0.2;
  player.dy += player.gravity;
  player.y += player.dy;

  if (keys.left) player.x -= 4;
  if (keys.right) player.x += 4;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }

  if (player.y < 300) {
    let dy = (300 - player.y) * scrollSpeed;
    player.y = 300;
    platforms.forEach(p => (p.y += dy));
    score += Math.floor(dy);
    platformGap = 60 + diff * 40;
  }

  let minY = Math.min(...platforms.map(p => p.y));

  platforms.forEach((p, idx) => {
    if (
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      player.y + player.height > p.y &&
      player.y + player.height < p.y + p.height &&
      player.dy > 0
    ) {
      if (p.type === 'deadly') {
        if (hasShield) {
          hasShield = false;
          player.dy = player.jump;
        } else {
          endGame();
          return;
        }
      } else {
        let bounce = player.jump;
        if (p.boost === 'spring') bounce = player.jump * 1.5;
        if (p.boost === 'rocket') bounce = player.jump * 4;
        player.dy = bounce;
        if (p.boost === 'shield') hasShield = true;
      }
      p.boost = null;
      if (p.type === 'break') p.used = true;
    }

    if (p.type === 'moving') {
      p.x += p.dx;
      if (p.x < 0 || p.x + p.width > canvas.width) p.dx *= -1;
    }

    if (p.y > canvas.height || p.used) {
      platforms.splice(idx, 1);
      platforms.push(createPlatform(minY - platformGap));
      minY = Math.min(...platforms.map(pl => pl.y));
    }
  });

  if (player.y > canvas.height) {
    if (hasShield) {
      hasShield = false;
      player.y = canvas.height - 60;
      player.dy = player.jump;
    } else {
      endGame();
    }
  }

  scoreEl.textContent = 'Score: ' + Math.floor(score / 100);
  shieldUI.style.display = hasShield ? 'inline' : 'none';
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  if (hasShield) {
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 3;
    ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
  }

  platforms.forEach(p => {
    switch (p.type) {
      case 'break':
        ctx.fillStyle = '#8d6e63';
        break;
      case 'moving':
        ctx.fillStyle = '#00695c';
        break;
      case 'deadly':
        ctx.fillStyle = '#d32f2f';
        break;
      default:
        ctx.fillStyle = '#004d40';
    }
    ctx.fillRect(p.x, p.y, p.width, p.height);
    if (p.boost) {
      switch (p.boost) {
        case 'spring':
          ctx.fillStyle = '#ffb74d';
          ctx.fillRect(p.x + p.width / 2 - 5, p.y - 10, 10, 10);
          break;
        case 'rocket':
          ctx.fillStyle = '#ff5722';
          ctx.fillRect(p.x + p.width / 2 - 4, p.y - 15, 8, 15);
          break;
        case 'shield':
          ctx.fillStyle = '#2196f3';
          ctx.beginPath();
          ctx.arc(p.x + p.width / 2, p.y - 5, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
    }
  });

  ctx.fillStyle = '#000';
  ctx.font = '16px sans-serif';
  ctx.fillText('Score: ' + Math.floor(score / 100), 10, 20);
  ctx.fillText('Record: ' + highscore, 250, 20);
}

function loop() {
  if (gameState !== 'playing') return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function endGame() {
  gameState = 'over';
  const finalScore = Math.floor(score / 100);
  if (finalScore > highscore) {
    highscore = finalScore;
    localStorage.setItem('highscore', highscore);
  }
  recordEl.textContent = 'Record: ' + highscore;
  gameOverEl.style.display = 'block';
  restartBtn.style.display = 'block';
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.sendData) {
    Telegram.WebApp.sendData(JSON.stringify({ score: finalScore }));
    Telegram.WebApp.close();
  }
}

startBtn.addEventListener('click', () => {
  if (gameState === 'playing') return;
  startBtn.style.display = 'none';
  gameOverEl.style.display = 'none';
  restartBtn.style.display = 'none';
  resetGame();
  gameState = 'playing';
  loop();
});

restartBtn.addEventListener('click', () => {
  startBtn.dispatchEvent(new Event('click'));
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') keys.left = true;
  else if (e.key === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') keys.left = false;
  else if (e.key === 'ArrowRight') keys.right = false;
});

leftBtn.addEventListener('touchstart', () => (keys.left = true));
leftBtn.addEventListener('touchend', () => (keys.left = false));
rightBtn.addEventListener('touchstart', () => (keys.right = true));
rightBtn.addEventListener('touchend', () => (keys.right = false));

window.addEventListener('deviceorientation', event => {
  if (event.gamma) {
    if (event.gamma > 5) keys.right = true;
    else if (event.gamma < -5) keys.left = true;
    else {
      keys.left = false;
      keys.right = false;
    }
  }
});

resetGame();

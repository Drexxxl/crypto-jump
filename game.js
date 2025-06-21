const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 360;
canvas.height = 640;

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

function createPlatform(y) {
  return {
    x: Math.random() * (canvas.width - 60),
    y: y,
    width: 60,
    height: 10,
    color: '#004d40'
  };
}

for (let i = 0; i < 10; i++) {
  platforms.push(createPlatform(i * 60));
}

function update() {
  player.dy += player.gravity;
  player.y += player.dy;

  if (player.y < 300) {
    let dy = 300 - player.y;
    player.y = 300;
    platforms.forEach(p => p.y += dy);
    score += Math.floor(dy);
  }

  platforms.forEach(p => {
    if (
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      player.y + player.height > p.y &&
      player.y + player.height < p.y + p.height &&
      player.dy > 0
    ) {
      player.dy = player.jump;
    }

    if (p.y > canvas.height) {
      platforms.splice(platforms.indexOf(p), 1);
      platforms.push(createPlatform(0));
    }
  });

  if (player.y > canvas.height) {
    const finalScore = Math.floor(score / 100);
    alert('Game Over! Score: ' + finalScore);
    if (window.Telegram && Telegram.WebApp && Telegram.WebApp.sendData) {
      Telegram.WebApp.sendData(JSON.stringify({ score: finalScore }));
      Telegram.WebApp.close();
    }
    document.location.reload();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  platforms.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  ctx.fillStyle = '#000';
  ctx.font = '16px sans-serif';
  ctx.fillText('Score: ' + Math.floor(score / 100), 10, 20);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

// Управление
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') player.x -= 20;
  else if (e.key === 'ArrowRight') player.x += 20;
});

// Мобильное управление
window.addEventListener('deviceorientation', event => {
  if (event.gamma) {
    player.x += event.gamma / 5;
  }
});

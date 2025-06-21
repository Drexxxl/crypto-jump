class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;

    this.rocket = { x: this.width / 2 - 20, y: this.height - 80, vy: 0, width: 40, height: 60 };
    this.gravity = 0.4;
    this.jumpVelocity = -10;
    this.platforms = [];
    this.platformW = 60;
    this.platformH = 10;
    this.maxPlatforms = 6;

    this.score = 0;
    this.best = parseInt(localStorage.getItem('best')) || 0;
    this.difficulty = 1;
    this.gameRunning = true;

    document.getElementById('best').textContent = `Best: ${this.best}`;

    this.keys = { left: false, right: false };
    this.touchStartX = null;

    this.attachEvents();
    this.initPlatforms();
  }

  attachEvents() {
    window.addEventListener('resize', () => {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') this.keys.left = true;
      if (e.key === 'ArrowRight') this.keys.right = true;
    });
    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft') this.keys.left = false;
      if (e.key === 'ArrowRight') this.keys.right = false;
    });

    this.canvas.addEventListener('touchstart', e => {
      this.touchStartX = e.touches[0].clientX;
    });
    this.canvas.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - this.touchStartX;
      if (dx > 10) {
        this.keys.right = true;
        this.keys.left = false;
      } else if (dx < -10) {
        this.keys.left = true;
        this.keys.right = false;
      }
    });
    this.canvas.addEventListener('touchend', () => {
      this.keys.left = false;
      this.keys.right = false;
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  createPlatform(y) {
    const r = Math.random();
    let type = 'normal';
    if (r < Math.min(0.15 * this.difficulty, 0.3)) {
      type = 'breakable';
    } else if (r < Math.min(0.3 * this.difficulty, 0.6)) {
      type = 'moving';
    }
    let vx = 0;
    if (type === 'moving') {
      const dir = Math.random() < 0.5 ? 1 : -1;
      vx = dir * (1 + this.difficulty * 0.3);
    }
    return {
      x: Math.random() * (this.width - this.platformW),
      y,
      width: this.platformW,
      height: this.platformH,
      vx,
      type,
      remove: false
    };
  }

  initPlatforms() {
    const step = this.height / this.maxPlatforms;
    for (let i = 0; i < this.maxPlatforms; i++) {
      this.platforms.push(this.createPlatform(this.height - i * step));
    }
  }

  drawRocket() {
    const r = this.rocket;
    const grad = this.ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.height);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(1, '#888');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(r.x, r.y, r.width, r.height);

    this.ctx.fillStyle = '#eee';
    this.ctx.beginPath();
    this.ctx.moveTo(r.x, r.y);
    this.ctx.lineTo(r.x + r.width / 2, r.y - 20);
    this.ctx.lineTo(r.x + r.width, r.y);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#ff4136';
    this.ctx.beginPath();
    this.ctx.moveTo(r.x - 10, r.y + r.height);
    this.ctx.lineTo(r.x, r.y + r.height - 10);
    this.ctx.lineTo(r.x, r.y + r.height);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(r.x + r.width + 10, r.y + r.height);
    this.ctx.lineTo(r.x + r.width, r.y + r.height - 10);
    this.ctx.lineTo(r.x + r.width, r.y + r.height);
    this.ctx.closePath();
    this.ctx.fill();

    if (r.vy < 0) {
      this.ctx.fillStyle = 'orange';
      this.ctx.beginPath();
      this.ctx.moveTo(r.x + r.width / 2, r.y + r.height);
      this.ctx.lineTo(r.x + r.width / 2 - 10, r.y + r.height + 30);
      this.ctx.lineTo(r.x + r.width / 2 + 10, r.y + r.height + 30);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  drawPlatforms() {
    this.platforms.forEach(p => {
      const grad = this.ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
      if (p.type === 'breakable') {
        grad.addColorStop(0, '#f55');
        grad.addColorStop(1, '#a00');
      } else if (p.type === 'moving') {
        grad.addColorStop(0, '#0ff');
        grad.addColorStop(1, '#09c');
      } else {
        grad.addColorStop(0, '#0f0');
        grad.addColorStop(1, '#090');
      }
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
    });
  }

  update() {
    const r = this.rocket;
    r.y += r.vy;
    r.vy += this.gravity;
    if (this.keys.left) r.x -= 4;
    if (this.keys.right) r.x += 4;
    if (r.x < -r.width) r.x = this.width;
    if (r.x > this.width) r.x = -r.width;

    this.platforms.forEach(p => {
      if (p.vx) {
        p.x += p.vx;
        if (p.x <= 0 || p.x + p.width >= this.width) p.vx *= -1;
      }
      if (
        r.vy > 0 &&
        r.x + r.width > p.x &&
        r.x < p.x + p.width &&
        r.y + r.height > p.y &&
        r.y + r.height < p.y + p.height + r.vy
      ) {
        r.vy = this.jumpVelocity;
        if (p.type === 'breakable') {
          p.remove = true;
        }
      }
    });

    if (r.y < this.height / 2) {
      const diff = this.height / 2 - r.y;
      r.y = this.height / 2;
      this.score += Math.floor(diff);
      this.difficulty = 1 + this.score / 1000;
      document.getElementById('score').textContent = `Score: ${this.score}`;
      this.platforms.forEach(p => (p.y += diff));
      const spawnChance = Math.min(0.1 + this.difficulty * 0.05, 0.4);
      if (Math.random() < spawnChance) {
        this.platforms.push(this.createPlatform(-this.platformH));
      }
      this.platforms = this.platforms.filter(p => p.y < this.height && !p.remove);
    }

    if (r.y > this.height) {
      this.gameOver();
    }
  }

  gameOver() {
    this.gameRunning = false;
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('best', this.best);
    }
    document.getElementById('finalScore').textContent = `Score: ${this.score} | Best: ${this.best}`;
    document.getElementById('gameOverOverlay').classList.remove('hidden');
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawPlatforms();
    this.drawRocket();
    this.update();
    if (this.gameRunning) {
      requestAnimationFrame(this.loop.bind(this));
    }
  }

  start() {
    this.loop();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  new Game(canvas).start();
});

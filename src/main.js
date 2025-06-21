const DEFAULT_STATS = {
    plays: 0,
    lifetime: 0,
    ton: 0,
    xp: 0,
    level: 1,
    boosts: { turbo: 0, shield: 0 }
};

const PLATFORM_SPACING = 130;

function loadStats() {
    const raw = localStorage.getItem('sj_stats');
    return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS };
}

function saveStats(stats) {
    localStorage.setItem('sj_stats', JSON.stringify(stats));
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
        this.lastScore = null;
        this.bestScore = 0;
        this.stats = loadStats();
    }

    init(data) {
        this.lastScore = typeof data.score === 'number' ? data.score : null;
        const stored = Number(localStorage.getItem('sj_best_score')) || 0;
        this.bestScore = stored;
        if (this.lastScore !== null && this.lastScore > this.bestScore) {
            this.bestScore = this.lastScore;
            localStorage.setItem('sj_best_score', this.bestScore);
        }
    }

    preload() {
        // create simple textures for rocket and UI elements
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 20, 30);
        g.fillStyle(0x8e44ad, 1);
        g.fillRect(0, 30, 20, 10);
        g.fillStyle(0xff4d4d, 1);
        g.fillTriangle(10, 40, 0, 60, 20, 60);
        g.generateTexture('rocket', 20, 60);
        g.clear();
        g.fillStyle(0x888888, 1);
        g.fillRect(0, 0, 80, 20);
        g.generateTexture('platform', 80, 20);
        g.clear();
        g.fillStyle(0xffffff, 1);
        g.fillCircle(2, 2, 2);
        g.generateTexture('star', 4, 4);
        g.clear();
        g.fillStyle(0xffaa00, 1);
        g.fillTriangle(5, 0, 10, 15, 0, 15);
        g.generateTexture('flame', 10, 15);

        g.clear();
        g.fillStyle(0xffd700, 1);
        g.fillCircle(8, 8, 8);
        g.generateTexture('coin', 16, 16);

        g.clear();
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 800, 20);
        g.generateTexture('ground', 800, 20);
    }

    create() {
        this.settings = null;
        this.stats = loadStats();
        this.cameras.main.setBackgroundColor('#000');
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5);
        this.add.particles(0, 0, 'star', {
            speedY: { min: 20, max: 60 },
            lifespan: 4000,
            scale: { start: 0.4, end: 0 },
            quantity: 1,
            blendMode: 'ADD'
        });

        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x000000, 1);
        g.fillCircle(60, 60, 60);
        g.generateTexture('menuHole', 120, 120);
        const hole = this.add.image(400, 300, 'menuHole').setDepth(-1);
        this.tweens.add({ targets: hole, angle: 360, duration: 10000, repeat: -1 });

        const startButton = this.add.text(400, 300, 'НАЧАТЬ ИГРУ', {
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#00eaff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            this.closeOverlay();
            this.closeSettings();
            this.scene.start('Game');
        });

        const settingsIcon = this.add.text(770, 30, '\u2699', {
            fontSize: '32px',
        }).setOrigin(0.5).setInteractive();
        settingsIcon.on('pointerdown', () => this.showSettings());

        this.overlay = null;

        if (this.lastScore !== null) {
            this.add.text(400, 360,
                `Результат: ${this.lastScore}\nРекорд: ${this.bestScore}`,
                { fontSize: '24px', align: 'center' }).setOrigin(0.5);
        }

        const nav = this.add.container(400, 560);
        const items = [
            { icon: '\u2605', action: () => this.showReferrals() },
            { icon: '\u2606', action: () => this.showMarket() },
            { icon: '\u2601', action: () => this.showPlaceholder('Коллекции') },
            { icon: '\u2630', action: () => this.showProfile() },
        ];
        items.forEach((item, i) => {
            const t = this.add.text(i * 80 - 120, 0, item.icon, {
                fontSize: '24px',
            }).setOrigin(0.5).setInteractive();
            t.on('pointerdown', item.action);
            nav.add(t);
        });
    }

    showSettings() {
        if (this.settings) return;
        const bg = this.add.rectangle(0, 0, 500, 300, 0x000000, 0.8);
        const close = this.add.text(220, -130, 'X', { fontSize: '24px' }).setInteractive();
        const title = this.add.text(0, -100, 'Настройки', { fontSize: '28px' }).setOrigin(0.5);
        const info = this.add.text(0, -50, 'Язык, звук, FPS ...', { fontSize: '16px' }).setOrigin(0.5);
        const channel = this.add.text(-60, 110, '\uD83D\uDE80', { fontSize: '32px' }).setOrigin(0.5).setInteractive();
        channel.on('pointerdown', () => {
            window.open('https://t.me/cryptospace_pro', '_blank');
        });
        const chat = this.add.text(60, 110, '\uD83D\uDCAC', { fontSize: '32px' }).setOrigin(0.5).setInteractive();
        chat.on('pointerdown', () => {
            window.open('https://t.me/cryptospace_club', '_blank');
        });
        this.settings = this.add.container(400, 300, [bg, close, title, info, channel, chat]).setAlpha(0);
        this.tweens.add({ targets: this.settings, alpha: 1, duration: 200 });
        close.on('pointerdown', () => this.closeSettings());
    }

    showReferrals() {
        if (this.overlay) return;
        const bg = this.add.rectangle(0, 0, 520, 340, 0x000000, 0.8);
        const close = this.add.text(240, -150, 'X', { fontSize: '24px' }).setInteractive();
        const title = this.add.text(0, -120, 'Рефералы', { fontSize: '28px' }).setOrigin(0.5);
        const progress = this.add.text(0, -60, 'Приглашено: 0/3', { fontSize: '18px' }).setOrigin(0.5);
        this.overlay = this.add.container(400, 300, [bg, close, title, progress]).setAlpha(0);
        this.tweens.add({ targets: this.overlay, alpha: 1, duration: 200 });
        close.on('pointerdown', () => this.closeOverlay());
    }

    showMarket() {
        if (this.overlay) return;
        const bg = this.add.rectangle(0, 0, 520, 340, 0x000000, 0.8);
        const close = this.add.text(240, -150, 'X', { fontSize: '24px' }).setInteractive();
        const title = this.add.text(0, -120, 'Магазин', { fontSize: '28px' }).setOrigin(0.5);
        const row = this.add.container(-160, -60);
        const buyTurbo = () => {
            if (this.stats.ton >= 0.005) {
                this.stats.ton -= 0.005;
                this.stats.boosts.turbo += 1;
                saveStats(this.stats);
                info.setText('Куплено турбо');
                this.time.delayedCall(1000, () => info.setText(''));
            }
        };
        ['Турбо', 'Щит'].forEach((c, i) => {
            const r = this.add.rectangle(i * 160, 0, 140, 80, 0x222222, 0.9);
            const t = this.add.text(i * 160, -20, c, { fontSize: '18px' }).setOrigin(0.5);
            const btn = this.add.text(i * 160, 20, '0.005 TON', { fontSize: '14px' }).setOrigin(0.5).setInteractive();
            if (i === 0) btn.on('pointerdown', buyTurbo);
            row.add([r, t, btn]);
        });
        const info = this.add.text(0, 80, '', { fontSize: '16px' }).setOrigin(0.5);
        this.overlay = this.add.container(400, 300, [bg, close, title, row, info]).setAlpha(0);
        this.tweens.add({ targets: this.overlay, alpha: 1, duration: 200 });
        close.on('pointerdown', () => this.closeOverlay());
    }

    showPlaceholder(name) {
        if (this.overlay) return;
        const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.8);
        const text = this.add.text(0, 0, name, { fontSize: '28px' }).setOrigin(0.5);
        const close = this.add.text(180, -80, 'X', { fontSize: '24px' }).setInteractive();
        this.overlay = this.add.container(400, 300, [bg, text, close]).setAlpha(0);
        this.tweens.add({ targets: this.overlay, alpha: 1, duration: 200 });
        close.on('pointerdown', () => this.closeOverlay());
    }

    showProfile() {
        if (this.overlay) return;
        this.stats = loadStats();
        const bg = this.add.rectangle(0, 0, 520, 340, 0x000000, 0.8);
        const close = this.add.text(240, -150, 'X', { fontSize: '24px' }).setInteractive();
        const title = this.add.text(0, -120, 'Профиль', { fontSize: '28px' }).setOrigin(0.5);
        const info = this.add.text(0, -40,
            `Игр: ${this.stats.plays}\nВремя: ${Math.floor(this.stats.lifetime)}c\nTON: ${this.stats.ton.toFixed(3)}\nУровень: ${this.stats.level}`,
            { fontSize: '18px', align: 'center' }).setOrigin(0.5);
        const withdraw = this.add.text(0, 80, 'Вывести (Soon)', { fontSize: '20px', backgroundColor: '#222', padding:{x:10,y:5} }).setOrigin(0.5);
        this.overlay = this.add.container(400, 300, [bg, close, title, info, withdraw]).setAlpha(0);
        this.tweens.add({ targets: this.overlay, alpha: 1, duration: 200 });
        close.on('pointerdown', () => this.closeOverlay());
    }

    closeOverlay() {
        if (!this.overlay) return;
        this.tweens.add({
            targets: this.overlay,
            alpha: 0,
            duration: 200,
            onComplete: () => { this.overlay.destroy(); this.overlay = null; }
        });
    }

    closeSettings() {
        if (!this.settings) return;
        this.tweens.add({
            targets: this.settings,
            alpha: 0,
            duration: 200,
            onComplete: () => { this.settings.destroy(); this.settings = null; }
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
        this.player = null;
        this.platforms = null;
        this.score = 0;
        this.scoreText = null;
        this.shieldActive = 0;
        this.platformXp = 0;
    }

    preload() {
        // textures created in MenuScene
    }

    create() {
        this.stats = loadStats();
        this.playStart = this.time.now;
        this.platformXp = 0;

        this.cameras.main.setBackgroundColor('#000011');
        this.stars = this.add.particles(0, 0, 'star', {
            speedY: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 2000,
            blendMode: 'ADD',
            emitting: true
        });

        // static black hole sprite
        const hg = this.make.graphics({ x: 0, y: 0, add: false });
        hg.fillStyle(0x000000, 1);
        hg.fillCircle(80, 80, 80);
        hg.generateTexture('hole', 160, 160);
        const hole = this.add.image(400, 300, 'hole').setScrollFactor(0).setDepth(-1);
        this.tweens.add({ targets: hole, angle: 360, duration: 8000, repeat: -1 });

        this.ground = this.physics.add.staticImage(400, 590, 'ground');

        this.platforms = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });
        this.coins = this.physics.add.group({ allowGravity: false });
        for (let i = 0; i < 4; i++) {
            this.spawnPlatform(true);
        }

        this.player = this.physics.add.sprite(400, 550, 'rocket');
        this.player.setBounce(0.2);
        this.player.setGravityY(300);
        this.player.setCollideWorldBounds(false);

        this.flame = this.add.particles(0, 0, 'flame', {
            speedY: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            frequency: -1,
        });
        this.flame.startFollow(this.player, 0, 30);

        this.physics.add.collider(this.player, this.ground, this.handleJump, null, this);
        this.physics.add.collider(this.player, this.platforms, this.handleJump, null, this);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.scoreText = this.add.text(10, 10, '0', {
            fontSize: '20px',
            color: '#fff',
        }).setScrollFactor(0);
        this.tonText = this.add.text(700, 10, this.stats.ton.toFixed(3)+' TON', { fontSize: '20px', color:'#fff' }).setScrollFactor(0);

        this.turboBtn = this.add.text(60, 560, `Turbo (${this.stats.boosts.turbo})`, { fontSize:'18px', backgroundColor:'#333', padding:{x:6,y:4}}).setScrollFactor(0).setInteractive();
        this.turboBtn.on('pointerdown', () => this.useTurbo());
        this.shieldBtn = this.add.text(640, 560, `Shield (${this.stats.boosts.shield})`, { fontSize:'18px', backgroundColor:'#333', padding:{x:6,y:4}}).setScrollFactor(0).setInteractive();
        this.shieldBtn.on('pointerdown', () => this.useShield());

        this.cameras.main.startFollow(this.player);
    }

    handleJump(player, platform) {
        if (player.body.velocity.y > 0) {
            player.setVelocityY(-330);
            this.playTone(400, 0.2);
        }
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.stats.ton += 0.001;
        this.stats.xp += 1;
        this.tonText.setText(this.stats.ton.toFixed(3) + ' TON');
        saveStats(this.stats);
    }

    update() {
        const delta = this.game.loop.delta;
        if (this.shieldActive > 0) {
            this.shieldActive -= delta;
        }
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.player.body.velocity.y < 0) {
            this.flame.emitParticle();
        }

        if (this.player.y < this.cameras.main.scrollY + 300) {
            this.spawnPlatform();
            this.score += 1;
            const gained = Math.floor(this.score / 3) - this.platformXp;
            if (gained > 0) {
                this.stats.xp += gained;
                this.platformXp += gained;
                saveStats(this.stats);
            }
            this.scoreText.setText(this.score);
        }

        if (this.player.y > this.cameras.main.scrollY + 700) {
            if (this.shieldActive <= 0) {
                this.gameOver();
            }
        }

        const width = this.scale.width;
        if (this.player.x < -20) {
            this.player.x = width + 20;
        } else if (this.player.x > width + 20) {
            this.player.x = -20;
        }

        this.platforms.children.iterate(p => {
            if (p.getData('moving')) {
                p.x += p.getData('dir') * 1.5;
                if (p.x < 50) p.setData('dir', 1);
                if (p.x > 750) p.setData('dir', -1);
            }
            if (p.y > this.cameras.main.scrollY + 800) {
                p.destroy();
            }
        });

        this.coins.children.iterate(c => {
            if (c.y > this.cameras.main.scrollY + 800) {
                c.destroy();
            }
        });
    }

    gameOver() {
        this.playTone(200, 0.4);
        const lifetime = (this.time.now - this.playStart) / 1000;
        this.stats.plays += 1;
        this.stats.lifetime += lifetime;
        this.stats.level = 1 + Math.floor(this.stats.xp / 100);
        saveStats(this.stats);
        this.scene.start('Menu', { score: this.score });
    }

    spawnPlatform(initial = false) {
        let y;
        if (initial) {
            const base = this.ground ? this.ground.y - this.ground.displayHeight / 2 - 100 : this.scale.height - 100;
            y = base - PLATFORM_SPACING * this.platforms.getLength();
        } else {
            const lowest = this.getLowestPlatform();
            y = lowest.y - PLATFORM_SPACING;
        }
        const x = Phaser.Math.Between(50, 750);
        const platform = this.platforms.create(x, y, 'platform');
        platform.body.checkCollision.down = false;
        if (!initial && Phaser.Math.Between(0, 1) === 1) {
            platform.setData('dir', Phaser.Math.Between(0, 1) ? 1 : -1);
            platform.setData('moving', true);
        }
        // spawn coin above some platforms (about every other platform)
        if (!initial && Phaser.Math.FloatBetween(0, 1) < 0.5) {
            const coin = this.coins.create(x, y - 40, 'coin');
        }
    }

    getLowestPlatform() {
        let lowest = null;
        this.platforms.children.iterate(p => {
            if (!lowest || p.y > lowest.y) lowest = p;
        });
        return lowest;
    }

    playTone(freq, duration) {
        const ctx = this.sound.context;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    useTurbo() {
        if (this.stats.boosts.turbo > 0) {
            this.player.setVelocityY(-500);
            this.stats.boosts.turbo -= 1;
            saveStats(this.stats);
            this.turboBtn.setText(`Turbo (${this.stats.boosts.turbo})`);
        }
    }

    useShield() {
        if (this.stats.boosts.shield > 0) {
            this.shieldActive = 3000;
            this.stats.boosts.shield -= 1;
            saveStats(this.stats);
            this.shieldBtn.setText(`Shield (${this.stats.boosts.shield})`);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [MenuScene, GameScene],
};

new Phaser.Game(config);

import Phaser from 'phaser';

class Game {
  constructor(container) {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 360,
      height: 640,
      parent: container,
      physics: { default: 'arcade' },
      scene: {
        preload: this.preload,
        create: this.create,
        update: this.update,
      },
    });

    this.player = null;
    this.cursors = null;
    this.platforms = null;
    this.flame = null;
  }

  preload() {
    this.load.image('rocket', 'assets/rocket.png');
    this.load.image('flame', 'assets/flame.png');
    this.load.image('platform', 'assets/platform.png');
  }

  create() {
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(180, 620, 'platform').setScale(0.5).refreshBody();

    this.player = this.physics.add.sprite(180, 500, 'rocket');
    this.player.setGravityY(300);

    this.flame = this.add.image(this.player.x, this.player.y + 40, 'flame');
    this.flame.setVisible(false);

    this.physics.add.collider(this.player, this.platforms, this.jump, null, this);
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  jump() {
    if (this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      this.flame.setVisible(true);
      this.time.delayedCall(200, () => {
        this.flame.setVisible(false);
      });
    }
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    this.flame.x = this.player.x;
    this.flame.y = this.player.y + 40;
  }
}

export default Game;

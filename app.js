let config = {
  renderer: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  scale: {
    mode: Phaser.Scale.FIT, // Fit the game to the container while maintaining aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game canvas in the middle of the screen
  },
};

let game = new Phaser.Game(config);

let isGameStarted = false;

let cursors;
let touchStart = null; // To capture the start time of a touch event
let isTouched = false;

var pete;
let hasLanded = false;
let hasBumped = false;

let messageToPlayer;

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("road", "assets/road.png");
  this.load.image("column", "assets/column.png");
  this.load.spritesheet("pete", "assets/pete.png", {
    frameWidth: 64,
    frameHeight: 96,
  });
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();

  const background = this.add.image(0, 0, "background").setOrigin(0, 0);
  const roads = this.physics.add.staticGroup();

  const topColumns = this.physics.add.staticGroup({
    key: "column",
    repeat: 1,
    setXY: { x: 200, y: 0, stepX: 300 },
  });

  const bottomColumns = this.physics.add.staticGroup({
    key: "column",
    repeat: 1,
    setXY: { x: 350, y: 400, stepX: 300 },
  });

  const road = roads.create(400, 568, "road").setScale(2).refreshBody();

  pete = this.physics.add.sprite(0, 50, "pete").setScale(0.69); // Nice
  pete.setBounce(0.2);
  pete.setCollideWorldBounds(true);

  this.physics.add.overlap(pete, road, () => (hasLanded = true), null, this);
  this.physics.add.collider(pete, road);
  this.physics.add.overlap(
    pete,
    topColumns,
    () => (hasBumped = true),
    null,
    this
  );

  this.physics.add.overlap(
    pete,
    bottomColumns,
    () => (hasBumped = true),
    null,
    this
  );
  this.physics.add.collider(pete, topColumns);
  this.physics.add.collider(pete, bottomColumns);

  messageToPlayer = this.add.text(
    0,
    0,
    `Instructions: Press space bar to start`,
    {
      fontFamily: '"Comic Sans MS", Times, serif',
      fontSize: "16px",
      color: "white",
      backgroundColor: "black",
      wordWrap: { width: 450, useAdvancedWrap: true },
    }
  );

  Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, -70, 50);

  this.input.on(
    "pointerdown",
    function (pointer) {
      if (!isTouched) {
        touchStart = this.time.now;
        isTouched = true;
      }
    },
    this
  );

  this.input.on(
    "pointerup",
    function (pointer) {
      isTouched = false;
    },
    this
  );
}

function update() {
  pete.body.velocity.x = 50;

  if (hasLanded || hasBumped || !isGameStarted) {
    pete.body.velocity.x = 0;
  }

  if (!isGameStarted) {
    pete.setVelocityY(-160);
  }

  if (cursors.space.isDown && !isGameStarted) {
    isGameStarted = true;
  }

  if (
    (cursors.up.isDown || (isTouched && touchStart)) &&
    !hasLanded &&
    !hasBumped
  ) {
    pete.setVelocityY(-160);
  }

  if (
    ((touchStart && this.time.now - touchStart > 1000) ||
      cursors.space.isDown) &&
    !isGameStarted
  ) {
    isGameStarted = true;
    messageToPlayer.text =
      "Instructions: Press the ^ button or touch the screen to flap upwards";
    touchStart = null; // Resetting touchStart so that the condition doesn't trigger repeatedly
  }

  if (hasLanded || hasBumped) {
    messageToPlayer.text = `Oh no! You crashed!`;
  }

  if (pete.x > 750) {
    pete.setVelocityY(40);
    messageToPlayer.text = `Congrats! You won!`;
  }
}

var requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

// Game state variables
var canvas, ctx, player, level, sounds, music, updateables, fireballs;
var vX = 0,
  vY = 0,
  vWidth = 256,
  vHeight = 240;
var gameTime = 0;

// Create canvas
function createCanvas() {
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = 762;
  canvas.height = 720;
  ctx.scale(3, 3);
  canvas.style.display = "none"; // Initially hide the canvas
  document.body.appendChild(canvas);
}

// Initialize everything
function initializeGame() {
  // Reset game variables
  updateables = [];
  fireballs = [];
  player = new Mario.Player([0, 0]);
  level = null;
  gameTime = 0;

  // Load resources
  resources.load([
    "sprites/player.png",
    "sprites/enemy.png",
    "sprites/tiles.png",
    "sprites/playerl.png",
    "sprites/items.png",
    "sprites/enemyr.png",
  ]);
  resources.onReady(initLevel);
}

// Create and display sign-in form
function showSignInForm() {
  // Create form
  const form = document.createElement("form");
  form.id = "sign-in-form";
  form.innerHTML = `
    <h1>Welcome to Couchbase Mario!</h1>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    <br>
    <label for="email">Work Email:</label>
    <input type="email" id="email" name="email" required>
    <br>
    <label>
      <input type="checkbox" id="consent" name="consent">
      I agree to receive communications from Couchbase.
    </label>
    <br>
    <button type="submit">Start Game</button>
  `;

  // Append the form to the body
  document.body.appendChild(form);

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = form.elements.name.value;
    const email = form.elements.email.value;
    const consent = form.elements.consent.checked;

    // Optional: Send this data to a backend or log for debugging
    console.log({ name, email, consent });

    // Hide the form and start the game
    form.style.display = "none"; // Hide the form
    if (canvas) {
      canvas.style.display = "block"; // Show the canvas
    } else {
      createCanvas(); // Create the canvas if it doesn't exist
    }
    initializeGame();
  });
}

// Initialize level and start gameplay
function initLevel() {
  // Load level and sounds
  music = {
    overworld: new Audio("sounds/aboveground_bgm.ogg"),
    underground: new Audio("sounds/underground_bgm.ogg"),
    clear: new Audio("sounds/stage_clear.wav"),
    death: new Audio("sounds/mariodie.wav"),
  };
  sounds = {
    smallJump: new Audio("sounds/jump-small.wav"),
    bigJump: new Audio("sounds/jump-super.wav"),
    breakBlock: new Audio("sounds/breakblock.wav"),
    bump: new Audio("sounds/bump.wav"),
    coin: new Audio("sounds/coin.wav"),
    fireball: new Audio("sounds/fireball.wav"),
    flagpole: new Audio("sounds/flagpole.wav"),
    kick: new Audio("sounds/kick.wav"),
    pipe: new Audio("sounds/pipe.wav"),
    itemAppear: new Audio("sounds/itemAppear.wav"),
    powerup: new Audio("sounds/powerup.wav"),
    stomp: new Audio("sounds/stomp.wav"),
  };
  Mario.oneone();
  lastTime = Date.now();
  main();
}

// Handles user input
function handleInput(dt) {
  if (player.piping || player.dying || player.noInput) return; // don't accept input

  if (input.isDown("RUN")) {
    player.run();
  } else {
    player.noRun();
  }
  if (input.isDown("JUMP")) {
    player.jump();
  } else {
    // we need this to handle the timing for how long you hold it
    player.noJump();
  }

  if (input.isDown("DOWN")) {
    player.crouch();
  } else {
    player.noCrouch();
  }

  if (input.isDown("LEFT")) {
    player.moveLeft();
  } else if (input.isDown("RIGHT")) {
    player.moveRight();
  } else {
    player.noWalk();
  }
}

// Updates all entities in the game
function updateEntities(dt, gameTime) {
  // Update the player
  player.update(dt, vX);

  // Update other entities
  updateables.forEach(function (ent) {
    ent.update(dt, gameTime);
  });

  // Scroll the viewport if necessary
  if (player.exiting) {
    if (player.pos[0] > vX + 96) vX = player.pos[0] - 96;
  } else if (level.scrolling && player.pos[0] > vX + 80) {
    vX = player.pos[0] - 80;
  }

  if (player.powering.length !== 0 || player.dying) {
    return;
  }

  level.items.forEach((ent) => ent.update(dt));
  level.enemies.forEach((ent) => ent.update(dt, vX));
  fireballs.forEach((fireball) => fireball.update(dt));
  level.pipes.forEach((pipe) => pipe.update(dt));
}

// Checks collisions for all game entities
function checkCollisions() {
  if (player.powering.length !== 0 || player.dying) return;

  player.checkCollisions();
  level.items.forEach((item) => item.checkCollisions());
  level.enemies.forEach((enemy) => enemy.checkCollisions());
  fireballs.forEach((fireball) => fireball.checkCollisions());
  level.pipes.forEach((pipe) => pipe.checkCollisions());
}

// Render the game
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = level.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 15; i++) {
    for (let j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++) {
      if (level.scenery[i][j]) renderEntity(level.scenery[i][j]);
    }
  }

  level.items.forEach((item) => renderEntity(item));
  level.enemies.forEach((enemy) => renderEntity(enemy));
  fireballs.forEach((fireball) => renderEntity(fireball));

  for (let i = 0; i < 15; i++) {
    for (let j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++) {
      if (level.statics[i][j]) renderEntity(level.statics[i][j]);
      if (level.blocks[i][j]) {
        renderEntity(level.blocks[i][j]);
        updateables.push(level.blocks[i][j]);
      }
    }
  }

  if (player.invincibility % 2 === 0) renderEntity(player);
  level.pipes.forEach((pipe) => renderEntity(pipe));
}

// Helper function to render an entity
function renderEntity(entity) {
  entity.render(ctx, vX, vY);
}

// Main game loop
function main() {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  update(dt);
  render();

  lastTime = now;
  requestAnimFrame(main);
}

// Update the game state
function update(dt) {
  gameTime += dt;

  handleInput(dt);
  updateEntities(dt, gameTime);
  checkCollisions();
}

// Reset game back to sign-in screen
function resetToSignIn() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.display = "none";
  showSignInForm();
}

// Add a mechanism to reset game when a level ends
function onGameEnd() {
  setTimeout(resetToSignIn, 2000); // 2 seconds after the game ends
}

// Initialize the app
createCanvas();
showSignInForm();

BACKEND_URL = "http://localhost:3000";

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

var canvas, ctx, player, level, sounds, music, updateables, fireballs;
var vX = 0,
  vY = 0,
  vWidth = 256,
  vHeight = 240;
var gameTime = 0;
var playerId; // Player ID for backend integration
var previousScore = 0;
var gameTimer = 90; // 90 seconds
var timerDisplay = null;
var timerInterval = null;
var lastUpdateTime = 0;
let UPDATE_INTERVAL = 1000; // Update every 1 second

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
  
  // Initialize player stats
  player.coins = 0;  // Regular coin counter
  player.coinsCollected = 0;  // Tracking counter
  player.fireballsShot = 0;
  player.enemiesDefeated = 0;
  player.reachedFlag = false;
  player.flagPoleHeight = 0;
  
  level = null;
  gameTime = 0;
  gameTimer = 90; // Reset timer
  
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  if (timerDisplay) {
    timerDisplay.remove();
  }
  
  // Start new timer
  startGameTimer();

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
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = form.elements.name.value;
    const email = form.elements.email.value;
    const consent = form.elements.consent.checked;

    try {
      // Send player data to the server
      const response = await fetch(`${BACKEND_URL}/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, consent }),
      });

      if (!response.ok) throw new Error("Failed to create player record");

      const data = await response.json();
      console.log("Player record created:", data);
      playerId = data.playerId;

      // Start the game
      form.style.display = "none";
      canvas.style.display = "block";
      initializeGame();
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

// Throttle network updates
UPDATE_INTERVAL = 1000; // Update every 1 second
lastUpdateTime = 0;

// Modify sendGameplayUpdate to be throttled
async function sendGameplayUpdate(state) {
  const now = Date.now();
  if (now - lastUpdateTime < UPDATE_INTERVAL) {
    return; // Skip update if not enough time has passed
  }
  lastUpdateTime = now;

  try {
    const gameState = {
      timestamp: new Date().toISOString(),
      state: {
        ...state,
        playerStats: {
          coinsCollected: player.coinsCollected || 0,
          fireballsShot: player.fireballsShot || 0,
          enemiesDefeated: player.enemiesDefeated || 0,
          reachedFlag: player.reachedFlag || false,
          flagPoleHeight: player.flagPoleHeight || 0
        }
      }
    };

    // Use non-blocking fetch
    fetch(`${BACKEND_URL}/api/players/${playerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameplayState: gameState }),
    }).catch(error => console.error("🪙 NETWORK ERROR:", error));

  } catch (error) {
    console.error("🪙 Update Error:", error);
  }
}

// Add this new function for immediate updates
async function sendImmediateGameplayUpdate(state) {
    try {
        // Ensure player stats are properly initialized
        if (!player.coinsCollected) player.coinsCollected = 0;
        if (!player.coins) player.coins = 0;

        const gameState = {
            timestamp: new Date().toISOString(),
            state: {
                ...state,
                playerStats: {
                    coinsCollected: parseInt(player.coinsCollected) || 0,
                    coins: parseInt(player.coins) || 0,
                    fireballsShot: player.fireballsShot || 0,
                    enemiesDefeated: player.enemiesDefeated || 0,
                    reachedFlag: player.reachedFlag || false,
                    flagPoleHeight: player.flagPoleHeight || 0
                }
            }
        };

        console.log('🪙 IMMEDIATE UPDATE:', {
            playerStats: gameState.state.playerStats,
            rawValues: {
                coins: player.coins,
                coinsCollected: player.coinsCollected
            }
        });

        const response = await fetch(`${BACKEND_URL}/api/players/${playerId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameplayState: gameState }),
        });

        if (!response.ok) {
            throw new Error("Failed to update gameplay state");
        }

        const responseData = await response.json();
        console.log('🪙 Server Response:', responseData);
    } catch (error) {
        console.error("🪙 Update Error:", error);
    }
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
  if (player.piping || player.dying || player.noInput) return;

  const actionState = {
    jumping: false,
    running: false,
    crouching: false,
    movingLeft: false,
    movingRight: false,
  };

  if (input.isDown("RUN")) {
    player.run();
    actionState.running = true;
  } else player.noRun();

  if (input.isDown("JUMP")) {
    player.jump();
    actionState.jumping = true;
  } else player.noJump();

  if (input.isDown("DOWN")) {
    player.crouch();
    actionState.crouching = true;
  } else player.noCrouch();

  if (input.isDown("LEFT")) {
    player.moveLeft();
    actionState.movingLeft = true;
  } else if (input.isDown("RIGHT")) {
    player.moveRight();
    actionState.movingRight = true;
  } else player.noWalk();

  sendGameplayUpdate({ action: actionState });
}

// Updates all entities in the game
function updateEntities(dt, gameTime) {
  player.update(dt, vX);
  updateables.forEach((ent) => ent.update(dt, gameTime));
  
  if (player.exiting) {
    if (player.pos[0] > vX + 96) vX = player.pos[0] - 96;
  } else if (level.scrolling && player.pos[0] > vX + 80) {
    vX = player.pos[0] - 80;
  }

  if (player.powering.length !== 0 || player.dying) return;

  level.items.forEach((ent) => ent.update(dt));
  level.enemies.forEach((ent) => ent.update(dt, vX));
  fireballs.forEach((fireball) => fireball.update(dt));
  level.pipes.forEach((pipe) => pipe.update(dt));

  // Only send updates periodically
  sendGameplayUpdate({
    position: player.pos,
    velocity: player.vel,
    lives: player.lives,
    score: player.score
  });
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
  const now = Date.now();
  const dt = (now - lastTime) / 1000.0;

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
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  if (timerDisplay) {
    timerDisplay.remove();
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.display = "none";
  showSignInForm();
}

// Add a mechanism to reset game when a level ends
function onGameEnd() {
  setTimeout(resetToSignIn, 2000);
}

function createTimer() {
  timerDisplay = document.createElement('div');
  timerDisplay.className = 'timer';
  timerDisplay.textContent = gameTimer + 's';
  document.body.appendChild(timerDisplay);
}

function startGameTimer() {
  createTimer();
  timerInterval = setInterval(() => {
    gameTimer--;
    timerDisplay.textContent = gameTimer + 's';
    
    if (gameTimer <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  // Pause all game music and sounds
  music.overworld.pause();
  music.underground.pause();
  
  // Show game over popup
  setTimeout(() => {
    alert('Time\'s up! Game Over!');
    window.location.reload();
  }, 100);
}

// Initialize the app
createCanvas();
showSignInForm();

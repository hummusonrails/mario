BACKEND_URL = "https://mario-p44r.onrender.com";
//BACKEND_URL = "http://localhost:3000";

// Create and initialize the inspector panel
function createInspector() {

  // Create a container for the game canvas
  const gameContainer = document.createElement('div');
  gameContainer.id = 'game-container';

  // Move the existing canvas (created in createCanvas()) into the container
  const existingCanvas = document.querySelector('canvas');
  if (existingCanvas) {
    existingCanvas.remove();
    gameContainer.appendChild(existingCanvas);
  }

  // Create the inspector panel element
  const inspector = document.createElement('div');
  inspector.id = 'inspector';
  inspector.innerHTML = `
    <div class="inspector-header">
      <div class="inspector-tab active">Console</div>
      <div class="inspector-tab">Game State</div>
    </div>
    <div class="inspector-content">
      <div class="property-row">
        <span class="property-name">playerPosition</span>
        <span class="property-value">[0, 0]</span>
      </div>
      <div class="property-row">
        <span class="property-name">coinsCollected</span>
        <span class="property-value number">0</span>
      </div>
      <div class="property-row">
        <span class="property-name">fireballsShot</span>
        <span class="property-value number">0</span>
      </div>
      <div class="property-row">
        <span class="property-name">enemiesDefeated</span>
        <span class="property-value number">0</span>
      </div>
      <div class="property-row">
        <span class="property-name">reachedFlag</span>
        <span class="property-value boolean">false</span>
      </div>
      <div class="property-row">
        <span class="property-name">flagPoleHeight</span>
        <span class="property-value number">0</span>
      </div>
    </div>
  `;

  // Append the game container and inspector to the document body
  document.body.appendChild(gameContainer);
  document.body.appendChild(inspector);

  // Define the updateInspector function globally so it can be called from the game loop.
  window.updateInspector = function () {
    if (!player) return;

    const stats = {
      playerPosition: player.pos,
      coinsCollected: player.coinsCollected || 0,
      fireballsShot: player.fireballsShot || 0,
      enemiesDefeated: player.enemiesDefeated || 0,
      reachedFlag: player.reachedFlag || false,
      flagPoleHeight: player.flagPoleHeight || 0
    };

    // Loop through each property row and update its value if it exists in the stats.
    const rows = inspector.querySelectorAll('.property-row');
    rows.forEach(row => {
      const nameEl = row.querySelector('.property-name');
      const valueEl = row.querySelector('.property-value');
      const key = nameEl.textContent.trim();
      if (stats.hasOwnProperty(key)) {
        const value = stats[key];
        valueEl.textContent = Array.isArray(value) ? `[${value.join(', ')}]` : value;
      }
    });
  };
}

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
var gameTimer = 45; // 50 seconds
var timerDisplay = null;
var timerInterval = null;
var lastUpdateTime = 0;
let UPDATE_INTERVAL = 1000; // Update every 1 second

let isGamepadConnected = false;

window.addEventListener("gamepadconnected", (e) => {
  isGamepadConnected = true;
  console.log("Gamepad connected:", e.gamepad);
});

window.addEventListener("gamepaddisconnected", (e) => {
  isGamepadConnected = false;
  console.log("Gamepad disconnected:", e.gamepad);
});

// Create canvas
function createCanvas() {
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = 762;
  //canvas.width = window.innerWidth;
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

  if (!document.getElementById('inspector')) {
    createInspector();
  }

  level = null;
  gameTime = 0;
  gameTimer = 45; // Reset timer

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
  <img src="js/logo.png" alt="Logo" id="logo" />
  <h1>Welcome to Couchbase Mario!</h1>
  <label for="name">Name:</label>
  <input type="text" id="name" name="name" required placeholder="Enter your name">
  
  <label for="email">Work Email:</label>
  <input type="text" id="email" name="email" required placeholder="Enter your work email">
  
  <label for="phone">Phone Number:</label>
  <input type="text" id="phone" name="phone" required placeholder="Enter your phone number">
  
  <label for="company">Company:</label>
  <input type="text" id="company" name="company" required placeholder="Enter your company name">
  
  <label for="job_title">Job Title:</label>
  <input type="text" id="job_title" name="job_title" required placeholder="Enter your job title">
  
  <label for="consent">
    <input type="checkbox" id="consent" name="consent">
    <span>I agree to receive communications from Couchbase.</span>
  </label>
  
  <button type="submit">Start Your Adventure!</button>
`;

  // Append the form to the body
  document.body.appendChild(form);

  // Get references to the submit button and input fields
  const submitButton = form.querySelector('button[type="submit"]');
  const emailInput = form.querySelector('input[name="email"]');
  const nameInput = form.querySelector('input[name="name"]');

  // Create error message elements for email and name
  let emailErrorElement = document.createElement("div");
  emailErrorElement.id = "email-error";
  emailErrorElement.style.color = "red";
  emailErrorElement.style.fontSize = "0.875rem";
  emailErrorElement.style.marginBottom = "1rem";
  emailInput.parentNode.insertBefore(emailErrorElement, emailInput.nextSibling);

  let nameErrorElement = document.createElement("div");
  nameErrorElement.id = "name-error";
  nameErrorElement.style.color = "red";
  nameErrorElement.style.fontSize = "0.875rem";
  nameErrorElement.style.marginBottom = "1rem";
  nameInput.parentNode.insertBefore(nameErrorElement, nameInput.nextSibling);

  // Check for the work_emails flag in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const workEmailsOnly = urlParams.get("work_emails") === "true";

  // Helper function to perform combined validation
  function validateForm() {
    let disable = false;

    // Validate name: require at least two words
    const nameVal = nameInput.value.trim();
    if (nameVal.split(/\s+/).length < 2) {
      nameErrorElement.textContent = "Please enter your first and last name.";
      disable = true;
    } else {
      nameErrorElement.textContent = "";
    }

    // Validate email only if work emails are required
    if (workEmailsOnly) {
      const emailVal = emailInput.value.trim().toLowerCase();
      if (emailVal.endsWith("@gmail.com")) {
        emailErrorElement.textContent = "Only work emails are accepted. Please use your work email.";
        disable = true;
      } else {
        emailErrorElement.textContent = "";
      }
    }

    submitButton.disabled = disable;
  }

  // Attach input listeners to both the email and name fields
  nameInput.addEventListener("input", validateForm);
  if (workEmailsOnly) {
    emailInput.addEventListener("input", validateForm);
  }

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim().toLowerCase();
    const phone = form.elements.phone.value;
    const company = form.elements.company.value;
    const job_title = form.elements.job_title.value;
    const consent = form.elements.consent.checked;

    // Final validation for work emails
    if (workEmailsOnly && email.endsWith("@gmail.com")) {
      alert("Only work emails are accepted. Please enter a non-Gmail address.");
      return;
    }
    // Final validation for name (ensure at least two words)
    if (name.split(/\s+/).length < 2) {
      alert("Please enter your first and last name.");
      return;
    }

    try {
      // Send player data to the server
      const response = await fetch(`${BACKEND_URL}/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, phone, job_title, consent }),
      });

      if (!response.ok) throw new Error("Failed to create player record");

      const data = await response.json();
      console.log("Player record created:", data);
      playerId = data.playerId;

      // Animate form out
      form.style.animation = 'slideOut 0.5s ease-out forwards';

      // Start the game after animation
      setTimeout(() => {
        form.style.display = "none";
        canvas.style.display = "block";
        initializeGame();
      }, 500);
    } catch (error) {
      console.error("Error:", error);
    }
  });
};

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
    if (state.action === 'levelExit') {
      // TO DO: Save level completion to Couchbase
      console.log("Congratulations you reached the end!");
      clearInterval(timerInterval); // Stop the timer
      gameTimer = 50; // Reset the timer to initial value
      setTimeout(() => {
        alert('Level Complete! Well done!');
        endGame();
        window.location.reload();
         // End the game properly
      }, 150);
    }

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
    star: new Audio("sounds/star.mp3"),
    death: new Audio("sounds/mariodie.wav"),
    gameover: new Audio("sounds/gameover.mp3")
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

window.addEventListener("gamepadconnected", (e) => {
  console.log("Gamepad connected:", e.gamepad);
});
window.addEventListener("gamepaddisconnected", (e) => {
  console.log("Gamepad disconnected:", e.gamepad);
});

function handleCombinedInput(dt) {
  if (isGamepadConnected) {
    handleGamepadInput(dt);
  } else {
    handleInput(dt);
  }
}

/* Function to poll gamepad input and trigger player actions */
function handleGamepadInput(dt) {
  if (player.piping || player.dying || player.noInput) return;
  //console.log("searching for gamepad")
  const gamepads = navigator.getGamepads();
  const gp = gamepads[0]; // Using the first connected gamepad
  if (!gp) return;
  //console.log("Gamepad Buttons count:", gp.buttons.length);

  // Log button states for debugging
  //gp.buttons.forEach((button, index) => {
  //  if (button.pressed) {
  //    console.log(`Button ${index} pressed`);
  //  }
  //});

  if (player.piping || player.dying || player.noInput) return;

  const actionState = {
    jumping: false,
    running: false,
    crouching: false,
    movingLeft: false,
    movingRight: false,
  };

  if (gp.buttons[1].pressed || gp.buttons[2].pressed) {
    player.run();
    actionState.running = true;
  } else player.noRun();

  if (gp.buttons[0].pressed) {
    player.jump();
    actionState.jumping = true;
  } else player.noJump();

  if (gp.buttons[13].pressed) {
    player.crouch();
    actionState.crouching = true;
  } else player.noCrouch();

  if (gp.buttons[14].pressed) {
    player.moveLeft();
    actionState.movingLeft = true;
  } else if (gp.buttons[15].pressed) {
    player.moveRight();
    actionState.movingRight = true;
  } else player.noWalk();

  sendGameplayUpdate({ action: actionState });
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

  if (!player.exiting && level.scrolling && player.pos[0] > vX + 80) {
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

  // 1. Draw scenery FIRST (background elements)
  for (let i = 0; i < 15; i++) {
    for (let j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++) {
      if (level.scenery[i][j]) renderEntity(level.scenery[i][j]);
    }
  }

  // 2. Draw items, enemies, fireballs
  level.items.forEach((item) => renderEntity(item));
  level.enemies.forEach((enemy) => renderEntity(enemy));
  fireballs.forEach((fireball) => renderEntity(fireball));

  // 4. Draw PLAYER after pipes, but before blocks
  if (player.invincibility % 2 === 0) renderEntity(player);

  // 3. Draw static structures (pipes, walls)
  level.pipes.forEach((pipe) => renderEntity(pipe));
  for (let i = 0; i < 15; i++) {
    for (let j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++) {
      if (level.statics[i][j]) renderEntity(level.statics[i][j]);
    }
  }



  // 5. Draw blocks last (ensuring they appear above the player if needed)
  for (let i = 0; i < 15; i++) {
    for (let j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++) {
      if (level.blocks[i][j]) {
        renderEntity(level.blocks[i][j]);
        updateables.push(level.blocks[i][j]);
      }
    }
  }
}

// Helper function to render an entity
function renderEntity(entity) {
  entity.render(ctx, vX, vY);
}

let fixedDelta = 1 / 60; // fixed timestep (approximately 16.67 ms)
let accumulator = 0;

// Main game loop
function main() {
  const now = Date.now();
  const frameTime = (now - lastTime) / 1000.0;
  lastTime = now;
  accumulator += frameTime;

  // Update the simulation in fixed increments
  while (accumulator >= fixedDelta) {
    update(fixedDelta);
    accumulator -= fixedDelta;
  }

  render();
  requestAnimFrame(main);
}

// Update the game state
function update(dt) {
  gameTime += dt;
  //handleInput(dt);
  //handleGamepadInput(dt);

  handleCombinedInput(dt);
  updateEntities(dt, gameTime);
  checkCollisions();

  if (typeof window.updateInspector === 'function') {
    window.updateInspector();
  }
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
  setTimeout(resetToSignIn, 1000);
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
      music.gameover.play()
      // Show game over popup
      setTimeout(() => {
        alert('Time\'s up! Game Over!');
        //endGame();
        window.location.reload();
      }, 100);

    }
  }, 1000);
}

function endGame() {
  // Pause all game music and sounds
  
  music.overworld.pause();
  music.underground.pause();
  music.star.pause()
  //window.location.reload();


}

// Initialize the app
createCanvas();
showSignInForm();

(function() {
  if (typeof Mario === 'undefined')
  window.Mario = {};

  var Koopa = Mario.Koopa = function(pos, sprite, para) {
    this.dying = false;
    this.shell = false;

    this.para = para; //para. As in, is it a paratroopa?

    //So, funny story. The actual hitboxes don't reach all the way to the ground.
    //What that means is, as long as I use them to keep things on the floor
    //making the hitboxes accurate will make enemies sink into the ground.
    Mario.Entity.call(this, {
      pos: pos,
      sprite: sprite,
      hitbox: [2,8,12,24]
    });
    this.vel[0] = -0.5;
    this.idx = level.enemies.length;
  };

  Koopa.prototype.render = function(ctx, vX, vY) {
    this.sprite.render(ctx, this.pos[0], this.pos[1], vX, vY);
  };

  Koopa.prototype.update = function(dt, vX) {
    if (this.turn) {
      this.vel[0] = -this.vel[0];
      if (this.shell) sounds.bump.play();
      this.turn = false;
    }
    if (this.vel[0] != 0) {
      this.left = (this.vel[0] < 0);
    }

    if (this.left) {
      this.sprite.img = 'sprites/enemy.png';
    } else {
      this.sprite.img = 'sprites/enemyr.png';
    }

    if (this.pos[0] - vX > 336) { //if we're too far away, do nothing.
      return;
    } else if (this.pos[0] - vX < -32) {
      delete level.enemies[this.idx];
    }

    if (this.dying) {
      this.dying -= 1;
      if (!this.dying) {
        delete level.enemies[this.idx];
      }
    }

    if (this.shell) {
      // If the shell is moving, decrement the timer; if stationary, leave it unchanged
      if (this.vel[0] !== 0) {
        this.shell -= 1;
        if (this.shell < 120) {
          this.sprite.speed = 5;
        }
        if (this.shell <= 0) {
          // Revert to walking Koopa
          this.sprite = level.koopaSprite();
          this.hitbox = [2,8,12,24];
          if (this.left) {
            this.sprite.img = 'sprites/enemyr.png';
            this.vel[0] = 0.5;
            this.left = false;
          } else {
            this.vel[0] = -0.5;
            this.left = true;
          }
          this.pos[1] -= 16;
          this.shell = false;
        }
      } else {
        // Shell is stationary: do not decrement the timer
        this.sprite.speed = 0;
        this.sprite.setFrame(0);
      }
    }
    // Update horizontal position always
    this.pos[0] += this.vel[0];

    // If in shell mode and stationary, keep the shell grounded
    if (this.shell && this.vel[0] === 0) {
      this.acc[1] = 0;
      this.vel[1] = 0;
      // Align vertically to the tile grid
      this.pos[1] = Math.floor(this.pos[1] / 16) * 16;
    } else {
      this.acc[1] = 0.2;
      this.vel[1] += this.acc[1];
      this.pos[1] += this.vel[1];
    }

    this.sprite.update(dt);
  };

  Koopa.prototype.collideWall = function() {
    //This stops us from flipping twice on the same frame if we collide
    //with multiple wall tiles simultaneously.
    this.turn = true;
  };

  Koopa.prototype.checkCollisions = function() {
    var h = this.shell ? 1 : 2;
    if (this.pos[1] % 16 !== 0) {
      h += 1;
    }
    var w = this.pos[0] % 16 === 0 ? 1 : 2;

    var baseX = Math.floor(this.pos[0] / 16);
    var baseY = Math.floor(this.pos[1] / 16);

    if (baseY + h > 15) {
      delete level.enemies[this.idx];
      return;
    }

    if (this.flipping) {
      return;
    }

    for (var i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        if (level.statics[baseY + i][baseX + j]) {
          level.statics[baseY + i][baseX + j].isCollideWith(this);
        }
        if (level.blocks[baseY + i][baseX + j]) {
          level.blocks[baseY + i][baseX + j].isCollideWith(this);
        }
      }
    }
    var that = this;
    level.enemies.forEach(function(enemy){
      if (enemy === that) { //don't check collisions with ourselves.
        return;
      } else if (enemy.pos[0] - vX > 336){ //stop checking once we get to far away dudes.
        return;
      } else {
        that.isCollideWith(enemy);
      }
    });
    this.isCollideWith(player);
  };

  Koopa.prototype.isCollideWith = function(ent) {
    // Check if the hitboxes overlap; if not, no collision occurred.
    var hpos1 = [this.pos[0] + this.hitbox[0], this.pos[1] + this.hitbox[1]];
    var hpos2 = [ent.pos[0] + ent.hitbox[0], ent.pos[1] + ent.hitbox[1]];
    if (hpos1[0] > hpos2[0] + ent.hitbox[2] ||
        hpos1[0] + this.hitbox[2] < hpos2[0] ||
        hpos1[1] > hpos2[1] + ent.hitbox[3] ||
        hpos1[1] + this.hitbox[3] < hpos2[1]) {
      return;
    }
  
    // If colliding with Mario
    if (ent instanceof Mario.Player) {
      // If Mario is star-powered, destroy the shell like any enemy but don't count a kill
      if (ent.starTime > 0) {
        this.bump();
        return;
      }
  
      // Check if Mario is stomping (coming down from above)
      if (ent.vel[1] > 0 && (ent.pos[1] + ent.hitbox[1] + ent.hitbox[3]) <= (this.pos[1] + 16)) {
        // If Koopa is in shell mode and stationary, kick it based on Mario's acceleration
        if (this.shell && this.vel[0] === 0) {
          // Instead of stomping and counting enemy defeat, simply kick the shell.
          sounds.kick.play();
          var kickDirection = (ent.acc && ent.acc[0] !== 0) ? (ent.acc[0] > 0 ? 4 : -4) : (ent.left ? -4 : 4);
          this.vel[0] = kickDirection;
          ent.bounce = true;
          return;
        } else if (this.shell) {
          // Landing on a moving shell stops it
          this.vel[0] = 0; // Stop the shell
          sounds.bump.play();
          ent.bounce = true;
          return;
        } else {
          // Normal Koopa stomp behavior
          this.stomp();
          ent.bounce = true;
          if (ent.defeatEnemy) ent.defeatEnemy('koopa');
          return;
        }
      }
  
      // Side collisions
      if (this.shell && this.vel[0] === 0) {
        // Stationary shell: kick it based on Mario's acceleration
        sounds.kick.play();
        var kickDirection = (ent.acc && ent.acc[0] !== 0) ? (ent.acc[0] > 0 ? 4 : -4) : (ent.left ? -4 : 4);
        this.vel[0] = kickDirection;
        // Do not bounce Mario for side collisions
        return;
      } else if (this.shell && this.vel[0] !== 0) {
        // Moving shell: if not stomped, damage Mario
        ent.damage();
        return;
      } else {
        // Non-shell Koopa side collision: damage Mario
        ent.damage();
        return;
      }
    } else if (this.shell && (ent instanceof Mario.Goomba || (ent instanceof Mario.Koopa && ent !== this))) {
      if (this.vel[0] !== 0) {
        // Moving shell collides with enemy: defeat the enemy only once.
        // Check if the enemy is not already in a defeated state.
        if (!ent.flipping && !ent.dying) {
          ent.bump();
          if (player && player.defeatEnemy) {
            player.defeatEnemy(ent instanceof Mario.Goomba ? 'goomba' : 'koopa');
          }
        }
        return;
      } else {
        this.collideWall();
      }
    } else {
      this.collideWall();
    }
  };
  Koopa.prototype.stomp = function() {
    // If it's a paratroopa, disable its winged behavior
    if (this.para) {
      this.para = false;
    }
    
    sounds.stomp.play();
    
    // Convert this Koopa into a shell state
    this.shell = 360; // Start shell timer
    
    // Use a dedicated shell sprite if available, otherwise set the shell frame manually
    if (level.koopaShellSprite) {
      this.sprite = level.koopaShellSprite();
    } else {
      // Explicitly set the sprite frame to the shell image
      // (Assuming the shell frame is located at [64, 16] in the spritesheet)
      this.sprite.pos = [160, 16];
      this.sprite.size = [16, 16];
      this.sprite.speed = 0;
    }
    
    // Update the hitbox to match a shell
    this.hitbox = [2, 0, 12, 16];
    
    // Stop all movement
    this.vel = [0, 0];
    
    // Adjust the vertical position so the shell remains on the floor.
    // When Koopa is walking, its hitbox bottom (pos[1] + 32) aligns with the floor.
    // The shell's hitbox bottom is pos[1] + 16, so we add 16 to keep the floor alignment.
    this.pos[1] += 16;
    this.pos[1] = Math.floor(this.pos[1] / 16) * 16;
  };

  Koopa.prototype.bump = function() {
    sounds.kick.play();
    if (this.flipping) return;
    this.flipping = true;
    this.sprite.pos = [160, 0];
    this.sprite.size = [16,16];
    this.hitbox = [2, 0, 12, 16];
    this.sprite.speed = 0;
    this.vel[0] = 0;
    this.vel[1] = -2.5;
  };
})();

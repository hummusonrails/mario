(function() {
  if (typeof Mario === 'undefined')
    window.Mario = {};

  var Block = Mario.Block = function(options) {
    this.item = options.item;
    this.usedSprite = options.usedSprite;
    this.bounceSprite = options.bounceSprite;
    this.breakable = options.breakable;
    this.itemCount = options.itemCount || 0;
    this.cooldown = false;

    Mario.Entity.call(this, {
      pos: options.pos,
      sprite: options.sprite,
      hitbox: [0,0,16,16]
    });

    this.standing = true;
    this.originalPos = [...this.pos]; // Save original position for bouncing logic
  }

  Mario.Util.inherits(Block, Mario.Floor);

  Block.prototype.break = function() {
    sounds.breakBlock.play();
    (new Mario.Rubble()).spawn(this.pos);
    var x = this.pos[0] / 16, y = this.pos[1] / 16;
    delete level.blocks[y][x];
  }

  Block.prototype.bonk = function(power) {
    if (this.cooldown || !this.standing) return; // Prevent repeated bonks

    // If the block is breakable and empty, break it only if player is big
    if (this.breakable && this.itemCount === 0 && power > 0) {
        this.break();
        return;
    }
    if (this.sprite === this.usedSprite){
      return;
    }

    this.cooldown = true;
    sounds.bump.play();
    this.standing = false;
    
    // Handle item spawning
    if (this.item) {

        if (this.itemCount > 0){
        this.item.spawn();
        this.itemCount--;
        //console.log("there are " + this.itemCount + "items remaining");

        if (this.itemCount <= 0) {
            c//onsole.log("no more items");
            //this.item = null;
            this.sprite = this.usedSprite; // Change to used sprite
            console.log(this.sprite);
        }
      }
     else {

            this.sprite = this.usedSprite;
        }}
    
    if (this.sprite != this.usedSprite){
    // Bounce block up slightly
    this.pos[1] -= 4;
    setTimeout(() => this.pos[1] += 4, 100);
    }
  };

  Block.prototype.update = function(dt, gameTime) {
    if (!this.standing) {
      if (this.pos[1] < this.originalPos[1] - 4) {
        this.vel[1] = 2;
      }
      if (this.pos[1] >= this.originalPos[1]) {
        this.vel[1] = 0;
        this.pos = [...this.originalPos]; // Reset to original position
        if (this.osprite) {
          this.sprite = this.osprite;
        }
        this.standing = true;
        setTimeout(() => { this.cooldown = false; }, 200); // Reset cooldown
      }
    }

    this.pos[1] += this.vel[1];
    this.sprite.update(dt, gameTime);
  };

})();
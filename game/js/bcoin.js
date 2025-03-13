(function () {
  if (typeof Mario === 'undefined')
    window.Mario = {};

  var Bcoin = Mario.Bcoin = function (pos) {
    Mario.Entity.call(this, {
      pos: pos,
      sprite: level.bcoinSprite(),
      hitbox: [0, 0, 16, 16]
    });
    this.originalPosY = this.pos[1];
  }

  Mario.Util.inherits(Bcoin, Mario.Entity);

  Bcoin.prototype.spawn = function () {
    // Save original Y position
    //console.log("hello!");
    player.collectCoin();
    sounds.coin.currentTime = 0.05;
    sounds.coin.play();
    // Create a new coin instance at the same position
    let newCoin = new Bcoin([...this.pos]);
    newCoin.active = true;
    newCoin.vel = -12;
    newCoin.targetpos = newCoin.pos[1] - 32;

    // Add new coin to the level
    newCoin.idx = level.items.length;
    level.items.push(newCoin);

  }

  Bcoin.prototype.update = function (dt) {
    if (!this.active) return;

    if (this.vel > 0 && this.pos[1] >= this.targetpos) {
      //player.collectCoin();
      delete level.items[this.idx];
      this.pos[1] = this.originalPosY;
    }

    this.acc = 0.75;
    this.vel += this.acc;
    this.pos[1] += this.vel;
    this.sprite.update(dt);
  }

  Bcoin.prototype.checkCollisions = function () { ; }

})();

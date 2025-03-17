(function() {
  if (typeof Mario === 'undefined')
  window.Mario = {};
  
  var Coin = Mario.Coin = function(pos, sprite) {    
    Mario.Entity.call(this, {
      pos: pos,
      sprite: sprite,
      hitbox: [0,0,16,16]
    });
  }

  Mario.Util.inherits(Coin, Mario.Entity);

  Coin.prototype.update = function(dt) {
    this.sprite.update(dt);
    this.checkCollisions();
  }

  Coin.prototype.checkCollisions = function() {
    this.isPlayerCollided();
  }

  Coin.prototype.isPlayerCollided = function() {
    var hpos1 = [this.pos[0] + this.hitbox[0], this.pos[1] + this.hitbox[1]];
    var hpos2 = [player.pos[0] + player.hitbox[0], player.pos[1] + player.hitbox[1]];

    if (!(hpos1[0] > hpos2[0]+player.hitbox[2] || (hpos1[0]+this.hitbox[2] < hpos2[0]))) {
      if (!(hpos1[1] > hpos2[1]+player.hitbox[3] || (hpos1[1]+this.hitbox[3] < hpos2[1]))) {
        this.collect();
      }
    }
  }

  Coin.prototype.collect = function() {
    if (player) {
      player.collectCoin();
      const updateIdx = updateables.indexOf(this);
      if (updateIdx > -1) {
        updateables.splice(updateIdx, 1);
      }
      const itemIdx = level.items.indexOf(this);
      if (itemIdx > -1) {
        level.items.splice(itemIdx, 1);
      }
    }
  }
})();

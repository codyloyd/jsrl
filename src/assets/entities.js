import Colors from "./colors";
import Entity from "./entity";

const Movable = {
  name: "Movable",
  tryMove: function(x, y, map) {
    const tile = map.getTile(x, y);
    const target = map.getEntityAt(x, y);
    if (target) {
      if (this.hasMixin("Attacker")) {
        this.attack(target);
        return true;
      } else {
        return false;
      }
    }
    if (tile.isWalkable()) {
      this._x = x;
      this._y = y;
      return true;
    } else if (tile.isDiggable()) {
      map.dig(x, y);
      return true;
    }
    return false;
  }
};

const PlayerActor = {
  name: "PlayerActor",
  groupName: "Actor",
  act: function() {
    this._screen.render(this._game.getDisplay(), this._game);
    this.getMap()
      .getEngine()
      .lock();
  }
};

const FungusActor = {
  name: "FungusActor",
  groupName: "Actor",
  init: function() {
    this._growthsRemaining = 5;
  },
  act: function() {
    if (this._growthsRemaining > 0) {
      if (Math.random() <= 0.1) {
        const xOffset = Math.floor(Math.random() * 3) - 1;
        const yOffset = Math.floor(Math.random() * 3) - 1;
        if (xOffset != 0 || yOffset != 0) {
          if (
            this.getMap().isEmptyFloor(
              this.getX() + xOffset,
              this.getY() + yOffset
            )
          ) {
            const entity = new Entity(FungusTemplate);
            entity.setX(this.getX() + xOffset);
            entity.setY(this.getY() + yOffset);
            this.getMap().addEntity(entity);
            this._growthsRemaining--;
          }
        }
      }
    }
  }
};

const Destructable = {
  name: "Destructable",
  init: function() {
    this._hp = 1;
  },
  takeDamage: function(attacker, damage) {
    this._hp -= damage;
    if (this._hp <= 0) {
      this.getMap().removeEntity(this);
    }
  }
};

const SimpleAttacker = {
  name: "SimpleAttacker",
  groupName: "Attacker",
  attack: function(target) {
    if (target.hasMixin("Destructable")) {
      target.takeDamage(this, 1);
    }
  }
};

const PlayerTemplate = {
  char: "@",
  fg: Colors.white,
  bg: Colors.black,
  mixins: [Movable, PlayerActor, Destructable, SimpleAttacker]
};

const FungusTemplate = {
  char: "F",
  fg: Colors.green,
  mixins: [FungusActor, Destructable]
};

export { PlayerTemplate, FungusTemplate };

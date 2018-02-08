import DynamicGlyph from "./dynamicGlyph";
import { stairsUpTile, stairsDownTile } from "./tile";
import { sendMessage } from "./helpers";

const Entity = function({
  x = 0,
  y = 0,
  z = 0,
  game = null,
  screen = null,
  speed = 1000
}) {
  const dynamicGlyph = DynamicGlyph(...arguments);
  let map = null;
  let alive = true;

  const publicFunctions = {
    setSpeed: function(newSpeed) {
      speed = newSpeed;
    },
    getSpeed: function() {
      return speed;
    },
    tryMove: function(x, y, z) {
      const map = this.getMap();
      const tile = map.getTile(x, y, this.getZ());
      const target = map.getEntityAt(x, y, this.getZ());
      if (z < this.getZ()) {
        if (tile != stairsUpTile) {
          sendMessage(this, "You can't go up here");
        } else {
          sendMessage(this, `You ascend to level ${z + 1}`);
          this.setPosition(x, y, z);
        }
      }
      if (z > this.getZ()) {
        if (tile != stairsDownTile) {
          sendMessage(this, "You can't go down here");
        } else {
          sendMessage(this, `You descend to level ${z + 1}`);
          this.setPosition(x, y, z);
        }
      }
      if (target) {
        if (
          this.hasMixin("Attacker") &&
          this !== target &&
          (this.hasMixin("PlayerActor") || target.hasMixin("PlayerActor"))
        ) {
          this.attack(target);
          return true;
        } else {
          return false;
        }
      }
      if (tile.isWalkable()) {
        this.setPosition(x, y, z);
        const items = this.getMap().getItemsAt(x, y, z);
        if (items) {
          if (items.length === 1) {
            sendMessage(this, `You see ${items[0].describeA()}`);
          } else {
            sendMessage(this, "There are several items here.");
          }
        }
        return true;
      }
      return false;
    },

    getGame: function() {
      return game;
    },

    setMap: function(newMap) {
      map = newMap;
    },

    getMap: function() {
      return map;
    },

    setName: function(newName) {
      name = newName;
    },

    setX: function(newX) {
      x = newX;
    },

    setY: function(newY) {
      y = newY;
    },

    setZ: function(newZ) {
      z = newZ;
    },

    getName: function() {
      return name;
    },

    getX: function() {
      return x;
    },

    getY: function() {
      return y;
    },

    getZ: function() {
      return z;
    },

    isEntity: true,

    setPosition: function(newX, newY, newZ) {
      const oldX = x;
      const oldY = y;
      const oldZ = z;
      x = newX;
      y = newY;
      z = newZ;
      if (map) {
        map.updateEntityPosition(this, oldX, oldY, oldZ);
      }
    },

    getScreen: function() {
      return screen;
    },

    isAlive: function() {
      return alive;
    },

    kill: function(message) {
      if (!alive) {
        return;
      }
      alive = false;
      sendMessage(this, message ? message : "You have died!");

      if (this.hasMixin("PlayerActor")) {
        this.act();
      } else {
        this.getMap().removeEntity(this);
      }
    }
  };
  return Object.assign(publicFunctions, dynamicGlyph);
};

export default Entity;

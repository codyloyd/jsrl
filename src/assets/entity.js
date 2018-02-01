import Glyph from "./glyph";
import { stairsUpTile, stairsDownTile } from "./tile";
import { sendMessage } from "./helpers";

const Entity = function({
  name = "",
  x = 0,
  y = 0,
  z = 0,
  game = null,
  screen = null,
  mixins = []
}) {
  const glyph = Glyph(...arguments);
  let map = null;
  const attachedMixins = {};
  const attachedMixinGroups = {};

  const mixinObject = {};
  mixins.forEach(mixinFactory => {
    const mixin = mixinFactory(...arguments);

    attachedMixins[mixin.name] = true;
    delete mixin.name;
    if (mixin.groupName) {
      attachedMixinGroups[mixin.groupName] = true;
      delete mixin.groupName;
    }
    Object.assign(mixinObject, mixin);
  });

  const tryMove = function(x, y, z) {
    const map = this.getMap();
    const tile = map.getTile(x, y, getZ());
    const target = map.getEntityAt(x, y, getZ());
    if (z < getZ()) {
      if (tile != stairsUpTile) {
        sendMessage(this, "You can't go up here");
      } else {
        sendMessage(this, `You ascend to level ${z + 1}`);
        this.setPosition(x, y, z);
      }
    }
    if (z > getZ()) {
      if (tile != stairsDownTile) {
        sendMessage(this, "You can't go down here");
      } else {
        sendMessage(this, `You descend to level ${z + 1}`);
        this.setPosition(x, y, z);
      }
    }
    if (target) {
      if (
        hasMixin("Attacker") &&
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
    } else if (tile.isDiggable() && this.hasMixin("PlayerActor")) {
      map.dig(x, y, z);
      return true;
    }
    return false;
  };

  const hasMixin = function(mixin) {
    return attachedMixins[mixin] || attachedMixinGroups[mixin];
  };

  const getGame = function() {
    return game;
  };

  const setMap = function(newMap) {
    map = newMap;
  };

  const getMap = function() {
    return map;
  };

  const getGlyph = function() {
    return glyph;
  };

  const setName = function(newName) {
    name = newName;
  };

  const setX = function(newX) {
    x = newX;
  };

  const setY = function(newY) {
    y = newY;
  };

  const setZ = function(newZ) {
    z = newZ;
  };

  const getName = function() {
    return name;
  };

  const getX = function() {
    return x;
  };

  const getY = function() {
    return y;
  };

  const getZ = function() {
    return z;
  };

  const setPosition = function(newX, newY, newZ) {
    const oldX = x;
    const oldY = y;
    const oldZ = z;
    x = newX;
    y = newY;
    z = newZ;
    if (map) {
      map.updateEntityPosition(this, oldX, oldY, oldZ);
    }
  };

  const getScreen = function() {
    return screen;
  };
  return Object.assign(
    {
      getX,
      getY,
      getZ,
      setX,
      setY,
      setZ,
      setPosition,
      getName,
      setName,
      tryMove,
      getGlyph,
      setMap,
      getMap,
      getGame,
      hasMixin,
      getScreen
    },
    mixinObject
  );
};

export default Entity;

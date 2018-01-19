import Glyph from "./glyph";

const Entity = function(properties) {
  this._glyph = new Glyph(properties);
  this._name = properties.name || "";
  this._x = properties.x || 0;
  this._y = properties.y || 0;
  this._map = null;
  this._game = properties.game || null;
  this._attachedMixins = {};
  this._attachedMixinGroups = {};
  this._screen = properties.screen || null;

  const mixins = properties.mixins || [];
  mixins.forEach(mixin => {
    for (let key in mixin) {
      if (key != "init" && key != "name" && !this.hasOwnProperty(key)) {
        this[key] = mixin[key];
      }
    }
    this._attachedMixins[mixin.name] = true;
    if (mixin.groupName) {
      this._attachedMixinGroups[mixin.groupName] = true;
    }
    if (mixin.init) {
      mixin.init.call(this, properties);
    }
  });
};

Entity.prototype.hasMixin = function(obj) {
  if (typeof obj == "object") {
    return this._attachedMixins[obj.name];
  } else {
    return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
  }
};

Entity.prototype.getGame = function() {
  return this._game;
};

Entity.prototype.setMap = function(map) {
  this._map = map;
};

Entity.prototype.getMap = function() {
  return this._map;
};

Entity.prototype.getGlyph = function() {
  return this._glyph;
};

Entity.prototype.setName = function(name) {
  this._name = name;
};

Entity.prototype.setX = function(x) {
  this._x = x;
};

Entity.prototype.setY = function(y) {
  this._y = y;
};

Entity.prototype.getName = function() {
  return this._name;
};

Entity.prototype.getX = function() {
  return this._x;
};

Entity.prototype.getY = function() {
  return this._y;
};

export default Entity;

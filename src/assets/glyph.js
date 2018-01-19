import Colors from "./colors";

const Glyph = function(properties = {}) {
  this._char = properties.char || " ";
  this._fg = properties.fg || Colors.white;
  this._bg = properties.bg || Colors.black;
};

Glyph.prototype.getChar = function() {
  return this._char;
};

Glyph.prototype.getBg = function() {
  return this._bg;
};

Glyph.prototype.getFg = function() {
  return this._fg;
};

export default Glyph;

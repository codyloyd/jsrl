const Glyph = function(char, fg, bg) {
  this._char = char || " ";
  this._fg = fg || "white";
  this._bg = bg || "black";
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

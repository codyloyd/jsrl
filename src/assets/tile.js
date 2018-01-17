import Glyph from "./glyph";

const Tile = function(glyph) {
  this._glyph = glyph;
};

Tile.prototype.getGlyph = function() {
  return this._glyph;
};

const nullTile = new Tile(new Glyph());
const floorTile = new Tile(new Glyph("."));
const wallTile = new Tile(new Glyph("#", "goldenrod"));

export { nullTile, floorTile, wallTile };

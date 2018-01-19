import Glyph from "./glyph";
import Colors from "./colors";

const Tile = function({
  char,
  fg,
  bg,
  isDiggable = false,
  isWalkable = false
}) {
  this._glyph = new Glyph({ char, fg, bg });
  this._isWalkable = isWalkable;
  this._isDiggable = isDiggable;
};

Tile.prototype.getGlyph = function() {
  return this._glyph;
};

Tile.prototype.isWalkable = function() {
  return this._isWalkable;
};

Tile.prototype.isDiggable = function() {
  return this._isDiggable;
};

const nullTile = new Tile({});
const floorTile = new Tile({
  char: ".",
  fg: Colors.darkGray,
  isWalkable: true
});
const wallTile = new Tile({ char: "#", fg: Colors.brown, isDiggable: true });

export { nullTile, floorTile, wallTile };

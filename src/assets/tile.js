import Glyph from "./glyph";
import Colors from "./colors";

const Tile = function({
  char,
  fg,
  bg,
  isDiggable = false,
  isWalkable = false,
  blocksLight = true
}) {
  this._glyph = new Glyph({ char, fg, bg });
  this._isWalkable = isWalkable;
  this._isDiggable = isDiggable;
  this._blocksLight = blocksLight;
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

Tile.prototype.isBlockingLight = function() {
  return this._blocksLight;
};

const nullTile = new Tile({});
const floorTile = new Tile({
  char: ".",
  fg: Colors.darkGray,
  isWalkable: true,
  blocksLight: false
});
const wallTile = new Tile({
  char: "#",
  fg: Colors.brown,
  isDiggable: true,
  isWalkable: false,
  blocksLight: true
});
const stairsUpTile = new Tile({
  char: "<",
  fg: Colors.lightGray,
  isWalkable: true,
  blocksLight: false
});
const stairsDownTile = new Tile({
  char: ">",
  fg: Colors.lightGray,
  isWalkable: true,
  blocksLight: false
});

export { nullTile, floorTile, wallTile, stairsUpTile, stairsDownTile };

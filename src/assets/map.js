import { nullTile, wallTile, floorTile } from "./tile";

const GameMap = function(tiles) {
  this._tiles = tiles;
  this._width = tiles.length;
  this._height = tiles[0].length;
};

GameMap.prototype.getWidth = function() {
  return this._width;
};
GameMap.prototype.getHeight = function() {
  return this._height;
};

GameMap.prototype.getTile = function(x, y) {
  if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
    return nullTile;
  } else {
    return this._tiles[x][y] || nullTile;
  }
};

export default GameMap;

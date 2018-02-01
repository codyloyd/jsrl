import ROT from "rot-js";
import { getNeighborPositions } from "./helpers";
import { floorTile, wallTile, stairsUpTile, stairsDownTile } from "./tile";

const Builder = function(width, height, depth) {
  this._width = width;
  this._height = height;
  this._depth = depth;
  this._tiles = new Array(depth);
  this._regions = new Array(depth);

  for (let z = 0; z < depth; z++) {
    this._tiles[z] = this._generateLevel();
    this._regions[z] = new Array(width);
    for (let x = 0; x < width; x++) {
      this._regions[z][x] = new Array(height);
      for (let y = 0; y < height; y++) {
        this._regions[z][x][y] = 0;
      }
    }
  }
  for (let z = 0; z < this._depth; z++) {
    this._setupRegions(z);
  }
  this._connectAllRegions();
};

Builder.prototype.getTiles = function() {
  return this._tiles;
};

Builder.prototype.getDepth = function() {
  return this._depth;
};

Builder.prototype.getWidth = function() {
  return this._width;
};

Builder.prototype.getHeight = function() {
  return this._height;
};

Builder.prototype._generateLevel = function() {
  const map = new Array(this._width);
  for (let w = 0; w < this._width; w++) {
    map[w] = new Array(this._height);
  }

  const generator = new ROT.Map.Cellular(this._width, this._height);
  generator.randomize(0.5);

  const totalIterations = 8;
  for (let i = 0; i < totalIterations - 1; i++) {
    generator.create();
  }
  generator.create(function(x, y, v) {
    if (v === 1) {
      map[x][y] = floorTile;
    } else {
      map[x][y] = wallTile;
    }
  });
  return map;
};

Builder.prototype._canFillRegion = function(x, y, z) {
  if (
    x < 0 ||
    y < 0 ||
    z < 0 ||
    x >= this._width ||
    y >= this._height ||
    z >= this._depth
  ) {
    return false;
  }
  if (this._regions[z][x][y] != 0) {
    return false;
  }
  return this._tiles[z][x][y].isWalkable();
};

Builder.prototype._fillRegion = function(region, x, y, z) {
  let tilesFilled = 1;
  let tiles = [{ x, y }];
  let tile;
  let neighbors;
  this._regions[z][x][y] = region;
  while (tiles.length > 0) {
    tile = tiles.pop();
    neighbors = getNeighborPositions(tile.x, tile.y);
    while (neighbors.length > 0) {
      tile = neighbors.pop();
      const walkable = this._canFillRegion(tile.x, tile.y, z);
      if (this._canFillRegion(tile.x, tile.y, z)) {
        this._regions[z][tile.x][tile.y] = region;
        tiles.push(tile);
        tilesFilled++;
      }
    }
  }
  return tilesFilled;
};

Builder.prototype._removeRegion = function(region, z) {
  for (let x = 0; x < this._width; x++) {
    for (let y = 0; y < this._height; y++) {
      if (this._regions[z][x][y] == region) {
        this._regions[z][x][y] = 0;
        this._tiles[z][x][y] == wallTile;
      }
    }
  }
};

Builder.prototype._setupRegions = function(z) {
  let region = 1;
  let tilesFilled;
  for (let x = 0; x < this._width; x++) {
    for (let y = 0; y < this._height; y++) {
      if (this._canFillRegion(x, y, z)) {
        tilesFilled = this._fillRegion(region, x, y, z);
        if (tilesFilled <= 20) {
          this._removeRegion(region, z);
        } else {
          region++;
        }
      }
    }
  }
};

Builder.prototype._findRegionOverlaps = function(z, r1, r2) {
  var matches = [];
  for (let x = 0; x < this._width; x++) {
    for (let y = 0; y < this._height; y++) {
      if (
        this._tiles[z][x][y] == floorTile &&
        this._tiles[z + 1][x][y] == floorTile &&
        this._regions[z][x][y] == r1 &&
        this._regions[z + 1][x][y] == r2
      )
        matches.push({ x, y });
    }
  }
  return matches.randomize();
};

Builder.prototype._connectRegions = function(z, r1, r2) {
  const overlap = this._findRegionOverlaps(z, r1, r2);
  if (overlap.length == 0) {
    return false;
  }
  const point = overlap[0];
  this._tiles[z][point.x][point.y] = stairsDownTile;
  this._tiles[z + 1][point.x][point.y] = stairsUpTile;
  return true;
};

Builder.prototype._connectAllRegions = function() {
  for (let z = 0; z < this._depth - 1; z++) {
    var connected = {};
    var key;
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        key = this._regions[z][x][y] + "," + this._regions[z + 1][x][y];
        if (
          this._tiles[z][x][y] == floorTile &&
          this._tiles[z + 1][x][y] == floorTile &&
          !connected[key]
        ) {
          this._connectRegions(
            z,
            this._regions[z][x][y],
            this._regions[z + 1][x][y]
          );
          connected[key] = true;
        }
      }
    }
  }
};

export default Builder;

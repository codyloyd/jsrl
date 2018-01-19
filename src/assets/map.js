import { nullTile, wallTile, floorTile } from "./tile";
import Entity from "./entity";
import { FungusTemplate } from "./entities";
import ROT from "rot-js";

const GameMap = function(tiles, player) {
  this._tiles = tiles;
  this._width = tiles.length;
  this._height = tiles[0].length;
  this._entities = [];
  this._scheduler = new ROT.Scheduler.Simple();
  this._engine = new ROT.Engine(this._scheduler);
  this.addEntityAtRandomPosition(player);
  for (let i = 0; i < 20; i++) {
    this.addEntityAtRandomPosition(new Entity(FungusTemplate));
  }
};

GameMap.prototype.getWidth = function() {
  return this._width;
};
GameMap.prototype.getHeight = function() {
  return this._height;
};

GameMap.prototype.getEngine = function() {
  return this._engine;
};

GameMap.prototype.getEntities = function() {
  return this._entities;
};

GameMap.prototype.getEntityAt = function(x, y) {
  for (let i = 0; i < this._entities.length; i++) {
    const entity = this._entities[i];
    if (entity.getX() == x && entity.getY() == y) {
      return entity;
    }
  }
  return false;
};

GameMap.prototype.addEntity = function(entity) {
  if (
    entity.getX() < 0 ||
    entity.getX() >= this._width ||
    entity.getY() < 0 ||
    entity.getY() >= this._height
  ) {
    throw new Error("Adding entity out of bounds.");
  }
  entity.setMap(this);
  this._entities.push(entity);
  if (entity.hasMixin("Actor")) {
    this._scheduler.add(entity, true);
  }
};

GameMap.prototype.removeEntity = function(entityToRemove) {
  for (let i = 0; i < this._entities.length; i++) {
    const entity = this._entities[i];
    if (entityToRemove == entity) {
      this._entities.splice(i, 1);
      break;
    }
  }
  if (entityToRemove.hasMixin("Actor")) {
    this._scheduler.remove(entityToRemove);
  }
};

GameMap.prototype.addEntityAtRandomPosition = function(entity) {
  const position = this.getRandomFloorPosition();
  entity.setX(position.x);
  entity.setY(position.y);
  this.addEntity(entity);
};

GameMap.prototype.getTile = function(x, y) {
  if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
    return nullTile;
  } else {
    return this._tiles[x][y] || nullTile;
  }
};

GameMap.prototype.isEmptyFloor = function(x, y) {
  return this.getTile(x, y) == floorTile && !this.getEntityAt(x, y);
};

GameMap.prototype.dig = function(x, y) {
  if (this.getTile(x, y).isDiggable()) {
    this._tiles[x][y] = floorTile;
  }
};

GameMap.prototype.getRandomFloorPosition = function() {
  let x = Math.floor(Math.random() * this._width);
  let y = Math.floor(Math.random() * this._height);
  return this.isEmptyFloor(x, y) ? { x, y } : this.getRandomFloorPosition();
};

export default GameMap;

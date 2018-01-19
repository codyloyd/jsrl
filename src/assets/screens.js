import ROT from "rot-js";
import GameMap from "./map";
import Colors from "./colors";
import Entity from "./entity";
import { PlayerTemplate } from "./entities";
import { nullTile, wallTile, floorTile } from "./tile";

const startScreen = {
  enter: function() {
    console.log("entered start screen");
  },
  exit: function() {
    console.log("exited start screen");
  },
  render: function(display) {
    display.drawText(1, 1, "%c{" + Colors.blue + "}JavaScript RogueLike");
    display.drawText(1, 2, "Press [ENTER] to start");
  },
  handleInput: function(inputType, inputData, Game) {
    if (inputType === "keydown") {
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(playScreen);
      }
    }
  }
};

const playScreen = {
  _map: null,
  _player: null,

  move: function(dX, dY) {
    const newX = this._player.getX() + dX;
    const newY = this._player.getY() + dY;
    this._player.tryMove(newX, newY, this._map);
  },

  enter: function(game) {
    console.log("entered play screen");
    const map = [];
    const mapWidth = 100;
    const mapHeight = 48;
    for (let x = 0; x < mapWidth; x++) {
      map.push([]);
      for (let y = 0; y < mapHeight; y++) {
        map[x].push(nullTile);
      }
    }
    const generator = new ROT.Map.Cellular(mapWidth, mapHeight);
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
    this._player = new Entity(
      Object.assign(PlayerTemplate, { screen: this, game })
    );
    this._map = new GameMap(map, this._player);
    this._map.getEngine().start();
  },
  exit: function() {
    console.log("exited play screen");
  },
  render: function(display, game) {
    const screenWidth = game.getScreenWidth();
    const screenHeight = game.getScreenHeight();
    var topLeftX = Math.max(0, this._player.getX() - screenWidth / 2);
    topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
    var topLeftY = Math.max(0, this._player.getY() - screenHeight / 2);
    topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

    for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
      for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
        const glyph = this._map.getTile(x, y).getGlyph();
        display.draw(
          x - topLeftX,
          y - topLeftY,
          glyph.getChar(),
          glyph.getFg(),
          glyph.getBg()
        );
      }
    }
    display.draw(
      this._player.getX() - topLeftX,
      this._player.getY() - topLeftY,
      this._player.getGlyph().getChar(),
      this._player.getGlyph().getFg(),
      this._player.getGlyph().getBg()
    );
    var entities = this._map.getEntities();
    entities.forEach(entity => {
      if (
        entity.getX() >= topLeftX &&
        entity.getY() >= topLeftY &&
        entity.getX() < topLeftX + screenWidth &&
        entity.getY() < topLeftY + screenHeight
      ) {
        display.draw(
          entity.getX() - topLeftX,
          entity.getY() - topLeftY,
          entity.getGlyph().getChar(),
          entity.getGlyph().getFg(),
          entity.getGlyph().getBg()
        );
      }
    });
  },
  handleInput: function(inputType, inputData, Game) {
    if (inputType === "keydown") {
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(winScreen);
      } else if (inputData.keyCode === ROT.VK_ESCAPE) {
        Game.switchScreen(loseScreen);
      }
      //movement
      if (inputData.keyCode === ROT.VK_H) {
        this.move(-1, 0);
      } else if (inputData.keyCode === ROT.VK_L) {
        this.move(1, 0);
      } else if (inputData.keyCode === ROT.VK_K) {
        this.move(0, -1);
      } else if (inputData.keyCode === ROT.VK_J) {
        this.move(0, 1);
      }
      this._map.getEngine().unlock();
    }
  }
};

const winScreen = {
  enter: function() {
    console.log("Entered win screen.");
  },
  exit: function() {
    console.log("Exited win screen.");
  },
  render: function(display) {
    for (var i = 0; i < 22; i++) {
      var r = Math.round(Math.random() * 255);
      var g = Math.round(Math.random() * 255);
      var b = Math.round(Math.random() * 255);
      var background = ROT.Color.toRGB([r, g, b]);
      display.drawText(2, i + 1, "%b{" + background + "}You win!");
    }
  },
  handleInput: function(inputType, inputData) {
    // Nothing to do here
  }
};

const loseScreen = {
  enter: function() {
    console.log("Entered lose screen.");
  },
  exit: function() {
    console.log("Exited lose screen.");
  },
  render: function(display) {
    for (var i = 0; i < 22; i++) {
      display.drawText(2, i + 1, "%b{red}You lose! :(");
    }
  },
  handleInput: function(inputType, inputData) {
    // Nothing to do here
  }
};

export default { startScreen };

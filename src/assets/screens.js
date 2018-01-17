import ROT from "rot-js";
import GameMap from "./map";
import { nullTile, wallTile, floorTile } from "./tile";

const startScreen = {
  enter: function() {
    console.log("entered start screen");
  },
  exit: function() {
    console.log("exited start screen");
  },
  render: function(display) {
    display.drawText(1, 1, "%c{yellow}JavaScript RogueLike");
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
  enter: function() {
    console.log("entered play screen");
    const map = [];
    for (let x = 0; x < 80; x++) {
      map.push([]);
      for (let y = 0; y < 24; y++) {
        map[x].push(nullTile);
      }
    }
    const generator = new ROT.Map.Cellular(80, 24);
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
    this._map = new GameMap(map);
  },
  exit: function() {
    console.log("exited play screen");
  },
  render: function(display) {
    for (let x = 0; x < this._map.getWidth(); x++) {
      for (let y = 0; y < this._map.getHeight(); y++) {
        const glyph = this._map.getTile(x, y).getGlyph();
        display.draw(x, y, glyph.getChar(), glyph.getFg(), glyph.getBg());
      }
    }
  },
  handleInput: function(inputType, inputData, Game) {
    if (inputType === "keydown") {
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(winScreen);
      } else if (inputData.keyCode === ROT.VK_ESCAPE) {
        Game.switchScreen(loseScreen);
      }
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

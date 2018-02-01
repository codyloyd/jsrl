import ROT from "rot-js";
import Game from "./game";
import GameMap from "./map";
import Colors from "./colors";
import Entity from "./entity";
import Builder from "./builder";
import { sendMessage } from "./helpers";
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
  handleInput: function(inputType, inputData) {
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
  _gameEnded: false,
  _subScreen: null,

  setSubScreen: function(subScreen) {
    this._subScreen = subScreen;
    Game.refresh();
  },

  setGameEnded: function(gameEnded) {
    this._gameEnded = gameEnded;
  },
  move: function(dX, dY, dZ) {
    const newX = this._player.getX() + dX;
    const newY = this._player.getY() + dY;
    const newZ = this._player.getZ() + dZ;
    this._player.tryMove(newX, newY, newZ, this._map);
  },

  enter: function(game) {
    console.log("entered play screen");
    const width = 100;
    const height = 48;
    const depth = 6;
    const tiles = new Builder(width, height, depth).getTiles();
    this._player = new Entity(
      Object.assign(PlayerTemplate, { screen: this, game })
    );
    this._map = new GameMap(tiles, this._player);
    this._player.setMap(this._map);
    console.log(this._player.getMap().getEngine());
    this._map.getEngine().start();
  },
  exit: function() {
    console.log("exited play screen");
  },
  render: function(display) {
    if (this._subScreen) {
      this._subScreen.render(display);
      return;
    }
    const screenWidth = Game.getScreenWidth();
    const screenHeight = Game.getScreenHeight();
    var topLeftX = Math.max(0, this._player.getX() - screenWidth / 2);
    topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
    var topLeftY = Math.max(0, this._player.getY() - screenHeight / 2);
    topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
    display.clear();

    const visibleCells = [];
    const currentDepth = this._player.getZ();
    const map = this._map;
    map
      .getFov(currentDepth)
      .compute(
        this._player.getX(),
        this._player.getY(),
        this._player.getSightRadius(),
        function(x, y, radius, visibility) {
          visibleCells[x + `,` + y] = true;
          map.setExplored(x, y, currentDepth, true);
        }
      );
    for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
      for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
        if (map.isExplored(x, y, currentDepth)) {
          let glyph = this._map.getTile(x, y, this._player.getZ()).getGlyph();
          let fg = Colors.darkBlue;
          if (visibleCells[x + "," + y]) {
            const items = map.getItemsAt(x, y, currentDepth);
            if (items) {
              glyph = items[items.length - 1];
            }
            if (map.getEntityAt(x, y, currentDepth)) {
              glyph = map.getEntityAt(x, y, currentDepth).getGlyph();
            }
            fg = glyph.getFg();
          }
          display.draw(
            x - topLeftX,
            y - topLeftY,
            glyph.getChar(),
            fg,
            glyph.getBg()
          );
        }
      }
    }
    display.draw(
      this._player.getX() - topLeftX,
      this._player.getY() - topLeftY,
      this._player.getGlyph().getChar(),
      this._player.getGlyph().getFg(),
      this._player.getGlyph().getBg()
    );
    let messageY = 0;
    this._player.getMessages().forEach(message => {
      messageY += display.drawText(
        0,
        messageY,
        `%c{${Colors.white}}%b{${Colors.black}}${message}`
      );
    });
    const stats = `%c{${Colors.white}}%b{${Colors.black}}HP: ${this._player.getHp()}/${this._player.getMaxHp()}`;
    display.drawText(0, screenHeight, stats);
  },
  handleInput: function(inputType, inputData) {
    if (this._subScreen) {
      this._subScreen.handleInput(inputType, inputData);
      return;
    }
    if (inputType === "keydown") {
      if (inputData.keyCode === ROT.VK_RETURN) {
        if (this._gameEnded) {
          Game.switchScreen(loseScreen);
        }
      }
      //movement
      if (inputData.keyCode === ROT.VK_H) {
        this.move(-1, 0, 0);
      } else if (inputData.keyCode === ROT.VK_L) {
        this.move(1, 0, 0);
      } else if (inputData.keyCode === ROT.VK_K) {
        this.move(0, -1, 0);
      } else if (inputData.keyCode === ROT.VK_J) {
        this.move(0, 1, 0);
      } else if (inputData.keyCode === ROT.VK_Y) {
        this.move(-1, -1, 0);
      } else if (inputData.keyCode === ROT.VK_U) {
        this.move(1, -1, 0);
      } else if (inputData.keyCode === ROT.VK_B) {
        this.move(-1, 1, 0);
      } else if (inputData.keyCode === ROT.VK_N) {
        this.move(1, 1, 0);
      } else if (inputData.keyCode === ROT.VK_I) {
        if (this._player.getItems().filter(x => x).length === 0) {
          sendMessage(this._player, "You are not carrying anything!");
          Game.refresh();
        } else {
          inventoryScreen.setup(this._player, this._player.getItems());
          this.setSubScreen(inventoryScreen);
        }
        return;
      } else if (inputData.keyCode === ROT.VK_D) {
        if (this._player.getItems().filter(x => x).length === 0) {
          sendMessage(this._player, "You don't have anything to drop!");
          Game.refresh();
        } else {
          dropScreen.setup(this._player, this._player.getItems());
          this.setSubScreen(dropScreen);
        }
      } else if (inputData.keyCode === ROT.VK_COMMA) {
        const items = this._map.getItemsAt(
          this._player.getX(),
          this._player.getY(),
          this._player.getZ(),
          true
        );
        if (!items) {
          sendMessage(this._player, "There isn't anything to pick up here!");
        } else if (items.length === 1) {
          const item = items[0];
          if (this._player.pickUpItems([0])) {
            sendMessage(this._player, `You pick up ${item.describeA()}`);
          } else {
            sendMessage(
              this._player,
              "Your inventory was full! nothing was picked up."
            );
          }
        } else {
          pickUpScreen.setup(this._player, items);
          this.setSubScreen(pickUpScreen);
          return;
        }

        Game.refresh();
      } else {
        return;
      }
      this._map.getEngine().unlock();
    } else if (inputType === "keypress") {
      const keyChar = String.fromCharCode(inputData.charCode);
      if (keyChar === ">") {
        this.move(0, 0, 1);
      } else if (keyChar === "<") {
        this.move(0, 0, -1);
      } else {
        return;
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

const ItemListScreen = function({ caption, ok, canSelect, canSelectMultiple }) {
  this._caption = caption;
  this._okFunction = ok;
  this._canSelectItem = canSelect;
  this._canSelectMultipleItems = canSelectMultiple;

  this.setup = function(player, items) {
    this._player = player;
    this._items = items;
    this._selectedIndices = {};
  };

  this.render = function(display) {
    const letters = `abcdefghijklmnopqrstuvwxyz`;
    display.drawText(0, 0, this._caption);
    let row = 0;
    this._items.forEach((item, i) => {
      const letter = letters.substring(i, i + 1);
      const selectionState =
        this._canSelectItem &&
        this._canSelectMultipleItems &&
        this._selectedIndices[i]
          ? `+`
          : `-`;
      display.drawText(
        0,
        2 + i,
        `${letter} ${selectionState} ${item.describe()}`
      );
    });
  };
  this.executeOkFunction = function() {
    let selectedItems = {};
    for (let key in this._selectedIndices) {
      selectedItems[key] = this._items[key];
    }
    playScreen.setSubScreen(undefined);
    if (this._okFunction(selectedItems)) {
      this._player
        .getMap()
        .getEngine()
        .unlock();
    }
  };
  this.handleInput = function(inputType, inputData) {
    if (inputType === "keydown") {
      if (
        inputData.keyCode === ROT.VK_ESCAPE ||
        (inputData.keyCode === ROT.VK_RETURN &&
          (!this._canSelectItem ||
            Object.keys(this._selectedIndices).length === 0))
      ) {
        playScreen.setSubScreen(undefined);
      } else if (inputData.keyCode === ROT.VK_RETURN) {
        this.executeOkFunction();
      } else if (
        this._canSelectItem &&
        inputData.keyCode >= ROT.VK_A &&
        inputData.keyCode <= ROT.VK_Z
      ) {
        let index = inputData.keyCode - ROT.VK_A;
        if (this._items[index]) {
          if (this._canSelectMultipleItems) {
            if (this._selectedIndices[index]) {
              delete this._selectedIndices[index];
            } else {
              this._selectedIndices[index] = true;
            }
            Game.refresh();
          } else {
            this._selectedIndices[index] = true;
            this.executeOkFunction();
          }
        }
      }
    }
  };
};

const inventoryScreen = new ItemListScreen({
  caption: "Inventory",
  canSelect: false
});

const pickUpScreen = new ItemListScreen({
  caption: "Choose the items you wish to pick up",
  canSelect: true,
  canSelectMultiple: true,
  ok: function(selectedItems) {
    if (!this._player.pickUpItems(Object.keys(selectedItems))) {
      sendMessage(this._player, "Your inventory is full!");
    }
    return true;
  }
});

const dropScreen = new ItemListScreen({
  caption: "Choose the item you wish to drop",
  canSelect: true,
  canSelectMultiple: false,
  ok: function(selectedItems) {
    this._player.dropItem(Object.keys(selectedItems)[0]);
    return true;
  }
});

export default { startScreen };

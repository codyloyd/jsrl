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
    const screenWidth = Game.getScreenWidth();
    const screenHeight = Game.getScreenHeight();
    display.drawText(
      screenWidth / 2 - 10,
      5,
      "%c{" + Colors.blue + "}Kill The Warrior Orc"
    );
    display.drawText(screenWidth / 2 - 11, 6, "Press [ENTER] to start");
    const easyMessage = "Press [SHIFT+ENTER] to start stupid easy version";
    display.drawText(
      screenWidth / 2 - easyMessage.length / 2,
      10,
      "%c{" + Colors.darkGray + "}" + easyMessage
    );
  },
  handleInput: function(inputType, inputData) {
    if (inputType === "keydown") {
      if (inputData.keyCode === ROT.VK_RETURN) {
        if (inputData.shiftKey) {
          Game.switchScreen(playScreen, "easy");
        } else {
          Game.switchScreen(playScreen);
        }
      }
    }
  }
};

const playScreen = {
  _map: null,
  _player: null,
  _gameEnded: false,
  _subScreen: null,
  _gameWon: false,
  _easyMode: false,

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
    if (this._player.tryMove(newX, newY, newZ, this._map)) {
      this._map.getEngine().unlock();
    }
  },

  enter: function(game, opt) {
    this._easyMode = opt === "easy";

    const width = 80;
    const height = 48;
    const depth = 6;
    const tiles = new Builder(width, height, depth).getTiles();
    this._player = new Entity(
      Object.assign(PlayerTemplate, { screen: this, game })
    );
    this._map = new GameMap(tiles, this._player, this._easyMode);
    this._player.setMap(this._map);
    this._map.getEngine().start();
  },
  exit: function() {
    console.log("exited play screen");
  },
  render: function(display) {
    if (!this._map.getFinalBoss().isAlive()) {
      const score =
        this._player.getKillCount() * (this._player.getZ() + 1) +
        (this._easyMode ? 200 : 1000);
      const name = prompt(
        `YOU WIN! Your score was ${score}.  Enter your name to submit it to the leaderboard.`
      );
      if (name) {
        Game._highScoresDB.add({ name, score });
      }
      sendMessage(this._player, "YOU WIN THE GAME.  Press [Enter]");
      this._gameWon = true;
    }

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
          let glyph = this._map.getTile(x, y, this._player.getZ());
          let fg = Colors.darkBlue;
          if (visibleCells[x + "," + y]) {
            const items = map.getItemsAt(x, y, currentDepth);
            if (items) {
              glyph = items[items.length - 1];
            }
            if (map.getEntityAt(x, y, currentDepth)) {
              glyph = map.getEntityAt(x, y, currentDepth);
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
      this._player.getChar(),
      this._player.getFg(),
      this._player.getBg()
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
    const hungerState = this._player.getHungerState();
    display.drawText(
      screenWidth - hungerState.length,
      screenHeight,
      hungerState
    );
  },
  handleInput: function(inputType, inputData) {
    if (this._subScreen) {
      this._subScreen.handleInput(inputType, inputData);
      return;
    }
    if (inputType === "keydown") {
      if (this._gameEnded) {
        if (inputData.keyCode === ROT.VK_RETURN) {
          Game.switchScreen(loseScreen);
        }
        return;
      }
      if (this._gameWon) {
        if (inputData.keyCode === ROT.VK_RETURN) {
          Game.switchScreen(winScreen);
        }
        return;
      }
      //movement
      if (
        inputData.keyCode === ROT.VK_H ||
        inputData.keyCode == ROT.VK_4 ||
        inputData.keyCode == ROT.VK_LEFT
      ) {
        this.move(-1, 0, 0);
      } else if (
        inputData.keyCode === ROT.VK_L ||
        inputData.keyCode == ROT.VK_6 ||
        inputData.keyCode == ROT.VK_RIGHT
      ) {
        this.move(1, 0, 0);
      } else if (
        inputData.keyCode === ROT.VK_K ||
        inputData.keyCode == ROT.VK_8 ||
        inputData.keyCode == ROT.VK_UP
      ) {
        this.move(0, -1, 0);
      } else if (
        inputData.keyCode === ROT.VK_J ||
        inputData.keyCode == ROT.VK_2 ||
        inputData.keyCode == ROT.VK_DOWN
      ) {
        this.move(0, 1, 0);
      } else if (
        inputData.keyCode === ROT.VK_Y ||
        inputData.keyCode == ROT.VK_7
      ) {
        this.move(-1, -1, 0);
      } else if (
        inputData.keyCode === ROT.VK_U ||
        inputData.keyCode == ROT.VK_9
      ) {
        this.move(1, -1, 0);
      } else if (
        inputData.keyCode === ROT.VK_B ||
        inputData.keyCode == ROT.VK_1
      ) {
        this.move(-1, 1, 0);
      } else if (
        inputData.keyCode === ROT.VK_N ||
        inputData.keyCode == ROT.VK_3
      ) {
        this.move(1, 1, 0);
      } else if (inputData.keyCode === ROT.VK_T) {
        this.showItemsSubScreen(
          throwScreen,
          this._player.getItems(),
          "You don't have anything to throw!"
        );
      } else if (inputData.keyCode === ROT.VK_I) {
        this.showItemsSubScreen(
          inventoryScreen,
          this._player.getItems(),
          "You aren't carrying anything!"
        );
        return;
      } else if (inputData.keyCode === ROT.VK_D) {
        this.showItemsSubScreen(
          dropScreen,
          this._player.getItems(),
          "You don't have anything to drop!"
        );
      } else if (inputData.keyCode === ROT.VK_E) {
        this.showItemsSubScreen(
          eatScreen,
          this._player.getItems(),
          "You don't have anything to eat!"
        );
      } else if (inputData.keyCode === ROT.VK_W) {
        if (inputData.shiftKey) {
          // Show the wear screen
          this.showItemsSubScreen(
            wearScreen,
            this._player.getItems(),
            "You have nothing to wear."
          );
        } else {
          // Show the wield screen
          this.showItemsSubScreen(
            wieldScreen,
            this._player.getItems(),
            "You have nothing to wield."
          );
        }
        return;
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
      // this._map.getEngine().unlock();
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
  },
  showItemsSubScreen: function(subScreen, items, emptyMessage) {
    if (items && subScreen.setup(this._player, items) > 0) {
      this._player.clearMessages();
      Game.refresh();
      this.setSubScreen(subScreen);
    } else {
      sendMessage(this._player, emptyMessage);
    }
    Game.refresh();
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
    display.drawText(16, 2, "HIGH SCORES");
    Game._highScoresDB
      .orderBy("score", "desc")
      .limit(15)
      .get()
      .then(querySnapshot => {
        let i = 1;
        querySnapshot.forEach(doc => {
          display.drawText(
            18,
            i + 2,
            `%c{white}${i}: ${doc.data().name}: ${doc.data().score}`
          );
          i++;
        });
      });
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
    display.drawText(0, 0, "YOU LOSE SUCKA!");
    display.drawText(1, 2, "HIGH SCORES");
    Game._highScoresDB
      .orderBy("score", "desc")
      .limit(15)
      .get()
      .then(querySnapshot => {
        let i = 1;
        querySnapshot.forEach(doc => {
          display.drawText(
            18,
            i + 2,
            `%c{white}${i}: ${doc.data().name}: ${doc.data().score}`
          );
          i++;
        });
      });
  },
  handleInput: function(inputType, inputData) {
    // Nothing to do here
  }
};

const directionScreen = function(okFunction) {
  this.render = function(display) {
    display.drawText(0, 0, "Which direction?");
  };
  this.handleInput = function(inputType, inputData) {
    if (inputType == "keydown") {
      let direction;
      if (
        inputData.keyCode === ROT.VK_UP ||
        inputData.keyCode === ROT.VK_8 ||
        inputData.keyCode === ROT.VK_K
      ) {
        direction = 8;
      }
      if (
        inputData.keyCode === ROT.VK_DOWN ||
        inputData.keyCode === ROT.VK_2 ||
        inputData.keyCode === ROT.VK_J
      ) {
        direction = 2;
      }
      if (
        inputData.keyCode === ROT.VK_LEFT ||
        inputData.keyCode === ROT.VK_4 ||
        inputData.keyCode === ROT.VK_H
      ) {
        direction = 4;
      }
      if (
        inputData.keyCode === ROT.VK_RIGHT ||
        inputData.keyCode === ROT.VK_6 ||
        inputData.keyCode === ROT.VK_L
      ) {
        direction = 6;
      }
      if (direction) {
        okFunction(direction);
        playScreen.setSubScreen(undefined);
        playScreen._map.getEngine().unlock();
      }
    }
  };
};

const ItemListScreen = function({
  caption,
  ok,
  canSelect,
  canSelectMultiple,
  hasNoItemOption,
  isAcceptableFunction = function(x) {
    return x;
  },
  noUnlock = false
}) {
  this._caption = caption;
  this._okFunction = ok;
  this._canSelectItem = canSelect;
  this._canSelectMultipleItems = canSelectMultiple;
  this._isAcceptableFunction = isAcceptableFunction;
  this._hasNoItemOption = hasNoItemOption;
  this._noUnlock = noUnlock;

  this.setup = function(player, items) {
    this._player = player;
    this._items = items.filter(isAcceptableFunction);
    this._selectedIndices = {};
    return this._items.length;
  };

  this.render = function(display) {
    const letters = `abcdefghijklmnopqrstuvwxyz`;
    display.drawText(0, 0, this._caption);
    if (this._hasNoItemOption) {
      display.drawText(0, 1, `0 - no item`);
    }
    let row = 0;
    this._items.forEach((item, i) => {
      const letter = letters.substring(i, i + 1);
      const selectionState =
        this._canSelectItem &&
        this._canSelectMultipleItems &&
        this._selectedIndices[i]
          ? `+`
          : `-`;

      let suffix = "";
      if (this._items[i] === this._player.getArmor()) {
        suffix = "(wearing)";
      }
      if (this._items[i] === this._player.getWeapon()) {
        suffix = "(wielding)";
      }
      display.drawText(
        0,
        2 + i,
        `${letter} ${selectionState} ${item.describe()} ${suffix}`
      );
    });
  };
  this.executeOkFunction = function() {
    let selectedItems = {};
    for (let key in this._selectedIndices) {
      selectedItems[key] = this._items[key];
    }
    playScreen.setSubScreen(undefined);
    if (this._okFunction(selectedItems) && !this._noUnlock) {
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
        this._hasNoItemOption &&
        inputData.keyCode === ROT.VK_0
      ) {
        this._selectedIndices = {};
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
          } else {
            this._selectedIndices[index] = true;
            this.executeOkFunction();
          }
          Game.refresh();
        }
      }
    }
  };
};

const throwScreen = new ItemListScreen({
  caption: "Choose the item you want to throw",
  canSelect: true,
  canSelectMultiple: false,
  isAcceptableFunction: function(item) {
    return item.hasMixin("Throwable");
  },
  noUnlock: true,
  ok: function(selectedItems) {
    const item = selectedItems[Object.keys(selectedItems)[0]];
    playScreen.setSubScreen(
      new directionScreen(function(direction) {
        playScreen._player.throwItem(item, direction);
      })
    );
    return true;
  }
});

const wieldScreen = new ItemListScreen({
  caption: "Choose the item you wish to wield",
  canSelect: true,
  canSelectMultiple: false,
  isAcceptableFunction: function(item) {
    return item.hasMixin("Equippable") && item.isWieldable();
  },
  ok: function(selectedItems) {
    const keys = Object.keys(selectedItems);
    if (keys.length === 0) {
      this._player.unwield();
      sendMessage(this._player, "You are empty handed");
    } else {
      const item = selectedItems[keys[0]];
      this._player.unequip(item);
      this._player.wield(item);
      sendMessage(this._player, `You are wielding ${item.describeA()}`);
    }
    return true;
  }
});

const wearScreen = new ItemListScreen({
  caption: "Choose the item you wish to wear",
  canSelect: true,
  canSelectMultiple: false,
  isAcceptableFunction: function(item) {
    return item.hasMixin("Equippable") && item.isWearable();
  },
  ok: function(selectedItems) {
    const keys = Object.keys(selectedItems);
    if (keys.length === 0) {
      this._player.unwield();
      sendMessage(this._player, "You are not wearing any armor");
    } else {
      const item = selectedItems[keys[0]];
      this._player.unequip(item);
      this._player.wear(item);
      sendMessage(this._player, `You are wearing ${item.describeA()}`);
    }
    return true;
  }
});

const eatScreen = new ItemListScreen({
  caption: "Choose the item you wish to eat",
  canSelect: true,
  canSelectMultiple: false,
  isAcceptableFunction: function(item) {
    return item.hasMixin("Edible");
  },
  ok: function(selectedItems) {
    const key = Object.keys(selectedItems)[0];
    const item = selectedItems[key];
    console.log(item);
    sendMessage(this._player, `You eat ${item.describeThe()}`);
    item.eat(this._player);
    if (!item.hasRemainingConsumptions()) {
      console.log("is being removed");
      this._player.removeItem(item);
    }
    return true;
  }
});

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

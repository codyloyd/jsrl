import ROT from "rot-js";
import Colors from "./colors";
import Entity from "./entity";
import Repository from "./repository";
import ItemRepository from "./items";
import { wallTile, stairsUpTile, stairsDownTile } from "./tile";
import { sendMessage, sendMessageNearby } from "./helpers";
import { EntityRepository } from "./entities";

export const Sight = function({ sightRadius = 5 }) {
  return {
    name: "Sight",
    groupName: "Sight",
    getSightRadius: function() {
      return sightRadius;
    },
    canSee: function(entity) {
      if (
        !entity ||
        this.getMap() !== entity.getMap() ||
        this.getZ() !== entity.getZ()
      ) {
        return false;
      }
      const otherX = entity.getX();
      const otherY = entity.getY();

      if (
        (otherX - this.getX()) * (otherX - this.getX()) +
          (otherY - this.getY()) * (otherY - this.getY()) >
        sightRadius * sightRadius
      ) {
        return false;
      }

      let found = false;
      this.getMap()
        .getFov(this.getZ())
        .compute(this.getX(), this.getY(), sightRadius, function(
          x,
          y,
          radius,
          visibility
        ) {
          if (x === otherX && y === otherY) {
            found = true;
          }
        });
      return found;
    }
  };
};

export const TaskActor = function({ tasks = ["wander"] }) {
  return {
    name: "TaskActor",
    groupName: "Actor",
    act: function() {
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (this.canDoTask(task)) {
          this[task]();
          break;
        }
      }
    },
    canDoTask: function(task) {
      if (task === "hunt") {
        return this.hasMixin("Sight") && this.canSee(this.getMap().getPlayer());
      } else if (task === "wander") {
        return true;
      } else {
        throw new Error("tried to perform undefined task");
      }
    },
    hunt: function() {
      const player = this.getMap().getPlayer();
      const offsets =
        Math.abs(player.getX() - this.getX()) +
        Math.abs(player.getY() - this.getY());
      if (offsets === 1 && this.hasMixin("Attacker")) {
        this.attack(player);
        return;
      }

      const source = this;
      const z = source.getZ();
      const path = new ROT.Path.AStar(
        player.getX(),
        player.getY(),
        function(x, y) {
          var entity = source.getMap().getEntityAt(x, y, z);
          if (entity && entity !== player && entity !== source) {
            return false;
          }
          return source
            .getMap()
            .getTile(x, y, z)
            .isWalkable();
        },
        { topology: 4 }
      );
      let count = 0;
      path.compute(source.getX(), source.getY(), function(x, y) {
        if (count == 1) {
          source.tryMove(x, y, z);
        }
        count++;
      });
    },
    wander: function() {
      const dirs = [-1, 0, 1];
      const x = dirs.randomize()[0];
      const y = dirs.randomize()[0];
      this.tryMove(this.getX() + x, this.getY() + y, this.getZ());
    }
  };
};

export const FoodConsumer = function({
  maxFullness = 1000,
  fullness,
  fullnessDepetionRate = 1
}) {
  fullness = fullness ? fullness : maxFullness / 2;
  return {
    name: "FoodConsumer",
    addTurnHunger: function() {
      this.modifyFullnessBy(-fullnessDepetionRate);
    },
    modifyFullnessBy: function(points) {
      fullness = Math.min(fullness + points, maxFullness);
      if (fullness <= 0) {
        this.takeDamage(this, 1)
        sendMessage(this, 'you REALLY need to eat something')
      } else if (fullness > maxFullness) {
      }
    },
    getHungerState: function() {
      const perPercent = maxFullness / 100;
      if (fullness <= perPercent * 15) {
        return "Starving";
      } else if (fullness <= perPercent * 35) {
        return "Hungry";
      } else if (fullness >= perPercent * 95) {
        return "Oversatiated";
      } else if (fullness >= perPercent * 75) {
        return "Full";
      } else {
        return "Not Hungry";
      }
    }
  };
};

export const CorpseDropper = function({ corpseDropRate = 60 }) {
  return {
    name: "CorpseDropper",
    tryDropCorpse: function() {
      if (Math.round(Math.random() * 100) < corpseDropRate) {
        this.getMap().addItem(
          this.getX(),
          this.getY(),
          this.getZ(),
          ItemRepository.create("corpse", {
            name: "dead " + this.getName(),
            fg: this.getFg()
          })
        );
      }
    }
  };
};

export const PlayerActor = function() {
  let acting = false;
  let turnCounter = 0;
  return {
    name: "PlayerActor",
    groupName: "Actor",
    act: function() {
      if (acting) return;

      turnCounter++

      if (!this.isAlive()) {
        this.getGame()._currentScreen.setGameEnded(true);
        sendMessage(this, "press ENTER to continue");
      }
      acting = true;
      this.addTurnHunger();
      if (this.getHungerState() == "Not Hungry") {
        if(turnCounter % 6 == 0) {
          this.addHp(1)
        }
      }
      this.getScreen().render(this.getGame().getDisplay(), this.getGame());
      this.getMap()
        .getEngine()
        .lock();
      this.clearMessages();
      acting = false;
    }
  };
};

export const FungusActor = function() {
  let growthsRemaining = 5;

  return {
    name: "FungusActor",
    groupName: "Actor",
    act: function() {
      if (growthsRemaining > 0) {
        if (Math.random() <= 0.02) {
          const xOffset = Math.floor(Math.random() * 3) - 1;
          const yOffset = Math.floor(Math.random() * 3) - 1;
          if (xOffset != 0 || yOffset != 0) {
            if (
              this.getMap().isEmptyFloor(
                this.getX() + xOffset,
                this.getY() + yOffset,
                this.getZ()
              )
            ) {
              const entity = EntityRepository.create("fungus");
              entity.setPosition(
                this.getX() + xOffset,
                this.getY() + yOffset,
                this.getZ()
              );
              this.getMap().addEntity(entity);
              growthsRemaining--;
              sendMessageNearby(
                this.getMap(),
                entity.getX(),
                entity.getY(),
                entity.getZ(),
                "The fungus is spreading"
              );
            }
          }
        }
      }
    }
  };
};

export const Destructible = function({ maxHp = 10, hp, defenseValue = 0 }) {
  hp = !hp ? maxHp : hp;
  return {
    name: "Destructible",
    getDefenseValue: function() {
      let mod = 0;
      if (this.hasMixin("Equipper")) {
        if (this.getWeapon()) {
          mod += this.getWeapon().getDefenseValue();
        }
        if (this.getArmor()) {
          mod += this.getArmor().getDefenseValue();
        }
      }
      return defenseValue + mod;
    },
    setHp: function(newHp) {
      hp = Math.min(newHp, maxHp);
    },
    addHp: function(amount) {
      this.setHp(hp + amount)
    },
    getHp: function() {
      return hp;
    },
    getMaxHp: function() {
      return maxHp;
    },
    takeDamage: function(attacker, damage) {
      hp -= damage;
      if (hp <= 0) {
        sendMessage(attacker, `You kill the ${this.getName()}`);
        if (this.hasMixin("CorpseDropper")) {
          this.tryDropCorpse();
        }
        if (this.hasMixin("InventoryHolder")) {
          this.dropAllItems()
        }
        this.kill();
      }
    }
  };
};

export const MessageRecipient = function() {
  let messages = [];
  return {
    name: "MessageRecipient",
    receiveMessage: function(message) {
      console.log(message);
      messages.push(message);
    },
    getMessages: function() {
      return messages;
    },
    clearMessages: function() {
      messages = [];
    }
  };
};

export const Attacker = function({ attackValue = 1 }) {
  return {
    name: "Attacker",
    groupName: "Attacker",
    getAttackValue: function() {
      let mod = 0;
      if (this.hasMixin("Equipper")) {
        if (this.getWeapon()) {
          mod += this.getWeapon().getAttackValue();
        }
        if (this.getArmor()) {
          mod += this.getArmor().getAttackValue();
        }
      }
      return attackValue + mod;
    },
    attack: function(target) {
      if (target.hasMixin("Destructible")) {
        const attack = this.getAttackValue();
        const defense = target.getDefenseValue();
        const max = Math.max(0, attack - defense);
        const damage = Math.max(max - Math.floor(Math.random() * 3), 1);
        sendMessage(
          this,
          `You strike the ${target.getName()} for ${damage} damage.`
        );
        sendMessage(
          target,
          `The ${this.getName()} strikes you for ${damage} damage.`
        );

        target.takeDamage(this, damage);
      }
    }
  };
};

export const Thrower = function({ throwingDistance = 5 }) {
  return {
    name: "Thrower",
    throwItem: function(item, direction = 8) {
      const rangeArray = this.getMap().lookInDirection(
        direction,
        throwingDistance
      );
      let itemLanded = false;
      this.removeItem(item);
      for (let i = 0; i < rangeArray.length; i++) {
        let mapTile = rangeArray[i];
        if (mapTile.isEntity) {
          if (mapTile.hasMixin("Destructible")) {
            const damage = item.getThrowDamage();
            this.getMap().addItem(
              mapTile.getX(),
              mapTile.getY(),
              mapTile.getZ(),
              item
            );
            sendMessage(
              this,
              `Your ${item.describe()} strikes the ${mapTile.getName()} for ${damage} damage.`
            );
            mapTile.takeDamage(this, damage);
            itemLanded = true;
            break;
          }
        } else if (mapTile.tile == wallTile) {
          const xmod =
            direction == 8 || direction == 2 ? 0 : direction == 6 ? 1 : -1;
          const ymod =
            direction == 4 || direction == 6 ? 0 : direction == 2 ? 1 : -1;
          this.getMap().addItem(
            mapTile.x - xmod,
            mapTile.y - ymod,
            mapTile.z,
            item
          );
          itemLanded = true;
          break;
        }
      }
      if (!itemLanded) {
        const mapTile = rangeArray[rangeArray.length - 1];
        this.getMap().addItem(mapTile.x, mapTile.y, mapTile.z, item);
      }
    }
  };
};

export const InventoryHolder = function({ inventorySlots = 10, items=[], itemProbability=1 }) {
  items = items.map(item => Math.random() < itemProbability ? ItemRepository.create(item) : null)
  return {
    name: "InventoryHolder",
    getItems: function() {
      return items;
    },
    getItem: function(i) {
      return items[i];
    },
    addItem: function(item) {
      for (let i = 0; i < 22; i++) {
        if (!items[i]) {
          items[i] = item;
          return true;
        }
      }
      return false;
    },
    removeItem: function(i) {
      if (typeof i.getName === "function") {
        i = items.indexOf(i);
      }
      if (items[i] && this.hasMixin("Equipper")) {
        this.unequip(items[i]);
      }
      delete items[i];
    },
    canAddItem: function() {
      for (let i = 0; i < inventorySlots; i++) {
        if (!items[i]) {
          return true;
        }
        return false;
      }
    },
    pickUpItems: function(indices) {
      const mapItems = this.getMap().getItemsAt(
        this.getX(),
        this.getY(),
        this.getZ()
      );
      let added = 0;
      indices.forEach(i => {
        if (this.addItem(mapItems[i - added])) {
          mapItems.splice(i - added, 1);
          added++;
        }
      });
      this.getMap().setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
      return added === indices.length;
    },
    dropAllItems: function() {
      items.forEach((item, i) => this.dropItem(i))
    },
    dropItem: function(i) {
      if (items[i]) {
        if (this.getMap()) {
          this.getMap().addItem(
            this.getX(),
            this.getY(),
            this.getZ(),
            items[i]
          );
        }
        this.removeItem(i);
      }
    }
  };
};

export const Equipper = function({ weapon = null, armor = null }) {
  return {
    name: "Equipper",
    wield: function(newWeapon) {
      weapon = newWeapon;
    },
    unwield: function() {
      weapon = null;
    },
    wear: function(newArmor) {
      armor = newArmor;
    },
    takeOff: function() {
      armor = null;
    },
    getWeapon: function() {
      return weapon;
    },
    getArmor: function() {
      return armor;
    },
    unequip: function(item) {
      if (item === armor) {
        this.takeOff();
      }
      if (item === weapon) {
        this.unwield();
      }
    }
  };
};

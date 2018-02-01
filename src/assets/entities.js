import Colors from "./colors";
import Entity from "./entity";
import Repository from "./repository";
import { stairsUpTile, stairsDownTile } from "./tile";
import { sendMessage, sendMessageNearby } from "./helpers";

const Sight = function({ sightRadius = 5 }) {
  return {
    name: "Sight",
    groupName: "Sight",
    getSightRadius: function() {
      return sightRadius;
    }
  };
};

const WanderActor = function() {
  return {
    name: "WanderActor",
    groupName: "Actor",
    act: function() {
      const dirs = [-1, 0, 1];
      const x = dirs.randomize()[0];
      const y = dirs.randomize()[0];
      this.tryMove(this.getX() + x, this.getY() + y, this.getZ());
    }
  };
};

const PlayerActor = function() {
  return {
    name: "PlayerActor",
    groupName: "Actor",
    act: function() {
      if (this.getHp() < 1) {
        this.getGame()._currentScreen.setGameEnded(true);
        sendMessage(this, "you have died.  press ENTER");
      }
      this.getScreen().render(this.getGame().getDisplay(), this.getGame());
      this.getMap()
        .getEngine()
        .lock();
      this.clearMessages();
    }
  };
};

const FungusActor = function() {
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

const Destructible = function({ maxHp = 10, hp, defenseValue = 0 }) {
  hp = !hp ? maxHp : hp;
  return {
    name: "Destructible",
    getDefenseValue: function() {
      return defenseValue;
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
        sendMessage(attacker, `You kill the ${this.getName()}!`);
        sendMessage(this, `You DIE at the hand of the ${attacker.getName()}!`);
        if (this.hasMixin("PlayerActor")) {
          this.act();
        } else {
          this.getMap().removeEntity(this);
        }
      }
    }
  };
};

const MessageRecipient = function() {
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

const Attacker = function({ attackValue = 1 }) {
  return {
    name: "Attacker",
    groupName: "Attacker",
    getAttackValue: function() {
      return attackValue;
    },
    attack: function(target) {
      if (target.hasMixin("Destructible")) {
        const attack = this.getAttackValue();
        const defense = target.getDefenseValue();
        const max = Math.max(0, attack - defense);
        const damage = 1 + Math.floor(Math.random() * max);
        target.takeDamage(this, damage);

        sendMessage(
          this,
          `You strike the ${target.getName()} for ${damage} damage.`
        );
        sendMessage(
          target,
          `The ${this.getName()} strikes you for ${damage} damage.`
        );
      }
    }
  };
};

const InventoryHolder = function({ inventorySlots = 10 }) {
  const items = [];
  return {
    name: "InventoryHolder",
    init: function({ inventorySlots = 10 }) {
      inventorySlots = inventorySlots;
    },
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

const PlayerTemplate = {
  name: "ME",
  char: "@",
  fg: Colors.white,
  bg: Colors.black,
  maxHp: 40,
  attackValue: 10,
  sightRadius: 18,
  inventorySlots: 22,
  mixins: [
    PlayerActor,
    Destructible,
    Attacker,
    MessageRecipient,
    Sight,
    InventoryHolder
  ]
};

const EntityRepository = new Repository("entities", Entity);

EntityRepository.define("fungus", {
  name: "fungus",
  char: "F",
  fg: Colors.green,
  maxHp: 4,
  mixins: [FungusActor, Destructible]
});

EntityRepository.define("bat", {
  name: "bat",
  char: "B",
  fg: Colors.indigo,
  maxHp: 5,
  attackValue: 14,
  mixins: [WanderActor, Attacker, Destructible]
});

EntityRepository.define("newt", {
  name: "newt",
  char: ":",
  fg: Colors.red,
  maxHp: 3,
  attackValue: 12,
  mixins: [WanderActor, Attacker, Destructible]
});

export { PlayerTemplate, EntityRepository };

import Colors from "./colors";
import Entity from "./entity";
import Repository from "./repository";
import ItemRepository from "./items";
import { stairsUpTile, stairsDownTile } from "./tile";
import { sendMessage, sendMessageNearby } from "./helpers";
import {
  PlayerActor,
  FungusActor,
  TaskActor,
  Destructible,
  Attacker,
  MessageRecipient,
  Sight,
  InventoryHolder,
  FoodConsumer,
  CorpseDropper,
  Thrower,
  Equipper
} from "./entityMixins";

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
    InventoryHolder,
    FoodConsumer,
    Thrower,
    Equipper
  ]
};

const EntityRepository = new Repository("entities", Entity);

EntityRepository.define("fungus", {
  name: "fungus",
  char: "F",
  speed: 250,
  fg: Colors.green,
  maxHp: 4,
  rngWeight: 2,
  mixins: [FungusActor, Destructible]
});

EntityRepository.define("bat", {
  name: "bat",
  char: "B",
  fg: Colors.indigo,
  speed: 2000,
  maxHp: 5,
  attackValue: 3,
  rngWeight: 4,
  tasks: ["hunt", "wander"],
  mixins: [Sight, TaskActor, Attacker, Destructible, CorpseDropper]
});

EntityRepository.define("troll", {
  name: "troll",
  char: "T",
  fg: Colors.green,
  speed: 750,
  maxHp: 25,
  attackValue: 10,
  sightRadius: 10,
  rngWeight: 1,
  tasks: ["hunt", "wander"],
  mixins: [Sight, TaskActor, Attacker, Destructible, CorpseDropper]
});

EntityRepository.define("kobold", {
  name: "kobold",
  char: "k",
  fg: Colors.green,
  speed: 1050,
  maxHp: 15,
  attackValue: 6,
  sightRadius: 15,
  rngWeight: 3,
  tasks: ["hunt", "wander"],
  mixins: [Sight, TaskActor, Attacker, Destructible, CorpseDropper]
});

EntityRepository.define("newt", {
  name: "newt",
  char: ":",
  fg: Colors.red,
  maxHp: 3,
  attackValue: 3,
  rngWeight: 6,
  sightRadius: 3,
  tasks: ["hunt", "wander"],
  mixins: [Sight, TaskActor, Attacker, Destructible, CorpseDropper]
});

export { PlayerTemplate, EntityRepository };

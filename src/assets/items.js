import Repository from "./repository";
import Item from "./item";
import Colors from "./colors";
import { Throwable, Edible, Equippable } from "./itemMixins";

const ItemRepository = new Repository("items", Item);

ItemRepository.define("healing potion", {
  name: "potion",
  char: "!",
  fg: Colors.pink,
  foodValue: 50,
  healingValue: 10,
  rngWeight: 3,
  mixins: [Edible, Throwable]
});

ItemRepository.define("super healing potion", {
  name: "potion",
  char: "!",
  fg: Colors.darkGreen,
  foodValue: 250,
  healingValue: 100,
  rngWeight: 1,
  mixins: [Edible, Throwable]
});

// food
ItemRepository.define("apple", {
  name: "apple",
  char: "%",
  foodValue: 100,
  fg: Colors.red,
  rngWeight: 6,
  mixins: [Edible, Throwable]
});

ItemRepository.define("ration", {
  name: "food ration",
  char: "%",
  foodValue: 300,
  fg: Colors.orange,
  rngWeight: 4,
  mixins: [Edible, Throwable]
});

ItemRepository.define("rock", {
  name: "rock",
  char: "*",
  rngWeight: 5,
  fg: Colors.lightGray,
  throwDamage: 6,
  mixins: [Throwable]
});

ItemRepository.define(
  "corpse",
  {
    name: "corpse",
    char: "%",
    fg: Colors.pink,
    foodValue: 75,
    consuptions: 2,
    mixins: [Edible]
  },
  { disableRandomCreation: true }
);

// weapons
ItemRepository.define(
  "dagger",
  {
    name: "dagger",
    char: ")",
    attackValue: 5,
    wieldable: true,
    throwDamage: 12,
    mixins: [Throwable, Equippable],
    fg: Colors.blue
  },
  {
    // disableRandomCreation: true
  }
);

ItemRepository.define(
  "sword",
  {
    name: "sword",
    char: ")",
    attackValue: 10,
    wieldable: true,
    mixins: [Equippable],
    fg: Colors.blue
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  "awesomeSword",
  {
    name: "big awesome sword",
    char: ")",
    attackValue: 20,
    wieldable: true,
    mixins: [Equippable],
    fg: Colors.blue
  },
  {
    disableRandomCreation: true
  }
);

// armor
ItemRepository.define(
  "tunic",
  {
    name: "tunic",
    char: "[",
    fg: Colors.peach,
    defenseValue: 2,
    wearable: true,
    mixins: [Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  "chainmail",
  {
    name: "chainmail",
    char: "[",
    fg: Colors.peach,
    defenseValue: 4,
    wearable: true,
    mixins: [Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  "platemail",
  {
    name: "platemail",
    char: "[",
    fg: Colors.peach,
    defenseValue: 6,
    wearable: true,
    mixins: [Equippable]
  },
  {
    disableRandomCreation: true
  }
);

export default ItemRepository;

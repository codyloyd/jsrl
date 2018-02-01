import Repository from "./repository";
import Item from "./item";
import Colors from "./colors";

const ItemRepository = new Repository("items", Item);

ItemRepository.define("apple", {
  name: "apple",
  char: "%",
  fg: Colors.red
});

ItemRepository.define("rock", {
  name: "rock",
  char: "*",
  fg: Colors.lightGray
});

export default ItemRepository;

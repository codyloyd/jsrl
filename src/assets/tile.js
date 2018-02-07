import Glyph from "./glyph";
import Colors from "./colors";

const Tile = function({
  isDiggable = false,
  isWalkable = false,
  blocksLight = true
}) {
  const glyph = Glyph(...arguments);

  const publicFunctions = {
    getGlyph: function() {
      return glyph;
    },

    isWalkable: function() {
      return isWalkable;
    },

    isDiggable: function() {
      return isDiggable;
    },

    isBlockingLight: function() {
      return blocksLight;
    }
  };

  return Object.assign(publicFunctions, glyph);
};

const nullTile = new Tile({});
const floorTile = new Tile({
  char: ".",
  fg: Colors.darkGray,
  isWalkable: true,
  blocksLight: false
});
const wallTile = new Tile({
  char: "#",
  fg: Colors.brown,
  isDiggable: true,
  isWalkable: false,
  blocksLight: true
});
const stairsUpTile = new Tile({
  char: "<",
  fg: Colors.lightGray,
  isWalkable: true,
  blocksLight: false
});
const stairsDownTile = new Tile({
  char: ">",
  fg: Colors.lightGray,
  isWalkable: true,
  blocksLight: false
});

export { nullTile, floorTile, wallTile, stairsUpTile, stairsDownTile };

import Colors from "./colors";

const Glyph = function({ char = " ", fg = Colors.white, bg = Colors.black }) {
  const publicFunctions = {
    getChar: function() {
      return char;
    },

    getBg: function() {
      return bg;
    },

    getFg: function() {
      return fg;
    }
  };

  return publicFunctions;
};

export default Glyph;

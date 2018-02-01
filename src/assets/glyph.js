import Colors from "./colors";

const Glyph = function({ char = " ", fg = Colors.white, bg = Colors.black }) {
  const getChar = function() {
    return char;
  };

  const getBg = function() {
    return bg;
  };

  const getFg = function() {
    return fg;
  };

  return {
    getChar,
    getBg,
    getFg
  };
};

export default Glyph;

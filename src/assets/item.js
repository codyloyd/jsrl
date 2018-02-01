import Glyph from "./glyph";

const Item = function({ name = "" }) {
  const glyph = Glyph(...arguments);

  const getGlyph = function() {
    return glyph;
  };

  const describe = function() {
    return name;
  };

  const describeA = function(capitalize) {
    const prefixes = capitalize ? [`A`, `An`] : [`a`, `an`];
    const prefix = "aeiou".indexOf(describe()[0].toLowerCase()) >= 0 ? 1 : 0;
    return prefixes[prefix] + " " + describe();
  };

  return Object.assign({ getGlyph, describe, describeA }, glyph);
};

export default Item;

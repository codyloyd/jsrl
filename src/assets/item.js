import DynamicGlyph from "./dynamicGlyph";

const Item = function() {
  const glyph = DynamicGlyph(...arguments);

  return Object.assign({}, glyph);
};

export default Item;

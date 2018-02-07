import Glyph from "./glyph";

const DynamicGlyph = function({ name = "", mixins = [] }) {
  const glyph = Glyph(...arguments);
  const attachedMixins = {};
  const attachedMixinGroups = {};

  const mixinObject = {};
  mixins.forEach(mixinFactory => {
    const mixin = mixinFactory(...arguments);

    attachedMixins[mixin.name] = true;
    delete mixin.name;
    if (mixin.groupName) {
      attachedMixinGroups[mixin.groupName] = true;
      delete mixin.groupName;
    }
    Object.assign(mixinObject, mixin);
  });

  const publicFunctions = {
    hasMixin: function(mixin) {
      return attachedMixins[mixin] || attachedMixinGroups[mixin];
    },

    setName: function(newName) {
      name = newName;
    },

    getName: function() {
      return name;
    },

    describe: function() {
      return name;
    },

    describeA: function(capitalize) {
      const prefixes = capitalize ? [`A`, `An`] : [`a`, `an`];
      const prefix =
        "aeiou".indexOf(this.describe()[0].toLowerCase()) >= 0 ? 1 : 0;
      return prefixes[prefix] + " " + this.describe();
    },

    describeThe: function(capitalize) {
      const prefix = capitalize ? `The` : `the`;
      return prefix + " " + this.describe();
    }
  };

  return Object.assign(publicFunctions, glyph, mixinObject);
};

export default DynamicGlyph;

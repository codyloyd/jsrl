import ROT from "rot-js";

const Repository = function(name, ctor) {
  this._name = name;
  this._ctor = ctor;
  this._templates = {};
  this._randomTemplates = {};
};

Repository.prototype.define = function(name, template, options = {}) {
  this._templates[name] = template;
  if (!options["disableRandomCreation"]) {
    this._randomTemplates[name] = template;
  }
};

Repository.prototype.create = function(name, extraProperties) {
  const template = this._templates[name];
  if (!template) {
    throw new Error(
      "No template named '" + name + "' in repository '" + this._name + "'"
    );
  }
  if (extraProperties) {
    for (var key in extraProperties) {
      template[key] = extraProperties[key];
    }
  }
  return new this._ctor(template);
};

Repository.prototype.createRandom = function() {
  const weightMap = Object.keys(
    this._randomTemplates
  ).reduce((obj, template) => {
    const item = this._randomTemplates[template];
    obj[template] = item.rngWeight || 1;
    return obj;
  }, {});
  const item = ROT.RNG.getWeightedValue(weightMap);
  return this.create(item);
};

export default Repository;

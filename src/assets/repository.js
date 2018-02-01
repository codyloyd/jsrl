const Repository = function(name, ctor) {
  this._name = name;
  this._ctor = ctor;
  this._templates = {};
};

Repository.prototype.define = function(name, template) {
  this._templates[name] = template;
};

Repository.prototype.create = function(name) {
  const template = this._templates[name];
  if (!template) {
    throw new Error(
      "No template named '" + name + "' in repository '" + this._name + "'"
    );
  }
  return new this._ctor(template);
};

Repository.prototype.createRandom = function() {
  return this.create(Object.keys(this._templates).random());
};

export default Repository;

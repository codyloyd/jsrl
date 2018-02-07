export const Throwable = function({ throwDamage = 1 }) {
  return {
    name: "Throwable",
    getThrowDamage: function() {
      return throwDamage;
    }
  };
};

export const Edible = function({
  foodValue = 5,
  maxConsumptions = 1,
  healingValue = 0
}) {
  let remainingConsumptions = maxConsumptions;
  return {
    name: "Edible",
    eat: function(entity) {
      if (entity.hasMixin("FoodConsumer")) {
        if (this.hasRemainingConsumptions()) {
          entity.modifyFullnessBy(foodValue);
          entity.setHp(entity.getHp() + healingValue);
          remainingConsumptions--;
        }
      }
    },
    hasRemainingConsumptions: function() {
      return remainingConsumptions > 0;
    },
    describe: function() {
      if (maxConsumptions != remainingConsumptions) {
        return "partly eaten " + this.getName();
      } else {
        return this.getName();
      }
    }
  };
};

export const Equippable = function({
  attackValue = 0,
  defenseValue = 0,
  wieldable = false,
  wearable = false
}) {
  return {
    name: "Equippable",
    getAttackValue: function() {
      return attackValue;
    },
    getDefenseValue: function() {
      return defenseValue;
    },
    isWieldable: function() {
      return wieldable;
    },
    isWearable: function() {
      return wearable;
    }
  };
};

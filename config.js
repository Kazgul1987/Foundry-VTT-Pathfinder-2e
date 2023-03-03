export const MODULE_NAME = "weapon-poisoner";

export const MODULE_TITLE = "Weapon Poisoner";

export const MODULE_SETTINGS = {
  poisonList: {
    name: "Poison List",
    hint: "List of all poisons",
    scope: "world",
    config: true,
    default: {},
    type: Object,
  },
  debugMode: {
    name: "Debug Mode",
    hint: "Turn on to show debug messages in console",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  },
};

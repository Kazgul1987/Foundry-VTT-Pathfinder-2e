Hooks.on("ready", () => {
  // Add a button to the control token UI
  Token.prototype._getControlButtons = function (buttons) {
    buttons.push({
      icon: "fa-dice-d20",
      title: "Apply Poison",
      button: true,
      onClick: () => {
        // Open weapon selection dialog
        new ApplyPoisonDialog(this).render(true);
      },
    });
  };
});

class ApplyPoisonDialog extends Dialog {
  constructor(token) {
    super({
      title: "Select a weapon to apply poison to",
      content: "<p>Select a weapon to apply poison to</p>",
      buttons: {},
      closeOnSubmit: false,
      popOut: true,
    });
    this.token = token;
  }

  async getData() {
    const weapons = this.token.actor.items.filter(
      (item) => item.type === "weapon"
    );
    return {
      weapons,
    };
  }

  activateListeners(html) {
    html.find(".weapon-select").change((event) => {
      const weaponId = event.target.value;
      const weapon = this.token.actor.items.find(
        (item) => item.id === weaponId
      );
      new ChoosePoisonDialog(this.token, weapon).render(true);
      this.close();
    });
  }
}

class ChoosePoisonDialog extends Dialog {
  constructor(token, weapon) {
    super({
      title: "Select a poison to apply",
      content: "<p>Select a poison to apply</p>",
      buttons: {},
      closeOnSubmit: false,
      popOut: true,
    });
    this.token = token;
    this.weapon = weapon;
  }

  async getData() {
    const poisons = this.token.actor.items.filter(
      (item) => item.type === "consumable" && item.data.data.consumableType === "poison"
    );
    return {
      poisons,
    };
  }

  activateListeners(html) {
    html.find(".poison-select").change(async (event) => {
      const poisonId = event.target.value;
      const poison = this.token.actor.items.find(
        (item) => item.id === poisonId
      );
      await this.token.setFlag("my-module", "applied-poison", {
        weaponId: this.weapon.id,
        poisonId: poison.id,
      });
      this.close();
    });
  }
}

Hooks.on("preUpdateCombat", (combat, data) => {
  for (const update of data.tokenUpdates) {
    const token = canvas.tokens.get(update._id);
    if (!token) continue;
    const appliedPoison = token.getFlag("my-module", "applied-poison");
    if (!appliedPoison) continue;
    const weapon = token.actor.items.find(
      (item) => item.id === appliedPoison.weaponId
    );
    const poison = token.actor.items.find(
      (item) => item.id === appliedPoison.poisonId
    );
    if (!weapon || !poison) continue;
    const saveDC = 10 + poison.data.data.save.dc;
    const saveRoll = new Roll("1d20").roll();
    if (saveRoll.total < saveDC) {
      // Apply poison effect to target
      const effect = {
        label: `Poisoned with ${poison.name}`,
        icon: "icons/svg/skull.svg",
        tint: "#aa0000",
        origin: `Actor.${

Hooks.on('ready', async function () {
  // add toolbar button
  game.settings.register('poisonous', 'toolbarButton', {
    name: 'Poisonous',
    hint: 'Apply poison to weapon',
    icon: 'fas fa-vial',
    type: String,
    default: '',
    scope: 'world',
    config: false
  });

  let button = $('<button class="poisonous"><i class="fas fa-vial"></i>Poisonous</button>');
  button.click(() => {
    // check if token is selected
    const selectedTokens = canvas.tokens.controlled;
    if (selectedTokens.length !== 1) {
      ui.notifications.error('Please select exactly one token.');
      return;
    }
    const token = selectedTokens[0];
    
    // check if token has weapons in inventory
    const weapons = token.actor.items.filter(item => item.type === 'weapon');
    if (weapons.length === 0) {
      ui.notifications.error('The selected token has no weapons in inventory.');
      return;
    }
    
    // display weapon selection dialog
    let weaponNames = weapons.map(w => w.name);
    new Dialog({
      title: 'Select weapon to poison',
      content: `
        <div class="form-group">
          <label>Select a weapon:</label>
          <select id="weapon-select" name="weapon-select">
            ${weaponNames.map(name => `<option value="${name}">${name}</option>`)}
          </select>
        </div>
      `,
      buttons: {
        ok: {
          label: 'Ok',
          callback: async (html) => {
            // get selected weapon
            const selectedWeaponName = html.find('#weapon-select').val();
            const selectedWeapon = weapons.find(w => w.name === selectedWeaponName);
            if (!selectedWeapon) {
              ui.notifications.error('Weapon not found.');
              return;
            }
            
            // check if weapon has empty poison slots
            const numPoisonSlots = selectedWeapon.data.data.potency.length;
            const numFilledPoisonSlots = selectedWeapon.data.data.potency.filter(p => p !== null).length;
            if (numFilledPoisonSlots >= numPoisonSlots) {
              ui.notifications.error('The selected weapon has no empty poison slots.');
              return;
            }
            
            // check if token has poisons in inventory
            const poisons = token.actor.items.filter(item => item.type === 'consumable' && item.data.data.poisonType);
            if (poisons.length === 0) {
              ui.notifications.error('The selected token has no poisons in inventory.');
              return;
            }
            
            // display poison selection dialog
            let poisonNames = poisons.map(p => p.name);
            new Dialog({
              title: 'Select poison to apply',
              content: `
                <div class="form-group">
                  <label>Select a poison:</label>
                  <select id="poison-select" name="poison-select">
                    ${poisonNames.map(name => `<option value="${name}">${name}</option>`)}
                  </select>
                </div>
              `,
              buttons: {
                ok: {
                  label: 'Ok',
                  callback: async (html) => {
                    // get selected poison
                    const selectedPoisonName = html.find('#poison-select').val();
                    const selectedPoison = poisons.find(p => p.name === selectedPoisonName);
                    if (!selectedPoison) {
                      ui.notifications.error('Poison not found.');
                      return;
                    }
                    
                    // apply poison to weapon
Hooks.on('init', () => {
  game.settings.register("apply-poison", "weaponCondition", {
    name: "Weapon Condition",
    hint: "The condition to add to a token when a weapon is poisoned.",
    scope: "world",
    config: true,
    default: "Poisoned",
    type: String
  });
});

Hooks.on("ready", async function () {
  const menuButton = $('<button>Apply Poison</button>');
  menuButton.click(showWeaponSelector);
  $('.combatant-control').append(menuButton);

  async function showWeaponSelector() {
    const token = canvas.tokens.controlled[0];
    if (!token) {
      ui.notifications.warn("Please select a token.");
      return;
    }
    const weapons = getInventoryItems(token, "weapon");
    const weaponNames = weapons.map(w => w.name);
    const chosenWeapon = await chooseItem(weaponNames, "Choose a weapon to apply poison to:");
    if (!chosenWeapon) return;
    const poisons = getInventoryItems(token, "poison");
    const poisonNames = poisons.map(p => p.name);
    const chosenPoison = await chooseItem(poisonNames, "Choose a poison to apply to the weapon:");
    if (!chosenPoison) return;
    const weaponCondition = game.settings.get("apply-poison", "weaponCondition");
    await token.addCondition(weaponCondition, { });
    token.setFlag("apply-poison", "poisoned-weapon", {
      weapon: chosenWeapon,
      poison: chosenPoison
    });
    ui.notifications.info(`Applied ${chosenPoison} to ${chosenWeapon}.`);
  }

  async function chooseItem(items, message) {
    if (items.length === 0) {
      ui.notifications.warn("No items found.");
      return undefined;
    }
    const choice = await new Promise((resolve, reject) => {
      const dialog = new Dialog({
        title: message,
        content: `
          <form>
            <div class="form-group">
              <label>Item:</label>
              <select name="item">
                ${items.map(i => `<option value="${i}">${i}</option>`)}
              </select>
            </div>
          </form>
        `,
        buttons: {
          ok: {
            label: "OK",
            callback: (html) => resolve(html.find('[name="item"]').val())
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve(undefined)
          }
        },
        default: "ok",
        close: () => resolve(undefined)
      });
      dialog.render(true);
    });
    return choice;
  }

  async function applyPoisonToTarget(target) {
    const token = canvas.tokens.controlled[0];
    if (!token) {
      ui.notifications.warn("Please select a token.");
      return;
    }
    const flag = token.getFlag("apply-poison", "poisoned-weapon");
    if (!flag) {
      ui.notifications.warn("No poisoned weapon selected.");
      return;
    }
    const poison = getInventoryItems(token, "poison").find(p => p.name === flag.poison);
    const saveDC = poison.data.data.save.dc;
    const saveAbility = poison.data.data.save.ability;
    const saveType = poison.data.data.save.type;
    const weapon = getInventoryItems(token, "weapon").find(w.name === flag.weapon);
if (!weapon) {
ui.notifications.warn("Selected weapon not found.");
return;
}
const damage = weapon.data.data.damage.parts[0][0];
const attackBonus = weapon.data.data.attackBonus;
const chatData = {
user: game.user.id,
content: ${target.name} is hit with a ${weapon.name} coated in ${poison.name}!,
type: CONST.CHAT_MESSAGE_TYPES.OTHER
};
ChatMessage.create(chatData, {});
const saveRoll = await target.rollAbilitySave(saveType, { dc: saveDC, fromToken: token, msgContent: ${target.name} must make a saving throw against ${saveAbility} (DC ${saveDC}) to avoid being poisoned by ${poison.name}. });
if (saveRoll.total >= saveDC) {
ui.notifications.info(${target.name} saves against the poison.);
} else {
const duration = poison.data.data.duration.value;
const durationUnits = CONFIG.timePeriods[poison.data.data.duration.units];
const conditionName = Poisoned (${flag.weapon} + ${flag.poison});
const effects = [
{
key: "data.attributes.hp.regeneration",
mode: ACTIVE_EFFECT_MODES.OVERWRITE,
value: ${damage} damage at the start of each turn.,
priority: 10
}
];
await target.addCondition(conditionName, {
changes: effects,
duration: {
"startTime": game.time.worldTime,
"endTime": game.time.worldTime + duration * CONFIG.timeIntervals[durationUnits]
},
source: token.uuid
});
const chatData = {
user: game.user.id,
content: ${target.name} is poisoned with ${poison.name}!,
type: CONST.CHAT_MESSAGE_TYPES.OTHER
};
ChatMessage.create(chatData, {});
}
}

async function applyPoison() {
const token = canvas.tokens.controlled[0];
if (!token) {
ui.notifications.warn("Please select a token.");
return;
}
const targets = Array.from(game.user.targets);
if (targets.length === 0) {
ui.notifications.warn("Please target at least one token.");
return;
}
for (const target of targets) {
await applyPoisonToTarget(target);
}
}

const applyButton = $('<button>Apply Poison</button>');
applyButton.click(applyPoison);
$('.control-buttons').append(applyButton);
});

function getInventoryItems(token, type) {
const items = token.actor.items.filter(i => i.data.type === type);
return items.sort((a, b) => a.name.localeCompare(b.name));
}

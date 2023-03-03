Hooks.on('ready', () => {
  // Fügt den Button zum UI hinzu
  game.settings.register('poisonous-weapon', 'showButton', {
    name: 'Show Poison Button',
    hint: 'Adds a button to the Token HUD for applying poison to a weapon.',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
  });

  TokenHUD.prototype._onPoisonButton = function(event) {
    const actorId = this.token.actorId;
    const token = canvas.tokens.get(this.object.id);
    if (!actorId) {
      ui.notifications.error('You must have an actor selected to apply poison!');
      return;
    }

    const actor = game.actors.get(actorId);
    if (!actor) {
      ui.notifications.error(`Actor with id ${actorId} not found!`);
      return;
    }

    const weapons = actor.items.filter(item => item.type === 'weapon');
    if (!weapons || weapons.length === 0) {
      ui.notifications.error(`${actor.name} has no weapons!`);
      return;
    }

    const weaponOptions = weapons.reduce((obj, weapon) => {
      obj[weapon.id] = weapon.name;
      return obj;
    }, {});

    new Dialog({
      title: 'Select Weapon',
      content: `
        <div class="form-group">
          <label>Choose the weapon to apply the poison to:</label>
          <select id="weapon-select" name="weapon-select">
            ${Object.entries(weaponOptions).map(([id, name]) => `<option value="${id}">${name}</option>`)}
          </select>
        </div>
      `,
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Apply Poison',
          callback: () => {
            const weaponId = document.getElementById('weapon-select').value;
            const weapon = actor.items.get(weaponId);
            if (!weapon) {
              ui.notifications.error(`Weapon with id ${weaponId} not found!`);
              return;
            }

            const poisons = actor.items.filter(item => item.type === 'consumable' && item.data.data.consumableType.value === 'poison');
            if (!poisons || poisons.length === 0) {
              ui.notifications.error(`${actor.name} has no poisons!`);
              return;
            }

            const poisonOptions = poisons.reduce((obj, poison) => {
              obj[poison.id] = poison.name;
              return obj;
            }, {});

            new Dialog({
              title: 'Select Poison',
              content: `
                <div class="form-group">
                  <label>Choose the poison to apply to ${weapon.name}:</label>
                  <select id="poison-select" name="poison-select">
                    ${Object.entries(poisonOptions).map(([id, name]) => `<option value="${id}">${name}</option>`)}
                  </select>
                </div>
              `,
              buttons: {
                ok: {
                  icon: '<i class="fas fa-check"></i>',
                  label: 'Apply Poison',
                  callback: () => {
                    const poisonId = document.getElementById('poison-select').value;
                    const poison = actor.items.get(poisonId);
                    if (!poison) {
                      ui.notifications.error(`Poison with id ${poisonId} not found!`);
                     

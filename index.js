Hooks.on('preCreateOwnedItem', (actor, itemData, options, userId) => {
  if (itemData.type === 'weapon' && itemData.data.consume) {
    itemData.data.special = {
      damage: {
        parts: [`${itemData.data.damage}`],
        versatile: itemData.data.versatile
      },
      effects: {
        value: []
      }
    }
  }
});

Hooks.on('updateOwnedItem', (actor, itemData, updateData, options, userId) => {
  if (itemData.type === 'weapon' && updateData.data.consume) {
    updateData.data.special = {
      damage: {
        parts: [`${itemData.data.damage}`],
        versatile: itemData.data.versatile
      },
      effects: {
        value: []
      }
    }
  }
});

Hooks.on('preUpdateOwnedItem', async (actor, item, updateData, options, userId) => {
  if (item.type === 'weapon' && updateData['data.consume']) {
    let poison = await actor.items.get(updateData['data.consume'].target);
    let poisonData = poison.data.data.poisonData;
    let uses = updateData['data.consume'].amount;

    if (poison && poisonData) {
      let update = {
        '_id': item._id,
        'data.consume.amount': 0,
        'data.special.effects.value': [`$${poison._id}`]
      };
      let appliedPoison = await actor.updateOwnedItem(update);
      let message = `${actor.name} hat ${uses} Dosis(en) ${poison.name} auf ${item.name} aufgetragen.`;
      ChatMessage.create({
        content: message,
        whisper: ChatMessage.getWhisperRecipients("GM")
      });

      let effectData = {
        label: poison.name,
        icon: poisonData.icon,
        changes: [
          {
            key: "data.customModifiers.-=poison",
            mode: 2
          },
          {
            key: "data.customModifiers.-=bleed",
            mode: 2
          },
          {
            key: `data.customModifiers.${poisonData.ability}-poison`,
            value: poisonData.value,
            mode: 0,
            priority: 1
          }
        ],
        duration: {
          'rounds': {
            'value': poisonData.rounds
          }
        },
        flags: {
          'core.statusEffectsEnabled': true
        },
        origin: appliedPoison.uuid
      };
      await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }
  }
});

Hooks.on('preDeleteOwnedItem', async (actor, item, options, userId) => {
  if (item.type === 'weapon' && item.data.consume && item.data.special.effects.value.length > 0) {
    let effect = item.data.special.effects.value[0].slice(1);
    let activeEffect = await actor.effects.get(effect);
    await actor.deleteEmbeddedDocuments("ActiveEffect", [activeEffect.id]);
  }
});

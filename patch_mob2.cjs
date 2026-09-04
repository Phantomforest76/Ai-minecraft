const fs = require('fs');
let code = fs.readFileSync('src/game/mobManager.ts', 'utf8');

const oldSpawn = `    // Select mob type depending on dimension
    if (currentDim === 'nether') {
      this.spawnMob(MobType.ZOMBIE_PIGMAN, sx + 0.5, groundY, sz + 0.5, 'nether');
    } else {
      const roll = Math.random();
      let type = MobType.PIG;
      if (roll < 0.38) type = MobType.ZOMBIE;
      else if (roll < 0.65) type = MobType.CREEPER;
      else if (roll < 0.85) type = MobType.SKELETON;
      else type = MobType.PIG;

      this.spawnMob(type, sx + 0.5, groundY, sz + 0.5, 'overworld');
    }`;

const newSpawn = `    // Select mob type depending on dimension
    if (currentDim === 'end') {
      // Don't naturally spawn in end, dragon is spawned manually
      return;
    }
    if (currentDim === 'nether') {
      this.spawnMob(MobType.ZOMBIE_PIGMAN, sx + 0.5, groundY, sz + 0.5, 'nether');
    } else {
      const roll = Math.random();
      let type = MobType.PIG;
      if (roll < 0.38) type = MobType.ZOMBIE;
      else if (roll < 0.65) type = MobType.CREEPER;
      else if (roll < 0.85) type = MobType.SKELETON;
      else type = MobType.PIG;

      this.spawnMob(type, sx + 0.5, groundY, sz + 0.5, 'overworld');
    }`;

code = code.replace(oldSpawn, newSpawn);
fs.writeFileSync('src/game/mobManager.ts', code);

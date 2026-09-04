const fs = require('fs');
let code = fs.readFileSync('src/game/mobManager.ts', 'utf8');

const targetUpdate = `        if (mob.type === MobType.ENDER_DRAGON) {
           // Basic Dragon flight AI
           const flySpeed = 10;
           mob.velocity.x = dir.x * flySpeed;
           mob.velocity.y = dir.y * flySpeed;
           mob.velocity.z = dir.z * flySpeed;

           mob.position.x += mob.velocity.x * delta;
           mob.position.y += mob.velocity.y * delta;
           mob.position.z += mob.velocity.z * delta;
           
           if (distToPlayer < 4 && mob.attackCooldown <= 0) {
             onDamage(10);
             mob.attackCooldown = 1.5;
           }

           if (mesh.leftArm && mesh.rightArm) {
             const flap = Math.sin(Date.now() / 150) * 0.5;
             mesh.leftArm.rotation.z = flap;
             mesh.rightArm.rotation.z = -flap;
           }
        } else `;

const replaceUpdate = `        if (mob.type === MobType.ENDER_DRAGON) {
           // Basic Dragon flight AI
           const dxDragon = playerPos.x - mob.position.x;
           const dyDragon = playerPos.y + 1 - mob.position.y;
           const dzDragon = playerPos.z - mob.position.z;
           const distToPlayer = Math.sqrt(dxDragon*dxDragon + dyDragon*dyDragon + dzDragon*dzDragon);
           
           const dir = new THREE.Vector3(dxDragon, dyDragon, dzDragon).normalize();
           const flySpeed = 5;
           
           // Circle player or dive
           mob.velocity.x = dir.x * flySpeed;
           mob.velocity.y = dir.y * flySpeed;
           mob.velocity.z = dir.z * flySpeed;

           mob.position.x += mob.velocity.x * delta;
           mob.position.y += mob.velocity.y * delta;
           mob.position.z += mob.velocity.z * delta;
           
           mesh.rotation.y = Math.atan2(dir.x, dir.z);
           
           if (distToPlayer < 8 && mob.attackCooldown <= 0) {
             onPlayerDamage(4);
             mob.attackCooldown = 2.5;
           }

           if (mesh.leftArm && mesh.rightArm) {
             const flap = Math.sin(Date.now() / 150) * 0.5;
             mesh.leftArm.rotation.z = flap;
             mesh.rightArm.rotation.z = -flap;
           }
           
           // Dragon ignores ground collision, we skip the rest
           mesh.position.set(mob.position.x, mob.position.y, mob.position.z);
           continue;
        } else `;

code = code.replace(targetUpdate, replaceUpdate);

const oldIsHostile = `      const isHostile =
        mob.type === MobType.ZOMBIE ||
        mob.type === MobType.CREEPER ||
        mob.type === MobType.SKELETON ||
        (mob.type === MobType.ZOMBIE_PIGMAN && mob.health < mob.maxHealth);`;

const newIsHostile = `      const isHostile =
        mob.type === MobType.ZOMBIE ||
        mob.type === MobType.CREEPER ||
        mob.type === MobType.SKELETON ||
        mob.type === MobType.ENDER_DRAGON ||
        (mob.type === MobType.ZOMBIE_PIGMAN && mob.health < mob.maxHealth);`;

code = code.replace(oldIsHostile, newIsHostile);
fs.writeFileSync('src/game/mobManager.ts', code);

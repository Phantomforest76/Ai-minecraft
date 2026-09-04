const fs = require('fs');
let code = fs.readFileSync('src/game/mobManager.ts', 'utf8');

const target = `      case MobType.ZOMBIE_PIGMAN: {`;
const replace = `      case MobType.ENDER_DRAGON: {
        const tex = this.createPixelTexture(32, 16, (ctx) => {
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, 32, 16);
          ctx.fillStyle = '#ff00ff'; // Purple eyes
          ctx.fillRect(4, 4, 4, 4);
          ctx.fillRect(24, 4, 4, 4);
        });
        const head = this.createVoxelBox(1.5, 1.5, 2.0, 0x111111, tex);
        head.position.set(0, 4.0, 3.0);
        group.add(head);
        group.head = head;
        recordMat(head);
        
        const body = this.createVoxelBox(2.0, 2.0, 5.0, 0x1a1a1a);
        body.position.set(0, 3.0, 0);
        group.add(body);
        group.body = body;
        recordMat(body);

        const leftWing = this.createVoxelBox(4.0, 0.2, 3.0, 0x222222);
        leftWing.position.set(-3.0, 3.5, 0);
        group.add(leftWing);
        group.leftArm = leftWing;
        recordMat(leftWing);

        const rightWing = this.createVoxelBox(4.0, 0.2, 3.0, 0x222222);
        rightWing.position.set(3.0, 3.5, 0);
        group.add(rightWing);
        group.rightArm = rightWing;
        recordMat(rightWing);
        break;
      }
      case MobType.ZOMBIE_PIGMAN: {`;

code = code.replace(target, replace);

const targetUpdate = `        if (mob.type === MobType.CREEPER && distToPlayer < 3) {
          mob.fuseTimer = (mob.fuseTimer || 0) + delta;
          if (mob.fuseTimer > 1.5) {
            // Explode
            this.removeMob(mob.id);
            onDamage(20);
            sound.playExplosion();
            continue;
          }
        } else {
          mob.fuseTimer = 0;
        }`;

const replaceUpdate = `        if (mob.type === MobType.CREEPER && distToPlayer < 3) {
          mob.fuseTimer = (mob.fuseTimer || 0) + delta;
          if (mob.fuseTimer > 1.5) {
            // Explode
            this.removeMob(mob.id);
            onDamage(20);
            sound.playExplosion();
            continue;
          }
        } else {
          mob.fuseTimer = 0;
        }

        if (mob.type === MobType.ENDER_DRAGON) {
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

code = code.replace(targetUpdate, replaceUpdate);

const spawnTarget = `    const maxHealth = type === MobType.CREEPER ? 20 : type === MobType.PIG ? 10 : 20;`;
const spawnReplace = `    const maxHealth = type === MobType.ENDER_DRAGON ? 200 : (type === MobType.CREEPER ? 20 : type === MobType.PIG ? 10 : 20);`;
code = code.replace(spawnTarget, spawnReplace);

fs.writeFileSync('src/game/mobManager.ts', code);

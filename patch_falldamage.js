const fs = require('fs');
let code = fs.readFileSync('src/components/MinecraftGame.tsx', 'utf8');

const target = `        // Physics step with frame-rate delta scaling
        const { onGround, footstep } = physics.updatePlayerMovement(`;

const replace = `        // Track fall damage
        const prevVelY = playerVel.y;
        const wasOnGround = playerStats.onGround;

        // Physics step with frame-rate delta scaling
        const { onGround, footstep } = physics.updatePlayerMovement(`;

code = code.replace(target, replace);

const target2 = `        // Footstep sound cadence`;
const replace2 = `        // Check Fall Damage
        if (!wasOnGround && onGround && prevVelY < -12) {
          const fallDistance = -prevVelY - 12;
          const damage = Math.floor(fallDistance * 0.5);
          if (damage > 0 && playerStats.gameMode === 'survival') {
            sound.playHurt();
            setPlayerStats((prev) => ({
              ...prev,
              health: Math.max(0, prev.health - damage),
            }));
          }
        }

        // Footstep sound cadence`;

code = code.replace(target2, replace2);
fs.writeFileSync('src/components/MinecraftGame.tsx', code);

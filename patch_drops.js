const fs = require('fs');
let code = fs.readFileSync('src/components/MinecraftGame.tsx', 'utf8');

const target = `// Update Mobs`;
const replacement = `// Update Dropped Items
        eng.itemDropManager.update(delta, playerPos, (itemId) => {
          setHotbar((prev) => {
            const emptyIdx = prev.findIndex((s) => s === BlockType.AIR || s === null);
            if (emptyIdx !== -1) {
              const copy = [...prev];
              copy[emptyIdx] = itemId;
              return copy;
            }
            return prev;
          });
          setInventory((prev) => {
            const emptyIdx = prev.findIndex((s) => s === null || s === BlockType.AIR);
            if (emptyIdx !== -1) {
              const copy = [...prev];
              copy[emptyIdx] = itemId;
              return copy;
            }
            return prev;
          });
        });

        // Update Mobs`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/MinecraftGame.tsx', code);

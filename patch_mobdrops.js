const fs = require('fs');
let code = fs.readFileSync('src/components/MinecraftGame.tsx', 'utf8');

code = code.replace(/\(drops, xp\) => {[\s\S]*?for \(const drop of drops\) {[\s\S]*?setHotbar\(\(prev\) => {[\s\S]*?}\);[\s\S]*?setInventory\(\(prev\) => {[\s\S]*?}\);[\s\S]*?}[\s\S]*?setPlayerStats\(\(prev\) => {[\s\S]*?const nextXp = prev.xpProgress \+ 0.25;[\s\S]*?if \(nextXp >= 1.0\) {[\s\S]*?return {[\s\S]*?\.\.\.prev,[\s\S]*?xpLevel: prev.xpLevel \+ 1,[\s\S]*?xpProgress: nextXp - 1.0,[\s\S]*?};[\s\S]*?}[\s\S]*?return { \.\.\.prev, xpProgress: nextXp };[\s\S]*?}\);[\s\S]*?}/g,
`(drops, xp, mx, my, mz) => {
            for (const drop of drops) {
              eng.itemDropManager.spawnDrop(drop.item, mx, my, mz);
            }
            setPlayerStats((prev) => {
              const nextXp = prev.xpProgress + (xp / 100); // 5 xp = 0.05 bar
              if (nextXp >= 1.0) {
                return {
                  ...prev,
                  xpLevel: prev.xpLevel + 1,
                  xpProgress: nextXp - 1.0,
                };
              }
              return { ...prev, xpProgress: nextXp };
            });
          }`);

fs.writeFileSync('src/components/MinecraftGame.tsx', code);

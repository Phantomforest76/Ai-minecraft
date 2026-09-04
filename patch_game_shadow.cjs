const fs = require('fs');
let code = fs.readFileSync('src/components/MinecraftGame.tsx', 'utf8');

const renTarget = `    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });`;
const renReplace = `    const renderer = new THREE.WebGLRenderer({
      antialias: settings.highQuality ? true : false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    if (settings.shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }`;
code = code.replace(renTarget, renReplace);

const updateTarget = `        sky.update(delta, settings.timeOfDay, settings.renderDistance);`;
const updateReplace = `        sky.update(delta, settings.timeOfDay, settings.renderDistance, playerPos);`;
code = code.replace(updateTarget, updateReplace);

fs.writeFileSync('src/components/MinecraftGame.tsx', code);

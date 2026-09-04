const fs = require('fs');
let code = fs.readFileSync('src/game/sky.ts', 'utf8');

const targetUpdate = `    if (this.dimension === 'nether') {
      this.cloudMesh.visible = false;
      
      const netherFog = new THREE.Color(0x330000);
      this.scene.background = netherFog;
      this.fog.color.copy(netherFog);
      this.fog.near = 5;
      this.fog.far = renderDistance * 16 * 0.7; // Thicker fog
      
      this.ambientLight.intensity = 0.6;
      this.ambientLight.color.setHex(0xffaaaa);
      this.dirLight.intensity = 0.55;
      this.dirLight.color.setHex(0xb5351c);
      this.dirLight.position.set(10, 40, 10);
      return;
    }`;

const replaceUpdate = `    if (this.dimension === 'nether') {
      this.cloudMesh.visible = false;
      
      const netherFog = new THREE.Color(0x330000);
      this.scene.background = netherFog;
      this.fog.color.copy(netherFog);
      this.fog.near = 5;
      this.fog.far = renderDistance * 16 * 0.7; // Thicker fog
      
      this.ambientLight.intensity = 0.6;
      this.ambientLight.color.setHex(0xffaaaa);
      this.dirLight.intensity = 0.55;
      this.dirLight.color.setHex(0xb5351c);
      this.dirLight.position.set(10, 40, 10);
      return;
    }

    if (this.dimension === 'end') {
      this.cloudMesh.visible = false;
      
      const endSky = new THREE.Color(0x1a0f2e);
      this.scene.background = endSky;
      this.fog.color.copy(endSky);
      this.fog.near = renderDistance * 16 * 0.4;
      this.fog.far = renderDistance * 16;
      
      this.ambientLight.intensity = 0.4;
      this.ambientLight.color.setHex(0xffffff);
      this.dirLight.intensity = 0.3;
      this.dirLight.color.setHex(0xaaaaaa);
      this.dirLight.position.set(0, 100, 0); // Flat lighting
      return;
    }`;

code = code.replace(targetUpdate, replaceUpdate);
fs.writeFileSync('src/game/sky.ts', code);

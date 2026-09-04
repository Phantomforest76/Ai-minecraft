const fs = require('fs');
let code = fs.readFileSync('src/game/sky.ts', 'utf8');

const lightTarget = `    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.scene.add(this.dirLight);`;

const lightReplace = `    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    const d = 60;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);`;

code = code.replace(lightTarget, lightReplace);

const playerTarget = `  public update(delta: number, timeOfDay: number, renderDistance: number) {`;
const playerReplace = `  public update(delta: number, timeOfDay: number, renderDistance: number, playerPos?: THREE.Vector3) {`;
code = code.replace(playerTarget, playerReplace);

const lightPosTarget = `      this.dirLight.position.set(sunX, sunY, sunZ);`;
const lightPosReplace = `      if (playerPos) {
        this.dirLight.position.set(playerPos.x + sunX, playerPos.y + sunY, playerPos.z + sunZ);
        this.dirLight.target.position.copy(playerPos);
        this.dirLight.target.updateMatrixWorld();
      } else {
        this.dirLight.position.set(sunX, sunY, sunZ);
      }`;
code = code.replace(lightPosTarget, lightPosReplace);

fs.writeFileSync('src/game/sky.ts', code);

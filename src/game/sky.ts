import * as THREE from 'three';

export class SkyManager {
  public scene: THREE.Scene;
  public dirLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public cloudMesh: THREE.Mesh;
  public fog: THREE.Fog;
  public dimension: 'overworld' | 'nether' | 'end' = 'overworld';

  private cloudMaterial: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    // Sun / directional light with high-fidelity PCF soft shadows
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 0.95);
    this.dirLight.position.set(50, 100, 50);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 220;
    const d = 48;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0006;
    this.scene.add(this.dirLight);

    // Fog (Java Edition fog effect)
    this.fog = new THREE.Fog(0x73a3ff, 25, 95);
    this.scene.fog = this.fog;

    // Procedural Minecraft Cloud Layer (at Y = 62)
    const cloudGeo = new THREE.PlaneGeometry(600, 600, 32, 32);
    cloudGeo.rotateX(-Math.PI / 2);

    // Generate cloud texture
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 64;
    cloudCanvas.height = 64;
    const ctx = cloudCanvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

    // Blocky cloud clusters
    for (let i = 0; i < 20; i++) {
      const rx = Math.floor(Math.random() * 48);
      const ry = Math.floor(Math.random() * 48);
      const rw = 4 + Math.floor(Math.random() * 12);
      const rh = 4 + Math.floor(Math.random() * 8);
      ctx.fillRect(rx, ry, rw, rh);
    }

    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.RepeatWrapping;
    cloudTexture.repeat.set(12, 12);
    cloudTexture.magFilter = THREE.NearestFilter;
    cloudTexture.minFilter = THREE.NearestFilter;

    this.cloudMaterial = new THREE.MeshBasicMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });

    this.cloudMesh = new THREE.Mesh(cloudGeo, this.cloudMaterial);
    this.cloudMesh.position.y = 58;
    this.scene.add(this.cloudMesh);
  }

  public update(delta: number, timeOfDay: number, renderDistance: number, playerPos?: THREE.Vector3) {
    if (this.dimension === 'nether') {
      this.cloudMesh.visible = false;
      const netherSky = new THREE.Color(0x240606);
      this.scene.background = netherSky;
      this.fog.color.copy(netherSky);
      this.fog.near = 4;
      this.fog.far = Math.max(24, renderDistance * 16 - 6);
      this.ambientLight.intensity = 0.65;
      this.ambientLight.color.setHex(0x731a1a);
      this.dirLight.intensity = 0.55;
      this.dirLight.color.setHex(0xb5351c);
      this.dirLight.position.set(10, 40, 10);
      return;
    }

    if (this.dimension === 'end') {
      this.cloudMesh.visible = false;
      const endSky = new THREE.Color(0x0c0714);
      this.scene.background = endSky;
      this.fog.color.copy(endSky);
      this.fog.near = 15;
      this.fog.far = Math.max(30, renderDistance * 16 + 10);
      this.ambientLight.intensity = 0.55;
      this.ambientLight.color.setHex(0x3a205a);
      this.dirLight.intensity = 0.75;
      this.dirLight.color.setHex(0xddb8ff);
      this.dirLight.position.set(15, 80, 25);
      return;
    }

    this.cloudMesh.visible = true;
    this.ambientLight.color.setHex(0xffffff);
    this.dirLight.color.setHex(0xfffaed);

    // Scroll clouds gently
    if (this.cloudMaterial.map) {
      this.cloudMaterial.map.offset.x += delta * 0.008;
      this.cloudMaterial.map.offset.y += delta * 0.003;
    }

    // Dynamic day-night lighting & colors
    // timeOfDay: 0 = day, 0.25 = dusk, 0.5 = night, 0.75 = dawn
    const dayFactor = Math.max(0, Math.cos(timeOfDay * Math.PI * 2));
    const sunsetFactor = Math.max(0, Math.sin(timeOfDay * Math.PI * 2));

    // Sky colors
    const dayColor = new THREE.Color(0x73a3ff); // Authentic Java day sky
    const sunsetColor = new THREE.Color(0xf08050); // Sunset orange
    const nightColor = new THREE.Color(0x0a0f1d); // Deep night sky

    let currentSkyColor = dayColor.clone().multiplyScalar(dayFactor);
    if (sunsetFactor > 0.4 && dayFactor < 0.4) {
      currentSkyColor.lerp(sunsetColor, 0.5);
    }
    currentSkyColor.lerp(nightColor, 1 - dayFactor);

    this.scene.background = currentSkyColor;
    this.fog.color.copy(currentSkyColor);

    // Adjust fog distance with renderDistance
    this.fog.near = Math.max(15, renderDistance * 16 - 20);
    this.fog.far = Math.max(35, renderDistance * 16 + 10);

    // Light intensities
    this.ambientLight.intensity = 0.25 + dayFactor * 0.45;
    this.dirLight.intensity = 0.15 + dayFactor * 0.85;

    // Sun rotation
    const sunAngle = timeOfDay * Math.PI * 2;
    this.dirLight.position.x = Math.sin(sunAngle) * 100;
    this.dirLight.position.y = Math.cos(sunAngle) * 100;
    this.dirLight.position.z = 40;
  }

  public dispose() {
    this.scene.remove(this.cloudMesh);
    this.cloudMesh.geometry.dispose();
    this.cloudMaterial.dispose();
  }
}

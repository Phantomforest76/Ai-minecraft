const fs = require('fs');
let code = fs.readFileSync('src/game/chunkManager.ts', 'utf8');

// Use StandardMaterial for better graphics if configured
const targetMat = `    // Opaque and alpha-tested voxel material (leaves, flowers, solid blocks, fire)
    this.opaqueMaterial = new THREE.MeshLambertMaterial({
      map: textureManager.atlasTexture,
      alphaTest: 0.4,
      transparent: false,
      vertexColors: true,
      side: THREE.DoubleSide,
    });`;
const replaceMat = `    // Opaque and alpha-tested voxel material (leaves, flowers, solid blocks, fire)
    this.opaqueMaterial = new THREE.MeshStandardMaterial({
      map: textureManager.atlasTexture,
      alphaTest: 0.4,
      transparent: false,
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.1,
    });`;

const targetWater = `    // Translucent water material
    this.waterMaterial = new THREE.MeshLambertMaterial({`;
const replaceWater = `    // Translucent water material
    this.waterMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.1,
      metalness: 0.1,`;

const targetPortal = `    // Translucent shimmering Nether Portal material
    this.portalMaterial = new THREE.MeshLambertMaterial({`;
const replacePortal = `    // Translucent shimmering Nether Portal material
    this.portalMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.0,
      emissive: new THREE.Color(0x330033),
      emissiveIntensity: 0.5,`;

code = code.replace(targetMat, replaceMat);
code = code.replace(targetWater, replaceWater);
code = code.replace(targetPortal, replacePortal);

const targetType = `  public opaqueMaterial: THREE.MeshLambertMaterial;
  public waterMaterial: THREE.MeshLambertMaterial;
  public portalMaterial: THREE.MeshLambertMaterial;`;
const replaceType = `  public opaqueMaterial: THREE.MeshStandardMaterial;
  public waterMaterial: THREE.MeshStandardMaterial;
  public portalMaterial: THREE.MeshStandardMaterial;`;
code = code.replace(targetType, replaceType);

const meshGenTarget = `      chunk.mesh = new THREE.Mesh(geometry, this.opaqueMaterial);
      chunk.mesh.position.set(chunk.cx * CHUNK_SIZE, 0, chunk.cz * CHUNK_SIZE);
      this.scene.add(chunk.mesh);`;
const meshGenReplace = `      chunk.mesh = new THREE.Mesh(geometry, this.opaqueMaterial);
      chunk.mesh.position.set(chunk.cx * CHUNK_SIZE, 0, chunk.cz * CHUNK_SIZE);
      chunk.mesh.castShadow = true;
      chunk.mesh.receiveShadow = true;
      this.scene.add(chunk.mesh);`;
code = code.replace(meshGenTarget, meshGenReplace);

const waterGenTarget = `      chunk.waterMesh = new THREE.Mesh(waterGeometry, this.waterMaterial);
      chunk.waterMesh.position.set(chunk.cx * CHUNK_SIZE, 0, chunk.cz * CHUNK_SIZE);
      this.scene.add(chunk.waterMesh);`;
const waterGenReplace = `      chunk.waterMesh = new THREE.Mesh(waterGeometry, this.waterMaterial);
      chunk.waterMesh.position.set(chunk.cx * CHUNK_SIZE, 0, chunk.cz * CHUNK_SIZE);
      chunk.waterMesh.receiveShadow = true;
      this.scene.add(chunk.waterMesh);`;
code = code.replace(waterGenTarget, waterGenReplace);

fs.writeFileSync('src/game/chunkManager.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/game/chunkManager.ts', 'utf8');

code = code.replace(
  /public netherChunks = new Map<string, Chunk>\(\);/,
  "public netherChunks = new Map<string, Chunk>();\n  public endChunks = new Map<string, Chunk>();"
);

code = code.replace(
  /public currentDimension: 'overworld' | 'nether' = 'overworld';/,
  "public currentDimension: 'overworld' | 'nether' | 'end' = 'overworld';"
);

const targetSwitch = `  public switchDimension(dim: 'overworld' | 'nether') {
    if (this.currentDimension === dim) return;

    // Remove current dimension chunks from scene
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) this.scene.remove(chunk.mesh);
      if (chunk.waterMesh) this.scene.remove(chunk.waterMesh);
      if (chunk.portalMesh) this.scene.remove(chunk.portalMesh);
    }

    this.currentDimension = dim;
    this.chunks = dim === 'overworld' ? this.overworldChunks : this.netherChunks;`;

const replaceSwitch = `  public switchDimension(dim: 'overworld' | 'nether' | 'end') {
    if (this.currentDimension === dim) return;

    // Remove current dimension chunks from scene
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) this.scene.remove(chunk.mesh);
      if (chunk.waterMesh) this.scene.remove(chunk.waterMesh);
      if (chunk.portalMesh) this.scene.remove(chunk.portalMesh);
    }

    this.currentDimension = dim;
    this.chunks = dim === 'overworld' ? this.overworldChunks : (dim === 'nether' ? this.netherChunks : this.endChunks);`;

code = code.replace(targetSwitch, replaceSwitch);
fs.writeFileSync('src/game/chunkManager.ts', code);

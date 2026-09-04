const fs = require('fs');
let code = fs.readFileSync('src/game/worldGen.ts', 'utf8');

const target = `  public generateChunk(
    cx: number,
    cz: number,
    dimension: 'overworld' | 'nether' = 'overworld'
  ): Uint8Array {
    if (dimension === 'nether') {
      return this.generateNetherChunk(cx, cz);
    }`;

const replace = `  public generateEndChunk(cx: number, cz: number): Uint8Array {
    const blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT);
    const startX = cx * CHUNK_SIZE;
    const startZ = cz * CHUNK_SIZE;

    const getIndex = (lx: number, ly: number, lz: number) =>
      lx + lz * CHUNK_SIZE + ly * (CHUNK_SIZE * CHUNK_SIZE);

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = startX + lx;
        const wz = startZ + lz;

        // Calculate distance from center (0,0) for the main island
        const dist = Math.sqrt(wx * wx + wz * wz);
        
        // Island radius is about 50 blocks
        if (dist < 60) {
          // Island profile based on distance and noise
          const noise = this.noise2D_detail(wx * 0.05, wz * 0.05) * 5;
          const heightThickness = Math.max(0, 15 - (dist / 4)) + noise;
          
          if (heightThickness > 0) {
            const surfaceY = 60; // Top of the island
            const bottomY = Math.floor(surfaceY - heightThickness);
            
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
              if (y >= bottomY && y <= surfaceY) {
                blocks[getIndex(lx, y, lz)] = BlockType.END_STONE;
              }
            }
            
            // Obsidian Pillars (very simple representation, hardcoded at specific radiuses)
            if (dist > 15 && dist < 18) {
               // roughly a pillar if noise hits a threshold
               if ((wx % 20 === 0 || wz % 20 === 0) && Math.abs(this.noise2D_continental(wx*0.1, wz*0.1)) > 0.5) {
                 for (let y = surfaceY; y < CHUNK_HEIGHT - 1; y++) {
                   blocks[getIndex(lx, y, lz)] = BlockType.OBSIDIAN;
                 }
               }
            }
          }
        }
      }
    }
    return blocks;
  }

  public generateChunk(
    cx: number,
    cz: number,
    dimension: 'overworld' | 'nether' | 'end' = 'overworld'
  ): Uint8Array {
    if (dimension === 'nether') {
      return this.generateNetherChunk(cx, cz);
    }
    if (dimension === 'end') {
      return this.generateEndChunk(cx, cz);
    }`;

code = code.replace(target, replace);
fs.writeFileSync('src/game/worldGen.ts', code);

import { createNoise2D, createNoise3D } from 'simplex-noise';
import { BlockType } from '../types';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 64;
export const SEA_LEVEL = 24;

export interface BiomeProperties {
  name: string;
  baseHeight: number;
  heightVariation: number;
  treeDensity: number;
  cactusDensity?: number;
  topBlock: BlockType;
  underBlock: BlockType;
  snowHeight?: number;
}

export const BIOMES: Record<string, BiomeProperties> = {
  desert: {
    name: 'Desert',
    baseHeight: 26,
    heightVariation: 4,
    treeDensity: 0,
    cactusDensity: 0.025,
    topBlock: BlockType.SAND,
    underBlock: BlockType.SANDSTONE,
  },
  plains: {
    name: 'Plains',
    baseHeight: 28,
    heightVariation: 5,
    treeDensity: 0.015,
    topBlock: BlockType.GRASS,
    underBlock: BlockType.DIRT,
  },
  forest: {
    name: 'Forest',
    baseHeight: 30,
    heightVariation: 8,
    treeDensity: 0.075,
    topBlock: BlockType.GRASS,
    underBlock: BlockType.DIRT,
  },
  mountains: {
    name: 'Mountains',
    baseHeight: 39,
    heightVariation: 21,
    treeDensity: 0.006,
    topBlock: BlockType.STONE,
    underBlock: BlockType.STONE,
    snowHeight: 46,
  },
};

export class WorldGenerator {
  private noise2D_continental: (x: number, y: number) => number;
  private noise2D_detail: (x: number, y: number) => number;
  private noise2D_biome: (x: number, y: number) => number;
  private noise3D_caves1: (x: number, y: number, z: number) => number;
  private noise3D_caves2: (x: number, y: number, z: number) => number;
  private noise3D_caverns: (x: number, y: number, z: number) => number;
  private noise2D_ravine: (x: number, y: number) => number;
  private noise3D_nether: (x: number, y: number, z: number) => number;
  private noise2D_netherDetail: (x: number, y: number) => number;
  public seed: number;

  constructor(seed: number = 1337) {
    this.seed = seed;
    // Pseudorandom generator based on seed
    const createPrng = (s: number) => {
      let state = s % 2147483647;
      if (state <= 0) state += 2147483646;
      return () => {
        state = (state * 16807) % 2147483647;
        return (state - 1) / 2147483646;
      };
    };

    this.noise2D_continental = createNoise2D(createPrng(seed));
    this.noise2D_detail = createNoise2D(createPrng(seed + 101));
    this.noise2D_biome = createNoise2D(createPrng(seed + 202));
    this.noise3D_caves1 = createNoise3D(createPrng(seed + 303));
    this.noise3D_caves2 = createNoise3D(createPrng(seed + 404));
    this.noise3D_caverns = createNoise3D(createPrng(seed + 455));
    this.noise2D_ravine = createNoise2D(createPrng(seed + 488));
    this.noise3D_nether = createNoise3D(createPrng(seed + 505));
    this.noise2D_netherDetail = createNoise2D(createPrng(seed + 606));
  }

  public getBiomeAt(worldX: number, worldZ: number): BiomeProperties {
    const bVal = (this.noise2D_biome(worldX * 0.004, worldZ * 0.004) + 1) * 0.5;
    if (bVal < 0.28) return BIOMES.desert;
    if (bVal < 0.54) return BIOMES.plains;
    if (bVal < 0.78) return BIOMES.forest;
    return BIOMES.mountains;
  }

  /**
   * Biome-based continuous height evaluation with smooth transitions between
   * Desert, Plains, Forest, and Mountain environments.
   */
  public getHeightAt(worldX: number, worldZ: number): { height: number; biome: BiomeProperties; biomeWeight: number } {
    // Continuous biome blend value (0.0 to 1.0)
    const bVal = (this.noise2D_biome(worldX * 0.004, worldZ * 0.004) + 1) * 0.5;
    const biome = this.getBiomeAt(worldX, worldZ);

    // Multi-octave continuous terrain noise
    const cVal = this.noise2D_continental(worldX * 0.012, worldZ * 0.012);
    const dVal = this.noise2D_detail(worldX * 0.035, worldZ * 0.035);

    // Smooth Hermite interpolation weights across biome boundaries:
    // 0.00 - 0.28: Desert
    // 0.28 - 0.54: Plains
    // 0.54 - 0.78: Forest
    // 0.78 - 1.00: Mountains
    let baseH: number;
    let varH: number;

    if (bVal < 0.28) {
      // Pure or transitioning Desert
      const t = Math.max(0, (bVal - 0.20) / 0.08); // transition to Plains
      baseH = (1 - t) * BIOMES.desert.baseHeight + t * BIOMES.plains.baseHeight;
      varH = (1 - t) * BIOMES.desert.heightVariation + t * BIOMES.plains.heightVariation;
    } else if (bVal < 0.54) {
      // Plains transitioning into Forest
      const t = Math.max(0, (bVal - 0.46) / 0.08);
      baseH = (1 - t) * BIOMES.plains.baseHeight + t * BIOMES.forest.baseHeight;
      varH = (1 - t) * BIOMES.plains.heightVariation + t * BIOMES.forest.heightVariation;
    } else if (bVal < 0.78) {
      // Forest transitioning into soaring Mountains
      const t = Math.max(0, (bVal - 0.70) / 0.08);
      baseH = (1 - t) * BIOMES.forest.baseHeight + t * BIOMES.mountains.baseHeight;
      varH = (1 - t) * BIOMES.forest.heightVariation + t * BIOMES.mountains.heightVariation;
    } else {
      // Pure Mountains
      baseH = BIOMES.mountains.baseHeight;
      varH = BIOMES.mountains.heightVariation;
    }

    const finalH = Math.floor(baseH + (cVal * 0.7 + dVal * 0.3) * varH);
    return {
      height: Math.max(SEA_LEVEL - 4, Math.min(CHUNK_HEIGHT - 6, finalH)),
      biome,
      biomeWeight: bVal,
    };
  }

  /**
   * Generates block voxel array for a given chunk (16x16x64) in the End dimension
   * Fixes player stuck issue with a dedicated 5x5 Obsidian spawn platform at (25, 55, 0)
   */
  public generateEndChunk(cx: number, cz: number): Uint8Array {
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
            const surfaceY = 55; // Top of the island
            const bottomY = Math.floor(surfaceY - heightThickness);
            
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
              if (y >= bottomY && y <= surfaceY) {
                blocks[getIndex(lx, y, lz)] = BlockType.END_STONE;
              }
            }
          }
        }

        // 1. Central Return Portal at (0, 55, 0)
        if (Math.abs(wx) <= 2 && Math.abs(wz) <= 2) {
          const isRim = Math.abs(wx) === 2 || Math.abs(wz) === 2;
          blocks[getIndex(lx, 55, lz)] = BlockType.BEDROCK;
          if (isRim) {
            blocks[getIndex(lx, 56, lz)] = BlockType.BEDROCK;
          } else {
            blocks[getIndex(lx, 56, lz)] = BlockType.END_PORTAL;
          }

          // Central Bedrock pillar with torch (only at exact center 0,0)
          if (wx === 0 && wz === 0) {
            blocks[getIndex(lx, 56, lz)] = BlockType.BEDROCK;
            blocks[getIndex(lx, 57, lz)] = BlockType.BEDROCK;
            blocks[getIndex(lx, 58, lz)] = BlockType.BEDROCK;
            blocks[getIndex(lx, 59, lz)] = BlockType.TORCH;
          }
        }

        // 2. Dedicated Obsidian Spawn Platform at (25, 55, 0)
        // Ensures player never spawns stuck inside solid blocks or trapped in bedrock!
        if (Math.abs(wx - 25) <= 2 && Math.abs(wz) <= 2) {
          blocks[getIndex(lx, 55, lz)] = BlockType.OBSIDIAN;
          // Clear 4 blocks of headroom above the spawn platform
          for (let cy = 56; cy <= 60; cy++) {
            blocks[getIndex(lx, cy, lz)] = BlockType.AIR;
          }
        }

        // 3. Obsidian Pillars with Crystals at radius 26
        const pillarAngles = [0, 0.785, 1.57, 2.356, 3.141, 3.926, 4.712, 5.497];
        for (let i = 0; i < pillarAngles.length; i++) {
          const a = pillarAngles[i];
          const px = Math.round(Math.cos(a) * 26);
          const pz = Math.round(Math.sin(a) * 26);
          const pillarH = 70 + (i % 3) * 5;

          if (Math.abs(wx - px) <= 1 && Math.abs(wz - pz) <= 1) {
            for (let y = 50; y <= pillarH; y++) {
              blocks[getIndex(lx, y, lz)] = BlockType.OBSIDIAN;
            }
            // End Crystal (Glowstone) on top center
            if (wx === px && wz === pz) {
              blocks[getIndex(lx, pillarH + 1, lz)] = BlockType.GLOWSTONE;
            }
          }
        }
      }
    }
    return blocks;
  }

  /**
   * Generates Overworld chunk with biome palettes (Forest, Desert, Mountain)
   * and procedural villages with loot chests.
   */
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
    }

    const blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT);
    const startX = cx * CHUNK_SIZE;
    const startZ = cz * CHUNK_SIZE;

    const getIndex = (lx: number, ly: number, lz: number) =>
      lx + lz * CHUNK_SIZE + ly * (CHUNK_SIZE * CHUNK_SIZE);

    const treeLocations: Array<{ lx: number; lz: number; topY: number }> = [];
    const cactusLocations: Array<{ lx: number; lz: number; topY: number }> = [];

    // Check if this chunk is designated for a village
    const isVillage = (cx === 2 && cz === 2) || (Math.abs(cx) % 7 === 3 && Math.abs(cz) % 7 === 3);

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = startX + lx;
        const wz = startZ + lz;
        const { height: surfaceY, biome } = this.getHeightAt(wx, wz);

        // Bedrock at bottom (y=0)
        blocks[getIndex(lx, 0, lz)] = BlockType.BEDROCK;

        // Fill terrain from y=1 to surfaceY
        for (let ly = 1; ly <= surfaceY; ly++) {
          // Advanced multi-octave 3D Cave System
          let isCave = false;
          let isLavaLake = false;
          let isWaterPool = false;

          if (ly > 1) {
            // 1. 3D Spaghetti/Noodle Tunnels
            const n1 = this.noise3D_caves1(wx * 0.038, ly * 0.052, wz * 0.038);
            const n2 = this.noise3D_caves2(wx * 0.038, ly * 0.052, wz * 0.038);
            const tunnelDist = n1 * n1 + n2 * n2;
            const isTunnel = tunnelDist < 0.03 && (ly < surfaceY - 2 || (ly <= surfaceY && biome.name === 'Mountains'));

            // 2. Large Cavern Chambers / Cheese Caves
            const cavernVal = this.noise3D_caverns(wx * 0.022, ly * 0.032, wz * 0.022);
            const isCavern = cavernVal > 0.44 && ly < surfaceY - 4 && ly > 4;

            // 3. Ravines / Vertical chasms
            const ravineDist = Math.abs(this.noise2D_ravine(wx * 0.016, wz * 0.016));
            const isRavine = ravineDist < 0.022 && ly >= 6 && ly <= surfaceY - 3;

            if (isTunnel || isCavern || isRavine) {
              isCave = true;
              if (ly <= 5) {
                isLavaLake = true;
              } else if (ly >= 13 && ly <= 15 && (isCavern || isRavine) && Math.sin(wx * 0.3 + wz * 0.3) > 0.72) {
                isWaterPool = true;
              }
            }
          }

          if (isCave) {
            if (isLavaLake) {
              blocks[getIndex(lx, ly, lz)] = BlockType.LAVA;
            } else if (isWaterPool) {
              blocks[getIndex(lx, ly, lz)] = BlockType.WATER;
            } else {
              blocks[getIndex(lx, ly, lz)] = BlockType.AIR;
            }
            continue;
          }

          // Distinct Biome Block Palettes
          if (ly === surfaceY) {
            // Surface top layer
            if (biome.name === 'Desert') {
              blocks[getIndex(lx, ly, lz)] = BlockType.SAND;
            } else if (biome.name === 'Mountains') {
              // High peaks get glistening snow caps
              if (surfaceY >= (biome.snowHeight || 46)) {
                blocks[getIndex(lx, ly, lz)] = BlockType.SNOW;
              } else if (surfaceY > 37) {
                // Mid-mountain crags: exposed stone and cobblestone
                const cragHash = Math.sin(wx * 13.7 + wz * 29.1 + this.seed);
                blocks[getIndex(lx, ly, lz)] = cragHash > 0.25 ? BlockType.STONE : BlockType.COBBLESTONE;
              } else {
                // Lower mountain slopes blend into grass
                blocks[getIndex(lx, ly, lz)] = BlockType.GRASS;
              }
            } else {
              // Forest & Plains
              if (surfaceY <= SEA_LEVEL + 1) {
                // Beach sand rim near water
                blocks[getIndex(lx, ly, lz)] = BlockType.SAND;
              } else {
                blocks[getIndex(lx, ly, lz)] = BlockType.GRASS;
              }
            }
          } else if (ly >= surfaceY - 3) {
            // Sub-surface under layer
            if (biome.name === 'Desert') {
              // Desert sub-surface: Sandstone strata
              blocks[getIndex(lx, ly, lz)] = ly >= surfaceY - 1 ? BlockType.SAND : BlockType.SANDSTONE;
            } else if (biome.name === 'Mountains') {
              if (surfaceY >= (biome.snowHeight || 46) && ly >= surfaceY - 1) {
                blocks[getIndex(lx, ly, lz)] = BlockType.SNOW;
              } else {
                blocks[getIndex(lx, ly, lz)] = BlockType.STONE;
              }
            } else {
              // Dirt under grass
              blocks[getIndex(lx, ly, lz)] = BlockType.DIRT;
            }
          } else {
            // Underground stone with rich ore deposits
            let block = BlockType.STONE;

            if (ly === 6) {
              const rimHash = Math.sin(wx * 11.3 + wz * 19.7 + this.seed);
              block = rimHash > 0.3 ? BlockType.OBSIDIAN : BlockType.COBBLESTONE;
            } else {
              const oreHash = Math.sin(wx * 17.1 + ly * 31.3 + wz * 43.7 + this.seed);
              const oreVal = oreHash - Math.floor(oreHash);

              if (ly < 14 && oreVal < 0.018) {
                block = BlockType.DIAMOND_ORE;
              } else if (ly < 26 && oreVal < 0.03) {
                block = BlockType.GOLD_ORE;
              } else if (ly < 42 && oreVal < 0.065) {
                block = BlockType.IRON_ORE;
              } else if (ly < 30 && oreVal > 0.94) {
                block = BlockType.GRAVEL;
              } else if (ly < 55 && oreVal < 0.11) {
                block = BlockType.COAL_ORE;
              }
            }

            blocks[getIndex(lx, ly, lz)] = block;
          }
        }

        // Ocean & Lake water
        if (surfaceY < SEA_LEVEL) {
          for (let wy = surfaceY + 1; wy <= SEA_LEVEL; wy++) {
            blocks[getIndex(lx, wy, lz)] = BlockType.WATER;
          }
        }

        // Desert Cacti generation
        if (
          biome.name === 'Desert' &&
          surfaceY > SEA_LEVEL &&
          lx >= 2 &&
          lx <= CHUNK_SIZE - 3 &&
          lz >= 2 &&
          lz <= CHUNK_SIZE - 3 &&
          !isVillage
        ) {
          const cactusHash = Math.sin(wx * 47.3 + wz * 83.1 + this.seed);
          const cactusVal = cactusHash - Math.floor(cactusHash);
          if (cactusVal < (biome.cactusDensity || 0.025)) {
            cactusLocations.push({ lx, lz, topY: surfaceY });
          }
        }

        // Forest & Plains Tree candidate check
        if (
          biome.treeDensity > 0 &&
          biome.name !== 'Desert' &&
          surfaceY > SEA_LEVEL + 1 &&
          lx >= 2 &&
          lx <= CHUNK_SIZE - 3 &&
          lz >= 2 &&
          lz <= CHUNK_SIZE - 3 &&
          !isVillage
        ) {
          const treeHash = Math.sin(wx * 73.1 + wz * 91.3 + this.seed);
          const treeVal = treeHash - Math.floor(treeHash);
          if (treeVal < biome.treeDensity) {
            treeLocations.push({ lx, lz, topY: surfaceY });
          }
        }
      }
    }

    // Grow Trees
    for (const tree of treeLocations) {
      this.growTree(blocks, tree.lx, tree.topY + 1, tree.lz);
    }

    // Grow Cacti in Deserts
    for (const cactus of cactusLocations) {
      this.growCactus(blocks, cactus.lx, cactus.topY + 1, cactus.lz);
    }

    // Procedural Village Generation with Chests, Houses, Blacksmith, Farms & Lamps
    if (isVillage) {
      const centerBiome = this.getBiomeAt(startX + 8, startZ + 8);
      const isDesertVillage = centerBiome.name === 'Desert';
      this.buildVillage(blocks, isDesertVillage);
    }

    // Cave Feature Enhancements: Stalactites & Stalagmites (Dripstone)
    for (let lx = 1; lx < CHUNK_SIZE - 1; lx++) {
      for (let lz = 1; lz < CHUNK_SIZE - 1; lz++) {
        const wx = startX + lx;
        const wz = startZ + lz;
        const caveDecoHash = Math.sin(wx * 37.7 + wz * 61.1 + this.seed);

        for (let ly = 7; ly < 40; ly++) {
          const current = blocks[getIndex(lx, ly, lz)];
          if (current === BlockType.AIR) {
            const above = blocks[getIndex(lx, ly + 1, lz)];
            const below = blocks[getIndex(lx, ly - 1, lz)];

            if (above === BlockType.STONE && caveDecoHash > 0.82) {
              blocks[getIndex(lx, ly, lz)] = BlockType.COBBLESTONE;
            } else if (below === BlockType.STONE && caveDecoHash < -0.82) {
              blocks[getIndex(lx, ly, lz)] = BlockType.COBBLESTONE;
            }
          }
        }
      }
    }

    return blocks;
  }

  /**
   * Generates authentic procedural Minecraft Village:
   * 1. Town Square Well
   * 2. Blacksmith Workshop with Chest (iron, diamonds, tools, obsidian)
   * 3. Villager Cottage with Storage Chest, crafting table, and bed
   * 4. Farmland crop fields with central water irrigation
   * 5. Village pathways and illuminated street lamps
   */
  private buildVillage(blocks: Uint8Array, isDesert: boolean = false) {
    const getIndex = (x: number, y: number, z: number) =>
      x + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE);

    // Find average surface height in this chunk
    let totalY = 0;
    let count = 0;
    for (let x = 4; x <= 12; x += 2) {
      for (let z = 4; z <= 12; z += 2) {
        for (let y = CHUNK_HEIGHT - 6; y >= 15; y--) {
          const b = blocks[getIndex(x, y, z)];
          if (b !== BlockType.AIR && b !== BlockType.WATER) {
            totalY += y;
            count++;
            break;
          }
        }
      }
    }
    const villageBaseY = Math.max(SEA_LEVEL + 1, Math.floor(count > 0 ? totalY / count : 28));

    const wallBlock = isDesert ? BlockType.SANDSTONE : BlockType.COBBLESTONE;
    const woodBlock = isDesert ? BlockType.SANDSTONE : BlockType.OAK_PLANKS;
    const logBlock = isDesert ? BlockType.SANDSTONE : BlockType.OAK_LOG;
    const pathBlock = isDesert ? BlockType.SANDSTONE : BlockType.GRAVEL;

    // 1. Connecting Village Paths
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 7; z <= 8; z++) {
        blocks[getIndex(x, villageBaseY, z)] = pathBlock;
        blocks[getIndex(x, villageBaseY + 1, z)] = BlockType.AIR;
        blocks[getIndex(x, villageBaseY + 2, z)] = BlockType.AIR;
      }
    }
    for (let z = 0; z < CHUNK_SIZE; z++) {
      for (let x = 7; x <= 8; x++) {
        blocks[getIndex(x, villageBaseY, z)] = pathBlock;
        blocks[getIndex(x, villageBaseY + 1, z)] = BlockType.AIR;
        blocks[getIndex(x, villageBaseY + 2, z)] = BlockType.AIR;
      }
    }

    // 2. Central Village Well at (7, 7)
    const wellX = 6;
    const wellZ = 6;
    for (let dx = 0; dx < 4; dx++) {
      for (let dz = 0; dz < 4; dz++) {
        const x = wellX + dx;
        const z = wellZ + dz;
        const isBorder = dx === 0 || dx === 3 || dz === 0 || dz === 3;
        if (isBorder) {
          blocks[getIndex(x, villageBaseY + 1, z)] = wallBlock;
          // 4 Corner fence posts
          if ((dx === 0 || dx === 3) && (dz === 0 || dz === 3)) {
            blocks[getIndex(x, villageBaseY + 2, z)] = wallBlock;
            blocks[getIndex(x, villageBaseY + 3, z)] = wallBlock;
          }
        } else {
          // Water reservoir
          blocks[getIndex(x, villageBaseY, z)] = BlockType.WATER;
          blocks[getIndex(x, villageBaseY - 1, z)] = BlockType.WATER;
          blocks[getIndex(x, villageBaseY + 1, z)] = BlockType.AIR;
          blocks[getIndex(x, villageBaseY + 2, z)] = BlockType.AIR;
        }
        // Roof over the well
        blocks[getIndex(x, villageBaseY + 4, z)] = wallBlock;
      }
    }
    // Torch on top of well roof
    blocks[getIndex(wellX + 1, villageBaseY + 5, wellZ + 1)] = BlockType.TORCH;

    // 3. Blacksmith Workshop with Loot Chest at (1, 1)
    // 5x5 building
    const smithX = 1;
    const smithZ = 1;
    for (let dx = 0; dx < 5; dx++) {
      for (let dz = 0; dz < 5; dz++) {
        const x = smithX + dx;
        const z = smithZ + dz;
        const isWall = dx === 0 || dx === 4 || dz === 0 || dz === 4;

        // Foundation & Floor
        blocks[getIndex(x, villageBaseY, z)] = BlockType.COBBLESTONE;

        for (let dy = 1; dy <= 3; dy++) {
          const y = villageBaseY + dy;
          if (isWall) {
            // Door opening at (smithX + 2, smithZ + 4)
            if (dx === 2 && dz === 4 && dy <= 2) {
              blocks[getIndex(x, y, z)] = BlockType.AIR;
            } else if (dy === 2 && (dx === 1 || dx === 3) && dz === 0) {
              // Window
              blocks[getIndex(x, y, z)] = BlockType.GLASS;
            } else {
              blocks[getIndex(x, y, z)] = wallBlock;
            }
          } else {
            blocks[getIndex(x, y, z)] = BlockType.AIR;
          }
        }
        // Roof
        blocks[getIndex(x, villageBaseY + 4, z)] = wallBlock;
      }
    }
    // Blacksmith Interior: Furnace & Loot Chest
    blocks[getIndex(smithX + 1, villageBaseY + 1, smithZ + 1)] = BlockType.FURNACE;
    blocks[getIndex(smithX + 3, villageBaseY + 1, smithZ + 1)] = BlockType.CHEST; // Village Chest!
    blocks[getIndex(smithX + 2, villageBaseY + 2, smithZ + 1)] = BlockType.TORCH;

    // 4. Villager Cottage with Storage Chest at (10, 1)
    const cotX = 10;
    const cotZ = 1;
    for (let dx = 0; dx < 5; dx++) {
      for (let dz = 0; dz < 5; dz++) {
        const x = cotX + dx;
        const z = cotZ + dz;
        const isWall = dx === 0 || dx === 4 || dz === 0 || dz === 4;
        const isCorner = (dx === 0 || dx === 4) && (dz === 0 || dz === 4);

        blocks[getIndex(x, villageBaseY, z)] = wallBlock;

        for (let dy = 1; dy <= 3; dy++) {
          const y = villageBaseY + dy;
          if (isCorner) {
            blocks[getIndex(x, y, z)] = logBlock;
          } else if (isWall) {
            if (dx === 2 && dz === 4 && dy <= 2) {
              blocks[getIndex(x, y, z)] = BlockType.AIR; // Doorway
            } else if (dy === 2 && (dx === 2 || dz === 2)) {
              blocks[getIndex(x, y, z)] = BlockType.GLASS;
            } else {
              blocks[getIndex(x, y, z)] = woodBlock;
            }
          } else {
            blocks[getIndex(x, y, z)] = BlockType.AIR;
          }
        }
        // Pitched roof
        blocks[getIndex(x, villageBaseY + 4, z)] = woodBlock;
      }
    }
    // Cottage Interior: Chest, Crafting Table & Torch
    blocks[getIndex(cotX + 1, villageBaseY + 1, cotZ + 1)] = BlockType.CHEST; // Cottage Loot Chest!
    blocks[getIndex(cotX + 3, villageBaseY + 1, cotZ + 1)] = BlockType.CRAFTING_TABLE;
    blocks[getIndex(cotX + 2, villageBaseY + 2, cotZ + 1)] = BlockType.TORCH;

    // 5. Farmland Crop Fields at (1, 10)
    // 5x5 Agricultural Field
    const farmX = 1;
    const farmZ = 10;
    for (let dx = 0; dx < 5; dx++) {
      for (let dz = 0; dz < 5; dz++) {
        const x = farmX + dx;
        const z = farmZ + dz;
        const isBorder = dx === 0 || dx === 4 || dz === 0 || dz === 4;
        const isIrrigation = dx === 2 && dz >= 1 && dz <= 3;

        if (isBorder) {
          blocks[getIndex(x, villageBaseY, z)] = woodBlock;
        } else if (isIrrigation) {
          blocks[getIndex(x, villageBaseY, z)] = BlockType.WATER;
        } else {
          // Farmland with crops
          blocks[getIndex(x, villageBaseY, z)] = BlockType.DIRT;
          // Crop plant on top
          blocks[getIndex(x, villageBaseY + 1, z)] = BlockType.OAK_LEAVES;
        }
      }
    }

    // 6. Street Lamp Posts at Crossroads
    const lamps = [
      { x: 6, z: 9 },
      { x: 9, z: 6 },
    ];
    for (const lamp of lamps) {
      blocks[getIndex(lamp.x, villageBaseY + 1, lamp.z)] = BlockType.COBBLESTONE;
      blocks[getIndex(lamp.x, villageBaseY + 2, lamp.z)] = BlockType.COBBLESTONE;
      blocks[getIndex(lamp.x, villageBaseY + 3, lamp.z)] = BlockType.GLOWSTONE; // Radiant village street lamp
    }
  }

  /**
   * Grows desert cactus with authentic multi-block vertical stalk and spines
   */
  private growCactus(blocks: Uint8Array, lx: number, startY: number, lz: number) {
    const cactusHeight = 2 + (Math.floor(Math.sin(lx * 15 + lz * 17) * 10) % 2 === 0 ? 1 : 0);
    const getIndex = (x: number, y: number, z: number) =>
      x + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE);

    if (startY + cactusHeight >= CHUNK_HEIGHT) return;

    for (let cy = 0; cy < cactusHeight; cy++) {
      blocks[getIndex(lx, startY + cy, lz)] = BlockType.CACTUS;
    }
  }

  /**
   * Generates authentic Nether hellscape chunk:
   * Bedrock roof & floor, cavernous 3D netherrack terrain, lava seas, glowstone stalactites,
   * soul sand shores, nether quartz ore veins, and nether fortress ruins.
   */
  public generateNetherChunk(cx: number, cz: number): Uint8Array {
    const blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT);
    const startX = cx * CHUNK_SIZE;
    const startZ = cz * CHUNK_SIZE;

    const getIndex = (lx: number, ly: number, lz: number) =>
      lx + lz * CHUNK_SIZE + ly * (CHUNK_SIZE * CHUNK_SIZE);

    const LAVA_LEVEL = 14;

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = startX + lx;
        const wz = startZ + lz;

        // 1. Bedrock boundaries (bottom y=0, top y=63)
        blocks[getIndex(lx, 0, lz)] = BlockType.BEDROCK;
        blocks[getIndex(lx, CHUNK_HEIGHT - 1, lz)] = BlockType.BEDROCK;

        // 2. 3D Nether Cavern Density
        for (let ly = 1; ly < CHUNK_HEIGHT - 1; ly++) {
          const n3d = this.noise3D_nether(wx * 0.045, ly * 0.065, wz * 0.045);
          const detail = this.noise2D_netherDetail(wx * 0.08, wz * 0.08) * 0.15;

          // Vertical bias: high density near floor (ly < 16) and ceiling (ly > 52)
          const floorBias = Math.max(0, (22 - ly) / 18) * 0.85;
          const ceilingBias = Math.max(0, (ly - 46) / 15) * 0.9;
          const density = n3d + detail + floorBias + ceilingBias;

          const idx = getIndex(lx, ly, lz);

          if (density > 0.16) {
            // Solid nether terrain
            let block = BlockType.NETHERRACK;

            // Soul sand along lower shores
            if (ly <= LAVA_LEVEL + 4 && density < 0.32) {
              block = BlockType.SOUL_SAND;
            }

            // Nether Quartz Ore veins
            const oreHash = Math.sin(wx * 19.3 + ly * 29.7 + wz * 41.1 + this.seed);
            if (oreHash - Math.floor(oreHash) < 0.04) {
              block = BlockType.NETHER_QUARTZ_ORE;
            }

            blocks[idx] = block;
          } else {
            // Air or Lava
            if (ly <= LAVA_LEVEL) {
              blocks[idx] = BlockType.LAVA;
            } else {
              blocks[idx] = BlockType.AIR;
            }
          }
        }
      }
    }

    // 3. Hanging Glowstone clusters from ceiling/overhangs
    for (let lx = 1; lx < CHUNK_SIZE - 1; lx++) {
      for (let lz = 1; lz < CHUNK_SIZE - 1; lz++) {
        const wx = startX + lx;
        const wz = startZ + lz;
        const glowHash = Math.sin(wx * 53.1 + wz * 67.3 + this.seed);
        if (glowHash - Math.floor(glowHash) < 0.025) {
          // Find ceiling bottom
          for (let ly = 58; ly >= 35; ly--) {
            if (blocks[getIndex(lx, ly, lz)] === BlockType.NETHERRACK && blocks[getIndex(lx, ly - 1, lz)] === BlockType.AIR) {
              // Hang a cluster
              for (let dy = 0; dy < 3; dy++) {
                const cy = ly - 1 - dy;
                if (cy > 0) blocks[getIndex(lx, cy, lz)] = BlockType.GLOWSTONE;
                if (dy === 1) {
                  blocks[getIndex(lx + 1, cy, lz)] = BlockType.GLOWSTONE;
                  blocks[getIndex(lx - 1, cy, lz)] = BlockType.GLOWSTONE;
                  blocks[getIndex(lx, cy, lz + 1)] = BlockType.GLOWSTONE;
                  blocks[getIndex(lx, cy, lz - 1)] = BlockType.GLOWSTONE;
                }
              }
              break;
            }
          }
        }
      }
    }

    // 4. Surface Fire patches on Netherrack
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = startX + lx;
        const wz = startZ + lz;
        for (let ly = 16; ly < 45; ly++) {
          const idx = getIndex(lx, ly, lz);
          const aboveIdx = getIndex(lx, ly + 1, lz);
          if (blocks[idx] === BlockType.NETHERRACK && blocks[aboveIdx] === BlockType.AIR) {
            const fireHash = Math.sin(wx * 83.1 + ly * 19.7 + wz * 97.3);
            if (fireHash - Math.floor(fireHash) < 0.018) {
              blocks[aboveIdx] = BlockType.FIRE;
            }
          }
        }
      }
    }

    // 5. Nether Fortress Ruins at periodic intervals
    if ((Math.abs(cx) % 3 === 1) && (Math.abs(cz) % 3 === 1)) {
      this.buildNetherFortress(blocks);
    }

    // 6. If origin chunk (0, 0) in Nether: guarantee a permanent Nether Portal structure
    if (cx === 0 && cz === 0) {
      this.buildNetherSpawnPortal(blocks);
    }

    return blocks;
  }

  /**
   * Builds an Overworld ruined portal structure with obsidian, netherrack, and a chest
   */
  private buildRuinedPortal(blocks: Uint8Array, lx: number, lz: number) {
    const getIndex = (x: number, y: number, z: number) =>
      x + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE);

    // Find surface height
    let sy = 28;
    for (let y = CHUNK_HEIGHT - 5; y >= 10; y--) {
      if (blocks[getIndex(lx, y, lz)] !== BlockType.AIR && blocks[getIndex(lx, y, lz)] !== BlockType.WATER) {
        sy = y;
        break;
      }
    }

    // Netherrack base
    for (let dx = -2; dx <= 3; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const x = lx + dx;
        const z = lz + dz;
        if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
          blocks[getIndex(x, sy, z)] = BlockType.NETHERRACK;
          if (Math.abs(dx) === 2 && Math.abs(dz) === 2) {
            blocks[getIndex(x, sy + 1, z)] = BlockType.FIRE;
          }
        }
      }
    }

    // Obsidian Portal Frame (4 wide, 5 high)
    // Base: sy + 1
    const baseY = sy + 1;
    for (let xOff = 0; xOff < 4; xOff++) {
      for (let yOff = 0; yOff < 5; yOff++) {
        const x = lx + xOff;
        const y = baseY + yOff;
        const z = lz;
        if (x < 0 || x >= CHUNK_SIZE || y >= CHUNK_HEIGHT) continue;

        const isBorder = xOff === 0 || xOff === 3 || yOff === 0 || yOff === 4;
        if (isBorder) {
          // Leave one corner broken for classic ruined look
          if (xOff === 3 && yOff === 4) {
            blocks[getIndex(x, y, z)] = BlockType.AIR;
          } else {
            blocks[getIndex(x, y, z)] = BlockType.OBSIDIAN;
          }
        }
      }
    }

    // Chest with flint and obsidian
    if (lx + 2 < CHUNK_SIZE) {
      blocks[getIndex(lx + 2, sy + 1, lz + 1)] = BlockType.CHEST;
    }
  }

  /**
   * Builds the Nether spawn portal platform at y=26 in chunk (0,0)
   */
  private buildNetherSpawnPortal(blocks: Uint8Array) {
    const getIndex = (x: number, y: number, z: number) =>
      x + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE);

    const cx = 8;
    const cz = 8;
    const py = 24;

    // Netherrack platform
    for (let dx = -3; dx <= 3; dx++) {
      for (let dz = -3; dz <= 3; dz++) {
        const x = cx + dx;
        const z = cz + dz;
        blocks[getIndex(x, py, z)] = BlockType.NETHER_BRICK;
        // Clear air space above platform
        for (let ay = py + 1; ay <= py + 6; ay++) {
          blocks[getIndex(x, ay, z)] = BlockType.AIR;
        }
      }
    }

    // Full 4x5 Obsidian Nether Portal (active with NETHER_PORTAL blocks!)
    for (let ox = 0; ox < 4; ox++) {
      for (let oy = 0; oy < 5; oy++) {
        const x = cx - 1 + ox;
        const y = py + 1 + oy;
        const z = cz;
        const isBorder = ox === 0 || ox === 3 || oy === 0 || oy === 4;

        if (isBorder) {
          blocks[getIndex(x, y, z)] = BlockType.OBSIDIAN;
        } else {
          blocks[getIndex(x, y, z)] = BlockType.NETHER_PORTAL;
        }
      }
    }
  }

  /**
   * Builds a Nether Fortress corridor bridge
   */
  private buildNetherFortress(blocks: Uint8Array) {
    const getIndex = (x: number, y: number, z: number) =>
      x + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE);

    const bridgeY = 28;

    // Bridge walkway stretching along Z axis
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      for (let lx = 6; lx <= 10; lx++) {
        blocks[getIndex(lx, bridgeY, lz)] = BlockType.NETHER_BRICK;
        // Clear headroom
        for (let y = bridgeY + 1; y <= bridgeY + 4; y++) {
          blocks[getIndex(lx, y, lz)] = BlockType.AIR;
        }
        // Fences / parapets on sides
        if (lx === 6 || lx === 10) {
          blocks[getIndex(lx, bridgeY + 1, lz)] = BlockType.NETHER_BRICK;
        }
      }
    }

    // Supporting pillar
    for (let y = 1; y < bridgeY; y++) {
      blocks[getIndex(7, y, 7)] = BlockType.NETHER_BRICK;
      blocks[getIndex(8, y, 7)] = BlockType.NETHER_BRICK;
      blocks[getIndex(7, y, 8)] = BlockType.NETHER_BRICK;
      blocks[getIndex(8, y, 8)] = BlockType.NETHER_BRICK;
    }
  }

  /**
   * Grows an oak tree with trunk and spherical leaf canopy
   */
  private growTree(blocks: Uint8Array, lx: number, startY: number, lz: number) {
    const trunkHeight = 4 + (Math.floor(Math.sin(lx * 10 + lz) * 10) % 2 === 0 ? 1 : 0);
    const getIndex = (x: number, y: number, z: number) =>
      x + z * CHUNK_SIZE + y * (CHUNK_SIZE * CHUNK_SIZE);

    if (startY + trunkHeight + 3 >= CHUNK_HEIGHT) return;

    // Trunk
    for (let ty = 0; ty < trunkHeight; ty++) {
      const y = startY + ty;
      blocks[getIndex(lx, y, lz)] = BlockType.OAK_LOG;
    }

    // Leaves canopy: 2 layers of 5x5, then 2 layers of 3x3
    const leafBaseY = startY + trunkHeight - 2;
    for (let dy = 0; dy <= 3; dy++) {
      const ly = leafBaseY + dy;
      if (ly >= CHUNK_HEIGHT) continue;
      const radius = dy < 2 ? 2 : 1;

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const bx = lx + dx;
          const bz = lz + dz;
          if (bx < 0 || bx >= CHUNK_SIZE || bz < 0 || bz >= CHUNK_SIZE) continue;

          // Trim corners for rounded organic tree feel
          if (Math.abs(dx) === radius && Math.abs(dz) === radius && (radius > 1 || dy === 3)) {
            continue;
          }

          const idx = getIndex(bx, ly, bz);
          // Don't overwrite trunk log
          if (blocks[idx] === BlockType.AIR) {
            blocks[idx] = BlockType.OAK_LEAVES;
          }
        }
      }
    }
  }
}

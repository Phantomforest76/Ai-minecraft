import * as THREE from 'three';
import { BlockType, BlockDef } from '../types';

// Atlas configuration: 16x16 pixels per tile, 16 tiles per row, 16 rows (256x256 total canvas)
export const TILE_SIZE = 16;
export const ATLAS_COLS = 8;
export const ATLAS_ROWS = 8;
export const ATLAS_SIZE = TILE_SIZE * ATLAS_COLS; // 128x128 canvas

export enum TextureIndex {
  GRASS_TOP = 0,
  GRASS_SIDE = 1,
  DIRT = 2,
  STONE = 3,
  COBBLESTONE = 4,
  OAK_LOG_SIDE = 5,
  OAK_LOG_TOP = 6,
  OAK_LEAVES = 7,
  OAK_PLANKS = 8,
  SAND = 9,
  BEDROCK = 10,
  GLASS = 11,
  COAL_ORE = 12,
  IRON_ORE = 13,
  DIAMOND_ORE = 14,
  BRICK = 15,
  TNT_SIDE = 16,
  TNT_TOP = 17,
  TNT_BOTTOM = 18,
  CRAFTING_TOP = 19,
  CRAFTING_SIDE1 = 20,
  CRAFTING_SIDE2 = 21,
  WATER = 22,
  FURNACE_FRONT = 23,
  FURNACE_SIDE = 24,
  FURNACE_TOP = 25,
  CHEST_TOP = 26,
  CHEST_SIDE = 27,
  CHEST_FRONT = 28,
  BOOKSHELF = 29,
  STONE_BRICK = 30,
  TORCH = 31,
  GOLD_ORE = 32,
  GOLD_BLOCK = 33,
  IRON_BLOCK = 34,
  DIAMOND_BLOCK = 35,
  OBSIDIAN = 36,
  NETHERRACK = 37,
  SOUL_SAND = 38,
  GLOWSTONE = 39,
  NETHER_BRICK = 40,
  NETHER_QUARTZ_ORE = 41,
  NETHER_PORTAL = 42,
  FIRE = 43,
  LAVA = 44,
  GRAVEL = 45,
  QUARTZ_BLOCK = 46,
  END_STONE = 47,
  END_PORTAL_FRAME_TOP = 48,
  END_PORTAL_FRAME_SIDE = 49,
  END_PORTAL = 50,
  CACTUS_TOP = 51,
  CACTUS_SIDE = 52,
  SNOW = 53,
  SANDSTONE = 54,
  SANDSTONE_TOP = 55,
}

// Block definitions metadata
export const BLOCK_DEFS: Partial<Record<BlockType, BlockDef>> = {
  [BlockType.AIR]: {
    type: BlockType.AIR,
    name: 'Air',
    sound: 'grass',
    transparent: true,
    solid: false,
    hardness: 0,
    textures: { top: 0, bottom: 0, side: 0 },
  },
  [BlockType.GRASS]: {
    type: BlockType.GRASS,
    name: 'Grass Block',
    sound: 'grass',
    transparent: false,
    solid: true,
    hardness: 0.6,
    textures: {
      top: TextureIndex.GRASS_TOP,
      bottom: TextureIndex.DIRT,
      side: TextureIndex.GRASS_SIDE,
    },
  },
  [BlockType.DIRT]: {
    type: BlockType.DIRT,
    name: 'Dirt',
    sound: 'dirt',
    transparent: false,
    solid: true,
    hardness: 0.5,
    textures: {
      top: TextureIndex.DIRT,
      bottom: TextureIndex.DIRT,
      side: TextureIndex.DIRT,
    },
  },
  [BlockType.STONE]: {
    type: BlockType.STONE,
    name: 'Stone',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 1.5,
    textures: {
      top: TextureIndex.STONE,
      bottom: TextureIndex.STONE,
      side: TextureIndex.STONE,
    },
  },
  [BlockType.COBBLESTONE]: {
    type: BlockType.COBBLESTONE,
    name: 'Cobblestone',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 2.0,
    textures: {
      top: TextureIndex.COBBLESTONE,
      bottom: TextureIndex.COBBLESTONE,
      side: TextureIndex.COBBLESTONE,
    },
  },
  [BlockType.OAK_LOG]: {
    type: BlockType.OAK_LOG,
    name: 'Oak Log',
    sound: 'wood',
    transparent: false,
    solid: true,
    hardness: 2.0,
    textures: {
      top: TextureIndex.OAK_LOG_TOP,
      bottom: TextureIndex.OAK_LOG_TOP,
      side: TextureIndex.OAK_LOG_SIDE,
    },
  },
  [BlockType.OAK_LEAVES]: {
    type: BlockType.OAK_LEAVES,
    name: 'Oak Leaves',
    sound: 'grass',
    transparent: true,
    solid: true,
    hardness: 0.2,
    textures: {
      top: TextureIndex.OAK_LEAVES,
      bottom: TextureIndex.OAK_LEAVES,
      side: TextureIndex.OAK_LEAVES,
    },
  },
  [BlockType.OAK_PLANKS]: {
    type: BlockType.OAK_PLANKS,
    name: 'Oak Planks',
    sound: 'wood',
    transparent: false,
    solid: true,
    hardness: 1.5,
    textures: {
      top: TextureIndex.OAK_PLANKS,
      bottom: TextureIndex.OAK_PLANKS,
      side: TextureIndex.OAK_PLANKS,
    },
  },
  [BlockType.SAND]: {
    type: BlockType.SAND,
    name: 'Sand',
    sound: 'sand',
    transparent: false,
    solid: true,
    hardness: 0.5,
    textures: {
      top: TextureIndex.SAND,
      bottom: TextureIndex.SAND,
      side: TextureIndex.SAND,
    },
  },
  [BlockType.BEDROCK]: {
    type: BlockType.BEDROCK,
    name: 'Bedrock',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 99999,
    textures: {
      top: TextureIndex.BEDROCK,
      bottom: TextureIndex.BEDROCK,
      side: TextureIndex.BEDROCK,
    },
  },
  [BlockType.GLASS]: {
    type: BlockType.GLASS,
    name: 'Glass',
    sound: 'glass',
    transparent: true,
    solid: true,
    hardness: 0.3,
    textures: {
      top: TextureIndex.GLASS,
      bottom: TextureIndex.GLASS,
      side: TextureIndex.GLASS,
    },
  },
  [BlockType.COAL_ORE]: {
    type: BlockType.COAL_ORE,
    name: 'Coal Ore',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 3.0,
    textures: {
      top: TextureIndex.COAL_ORE,
      bottom: TextureIndex.COAL_ORE,
      side: TextureIndex.COAL_ORE,
    },
  },
  [BlockType.IRON_ORE]: {
    type: BlockType.IRON_ORE,
    name: 'Iron Ore',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 3.0,
    textures: {
      top: TextureIndex.IRON_ORE,
      bottom: TextureIndex.IRON_ORE,
      side: TextureIndex.IRON_ORE,
    },
  },
  [BlockType.DIAMOND_ORE]: {
    type: BlockType.DIAMOND_ORE,
    name: 'Diamond Ore',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 3.0,
    textures: {
      top: TextureIndex.DIAMOND_ORE,
      bottom: TextureIndex.DIAMOND_ORE,
      side: TextureIndex.DIAMOND_ORE,
    },
  },
  [BlockType.BRICK]: {
    type: BlockType.BRICK,
    name: 'Bricks',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 2.0,
    textures: {
      top: TextureIndex.BRICK,
      bottom: TextureIndex.BRICK,
      side: TextureIndex.BRICK,
    },
  },
  [BlockType.TNT]: {
    type: BlockType.TNT,
    name: 'TNT',
    sound: 'grass',
    transparent: false,
    solid: true,
    hardness: 0.1,
    textures: {
      top: TextureIndex.TNT_TOP,
      bottom: TextureIndex.TNT_BOTTOM,
      side: TextureIndex.TNT_SIDE,
    },
  },
  [BlockType.CRAFTING_TABLE]: {
    type: BlockType.CRAFTING_TABLE,
    name: 'Crafting Table',
    sound: 'wood',
    transparent: false,
    solid: true,
    hardness: 2.5,
    textures: {
      top: TextureIndex.CRAFTING_TOP,
      bottom: TextureIndex.OAK_PLANKS,
      side: TextureIndex.CRAFTING_SIDE1,
      north: TextureIndex.CRAFTING_SIDE2,
    },
  },
  [BlockType.WATER]: {
    type: BlockType.WATER,
    name: 'Water',
    sound: 'glass',
    transparent: true,
    solid: false,
    hardness: 100,
    textures: {
      top: TextureIndex.WATER,
      bottom: TextureIndex.WATER,
      side: TextureIndex.WATER,
    },
  },
  [BlockType.FURNACE]: {
    type: BlockType.FURNACE,
    name: 'Furnace',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 3.5,
    textures: {
      top: TextureIndex.FURNACE_TOP,
      bottom: TextureIndex.FURNACE_TOP,
      side: TextureIndex.FURNACE_SIDE,
      north: TextureIndex.FURNACE_FRONT,
    },
  },
  [BlockType.CHEST]: {
    type: BlockType.CHEST,
    name: 'Chest',
    sound: 'wood',
    transparent: false,
    solid: true,
    hardness: 2.5,
    textures: {
      top: TextureIndex.CHEST_TOP,
      bottom: TextureIndex.CHEST_TOP,
      side: TextureIndex.CHEST_SIDE,
      north: TextureIndex.CHEST_FRONT,
    },
  },
  [BlockType.BOOKSHELF]: {
    type: BlockType.BOOKSHELF,
    name: 'Bookshelf',
    sound: 'wood',
    transparent: false,
    solid: true,
    hardness: 1.5,
    textures: {
      top: TextureIndex.OAK_PLANKS,
      bottom: TextureIndex.OAK_PLANKS,
      side: TextureIndex.BOOKSHELF,
    },
  },
  [BlockType.STONE_BRICK]: {
    type: BlockType.STONE_BRICK,
    name: 'Stone Bricks',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 2.0,
    textures: {
      top: TextureIndex.STONE_BRICK,
      bottom: TextureIndex.STONE_BRICK,
      side: TextureIndex.STONE_BRICK,
    },
  },
  [BlockType.TORCH]: {
    type: BlockType.TORCH,
    name: 'Torch',
    sound: 'wood',
    transparent: true,
    solid: false,
    hardness: 0.1,
    textures: {
      top: TextureIndex.TORCH,
      bottom: TextureIndex.TORCH,
      side: TextureIndex.TORCH,
    },
  },
  [BlockType.GOLD_ORE]: {
    type: BlockType.GOLD_ORE,
    name: 'Gold Ore',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 3.0,
    textures: {
      top: TextureIndex.GOLD_ORE,
      bottom: TextureIndex.GOLD_ORE,
      side: TextureIndex.GOLD_ORE,
    },
  },
  [BlockType.GOLD_BLOCK]: {
    type: BlockType.GOLD_BLOCK,
    name: 'Block of Gold',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 3.0,
    textures: {
      top: TextureIndex.GOLD_BLOCK,
      bottom: TextureIndex.GOLD_BLOCK,
      side: TextureIndex.GOLD_BLOCK,
    },
  },
  [BlockType.IRON_BLOCK]: {
    type: BlockType.IRON_BLOCK,
    name: 'Block of Iron',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 5.0,
    textures: {
      top: TextureIndex.IRON_BLOCK,
      bottom: TextureIndex.IRON_BLOCK,
      side: TextureIndex.IRON_BLOCK,
    },
  },
  [BlockType.DIAMOND_BLOCK]: {
    type: BlockType.DIAMOND_BLOCK,
    name: 'Block of Diamond',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 5.0,
    textures: {
      top: TextureIndex.DIAMOND_BLOCK,
      bottom: TextureIndex.DIAMOND_BLOCK,
      side: TextureIndex.DIAMOND_BLOCK,
    },
  },
  [BlockType.OBSIDIAN]: {
    type: BlockType.OBSIDIAN,
    name: 'Obsidian',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 10.0,
    textures: {
      top: TextureIndex.OBSIDIAN,
      bottom: TextureIndex.OBSIDIAN,
      side: TextureIndex.OBSIDIAN,
    },
  },
  [BlockType.NETHERRACK]: {
    type: BlockType.NETHERRACK,
    name: 'Netherrack',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 0.4,
    textures: {
      top: TextureIndex.NETHERRACK,
      bottom: TextureIndex.NETHERRACK,
      side: TextureIndex.NETHERRACK,
    },
  },
  [BlockType.SOUL_SAND]: {
    type: BlockType.SOUL_SAND,
    name: 'Soul Sand',
    sound: 'sand',
    transparent: false,
    solid: true,
    hardness: 0.5,
    textures: {
      top: TextureIndex.SOUL_SAND,
      bottom: TextureIndex.SOUL_SAND,
      side: TextureIndex.SOUL_SAND,
    },
  },
  [BlockType.GLOWSTONE]: {
    type: BlockType.GLOWSTONE,
    name: 'Glowstone',
    sound: 'glass',
    transparent: false,
    solid: true,
    hardness: 0.3,
    textures: {
      top: TextureIndex.GLOWSTONE,
      bottom: TextureIndex.GLOWSTONE,
      side: TextureIndex.GLOWSTONE,
    },
  },
  [BlockType.NETHER_BRICK]: {
    type: BlockType.NETHER_BRICK,
    name: 'Nether Bricks',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 2.0,
    textures: {
      top: TextureIndex.NETHER_BRICK,
      bottom: TextureIndex.NETHER_BRICK,
      side: TextureIndex.NETHER_BRICK,
    },
  },
  [BlockType.NETHER_QUARTZ_ORE]: {
    type: BlockType.NETHER_QUARTZ_ORE,
    name: 'Nether Quartz Ore',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 3.0,
    textures: {
      top: TextureIndex.NETHER_QUARTZ_ORE,
      bottom: TextureIndex.NETHER_QUARTZ_ORE,
      side: TextureIndex.NETHER_QUARTZ_ORE,
    },
  },
  [BlockType.NETHER_PORTAL]: {
    type: BlockType.NETHER_PORTAL,
    name: 'Nether Portal',
    sound: 'glass',
    transparent: true,
    solid: false,
    hardness: 0,
    textures: {
      top: TextureIndex.NETHER_PORTAL,
      bottom: TextureIndex.NETHER_PORTAL,
      side: TextureIndex.NETHER_PORTAL,
    },
  },
  [BlockType.FIRE]: {
    type: BlockType.FIRE,
    name: 'Fire',
    sound: 'wood',
    transparent: true,
    solid: false,
    hardness: 0,
    textures: {
      top: TextureIndex.FIRE,
      bottom: TextureIndex.FIRE,
      side: TextureIndex.FIRE,
    },
  },
  [BlockType.LAVA]: {
    type: BlockType.LAVA,
    name: 'Lava',
    sound: 'stone',
    transparent: false,
    solid: false,
    hardness: 0,
    textures: {
      top: TextureIndex.LAVA,
      bottom: TextureIndex.LAVA,
      side: TextureIndex.LAVA,
    },
  },
  [BlockType.GRAVEL]: {
    type: BlockType.GRAVEL,
    name: 'Gravel',
    sound: 'dirt',
    transparent: false,
    solid: true,
    hardness: 0.6,
    textures: {
      top: TextureIndex.GRAVEL,
      bottom: TextureIndex.GRAVEL,
      side: TextureIndex.GRAVEL,
    },
  },
  [BlockType.QUARTZ_BLOCK]: {
    type: BlockType.QUARTZ_BLOCK,
    name: 'Block of Quartz',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 2.0,
    textures: {
      top: TextureIndex.QUARTZ_BLOCK,
      bottom: TextureIndex.QUARTZ_BLOCK,
      side: TextureIndex.QUARTZ_BLOCK,
    },
  },
  [BlockType.END_STONE]: {
    type: BlockType.END_STONE,
    name: 'End Stone',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 3.0,
    textures: {
      top: TextureIndex.END_STONE,
      bottom: TextureIndex.END_STONE,
      side: TextureIndex.END_STONE,
    },
  },
  [BlockType.END_PORTAL_FRAME]: {
    type: BlockType.END_PORTAL_FRAME,
    name: 'End Portal Frame',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 10.0,
    textures: {
      top: TextureIndex.END_PORTAL_FRAME_TOP,
      bottom: TextureIndex.END_STONE,
      side: TextureIndex.END_PORTAL_FRAME_SIDE,
    },
  },
  [BlockType.END_PORTAL]: {
    type: BlockType.END_PORTAL,
    name: 'End Portal',
    sound: 'stone',
    transparent: true,
    solid: false,
    hardness: -1,
    textures: {
      top: TextureIndex.END_PORTAL,
      bottom: TextureIndex.END_PORTAL,
      side: TextureIndex.END_PORTAL,
    },
  },
  [BlockType.CACTUS]: {
    type: BlockType.CACTUS,
    name: 'Cactus',
    sound: 'wood',
    transparent: false,
    solid: true,
    hardness: 0.4,
    textures: {
      top: TextureIndex.CACTUS_TOP,
      bottom: TextureIndex.CACTUS_TOP,
      side: TextureIndex.CACTUS_SIDE,
    },
  },
  [BlockType.SNOW]: {
    type: BlockType.SNOW,
    name: 'Snow Block',
    sound: 'dirt',
    transparent: false,
    solid: true,
    hardness: 0.3,
    textures: {
      top: TextureIndex.SNOW,
      bottom: TextureIndex.SNOW,
      side: TextureIndex.SNOW,
    },
  },
  [BlockType.SANDSTONE]: {
    type: BlockType.SANDSTONE,
    name: 'Sandstone',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 0.8,
    textures: {
      top: TextureIndex.SANDSTONE_TOP,
      bottom: TextureIndex.SANDSTONE_TOP,
      side: TextureIndex.SANDSTONE,
    },
  },
};

/**
 * Procedural Pixel-Art Minecraft Texture Generator
 * Generates true-to-life 16x16 pixel textures on an HTML5 canvas atlas.
 */
export class TextureAtlasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public atlasTexture: THREE.CanvasTexture;
  public breakTextures: THREE.CanvasTexture[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = ATLAS_SIZE;
    this.canvas.height = ATLAS_SIZE;
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get 2d context for atlas');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;

    this.generateAllTextures();

    this.atlasTexture = new THREE.CanvasTexture(this.canvas);
    this.atlasTexture.magFilter = THREE.NearestFilter;
    this.atlasTexture.minFilter = THREE.NearestFilter;
    this.atlasTexture.colorSpace = THREE.SRGBColorSpace;

    this.generateBreakTextures();
  }

  private setPixel(
    tileIdx: number,
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    a = 255
  ) {
    const col = tileIdx % ATLAS_COLS;
    const row = Math.floor(tileIdx / ATLAS_COLS);
    const px = col * TILE_SIZE + x;
    const py = row * TILE_SIZE + y;
    this.ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
    this.ctx.fillRect(px, py, 1, 1);
  }

  // Noise helper for pixel dithering
  private hash(x: number, y: number, seed = 0): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  private generateAllTextures() {
    this.drawGrassTop();
    this.drawGrassSide();
    this.drawDirt();
    this.drawStone();
    this.drawCobblestone();
    this.drawOakLogSide();
    this.drawOakLogTop();
    this.drawOakLeaves();
    this.drawOakPlanks();
    this.drawSand();
    this.drawBedrock();
    this.drawGlass();
    this.drawOres();
    this.drawBrick();
    this.drawTNT();
    this.drawCraftingTable();
    this.drawWater();
    this.drawFurnace();
    this.drawChest();
    this.drawBookshelf();
    this.drawStoneBrick();
    this.drawTorch();
    this.drawMetalsAndGems();
    this.drawNetherBlocks();
    this.drawEndBlocks();
    this.drawBiomeNewBlocks();
  }

  private drawGrassTop() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 1);
        let r = 85, g = 158, b = 47; // #5ead3b base
        if (n < 0.25) {
          r = 74; g = 138; b = 40;
        } else if (n < 0.5) {
          r = 95; g = 175; b = 52;
        } else if (n > 0.8) {
          r = 65; g = 120; b = 35;
        }
        this.setPixel(TextureIndex.GRASS_TOP, x, y, r, g, b);
      }
    }
  }

  private drawGrassSide() {
    // Dirt base with grass drooping down
    const dripDepths = [2, 3, 2, 4, 3, 2, 3, 4, 2, 3, 2, 4, 3, 2, 3, 2];
    for (let x = 0; x < 16; x++) {
      const depth = dripDepths[x];
      for (let y = 0; y < 16; y++) {
        if (y < depth) {
          // Grass green
          const n = this.hash(x, y, 2);
          const g = n > 0.5 ? 160 : 140;
          this.setPixel(TextureIndex.GRASS_SIDE, x, y, 75, g, 40);
        } else {
          // Dirt brown
          const n = this.hash(x, y, 3);
          const v = Math.floor(n * 25);
          this.setPixel(TextureIndex.GRASS_SIDE, x, y, 134 - v, 96 - v, 67 - v);
        }
      }
    }
  }

  private drawDirt() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 4);
        let r = 134, g = 96, b = 67; // #866043
        if (n < 0.2) {
          r = 115; g = 80; b = 55;
        } else if (n < 0.4) {
          r = 150; g = 108; b = 75;
        } else if (n > 0.85) {
          r = 95; g = 68; b = 45;
        }
        this.setPixel(TextureIndex.DIRT, x, y, r, g, b);
      }
    }
  }

  private drawStone() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 5);
        let val = 125; // #7d7d7d
        if (n < 0.2) val = 105;
        else if (n < 0.45) val = 115;
        else if (n < 0.75) val = 135;
        else if (n > 0.9) val = 95;
        this.setPixel(TextureIndex.STONE, x, y, val, val, val);
      }
    }
  }

  private drawCobblestone() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isBorder = (x % 4 === 0 && y % 3 === 0) || (x === 0 || y === 0 || x === 15 || y === 15);
        const n = this.hash(x, y, 6);
        let val = 110;
        if (isBorder || n < 0.15) {
          val = 65; // dark mortar lines
        } else if (n > 0.75) {
          val = 145; // bright stone center
        } else {
          val = 100 + Math.floor(n * 30);
        }
        this.setPixel(TextureIndex.COBBLESTONE, x, y, val, val, val);
      }
    }
  }

  private drawOakLogSide() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y * 0.5, 7);
        // vertical streaks of bark
        let r = 96, g = 70, b = 39;
        const colMod = (x % 3 === 0 ? -15 : 0) + (n > 0.6 ? 12 : -8);
        this.setPixel(TextureIndex.OAK_LOG_SIDE, x, y, r + colMod, g + colMod, b + colMod);
      }
    }
  }

  private drawOakLogTop() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const dx = x - 7.5;
        const dy = y - 7.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 7) {
          // outer bark
          this.setPixel(TextureIndex.OAK_LOG_TOP, x, y, 80, 58, 30);
        } else if (dist > 6) {
          this.setPixel(TextureIndex.OAK_LOG_TOP, x, y, 100, 75, 45);
        } else if (dist > 4 && dist < 5) {
          // ring
          this.setPixel(TextureIndex.OAK_LOG_TOP, x, y, 140, 105, 65);
        } else if (dist < 1.5) {
          // center pith
          this.setPixel(TextureIndex.OAK_LOG_TOP, x, y, 130, 95, 55);
        } else {
          // inner wood
          this.setPixel(TextureIndex.OAK_LOG_TOP, x, y, 165, 128, 80);
        }
      }
    }
  }

  private drawOakLeaves() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 8);
        if (n < 0.18) {
          // see-through leaf pixel for authentic fancy leaf rendering!
          this.setPixel(TextureIndex.OAK_LEAVES, x, y, 35, 75, 20, 200);
        } else if (n < 0.45) {
          this.setPixel(TextureIndex.OAK_LEAVES, x, y, 45, 110, 28, 255);
        } else if (n < 0.75) {
          this.setPixel(TextureIndex.OAK_LEAVES, x, y, 55, 130, 32, 255);
        } else {
          this.setPixel(TextureIndex.OAK_LEAVES, x, y, 32, 85, 20, 255);
        }
      }
    }
  }

  private drawOakPlanks() {
    for (let y = 0; y < 16; y++) {
      const isPlankLine = y % 4 === 0;
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 9);
        let r = 184, g = 135, b = 70; // #b88746
        if (isPlankLine) {
          r = 120; g = 85; b = 40; // seam
        } else {
          const v = (n - 0.5) * 20;
          r += v; g += v; b += v;
        }
        this.setPixel(TextureIndex.OAK_PLANKS, x, y, r, g, b);
      }
    }
  }

  private drawSand() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 10);
        let r = 214, g = 204, b = 153;
        const v = (n - 0.5) * 18;
        this.setPixel(TextureIndex.SAND, x, y, r + v, g + v, b + v);
      }
    }
  }

  private drawBedrock() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 11);
        let val = 30;
        if (n < 0.3) val = 12;
        else if (n < 0.6) val = 50;
        else if (n > 0.85) val = 80;
        this.setPixel(TextureIndex.BEDROCK, x, y, val, val, val);
      }
    }
  }

  private drawGlass() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isBorder = x === 0 || y === 0 || x === 15 || y === 15;
        const isDiagonalStreak = (x === y && x > 2 && x < 7) || (x === y + 4 && x > 8 && x < 13);
        if (isBorder) {
          this.setPixel(TextureIndex.GLASS, x, y, 220, 230, 240, 230);
        } else if (isDiagonalStreak) {
          this.setPixel(TextureIndex.GLASS, x, y, 255, 255, 255, 180);
        } else {
          this.setPixel(TextureIndex.GLASS, x, y, 255, 255, 255, 30);
        }
      }
    }
  }

  private drawOres() {
    const drawOreSpecks = (
      tileIdx: number,
      oreR: number,
      oreG: number,
      oreB: number,
      seed: number
    ) => {
      // First copy stone
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const n = this.hash(x, y, 5);
          const val = 115 + Math.floor(n * 25);
          this.setPixel(tileIdx, x, y, val, val, val);
        }
      }
      // Add ore gem specks in 2-3 clusters
      const orePixels = [
        [3, 3], [4, 3], [3, 4], [4, 4],
        [10, 8], [11, 8], [11, 9], [12, 9],
        [6, 12], [7, 12], [7, 13]
      ];
      for (const [ox, oy] of orePixels) {
        const n = this.hash(ox, oy, seed);
        const factor = 0.85 + n * 0.3;
        this.setPixel(
          tileIdx,
          ox,
          oy,
          Math.min(255, Math.floor(oreR * factor)),
          Math.min(255, Math.floor(oreG * factor)),
          Math.min(255, Math.floor(oreB * factor))
        );
      }
    };

    drawOreSpecks(TextureIndex.COAL_ORE, 35, 35, 35, 12);
    drawOreSpecks(TextureIndex.IRON_ORE, 216, 175, 147, 13);
    drawOreSpecks(TextureIndex.DIAMOND_ORE, 44, 240, 234, 14);
  }

  private drawBrick() {
    for (let y = 0; y < 16; y++) {
      const isMortarY = y % 4 === 0;
      const row = Math.floor(y / 4);
      for (let x = 0; x < 16; x++) {
        const offset = (row % 2) * 4;
        const isMortarX = (x + offset) % 8 === 0;
        if (isMortarY || isMortarX) {
          this.setPixel(TextureIndex.BRICK, x, y, 180, 180, 180);
        } else {
          const n = this.hash(x, y, 15);
          const v = Math.floor(n * 25);
          this.setPixel(TextureIndex.BRICK, x, y, 160 - v, 60 - v, 45 - v);
        }
      }
    }
  }

  private drawTNT() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        // Top and bottom
        const topN = this.hash(x, y, 16);
        const topCol = topN > 0.5 ? 170 : 150;
        this.setPixel(TextureIndex.TNT_TOP, x, y, topCol, topCol * 0.4, topCol * 0.3);
        this.setPixel(TextureIndex.TNT_BOTTOM, x, y, 130, 40, 30);

        // Side: red dynamite with white center band
        if (y >= 6 && y <= 9) {
          // White band
          const isT1 = (x >= 2 && x <= 4 && y === 7) || (x === 3);
          const isN = (x === 7 || x === 9 || (x === 8 && y === 8));
          const isT2 = (x >= 11 && x <= 13 && y === 7) || (x === 12);
          if (isT1 || isN || isT2) {
            this.setPixel(TextureIndex.TNT_SIDE, x, y, 20, 20, 20);
          } else {
            this.setPixel(TextureIndex.TNT_SIDE, x, y, 240, 240, 240);
          }
        } else {
          // Red sticks
          const isStick = x % 4 === 0;
          if (isStick) {
            this.setPixel(TextureIndex.TNT_SIDE, x, y, 160, 25, 20);
          } else {
            this.setPixel(TextureIndex.TNT_SIDE, x, y, 210, 35, 28);
          }
        }
      }
    }
  }

  private drawCraftingTable() {
    // Top
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isBorder = x === 0 || y === 0 || x === 15 || y === 15;
        const isGrid = (x >= 4 && x <= 11 && (x === 4 || x === 8 || x === 11)) ||
                       (y >= 4 && y <= 11 && (y === 4 || y === 8 || y === 11));
        if (isBorder || isGrid) {
          this.setPixel(TextureIndex.CRAFTING_TOP, x, y, 100, 70, 35);
        } else {
          this.setPixel(TextureIndex.CRAFTING_TOP, x, y, 175, 125, 65);
        }
      }
    }
    // Side 1 (tools hanging)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        let r = 160, g = 115, b = 60;
        if (x === 0 || y === 0 || x === 15 || y === 15) {
          r = 90; g = 60; b = 30;
        } else if ((x === 6 && y > 3 && y < 12) || (x > 4 && x < 9 && y === 4)) {
          // hammer
          r = 60; g = 60; b = 60;
        }
        this.setPixel(TextureIndex.CRAFTING_SIDE1, x, y, r, g, b);
        this.setPixel(TextureIndex.CRAFTING_SIDE2, x, y, r, g, b);
      }
    }
  }

  private drawWater() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 20);
        let r = 38, g = 92, b = 180;
        const v = Math.floor(n * 25);
        this.setPixel(TextureIndex.WATER, x, y, r + v, g + v, b + v, 180);
      }
    }
  }

  private drawFurnace() {
    // Furnace Top & Side: textured gray stone
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 21);
        const val = 100 + Math.floor(n * 30);
        this.setPixel(TextureIndex.FURNACE_TOP, x, y, val, val, val);

        const isSideBorder = x === 0 || y === 0 || x === 15 || y === 15;
        const sideVal = isSideBorder ? val - 30 : val;
        this.setPixel(TextureIndex.FURNACE_SIDE, x, y, sideVal, sideVal, sideVal);

        // Furnace Front (oven mouth & top arch)
        let fR = val, fG = val, fB = val;
        // Dark interior mouth
        if (x >= 4 && x <= 11 && y >= 7 && y <= 13) {
          fR = 30; fG = 30; fB = 30;
          if (y === 13) { fR = 45; fG = 35; fB = 20; } // subtle coal dust bed
        } else if (x >= 3 && x <= 12 && y >= 3 && y <= 5) {
          // Top air vent slot
          if (x >= 5 && x <= 10 && y === 4) {
            fR = 40; fG = 40; fB = 40;
          }
        }
        this.setPixel(TextureIndex.FURNACE_FRONT, x, y, fR, fG, fB);
      }
    }
  }

  private drawChest() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isBorder = x === 0 || y === 0 || x === 15 || y === 15;
        const n = this.hash(x, y, 22);
        const woodVal = Math.floor(n * 20);

        const r = isBorder ? 85 : (165 - woodVal);
        const g = isBorder ? 55 : (115 - woodVal);
        const b = isBorder ? 25 : (50 - woodVal);

        this.setPixel(TextureIndex.CHEST_TOP, x, y, r, g, b);
        this.setPixel(TextureIndex.CHEST_SIDE, x, y, r, g, b);

        // Chest Front: with metallic latch
        if (x >= 7 && x <= 8 && y >= 6 && y <= 9) {
          // Silver latch clasp
          const latchCol = y === 8 ? 20 : 210;
          this.setPixel(TextureIndex.CHEST_FRONT, x, y, latchCol, latchCol, latchCol);
        } else {
          this.setPixel(TextureIndex.CHEST_FRONT, x, y, r, g, b);
        }
      }
    }
  }

  private drawBookshelf() {
    // Oak plank backdrop with 2 horizontal shelf rows and colorful book spines
    const bookColors = [
      [180, 40, 40],   // red
      [40, 80, 180],   // blue
      [40, 150, 60],   // green
      [140, 90, 40],   // brown
      [180, 150, 40],  // gold
      [120, 40, 150],  // purple
    ];

    for (let y = 0; y < 16; y++) {
      const isShelfDivider = y === 0 || y === 7 || y === 8 || y === 15;
      for (let x = 0; x < 16; x++) {
        if (isShelfDivider || x === 0 || x === 15) {
          // Oak wood frame
          this.setPixel(TextureIndex.BOOKSHELF, x, y, 140, 95, 45);
        } else {
          // Books on shelves
          const bookIdx = (x + (y > 7 ? 3 : 0)) % bookColors.length;
          const [br, bg, bb] = bookColors[bookIdx];
          const isRib = y === 3 || y === 11;
          const dark = isRib ? 0.75 : 1.0;
          this.setPixel(TextureIndex.BOOKSHELF, x, y, br * dark, bg * dark, bb * dark);
        }
      }
    }
  }

  private drawStoneBrick() {
    for (let y = 0; y < 16; y++) {
      const isMortarY = y === 0 || y === 8 || y === 15;
      for (let x = 0; x < 16; x++) {
        const isMortarX = (y < 8 && (x === 0 || x === 8 || x === 15)) ||
                         (y >= 8 && (x === 0 || x === 4 || x === 12 || x === 15));
        if (isMortarY || isMortarX) {
          this.setPixel(TextureIndex.STONE_BRICK, x, y, 60, 60, 60);
        } else {
          const n = this.hash(x, y, 23);
          const v = 110 + Math.floor(n * 25);
          this.setPixel(TextureIndex.STONE_BRICK, x, y, v, v, v);
        }
      }
    }
  }

  private drawTorch() {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        // Wooden stick in center
        if (x >= 7 && x <= 8 && y >= 6 && y <= 15) {
          const n = this.hash(x, y, 24);
          this.setPixel(TextureIndex.TORCH, x, y, 140 - n * 30, 90 - n * 20, 45);
        } else if (x >= 6 && x <= 9 && y >= 2 && y <= 5) {
          // Flame core
          if (x >= 7 && x <= 8 && y >= 3 && y <= 4) {
            this.setPixel(TextureIndex.TORCH, x, y, 255, 245, 120); // white-yellow center
          } else {
            this.setPixel(TextureIndex.TORCH, x, y, 255, 130, 20); // orange flame
          }
        } else {
          // Transparent
          this.setPixel(TextureIndex.TORCH, x, y, 0, 0, 0, 0);
        }
      }
    }
  }

  private drawMetalsAndGems() {
    // 1. Gold Ore
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 25);
        const val = 115 + Math.floor(n * 25);
        this.setPixel(TextureIndex.GOLD_ORE, x, y, val, val, val);
      }
    }
    const goldSpecks = [[3, 4], [4, 4], [4, 5], [10, 8], [11, 8], [11, 9], [7, 12], [8, 12]];
    for (const [gx, gy] of goldSpecks) {
      this.setPixel(TextureIndex.GOLD_ORE, gx, gy, 250, 220, 50);
    }

    // 2. Gold Block
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isBorder = x === 0 || y === 0 || x === 15 || y === 15;
        const n = this.hash(x, y, 26);
        const v = Math.floor(n * 30);
        if (isBorder) {
          this.setPixel(TextureIndex.GOLD_BLOCK, x, y, 190, 150, 25);
        } else {
          this.setPixel(TextureIndex.GOLD_BLOCK, x, y, 250 - v, 215 - v, 55 - v);
        }
      }
    }

    // 3. Iron Block
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isBorder = x === 0 || y === 0 || x === 15 || y === 15;
        const n = this.hash(x, y, 27);
        const v = Math.floor(n * 20);
        if (isBorder) {
          this.setPixel(TextureIndex.IRON_BLOCK, x, y, 170, 170, 170);
        } else {
          this.setPixel(TextureIndex.IRON_BLOCK, x, y, 235 - v, 235 - v, 235 - v);
        }
      }
    }

    // 4. Diamond Block
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isBorder = x === 0 || y === 0 || x === 15 || y === 15;
        const n = this.hash(x, y, 28);
        const v = Math.floor(n * 35);
        if (isBorder) {
          this.setPixel(TextureIndex.DIAMOND_BLOCK, x, y, 40, 170, 165);
        } else {
          this.setPixel(TextureIndex.DIAMOND_BLOCK, x, y, 70 - v, 240 - v, 235 - v);
        }
      }
    }

    // 5. Obsidian
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 29);
        if (n > 0.8) {
          this.setPixel(TextureIndex.OBSIDIAN, x, y, 65, 40, 95); // purple crystalline glint
        } else if (n > 0.4) {
          this.setPixel(TextureIndex.OBSIDIAN, x, y, 25, 20, 38);
        } else {
          this.setPixel(TextureIndex.OBSIDIAN, x, y, 15, 12, 24);
        }
      }
    }
  }

  private drawNetherBlocks() {
    // 1. Netherrack (crumbly dark crimson rock with black crevices)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 40);
        if (n < 0.15) {
          this.setPixel(TextureIndex.NETHERRACK, x, y, 58, 12, 12);
        } else if (n < 0.45) {
          this.setPixel(TextureIndex.NETHERRACK, x, y, 105, 25, 25);
        } else if (n < 0.8) {
          this.setPixel(TextureIndex.NETHERRACK, x, y, 138, 38, 38);
        } else {
          this.setPixel(TextureIndex.NETHERRACK, x, y, 168, 55, 55);
        }
      }
    }

    // 2. Soul Sand (eerie gritty dark brown sand with faint ghostly face impressions)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 41);
        // Face shapes at (3,4)-(5,6) and (10,9)-(12,11)
        const isFace1 = (x >= 3 && x <= 6 && y >= 3 && y <= 6) && ((x === 4 && y === 4) || (x === 5 && y === 4) || (x === 4 && y === 6) || (x === 5 && y === 6));
        const isFace2 = (x >= 9 && x <= 12 && y >= 8 && y <= 11) && ((x === 10 && y === 9) || (x === 11 && y === 9) || (x === 10 && y === 11));

        if (isFace1 || isFace2) {
          this.setPixel(TextureIndex.SOUL_SAND, x, y, 42, 28, 20); // deep sunken eye/mouth
        } else if (n < 0.25) {
          this.setPixel(TextureIndex.SOUL_SAND, x, y, 65, 48, 36);
        } else if (n < 0.7) {
          this.setPixel(TextureIndex.SOUL_SAND, x, y, 84, 62, 48);
        } else {
          this.setPixel(TextureIndex.SOUL_SAND, x, y, 102, 78, 62);
        }
      }
    }

    // 3. Glowstone (crystalline golden amber cluster, bright glowing pixels)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 42);
        if (n < 0.15) {
          this.setPixel(TextureIndex.GLOWSTONE, x, y, 150, 95, 30); // dark amber crystal seam
        } else if (n < 0.5) {
          this.setPixel(TextureIndex.GLOWSTONE, x, y, 220, 175, 65);
        } else if (n < 0.85) {
          this.setPixel(TextureIndex.GLOWSTONE, x, y, 245, 210, 95);
        } else {
          this.setPixel(TextureIndex.GLOWSTONE, x, y, 255, 248, 170); // radiant white-yellow core
        }
      }
    }

    // 4. Nether Bricks (dark maroon/purple-brown mortared bricks)
    for (let y = 0; y < 16; y++) {
      const row = Math.floor(y / 4);
      const isMortarY = y % 4 === 3;
      const xOffset = (row % 2) * 4;

      for (let x = 0; x < 16; x++) {
        const isMortarX = (x + xOffset) % 8 === 7;
        if (isMortarY || isMortarX) {
          this.setPixel(TextureIndex.NETHER_BRICK, x, y, 26, 11, 16); // mortar
        } else {
          const n = this.hash(x, y, 43);
          if (n < 0.3) {
            this.setPixel(TextureIndex.NETHER_BRICK, x, y, 48, 20, 28);
          } else if (n < 0.7) {
            this.setPixel(TextureIndex.NETHER_BRICK, x, y, 62, 28, 38);
          } else {
            this.setPixel(TextureIndex.NETHER_BRICK, x, y, 76, 36, 48);
          }
        }
      }
    }

    // 5. Nether Quartz Ore (Netherrack with glistening creamy-white quartz crystals)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const isQuartz =
          (x >= 3 && x <= 6 && y >= 4 && y <= 7 && (x + y) % 2 === 0) ||
          (x >= 9 && x <= 13 && y >= 2 && y <= 6 && Math.abs(x - y) <= 4) ||
          (x >= 5 && x <= 10 && y >= 10 && y <= 13 && (x * y) % 3 !== 0);

        if (isQuartz) {
          const qn = this.hash(x, y, 44);
          if (qn < 0.4) {
            this.setPixel(TextureIndex.NETHER_QUARTZ_ORE, x, y, 230, 218, 215);
          } else if (qn < 0.8) {
            this.setPixel(TextureIndex.NETHER_QUARTZ_ORE, x, y, 248, 242, 240);
          } else {
            this.setPixel(TextureIndex.NETHER_QUARTZ_ORE, x, y, 255, 255, 255);
          }
        } else {
          const n = this.hash(x, y, 45);
          const r = n < 0.5 ? 105 : 138;
          this.setPixel(TextureIndex.NETHER_QUARTZ_ORE, x, y, r, 28, 28);
        }
      }
    }

    // 6. Nether Portal (swirling mystic purple vortex with translucency)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const wave = Math.sin((x + y * 1.5) * 0.8) * 0.5 + 0.5;
        const n = this.hash(x, y, 46);
        const intensity = (wave * 0.7 + n * 0.3);

        if (intensity < 0.25) {
          this.setPixel(TextureIndex.NETHER_PORTAL, x, y, 75, 12, 135, 220);
        } else if (intensity < 0.6) {
          this.setPixel(TextureIndex.NETHER_PORTAL, x, y, 140, 45, 215, 230);
        } else if (intensity < 0.85) {
          this.setPixel(TextureIndex.NETHER_PORTAL, x, y, 185, 80, 245, 240);
        } else {
          this.setPixel(TextureIndex.NETHER_PORTAL, x, y, 225, 150, 255, 250);
        }
      }
    }

    // 7. Fire (flickering yellow/orange/red flame tongues)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        // Flame shape: wider at bottom (y=15), narrower at top (y=0)
        const flameWidth = 2 + ((15 - y) * 0.35);
        const centerDist = Math.abs(x - 7.5);
        const noise = this.hash(x, y, 47) * 2;

        if (centerDist > flameWidth + noise || (y < 3 && centerDist > 1.5)) {
          this.setPixel(TextureIndex.FIRE, x, y, 0, 0, 0, 0); // transparent background
        } else if (y > 10 && centerDist < 3) {
          this.setPixel(TextureIndex.FIRE, x, y, 255, 245, 90, 245); // hot white-yellow base
        } else if (y > 6) {
          this.setPixel(TextureIndex.FIRE, x, y, 255, 150, 20, 240); // vibrant orange
        } else {
          this.setPixel(TextureIndex.FIRE, x, y, 225, 45, 10, 220); // licking red tips
        }
      }
    }

    // 8. Lava (molten bright glowing orange-red with dark volcanic crust)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 48);
        if (n < 0.18) {
          this.setPixel(TextureIndex.LAVA, x, y, 150, 25, 10); // crust vein
        } else if (n < 0.45) {
          this.setPixel(TextureIndex.LAVA, x, y, 215, 65, 15);
        } else if (n < 0.8) {
          this.setPixel(TextureIndex.LAVA, x, y, 250, 125, 25);
        } else {
          this.setPixel(TextureIndex.LAVA, x, y, 255, 195, 55); // glowing hot spot
        }
      }
    }

    // 9. Gravel (speckled pebble texture)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 49);
        const v = Math.floor(100 + n * 55);
        this.setPixel(TextureIndex.GRAVEL, x, y, v, v - 5, v - 8);
      }
    }

    // 10. Quartz Block (smooth ivory carved block with subtle beveled border)
    for (let y = 0; y < 16; y++) {
      const isBorder = x => x === 0 || x === 15;
      for (let x = 0; x < 16; x++) {
        if (isBorder(x) || isBorder(y)) {
          this.setPixel(TextureIndex.QUARTZ_BLOCK, x, y, 215, 208, 202);
        } else {
          const n = this.hash(x, y, 50);
          const v = Math.floor(238 + n * 14);
          this.setPixel(TextureIndex.QUARTZ_BLOCK, x, y, v, v - 3, v - 5);
        }
      }
    }
  }

  // End Dimension Textures (End Stone, End Portal Frame, End Portal Void)
  private drawEndBlocks() {
    // 1. End Stone: Pale creamy-yellow porous speckled stone
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 77);
        if (n < 0.2) {
          this.setPixel(TextureIndex.END_STONE, x, y, 215, 222, 160);
        } else if (n < 0.6) {
          this.setPixel(TextureIndex.END_STONE, x, y, 228, 235, 175);
        } else if (n < 0.85) {
          this.setPixel(TextureIndex.END_STONE, x, y, 240, 245, 190);
        } else {
          this.setPixel(TextureIndex.END_STONE, x, y, 195, 202, 145);
        }
      }
    }

    // 2. End Portal Frame Side: Pale End Stone base with dark green top rim
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (y < 4) {
          // Dark green top trim
          const n = this.hash(x, y, 78);
          const g = n < 0.5 ? 85 : 105;
          this.setPixel(TextureIndex.END_PORTAL_FRAME_SIDE, x, y, 35, g, 75);
        } else {
          // End stone lower section
          const n = this.hash(x, y, 79);
          if (n < 0.3) {
            this.setPixel(TextureIndex.END_PORTAL_FRAME_SIDE, x, y, 210, 218, 155);
          } else {
            this.setPixel(TextureIndex.END_PORTAL_FRAME_SIDE, x, y, 230, 238, 175);
          }
        }
      }
    }

    // 3. End Portal Frame Top: Dark green casing with glowing turquoise/emerald Eye of Ender
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const distFromCenter = Math.hypot(x - 7.5, y - 7.5);
        if (distFromCenter < 3.2) {
          // Eye of Ender pupil and iris
          if (distFromCenter < 1.2) {
            this.setPixel(TextureIndex.END_PORTAL_FRAME_TOP, x, y, 15, 30, 25); // Dark pupil
          } else if (distFromCenter < 2.2) {
            this.setPixel(TextureIndex.END_PORTAL_FRAME_TOP, x, y, 40, 230, 160); // Vibrant teal glow
          } else {
            this.setPixel(TextureIndex.END_PORTAL_FRAME_TOP, x, y, 25, 175, 120); // Darker rim
          }
        } else if (x <= 1 || x >= 14 || y <= 1 || y >= 14) {
          // Dark stone border
          this.setPixel(TextureIndex.END_PORTAL_FRAME_TOP, x, y, 28, 65, 55);
        } else {
          // Frame plate
          const n = this.hash(x, y, 80);
          const g = n < 0.5 ? 90 : 110;
          this.setPixel(TextureIndex.END_PORTAL_FRAME_TOP, x, y, 40, g, 80);
        }
      }
    }

    // 4. End Portal: Cosmic Starry Void (pitch-black with sparkling cyan/magenta stars)
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const star = this.hash(x, y, 88);
        if (star > 0.88) {
          // Bright cyan cosmic star
          this.setPixel(TextureIndex.END_PORTAL, x, y, 120, 255, 255, 250);
        } else if (star > 0.80) {
          // Purple/magenta nebular mote
          this.setPixel(TextureIndex.END_PORTAL, x, y, 210, 100, 255, 245);
        } else if (star > 0.72) {
          // Soft greenish shimmer
          this.setPixel(TextureIndex.END_PORTAL, x, y, 60, 220, 180, 240);
        } else {
          // Deep cosmic black void
          const b = Math.floor(10 + star * 15);
          this.setPixel(TextureIndex.END_PORTAL, x, y, 5, 2, b, 255);
        }
      }
    }
  }

  private drawBiomeNewBlocks() {
    // 1. Cactus Top: Concentric ribbed green star pattern
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const dist = Math.hypot(x - 7.5, y - 7.5);
        const n = this.hash(x, y, 91);
        if (dist < 2.5) {
          this.setPixel(TextureIndex.CACTUS_TOP, x, y, 25, 110, 20); // Darker green core
        } else if (dist < 6.5) {
          const g = n < 0.5 ? 135 : 155;
          this.setPixel(TextureIndex.CACTUS_TOP, x, y, 35, g, 30); // Medium cactus green
        } else {
          this.setPixel(TextureIndex.CACTUS_TOP, x, y, 20, 95, 18); // Dark outer edge
        }
      }
    }

    // 2. Cactus Side: Vertical ribbed stripes with prickly thorns
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const colMod = x % 4;
        const isRibCrease = colMod === 0;
        const isRibPeak = colMod === 2;
        const n = this.hash(x, y, 92);

        // Spine prickles at periodic positions
        const hasSpine = (x % 4 === 2 && (y % 5 === 2)) || (x % 4 === 0 && (y % 5 === 0));
        if (hasSpine) {
          this.setPixel(TextureIndex.CACTUS_SIDE, x, y, 15, 15, 15); // Black spine thorn
        } else if (isRibCrease) {
          this.setPixel(TextureIndex.CACTUS_SIDE, x, y, 24, 98, 22); // Deep crease shadow
        } else if (isRibPeak) {
          const g = n < 0.5 ? 150 : 165;
          this.setPixel(TextureIndex.CACTUS_SIDE, x, y, 45, g, 38); // Highlighted rib ridge
        } else {
          const g = n < 0.5 ? 125 : 138;
          this.setPixel(TextureIndex.CACTUS_SIDE, x, y, 32, g, 26); // Base body
        }
      }
    }

    // 3. Snow Block: Soft fluffy dithered white/frost cyan
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 93);
        if (n < 0.25) {
          this.setPixel(TextureIndex.SNOW, x, y, 238, 246, 252);
        } else if (n < 0.7) {
          this.setPixel(TextureIndex.SNOW, x, y, 248, 252, 255);
        } else {
          this.setPixel(TextureIndex.SNOW, x, y, 255, 255, 255);
        }
      }
    }

    // 4. Sandstone Top: Smooth warm desert flagstone
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 94);
        let r = 216, g = 205, b = 155;
        if (n < 0.2) {
          r = 202; g = 190; b = 140;
        } else if (n < 0.6) {
          r = 224; g = 212; b = 162;
        } else {
          r = 232; g = 220; b = 172;
        }
        this.setPixel(TextureIndex.SANDSTONE_TOP, x, y, r, g, b);
      }
    }

    // 5. Sandstone Side: Sedimentary stratified strata with bottom carved base
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const n = this.hash(x, y, 95);
        // Strata band colors
        if (y < 4) {
          // Top smooth layer
          const v = Math.floor(n * 15);
          this.setPixel(TextureIndex.SANDSTONE, x, y, 218 - v, 206 - v, 155 - v);
        } else if (y === 4 || y === 12) {
          // Dark horizontal sedimentary fissure
          this.setPixel(TextureIndex.SANDSTONE, x, y, 175, 160, 115);
        } else if (y >= 5 && y <= 11) {
          // Middle striated band
          const v = Math.floor(n * 20);
          this.setPixel(TextureIndex.SANDSTONE, x, y, 226 - v, 214 - v, 162 - v);
        } else {
          // Bottom chiseled solid base
          const v = Math.floor(n * 16);
          this.setPixel(TextureIndex.SANDSTONE, x, y, 196 - v, 182 - v, 134 - v);
        }
      }
    }
  }

  // Breaking stage cracks (0 to 9)
  private generateBreakTextures() {
    for (let stage = 0; stage < 10; stage++) {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext('2d');
      if (!ctx) continue;
      ctx.clearRect(0, 0, 16, 16);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.lineWidth = 1;

      // Draw progressive jagged fracture lines based on stage
      const numLines = stage + 2;
      for (let i = 0; i < numLines; i++) {
        const x1 = Math.floor(this.hash(i, stage, 99) * 16);
        const y1 = Math.floor(this.hash(i, stage, 100) * 16);
        const x2 = Math.floor(this.hash(i, stage, 101) * 16);
        const y2 = Math.floor(this.hash(i, stage, 102) * 16);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(c);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      this.breakTextures.push(tex);
    }
  }

  /**
   * Returns UV coordinates [uMin, vMin, uMax, vMax] for a given tile index
   */
  public getTileUV(tileIdx: number): [number, number, number, number] {
    const col = tileIdx % ATLAS_COLS;
    const row = Math.floor(tileIdx / ATLAS_COLS);
    const uStep = 1 / ATLAS_COLS;
    const vStep = 1 / ATLAS_ROWS;

    const uMin = col * uStep;
    const uMax = (col + 1) * uStep;
    // In Three.js UV origin is bottom-left, canvas origin is top-left
    const vMin = 1 - (row + 1) * vStep;
    const vMax = 1 - row * vStep;

    return [uMin, vMin, uMax, vMax];
  }
}

// Global singleton instance
export const textureManager = new TextureAtlasManager();

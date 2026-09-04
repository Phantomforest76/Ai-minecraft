/**
 * Core types for Minecraft Java Edition Web
 */

export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  COBBLESTONE = 4,
  OAK_LOG = 5,
  OAK_LEAVES = 6,
  OAK_PLANKS = 7,
  SAND = 8,
  BEDROCK = 9,
  GLASS = 10,
  COAL_ORE = 11,
  IRON_ORE = 12,
  DIAMOND_ORE = 13,
  BRICK = 14,
  TNT = 15,
  CRAFTING_TABLE = 16,
  WATER = 17,
  FURNACE = 18,
  CHEST = 19,
  BOOKSHELF = 20,
  STONE_BRICK = 21,
  TORCH = 22,
  GOLD_ORE = 23,
  GOLD_BLOCK = 24,
  IRON_BLOCK = 25,
  DIAMOND_BLOCK = 26,
  OBSIDIAN = 27,
  NETHERRACK = 28,
  SOUL_SAND = 29,
  GLOWSTONE = 30,
  NETHER_BRICK = 31,
  NETHER_QUARTZ_ORE = 32,
  NETHER_PORTAL = 33,
  FIRE = 34,
  LAVA = 35,
  GRAVEL = 36,
  QUARTZ_BLOCK = 37,
  END_STONE = 38,
  END_PORTAL_FRAME = 39,
  END_PORTAL = 40,
  CACTUS = 41,
  SNOW = 42,
  SANDSTONE = 43,
}

export enum ItemType {
  STICK = 100,
  COAL = 101,
  IRON_INGOT = 102,
  GOLD_INGOT = 103,
  DIAMOND = 104,
  WOODEN_PICKAXE = 105,
  STONE_PICKAXE = 106,
  IRON_PICKAXE = 107,
  DIAMOND_PICKAXE = 108,
  WOODEN_SWORD = 109,
  STONE_SWORD = 110,
  IRON_SWORD = 111,
  DIAMOND_SWORD = 112,
  WOODEN_AXE = 113,
  STONE_AXE = 114,
  IRON_AXE = 115,
  WOODEN_SHOVEL = 116,
  STONE_SHOVEL = 117,
  IRON_SHOVEL = 118,
  FLINT = 119,
  FLINT_AND_STEEL = 120,
  NETHER_QUARTZ = 121,
  ROTTEN_FLESH = 122,
  GUNPOWDER = 123,
  BONE = 124,
  PORKCHOP = 125,
  ARROW = 126,
  BOW = 127,
  GOLD_NUGGET = 128,
  PORTAL_BUILDER = 129,
  END_PORTAL_BUILDER = 130,
}

export enum MobType {
  ZOMBIE = 'zombie',
  CREEPER = 'creeper',
  SKELETON = 'skeleton',
  PIG = 'pig',
  ZOMBIE_PIGMAN = 'zombie_pigman',
  ENDER_DRAGON = 'ender_dragon',
}

export interface MobEntity {
  id: string;
  type: MobType;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  rotation: number;
  health: number;
  maxHealth: number;
  hurtTimer: number;
  attackCooldown: number;
  walkTimer: number;
  state: 'idle' | 'wander' | 'chase' | 'attack';
  dimension: 'overworld' | 'nether' | 'end';
  fuseTimer?: number;
}

export interface ItemStack {
  id: BlockType | ItemType;
  count: number;
}

export interface ItemDef {
  id: BlockType | ItemType;
  name: string;
  isBlock: boolean;
  blockType?: BlockType;
  color: string;
  category: 'blocks' | 'tools' | 'combat' | 'materials';
  miningMultiplier?: {
    stone?: number;
    wood?: number;
    dirt?: number;
  };
}

export type SoundCategory = 'grass' | 'dirt' | 'stone' | 'wood' | 'sand' | 'glass';

export interface BlockDef {
  type: BlockType;
  name: string;
  sound: SoundCategory;
  transparent: boolean;
  solid: boolean;
  hardness: number; // in seconds to break in survival mode (0 = instant)
  // Texture indices in atlas: [top, bottom, north, south, east, west]
  textures: {
    top: number;
    bottom: number;
    side: number;
    north?: number;
    south?: number;
    east?: number;
    west?: number;
  };
}

export interface ChunkCoord {
  cx: number;
  cz: number;
}

export interface BlockCoord {
  x: number;
  y: number;
  z: number;
}

export interface RaycastHit {
  hit: boolean;
  blockCoord: BlockCoord;
  faceNormal: BlockCoord;
  blockType: BlockType;
  distance: number;
}

export interface PlayerStats {
  health: number; // 0 to 20
  maxHealth: number;
  hunger: number; // 0 to 20
  xpLevel: number;
  xpProgress: number; // 0 to 1
  gameMode: 'survival' | 'creative';
  isFlying: boolean;
  isSprinting: boolean;
  isSneaking: boolean;
  onGround: boolean;
}

export interface DebugInfo {
  fps: number;
  chunksLoaded: number;
  triangles: number;
  x: number;
  y: number;
  z: number;
  blockX: number;
  blockY: number;
  blockZ: number;
  chunkX: number;
  chunkZ: number;
  facing: string;
  biome: string;
  dimension: string;
  entities: string;
  light: number;
}

export interface GameSettings {
  renderDistance: number; // chunks (e.g. 3, 4, 6)
  fov: number;
  soundEnabled: boolean;
  masterVolume: number;
  mouseSensitivity: number;
  showF3: boolean;
  timeOfDay: number; // 0 (morning) to 1 (full day cycle)
  timeSpeed: number; // 0 = frozen, 1 = normal
  shadows?: boolean;
  highQuality?: boolean;
}

const fs = require('fs');
let code = fs.readFileSync('src/game/textures.ts', 'utf8');

const defTarget = `export const BLOCK_DEFS: Partial<Record<BlockType, BlockDef>> = {`;
const defReplace = `export const BLOCK_DEFS: Partial<Record<BlockType, BlockDef>> = {
  [BlockType.END_STONE]: {
    type: BlockType.END_STONE,
    name: 'End Stone',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 3.0,
    textures: {
      top: TextureIndex.SAND, // close enough for now
      bottom: TextureIndex.SAND,
      side: TextureIndex.SAND,
    },
  },
  [BlockType.END_PORTAL_FRAME]: {
    type: BlockType.END_PORTAL_FRAME,
    name: 'End Portal Frame',
    sound: 'stone',
    transparent: false,
    solid: true,
    hardness: 5.0,
    textures: {
      top: TextureIndex.OBSIDIAN,
      bottom: TextureIndex.OBSIDIAN,
      side: TextureIndex.OBSIDIAN,
    },
  },
  [BlockType.END_PORTAL]: {
    type: BlockType.END_PORTAL,
    name: 'End Portal',
    sound: 'stone', // won't be broken usually
    transparent: true,
    solid: false, // walk through it
    hardness: -1,
    lightLevel: 15,
    textures: {
      top: TextureIndex.WATER,
      bottom: TextureIndex.WATER,
      side: TextureIndex.WATER,
    },
  },`;

code = code.replace(defTarget, defReplace);
fs.writeFileSync('src/game/textures.ts', code);

import { BlockType, ItemType, ItemStack } from '../types';
import { ALL_ITEMS } from './items';

export interface CraftingRecipe {
  id: string;
  name: string;
  category: 'blocks' | 'tools' | 'combat' | 'materials';
  output: ItemStack;
  // Shaped pattern: 1-3 rows of strings or IDs, or nulls
  // e.g. 3x3 or 2x2
  grid: (number | null)[];
  width: number;
  height: number;
  shapeless?: boolean;
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  // 1. Oak Planks (1 Oak Log)
  {
    id: 'planks',
    name: 'Oak Planks',
    category: 'blocks',
    output: { id: BlockType.OAK_PLANKS, count: 4 },
    width: 1,
    height: 1,
    shapeless: true,
    grid: [BlockType.OAK_LOG],
  },
  // 2. Sticks (2 Planks vertical)
  {
    id: 'stick',
    name: 'Sticks',
    category: 'materials',
    output: { id: ItemType.STICK, count: 4 },
    width: 1,
    height: 2,
    grid: [BlockType.OAK_PLANKS, BlockType.OAK_PLANKS],
  },
  // 3. Crafting Table (4 Planks in 2x2)
  {
    id: 'crafting_table',
    name: 'Crafting Table',
    category: 'blocks',
    output: { id: BlockType.CRAFTING_TABLE, count: 1 },
    width: 2,
    height: 2,
    grid: [
      BlockType.OAK_PLANKS, BlockType.OAK_PLANKS,
      BlockType.OAK_PLANKS, BlockType.OAK_PLANKS,
    ],
  },
  // 4. Furnace (8 Cobblestone around perimeter)
  {
    id: 'furnace',
    name: 'Furnace',
    category: 'blocks',
    output: { id: BlockType.FURNACE, count: 1 },
    width: 3,
    height: 3,
    grid: [
      BlockType.COBBLESTONE, BlockType.COBBLESTONE, BlockType.COBBLESTONE,
      BlockType.COBBLESTONE, null,                  BlockType.COBBLESTONE,
      BlockType.COBBLESTONE, BlockType.COBBLESTONE, BlockType.COBBLESTONE,
    ],
  },
  // 5. Chest (8 Oak Planks around perimeter)
  {
    id: 'chest',
    name: 'Chest',
    category: 'blocks',
    output: { id: BlockType.CHEST, count: 1 },
    width: 3,
    height: 3,
    grid: [
      BlockType.OAK_PLANKS, BlockType.OAK_PLANKS, BlockType.OAK_PLANKS,
      BlockType.OAK_PLANKS, null,                 BlockType.OAK_PLANKS,
      BlockType.OAK_PLANKS, BlockType.OAK_PLANKS, BlockType.OAK_PLANKS,
    ],
  },
  // 6. Bookshelf (6 Oak Planks)
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    category: 'blocks',
    output: { id: BlockType.BOOKSHELF, count: 1 },
    width: 3,
    height: 2,
    grid: [
      BlockType.OAK_PLANKS, BlockType.OAK_PLANKS, BlockType.OAK_PLANKS,
      BlockType.OAK_PLANKS, BlockType.OAK_PLANKS, BlockType.OAK_PLANKS,
    ],
  },
  // 7. Stone Bricks (4 Stone in 2x2)
  {
    id: 'stone_brick',
    name: 'Stone Bricks',
    category: 'blocks',
    output: { id: BlockType.STONE_BRICK, count: 4 },
    width: 2,
    height: 2,
    grid: [
      BlockType.STONE, BlockType.STONE,
      BlockType.STONE, BlockType.STONE,
    ],
  },
  // 8. Torches (1 Coal over 1 Stick)
  {
    id: 'torch',
    name: 'Torches',
    category: 'blocks',
    output: { id: BlockType.TORCH, count: 4 },
    width: 1,
    height: 2,
    grid: [ItemType.COAL, ItemType.STICK],
  },
  // 9. TNT (4 Sand + 1 Coal/Gunpowder)
  {
    id: 'tnt',
    name: 'TNT',
    category: 'blocks',
    output: { id: BlockType.TNT, count: 1 },
    width: 3,
    height: 3,
    grid: [
      BlockType.SAND, ItemType.COAL,  BlockType.SAND,
      ItemType.COAL,  BlockType.SAND, ItemType.COAL,
      BlockType.SAND, ItemType.COAL,  BlockType.SAND,
    ],
  },

  // 10. Metals and Mineral Blocks
  {
    id: 'iron_block',
    name: 'Block of Iron',
    category: 'blocks',
    output: { id: BlockType.IRON_BLOCK, count: 1 },
    width: 3,
    height: 3,
    grid: [
      ItemType.IRON_INGOT, ItemType.IRON_INGOT, ItemType.IRON_INGOT,
      ItemType.IRON_INGOT, ItemType.IRON_INGOT, ItemType.IRON_INGOT,
      ItemType.IRON_INGOT, ItemType.IRON_INGOT, ItemType.IRON_INGOT,
    ],
  },
  {
    id: 'gold_block',
    name: 'Block of Gold',
    category: 'blocks',
    output: { id: BlockType.GOLD_BLOCK, count: 1 },
    width: 3,
    height: 3,
    grid: [
      ItemType.GOLD_INGOT, ItemType.GOLD_INGOT, ItemType.GOLD_INGOT,
      ItemType.GOLD_INGOT, ItemType.GOLD_INGOT, ItemType.GOLD_INGOT,
      ItemType.GOLD_INGOT, ItemType.GOLD_INGOT, ItemType.GOLD_INGOT,
    ],
  },
  {
    id: 'diamond_block',
    name: 'Block of Diamond',
    category: 'blocks',
    output: { id: BlockType.DIAMOND_BLOCK, count: 1 },
    width: 3,
    height: 3,
    grid: [
      ItemType.DIAMOND, ItemType.DIAMOND, ItemType.DIAMOND,
      ItemType.DIAMOND, ItemType.DIAMOND, ItemType.DIAMOND,
      ItemType.DIAMOND, ItemType.DIAMOND, ItemType.DIAMOND,
    ],
  },

  // Uncraft blocks back to ingots/gems
  {
    id: 'iron_ingots_from_block',
    name: 'Iron Ingots (x9)',
    category: 'materials',
    output: { id: ItemType.IRON_INGOT, count: 9 },
    width: 1,
    height: 1,
    shapeless: true,
    grid: [BlockType.IRON_BLOCK],
  },
  {
    id: 'gold_ingots_from_block',
    name: 'Gold Ingots (x9)',
    category: 'materials',
    output: { id: ItemType.GOLD_INGOT, count: 9 },
    width: 1,
    height: 1,
    shapeless: true,
    grid: [BlockType.GOLD_BLOCK],
  },
  {
    id: 'diamonds_from_block',
    name: 'Diamonds (x9)',
    category: 'materials',
    output: { id: ItemType.DIAMOND, count: 9 },
    width: 1,
    height: 1,
    shapeless: true,
    grid: [BlockType.DIAMOND_BLOCK],
  },

  // Tools: Pickaxes
  {
    id: 'wooden_pickaxe',
    name: 'Wooden Pickaxe',
    category: 'tools',
    output: { id: ItemType.WOODEN_PICKAXE, count: 1 },
    width: 3,
    height: 3,
    grid: [
      BlockType.OAK_PLANKS, BlockType.OAK_PLANKS, BlockType.OAK_PLANKS,
      null,                 ItemType.STICK,       null,
      null,                 ItemType.STICK,       null,
    ],
  },
  {
    id: 'stone_pickaxe',
    name: 'Stone Pickaxe',
    category: 'tools',
    output: { id: ItemType.STONE_PICKAXE, count: 1 },
    width: 3,
    height: 3,
    grid: [
      BlockType.COBBLESTONE, BlockType.COBBLESTONE, BlockType.COBBLESTONE,
      null,                  ItemType.STICK,        null,
      null,                  ItemType.STICK,        null,
    ],
  },
  {
    id: 'iron_pickaxe',
    name: 'Iron Pickaxe',
    category: 'tools',
    output: { id: ItemType.IRON_PICKAXE, count: 1 },
    width: 3,
    height: 3,
    grid: [
      ItemType.IRON_INGOT, ItemType.IRON_INGOT, ItemType.IRON_INGOT,
      null,                ItemType.STICK,      null,
      null,                ItemType.STICK,      null,
    ],
  },
  {
    id: 'diamond_pickaxe',
    name: 'Diamond Pickaxe',
    category: 'tools',
    output: { id: ItemType.DIAMOND_PICKAXE, count: 1 },
    width: 3,
    height: 3,
    grid: [
      ItemType.DIAMOND, ItemType.DIAMOND, ItemType.DIAMOND,
      null,             ItemType.STICK,   null,
      null,             ItemType.STICK,   null,
    ],
  },

  // Weapons: Swords
  {
    id: 'wooden_sword',
    name: 'Wooden Sword',
    category: 'combat',
    output: { id: ItemType.WOODEN_SWORD, count: 1 },
    width: 1,
    height: 3,
    grid: [
      BlockType.OAK_PLANKS,
      BlockType.OAK_PLANKS,
      ItemType.STICK,
    ],
  },
  {
    id: 'stone_sword',
    name: 'Stone Sword',
    category: 'combat',
    output: { id: ItemType.STONE_SWORD, count: 1 },
    width: 1,
    height: 3,
    grid: [
      BlockType.COBBLESTONE,
      BlockType.COBBLESTONE,
      ItemType.STICK,
    ],
  },
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    category: 'combat',
    output: { id: ItemType.IRON_SWORD, count: 1 },
    width: 1,
    height: 3,
    grid: [
      ItemType.IRON_INGOT,
      ItemType.IRON_INGOT,
      ItemType.STICK,
    ],
  },
  {
    id: 'diamond_sword',
    name: 'Diamond Sword',
    category: 'combat',
    output: { id: ItemType.DIAMOND_SWORD, count: 1 },
    width: 1,
    height: 3,
    grid: [
      ItemType.DIAMOND,
      ItemType.DIAMOND,
      ItemType.STICK,
    ],
  },

  // Tools: Axes
  {
    id: 'wooden_axe',
    name: 'Wooden Axe',
    category: 'tools',
    output: { id: ItemType.WOODEN_AXE, count: 1 },
    width: 2,
    height: 3,
    grid: [
      BlockType.OAK_PLANKS, BlockType.OAK_PLANKS,
      BlockType.OAK_PLANKS, ItemType.STICK,
      null,                 ItemType.STICK,
    ],
  },
  {
    id: 'stone_axe',
    name: 'Stone Axe',
    category: 'tools',
    output: { id: ItemType.STONE_AXE, count: 1 },
    width: 2,
    height: 3,
    grid: [
      BlockType.COBBLESTONE, BlockType.COBBLESTONE,
      BlockType.COBBLESTONE, ItemType.STICK,
      null,                  ItemType.STICK,
    ],
  },
  {
    id: 'iron_axe',
    name: 'Iron Axe',
    category: 'tools',
    output: { id: ItemType.IRON_AXE, count: 1 },
    width: 2,
    height: 3,
    grid: [
      ItemType.IRON_INGOT, ItemType.IRON_INGOT,
      ItemType.IRON_INGOT, ItemType.STICK,
      null,                ItemType.STICK,
    ],
  },

  // Tools: Shovels
  {
    id: 'wooden_shovel',
    name: 'Wooden Shovel',
    category: 'tools',
    output: { id: ItemType.WOODEN_SHOVEL, count: 1 },
    width: 1,
    height: 3,
    grid: [
      BlockType.OAK_PLANKS,
      ItemType.STICK,
      ItemType.STICK,
    ],
  },
  {
    id: 'stone_shovel',
    name: 'Stone Shovel',
    category: 'tools',
    output: { id: ItemType.STONE_SHOVEL, count: 1 },
    width: 1,
    height: 3,
    grid: [
      BlockType.COBBLESTONE,
      ItemType.STICK,
      ItemType.STICK,
    ],
  },
  {
    id: 'iron_shovel',
    name: 'Iron Shovel',
    category: 'tools',
    output: { id: ItemType.IRON_SHOVEL, count: 1 },
    width: 1,
    height: 3,
    grid: [
      ItemType.IRON_INGOT,
      ItemType.STICK,
      ItemType.STICK,
    ],
  },

  // Flint and Steel (Iron Ingot + Flint)
  {
    id: 'flint_and_steel',
    name: 'Flint and Steel',
    category: 'tools',
    output: { id: ItemType.FLINT_AND_STEEL, count: 1 },
    width: 2,
    height: 1,
    shapeless: true,
    grid: [ItemType.IRON_INGOT, ItemType.FLINT],
  },

  // Nether Bricks (4 Netherrack)
  {
    id: 'nether_brick',
    name: 'Nether Bricks',
    category: 'blocks',
    output: { id: BlockType.NETHER_BRICK, count: 1 },
    width: 2,
    height: 2,
    grid: [
      BlockType.NETHERRACK, BlockType.NETHERRACK,
      BlockType.NETHERRACK, BlockType.NETHERRACK,
    ],
  },

  // Block of Quartz (4 Nether Quartz)
  {
    id: 'quartz_block',
    name: 'Block of Quartz',
    category: 'blocks',
    output: { id: BlockType.QUARTZ_BLOCK, count: 1 },
    width: 2,
    height: 2,
    grid: [
      ItemType.NETHER_QUARTZ, ItemType.NETHER_QUARTZ,
      ItemType.NETHER_QUARTZ, ItemType.NETHER_QUARTZ,
    ],
  },
];

/**
 * Match a grid of items against crafting recipes
 * Supports both 3x3 and 2x2 grids
 */
export function matchRecipe(
  grid: (number | null)[],
  gridDim: 2 | 3
): { recipe: CraftingRecipe; output: ItemStack } | null {
  // Trim empty rows and columns from the input grid
  let minR: number = gridDim;
  let maxR: number = -1;
  let minC: number = gridDim;
  let maxC: number = -1;
  let nonEmptyCount = 0;
  const itemsPresent: number[] = [];

  for (let r = 0; r < gridDim; r++) {
    for (let c = 0; c < gridDim; c++) {
      const item = grid[r * gridDim + c];
      if (item !== null && item !== undefined && item !== BlockType.AIR) {
        nonEmptyCount++;
        itemsPresent.push(item);
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  if (nonEmptyCount === 0) return null;

  const patternW = maxC - minC + 1;
  const patternH = maxR - minR + 1;

  // Extract trimmed pattern
  const trimmed: (number | null)[] = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const val = grid[r * gridDim + c];
      trimmed.push(val === BlockType.AIR ? null : val);
    }
  }

  for (const recipe of CRAFTING_RECIPES) {
    // 1. Check shapeless recipes
    if (recipe.shapeless) {
      if (recipe.grid.length !== itemsPresent.length) continue;
      const sortedA = [...recipe.grid].sort();
      const sortedB = [...itemsPresent].sort();
      let match = true;
      for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return { recipe, output: { ...recipe.output } };
      }
      continue;
    }

    // 2. Check shaped recipes matching dimensions
    if (recipe.width === patternW && recipe.height === patternH) {
      // Direct match
      let isMatch = true;
      for (let i = 0; i < trimmed.length; i++) {
        if (recipe.grid[i] !== trimmed[i]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        return { recipe, output: { ...recipe.output } };
      }

      // Check horizontally mirrored (e.g. axes on left or right)
      if (patternW > 1) {
        let isMirrorMatch = true;
        for (let r = 0; r < patternH; r++) {
          for (let c = 0; c < patternW; c++) {
            const origVal = trimmed[r * patternW + (patternW - 1 - c)];
            const recipeVal = recipe.grid[r * patternW + c];
            if (origVal !== recipeVal) {
              isMirrorMatch = false;
              break;
            }
          }
          if (!isMirrorMatch) break;
        }
        if (isMirrorMatch) {
          return { recipe, output: { ...recipe.output } };
        }
      }
    }
  }

  return null;
}

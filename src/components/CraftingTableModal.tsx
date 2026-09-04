import React, { useState, useMemo } from 'react';
import { BlockType, ItemType, ItemStack } from '../types';
import { CRAFTING_RECIPES, matchRecipe, CraftingRecipe } from '../game/crafting';
import { ALL_ITEMS, getItemDef } from '../game/items';
import { sound } from '../game/audio';

interface CraftingTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotbar: (number | null)[];
  onUpdateHotbar: (newHotbar: (number | null)[]) => void;
  inventory: (number | null)[];
  onUpdateInventory: (newInv: (number | null)[]) => void;
}

export const CraftingTableModal: React.FC<CraftingTableModalProps> = ({
  isOpen,
  onClose,
  hotbar,
  onUpdateHotbar,
  inventory,
  onUpdateInventory,
}) => {
  // 3x3 crafting grid: 9 slots
  const [grid, setGrid] = useState<(number | null)[]>(Array(9).fill(null));
  const [showRecipeBook, setShowRecipeBook] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'blocks' | 'tools' | 'combat' | 'materials'>('all');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // Match recipe on grid
  const matched = useMemo(() => {
    return matchRecipe(grid, 3);
  }, [grid]);

  if (!isOpen) return null;

  // Filter recipes for the recipe book
  const filteredRecipes = CRAFTING_RECIPES.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  // Check if player has all ingredients for a given recipe
  const canCraftRecipe = (recipe: CraftingRecipe): boolean => {
    const available = [...hotbar, ...inventory].filter((x): x is number => x !== null && x !== BlockType.AIR);
    const needed = recipe.grid.filter((x): x is number => x !== null);

    const pool = [...available];
    for (const req of needed) {
      const idx = pool.indexOf(req);
      if (idx === -1) return false;
      pool.splice(idx, 1);
    }
    return true;
  };

  // 1-Click Recipe Autofill
  const handleAutoFillRecipe = (recipe: CraftingRecipe) => {
    sound.playClick();
    const newGrid: (number | null)[] = Array(9).fill(null);

    // If recipe is smaller than 3x3, place in top-left
    for (let r = 0; r < recipe.height; r++) {
      for (let c = 0; c < recipe.width; c++) {
        const item = recipe.grid[r * recipe.width + c];
        newGrid[r * 3 + c] = item;
      }
    }
    setGrid(newGrid);
  };

  // Click on a crafting grid slot
  const handleGridSlotClick = (index: number) => {
    sound.playPop();
    // If a slot is clicked, clear it or pick up
    setGrid((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  // Place item from hotbar or inventory into grid
  const handleInventoryItemClick = (itemId: number) => {
    sound.playPop();
    // Place into first empty slot in grid
    setGrid((prev) => {
      const next = [...prev];
      const firstEmpty = next.findIndex((x) => x === null);
      if (firstEmpty !== -1) {
        next[firstEmpty] = itemId;
      } else {
        // If grid is full, replace last slot
        next[8] = itemId;
      }
      return next;
    });
  };

  // Craft output item
  const handleCraft = () => {
    if (!matched) return;

    sound.playCraft();
    const outputId = matched.output.id;

    // Add to first empty slot in hotbar, or replace the last slot if full
    const hotbarEmpty = hotbar.findIndex((x) => x === null || x === BlockType.AIR);
    if (hotbarEmpty !== -1) {
      const nextHotbar = [...hotbar];
      nextHotbar[hotbarEmpty] = outputId;
      onUpdateHotbar(nextHotbar);
    } else {
      const nextHotbar = [...hotbar];
      nextHotbar[8] = outputId; // replace the last slot
      onUpdateHotbar(nextHotbar);
    }

    // Decrement or clear grid
    setGrid(Array(9).fill(null));
  };

  // Clear grid
  const handleClearGrid = () => {
    sound.playClick();
    setGrid(Array(9).fill(null));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs select-none">
      <div className="flex gap-2">
        {/* Optional Recipe Book Side Panel */}
        {showRecipeBook && (
          <div className="w-64 bg-[#c6c6c6] border-4 border-t-white border-l-white border-r-[#555] border-b-[#555] p-3 shadow-2xl flex flex-col font-sans">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#8b8b8b] mb-2">
              <span className="text-xs font-bold text-[#3f3f3f] flex items-center gap-1.5">
                <span className="w-3.5 h-4 bg-emerald-700 rounded-xs border border-black inline-block text-[9px] text-white text-center leading-4 font-bold">
                  📖
                </span>
                Recipe Book
              </span>
              <span className="text-[10px] text-[#555] font-mono">3x3 Grid</span>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 mb-2">
              {(['all', 'blocks', 'tools', 'combat', 'materials'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    sound.playClick();
                  }}
                  className={`px-1.5 py-0.5 text-[10px] font-bold uppercase transition border-2 ${
                    selectedCategory === cat
                      ? 'bg-[#efefef] border-t-white border-l-white border-r-[#555] border-b-[#555] text-neutral-900'
                      : 'bg-[#8b8b8b] border-t-[#aaa] border-l-[#aaa] border-r-[#333] border-b-[#333] text-neutral-800 hover:bg-[#a0a0a0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Recipe list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[340px]">
              {filteredRecipes.map((rec) => {
                const outDef = getItemDef(rec.output.id);
                const craftable = canCraftRecipe(rec);

                return (
                  <div
                    key={rec.id}
                    onClick={() => handleAutoFillRecipe(rec)}
                    className={`p-1.5 border-2 flex items-center justify-between cursor-pointer transition ${
                      craftable
                        ? 'bg-[#d8d8d8] hover:bg-white border-t-white border-l-white border-r-[#777] border-b-[#777]'
                        : 'bg-[#a5a5a5] hover:bg-[#b0b0b0] border-t-[#ccc] border-l-[#ccc] border-r-[#555] border-b-[#555] opacity-85'
                    }`}
                    title="Click to fill crafting grid"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 border border-black/40 shadow-xs flex items-center justify-center font-bold text-[10px] text-white"
                        style={{ backgroundColor: outDef.color }}
                      >
                        {rec.output.count > 1 ? rec.output.count : ''}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral-900 leading-tight">
                          {rec.name}
                        </span>
                        <span className="text-[10px] text-neutral-600">
                          {rec.category}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-xs border border-emerald-400">
                      Use
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Crafting Table GUI */}
        <div className="w-[420px] bg-[#c6c6c6] border-4 border-t-white border-l-white border-r-[#555] border-b-[#555] p-3 shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b-2 border-[#8b8b8b] mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowRecipeBook((prev) => !prev);
                  sound.playClick();
                }}
                className={`px-2 py-1 text-xs font-bold flex items-center gap-1 border-2 ${
                  showRecipeBook
                    ? 'bg-[#5ead3b] text-white border-t-white border-l-white border-r-[#244216] border-b-[#244216]'
                    : 'bg-[#8b8b8b] text-neutral-900 border-t-white border-l-white border-r-[#333] border-b-[#333]'
                }`}
                title="Toggle Recipe Book"
              >
                📗 Recipes
              </button>
              <h2 className="text-sm font-bold text-[#3f3f3f] tracking-wide">
                Crafting Table
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-6 h-6 bg-[#8b8b8b] hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Crafting Grid & Output Section */}
          <div className="bg-[#b5b5b5] p-3.5 border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white mb-3">
            <div className="flex items-center justify-center gap-6">
              {/* 3x3 Inset Input Grid */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#8b8b8b] p-2 border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white">
                {grid.map((slotItem, i) => {
                  const def = slotItem !== null ? getItemDef(slotItem) : null;
                  return (
                    <button
                      key={i}
                      onClick={() => handleGridSlotClick(i)}
                      className="w-10 h-10 bg-[#8b8b8b] hover:bg-[#9a9a9a] border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white flex items-center justify-center cursor-pointer transition active:scale-95"
                      title={def ? `${def.name} (Click to remove)` : 'Empty slot'}
                    >
                      {def && (
                        <div
                          className="w-7 h-7 border border-black/40 shadow-sm flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: def.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Arrow Indicator */}
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-[#555] select-none">➜</span>
                <span className="text-[10px] text-[#555] font-bold">CRAFT</span>
              </div>

              {/* Output Slot */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleCraft}
                  disabled={!matched}
                  className={`w-14 h-14 border-2 flex flex-col items-center justify-center transition ${
                    matched
                      ? 'bg-amber-100 hover:bg-amber-200 border-t-white border-l-white border-r-[#373737] border-b-[#373737] cursor-pointer ring-2 ring-yellow-400 shadow-md animate-pulse'
                      : 'bg-[#8b8b8b] border-t-[#373737] border-l-[#373737] border-r-white border-b-white cursor-not-allowed opacity-60'
                  }`}
                  title={matched ? `Craft ${matched.recipe.name}` : 'Place materials to craft'}
                >
                  {matched && (
                    <>
                      <div
                        className="w-9 h-9 border border-black/40 shadow-sm flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: getItemDef(matched.output.id).color }}
                      >
                        {matched.output.count > 1 ? matched.output.count : ''}
                      </div>
                    </>
                  )}
                </button>

                <span className="text-[10px] font-bold text-[#3f3f3f] text-center max-w-[80px] truncate">
                  {matched ? matched.recipe.name : 'Output'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#999]">
              <span className="text-[11px] text-[#444] italic">
                Tip: Click recipes on left or inventory items below to place.
              </span>
              <button
                onClick={handleClearGrid}
                className="px-2.5 py-1 bg-[#8b8b8b] hover:bg-[#9e9e9e] border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] text-[10px] font-bold text-neutral-900 cursor-pointer"
              >
                Clear Grid
              </button>
            </div>
          </div>

          {/* Hotbar / Inventory Quick Tray */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#3f3f3f]">
                Your Hotbar & Materials (Click to place in grid):
              </span>
            </div>

            <div className="grid grid-cols-9 gap-1 bg-[#8b8b8b] p-1.5 border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white">
              {hotbar.map((item, idx) => {
                const def = item !== null ? getItemDef(item) : null;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item !== null && item !== BlockType.AIR) {
                        handleInventoryItemClick(item);
                      }
                    }}
                    className="w-10 h-10 bg-[#8b8b8b] hover:bg-[#a0a0a0] border-2 border-t-white border-l-white border-r-[#373737] border-b-[#373737] flex flex-col items-center justify-center p-0.5 cursor-pointer transition active:scale-95 group"
                    title={def ? `${def.name} (Click to place)` : `Slot ${idx + 1}`}
                  >
                    {def ? (
                      <div
                        className="w-6 h-6 border border-black/40 shadow-xs transition group-hover:scale-110"
                        style={{ backgroundColor: def.color }}
                      />
                    ) : (
                      <span className="text-[9px] text-[#666]">{idx + 1}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-1.5 bg-[#8b8b8b] hover:bg-[#9e9e9e] border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] text-xs font-bold text-neutral-900 cursor-pointer shadow"
            >
              Done / Close (ESC)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

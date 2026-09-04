import React, { useState, useEffect } from 'react';
import { BlockType, ItemType } from '../types';
import { getItemDef } from '../game/items';
import { sound } from '../game/audio';

interface FurnaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotbar: (number | null)[];
  onUpdateHotbar: (newHotbar: (number | null)[]) => void;
}

interface SmeltRecipe {
  input: number;
  output: number;
  name: string;
}

const SMELT_RECIPES: SmeltRecipe[] = [
  { input: BlockType.IRON_ORE, output: ItemType.IRON_INGOT, name: 'Iron Ingot' },
  { input: BlockType.GOLD_ORE, output: ItemType.GOLD_INGOT, name: 'Gold Ingot' },
  { input: BlockType.COBBLESTONE, output: BlockType.STONE, name: 'Stone' },
  { input: BlockType.SAND, output: BlockType.GLASS, name: 'Glass' },
  { input: BlockType.OAK_LOG, output: ItemType.COAL, name: 'Charcoal' },
];

export const FurnaceModal: React.FC<FurnaceModalProps> = ({
  isOpen,
  onClose,
  hotbar,
  onUpdateHotbar,
}) => {
  const [inputItem, setInputItem] = useState<number | null>(BlockType.IRON_ORE);
  const [fuelItem, setFuelItem] = useState<number | null>(ItemType.COAL);
  const [outputItem, setOutputItem] = useState<number | null>(null);
  const [burnProgress, setBurnProgress] = useState<number>(0); // 0 to 100
  const [isBurning, setIsBurning] = useState<boolean>(false);

  // Furnace smelting loop
  useEffect(() => {
    if (!isOpen) return;

    let timer: any;
    const canSmelt =
      inputItem !== null &&
      fuelItem !== null &&
      SMELT_RECIPES.some((r) => r.input === inputItem);

    if (canSmelt) {
      setIsBurning(true);
      timer = setInterval(() => {
        setBurnProgress((prev) => {
          if (prev >= 100) {
            // Smelt finished!
            const recipe = SMELT_RECIPES.find((r) => r.input === inputItem);
            if (recipe) {
              sound.playCraft();
              setOutputItem(recipe.output);
              setInputItem(null);
            }
            return 0;
          }
          return prev + 10;
        });
      }, 300);
    } else {
      setIsBurning(false);
      setBurnProgress(0);
    }

    return () => clearInterval(timer);
  }, [isOpen, inputItem, fuelItem]);

  if (!isOpen) return null;

  const handleTakeOutput = () => {
    if (!outputItem) return;
    sound.playPop();

    // Put into hotbar
    const emptyIdx = hotbar.findIndex((x) => x === null || x === BlockType.AIR);
    if (emptyIdx !== -1) {
      const next = [...hotbar];
      next[emptyIdx] = outputItem;
      onUpdateHotbar(next);
    } else {
      const next = [...hotbar];
      next[0] = outputItem;
      onUpdateHotbar(next);
    }
    setOutputItem(null);
  };

  const handleSelectFromHotbar = (item: number) => {
    sound.playPop();
    // If it's a fuel (coal, stick, planks, log)
    if (
      item === ItemType.COAL ||
      item === ItemType.STICK ||
      item === BlockType.OAK_PLANKS ||
      item === BlockType.OAK_LOG
    ) {
      setFuelItem(item);
    } else {
      // Put in smelting input
      setInputItem(item);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs select-none">
      <div className="w-[380px] bg-[#c6c6c6] border-4 border-t-white border-l-white border-r-[#555] border-b-[#555] p-3 shadow-2xl flex flex-col font-sans">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b-2 border-[#8b8b8b] mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🔥</span>
            <h2 className="text-sm font-bold text-[#3f3f3f]">Furnace</h2>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-[#8b8b8b] hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Furnace Body */}
        <div className="bg-[#b5b5b5] p-4 border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white mb-3 flex items-center justify-around">
          {/* Left: Input & Fuel */}
          <div className="flex flex-col items-center gap-2">
            {/* Input Slot */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#444] font-bold mb-0.5">ORE / INPUT</span>
              <div
                onClick={() => setInputItem(null)}
                className="w-12 h-12 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white flex items-center justify-center cursor-pointer hover:bg-[#9a9a9a]"
                title={inputItem ? `${getItemDef(inputItem).name} (Click to clear)` : 'Place ore here'}
              >
                {inputItem && (
                  <div
                    className="w-8 h-8 border border-black/40"
                    style={{ backgroundColor: getItemDef(inputItem).color }}
                  />
                )}
              </div>
            </div>

            {/* Fire flame indicator */}
            <div className="w-5 h-5 flex items-center justify-center text-sm">
              {isBurning ? (
                <span className="animate-bounce">🔥</span>
              ) : (
                <span className="opacity-30 grayscale">🔥</span>
              )}
            </div>

            {/* Fuel Slot */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => setFuelItem(null)}
                className="w-12 h-12 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white flex items-center justify-center cursor-pointer hover:bg-[#9a9a9a]"
                title={fuelItem ? `${getItemDef(fuelItem).name} (Fuel)` : 'Place fuel (coal/wood) here'}
              >
                {fuelItem && (
                  <div
                    className="w-8 h-8 border border-black/40"
                    style={{ backgroundColor: getItemDef(fuelItem).color }}
                  />
                )}
              </div>
              <span className="text-[9px] text-[#444] font-bold mt-0.5">FUEL</span>
            </div>
          </div>

          {/* Center Progress Arrow */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative w-12 h-5 bg-[#8b8b8b] border border-[#555] rounded-xs overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${burnProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-[#555] font-mono">
              {burnProgress}%
            </span>
          </div>

          {/* Right: Output */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-[#444] font-bold">OUTPUT</span>
            <button
              onClick={handleTakeOutput}
              disabled={!outputItem}
              className={`w-14 h-14 border-2 flex items-center justify-center transition ${
                outputItem
                  ? 'bg-amber-100 hover:bg-amber-200 border-t-white border-l-white border-r-[#373737] border-b-[#373737] cursor-pointer ring-2 ring-yellow-400'
                  : 'bg-[#8b8b8b] border-t-[#373737] border-l-[#373737] border-r-white border-b-white cursor-not-allowed opacity-60'
              }`}
            >
              {outputItem && (
                <div
                  className="w-9 h-9 border border-black/40"
                  style={{ backgroundColor: getItemDef(outputItem).color }}
                />
              )}
            </button>
            <span className="text-[10px] font-bold text-[#3f3f3f]">
              {outputItem ? getItemDef(outputItem).name : 'Empty'}
            </span>
          </div>
        </div>

        {/* Hotbar materials tray */}
        <div>
          <span className="text-[11px] font-bold text-[#3f3f3f] mb-1 block">
            Select items from hotbar to smelt or use as fuel:
          </span>
          <div className="grid grid-cols-9 gap-1 bg-[#8b8b8b] p-1.5 border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white">
            {hotbar.map((item, idx) => {
              const def = item !== null ? getItemDef(item) : null;
              return (
                <button
                  key={idx}
                  onClick={() => item && handleSelectFromHotbar(item)}
                  className="w-9 h-9 bg-[#8b8b8b] hover:bg-[#a0a0a0] border-2 border-t-white border-l-white border-r-[#373737] border-b-[#373737] flex items-center justify-center cursor-pointer"
                  title={def ? def.name : 'Empty'}
                >
                  {def && (
                    <div
                      className="w-6 h-6 border border-black/40"
                      style={{ backgroundColor: def.color }}
                    />
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
            className="px-4 py-1 bg-[#8b8b8b] hover:bg-[#9e9e9e] border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] text-xs font-bold text-neutral-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

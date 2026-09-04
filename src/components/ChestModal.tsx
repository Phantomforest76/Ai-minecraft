import React, { useState, useEffect } from 'react';
import { BlockType, ItemType } from '../types';
import { getItemDef } from '../game/items';
import { sound } from '../game/audio';

interface ChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotbar: (number | null)[];
  onUpdateHotbar: (newHotbar: (number | null)[]) => void;
}

export const ChestModal: React.FC<ChestModalProps> = ({
  isOpen,
  onClose,
  hotbar,
  onUpdateHotbar,
}) => {
  // 27 slots in a standard chest (3x9)
  const [chestSlots, setChestSlots] = useState<(number | null)[]>(() => {
    const slots = Array(27).fill(null);
    // Village & Explorer loot
    slots[0] = ItemType.DIAMOND;
    slots[1] = ItemType.IRON_INGOT;
    slots[2] = ItemType.GOLD_INGOT;
    slots[4] = BlockType.OBSIDIAN;
    slots[5] = BlockType.TORCH;
    slots[9] = ItemType.BREAD;
    slots[10] = ItemType.APPLE;
    slots[13] = ItemType.IRON_SWORD;
    slots[18] = BlockType.OAK_LOG;
    slots[19] = BlockType.COBBLESTONE;
    slots[22] = BlockType.TNT;
    return slots;
  });

  useEffect(() => {
    if (isOpen) {
      sound.playChestOpen();
    }
  }, [isOpen]);

  const handleClose = () => {
    sound.playChestClose();
    onClose();
  };

  if (!isOpen) return null;

  // Move from chest to hotbar
  const handleChestSlotClick = (slotIdx: number) => {
    const item = chestSlots[slotIdx];
    if (!item) return;

    sound.playPop();
    const hotbarEmpty = hotbar.findIndex((x) => x === null || x === BlockType.AIR);
    if (hotbarEmpty !== -1) {
      const nextHotbar = [...hotbar];
      nextHotbar[hotbarEmpty] = item;
      onUpdateHotbar(nextHotbar);

      const nextChest = [...chestSlots];
      nextChest[slotIdx] = null;
      setChestSlots(nextChest);
    }
  };

  // Move from hotbar to chest
  const handleHotbarSlotClick = (hotbarIdx: number) => {
    const item = hotbar[hotbarIdx];
    if (!item) return;

    sound.playPop();
    const chestEmpty = chestSlots.findIndex((x) => x === null);
    if (chestEmpty !== -1) {
      const nextChest = [...chestSlots];
      nextChest[chestEmpty] = item;
      setChestSlots(nextChest);

      const nextHotbar = [...hotbar];
      nextHotbar[hotbarIdx] = null;
      onUpdateHotbar(nextHotbar);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs select-none">
      <div className="w-[430px] bg-[#c6c6c6] border-4 border-t-white border-l-white border-r-[#555] border-b-[#555] p-3 shadow-2xl flex flex-col font-sans">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b-2 border-[#8b8b8b] mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📦</span>
            <h2 className="text-sm font-bold text-[#3f3f3f]">Chest Storage</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-6 h-6 bg-[#8b8b8b] hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Chest Slots (3x9) */}
        <div className="bg-[#b5b5b5] p-2.5 border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white mb-3">
          <div className="text-[11px] font-bold text-[#3f3f3f] mb-1.5 flex justify-between">
            <span>Chest Contents (Click to move to hotbar):</span>
            <span className="text-[#555] font-mono">27 Slots</span>
          </div>
          <div className="grid grid-cols-9 gap-1 bg-[#8b8b8b] p-1.5 border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white">
            {chestSlots.map((item, idx) => {
              const def = item ? getItemDef(item) : null;
              return (
                <button
                  key={idx}
                  onClick={() => handleChestSlotClick(idx)}
                  className="w-9 h-9 bg-[#8b8b8b] hover:bg-[#9e9e9e] border-2 border-t-white border-l-white border-r-[#373737] border-b-[#373737] flex items-center justify-center cursor-pointer transition active:scale-95"
                  title={def ? `${def.name} (Click to take)` : 'Empty slot'}
                >
                  {def && (
                    <div
                      className="w-6 h-6 border border-black/40 shadow-xs"
                      style={{ backgroundColor: def.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player Hotbar Tray */}
        <div className="mb-2">
          <span className="text-[11px] font-bold text-[#3f3f3f] mb-1 block">
            Inventory / Hotbar (Click to deposit into chest):
          </span>
          <div className="grid grid-cols-9 gap-1 bg-[#8b8b8b] p-1.5 border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white">
            {hotbar.map((item, idx) => {
              const def = item ? getItemDef(item) : null;
              return (
                <button
                  key={idx}
                  onClick={() => handleHotbarSlotClick(idx)}
                  className="w-9 h-9 bg-[#8b8b8b] hover:bg-[#9e9e9e] border-2 border-t-white border-l-white border-r-[#373737] border-b-[#373737] flex items-center justify-center cursor-pointer transition active:scale-95"
                  title={def ? `${def.name} (Click to store)` : `Slot ${idx + 1}`}
                >
                  {def && (
                    <div
                      className="w-6 h-6 border border-black/40 shadow-xs"
                      style={{ backgroundColor: def.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 bg-[#8b8b8b] hover:bg-[#9e9e9e] border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] text-xs font-bold text-neutral-900 cursor-pointer"
          >
            Close Chest
          </button>
        </div>
      </div>
    </div>
  );
};

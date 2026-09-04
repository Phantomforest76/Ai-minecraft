import React, { useState } from 'react';
import { BlockType, ItemType } from '../types';
import { ALL_ITEMS, getItemDef } from '../game/items';

interface BlockPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (itemId: number) => void;
  selectedSlot: number;
}

export const BlockPickerModal: React.FC<BlockPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectBlock,
  selectedSlot,
}) => {
  const [category, setCategory] = useState<'all' | 'blocks' | 'tools' | 'combat' | 'materials'>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const allItemsList = Object.values(ALL_ITEMS);

  const filtered = allItemsList.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none">
      <div className="w-[480px] bg-[#c6c6c6] border-4 border-t-white border-l-white border-r-[#555555] border-b-[#555555] p-3.5 shadow-2xl font-sans text-neutral-800">
        {/* Header */}
        <div className="flex justify-between items-center mb-2 pb-1.5 border-b-2 border-[#8b8b8b]">
          <h2 className="text-sm font-bold text-[#3f3f3f] tracking-wide">
            Creative Item Inventory (Assigning to Slot {selectedSlot + 1})
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-[#8b8b8b] hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-[#b5b5b5] border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white text-neutral-900 placeholder:text-neutral-600 focus:outline-none"
          />
          <div className="flex gap-1">
            {(['all', 'blocks', 'tools', 'combat', 'materials'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-1.5 py-0.5 text-[10px] font-bold uppercase transition border-2 ${
                  category === cat
                    ? 'bg-[#efefef] border-t-white border-l-white border-r-[#555] border-b-[#555] text-neutral-900'
                    : 'bg-[#8b8b8b] border-t-[#aaa] border-l-[#aaa] border-r-[#333] border-b-[#333] text-neutral-800 hover:bg-[#a0a0a0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-7 gap-1.5 bg-[#8b8b8b] p-2.5 border-2 border-t-[#373737] border-l-[#373737] border-r-white border-b-white max-h-72 overflow-y-auto">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectBlock(item.id);
                onClose();
              }}
              className="w-13 h-13 bg-[#8b8b8b] hover:bg-neutral-300 border-2 border-t-white border-l-white border-r-[#373737] border-b-[#373737] flex flex-col items-center justify-center p-1 cursor-pointer transition active:scale-95 group"
              title={`${item.name} (${item.category})`}
            >
              <div
                className="w-6 h-6 border border-black/40 shadow-xs transition group-hover:scale-110"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[9px] font-bold text-neutral-900 mt-1 truncate max-w-[46px]">
                {item.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-[#555]">
            Showing {filtered.length} items. Click any to equip.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#8b8b8b] hover:bg-[#a0a0a0] border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] text-xs font-bold text-neutral-900 cursor-pointer shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

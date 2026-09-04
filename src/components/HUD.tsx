import React from 'react';
import { BlockType, DebugInfo, PlayerStats } from '../types';
import { getItemDef } from '../game/items';

interface HUDProps {
  debugInfo: DebugInfo;
  showF3: boolean;
  playerStats: PlayerStats;
  hotbar: number[];
  selectedSlot: number;
  onSelectSlot: (slot: number) => void;
  tooltipText: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenInventory: () => void;
  onOpenCrafting?: () => void;
  onToggleF3: () => void;
  onToggleFly?: () => void;
  onToggleGameMode?: () => void;
  onUnstuck?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  debugInfo,
  showF3,
  playerStats,
  hotbar,
  selectedSlot,
  onSelectSlot,
  tooltipText,
  isPaused,
  onTogglePause,
  onOpenInventory,
  onOpenCrafting,
  onToggleF3,
  onToggleFly,
  onToggleGameMode,
  onUnstuck,
}) => {
  // Render 10 Hearts
  const renderHearts = () => {
    const totalHearts = 10;
    const currentHealth = playerStats.health; // 0 to 20
    const hearts = [];

    for (let i = 0; i < totalHearts; i++) {
      const heartValue = (i + 1) * 2;
      const isFull = currentHealth >= heartValue;
      const isHalf = currentHealth === heartValue - 1;

      hearts.push(
        <div key={i} className="relative w-3.5 h-3.5 inline-block">
          {/* Heart background / outline */}
          <div className="w-3.5 h-3.5 bg-black/60 border border-black/80 rounded-xs flex items-center justify-center">
            {isFull ? (
              <div className="w-2.5 h-2.5 bg-red-600 border border-black/40 shadow-inner" />
            ) : isHalf ? (
              <div className="w-2.5 h-2.5 flex">
                <div className="w-1.5 h-2.5 bg-red-600 border border-black/40" />
                <div className="w-1 h-2.5 bg-neutral-700" />
              </div>
            ) : (
              <div className="w-2.5 h-2.5 bg-neutral-800 border border-black/50" />
            )}
          </div>
        </div>
      );
    }
    return hearts;
  };

  // Render 10 Hunger drumsticks
  const renderHunger = () => {
    const totalDrumsticks = 10;
    const currentHunger = playerStats.hunger; // 0 to 20
    const drumsticks = [];

    for (let i = 0; i < totalDrumsticks; i++) {
      const value = (i + 1) * 2;
      const isFull = currentHunger >= value;

      drumsticks.push(
        <div key={i} className="relative w-3.5 h-3.5 inline-block">
          <div className="w-3.5 h-3.5 bg-black/60 border border-black/80 rounded-xs flex items-center justify-center">
            {isFull ? (
              <div className="w-2.5 h-2.5 bg-[#8b4513] border border-black/40 shadow-inner" />
            ) : (
              <div className="w-2.5 h-2.5 bg-[#3a1d08] border border-black/50" />
            )}
          </div>
        </div>
      );
    }
    return drumsticks;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden font-sans">
      {/* 1. Classic F3 Debug Screen (Top-Left) */}
      {showF3 && (
        <div className="absolute top-3 left-3 text-white text-[11px] leading-tight font-mono drop-shadow-[1px_1px_0px_rgba(0,0,0,0.9)] bg-black/35 p-2 rounded max-w-sm pointer-events-auto">
          <div className="font-bold text-yellow-300">
            Minecraft Java Edition 1.20.1 (Web Build)
          </div>
          <div className="text-neutral-200">
            {debugInfo.fps} fps (chunk gen: {debugInfo.chunksLoaded} chunks)
          </div>
          <div className="text-neutral-300">
            C: {debugInfo.chunksLoaded} / Triangles: {debugInfo.triangles.toLocaleString()}
          </div>
          <div className="text-yellow-200">
            E: {debugInfo.entities || '0/14'}
          </div>
          <div className="text-neutral-300">
            Display: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1024x768'} (WebGL)
          </div>
          <div className="my-1 border-t border-white/20"></div>
          <div className="text-green-300">
            XYZ: {debugInfo.x.toFixed(3)} / {debugInfo.y.toFixed(3)} / {debugInfo.z.toFixed(3)}
          </div>
          <div className="text-neutral-200">
            Block: {debugInfo.blockX} {debugInfo.blockY} {debugInfo.blockZ}
          </div>
          <div className="text-neutral-300">
            Chunk: {debugInfo.chunkX} {Math.floor(debugInfo.y / 16)} {debugInfo.chunkZ}
          </div>
          <div className="text-cyan-300">
            Facing: {debugInfo.facing}
          </div>
          <div className="text-amber-300">
            Biome: minecraft:{debugInfo.biome.toLowerCase()}
          </div>
          <div className="text-purple-300 font-bold">
            Dimension: {debugInfo.dimension}
          </div>
          <div className="text-neutral-400 mt-1 text-[10px]">
            [Press F3 or toggle HUD button to hide]
          </div>
        </div>
      )}

      {/* Top-Right Action Controls (Pointer Events Enabled) */}
      <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto">
        {onToggleGameMode && (
          <button
            onClick={onToggleGameMode}
            className={`px-2.5 py-1 text-xs font-mono border rounded cursor-pointer transition shadow active:scale-95 flex items-center gap-1 ${
              playerStats.gameMode === 'creative'
                ? 'bg-amber-800/80 border-amber-400 text-yellow-300'
                : 'bg-black/60 hover:bg-black/80 border-white/40 text-neutral-200'
            }`}
            title="Toggle Creative / Survival Mode (G)"
          >
            <span>{playerStats.gameMode === 'creative' ? '✨' : '⚔️'}</span>
            <span className="capitalize">{playerStats.gameMode} (G)</span>
          </button>
        )}
        {onToggleFly && (
          <button
            onClick={onToggleFly}
            className={`px-2.5 py-1 text-xs font-mono border rounded cursor-pointer transition shadow active:scale-95 flex items-center gap-1 ${
              playerStats.isFlying
                ? 'bg-lime-800/80 border-lime-400 text-lime-200'
                : 'bg-black/60 hover:bg-black/80 border-white/40 text-neutral-200'
            }`}
            title="Toggle Flight (F / Double Space)"
          >
            <span>✈️</span>
            <span>{playerStats.isFlying ? 'Flying (F)' : 'Fly (F)'}</span>
          </button>
        )}
        {onUnstuck && (
          <button
            onClick={onUnstuck}
            className="px-2.5 py-1 text-xs font-mono bg-red-950/80 hover:bg-red-900 border border-red-400 text-red-200 rounded cursor-pointer transition shadow active:scale-95 flex items-center gap-1"
            title="Unstuck / Teleport to Safe Surface (U)"
          >
            <span>🧭</span> Unstuck (U)
          </button>
        )}
        <button
          onClick={onToggleF3}
          className="px-2.5 py-1 text-xs font-mono bg-black/60 hover:bg-black/80 border border-white/40 text-white rounded cursor-pointer transition shadow active:scale-95"
          title="Toggle F3 Debug Information"
        >
          F3 Debug
        </button>
        {onOpenCrafting && (
          <button
            onClick={onOpenCrafting}
            className="px-2.5 py-1 text-xs font-mono bg-emerald-800/80 hover:bg-emerald-700/90 border border-emerald-400 text-white rounded cursor-pointer transition shadow active:scale-95 flex items-center gap-1"
            title="Open Crafting Table (C)"
          >
            <span>⚒️</span> Crafting (C)
          </button>
        )}
        <button
          onClick={onOpenInventory}
          className="px-2.5 py-1 text-xs font-mono bg-black/60 hover:bg-black/80 border border-white/40 text-white rounded cursor-pointer transition shadow active:scale-95"
          title="Open Blocks Inventory (E)"
        >
          Inventory (E)
        </button>
        <button
          onClick={onTogglePause}
          className="px-2.5 py-1 text-xs font-mono bg-black/60 hover:bg-black/80 border border-white/40 text-white rounded cursor-pointer transition shadow active:scale-95"
          title="Pause Menu (ESC)"
        >
          Menu (ESC)
        </button>
      </div>

      {/* 2. Java Edition Crosshair (Screen Center) */}
      {!isPaused && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none crosshair-blend">
          <div className="w-3.5 h-[2px] bg-white opacity-90 shadow-[0_0_1px_black]"></div>
          <div className="absolute w-[2px] h-3.5 bg-white opacity-90 shadow-[0_0_1px_black]"></div>
        </div>
      )}

      {/* 3. Bottom Hotbar & Vitals Area */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-auto">
        {/* Nether Portal Guide Banner */}
        {(hotbar[selectedSlot] === BlockType.OBSIDIAN || hotbar[selectedSlot] === 120) && (
          <div className="text-purple-200 text-[11px] font-mono bg-purple-950/90 px-3 py-1 rounded border border-purple-400/60 drop-shadow-md text-center shadow-lg animate-pulse">
            ✦ Nether Portal: Build a 4x5 Obsidian frame (2 wide × 3 high empty interior) & ignite with Flint and Steel!
          </div>
        )}

        {/* Active Block Tooltip on Switch */}
        {tooltipText && (
          <div className="text-white text-xs font-mono bg-black/75 px-2.5 py-0.5 rounded border border-white/30 drop-shadow animate-fade-in">
            {tooltipText}
          </div>
        )}

        {/* Vitals: Health and Hunger */}
        {playerStats.gameMode === 'survival' && (
          <div className="w-[380px] flex justify-between px-2 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">
            <div className="flex gap-0.5">{renderHearts()}</div>
            <div className="flex gap-0.5">{renderHunger()}</div>
          </div>
        )}

        {/* Experience Bar */}
        <div className="w-[380px] h-1.5 bg-black/60 border border-black/80 rounded-xs relative overflow-hidden flex items-center">
          <div
            className="h-full bg-lime-400 transition-all duration-150"
            style={{ width: `${Math.max(4, playerStats.xpProgress * 100)}%` }}
          />
          {playerStats.xpLevel > 0 && (
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 text-[10px] font-mono text-lime-400 font-bold drop-shadow-[1px_1px_0px_black]">
              {playerStats.xpLevel}
            </span>
          )}
        </div>

        {/* 9 Hotbar Slots */}
        <div className="flex bg-black/60 border-4 border-[#8b8b8b] p-1 gap-1 rounded-xs shadow-2xl backdrop-blur-xs">
          {hotbar.map((itemId, idx) => {
            const isSelected = selectedSlot === idx;
            const def = itemId !== null ? getItemDef(itemId) : null;
            const color = def?.color || '#fff';

            return (
              <button
                key={idx}
                onClick={() => onSelectSlot(idx)}
                className={`relative w-10 h-10 flex items-center justify-center cursor-pointer transition-all ${
                  isSelected
                    ? 'border-4 border-white bg-white/20 shadow-md scale-105 z-10'
                    : 'border-2 border-neutral-700/60 bg-black/30 hover:bg-white/10'
                }`}
                title={`${idx + 1}: ${def?.name || 'Empty'}`}
              >
                {/* Hotbar Slot Number */}
                <span className="absolute top-0.5 left-1 text-[9px] font-mono text-neutral-400 drop-shadow">
                  {idx + 1}
                </span>

                {/* Block preview cube representation */}
                {itemId !== BlockType.AIR && itemId !== null && (
                  <div
                    className="w-5 h-5 rounded-xs shadow-md transform rotate-6 border border-black/40"
                    style={{ backgroundColor: color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

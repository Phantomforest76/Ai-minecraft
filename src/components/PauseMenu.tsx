import React from 'react';
import { GameSettings, PlayerStats } from '../types';
import { sound } from '../game/audio';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  playerStats: PlayerStats;
  onUpdateStats: (stats: Partial<PlayerStats>) => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onNewWorld: (seed: number) => void;
  onOpenAnalyzer?: () => void;
  onUnstuck?: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  playerStats,
  onUpdateStats,
  settings,
  onUpdateSettings,
  onNewWorld,
  onOpenAnalyzer,
  onUnstuck,
}) => {
  if (!isOpen) return null;

  const handleButtonClick = (action: () => void) => {
    sound.playClick();
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm select-none p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#333333] border-4 border-t-[#555] border-l-[#555] border-r-[#111] border-b-[#111] p-6 shadow-2xl text-white font-sans rounded-xs">
        {/* Title */}
        <h1 className="text-xl font-bold text-center mb-6 text-yellow-300 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] tracking-wide">
          Game Menu
        </h1>

        <div className="flex flex-col gap-3">
          {/* Back to Game Button */}
          <button
            onClick={() => handleButtonClick(onResume)}
            className="w-full py-2.5 bg-[#4a4a4a] hover:bg-[#5a5a5a] border-2 border-t-white border-l-white border-r-black border-b-black font-bold text-sm text-white cursor-pointer transition shadow active:translate-y-0.5"
          >
            Back to Game
          </button>

          {/* Row 1: Game Mode & Flight */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                handleButtonClick(() =>
                  onUpdateStats({
                    gameMode: playerStats.gameMode === 'creative' ? 'survival' : 'creative',
                    isFlying: playerStats.gameMode === 'survival',
                  })
                )
              }
              className="py-2 px-3 bg-[#3f3f3f] hover:bg-[#4f4f4f] border-2 border-t-[#666] border-l-[#666] border-r-black border-b-black text-xs font-bold text-neutral-200 cursor-pointer text-center"
            >
              Mode: <span className="text-yellow-400 capitalize">{playerStats.gameMode} (G)</span>
            </button>

            <button
              onClick={() =>
                handleButtonClick(() =>
                  onUpdateStats({
                    isFlying: !playerStats.isFlying,
                  })
                )
              }
              className={`py-2 px-3 border-2 border-t-[#666] border-l-[#666] border-r-black border-b-black text-xs font-bold cursor-pointer text-center ${
                playerStats.isFlying
                  ? 'bg-lime-900 text-lime-300 border-lime-500'
                  : 'bg-[#3f3f3f] hover:bg-[#4f4f4f] text-neutral-200'
              }`}
            >
              Flight (F): <span className={playerStats.isFlying ? 'text-lime-300' : 'text-neutral-400'}>
                {playerStats.isFlying ? 'FLYING' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Unstuck Rescue Button */}
          {onUnstuck && (
            <button
              onClick={() => handleButtonClick(onUnstuck)}
              className="w-full py-2 bg-amber-900/80 hover:bg-amber-800 border-2 border-t-amber-400 border-l-amber-400 border-r-black border-b-black font-bold text-xs text-amber-200 cursor-pointer shadow flex items-center justify-center gap-2"
            >
              <span>🧭</span> Unstuck / Teleport to Surface (Key U)
            </button>
          )}

          {/* Row 2: Render Distance & Sound Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#262626] p-2.5 border-2 border-t-black border-l-black border-r-[#444] border-b-[#444] flex flex-col justify-center">
              <div className="flex justify-between text-xs font-bold mb-1 text-neutral-300">
                <span>Render Distance</span>
                <span className="text-yellow-400">{settings.renderDistance} chunks</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                step={1}
                value={settings.renderDistance}
                onChange={(e) =>
                  onUpdateSettings({ renderDistance: parseInt(e.target.value, 10) })
                }
                className="w-full cursor-pointer accent-yellow-400 h-1.5 bg-neutral-700 rounded-lg appearance-none"
              />
            </div>

            <div className="bg-[#262626] p-2.5 border-2 border-t-black border-l-black border-r-[#444] border-b-[#444] flex flex-col justify-center">
              <div className="flex justify-between text-xs font-bold mb-1 text-neutral-300">
                <span>Mouse Sensitivity</span>
                <span className="text-yellow-400">{Math.round(settings.mouseSensitivity * 10000)}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={35}
                step={1}
                value={Math.round(settings.mouseSensitivity * 10000)}
                onChange={(e) =>
                  onUpdateSettings({ mouseSensitivity: parseInt(e.target.value, 10) / 10000 })
                }
                className="w-full cursor-pointer accent-yellow-400 h-1.5 bg-neutral-700 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* Sound & Graphics Controls */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                handleButtonClick(() => {
                  const nextSound = !settings.soundEnabled;
                  sound.enabled = nextSound;
                  onUpdateSettings({ soundEnabled: nextSound });
                })
              }
              className={`py-2 px-3 border-2 border-t-[#666] border-l-[#666] border-r-black border-b-black text-xs font-bold cursor-pointer text-center flex items-center justify-center ${
                settings.soundEnabled ? 'bg-[#3f3f3f] hover:bg-[#4f4f4f]' : 'bg-red-950 text-red-300'
              }`}
            >
              Sound: <span className="ml-1 text-yellow-400">{settings.soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() =>
                handleButtonClick(() => {
                  const nextShadows = settings.shadows === false ? true : false;
                  onUpdateSettings({ shadows: nextShadows });
                })
              }
              className={`py-2 px-3 border-2 border-t-[#666] border-l-[#666] border-r-black border-b-black text-xs font-bold cursor-pointer text-center flex items-center justify-center ${
                settings.shadows !== false ? 'bg-[#2a442a] text-emerald-300 border-emerald-600' : 'bg-[#3f3f3f] text-neutral-300'
              }`}
            >
              PCF Shadows: <span className="ml-1 text-yellow-400">{settings.shadows !== false ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Graphics Card Analyzer Action */}
          {onOpenAnalyzer && (
            <button
              onClick={() => handleButtonClick(onOpenAnalyzer)}
              className="w-full py-2 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 border-2 border-t-emerald-400 border-l-emerald-400 border-r-black border-b-black font-bold text-xs text-yellow-300 cursor-pointer shadow flex items-center justify-center gap-2"
            >
              <span>⚡</span> Run Graphics Card Analyzer & Auto-Optimize
            </button>
          )}

          {/* Row 3: Time of Day */}
          <div className="bg-[#262626] p-2.5 border-2 border-t-black border-l-black border-r-[#444] border-b-[#444]">
            <span className="text-xs font-bold text-neutral-300 block mb-1.5">Time of Day</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Morning', time: 0.0 },
                { label: 'Noon', time: 0.15 },
                { label: 'Sunset', time: 0.25 },
                { label: 'Night', time: 0.5 },
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => handleButtonClick(() => onUpdateSettings({ timeOfDay: t.time }))}
                  className="py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] border border-neutral-600 text-[11px] font-bold text-neutral-200 rounded-xs cursor-pointer"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Regenerate World Button */}
          <button
            onClick={() =>
              handleButtonClick(() => {
                const newSeed = Math.floor(Math.random() * 900000) + 100000;
                onNewWorld(newSeed);
                onResume();
              })
            }
            className="w-full py-2 bg-[#2d3a4a] hover:bg-[#3d4d60] border-2 border-t-[#5f7390] border-l-[#5f7390] border-r-black border-b-black font-bold text-xs text-cyan-200 cursor-pointer shadow"
          >
            Generate New World (Random Seed)
          </button>
        </div>

        {/* Controls Reference Card */}
        <div className="mt-5 p-3 bg-black/40 border border-neutral-700 text-[11px] text-neutral-300 space-y-1 rounded-xs">
          <div className="font-bold text-yellow-400 mb-1 text-xs">Minecraft Controls:</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <div><span className="text-white font-mono">WASD</span>: Move</div>
            <div><span className="text-white font-mono">SPACE</span>: Jump / Fly Up</div>
            <div><span className="text-white font-mono">F / 2xSPACE</span>: Toggle Flight</div>
            <div><span className="text-white font-mono">G</span>: Creative / Survival</div>
            <div><span className="text-white font-mono">LEFT CLICK</span>: Mine / Attack</div>
            <div><span className="text-white font-mono">RIGHT CLICK</span>: Place / Interact</div>
            <div><span className="text-white font-mono">SHIFT</span>: Sneak / Fly Down</div>
            <div><span className="text-white font-mono">U</span>: Unstuck to Surface</div>
            <div><span className="text-white font-mono">1 - 9</span>: Hotbar slot</div>
            <div><span className="text-white font-mono">E</span>: Creative Inventory</div>
            <div><span className="text-white font-mono">F3</span>: Debug screen</div>
            <div><span className="text-white font-mono">ESC</span>: Pause menu</div>
          </div>
        </div>
      </div>
    </div>
  );
};

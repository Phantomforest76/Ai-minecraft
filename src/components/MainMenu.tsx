import React, { useState } from 'react';
import { sound } from '../game/audio';

interface MainMenuProps {
  onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleStart = () => {
    sound.playClick();
    onStart();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#4a4a4a] overflow-hidden select-none">
      {/* Dirt Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'64\' height=\'64\' viewBox=\'0 0 64 64\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'64\' height=\'64\' fill=\'%235e3e29\'/%3E%3Cpath d=\'M0 0h32v32H0zM32 32h32v32H32z\' fill=\'%23734b31\'/%3E%3Cpath d=\'M32 0h32v32H32zM0 32h32v32H0z\' fill=\'%234a3120\'/%3E%3C/svg%3E")',
          backgroundSize: '64px 64px',
          backgroundRepeat: 'repeat',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Title Logo */}
        <div className="mb-16 transform hover:scale-105 transition-transform duration-700">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#e3e3e3] to-[#999999] drop-shadow-[4px_4px_0px_#000000] font-minecraft tracking-widest text-center leading-tight">
            MINECRAFT<br/>
            <span className="text-3xl text-yellow-300 drop-shadow-[2px_2px_0px_#333300]">Java Edition Web</span>
          </h1>
        </div>

        {/* Buttons */}
        <div className="w-[400px] flex flex-col gap-4">
          <button
            onClick={handleStart}
            className="w-full py-4 bg-[#7a7a7a] hover:bg-[#8f8f8f] text-white font-bold text-lg border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] cursor-pointer transition active:scale-95 shadow-lg"
          >
            Singleplayer
          </button>
          
          <button
            onClick={() => {
              sound.playClick();
              alert('Multiplayer is coming soon!');
            }}
            className="w-full py-4 bg-[#7a7a7a] hover:bg-[#8f8f8f] text-white font-bold text-lg border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] cursor-pointer transition active:scale-95 shadow-lg opacity-80"
          >
            Multiplayer
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => {
                sound.playClick();
                setShowOptions(true);
              }}
              className="w-full py-4 bg-[#7a7a7a] hover:bg-[#8f8f8f] text-white font-bold text-lg border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] cursor-pointer transition active:scale-95 shadow-lg"
            >
              Options...
            </button>
            <button
              onClick={() => {
                sound.playClick();
                window.location.reload();
              }}
              className="w-full py-4 bg-[#7a7a7a] hover:bg-[#8f8f8f] text-white font-bold text-lg border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] cursor-pointer transition active:scale-95 shadow-lg"
            >
              Quit Game
            </button>
          </div>
        </div>
      </div>

      {showOptions && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[400px] bg-[#4a4a4a] border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] p-6 text-center">
            <h2 className="text-white text-xl font-bold mb-6">Options</h2>
            <p className="text-neutral-300 mb-6 text-sm">Options are configured in-game via the Pause menu (ESC).</p>
            <button
              onClick={() => {
                sound.playClick();
                setShowOptions(false);
              }}
              className="w-full py-3 bg-[#7a7a7a] hover:bg-[#8f8f8f] text-white font-bold border-2 border-t-white border-l-white border-r-[#333] border-b-[#333] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Footer Version */}
      <div className="absolute bottom-2 left-2 text-white/50 text-sm font-mono drop-shadow-md">
        Minecraft Web Edition 1.0
      </div>
      <div className="absolute bottom-2 right-2 text-white/50 text-sm font-mono drop-shadow-md text-right">
        Made with React & Three.js
      </div>
    </div>
  );
};

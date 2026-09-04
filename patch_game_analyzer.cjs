const fs = require('fs');
let code = fs.readFileSync('src/components/MinecraftGame.tsx', 'utf8');

const importTarget = `import { BlockType, ItemType, GameSettings, ItemDef } from '../types';`;
const importReplace = `import { BlockType, ItemType, GameSettings, ItemDef } from '../types';
import { GraphicsAnalyzer } from './GraphicsAnalyzer';`;
code = code.replace(importTarget, importReplace);

const analyzerState = `  const [isDead, setIsDead] = useState<boolean>(false);`;
const analyzerStateReplace = `  const [isDead, setIsDead] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);`;
code = code.replace(analyzerState, analyzerStateReplace);

const effectTarget = `  // Initialize Game on Mount
  useEffect(() => {`;
const effectReplace = `  // Initialize Game on Mount
  useEffect(() => {
    if (isAnalyzing) return;`;
code = code.replace(effectTarget, effectReplace);

const dependTarget = `  }, []); // Run once on mount`;
const dependReplace = `  }, [isAnalyzing]); // Run after analysis`;
code = code.replace(dependTarget, dependReplace);

const returnTarget = `  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none font-minecraft">
      <div ref={containerRef} className="absolute inset-0 cursor-crosshair" onMouseDown={handleMouseDown} />`;

const returnReplace = `  if (isAnalyzing) {
    return (
      <GraphicsAnalyzer 
        defaultSettings={settings} 
        onComplete={(newSettings) => {
          setSettings(newSettings);
          setIsAnalyzing(false);
        }} 
      />
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none font-minecraft">
      <div ref={containerRef} className="absolute inset-0 cursor-crosshair" onMouseDown={handleMouseDown} />`;

code = code.replace(returnTarget, returnReplace);

fs.writeFileSync('src/components/MinecraftGame.tsx', code);

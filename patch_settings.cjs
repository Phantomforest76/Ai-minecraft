const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const target = `export interface GameSettings {
  renderDistance: number;
  fov: number;
  soundEnabled: boolean;
  masterVolume: number;
  mouseSensitivity: number;
  showF3: boolean;
  timeOfDay: number;
  timeSpeed: number;
}`;

const replace = `export interface GameSettings {
  renderDistance: number;
  fov: number;
  soundEnabled: boolean;
  masterVolume: number;
  mouseSensitivity: number;
  showF3: boolean;
  timeOfDay: number;
  timeSpeed: number;
  shadows?: boolean;
  highQuality?: boolean;
}`;

code = code.replace(target, replace);
fs.writeFileSync('src/types.ts', code);

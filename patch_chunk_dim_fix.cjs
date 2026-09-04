const fs = require('fs');
let code = fs.readFileSync('src/game/chunkManager.ts', 'utf8');
const search = `    this.chunks = targetDim === 'nether' ? this.netherChunks : this.overworldChunks;`;
const replace = `    this.chunks = targetDim === 'overworld' ? this.overworldChunks : (targetDim === 'nether' ? this.netherChunks : this.endChunks);`;
code = code.replace(search, replace);
fs.writeFileSync('src/game/chunkManager.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(/QUARTZ_BLOCK = 37,/, 'QUARTZ_BLOCK = 37,\n  END_STONE = 38,\n  END_PORTAL_FRAME = 39,\n  END_PORTAL = 40,');
code = code.replace(/PORTAL_BUILDER = 129,/, 'PORTAL_BUILDER = 129,\n  END_PORTAL_BUILDER = 130,');
code = code.replace(/ZOMBIE_PIGMAN = 'zombie_pigman',/, "ZOMBIE_PIGMAN = 'zombie_pigman',\n  ENDER_DRAGON = 'ender_dragon',");
code = code.replace(/dimension: 'overworld' | 'nether';/g, "dimension: 'overworld' | 'nether' | 'end';");
code = code.replace(/dimension: 'overworld' | 'nether' | 'end';/g, "dimension: 'overworld' | 'nether' | 'end';"); // Just in case it was already there

fs.writeFileSync('src/types.ts', code);

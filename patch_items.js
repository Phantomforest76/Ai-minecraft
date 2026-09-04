const fs = require('fs');
let code = fs.readFileSync('src/game/items.ts', 'utf8');

const target = `  [ItemType.GOLD_NUGGET]: {
    id: ItemType.GOLD_NUGGET,
    name: 'Gold Nugget',
    isBlock: false,
    color: '#e6c827',
    category: 'materials',
  },`;

const replace = `  [ItemType.GOLD_NUGGET]: {
    id: ItemType.GOLD_NUGGET,
    name: 'Gold Nugget',
    isBlock: false,
    color: '#e6c827',
    category: 'materials',
  },
  [ItemType.PORTAL_BUILDER]: {
    id: ItemType.PORTAL_BUILDER,
    name: 'Auto Nether Portal Builder',
    isBlock: false,
    color: '#9932CC', // Deep Purple
    category: 'tools',
  },`;

code = code.replace(target, replace);
fs.writeFileSync('src/game/items.ts', code);

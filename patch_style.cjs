const fs = require('fs');
let code = fs.readFileSync('src/components/GraphicsAnalyzer.tsx', 'utf8');
code = code.replace(/width: \\\`\\\${Math.min\(100, progress\)}%\\\`/, "width: `${Math.min(100, progress)}%`");
fs.writeFileSync('src/components/GraphicsAnalyzer.tsx', code);

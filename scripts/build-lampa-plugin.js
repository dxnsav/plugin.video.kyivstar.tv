const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'plugin.kyivstar.tv', 'src');
const outFile = path.join(root, 'plugin.kyivstar.tv', 'main.js');

const sources = fs.readdirSync(srcDir)
    .filter((file) => file.endsWith('.js'))
    .sort();

const body = sources.map((file) => {
    const source = fs.readFileSync(path.join(srcDir, file), 'utf8').trimEnd();
    return `    // ${file}\n${source}`;
}).join('\n\n');

const output = `(function () {\n    'use strict';\n\n${body}\n\n    boot();\n})();\n`;

fs.writeFileSync(outFile, output);
console.log(`Built ${path.relative(root, outFile)} from ${sources.length} source files.`);

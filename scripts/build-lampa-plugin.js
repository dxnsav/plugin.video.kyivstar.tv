const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'plugin.kyivstar.tv', 'src');
const outFile = path.join(root, 'plugin.kyivstar.tv', 'main.js');

const sources = [
    'state.js',
    'bootstrap.js',
    'settings-registration.js',
    'lampa-integration.js',
    'native-source.js',
    'search-source.js',
    'settings-menu.js',
    'routes-and-mappers.js',
    'auth-and-playback.js',
    'api-client.js',
    'utils.js'
];

const missing = sources.filter((file) => !fs.existsSync(path.join(srcDir, file)));
if (missing.length) {
    throw new Error(`Missing source files: ${missing.join(', ')}`);
}

const body = sources.map((file) => {
    const source = fs.readFileSync(path.join(srcDir, file), 'utf8').trimEnd();
    return `    // ${file}\n${source}`;
}).join('\n\n');

const output = `(function () {\n    'use strict';\n\n${body}\n\n    boot();\n})();\n`;

fs.writeFileSync(outFile, output);
console.log(`Built ${path.relative(root, outFile)} from ${sources.length} source files.`);

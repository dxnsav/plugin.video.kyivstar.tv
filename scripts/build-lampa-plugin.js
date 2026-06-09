const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'plugin.kyivstar.tv', 'src');
const i18nDir = path.join(root, 'plugin.kyivstar.tv', 'i18n');
const outFile = path.join(root, 'plugin.kyivstar.tv', 'main.js');

const sources = [
    'state.js',
    'i18n.js',
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

const i18n = fs.readdirSync(i18nDir).filter((file) => file.endsWith('.json')).sort().reduce((result, file) => {
    const lang = path.basename(file, '.json');
    result[lang] = JSON.parse(fs.readFileSync(path.join(i18nDir, file), 'utf8'));
    return result;
}, {});

const output = `(function () {\n    'use strict';\n\n    var I18N = ${JSON.stringify(i18n, null, 4).replace(/\n/g, '\n    ')};\n\n${body}\n\n    boot();\n})();\n`;

fs.writeFileSync(outFile, output);
console.log(`Built ${path.relative(root, outFile)} from ${sources.length} source files.`);

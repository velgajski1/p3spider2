// Auto-increment the build version's patch on every build. Wired as the npm `prebuild` /
// `prebuild:prod` hook (so it runs before webpack). Writes version.json at the PROJECT ROOT — NOT under
// src/ — so nodemon/`watch` (which watches src) doesn't see the change and trigger a rebuild loop.
// webpack reads version.json and injects it as __VERSION__ via DefinePlugin (see webpack/config.*.js),
// and src/config/Config.ts exposes it as VERSION.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'version.json');

let version = 'v1.0.0';
try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (parsed && typeof parsed.version === 'string') version = parsed.version;
} catch (e) { /* missing/invalid → seed from the default above */ }

const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(version);
const next = m ? `v${m[1]}.${m[2]}.${Number(m[3]) + 1}` : 'v1.0.0';

fs.writeFileSync(file, JSON.stringify({ version: next }, null, 2) + '\n');
console.log(`[bump-version] ${version} -> ${next}`);

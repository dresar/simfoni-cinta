import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';

const rootDir = path.resolve('scraper-web-wedding');
const manifestPath = path.join(rootDir, 'manifest.json');
const distDir = path.resolve('dist/extension-production');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Read manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, '').trim());
const currentVersion = manifest.version;

// Check if version bump requested
const arg = process.argv[2];
let [major, minor, patch] = currentVersion.split('.').map(Number);

if (arg === 'bump-patch') {
  patch++;
} else if (arg === 'bump-minor') {
  minor++;
  patch = 0;
} else if (arg === 'bump-major') {
  major++;
  minor = 0;
  patch = 0;
}

const newVersion = `${major}.${minor}.${patch}`;
if (newVersion !== currentVersion) {
  manifest.version = newVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`[Version Bump] ${currentVersion} -> ${newVersion}`);
} else {
  console.log(`[Build] Current Version: ${newVersion}`);
}

// Validation checklist
const requiredFiles = [
  'manifest.json',
  'background.js',
  'icons/icon-16.png',
  'icons/icon-48.png',
  'icons/icon-128.png',
  'libs/jszip.min.js',
  'sidepanel/sidepanel.html',
  'sidepanel/sidepanel.css',
  'sidepanel/sidepanel.js'
];

for (const reqFile of requiredFiles) {
  const p = path.join(rootDir, reqFile);
  if (!fs.existsSync(p)) {
    console.error(`[Error] Missing required file: ${p}`);
    process.exit(1);
  }
}
console.log('✅ Validation passed: All mandatory Manifest V3 files present.');

// Package into ZIP using JSZip
const zip = new JSZip();

function addDirectoryToZip(dirPath, zipFolder) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file === 'build.js' || file.endsWith('.log')) continue;
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      addDirectoryToZip(fullPath, zipFolder.folder(file));
    } else {
      const content = fs.readFileSync(fullPath);
      zipFolder.file(file, content);
    }
  }
}

addDirectoryToZip(rootDir, zip);

const zipName = `scraper-web-wedding-v${newVersion}.zip`;
const zipPath = path.join(distDir, zipName);

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
  .then(buffer => {
    fs.writeFileSync(zipPath, buffer);
    console.log(`🎉 [Production Build Complete]`);
    console.log(`- Version: ${newVersion}`);
    console.log(`- Location: ${zipPath}`);
    console.log(`- File Size: ${(buffer.length / 1024).toFixed(2)} KB`);
    console.log(`\nCara install di Google Chrome:`);
    console.log(`1. Buka chrome://extensions/`);
    console.log(`2. Aktifkan toggle "Developer mode" di pojok kanan atas.`);
    console.log(`3. Klik tombol "Load unpacked", lalu pilih folder:`);
    console.log(`   ${rootDir}`);
    console.log(`4. Atau gunakan file ZIP ini: ${zipPath}`);
  })
  .catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
  });
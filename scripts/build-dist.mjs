import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const srcDir = path.join(root, 'src');

async function existsDir(p) {
  try {
    const entries = await readdir(p);
    return Array.isArray(entries);
  } catch {
    return false;
  }
}

if (!(await existsDir(srcDir))) {
  console.error(`Expected src/ directory at: ${srcDir}`);
  process.exit(1);
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await cp(srcDir, path.join(distDir, 'src'), { recursive: true });

// Helpful for running dist directly if desired: `node dist/src/main.js`
await writeFile(
  path.join(distDir, 'README.txt'),
  'This dist/ folder is a build artifact created by copying src/.\n'
);

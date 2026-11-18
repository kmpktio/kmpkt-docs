import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const guideDir = path.join(rootDir, 'guide');
const modulesDir = path.join(rootDir, 'modules');
const examplesDir = path.join(rootDir, 'examples');
const repoUrl = 'https://github.com/kmpktio/kmpkt.git';
const githubBase = 'https://github.com/kmpktio/kmpkt';

function resolveRepoRoot() {
  if (process.env.KMPKT_REPO_DIR) {
    const customDir = path.resolve(rootDir, process.env.KMPKT_REPO_DIR);
    if (!fs.existsSync(customDir)) {
      throw new Error(`KMPKT_REPO_DIR does not exist: ${customDir}`);
    }
    return customDir;
  }

  const siblingRepo = path.resolve(rootDir, '../kmpkt');
  if (fs.existsSync(path.join(siblingRepo, 'docs'))) {
    return siblingRepo;
  }

  const tmpRepo = path.join(rootDir, '.tmp-kmpkt');
  if (!fs.existsSync(tmpRepo)) {
    console.log(`Cloning ${repoUrl} into ${tmpRepo}...`);
    execFileSync('git', ['clone', '--depth', '1', repoUrl, tmpRepo], { stdio: 'inherit' });
  } else {
    execFileSync('git', ['-C', tmpRepo, 'pull', '--ff-only'], { stdio: 'inherit' });
  }
  return tmpRepo;
}

const repoRoot = resolveRepoRoot();
const sourceDocsDir = path.join(repoRoot, 'docs');

const moduleNames = fs
  .readdirSync(repoRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('kmpkt-'))
  .map((entry) => entry.name)
  .filter((name) => fs.existsSync(path.join(repoRoot, name, 'README.md')))
  .sort();

const moduleSet = new Set(moduleNames);

const exampleNames = fs
  .readdirSync(path.join(repoRoot, 'examples'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => fs.existsSync(path.join(repoRoot, 'examples', name, 'README.md')))
  .sort();

const exampleSet = new Set(exampleNames);

const docFiles = new Set(
  fs.readdirSync(sourceDocsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
);

function rewriteRepoLinks(markdown, baseSubdir) {
  return markdown.replace(/\]\((?!https?:\/\/|mailto:|\/|#)([^)\s]+)\)/g, (_, rawRelPath) => {
    const cleanRel = rawRelPath.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');

    if (rawRelPath.startsWith('..')) {
      const moduleMatch = cleanRel.match(/^(kmpkt-[a-z0-9-]+)(?:\/README\.md)?(#.*)?$/);
      if (moduleMatch && moduleSet.has(moduleMatch[1])) {
        return `](/modules/${moduleMatch[1]}${moduleMatch[2] ?? ''})`;
      }
      const exampleMatch = cleanRel.match(/^examples\/([a-z0-9-]+)(?:\/README\.md)?(#.*)?$/);
      if (exampleMatch && exampleSet.has(exampleMatch[1])) {
        return `](/examples/${exampleMatch[1]}${exampleMatch[2] ?? ''})`;
      }
      const isFile = /\.[a-zA-Z0-9]+($|#)/.test(cleanRel);
      const kind = isFile ? 'blob' : 'tree';
      return `](${githubBase}/${kind}/main/${cleanRel})`;
    }

    if (baseSubdir === 'docs' && docFiles.has(cleanRel.split('#')[0])) {
      return `](${cleanRel})`;
    }

    const repoPath = baseSubdir ? `${baseSubdir}/${cleanRel}` : cleanRel;
    const isFile = /\.[a-zA-Z0-9]+($|#)/.test(cleanRel);
    const kind = isFile ? 'blob' : 'tree';
    return `](${githubBase}/${kind}/main/${repoPath})`;
  });
}

fs.rmSync(guideDir, { recursive: true, force: true });
fs.mkdirSync(guideDir, { recursive: true });

for (const entry of fs.readdirSync(sourceDocsDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
  const srcPath = path.join(sourceDocsDir, entry.name);
  const destName = entry.name === 'README.md' ? 'index.md' : entry.name;
  const destPath = path.join(guideDir, destName);
  const content = fs.readFileSync(srcPath, 'utf8');
  fs.writeFileSync(destPath, rewriteRepoLinks(content, 'docs'), 'utf8');
}

fs.rmSync(modulesDir, { recursive: true, force: true });
fs.mkdirSync(modulesDir, { recursive: true });

for (const name of moduleNames) {
  const srcPath = path.join(repoRoot, name, 'README.md');
  const destPath = path.join(modulesDir, `${name}.md`);
  const content = fs.readFileSync(srcPath, 'utf8');
  fs.writeFileSync(destPath, rewriteRepoLinks(content, name), 'utf8');
}

fs.rmSync(examplesDir, { recursive: true, force: true });
fs.mkdirSync(examplesDir, { recursive: true });

for (const name of exampleNames) {
  const srcPath = path.join(repoRoot, 'examples', name, 'README.md');
  const destPath = path.join(examplesDir, `${name}.md`);
  const content = fs.readFileSync(srcPath, 'utf8');
  fs.writeFileSync(destPath, rewriteRepoLinks(content, `examples/${name}`), 'utf8');
}

console.log(`Synced ${moduleNames.length} modules, ${exampleNames.length} examples, and docs from ${repoRoot}`);

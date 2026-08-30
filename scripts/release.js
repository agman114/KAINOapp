const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function run(cmd) {
  console.log(`\n🚀 [RELEASE STEP] Executing: ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

try {
  console.log('=================== AUTOMATED RELEASE & BUILD UPLOADER ===================');

  // 1. Read package.json & bumped patch version
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  const versionParts = pkg.version.split('.').map(Number);
  versionParts[2] += 1;
  const newVersion = versionParts.join('.');
  pkg.version = newVersion;

  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2), 'utf-8');
  console.log(`[RELEASE] Bumped version to v${newVersion}`);

  // 2. Export Expo web bundle
  run('npm run build');

  // 3. Package Electron Windows standalone executable
  run('npx electron-builder --win --dir');

  // 4. Git commit & push
  run('git add .');
  run(`git commit -m "Release v${newVersion} - automated build upload"`);
  run('git push origin main');

  // 5. Create git tag & push tag
  run(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
  run(`git push origin v${newVersion}`);

  console.log(`\n=================== SUCCESS: RELEASE v${newVersion} PUBLISHED! ===================`);
  console.log(`Users will now see "✨ Доступна версія v${newVersion}! [ ⚡ Оновити в 1 клік ]" in their apps!\n`);
} catch (err) {
  console.error('[RELEASE ERROR]:', err.message || err);
  process.exit(1);
}

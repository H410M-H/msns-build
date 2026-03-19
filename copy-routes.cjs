const fs = require('fs');
const path = require('path');

const dirs = ['attendance', 'exams', 'revenue', 'sessions', 'users'];
const targets = ['clerk', 'principal', 'head'];
const sourceBase = path.join(__dirname, 'src', 'app', '(dashboard)', 'admin');
const targetBase = path.join(__dirname, 'src', 'app', '(dashboard)');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function replaceInFiles(dir, searchValue, replaceValue) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      replaceInFiles(fullPath, searchValue, replaceValue);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(searchValue)) {
        const newContent = content.split(searchValue).join(replaceValue);
        fs.writeFileSync(fullPath, newContent, 'utf8');
      }
    }
  }
}

for (const target of targets) {
  for (const dir of dirs) {
    const src = path.join(sourceBase, dir);
    const dest = path.join(targetBase, target, dir);

    if (fs.existsSync(src)) {
      copyDirectory(src, dest);
      console.log(`Copied ${dir} to ${target}`);
      replaceInFiles(dest, '/admin', `/${target}`);
      console.log(`Replaced /admin with /${target} in ${target}/${dir}`);
    }
  }
}

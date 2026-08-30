const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf-8');
  content = content.replace(/src="\/_expo/g, 'src="./_expo');
  fs.writeFileSync(indexPath, content, 'utf-8');
  console.log('[BUILD FIX SUCCESS] Successfully converted dist/index.html script tags to relative paths ("./_expo")!');
} else {
  console.error('[BUILD FIX ERROR] dist/index.html not found!');
}

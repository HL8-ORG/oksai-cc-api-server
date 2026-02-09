const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取当前包的 dist 目录
const packageDir = process.cwd();
const distDir = path.join(packageDir, 'dist');
const buildinfoFile = path.join(distDir, 'tsconfig.lib.tsbuildinfo');

// 删除旧的 buildinfo 文件
try {
  if (fs.existsSync(buildinfoFile)) {
    fs.unlinkSync(buildinfoFile);
    console.log(`Removed: ${buildinfoFile}`);
  }
} catch (error) {
  // 忽略删除错误
}

console.log('Done!');

const fs = require('fs');
const path = require('path');

const srcBaseDir = path.join(__dirname, 'gls4s.05.2015.04.18');
const destBaseDir = __dirname;

/**
 * @param {string} filePath
 * @param {boolean} comment
 * @returns {string}
 */
function createCInclude(filePath, comment) {
  return `${comment ? '//' : ''}#include "${filePath}"`;
}

/**
 * @param {string} filePath
 * @param {boolean} comment
 * @returns {string}
 */
function createMasmInclude(filePath, comment) {
  return `${comment ? ';' : ''}INCLUDE ${filePath}`;
}

const extensionMap = new Map([
  ['.h', createCInclude],
  ['.ch', createCInclude],
  ['.inc', createMasmInclude],
]);

const includes = [
  // EntisGLS4 for Windows with OpenGL
  {
    name: 'include_wo',
    paths: [
      // 先に書いたものの方が優先度が高い
      'EntisGLS4s.05/Include/opengl',
      'EntisGLS4s.05/Include/win32',
      'EntisGLS4s.05/Include/common',
    ],
  },
  // EntisGLS4 for Windows with OpenGL + EntisGLS3
  {
    name: 'include_woe',
    paths: [
      // 先に書いたものの方が優先度が高い
      'EntisGLS3/ESL/Include',
      'EntisGLS3/EGL/Include',
      'EntisGLS3/EGL/common',
      'EntisGLS3/erisalib/Include',
      'EntisGLS3/GLS3/Include',
      //
      'EntisGLS4s.05/Include/entisgls',
      'EntisGLS4s.05/Include/opengl',
      'EntisGLS4s.05/Include/win32',
      'EntisGLS4s.05/Include/common',
    ],
  },
];

/**
 * @param {string} dirPath
 * @returns {string[]}
 */
async function readdirRecursive(dirPath) {
  const entries = await fs.promises.readdir(dirPath, {
    withFileTypes: true,
  });
  const dirEntries = entries.filter(entry => entry.isDirectory());
  const fileEntries = entries.filter(entry => entry.isFile());
  return [
    dirPath,
    ...fileEntries.map(entry => path.join(dirPath, entry.name)),
    ...(await Promise.all(dirEntries.map(entry => readdirRecursive(path.join(dirPath, entry.name))))).flat(),
  ];
}

(async function main() {
  for (const include of includes) {
    /** @type {Map<string, stirng[]>} */
    const map = new Map();
    const createdDirectorySet = new Set();
    for (const srcPath of include.paths) {
      const destDirPath = path.join(destBaseDir, include.name);
      const srcDirPath = path.join(srcBaseDir, srcPath);
      for (const filePath of await readdirRecursive(srcDirPath)) {
        if (!extensionMap.has(path.extname(filePath))) {
          continue;
        }
        const destPath = path.join(destDirPath, path.relative(srcDirPath, filePath));
        const refPath = path.relative(path.dirname(destPath), filePath);
        if (!map.has(destPath)) {
          map.set(destPath, []);
        }
        map.get(destPath).push(refPath);
      }
    }
    //
    /** @type {Promise<void>[]} */
    const promises = [];
    for (const [destPath, refPaths] of map.entries()) {
      const createInclude = extensionMap.get(path.extname(destPath));
      const destDirPath = path.dirname(destPath);
      if (!createdDirectorySet.has(destDirPath)) {
        await fs.promises.mkdir(destDirPath, {
          recursive: true,
        });
        createdDirectorySet.add(destDirPath);
      }
      const content = refPaths.map((refPath, index) => createInclude(refPath.replace(/\\/g, '/'), index !== 0)).join('\n') + '\n';
      promises.push(fs.promises.writeFile(destPath, content, 'utf-8'));
    }
    await Promise.all(promises);
  }
})();

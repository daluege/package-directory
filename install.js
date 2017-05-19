const findupSync = require('findup-sync')
const fs = require('fs')
const execSync = require('child_process').execSync
const spawnSync = require('child_process').spawnSync
const path = require('path')

let modulePath = path.dirname(__dirname)
let filename = findupSync('package.json', {cwd: modulePath})

if (filename == null) {
  console.warn('package.json not found\n')

  throw process.exit(0)
}

let dirname = path.dirname(filename)
let config = require(filename)

if (fs.realpathSync(modulePath).indexOf(fs.realpathSync(dirname) + path.sep) === -1) {
  console.warn('Module must be installed in a local package context\n')

  throw process.exit(0)
}

if (!config.hasOwnProperty('directory')) {
  console.warn('No directory property found in ' + filename + '\n')

  throw process.exit(0)
}

let directory = path.resolve(dirname, config.directory)

// Examine existing module folder
try {
  let moduleStat = fs.lstatSync(modulePath)

  // Symbolic link exists
  if (moduleStat.isSymbolicLink()) {
    throw process.exit(0)
  }

  // Module already equals the target directory
  if (fs.realpathSync(modulePath) === fs.realpathSync(directory)) {
    throw process.exit(0)
  }
} catch (e) { }

// Create missing intermediate pathname components
if (spawnSync('mkdir', ['-p', path.dirname(directory)], {stdio: 'inherit'}).status) {
  throw process.exit(1)
}

// Move module folder to custom directory
if (spawnSync('mv', [modulePath, directory], {stdio: 'inherit'}).status) {
  throw process.exit(1)
}

// Specify an absolute or relative symbolic link target depending on the original property
let target = path.isAbsolute(config.directory) ? fs.realpathSync(directory) : path.relative(path.dirname(modulePath), directory)

// Link module folder to custom directory
if (spawnSync('ln', ['-s', target, modulePath], {stdio: 'inherit'}).status) {
  // Undo `mv` on error
  spawnSync('mv', [directory, modulePath])

  throw process.exit(1)
}

const findupSync = require('findup-sync')
const fs = require('fs')
const execSync = require('child_process').execSync
const spawnSync = require('child_process').spawnSync
const path = require('path')

let modulePath = path.dirname(__dirname)
let filename = findupSync('package.json', {cwd: modulePath})
let dirname = path.dirname(filename)
let pkg = require(filename)

if (!pkg.hasOwnProperty('directory')) {
  process.stderr.write('No directory property found in ' + filename + '\n')
  throw process.exit(1)
}

let directory = path.resolve(dirname, pkg.directory)

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

// Link module folder to custom directory
if (spawnSync('ln', ['-s', path.relative(path.dirname(modulePath), directory), modulePath], {stdio: 'inherit'}).status) {
  // Undo `mv` on error
  spawnSync('mv', [directory, modulePath])

  throw process.exit(1)
}

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

  if (moduleStat.isSymbolicLink()) {
    // Symbolic link exists
    throw process.exit(0)
  }

  if (fs.realpathSync(modulePath) === fs.realpathSync(directory)) {
    // Module already equals the target directory
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

// Move link module folder to custom directory
if (spawnSync('ln', ['-s', path.relative(dirname, directory), modulePath], {stdio: 'inherit'}).status) {
  // Undo `mv`
  spawnSync('mv', [directory, modulePath])

  throw process.exit(1)
}

const fs = require('fs/promises')
const { spawn } = require('child_process')
const path = require('path')
const chalk = require('chalk')
const chokidar = require('chokidar')
const _ = require('lodash')

class BuildWatcher {
  constructor(transpiler) {
    this.isWatcherReady = false
    this.isAppStarted = false
    this.app = null
    this.transpiler = transpiler
    this.fsWatcher = null
  }

  getBuildFilePath(sourceFilePath) {
    const buildFileName = path.basename(sourceFilePath, '.ts') + '.js'
    const buildFileFolder = path.dirname(sourceFilePath).replace('src', 'dist')
    return path.join(buildFileFolder, buildFileName)
  }

  async removeFile(sourceFilePath) {
    const buildFilePath = this.getBuildFilePath(sourceFilePath)
    await fs.unlink(buildFilePath)
    await fs.unlink(buildFilePath + '.map')
  }

  async removeFolder(sourceFolderPath) {
    const buildFolderPath = sourceFolderPath.replace('src', 'dist')
    await fs.rmdir(buildFolderPath, { recursive: true })
  }

  async start() {
    console.log(chalk.red('RM\t'), 'dist')
    await this.removeFolder('dist')

    const debouncedStartApp = _.debounce(() => this.startApp())

    this.fsWatcher = chokidar
      .watch('src/**', {
        ignored: new RegExp('[-.]spec.ts'),
        usePolling: true,
        cwd: './',
      })
      .on('add', async fileName => {
        if (path.extname(fileName) !== '.ts') {
          return
        }
        console.log(chalk.green('ADD\t'), fileName)
        const buildFilePath = this.getBuildFilePath(fileName)
        await this.transpiler(fileName, buildFilePath)
        debouncedStartApp()
      })
      .on('change', async fileName => {
        if (path.extname(fileName) !== '.ts') {
          return
        }
        console.log(chalk.yellow('CHANGE\t'), fileName)
        const buildFilePath = this.getBuildFilePath(fileName)
        await this.transpiler(fileName, buildFilePath)
        debouncedStartApp()
      })
      .on('unlink', async fileName => {
        if (path.extname(fileName) !== '.ts') {
          return
        }
        console.log(chalk.red('RM\t'), fileName)
        await this.removeFile(fileName)
        debouncedStartApp()
      })
      .on('unlinkDir', async path => {
        console.log(chalk.red('RMDIR\t'), path)
        await this.removeFolder(path)
      })
      .on('ready', () => {
        console.log(chalk.blue('READY\t'), 'file watcher')
        this.isWatcherReady = true
      })
  }

  async startApp() {
    if (!this.isWatcherReady) {
      return
    }
    if (this.isAppStarted) {
      console.log(chalk.blue('RESTART\t'), 'application')
      await this.killApp()
    } else {
      this.isAppStarted = true
      console.log(chalk.blue('START\t'), 'application')
    }

    this.app = spawn('node', [
      '-r',
      'source-map-support/register',
      'dist/main.js',
    ])

    this.app.stdout.pipe(process.stdout)
    this.app.stderr.pipe(process.stderr)

    this.app.on('exit', (_, signal) => {
      console.log(
        chalk.red('STOP\t'),
        `Application process exited with signal ${signal}`,
      )
    })
  }

  killApp() {
    return new Promise(resolve => {
      this.app.once('exit', () => resolve())
      this.app.kill('SIGINT')
    })
  }
}

module.exports = { BuildWatcher }

const { BuildWatcher } = require('./build-watcher')
const { swcTranspiler } = require('./swc.transpiler')

new BuildWatcher(swcTranspiler).start()

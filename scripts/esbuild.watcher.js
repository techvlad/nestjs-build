const { BuildWatcher } = require('./build-watcher')
const { esbuildTranspiler } = require('./esbuild.transpiler')

new BuildWatcher(esbuildTranspiler).start()

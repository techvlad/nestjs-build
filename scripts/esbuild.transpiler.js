const { build } = require('esbuild')
const { esbuildDecorators } = require('@anatine/esbuild-decorators')

async function esbuildTranspiler(sourceFilePath, buildFilePath) {
  const tsconfig = './tsconfig.json'

  await build({
    platform: 'node',
    target: 'node14',
    bundle: false,
    sourcemap: false,
    plugins: [await esbuildDecorators({ tsconfig })],
    entryPoints: [sourceFilePath],
    outfile: buildFilePath,
    format: 'cjs',
    tsconfig,
  })
}

module.exports = { esbuildTranspiler }

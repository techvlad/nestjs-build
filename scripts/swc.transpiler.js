const { dirname } = require('path')
const { writeFile, mkdir } = require('fs/promises')
const swc = require('@swc/core')

async function swcTranspiler(sourceFilePath, buildFilePath) {
  const { code, map } = await swc.transformFile(sourceFilePath, {
    sourceMaps: false,
    module: {
      type: 'commonjs',
      strict: true,
    },
    jsc: {
      target: 'es2019',
      parser: {
        syntax: 'typescript',
        decorators: true,
      },
      transform: {
        legacyDecorator: true,
        decoratorMetadata: true,
      },
      keepClassNames: true,
    },
  })

  await mkdir(dirname(buildFilePath), { recursive: true })
  await writeFile(buildFilePath, code)
  if (map) {
    await writeFile(buildFilePath + '.map', map)
  }
}

module.exports = { swcTranspiler }

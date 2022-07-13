import { esbuildDecorators } from '@anatine/esbuild-decorators'
import type { Options } from 'tsup'

export const tsup: Options = {
  esbuildPlugins: [esbuildDecorators()],
  entryPoints: ['src/index.ts'],
  splitting: false,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
}

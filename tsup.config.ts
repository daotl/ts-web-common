import { esbuildDecorators } from '@anatine/esbuild-decorators'
import type { Options } from 'tsup'

export const tsup: Options = {
  esbuildPlugins: [esbuildDecorators()],
  // entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
}

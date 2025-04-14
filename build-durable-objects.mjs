import * as esbuild from 'esbuild'

const result = await esbuild.build({
  entryPoints: ['src/durable-objects/index.ts'],
  outdir: '.durable-objects',
  format: 'esm',
  bundle: true,
  external: ['cloudflare:workers'],
})

console.log(result)

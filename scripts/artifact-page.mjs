// Turns a Vite build into a page body for a hosted preview: the host supplies
// <html>/<head>/<body>, so keep only the title, styles, root node and script.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2] || 'dist-artifact'
const html = readFileSync(join(dir, 'index.html'), 'utf8')
const pick = (re) => [...html.matchAll(re)].map((m) => m[0].replace(/\s+crossorigin/g, ''))
const parts = [
  '<title>Velora Time</title>',
  ...pick(/<meta name="description"[^>]*>/g),
  ...pick(/<link rel="stylesheet"[^>]*>/g),
  ...pick(/<link rel="modulepreload"[^>]*>/g),
  '<div id="root"></div>',
  ...pick(/<script type="module"[^>]*><\/script>/g),
]
writeFileSync(join(dir, 'index.html'), parts.join('\n') + '\n')
console.log(parts.join('\n'))

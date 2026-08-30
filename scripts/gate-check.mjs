#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const content = readFileSync('GATES.md', 'utf-8')
const totalMatches = content.match(/- \[[ x]\] G\d+:/g) || []
const checkedMatches = content.match(/- \[x\] G\d+:/g) || []

console.log(`Gates: ${checkedMatches.length} / ${totalMatches.length} completed`)
if (process.argv.includes('--status')) {
  console.log(content)
}

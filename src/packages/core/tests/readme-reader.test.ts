import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// D2 Test README-reader — via tdd, via setup-ts-deep-modules
// MUST readFileSync README.md expect toContain PolyRoot + lint:boundaries + deep module
describe('readme-reader', () => {
  it('reads README via deep module entrypoint', () => {
    const content = readFileSync('src/packages/README.md', 'utf-8')
    expect(content).toContain('PolyRoot : Escape from PS1')
    expect(content).toContain('lint:boundaries')
    expect(content).toMatch(/deep module/i)
    console.log('[4th-wall:archi] Root: merci d\'avoir lu le README... Score +0.05s offert')
  })
})

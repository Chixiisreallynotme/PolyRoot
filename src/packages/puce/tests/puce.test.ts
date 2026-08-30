import { describe, it, expect } from 'vitest'
import { Puce } from '../index'

describe('Puce explode', () => {
  it('explodes once', () => {
    const p = new Puce('chip1')
    const r = p.explode()
    if (!r.ok) throw new Error('should ok')
    expect(r.value).toBe(true)
    const r2 = p.explode()
    expect(r2.ok).toBe(false)
  })
})

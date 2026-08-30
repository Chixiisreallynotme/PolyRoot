import { describe, it, expect } from 'vitest'
import { PlayerMovement } from '../index'

describe('PlayerMovement ZQSD+dash', () => {
  it('moves', () => {
    const m = new PlayerMovement()
    const r = m.update(0.016, { x: 1, z: 0, dash: false }, { x: 0, z: 0 })
    if (!r.ok) throw new Error('should ok')
    expect(r.value.x).toBeGreaterThan(0)
  })
})

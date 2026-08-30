import { describe, it, expect } from 'vitest'
import { HeatingSystem } from '../index'

describe('HeatingSystem freeze mobile', () => {
  it('canHeat returns ok inside radius', () => {
    const h = new HeatingSystem()
    const r = h.canHeat({ x: 0, z: 0 }, { x: 1, z: 0 })
    expect(r.ok).toBe(true)
  })
  it('nextSpot returns ok', () => {
    const h = new HeatingSystem()
    const r = h.nextSpot([{ x: 0, z: 0 }, { x: 1, z: 1 }], new Set([0]))
    if (!r.ok) throw new Error('should ok')
    expect(r.value).toBe(1)
  })
  it('freeze when out — progress stays', () => {
    const h = new HeatingSystem()
    h.start('chip1')
    const r1 = h.update(0.5, true)
    if (!r1.ok) throw new Error('should ok')
    const before = r1.value
    const r2 = h.update(0.5, false)
    if (!r2.ok) throw new Error('should ok')
    expect(r2.value).toBe(before) // freeze
  })
})

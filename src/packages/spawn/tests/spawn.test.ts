import { describe, it, expect } from 'vitest'
import { SpawnSystem, seededShuffle } from '../index'

describe('SpawnSystem seededShuffle 8/20 sans overlap', () => {
  it('picks 8 without overlap', () => {
    const sys = new SpawnSystem()
    const spots = Array.from({ length: 20 }, (_, i) => ({ x: i, z: 0 }))
    const r = sys.pickSpots(spots, 8, 42)
    if (!r.ok) throw new Error('should ok')
    expect(r.value.length).toBe(8)
    expect(new Set(r.value.map((s) => s.x)).size).toBe(8)
  })
  it('seededShuffle deterministic', () => {
    const a = seededShuffle([1, 2, 3, 4, 5], 123)
    const b = seededShuffle([1, 2, 3, 4, 5], 123)
    expect(a).toEqual(b)
  })
})

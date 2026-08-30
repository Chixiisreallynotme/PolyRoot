import { describe, it, expect } from 'vitest'
import { SpatialGrid } from '../index'

describe('SpatialGrid 8x8 277k→68', () => {
  it('insert and query', () => {
    const g = new SpatialGrid()
    g.insert(1, 5, 5)
    const r = g.query(5, 5, 2)
    if (!r.ok) throw new Error('should ok')
    expect(r.value).toContain(1)
  })
})

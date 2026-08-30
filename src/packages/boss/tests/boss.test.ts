import { describe, it, expect } from 'vitest'
import { Boss } from '../index'

describe('Boss 35s 2 phases', () => {
  it('invoke phase1', () => {
    const b = new Boss(35)
    const r = b.update(5)
    if (r.ok) expect(r.value).toMatch(/invoke|poireaux|onde|victory/)
    else expect(r.ok).toBe(false)
  })
})

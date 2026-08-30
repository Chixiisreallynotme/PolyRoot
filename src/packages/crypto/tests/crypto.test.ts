import { describe, it, expect } from 'vitest'
import { CryptoAI } from '../index'

describe('CryptoAI data-driven enemies.json', () => {
  it('tank pushes', () => {
    const ai = new CryptoAI()
    const r = ai.decide({ hp: 3, speed: 1.2, behavior: 'tank' }, 5)
    if (!r.ok) throw new Error('should ok')
    expect(r.value).toBe('push straight')
  })
})

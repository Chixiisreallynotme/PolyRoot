import { describe, it, expect } from 'vitest'
import { Example } from '../index'

describe('Example deep module template', () => {
  it('hello', () => {
    const e = new Example()
    expect(e.hello()).toContain('PolyRoot')
  })
})

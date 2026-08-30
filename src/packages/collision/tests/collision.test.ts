import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { SpatialGrid } from '../index'
import { Motherboard } from '../../../entities/Motherboard'

describe('SpatialGrid 8x8 277k→68', () => {
  it('insert and query', () => {
    const g = new SpatialGrid()
    g.insert(1, 5, 5)
    const r = g.query(5, 5, 2)
    if (!r.ok) throw new Error('should ok')
    expect(r.value).toContain(1)
  })
})

describe('Motherboard PS1 PU-8 Hardware & Collision System', () => {
  const scene = new THREE.Scene()
  const mb = new Motherboard(scene, 48, 36)

  it('registers enriched hardware colliders (BIOS, Audio DAC, Oscillators, Standoffs, CPU, GPU)', () => {
    const names = mb.colliders.map((c) => c.name)
    expect(names).toContain('BIOS_ROM_IC102')
    expect(names).toContain('Audio_DAC_AK4309AVM')
    expect(names).toContain('Oscillator_X101')
    expect(names).toContain('Oscillator_X102')
    expect(names).toContain('Brass_Standoff')
    expect(names).toContain('CPU_CXD8530BQ')
    expect(names).toContain('GPU_CXD8514Q')
    expect(names).toContain('SPU_CXD2922Q')
    expect(names).toContain('Rear_Shield_Housing')
  })

  it('computes support height correctly on PCB substrate and chassis floor', () => {
    // Open PCB area with no component: support height should be 0.0
    const pcbHeight = mb.getSupportHeight(24, 4, 0.45)
    expect(pcbHeight).toBe(0.0)

    // Outer console chassis floor: support height should be -0.72
    const chassisHeight = mb.getSupportHeight(-5, -5, 0.45)
    expect(chassisHeight).toBe(-0.72)
  })

  it('computes support height when standing on top of components (Player & Enemies)', () => {
    // CPU position: (36, 21), height: 0.8
    const cpuHeight = mb.getSupportHeight(36, 21, 0.45)
    expect(cpuHeight).toBeCloseTo(0.8, 1)

    // BIOS ROM position: (36, 11.2), height: 0.7
    const biosHeight = mb.getSupportHeight(36, 11.2, 0.45)
    expect(biosHeight).toBeCloseTo(0.7, 1)

    // Audio DAC position: (17.5, 7.2), height: 0.5
    const dacHeight = mb.getSupportHeight(17.5, 7.2, 0.45)
    expect(dacHeight).toBeCloseTo(0.5, 1)
  })

  it('blocks entities from walking into components when below top height', () => {
    // Entity walking into CPU side at ground level Y = 0
    const col = mb.checkCollision(36, 21, 0.55, 0)
    expect(col.collided).toBe(true)
    expect(Math.abs(col.pushX) + Math.abs(col.pushZ)).toBeGreaterThan(0)
  })

  it('allows free passage when entity is on top of or jumping above component', () => {
    // Entity above CPU top height (height = 0.8, entityY = 0.85)
    const col = mb.checkCollision(36, 21, 0.55, 0.85)
    expect(col.collided).toBe(false)
    expect(col.pushX).toBe(0)
    expect(col.pushZ).toBe(0)
  })
})

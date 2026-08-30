import { describe, it, expect } from 'vitest'
import { CyberLeekRig } from '../../../render/CyberLeekRig'

describe('CyberLeekRig Procedural Animation Suite', () => {
  it('creates complete model with all required joints and materials', () => {
    const { group, nodes } = CyberLeekRig.createModel()
    expect(group).toBeDefined()
    expect(nodes.root).toBeDefined()
    expect(nodes.body).toBeDefined()
    expect(nodes.head).toBeDefined()
    expect(nodes.leaves.length).toBe(3)
    expect(nodes.leftArm).toBeDefined()
    expect(nodes.rightArm).toBeDefined()
    expect(nodes.leftFist).toBeDefined()
    expect(nodes.rightFist).toBeDefined()
    expect(nodes.leftLeg).toBeDefined()
    expect(nodes.rightLeg).toBeDefined()
    expect(nodes.leftBoot).toBeDefined()
    expect(nodes.rightBoot).toBeDefined()
  })

  it('updates idle breathing and foliage wind waves', () => {
    const { nodes } = CyberLeekRig.createModel()
    const rig = new CyberLeekRig(nodes)

    const leaf0 = nodes.leaves[0]
    expect(leaf0).toBeDefined()
    const initialLeaf0X = leaf0 ? leaf0.rotation.x : 0

    rig.update(0.1, false, 0)
    expect(rig.getAnimationState()).toBe('idle')

    rig.update(0.5, false, 0)
    if (leaf0) {
      expect(leaf0.rotation.x).not.toBe(initialLeaf0X)
    }
  })

  it('updates heavy tactical march and sprint kinematics', () => {
    const { nodes } = CyberLeekRig.createModel()
    const rig = new CyberLeekRig(nodes)

    rig.update(0.1, true, 3.2)
    expect(rig.getAnimationState()).toBe('march')
    expect(nodes.leftLeg.rotation.x).not.toBe(0)

    rig.update(0.1, true, 6.5)
    expect(rig.getAnimationState()).toBe('sprint')
  })

  it('executes 4-phase Dual-Fist Leap Slam animation with shockwave trigger', () => {
    const { nodes } = CyberLeekRig.createModel()
    const rig = new CyberLeekRig(nodes)

    let impactCalled = false
    rig.triggerLeapSlam(1.0, () => {
      impactCalled = true
    })

    expect(rig.getAnimationState()).toBe('leap_crouch')
    expect(rig.isBusy()).toBe(true)

    rig.update(0.3, false, 0)
    expect(rig.getAnimationState()).toBe('leap_airborne')

    rig.update(0.6, false, 0)
    expect(impactCalled).toBe(true)
    expect(rig.getAnimationState()).toBe('leap_slam')

    rig.update(0.2, false, 0)
    expect(rig.getAnimationState()).toBe('idle')
    expect(rig.isBusy()).toBe(false)
  })

  it('executes Disc Windup & Explosive Fling Throw animation with release callback', () => {
    const { nodes } = CyberLeekRig.createModel()
    const rig = new CyberLeekRig(nodes)

    let released = false
    rig.triggerDiscThrow(0.6, () => {
      released = true
    })

    expect(rig.getAnimationState()).toBe('disc_windup')
    expect(rig.isBusy()).toBe(true)

    rig.update(0.3, false, 0)
    expect(rig.getAnimationState()).toBe('disc_throw')

    rig.update(0.2, false, 0)
    expect(released).toBe(true)

    rig.update(0.2, false, 0)
    expect(rig.getAnimationState()).toBe('idle')
    expect(rig.isBusy()).toBe(false)
  })

  it('generates procedural 3D Sawtooth geometry correctly', () => {
    const geo = CyberLeekRig.createSawtoothGeometry(0.75, 0.70, 0.42, 10)
    expect(geo).toBeDefined()
    const pos = geo.attributes.position
    expect(pos).toBeDefined()
    if (pos) {
      expect(pos.count).toBeGreaterThan(0)
    }
    expect(geo.attributes.normal).toBeDefined()
  })
})

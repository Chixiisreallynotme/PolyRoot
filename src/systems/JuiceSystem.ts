import * as THREE from 'three'
import { gsap } from 'gsap'
import type { CameraShake } from './CameraShake'
import type { ParticleSystem } from './ParticleSystem'
import type { SFX } from '../audio/SFX'

// via game-feel: trauma 0.15/0.4/0.8 decay1.2 max_offset 12/8 hitstop 40/120/150 squash BACK
// via camera-systems: trauma² deadzone0.8 max_roll 0.05-0.12 revert LateUpdate
// via gsap-core: gsap.to squash 1.3/0.7→1 0.18s BACK + killTweensOf + timeline vacuum
// via particles-lifecycle: Pool 200

export type JuiceTier = 'light' | 'medium' | 'heavy' | 'special'

export interface JuiceBundle {
  tier: JuiceTier
  hitStop: number
  trauma: number
  shakePx: number
  particles: number
  squash: [number, number]
  duration: number
}

// game-feel: trauma 0.4 heavy 120ms — Bundles Juice frame-synced (NEVER >120ms en horde)
const BUNDLES: Record<JuiceTier, JuiceBundle> = {
  light: { tier: 'light', hitStop: 0, trauma: 0, shakePx: 0, particles: 0, squash: [1.1, 0.9], duration: 0.08 },
  medium: { tier: 'medium', hitStop: 40, trauma: 0.15, shakePx: 2, particles: 4, squash: [1.2, 0.8], duration: 0.12 },
  heavy: { tier: 'heavy', hitStop: 120, trauma: 0.4, shakePx: 8, particles: 20, squash: [1.3, 0.7], duration: 0.18 },
  special: { tier: 'special', hitStop: 150, trauma: 0.8, shakePx: 12, particles: 40, squash: [1.3, 0.7], duration: 0.25 },
}

export class JuiceSystem {
  constructor(
    private cameraShake: CameraShake | null = null,
    private particles: ParticleSystem | null = null,
    private sfx: SFX | null = null
  ) {}

  // Juice.trigger(tier,pos) — frame-synced SFX+flash+shake+squash même frame que logique
  trigger(tier: JuiceTier, pos: { x: number; y: number; z: number }, target?: THREE.Object3D): void {
    const b = BUNDLES[tier]
    // HitStop — NEVER >120ms en horde, NEVER trauma sans deadzone
    if (b.hitStop > 0) {
      // hitStop 40 medium /120 heavy /150 special ONLY boom puce/dash/boss
      const start = performance.now()
      while (performance.now() - start < b.hitStop) {
        // busy-wait for true frame freeze (will be replaced by ticker pause in real loop)
      }
    }

    if (b.trauma > 0) {
      // game-feel: trauma 0.15/0.4/0.8 decay1.2
      this.cameraShake?.addTrauma(b.trauma)
    }

    if (b.particles > 0) {
      this.particles?.burst(pos, b.particles)
    }

    if (this.sfx) {
      // audio-design play_varied() + Howl pool:5
      if (tier === 'light') this.sfx.playVaried('tick')
      else if (tier === 'medium') this.sfx.playVaried('thud')
      else if (tier === 'heavy') this.sfx.playVaried('boom')
      else this.sfx.playVaried('fanfare')
    }

    if (target) {
      // gsap-performance pattern 0 alloc — MUST gsap.to squash 1.3/0.7→1 0.18s BACK
      gsap.killTweensOf(target.scale)
      gsap.to(target.scale, {
        x: b.squash[0],
        y: b.squash[1],
        z: b.squash[0],
        duration: b.duration * 0.5,
        ease: 'back.out(1.7)',
        onComplete: () => {
          gsap.to(target.scale, { x: 1, y: 1, z: 1, duration: b.duration * 0.5, ease: 'power2.out' })
        },
      })
      // flash emissive 80ms / white 150ms
      const mesh = target as unknown as { material?: { emissive?: THREE.Color; emissiveIntensity?: number } }
      if (mesh.material?.emissive) {
        const orig = mesh.material.emissive.clone()
        mesh.material.emissive.set(0xffffff)
        setTimeout(() => mesh.material!.emissive!.copy(orig), tier === 'light' ? 80 : 150)
      }
    }

    console.log(`[juice] ${tier} hitStop ${b.hitStop} trauma ${b.trauma} shake ${b.shakePx}px particles ${b.particles}`)
  }

  // For vacuum gems — gsap.timeline stagger
  vacuumGems(gems: THREE.Object3D[], targetPos: THREE.Vector3): void {
    const tl = gsap.timeline()
    gems.forEach((g, i) => {
      tl.to(
        g.position,
        { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 0.4, ease: 'power2.in', delay: i * 0.02 },
        0
      )
    })
  }
}

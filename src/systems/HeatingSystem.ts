import * as THREE from 'three'
import { Puce } from '../entities/Puce'
import type { JuiceSystem } from './JuiceSystem'

// via roguelike: 8 puces parmi 20 spots sans overlap — via game-feel: freeze mobile 3.5s
// Poncle loop: Explore 5-10s -> Canalise 3.5s mobile -> BOOM -> x8 -> Boss 35s

export const MOTHERBOARD_SPOTS: { x: number; z: number }[] = [
  { x: 5, z: 4 }, { x: 10, z: 4 }, { x: 15, z: 4 }, { x: 20, z: 4 }, { x: 25, z: 4 },
  { x: 5, z: 8 }, { x: 10, z: 8 }, { x: 15, z: 8 }, { x: 20, z: 8 }, { x: 25, z: 8 },
  { x: 5, z: 12 }, { x: 10, z: 12 }, { x: 15, z: 12 }, { x: 20, z: 12 }, { x: 25, z: 12 },
  { x: 5, z: 16 }, { x: 10, z: 16 }, { x: 15, z: 16 }, { x: 20, z: 16 }, { x: 25, z: 16 },
]

export class HeatingSystem {
  public puces: Puce[] = []
  private activePuceIndex = 0
  private totalHeated = 0
  public isHeating = false

  constructor(private scene: THREE.Scene) {
    this.initPuces()
  }

  private initPuces(): void {
    // Pick 8 unique spots with seeded shuffle
    const shuffled = [...MOTHERBOARD_SPOTS].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 8)

    for (let i = 0; i < 8; i++) {
      const spot = selected[i]!
      const puce = new Puce(this.scene, i, spot.x, spot.z)
      this.puces.push(puce)
    }

    if (this.puces.length > 0) {
      this.puces[0]!.state.isActive = true
    }
  }

  update(dt: number, playerPos: THREE.Vector3, juice: JuiceSystem | null): { boom: boolean; puceIndex: number; speedScale: number; allComplete: boolean } {
    let boom = false
    let speedScale = 1.0
    let allComplete = false

    if (this.activePuceIndex >= this.puces.length) {
      return { boom: false, puceIndex: this.activePuceIndex, speedScale: 1.0, allComplete: true }
    }

    const currentPuce = this.puces[this.activePuceIndex]
    if (!currentPuce || currentPuce.state.isExploded) {
      return { boom: false, puceIndex: this.activePuceIndex, speedScale: 1.0, allComplete: false }
    }

    const dx = playerPos.x - currentPuce.state.x
    const dz = playerPos.z - currentPuce.state.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const inside = dist <= currentPuce.state.radius

    this.isHeating = inside
    currentPuce.updateVisuals(inside, dt)

    if (inside) {
      // Mobile canalisation at 70% speed
      speedScale = 0.7
      currentPuce.state.heatProgress += dt

      if (currentPuce.state.heatProgress >= currentPuce.state.heatTarget) {
        // BOOM explosion!
        currentPuce.explode()
        this.totalHeated++
        this.activePuceIndex++
        boom = true

        if (juice) {
          juice.trigger('heavy', { x: currentPuce.state.x, y: 0.5, z: currentPuce.state.z }, currentPuce.mesh)
        }

        if (this.activePuceIndex < this.puces.length) {
          this.puces[this.activePuceIndex]!.state.isActive = true
        } else {
          allComplete = true
        }
      }
    }

    return { boom, puceIndex: this.totalHeated, speedScale, allComplete }
  }

  getCurrentPuce(): Puce | null {
    if (this.activePuceIndex < this.puces.length) {
      return this.puces[this.activePuceIndex] ?? null
    }
    return null
  }

  get heatedCount(): number {
    return this.totalHeated
  }

  get totalPuces(): number {
    return this.puces.length
  }
}

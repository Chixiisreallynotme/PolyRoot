import * as THREE from 'three'
import { Puce } from '../entities/Puce'

// 20 Candidate solder pad spots on 48x36 vast Motherboard
const ALL_PUCE_SPOTS = [
  { x: 7, z: 12 },
  { x: 16, z: 6 },
  { x: 28, z: 6 },
  { x: 42, z: 7 },
  { x: 8, z: 20 },
  { x: 22, z: 18 },
  { x: 34, z: 14 },
  { x: 43, z: 18 },
  { x: 7, z: 30 },
  { x: 18, z: 28 },
  { x: 30, z: 28 },
  { x: 42, z: 30 },
  { x: 12, z: 15 },
  { x: 24, z: 12 },
  { x: 38, z: 28 },
  { x: 26, z: 24 },
  { x: 14, z: 24 },
  { x: 36, z: 8 },
  { x: 20, z: 32 },
  { x: 32, z: 32 },
]

export class HeatingSystem {
  public puces: Puce[] = []
  public pucesHeatedCount = 0
  public isPlayerInsideAny = false
  public currentActivePuce: Puce | null = null

  constructor(scene: THREE.Scene) {
    const shuffled = [...ALL_PUCE_SPOTS].sort(() => Math.random() - 0.5)
    const selectedSpots = shuffled.slice(0, 8)

    for (let i = 0; i < selectedSpots.length; i++) {
      const spot = selectedSpots[i]
      if (!spot) continue
      const puce = new Puce(scene, i + 1, spot.x, spot.z)
      this.puces.push(puce)
    }
  }

  update(dt: number, playerX: number, playerZ: number, onBoom: (puce: Puce) => void): { heatedAny: boolean; insidePuce: Puce | null } {
    this.isPlayerInsideAny = false
    this.currentActivePuce = null
    let heatedTriggered = false

    for (const puce of this.puces) {
      if (puce.isHeated) continue

      const dx = playerX - puce.x
      const dz = playerZ - puce.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      const isInside = dist <= puce.radius

      if (isInside) {
        this.isPlayerInsideAny = true
        this.currentActivePuce = puce
      }

      const justFinished = puce.update(dt, isInside)
      if (justFinished) {
        this.pucesHeatedCount++
        heatedTriggered = true
        onBoom(puce)
      }
    }

    return { heatedAny: heatedTriggered, insidePuce: this.currentActivePuce }
  }

  isAllHeated(): boolean {
    return this.pucesHeatedCount >= 8
  }
}

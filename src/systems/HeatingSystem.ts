import * as THREE from 'three'
import { Puce } from '../entities/Puce'

// 20 Candidate solder pad spots on 36x26 Motherboard
const ALL_PUCE_SPOTS = [
  { x: 5, z: 6 },
  { x: 12, z: 5 },
  { x: 20, z: 5 },
  { x: 30, z: 6 },
  { x: 6, z: 12 },
  { x: 14, z: 10 },
  { x: 22, z: 11 },
  { x: 31, z: 12 },
  { x: 5, z: 18 },
  { x: 12, z: 17 },
  { x: 20, z: 18 },
  { x: 30, z: 18 },
  { x: 8, z: 22 },
  { x: 16, z: 23 },
  { x: 24, z: 22 },
  { x: 32, z: 22 },
  { x: 18, z: 14 },
  { x: 26, z: 15 },
  { x: 10, z: 15 },
  { x: 28, z: 8 },
]

export class HeatingSystem {
  public puces: Puce[] = []
  public pucesHeatedCount = 0
  public isPlayerInsideAny = false
  public currentActivePuce: Puce | null = null

  constructor(scene: THREE.Scene) {
    // Randomly select 8 spots among 20 for varied runs
    const shuffled = [...ALL_PUCE_SPOTS].sort(() => Math.random() - 0.5)
    const selectedSpots = shuffled.slice(0, 8)

    // Spawn all 8 puces — all active simultaneously!
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

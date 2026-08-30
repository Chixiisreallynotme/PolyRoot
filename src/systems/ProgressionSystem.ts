import * as THREE from 'three'
import type { Player } from '../entities/Player'
import type { ChoiceUI, UpgradeChoice } from '../ui/ChoiceUI'
import type { JuiceSystem } from './JuiceSystem'

// via roguelike + procedural-gen + rpg: Poncle loop progression and gems vacuum

export interface Gem {
  id: number
  mesh: THREE.Mesh
  active: boolean
}

export class ProgressionSystem {
  public rawTime = 0
  public kills = 0
  public choicesMade = 0
  private gems: Gem[] = []
  private readonly maxGems = 60

  constructor(
    private scene: THREE.Scene,
    private choiceUI?: ChoiceUI,
    private juice?: JuiceSystem | null
  ) {
    const geo = new THREE.OctahedronGeometry(0.2, 0)
    const mat = new THREE.MeshLambertMaterial({ color: 0x00ffff, emissive: 0x0088aa, flatShading: true })

    for (let i = 0; i < this.maxGems; i++) {
      const mesh = new THREE.Mesh(geo, mat)
      mesh.visible = false
      mesh.castShadow = true
      scene.add(mesh)
      this.gems.push({ id: i, mesh, active: false })
    }
  }

  get totalTimeSeconds(): number {
    return this.rawTime
  }

  update(dt: number, playerX: number, playerZ: number, onGemCollect?: () => void): void {
    this.rawTime += dt

    // Vacuum check around player (3.5m radius)
    for (const gem of this.gems) {
      if (!gem.active) continue

      const dx = playerX - gem.mesh.position.x
      const dz = playerZ - gem.mesh.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist < 3.5) {
        // Magnet vacuum attraction
        gem.mesh.position.x += (dx / dist) * 12.0 * dt
        gem.mesh.position.z += (dz / dist) * 12.0 * dt

        if (dist < 0.8) {
          gem.active = false
          gem.mesh.visible = false
          if (onGemCollect) onGemCollect()
        }
      }
    }
  }

  onEnemyKilled(x: number, z: number): void {
    this.kills++
    this.spawnGem(x, z)
  }

  public spawnGem(x: number, z: number): void {
    const gem = this.gems.find((g) => !g.active)
    if (!gem) return
    gem.mesh.position.set(x, 0.25, z)
    gem.mesh.visible = true
    gem.active = true
  }

  reset(): void {
    this.rawTime = 0
    this.kills = 0
    this.choicesMade = 0
    for (const g of this.gems) {
      g.active = false
      g.mesh.visible = false
    }
  }
}

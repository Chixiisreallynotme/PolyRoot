import * as THREE from 'three'
import type { Player } from '../entities/Player'
import type { ChoiceUI, BuildChoice } from '../ui/ChoiceUI'
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
  private readonly maxGems = 50

  constructor(
    private scene: THREE.Scene,
    private choiceUI: ChoiceUI,
    private juice: JuiceSystem | null
  ) {
    const geo = new THREE.OctahedronGeometry(0.15, 0)
    const mat = new THREE.MeshLambertMaterial({ color: 0x00ffff, emissive: 0x0088aa, flatShading: true })

    for (let i = 0; i < this.maxGems; i++) {
      const mesh = new THREE.Mesh(geo, mat)
      mesh.visible = false
      scene.add(mesh)
      this.gems.push({ id: i, mesh, active: false })
    }
  }

  update(dt: number, isPaused = false): void {
    if (!isPaused) {
      this.rawTime += dt
    }
  }

  onEnemyKilled(x: number, z: number): void {
    this.kills++
    this.spawnGem(x, z)
  }

  private spawnGem(x: number, z: number): void {
    const gem = this.gems.find((g) => !g.active)
    if (!gem) return
    gem.mesh.position.set(x, 0.2, z)
    gem.mesh.visible = true
    gem.active = true
  }

  onPuceHeated(puceNumber: number, player: Player): void {
    player.stats.pucesHeated = puceNumber

    // Vacuum all active gems on motherboard
    const activeGems = this.gems.filter((g) => g.active).map((g) => g.mesh)
    if (activeGems.length > 0 && this.juice) {
      this.juice.vacuumGems(activeGems, player.position)
      setTimeout(() => {
        for (const g of this.gems) {
          if (g.active) {
            g.active = false
            g.mesh.visible = false
          }
        }
      }, 450)
    }

    // Trigger choice every 2 puces (2, 4, 6, 8) -> 4 choices per run
    if (puceNumber % 2 === 0 && puceNumber <= 8) {
      this.choicesMade++
      this.choiceUI.show(puceNumber, (choice: BuildChoice) => {
        this.choiceUI.applyChoiceToPlayer(choice, player)
      })
    }
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

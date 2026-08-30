import * as THREE from 'three'
import type { SpawnSystem } from '../systems/SpawnSystem'
import type { JuiceSystem } from '../systems/JuiceSystem'

// via threejs-materials: MeshLambert flatShading ONLY — Boss CyberLeek
// Boss 35s 2 phases: Phase 1 (0-20s) invoke 4-6 cryptos / 5s, Phase 2 (20-35s) 8 poireaux circle / 3s + onde verte / 10s

export class Boss {
  public readonly group: THREE.Group
  public readonly mesh: THREE.Mesh
  public active = false
  public timer = 0
  public readonly maxTimer = 35.0
  public phase: 1 | 2 = 1

  private spawnCooldown = 0
  private circleCooldown = 0
  private waveCooldown = 0

  constructor(private scene: THREE.Scene) {
    this.group = new THREE.Group()
    this.group.position.set(15, 1.2, 10)

    // Low-poly Poireau giant body (Cylinder green/white + cagoule noire)
    const bodyGeo = new THREE.CylinderGeometry(0.7, 0.9, 2.4, 8)
    const bodyMat = new THREE.MeshLambertMaterial({
      color: 0x44bb33,
      flatShading: true,
    })
    this.mesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.group.add(this.mesh)

    // Cagoule noire low poly
    const maskGeo = new THREE.BoxGeometry(1.2, 0.8, 1.2)
    const maskMat = new THREE.MeshLambertMaterial({ color: 0x111111, flatShading: true })
    const mask = new THREE.Mesh(maskGeo, maskMat)
    mask.position.set(0, 0.7, 0)
    this.group.add(mask)

    // Yeux cagoule (fentes blanches)
    const eyeGeo = new THREE.BoxGeometry(0.25, 0.08, 0.1)
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true })
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
    eyeL.position.set(-0.25, 0.75, 0.6)
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat)
    eyeR.position.set(0.25, 0.75, 0.6)
    this.group.add(eyeL, eyeR)

    this.group.visible = false
    scene.add(this.group)
  }

  spawn(): void {
    this.active = true
    this.timer = 0
    this.phase = 1
    this.spawnCooldown = 1.0
    this.circleCooldown = 3.0
    this.waveCooldown = 10.0
    this.group.visible = true
    console.log('[boss] CyberLeek spawned — 35s surchauffe finale')
  }

  update(dt: number, spawner: SpawnSystem, juice: JuiceSystem | null, playerPos: THREE.Vector3): { isFinished: boolean; phase: number; timeLeft: number } {
    if (!this.active) return { isFinished: false, phase: 1, timeLeft: 35 }

    this.timer += dt
    const timeLeft = Math.max(0, this.maxTimer - this.timer)

    if (this.timer >= 20.0 && this.phase === 1) {
      this.phase = 2
      console.log('[boss] CyberLeek Phase 2: Poireaux storm + Onde verte!')
      if (juice) juice.trigger('special', { x: 15, y: 1.5, z: 10 })
    }

    // Gentle float and rotation
    this.group.rotation.y += dt * 1.5
    this.group.position.y = 1.2 + Math.sin(this.timer * 3) * 0.2

    if (this.phase === 1) {
      // Phase 1: Invoque 4-6 cryptos toutes les 5s
      this.spawnCooldown -= dt
      if (this.spawnCooldown <= 0) {
        this.spawnCooldown = 5.0
        spawner.spawnWave('doge', 4, { x: 15, z: 10 })
        spawner.spawnWave('btc', 1, { x: 15, z: 10 })
      }
    } else {
      // Phase 2: 8 poireaux en cercle toutes les 3s + onde verte toutes les 10s
      this.circleCooldown -= dt
      if (this.circleCooldown <= 0) {
        this.circleCooldown = 3.0
        spawner.spawnWave('pepe', 3, { x: 15, z: 10 })
      }

      this.waveCooldown -= dt
      if (this.waveCooldown <= 0) {
        this.waveCooldown = 10.0
        // Green wave knockback
        const dx = playerPos.x - 15
        const dz = playerPos.z - 10
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < 12.0 && dist > 0.1) {
          playerPos.x += (dx / dist) * 3.0
          playerPos.z += (dz / dist) * 3.0
        }
        if (juice) juice.trigger('medium', { x: 15, y: 0.5, z: 10 })
      }
    }

    if (this.timer >= this.maxTimer) {
      this.active = false
      this.group.visible = false
      return { isFinished: true, phase: 2, timeLeft: 0 }
    }

    return { isFinished: false, phase: this.phase, timeLeft }
  }
}

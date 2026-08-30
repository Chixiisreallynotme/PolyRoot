import * as THREE from 'three'
import { CyberLeekRig, type CyberLeekNodes } from '../render/CyberLeekRig'

// Boss CyberLeek — 100% faithful to character artwork & concept:
// - Leaner, curved stalk head with 3 swept-back green leaves and angular sunglasses
// - Articulated segmented forearms/gauntlets with elbow joints and glowing cyan cuffs
// - Articulated knee plates, utility belt, and heavy combat boots
// - Pulsing Cyan Energy Fists with CyberLeekRig procedural animation suite

export interface BossAttack {
  type: 'disc' | 'slam'
  x: number
  z: number
  vx: number
  vz: number
  radius: number
  active: boolean
  life: number
}

export class Boss {
  public readonly group: THREE.Group
  public readonly rig: CyberLeekRig
  public active = false
  public timer = 0
  public maxTime = 35
  public phase: 1 | 2 = 1

  public attacks: BossAttack[] = []
  private attackMesh: THREE.InstancedMesh
  private dummy = new THREE.Object3D()
  private maxAttacks = 60
  private attackTimer = 0
  private empWaveMesh: THREE.Mesh

  private isLeaping = false
  private leapTimer = 0
  private leapTarget = { x: 24, z: 18 }

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group()
    this.group.position.set(24, 0, 18)

    // Build Character Nodes & Hierarchy via CyberLeekRig master builder
    const { group: modelGroup, nodes } = CyberLeekRig.createModel()
    this.group.add(modelGroup)
    this.rig = new CyberLeekRig(nodes)

    // Slam Shockwave ring
    const empGeo = new THREE.RingGeometry(0.4, 1.2, 32)
    empGeo.rotateX(-Math.PI / 2)
    const empMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.empWaveMesh = new THREE.Mesh(empGeo, empMat)
    this.empWaveMesh.position.y = 0.05
    this.group.add(this.empWaveMesh)

    // Instanced Projectiles for Spinning Game Discs
    const discGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 14)
    const discMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7, flatShading: true })
    this.attackMesh = new THREE.InstancedMesh(discGeo, discMat, this.maxAttacks)
    this.attackMesh.castShadow = true
    scene.add(this.attackMesh)

    for (let i = 0; i < this.maxAttacks; i++) {
      this.attacks.push({ type: 'disc', x: 0, z: 0, vx: 0, vz: 0, radius: 0.45, active: false, life: 0 })
    }

    this.group.visible = false
    scene.add(this.group)
  }

  public buildCyberLeekHierarchy(): CyberLeekNodes {
    return CyberLeekRig.createModel().nodes
  }

  spawn(): void {
    this.active = true
    this.timer = 0
    this.phase = 1
    this.group.visible = true
    console.log('[boss] CyberLeek spawned — Tactical 35s Survival starts!')
  }

  update(dt: number, playerX: number, playerZ: number, onSummonHorde: () => void): { won: boolean; shockwaveActive: boolean } {
    if (!this.active) return { won: false, shockwaveActive: false }

    this.timer += dt
    this.attackTimer += dt

    if (this.timer >= 20 && this.phase === 1) {
      this.phase = 2
      console.log('[boss] CyberLeek Phase 2 Overclock!')
    }

    const dx = playerX - this.group.position.x
    const dz = playerZ - this.group.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const isMoving = dist > 5.0 && !this.isLeaping

    // Update CyberLeek procedural animations
    this.rig.update(dt, isMoving, 3.2)

    // Leap Slam State Machine
    if (this.isLeaping) {
      this.leapTimer += dt
      this.group.position.x += (this.leapTarget.x - this.group.position.x) * dt * 4.0
      this.group.position.z += (this.leapTarget.z - this.group.position.z) * dt * 4.0

      if (this.leapTimer >= 1.1) {
        this.isLeaping = false
        this.triggerSlamShockwave()
        this.fireRadialDiscs(10)
      }
    } else {
      this.group.rotation.y = Math.atan2(dx, dz)

      if (dist > 5.0) {
        this.group.position.x += (dx / dist) * dt * 3.2
        this.group.position.z += (dz / dist) * dt * 3.2
      }

      if (this.attackTimer >= (this.phase === 1 ? 2.5 : 1.8)) {
        this.attackTimer = 0
        if (Math.random() < 0.45) {
          this.isLeaping = true
          this.leapTimer = 0
          this.leapTarget.x = playerX
          this.leapTarget.z = playerZ
          this.rig.triggerLeapSlam(1.1)
        } else {
          this.rig.triggerDiscThrow(0.6)
          this.fireFanDiscs(playerX, playerZ, 5)
          onSummonHorde()
        }
      }
    }

    // Update Shockwave Expansion
    let shockwaveHit = false
    if (this.empWaveMesh.scale.x > 0.1 && this.empWaveMesh.scale.x < 18) {
      this.empWaveMesh.scale.x += dt * 18.0
      this.empWaveMesh.scale.z += dt * 18.0
      const currentRadius = this.empWaveMesh.scale.x * 1.2
      const distToPlayer = Math.sqrt((playerX - this.group.position.x) ** 2 + (dz) ** 2)
      if (Math.abs(distToPlayer - currentRadius) < 1.4) {
        shockwaveHit = true
      }
      const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 1.0 - this.empWaveMesh.scale.x / 18)
    }

    this.updateProjectiles(dt)

    if (this.timer >= this.maxTime) {
      this.active = false
      this.group.visible = false
      return { won: true, shockwaveActive: false }
    }

    return { won: false, shockwaveActive: shockwaveHit }
  }

  private triggerSlamShockwave(): void {
    this.empWaveMesh.scale.set(0.1, 1, 0.1)
    const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
    mat.opacity = 0.95
    console.log('[juice] CyberLeek Slam — heavy shockwave')
  }

  private fireFanDiscs(playerX: number, playerZ: number, count: number): void {
    const baseAngle = Math.atan2(playerX - this.group.position.x, playerZ - this.group.position.z)
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 0.25
      const angle = baseAngle + offset
      const p = this.attacks.find((a) => !a.active)
      if (p) {
        p.x = this.group.position.x
        p.z = this.group.position.z
        p.vx = Math.sin(angle) * 11.0
        p.vz = Math.cos(angle) * 11.0
        p.active = true
        p.life = 3.2
      }
    }
  }

  private fireRadialDiscs(count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const p = this.attacks.find((a) => !a.active)
      if (p) {
        p.x = this.group.position.x
        p.z = this.group.position.z
        p.vx = Math.cos(angle) * 9.5
        p.vz = Math.sin(angle) * 9.5
        p.active = true
        p.life = 3.2
      }
    }
  }

  private updateProjectiles(dt: number): void {
    for (let i = 0; i < this.maxAttacks; i++) {
      const a = this.attacks[i]
      if (!a || !a.active) {
        this.dummy.position.set(0, -999, 0)
        this.dummy.updateMatrix()
        this.attackMesh.setMatrixAt(i, this.dummy.matrix)
        continue
      }

      a.x += a.vx * dt
      a.z += a.vz * dt
      a.life -= dt

      if (a.life <= 0 || a.x < 0 || a.x > 48 || a.z < 0 || a.z > 36) {
        a.active = false
      }

      this.dummy.position.set(a.x, 0.45, a.z)
      this.dummy.rotation.y += dt * 18.0
      this.dummy.updateMatrix()
      this.attackMesh.setMatrixAt(i, this.dummy.matrix)
    }
    this.attackMesh.instanceMatrix.needsUpdate = true
  }

  public getActiveDiscs(): { x: number; z: number; radius: number }[] {
    return this.attacks.filter((a) => a.active).map((a) => ({ x: a.x, z: a.z, radius: a.radius }))
  }
}


import * as THREE from 'three'
import { CyberLeekRig } from '../render/CyberLeekRig'

/**
 * Boss CyberLeek — 2-Phase Hardcore Encounter:
 * 
 * - Phase 1 (100% -> 50% HP / 150 -> 75 HP):
 *   - Heavy Tactical March (7.5 m/s) + Ground Pound Leap Shockwaves (cyan expanding ground rings requiring Espace jump).
 *   - LANCE DE POIREAUX : CyberLeek launches 3 high-speed spinning cyber leeks with cyan trails fan-targeting Root!
 * 
 * - Phase 2 (50% -> 0% HP / 75 -> 0 HP) : OVERCLOCK MATRIX RAGE:
 *   - Speed boost to 10.5 m/s with pulsating red/cyan neon glitch.
 *   - Tempête de Poireaux & 6 Ricocheting Laser Discs bouncing off PCB walls and components.
 *   - Quantum Teleport Dash: Vanishes into digital matrix static and charges with twin energy gauntlets.
 */

export interface BossAttack {
  type: 'disc' | 'slam' | 'ricochet' | 'poireau'
  x: number
  z: number
  vx: number
  vz: number
  radius: number
  active: boolean
  life: number
  bounces: number
  maxBounces: number
  rotationY?: number
}

export type BossActionState =
  | 'none'
  | 'leap_slam'
  | 'throw_leeks'
  | 'spin_ricochet'
  | 'teleport_charge'
  | 'teleport_vanish'
  | 'quantum_dash'
  | 'dash_recovery'

export class Boss {
  public readonly group: THREE.Group
  public readonly rig: CyberLeekRig
  public active = false
  public timer = 0
  public maxTime = 55

  // Health & 2-Phase Hardcore State
  public hp = 150
  public maxHp = 150
  public phase: 1 | 2 = 1

  // Arena Boundaries for Ricocheting Projectiles
  public arenaMinX = 2.0
  public arenaMaxX = 46.0
  public arenaMinZ = 2.0
  public arenaMaxZ = 34.0

  public attacks: BossAttack[] = []
  private discMesh: THREE.InstancedMesh
  private leekMesh: THREE.InstancedMesh
  private dummy = new THREE.Object3D()
  private maxAttacks = 100
  private attackTimer = 0

  // Shockwave Neon Expanding Ring
  private empWaveMesh: THREE.Mesh
  private empWaveScale = 0.1
  private empWaveMaxScale = 18.0
  private empWaveActive = false

  // State Machine Timers
  private actionState: BossActionState = 'none'
  private stateTimer = 0
  private leapTarget = { x: 24, z: 18 }
  private dashVelocity = { x: 0, z: 0 }
  public isQuantumDashing = false

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group()
    this.group.position.set(24, 0, 18)

    // Build Character Nodes & Hierarchy via CyberLeekRig
    const { group: modelGroup, nodes } = CyberLeekRig.createModel()
    this.group.add(modelGroup)
    this.rig = new CyberLeekRig(nodes)

    // Neon Cyan Expanding Shockwave Ring
    const empGeo = new THREE.RingGeometry(0.35, 1.25, 36)
    empGeo.rotateX(-Math.PI / 2)
    const empMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.empWaveMesh = new THREE.Mesh(empGeo, empMat)
    this.empWaveMesh.position.y = 0.05
    this.group.add(this.empWaveMesh)

    // 1. Instanced Projectiles for Ricocheting Laser Discs
    const discGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.10, 16)
    discGeo.rotateX(Math.PI / 2)
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: false,
    })
    this.discMesh = new THREE.InstancedMesh(discGeo, discMat, this.maxAttacks)
    this.discMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(this.discMesh)

    // 2. Instanced Projectiles for Cyber Poireaux (White stalk + bright green top)
    const leekGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.85, 8)
    const leekMat = new THREE.MeshLambertMaterial({
      color: 0x48bb78,
      flatShading: true,
    })
    this.leekMesh = new THREE.InstancedMesh(leekGeo, leekMat, this.maxAttacks)
    this.leekMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(this.leekMesh)

    // Hide all instances initially
    for (let i = 0; i < this.maxAttacks; i++) {
      this.dummy.position.set(0, -999, 0)
      this.dummy.updateMatrix()
      this.discMesh.setMatrixAt(i, this.dummy.matrix)
      this.leekMesh.setMatrixAt(i, this.dummy.matrix)
    }
    this.discMesh.instanceMatrix.needsUpdate = true
    this.leekMesh.instanceMatrix.needsUpdate = true

    scene.add(this.group)
    this.group.visible = false
  }

  spawn(): void {
    this.active = true
    this.hp = this.maxHp
    this.phase = 1
    this.timer = 0
    this.actionState = 'none'
    this.stateTimer = 0
    this.attacks = []
    this.group.visible = true
    this.group.position.set(24, 0, 18)
    this.rig.setPhaseTint(1)
  }

  takeDamage(amount: number): boolean {
    if (!this.active || this.hp <= 0) return false
    this.hp = Math.max(0, this.hp - amount)

    // Phase 2 Trigger at 50% HP (75 HP)
    if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2
      this.rig.setPhaseTint(2)
      this.actionState = 'none'
      this.stateTimer = 0
    }

    return this.hp <= 0
  }

  update(
    dt: number,
    playerX: number,
    playerZ: number,
    onHordeSpawn?: () => void,
    playerY = 0
  ): { won: boolean; shockwaveActive: boolean } {
    if (!this.active) return { won: false, shockwaveActive: false }

    this.timer += dt
    this.attackTimer += dt

    if (this.timer >= this.maxTime || this.hp <= 0) {
      return { won: true, shockwaveActive: false }
    }

    const bX = this.group.position.x
    const bZ = this.group.position.z
    const dx = playerX - bX
    const dz = playerZ - bZ
    const distToPlayer = Math.sqrt(dx * dx + dz * dz)

    // Dynamic Combat Speed
    const moveSpeed = this.phase === 2 ? 10.5 : 7.5

    // State Machine Decision Flow
    if (this.actionState === 'none') {
      const dirX = distToPlayer > 0.1 ? dx / distToPlayer : 0
      const dirZ = distToPlayer > 0.1 ? dz / distToPlayer : 0

      this.group.position.x += dirX * moveSpeed * dt
      this.group.position.z += dirZ * moveSpeed * dt
      this.group.position.x = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, this.group.position.x))
      this.group.position.z = Math.max(this.arenaMinZ, Math.min(this.arenaMaxZ, this.group.position.z))

      // Attack Pattern Timer
      const attackInterval = this.phase === 2 ? 2.0 : 3.0
      if (this.attackTimer >= attackInterval) {
        this.attackTimer = 0
        const rand = Math.random()

        if (this.phase === 1) {
          // Phase 1 Attacks: 60% Throw Leeks, 40% Leap Slam
          if (rand < 0.60) {
            this.actionState = 'throw_leeks'
            this.stateTimer = 0
            this.rig.triggerDiscThrow(0.6)
            if (onHordeSpawn && Math.random() < 0.5) onHordeSpawn()
          } else {
            this.actionState = 'leap_slam'
            this.stateTimer = 0
            this.leapTarget = { x: playerX, z: playerZ }
            this.rig.triggerLeapSlam(0.8)
          }
        } else {
          // Phase 2 Attacks: 35% Bouncing Discs, 35% Throw Leeks Burst, 30% Quantum Dash
          if (rand < 0.35) {
            this.actionState = 'spin_ricochet'
            this.stateTimer = 0
            this.rig.triggerSpinAttack(0.8)
          } else if (rand < 0.70) {
            this.actionState = 'throw_leeks'
            this.stateTimer = 0
            this.rig.triggerDiscThrow(0.6)
            if (onHordeSpawn) onHordeSpawn()
          } else {
            this.actionState = 'teleport_vanish'
            this.stateTimer = 0
          }
        }
      }
    } else {
      this.handleActionState(dt, playerX, playerZ)
    }

    // Update Expanding Shockwave Ring
    let shockwaveHitPlayer = false
    if (this.empWaveActive) {
      this.empWaveScale += dt * (this.phase === 2 ? 22.0 : 16.0)
      const currentRadius = this.empWaveScale
      this.empWaveMesh.scale.set(this.empWaveScale, this.empWaveScale, 1.0)
      const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 1 - this.empWaveScale / this.empWaveMaxScale)

      // Damage player if inside expanding shockwave ring and not jumping
      if (
        Math.abs(distToPlayer - currentRadius) < 1.2 &&
        playerY < 0.45
      ) {
        shockwaveHitPlayer = true
      }

      if (this.empWaveScale >= this.empWaveMaxScale) {
        this.empWaveActive = false
        mat.opacity = 0
      }
    }

    // Update Attacks & Instanced Renderers
    this.updateAttacks(dt)
    this.rig.update(dt, {
      velocity: { x: dx, z: dz },
      isMoving: true,
      isSprinting: this.phase === 2,
      phase: this.phase as 1 | 2,
    })

    return { won: false, shockwaveActive: shockwaveHitPlayer }
  }

  private handleActionState(dt: number, playerX: number, playerZ: number): void {
    this.stateTimer += dt

    switch (this.actionState) {
      case 'throw_leeks': {
        // Wind up for 0.35s then launch 3 or 5 Poireaux in a fan
        if (this.stateTimer >= 0.35 && this.stateTimer - dt < 0.35) {
          const count = this.phase === 2 ? 5 : 3
          const spread = this.phase === 2 ? 0.6 : 0.4
          const baseAngle = Math.atan2(playerZ - this.group.position.z, playerX - this.group.position.x)
          const speed = this.phase === 2 ? 14.0 : 10.5

          for (let i = 0; i < count; i++) {
            const angleOffset = (i - (count - 1) / 2) * spread
            const angle = baseAngle + angleOffset
            this.spawnPoireau(
              this.group.position.x,
              this.group.position.z,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed
            )
          }
        }
        if (this.stateTimer >= 0.7) {
          this.actionState = 'none'
          this.stateTimer = 0
        }
        break
      }

      case 'leap_slam': {
        const leapDuration = 0.8
        const progress = Math.min(1, this.stateTimer / leapDuration)
        this.group.position.y = Math.sin(progress * Math.PI) * 4.5
        this.group.position.x += (this.leapTarget.x - this.group.position.x) * dt * 5.0
        this.group.position.z += (this.leapTarget.z - this.group.position.z) * dt * 5.0

        if (this.stateTimer >= leapDuration) {
          this.group.position.y = 0
          this.triggerShockwave()
          this.actionState = 'none'
          this.stateTimer = 0
        }
        break
      }

      case 'spin_ricochet': {
        if (this.stateTimer >= 0.4 && this.stateTimer - dt < 0.4) {
          // Fire 6 ricocheting discs in 360-degree radial ring
          const count = 6
          const speed = 12.0
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2
            this.spawnRicochetDisc(
              this.group.position.x,
              this.group.position.z,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              4
            )
          }
        }
        if (this.stateTimer >= 0.8) {
          this.actionState = 'none'
          this.stateTimer = 0
        }
        break
      }

      case 'teleport_vanish': {
        this.group.visible = false
        if (this.stateTimer >= 0.35) {
          // Reappear near player
          const offsetAngle = Math.random() * Math.PI * 2
          const offsetX = Math.cos(offsetAngle) * 6.5
          const offsetZ = Math.sin(offsetAngle) * 6.5
          this.group.position.set(playerX + offsetX, 0, playerZ + offsetZ)
          this.group.visible = true

          const dashDx = playerX - this.group.position.x
          const dashDz = playerZ - this.group.position.z
          const dist = Math.sqrt(dashDx * dashDx + dashDz * dashDz)
          const dashSpeed = 16.0
          this.dashVelocity = {
            x: (dashDx / Math.max(0.1, dist)) * dashSpeed,
            z: (dashDz / Math.max(0.1, dist)) * dashSpeed,
          }
          this.actionState = 'quantum_dash'
          this.isQuantumDashing = true
          this.stateTimer = 0
        }
        break
      }

      case 'quantum_dash': {
        this.group.position.x += this.dashVelocity.x * dt
        this.group.position.z += this.dashVelocity.z * dt
        if (this.stateTimer >= 0.45) {
          this.isQuantumDashing = false
          this.actionState = 'none'
          this.stateTimer = 0
        }
        break
      }
    }
  }

  private triggerShockwave(): void {
    this.empWaveActive = true
    this.empWaveScale = 0.2
    this.empWaveMesh.position.set(this.group.position.x, 0.05, this.group.position.z)
    const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
    mat.opacity = 1.0
  }

  private spawnPoireau(x: number, z: number, vx: number, vz: number): void {
    this.attacks.push({
      type: 'poireau',
      x,
      z,
      vx,
      vz,
      radius: 0.55,
      active: true,
      life: 5.0,
      bounces: 0,
      maxBounces: 1,
      rotationY: Math.random() * Math.PI * 2,
    })
  }

  private spawnRicochetDisc(x: number, z: number, vx: number, vz: number, maxBounces: number): void {
    this.attacks.push({
      type: 'ricochet',
      x,
      z,
      vx,
      vz,
      radius: 0.5,
      active: true,
      life: 7.0,
      bounces: 0,
      maxBounces,
    })
  }

  private updateAttacks(dt: number): void {
    let discIdx = 0
    let leekIdx = 0

    for (let i = 0; i < this.attacks.length; i++) {
      const atk = this.attacks[i]
      if (!atk || !atk.active) continue

      atk.life -= dt
      atk.x += atk.vx * dt
      atk.z += atk.vz * dt

      if (atk.rotationY !== undefined) {
        atk.rotationY += dt * 12.0 // Fast spinning leek
      }

      // Ricochet off arena boundaries
      if (atk.type === 'ricochet') {
        if (atk.x <= this.arenaMinX || atk.x >= this.arenaMaxX) {
          atk.vx = -atk.vx
          atk.bounces++
          atk.x = Math.max(this.arenaMinX, Math.min(this.arenaMaxX, atk.x))
        }
        if (atk.z <= this.arenaMinZ || atk.z >= this.arenaMaxZ) {
          atk.vz = -atk.vz
          atk.bounces++
          atk.z = Math.max(this.arenaMinZ, Math.min(this.arenaMaxZ, atk.z))
        }
        if (atk.bounces >= atk.maxBounces || atk.life <= 0) {
          atk.active = false
          continue
        }
      } else if (atk.life <= 0) {
        atk.active = false
        continue
      }

      // Render Projectile Instances
      if (atk.type === 'poireau' && leekIdx < this.maxAttacks) {
        this.dummy.position.set(atk.x, 0.6, atk.z)
        this.dummy.rotation.set(Math.PI / 2, atk.rotationY || 0, Math.atan2(atk.vz, atk.vx))
        this.dummy.scale.set(1.2, 1.2, 1.2)
        this.dummy.updateMatrix()
        this.leekMesh.setMatrixAt(leekIdx++, this.dummy.matrix)
      } else if (discIdx < this.maxAttacks) {
        this.dummy.position.set(atk.x, 0.5, atk.z)
        this.dummy.rotation.set(Math.PI / 2, 0, Math.atan2(atk.vz, atk.vx))
        this.dummy.scale.set(1.0, 1.0, 1.0)
        this.dummy.updateMatrix()
        this.discMesh.setMatrixAt(discIdx++, this.dummy.matrix)
      }
    }

    // Hide remaining instances
    for (let i = discIdx; i < this.maxAttacks; i++) {
      this.dummy.position.set(0, -999, 0)
      this.dummy.updateMatrix()
      this.discMesh.setMatrixAt(i, this.dummy.matrix)
    }
    for (let i = leekIdx; i < this.maxAttacks; i++) {
      this.dummy.position.set(0, -999, 0)
      this.dummy.updateMatrix()
      this.leekMesh.setMatrixAt(i, this.dummy.matrix)
    }

    this.discMesh.instanceMatrix.needsUpdate = true
    this.leekMesh.instanceMatrix.needsUpdate = true

    this.attacks = this.attacks.filter((a) => a.active)
  }

  getActiveDiscs(): BossAttack[] {
    return this.attacks.filter((a) => a.active)
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }
}

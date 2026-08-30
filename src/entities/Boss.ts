import * as THREE from 'three'
import { CyberLeekRig, type CyberLeekNodes } from '../render/CyberLeekRig'

/**
 * Boss CyberLeek — 100% faithful to character artwork & 3-phase epic encounter:
 * 
 * - Front-facing character model with pale stalk, signature :3 smirk, angular sunglasses with cyan highlights,
 *   3 curved leaves with cyan outline, cobalt blue tactical jumpsuit, dark navy harness with glowing cyan piping,
 *   articulated gauntlets with cyan energy cuffs and pulsating fists, and articulated combat boots.
 * 
 * - Phase 1 (100% -> 60% HP): Tactical Heavy March + Ground Pound Shockwaves (damages if player doesn't jump over the expanding neon ring) + Fan Discs.
 * - Phase 2 (60% -> 25% HP): Overclock Rage (50% faster, 360 spin attack firing 4 ricocheting laser energy discs that bounce off walls).
 * - Phase 3 (25% -> 0% HP): Quantum Teleport Dash (teleports in digital glitches, charges with twin supersonic cyan energy fists, ricochet storms).
 */

export interface BossAttack {
  type: 'disc' | 'slam' | 'ricochet'
  x: number
  z: number
  vx: number
  vz: number
  radius: number
  active: boolean
  life: number
  bounces: number
  maxBounces: number
}

export type BossActionState =
  | 'none'
  | 'leap_slam'
  | 'fan_discs'
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
  public maxTime = 45

  // Health & 3-Phase State
  public hp = 100
  public maxHp = 100
  public phase: 1 | 2 | 3 = 1

  // Arena Boundaries for Ricocheting Laser Discs
  public arenaMinX = 2.0
  public arenaMaxX = 46.0
  public arenaMinZ = 2.0
  public arenaMaxZ = 34.0

  public attacks: BossAttack[] = []
  private attackMesh: THREE.InstancedMesh
  private dummy = new THREE.Object3D()
  private maxAttacks = 80
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

    // Build Character Nodes & Hierarchy via CyberLeekRig master builder
    const { group: modelGroup, nodes } = CyberLeekRig.createModel()
    this.group.add(modelGroup)
    this.rig = new CyberLeekRig(nodes)

    // Neon Cyan Expanding Shockwave Ring (Ground level y = 0.05)
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

    // Instanced Projectiles for Spinning / Ricocheting Laser Energy Discs
    const discGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.10, 16)
    const discMat = new THREE.MeshLambertMaterial({
      color: 0x00ffff,
      emissive: 0x0284c7,
      flatShading: true,
    })
    this.attackMesh = new THREE.InstancedMesh(discGeo, discMat, this.maxAttacks)
    this.attackMesh.castShadow = true
    scene.add(this.attackMesh)

    for (let i = 0; i < this.maxAttacks; i++) {
      this.attacks.push({
        type: 'disc',
        x: 0,
        z: 0,
        vx: 0,
        vz: 0,
        radius: 0.48,
        active: false,
        life: 0,
        bounces: 0,
        maxBounces: 0,
      })
    }

    this.group.visible = false
    scene.add(this.group)
  }

  public buildCyberLeekHierarchy(): CyberLeekNodes {
    return CyberLeekRig.createModel().nodes
  }

  spawn(startX = 24, startZ = 18): void {
    this.active = true
    this.timer = 0
    this.hp = this.maxHp
    this.phase = 1
    this.actionState = 'none'
    this.stateTimer = 0
    this.attackTimer = 0
    this.group.position.set(startX, 0, startZ)
    this.group.visible = true
    this.rig.resetToIdle()
    console.log('[boss] Tactical CyberLeek Spawned — Phase 1: Heavy Tactical March & Ground Pounds!')
  }

  takeDamage(amount: number): boolean {
    if (!this.active) return false

    this.hp = Math.max(0, this.hp - amount)
    this.rig.triggerImpactSquash(0.35)

    // Phase 1 -> Phase 2 Overclock Transition (60% HP)
    if (this.hp <= 60 && this.phase === 1) {
      this.phase = 2
      this.rig.triggerImpactSquash(0.65)
      this.triggerSlamShockwave()
      this.fireRicochetDiscs(4)
      console.log('[boss] CyberLeek Phase 2: Overclock Rage Activated (50% Speed + Ricocheting Discs)!')
    }

    // Phase 2 -> Phase 3 Quantum Teleport Transition (25% HP)
    if (this.hp <= 25 && this.phase < 3) {
      this.phase = 3
      this.rig.triggerImpactSquash(0.85)
      this.triggerTeleportSequence(this.group.position.x, this.group.position.z)
      console.log('[boss] CyberLeek Phase 3: Quantum Teleport Dash Activated (Supersonic Fists + Matrix Glitches)!')
    }

    // Boss Defeated
    if (this.hp <= 0) {
      this.active = false
      this.group.visible = false
      console.log('[boss] Tactical CyberLeek Defeated!')
      return true
    }

    return false
  }

  update(
    dt: number,
    playerX: number,
    playerZ: number,
    onSummonHorde: () => void,
    playerY = 0
  ): { won: boolean; shockwaveActive: boolean } {
    if (!this.active) return { won: false, shockwaveActive: false }

    this.timer += dt
    this.attackTimer += dt

    const dx = playerX - this.group.position.x
    const dz = playerZ - this.group.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    // Boss Speed scaling per phase (Phase 2 is 50% faster)
    const baseSpeed = this.phase === 1 ? 3.0 : this.phase === 2 ? 4.8 : 5.4
    const isMoving = dist > 4.5 && this.actionState === 'none'

    // Update procedural rig animations
    this.rig.update(dt, {
      isMoving,
      isSprinting: this.phase >= 2,
      speed: baseSpeed,
      phase: this.phase,
    })

    // Execute Active Boss Action State Machine
    this.updateBossStateMachine(dt, playerX, playerZ, dist, baseSpeed, onSummonHorde)

    // Update Expanding Ground Pound Shockwave
    const shockwaveHit = this.updateShockwaveRing(dt, playerX, playerZ, playerY)

    // Update Projectiles & Wall Ricochets
    this.updateProjectiles(dt)

    // Victory if HP depleted or timer reached maxTime
    if (this.hp <= 0 || this.timer >= this.maxTime) {
      this.active = false
      this.group.visible = false
      return { won: true, shockwaveActive: false }
    }

    return { won: false, shockwaveActive: shockwaveHit }
  }

  private updateBossStateMachine(
    dt: number,
    playerX: number,
    playerZ: number,
    dist: number,
    speed: number,
    onSummonHorde: () => void
  ): void {
    const dx = playerX - this.group.position.x
    const dz = playerZ - this.group.position.z

    // 1. FREE MOVEMENT & ATTACK SELECTION
    if (this.actionState === 'none') {
      // Rotate front face (+Z) towards player
      if (dist > 0.1) {
        this.group.rotation.y = Math.atan2(dx, dz)
      }

      // March / Sprint towards player
      if (dist > 4.5) {
        this.group.position.x += (dx / dist) * speed * dt
        this.group.position.z += (dz / dist) * speed * dt
      }

      // Clamp Boss to Motherboard Arena
      this.group.position.x = Math.max(this.arenaMinX + 1.0, Math.min(this.arenaMaxX - 1.0, this.group.position.x))
      this.group.position.z = Math.max(this.arenaMinZ + 1.0, Math.min(this.arenaMaxZ - 1.0, this.group.position.z))

      // Attack Trigger Intervals (Phase 1: 2.5s, Phase 2: 1.8s, Phase 3: 1.3s)
      const attackCooldown = this.phase === 1 ? 2.5 : this.phase === 2 ? 1.8 : 1.3
      if (this.attackTimer >= attackCooldown) {
        this.attackTimer = 0
        this.selectNextPhaseAttack(playerX, playerZ, onSummonHorde)
      }
      return
    }

    // 2. LEAP SLAM SEQUENCE (Phase 1 & Phase 2)
    if (this.actionState === 'leap_slam') {
      this.stateTimer += dt
      // Interpolate leap trajectory towards target landing
      this.group.position.x += (this.leapTarget.x - this.group.position.x) * dt * 4.2
      this.group.position.z += (this.leapTarget.z - this.group.position.z) * dt * 4.2

      if (this.stateTimer >= 1.1) {
        this.actionState = 'none'
        this.triggerSlamShockwave()
        if (this.phase >= 2) {
          this.fireRadialDiscs(6)
        }
      }
    }

    // 3. 360 SPIN RICOCHET DISCS (Phase 2 & Phase 3)
    if (this.actionState === 'spin_ricochet') {
      this.stateTimer += dt
      if (this.stateTimer >= 0.85) {
        this.actionState = 'none'
      }
    }

    // 4. QUANTUM TELEPORT SEQUENCE (Phase 3)
    if (this.actionState === 'teleport_charge') {
      this.stateTimer += dt
      if (this.stateTimer >= 0.35) {
        // Vanish & Teleport to tactical flank
        this.actionState = 'teleport_vanish'
        this.stateTimer = 0
        this.group.visible = false

        // Calculate teleport destination (6-8m from player at random angle)
        const teleportAngle = Math.random() * Math.PI * 2
        const teleportDist = 7.5
        let targetX = playerX + Math.cos(teleportAngle) * teleportDist
        let targetZ = playerZ + Math.sin(teleportAngle) * teleportDist
        targetX = Math.max(this.arenaMinX + 2.0, Math.min(this.arenaMaxX - 2.0, targetX))
        targetZ = Math.max(this.arenaMinZ + 2.0, Math.min(this.arenaMaxZ - 2.0, targetZ))

        this.group.position.set(targetX, 0, targetZ)
      }
    }

    if (this.actionState === 'teleport_vanish') {
      this.stateTimer += dt
      if (this.stateTimer >= 0.15) {
        // Reappear & Initiate Supersonic Quantum Dash
        this.actionState = 'quantum_dash'
        this.stateTimer = 0
        this.group.visible = true
        this.isQuantumDashing = true

        const toPlayerX = playerX - this.group.position.x
        const toPlayerZ = playerZ - this.group.position.z
        const toPlayerDist = Math.max(0.1, Math.sqrt(toPlayerX * toPlayerX + toPlayerZ * toPlayerZ))

        this.group.rotation.y = Math.atan2(toPlayerX, toPlayerZ)
        this.dashVelocity.x = (toPlayerX / toPlayerDist) * 18.0
        this.dashVelocity.z = (toPlayerZ / toPlayerDist) * 18.0

        this.rig.triggerQuantumDash(0.48)
      }
    }

    if (this.actionState === 'quantum_dash') {
      this.stateTimer += dt
      this.group.position.x += this.dashVelocity.x * dt
      this.group.position.z += this.dashVelocity.z * dt

      // Wall bounce check during quantum dash
      if (this.group.position.x < this.arenaMinX || this.group.position.x > this.arenaMaxX) {
        this.dashVelocity.x = -this.dashVelocity.x
      }
      if (this.group.position.z < this.arenaMinZ || this.group.position.z > this.arenaMaxZ) {
        this.dashVelocity.z = -this.dashVelocity.z
      }

      if (this.stateTimer >= 0.48) {
        this.actionState = 'dash_recovery'
        this.stateTimer = 0
        this.isQuantumDashing = false
        this.rig.triggerImpactSquash(0.4)
        this.fireRicochetDiscs(2)
      }
    }

    if (this.actionState === 'dash_recovery') {
      this.stateTimer += dt
      if (this.stateTimer >= 0.20) {
        this.actionState = 'none'
      }
    }
  }

  private selectNextPhaseAttack(playerX: number, playerZ: number, onSummonHorde: () => void): void {
    const roll = Math.random()

    // PHASE 1: Tactical Heavy March + Ground Pound Shockwaves + Fan Discs
    if (this.phase === 1) {
      if (roll < 0.50) {
        this.actionState = 'leap_slam'
        this.stateTimer = 0
        this.leapTarget.x = playerX
        this.leapTarget.z = playerZ
        this.rig.triggerLeapSlam(1.1)
      } else {
        this.rig.triggerDiscThrow(0.6, () => {
          this.fireFanDiscs(playerX, playerZ, 4)
        })
      }
      return
    }

    // PHASE 2: Overclock Rage (50% Faster + Ricocheting Discs + Swarms)
    if (this.phase === 2) {
      if (roll < 0.45) {
        this.actionState = 'spin_ricochet'
        this.stateTimer = 0
        this.rig.triggerSpinAttack(0.8, () => {
          this.fireRicochetDiscs(4)
        })
      } else if (roll < 0.80) {
        this.actionState = 'leap_slam'
        this.stateTimer = 0
        this.leapTarget.x = playerX
        this.leapTarget.z = playerZ
        this.rig.triggerLeapSlam(0.9)
      } else {
        this.rig.triggerDiscThrow(0.5, () => {
          this.fireFanDiscs(playerX, playerZ, 5)
          onSummonHorde()
        })
      }
      return
    }

    // PHASE 3: Quantum Teleport Dash + Twin Energy Fists + Ricochet Storm
    if (this.phase === 3) {
      if (roll < 0.55) {
        this.triggerTeleportSequence(playerX, playerZ)
      } else if (roll < 0.85) {
        this.actionState = 'spin_ricochet'
        this.stateTimer = 0
        this.rig.triggerSpinAttack(0.7, () => {
          this.fireRicochetDiscs(8)
        })
      } else {
        this.actionState = 'leap_slam'
        this.stateTimer = 0
        this.leapTarget.x = playerX
        this.leapTarget.z = playerZ
        this.rig.triggerLeapSlam(0.75)
      }
    }
  }

  private triggerTeleportSequence(playerX: number, playerZ: number): void {
    this.actionState = 'teleport_charge'
    this.stateTimer = 0
    this.rig.triggerTeleportCharge(0.35)
  }

  /**
   * Ground Pound Shockwave:
   * Expands outward across the arena floor.
   * Only damages player if player is touching the ring AND hasn't jumped over (playerY < 0.65).
   */
  private triggerSlamShockwave(): void {
    this.empWaveScale = 0.1
    this.empWaveActive = true
    this.empWaveMesh.scale.set(this.empWaveScale, 1, this.empWaveScale)
    const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
    mat.opacity = 0.95
    console.log('[juice] CyberLeek Ground Pound — Expanding Neon Shockwave Ring!')
  }

  private updateShockwaveRing(dt: number, playerX: number, playerZ: number, playerY: number): boolean {
    if (!this.empWaveActive) return false

    this.empWaveScale += dt * 17.5
    this.empWaveMesh.scale.set(this.empWaveScale, 1, this.empWaveScale)

    const shockwaveRadius = this.empWaveScale * 1.25
    const dx = playerX - this.group.position.x
    const dz = playerZ - this.group.position.z
    const distToPlayer = Math.sqrt(dx * dx + dz * dz)

    let shockwaveHit = false
    // Collision check: player is touching the expanding ring boundary
    if (Math.abs(distToPlayer - shockwaveRadius) < 1.4) {
      // JUMP OVER RULE: If player jumped high (playerY >= 0.65), they hop safely over the ring!
      if (playerY < 0.65) {
        shockwaveHit = true
      }
    }

    const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
    mat.opacity = Math.max(0, 1.0 - this.empWaveScale / this.empWaveMaxScale)

    if (this.empWaveScale >= this.empWaveMaxScale) {
      this.empWaveActive = false
      mat.opacity = 0
    }

    return shockwaveHit
  }

  /**
   * Phase 1: Fan Laser Discs Spread
   */
  private fireFanDiscs(playerX: number, playerZ: number, count: number): void {
    const baseAngle = Math.atan2(playerX - this.group.position.x, playerZ - this.group.position.z)
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 0.24
      const angle = baseAngle + offset
      const p = this.attacks.find((a) => !a.active)
      if (p) {
        p.type = 'disc'
        p.x = this.group.position.x
        p.z = this.group.position.z
        p.vx = Math.sin(angle) * 11.5
        p.vz = Math.cos(angle) * 11.5
        p.active = true
        p.life = 3.2
        p.bounces = 0
        p.maxBounces = 0
      }
    }
  }

  /**
   * Phase 2 & 3: Ricocheting Laser Energy Discs
   * Bounces off the arena walls up to 3 times!
   */
  public fireRicochetDiscs(count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.2 - 0.1)
      const p = this.attacks.find((a) => !a.active)
      if (p) {
        p.type = 'ricochet'
        p.x = this.group.position.x
        p.z = this.group.position.z
        p.vx = Math.cos(angle) * 12.0
        p.vz = Math.sin(angle) * 12.0
        p.active = true
        p.life = 5.0
        p.bounces = 0
        p.maxBounces = 3
      }
    }
  }

  private fireRadialDiscs(count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const p = this.attacks.find((a) => !a.active)
      if (p) {
        p.type = 'disc'
        p.x = this.group.position.x
        p.z = this.group.position.z
        p.vx = Math.cos(angle) * 9.5
        p.vz = Math.sin(angle) * 9.5
        p.active = true
        p.life = 3.2
        p.bounces = 0
        p.maxBounces = 0
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

      // Wall Ricochet Reflection Physics
      if (a.type === 'ricochet' && a.bounces < a.maxBounces) {
        if (a.x <= this.arenaMinX) {
          a.x = this.arenaMinX + 0.1
          a.vx = Math.abs(a.vx)
          a.bounces++
        } else if (a.x >= this.arenaMaxX) {
          a.x = this.arenaMaxX - 0.1
          a.vx = -Math.abs(a.vx)
          a.bounces++
        }

        if (a.z <= this.arenaMinZ) {
          a.z = this.arenaMinZ + 0.1
          a.vz = Math.abs(a.vz)
          a.bounces++
        } else if (a.z >= this.arenaMaxZ) {
          a.z = this.arenaMaxZ - 0.1
          a.vz = -Math.abs(a.vz)
          a.bounces++
        }
      } else {
        // Regular projectile bounds check
        if (a.x < 0 || a.x > 48 || a.z < 0 || a.z > 36) {
          a.active = false
        }
      }

      if (a.life <= 0 || a.bounces > a.maxBounces) {
        a.active = false
      }

      this.dummy.position.set(a.x, 0.45, a.z)
      this.dummy.rotation.y += dt * 22.0
      this.dummy.updateMatrix()
      this.attackMesh.setMatrixAt(i, this.dummy.matrix)
    }
    this.attackMesh.instanceMatrix.needsUpdate = true
  }

  public getActiveDiscs(): { x: number; z: number; radius: number }[] {
    return this.attacks.filter((a) => a.active).map((a) => ({ x: a.x, z: a.z, radius: a.radius }))
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }
}


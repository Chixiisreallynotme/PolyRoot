import * as THREE from 'three'
import { Root } from './Root'

// Player entity with Jump (Space) and Dash (Shift), Plasma Cannon, and Rubber-Hose Animation

export interface PlayerBullet {
  mesh: THREE.Mesh
  active: boolean
  vx: number
  vz: number
  life: number
}

export interface PlayerStats {
  hp: number
  maxHp: number
  baseSpeed: number
  speedMult: number
  dashCooldown: number
  dashTimer: number
  isDashing: boolean
  dashDuration: number
  isJumping: boolean
  jumpVy: number
  iFrames: number
  auraRadius: number
  auraPower: number
  shootRate: number
  shootTimer: number
  shootDamage: number
  pucesHeated: number
  kills: number
}

export class Player {
  public readonly root: Root
  public readonly group: THREE.Group
  public readonly shadowMesh: THREE.Mesh
  public readonly auraMesh: THREE.Mesh
  public stats: PlayerStats

  public bullets: PlayerBullet[] = []
  private maxBullets = 20
  private keys: Record<string, boolean> = {}
  private velocity = { x: 0, z: 0 }

  constructor(scene: THREE.Scene, startX = 18, startZ = 13) {
    this.root = new Root()
    this.group = new THREE.Group()
    this.group.position.set(startX, 0, startZ)
    this.group.add(this.root.group)
    scene.add(this.group)

    this.stats = {
      hp: 3,
      maxHp: 3,
      baseSpeed: 6.8,
      speedMult: 1.0,
      dashCooldown: 1.8,
      dashTimer: 0,
      isDashing: false,
      dashDuration: 0,
      isJumping: false,
      jumpVy: 0,
      iFrames: 0,
      auraRadius: 1.5,
      auraPower: 1.0,
      shootRate: 0.35,
      shootTimer: 0,
      shootDamage: 1.0,
      pucesHeated: 0,
      kills: 0,
    }

    // Dynamic Ground Shadow (Scales during jump)
    const shadowGeo = new THREE.CircleGeometry(0.55, 16)
    shadowGeo.rotateX(-Math.PI / 2)
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    })
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
    this.shadowMesh.position.y = 0.02
    this.group.add(this.shadowMesh)

    // Glowing Neon Aura Ring
    const auraGeo = new THREE.RingGeometry(1.2, 1.5, 32)
    auraGeo.rotateX(-Math.PI / 2)
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat)
    this.auraMesh.position.y = 0.03
    this.group.add(this.auraMesh)

    // Build Player Plasma Projectiles Pool (Bright glowing cyan/orange plasma spheres)
    const bulletGeo = new THREE.SphereGeometry(0.28, 8, 8)
    const bulletMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
    })
    for (let i = 0; i < this.maxBullets; i++) {
      const mesh = new THREE.Mesh(bulletGeo, bulletMat)
      mesh.visible = false
      scene.add(mesh)
      this.bullets.push({ mesh, active: false, vx: 0, vz: 0, life: 0 })
    }

    this.setupControls()
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
      // Dash on Shift
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && this.stats.dashTimer <= 0) {
        this.triggerDash()
      }
      // Jump on Space
      if (e.code === 'Space' && !this.stats.isJumping) {
        this.triggerJump()
      }
    })
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })
  }

  private triggerDash(): void {
    this.stats.isDashing = true
    this.stats.dashDuration = 0.22
    this.stats.dashTimer = this.stats.dashCooldown
    this.root.rig.triggerImpactSquash(0.4)
    console.log('[juice] Dash on Shift — trauma 0.4 heavy 120ms')
  }

  private triggerJump(): void {
    this.stats.isJumping = true
    this.stats.jumpVy = 7.5
    this.root.rig.triggerImpactSquash(0.25)
  }

  update(dt: number, speedScale = 1.0, enemies?: { x: number; z: number; active: boolean }[]): void {
    if (this.stats.dashTimer > 0) this.stats.dashTimer -= dt
    if (this.stats.iFrames > 0) {
      this.stats.iFrames -= dt
      this.root.group.visible = Math.floor(this.stats.iFrames * 12) % 2 === 0
    } else {
      this.root.group.visible = true
    }

    // Input Movement (ZQSD / WASD / Arrows)
    let dx = 0
    let dz = 0
    if (this.keys['KeyW'] || this.keys['KeyZ'] || this.keys['ArrowUp']) dz -= 1
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dz += 1
    if (this.keys['KeyA'] || this.keys['KeyQ'] || this.keys['ArrowLeft']) dx -= 1
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1

    const len = Math.sqrt(dx * dx + dz * dz)
    if (len > 0.01) {
      dx /= len
      dz /= len
    }

    const progressionMult = 1 + Math.min(0.12 * this.stats.pucesHeated, 0.8)
    let currentSpeed = this.stats.baseSpeed * this.stats.speedMult * progressionMult * speedScale

    if (this.stats.isDashing) {
      this.stats.dashDuration -= dt
      currentSpeed *= 3.2
      if (this.stats.dashDuration <= 0) {
        this.stats.isDashing = false
      }
    }

    this.velocity.x = dx * currentSpeed
    this.velocity.z = dz * currentSpeed

    this.group.position.x += this.velocity.x * dt
    this.group.position.z += this.velocity.z * dt

    // Jump Physics (Gravity & Landing)
    if (this.stats.isJumping) {
      this.root.group.position.y += this.stats.jumpVy * dt
      this.stats.jumpVy -= 22.0 * dt // Gravity

      if (this.root.group.position.y <= 0) {
        this.root.group.position.y = 0
        this.stats.isJumping = false
        this.stats.jumpVy = 0
        this.root.rig.triggerImpactSquash(0.3) // Landing squash
      }

      // Scale ground shadow with height
      const shadowScale = Math.max(0.4, 1.0 - this.root.group.position.y * 0.25)
      this.shadowMesh.scale.set(shadowScale, 1, shadowScale)
    } else {
      this.root.group.position.y = 0
      this.shadowMesh.scale.set(1, 1, 1)
    }

    // Clamp inside motherboard board boundaries (48x36)
    this.group.position.x = Math.max(2.0, Math.min(46.0, this.group.position.x))
    this.group.position.z = Math.max(2.0, Math.min(34.0, this.group.position.z))

    // Rotate player towards moving direction
    if (len > 0.01) {
      const targetAngle = Math.atan2(dx, dz)
      this.root.group.rotation.y = targetAngle
    }

    // Update Rubber-Hose Animation
    this.root.update(dt, this.velocity, this.stats.isDashing)

    // Update Aura Scale & Pulse
    const auraScale = this.stats.auraRadius / 1.5
    const pulse = 1.0 + Math.sin(Date.now() * 0.008) * 0.06
    this.auraMesh.scale.set(auraScale * pulse, 1, auraScale * pulse)

    // Auto-Shoot Plasma Cannon towards closest enemy
    this.stats.shootTimer += dt
    if (this.stats.shootTimer >= this.stats.shootRate && enemies) {
      this.stats.shootTimer = 0
      this.autoFireAtClosestEnemy(enemies)
    }

    // Update Player Bullets
    this.updateBullets(dt)
  }

  private autoFireAtClosestEnemy(enemies: { x: number; z: number; active: boolean }[]): void {
    let closestDist = 12.0
    let targetX = 0
    let targetZ = 0
    let found = false

    const pX = this.group.position.x
    const pZ = this.group.position.z

    for (const e of enemies) {
      if (!e.active) continue
      const dist = Math.sqrt((e.x - pX) * (e.x - pX) + (e.z - pZ) * (e.z - pZ))
      if (dist < closestDist) {
        closestDist = dist
        targetX = e.x
        targetZ = e.z
        found = true
      }
    }

    if (found) {
      const dx = targetX - pX
      const dz = targetZ - pZ
      const len = Math.sqrt(dx * dx + dz * dz)
      this.spawnBullet(pX, pZ, (dx / len) * 16.0, (dz / len) * 16.0)
    }
  }

  private spawnBullet(x: number, z: number, vx: number, vz: number): void {
    const b = this.bullets.find((bullet) => !bullet.active)
    if (b) {
      b.active = true
      b.mesh.position.set(x, 0.6, z)
      b.mesh.visible = true
      b.vx = vx
      b.vz = vz
      b.life = 1.8
    }
  }

  private updateBullets(dt: number): void {
    for (const b of this.bullets) {
      if (!b.active) continue

      b.mesh.position.x += b.vx * dt
      b.mesh.position.z += b.vz * dt
      b.life -= dt

      if (b.life <= 0 || b.mesh.position.x < 0 || b.mesh.position.x > 48 || b.mesh.position.z < 0 || b.mesh.position.z > 36) {
        b.active = false
        b.mesh.visible = false
      }
    }
  }

  takeDamage(amount = 1): boolean {
    if (this.stats.iFrames > 0 || this.stats.isDashing) return false
    this.stats.hp = Math.max(0, this.stats.hp - amount)
    this.stats.iFrames = 0.8
    this.root.rig.triggerImpactSquash(0.5)
    return true
  }

  heal(amount = 1): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount)
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }
}

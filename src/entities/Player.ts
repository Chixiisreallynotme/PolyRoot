import * as THREE from 'three'
import { Root } from './Root'

// via threejs-fundamentals: antialias false — via threejs-materials: MeshLambert flatShading
// Player entity with ZQSD/WASD, mouse aim, Dash space 2s CD, Aura and auto-shoot

export interface PlayerStats {
  hp: number
  maxHp: number
  baseSpeed: number
  speedMult: number
  dashCooldown: number
  dashTimer: number
  isDashing: boolean
  dashDuration: number
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
  public readonly auraMesh: THREE.Mesh
  public stats: PlayerStats

  private moveDir = new THREE.Vector2()
  private keys: Record<string, boolean> = {}
  private mouseWorldPos = new THREE.Vector3()

  constructor(scene: THREE.Scene, startX = 15, startZ = 10) {
    this.root = new Root()
    this.group = new THREE.Group()
    this.group.position.set(startX, 0.55, startZ)
    this.group.add(this.root.group)
    scene.add(this.group)

    this.stats = {
      hp: 3,
      maxHp: 3,
      baseSpeed: 5.5,
      speedMult: 1.0,
      dashCooldown: 2.0,
      dashTimer: 0,
      isDashing: false,
      dashDuration: 0,
      iFrames: 0,
      auraRadius: 1.2,
      auraPower: 1.0,
      shootRate: 0.45,
      shootTimer: 0,
      shootDamage: 1.0,
      pucesHeated: 0,
      kills: 0,
    }

    // Aura ring visual — MeshLambert flatShading additive
    const auraGeo = new THREE.RingGeometry(0.9, 1.2, 16)
    auraGeo.rotateX(-Math.PI / 2)
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xaaff00,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat)
    this.auraMesh.position.y = 0.05
    this.group.add(this.auraMesh)

    this.setupControls()
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
      if (e.code === 'Space' && this.stats.dashTimer <= 0) {
        this.triggerDash()
      }
    })
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })
  }

  private triggerDash(): void {
    this.stats.isDashing = true
    this.stats.dashDuration = 0.18
    this.stats.dashTimer = this.stats.dashCooldown
    console.log('[juice] Dash triggered — trauma 0.4 heavy 120ms')
  }

  update(dt: number, speedScale = 1.0): void {
    if (this.stats.dashTimer > 0) this.stats.dashTimer -= dt
    if (this.stats.iFrames > 0) {
      this.stats.iFrames -= dt
      this.root.group.visible = Math.floor(this.stats.iFrames * 10) % 2 === 0
    } else {
      this.root.group.visible = true
    }

    // Input movement (ZQSD / WASD / Arrows)
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

    // Speed progression formula Poncle: baseSpeed * (1 + min(0.12 * count, 0.8)) clamp to +80%
    const progressionMult = 1 + Math.min(0.12 * this.stats.pucesHeated, 0.8)
    let currentSpeed = this.stats.baseSpeed * this.stats.speedMult * progressionMult * speedScale

    if (this.stats.isDashing) {
      this.stats.dashDuration -= dt
      currentSpeed *= 3.0
      if (this.stats.dashDuration <= 0) {
        this.stats.isDashing = false
      }
    }

    this.group.position.x += dx * currentSpeed * dt
    this.group.position.z += dz * currentSpeed * dt

    // Clamp inside motherboard board boundaries (30x20)
    this.group.position.x = Math.max(1.0, Math.min(29.0, this.group.position.x))
    this.group.position.z = Math.max(1.0, Math.min(19.0, this.group.position.z))

    // Rotate player towards movement or aim
    if (len > 0.01) {
      const targetAngle = Math.atan2(dx, dz)
      this.root.group.rotation.y = targetAngle
    }

    // Update aura scale visual
    const auraScale = this.stats.auraRadius / 1.2
    this.auraMesh.scale.set(auraScale, 1, auraScale)
  }

  takeDamage(amount = 1): boolean {
    if (this.stats.iFrames > 0 || this.stats.isDashing) return false
    this.stats.hp = Math.max(0, this.stats.hp - amount)
    this.stats.iFrames = 0.8 // 800ms i-frame
    return true
  }

  heal(amount = 1): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount)
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }
}

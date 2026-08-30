import * as THREE from 'three'
import { PS1Pass } from './render/PS1Pass'
import { Motherboard } from './entities/Motherboard'
import { Player } from './entities/Player'
import { SpawnSystem } from './systems/SpawnSystem'
import { SpatialGrid } from './systems/SpatialGrid'
import { HeatingSystem } from './systems/HeatingSystem'
import { Boss } from './entities/Boss'
import { ChoiceUI } from './ui/ChoiceUI'
import { PauseUI } from './ui/PauseUI'
import { HUD } from './ui/HUD'
import { VictoryScreen } from './ui/VictoryScreen'
import { RankSystem } from './systems/RankSystem'
import { ProgressionSystem } from './systems/ProgressionSystem'
import { FourthWall } from './systems/FourthWall'
import { ParticleSystem } from './systems/ParticleSystem'
import { PixelArt } from './ui/PixelArt'
import { SoundSystem } from './audio/SoundSystem'

// via threejs-fundamentals: antialias false + camera follow 3D — via threejs-psx-shader: FBO 320x240 Nearest
// PolyRoot : Escape from PS1 — Vast PlayStation 1 Motherboard Survivor with Solid Collisions & Jump Physics

class Game {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private ps1Pass: PS1Pass

  private motherboard: Motherboard
  private player: Player
  private spawnSystem: SpawnSystem
  private spatialGrid: SpatialGrid
  private heatingSystem: HeatingSystem
  private boss: Boss
  private choiceUI: ChoiceUI
  private pauseUI: PauseUI
  private hud: HUD
  private victoryScreen: VictoryScreen
  private rankSystem: RankSystem
  private progressionSystem: ProgressionSystem
  private particleSystem: ParticleSystem
  private fourthWall: FourthWall

  private clock = new THREE.Clock()
  private isGameOver = false
  private isVictory = false
  private cameraOffset = new THREE.Vector3(0, 11.5, 13.5) // Dynamic 3D third-person follow
  private nextChoiceThreshold = 2

  constructor() {
    // 1. WebGL Renderer Setup (960x720 internal pixelated)
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    this.renderer.setSize(960, 720, false)
    this.renderer.setPixelRatio(1.0)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const app = document.getElementById('app') || document.body
    app.appendChild(this.renderer.domElement)

    // 2. Scene & Bright Illuminated PS1 Environment (Molded Gray ABS Chassis Interior #7a8699 + High-Contrast Green PCB)
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x7a8699)
    this.scene.fog = new THREE.FogExp2(0x7a8699, 0.005)

    // 3. 3D Camera Setup
    this.camera = new THREE.PerspectiveCamera(46, 960 / 720, 0.1, 120)
    this.camera.position.set(24, 16, 32)
    this.camera.lookAt(24, 0, 18)

    // 4. Bright Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
    this.scene.add(ambientLight)

    const sun = new THREE.DirectionalLight(0xfffdfa, 2.4)
    sun.position.set(20, 36, 28)
    sun.castShadow = true
    sun.shadow.mapSize.width = 2048
    sun.shadow.mapSize.height = 2048
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 80
    sun.shadow.camera.left = -30
    sun.shadow.camera.right = 30
    sun.shadow.camera.top = 30
    sun.shadow.camera.bottom = -30
    this.scene.add(sun)

    // Colored PCB Accent Lights
    const cpuLight = new THREE.PointLight(0xffcc00, 1.8, 18)
    cpuLight.position.set(36, 4, 21)
    const gpuLight = new THREE.PointLight(0x00ffff, 1.6, 18)
    gpuLight.position.set(28, 4, 19)
    const spuLight = new THREE.PointLight(0x38bdf8, 1.6, 18)
    spuLight.position.set(16, 4, 12)
    this.scene.add(cpuLight, gpuLight, spuLight)

    // 5. PS1 Post-Processing Pass (320x240 Nearest + Bayer Dither 31.0 + Fog 0.015)
    this.ps1Pass = new PS1Pass(this.renderer)

    // 6. Subsystems Initialization (48m x 36m Motherboard)
    this.motherboard = new Motherboard(this.scene, 48, 36)
    this.player = new Player(this.scene, 24, 18)
    this.spawnSystem = new SpawnSystem(this.scene)
    this.spatialGrid = new SpatialGrid(48, 36, 4.8)
    this.heatingSystem = new HeatingSystem(this.scene)
    this.boss = new Boss(this.scene)
    this.choiceUI = new ChoiceUI()
    this.pauseUI = new PauseUI({
      onRestart: () => {
        window.location.reload()
      },
      onShaderToggle: (mode) => {
        this.ps1Pass.setShaderMode(mode)
      },
      getShaderMode: () => {
        return this.ps1Pass.getShaderMode()
      },
    })
    this.hud = new HUD()
    this.victoryScreen = new VictoryScreen()
    this.rankSystem = new RankSystem()
    this.progressionSystem = new ProgressionSystem(this.scene)
    this.particleSystem = new ParticleSystem(this.scene)
    this.fourthWall = new FourthWall()
    this.pauseUI = new PauseUI(this.ps1Pass)

    ;(window as any).__game = this

    this.setupMetaEvents()
    this.animate()
  }

  private setupMetaEvents(): void {
    const startAudioOnGesture = () => {
      SoundSystem.startMusic()
      this.hud.updateAudioBadge()
      window.removeEventListener('pointerdown', startAudioOnGesture)
      window.removeEventListener('keydown', startAudioOnGesture)
    }
    window.addEventListener('pointerdown', startAudioOnGesture, { once: true })
    window.addEventListener('keydown', startAudioOnGesture, { once: true })

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'r' || e.key === 'R') && (this.isGameOver || this.isVictory)) {
        window.location.reload()
      }
      if (e.key === 'g' || e.key === 'G') {
        FourthWall.triggerA3Glitch()
        this.ps1Pass.triggerGlitch()
      }
      if (e.key === 'm' || e.key === 'M') {
        SoundSystem.toggleMusic()
        this.hud.updateAudioBadge()
      }
    })
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate)

    const dt = Math.min(this.clock.getDelta(), 0.1)

    if (!this.isGameOver && !this.isVictory) {
      if (!this.choiceUI.isOpen && !this.pauseUI.isOpen) {
        this.updateGame(dt)
      }
    }

    this.motherboard.update(this.clock.getElapsedTime())
    this.particleSystem.update(dt)

    this.ps1Pass.render(this.scene, this.camera)
  }

  private updateGame(dt: number): void {
    const pPos = this.player.position

    // 1. Calculate Component Standing Platform Floor Height
    const floorY = this.motherboard.getSupportHeight(pPos.x, pPos.z, 0.45)

    // 2. Update Player Movement, Jump & Auto-Aim (include Boss as valid plasma target)
    const speedScale = this.heatingSystem.isPlayerInsideAny ? 0.70 : 1.0
    const targetEnemies = this.boss.active
      ? [...this.spawnSystem.instances, { x: this.boss.group.position.x, z: this.boss.group.position.z, active: true, id: -999, radius: 1.4 }]
      : this.spawnSystem.instances
    this.player.update(dt, speedScale, targetEnemies, floorY)

    // 3. Physical Motherboard Component Collisions (Solid IC chips & capacitors)
    const col = this.motherboard.checkCollision(pPos.x, pPos.z, 0.55, this.player.root.group.position.y)
    if (col.collided) {
      pPos.x += col.pushX
      pPos.z += col.pushZ
    }

    // 3. Dynamic 3D Camera Follow
    const targetCamX = pPos.x + this.cameraOffset.x
    const targetCamY = pPos.y + this.cameraOffset.y
    const targetCamZ = pPos.z + this.cameraOffset.z

    this.camera.position.x += (targetCamX - this.camera.position.x) * Math.min(1.0, dt * 6.0)
    this.camera.position.y += (targetCamY - this.camera.position.y) * Math.min(1.0, dt * 6.0)
    this.camera.position.z += (targetCamZ - this.camera.position.z) * Math.min(1.0, dt * 6.0)
    this.camera.lookAt(pPos.x, pPos.y + 0.8, pPos.z)

    // 4. Update Non-Linear Heating System
    const { heatedAny, insidePuce } = this.heatingSystem.update(dt, pPos.x, pPos.z, (blownPuce) => {
      this.handlePuceBoom(blownPuce.x, blownPuce.z)
    })

    if (this.heatingSystem.pucesHeatedCount >= this.nextChoiceThreshold && this.nextChoiceThreshold <= 8) {
      this.nextChoiceThreshold += 2
      this.triggerOverclockChoice()
    }

    // 5. Update Progression & Vacuum Gems
    this.progressionSystem.update(dt, pPos.x, pPos.z, () => {
      this.player.heal(1)
      this.particleSystem.burst({ x: pPos.x, y: 0.5, z: pPos.z }, 4, 0.0, 1.0, 1.0)
      SoundSystem.playGem()
    })

    // 6. Update Enemies & Projectiles (with physical Motherboard obstacle collisions)
    this.spawnSystem.update(
      dt,
      pPos.x,
      pPos.z,
      this.heatingSystem.pucesHeatedCount,
      this.motherboard,
      this.player.stats.auraRadius
    )

    // 7. Player Bullets vs Enemies & Boss Collisions
    for (const bullet of this.player.bullets) {
      if (!bullet.active) continue

      const bX = bullet.mesh.position.x
      const bZ = bullet.mesh.position.z

      // Boss Bullet Hit Check
      if (this.boss.active) {
        const bdx = bX - this.boss.group.position.x
        const bdz = bZ - this.boss.group.position.z
        if (Math.sqrt(bdx * bdx + bdz * bdz) <= 1.4) {
          bullet.active = false
          bullet.mesh.visible = false
          this.particleSystem.burst({ x: bX, y: 1.5, z: bZ }, 8, 0.0, 1.0, 1.0)
          const killed = this.boss.takeDamage(this.player.stats.shootDamage)
          if (killed) {
            this.particleSystem.burst({ x: this.boss.group.position.x, y: 1.5, z: this.boss.group.position.z }, 32, 1.0, 0.8, 0.0)
          }
          continue
        }
      }

      for (const inst of this.spawnSystem.instances) {
        if (!inst.active) continue

        const dx = bX - inst.x
        const dz = bZ - inst.z
        if (Math.sqrt(dx * dx + dz * dz) <= inst.radius + 0.35) {
          bullet.active = false
          bullet.mesh.visible = false

          // High-contrast electric cyan and white bullet hit sparks
          this.particleSystem.burst({ x: bX, y: 0.6, z: bZ }, 8, 0.0, 1.0, 1.0)
          this.particleSystem.burst({ x: bX, y: 0.6, z: bZ }, 4, 1.0, 1.0, 0.8)

          const res = this.spawnSystem.damageEnemy(inst.id, this.player.stats.shootDamage)
          if (res && res.killed) {
            this.progressionSystem.kills++
            this.progressionSystem.spawnGem(res.x, res.z)
            // Fiery golden explosion sparks on defeat
            this.particleSystem.burst({ x: res.x, y: 0.6, z: res.z }, 16, 1.0, 0.8, 0.0)
          }
          break
        }
      }
    }

    // 8. Spatial Grid Collisions (Aura & Player Contacts)
    this.handleCollisions(dt, pPos.x, pPos.z)

    // 9. Update Boss Tactical CyberLeek
    if (this.boss.active) {
      const { won, shockwaveActive } = this.boss.update(
        dt,
        pPos.x,
        pPos.z,
        () => {
          this.spawnSystem.spawnHordeBatch(pPos.x, pPos.z, 4)
        },
        this.player.root.group.position.y
      )

      if (shockwaveActive) {
        if (this.player.takeDamage(1)) {
          this.particleSystem.burst({ x: pPos.x, y: 0.6, z: pPos.z }, 10, 1.0, 0.2, 0.2)
          this.ps1Pass.triggerDamageGlitch()
        }
      }

      for (const disc of this.boss.getActiveDiscs()) {
        const dx = pPos.x - disc.x
        const dz = pPos.z - disc.z
        if (Math.sqrt(dx * dx + dz * dz) <= disc.radius + 0.5) {
          if (this.player.takeDamage(1)) {
            this.particleSystem.burst({ x: pPos.x, y: 0.6, z: pPos.z }, 10, 1.0, 0.2, 0.2)
            this.ps1Pass.triggerDamageGlitch()
          }
        }
      }

      if (won) {
        this.handleVictory()
      }
    }

    // 10. Check Game Over
    if (this.player.stats.hp <= 0) {
      this.handleGameOver()
    }

    // 11. Update Top Cyber HUD
    this.hud.update(
      this.player.stats.hp,
      this.progressionSystem.totalTimeSeconds,
      this.progressionSystem.kills,
      this.heatingSystem.puces,
      this.heatingSystem.pucesHeatedCount,
      this.player.stats.dashTimer,
      this.player.stats.dashCooldown,
      insidePuce,
      this.boss.active,
      this.boss.timer,
      this.boss.maxTime,
      this.boss.hp,
      this.boss.maxHp,
      this.boss.phase
    )
  }

  private handlePuceBoom(x: number, z: number): void {
    console.log('[juice] PUCE BOOM triggered — trauma 0.8 heavy 150ms')
    this.ps1Pass.triggerExplosionShake()
    this.player.root.rig.triggerImpactSquash(0.6)
    SoundSystem.playPuceBoom()

    // Trigger Chip Explosion Shockwave & 20 fiery sparks
    this.particleSystem.explodeChip(x, z)

    // Spawn green energy gems for player vacuum
    this.progressionSystem.spawnGem(x, z)
    this.progressionSystem.spawnGem(x + 1.2, z)
    this.progressionSystem.spawnGem(x - 1.2, z)

    if (this.heatingSystem.isAllHeated() && !this.boss.active) {
      this.boss.spawn()
    }
  }

  private handleCollisions(dt: number, pX: number, pZ: number): void {
    const auraRadius = this.player.stats.auraRadius
    const auraRadSq = auraRadius * auraRadius

    for (const inst of this.spawnSystem.instances) {
      if (!inst.active) continue

      const dx = pX - inst.x
      const dz = pZ - inst.z
      const distSq = dx * dx + dz * dz
      const minDist = inst.radius + 0.55

      // Body Contact Damage (only if enemy is not spawning and not jumping high above enemy)
      if (!inst.isSpawning && distSq <= minDist * minDist && this.player.root.group.position.y < 1.2) {
        if (this.player.takeDamage(1)) {
          this.particleSystem.burst({ x: pX, y: 0.6, z: pZ }, 12, 1.0, 0.2, 0.2)
          this.ps1Pass.triggerDamageGlitch()
        }
      }

      // Aura Burn / Knockback
      if (distSq <= auraRadSq) {
        const dist = Math.max(0.1, Math.sqrt(distSq))
        inst.x -= (dx / dist) * 8.5 * dt
        inst.z -= (dz / dist) * 8.5 * dt

        const res = this.spawnSystem.damageEnemy(inst.id, dt * 3.8 * this.player.stats.auraPower)
        if (res && res.killed) {
          this.progressionSystem.kills++
          this.progressionSystem.spawnGem(res.x, res.z)
          this.particleSystem.burst({ x: res.x, y: 0.6, z: res.z }, 12, 1.0, 0.8, 0.0)
        }
      }
    }

    // PEPE Projectiles Collision (Despawn immediately on contact to prevent phantom damage)
    for (const proj of this.spawnSystem.getActiveProjectiles()) {
      const dx = pX - proj.x
      const dz = pZ - proj.z
      if (Math.sqrt(dx * dx + dz * dz) <= proj.radius + 0.5 && this.player.root.group.position.y < 1.0) {
        this.spawnSystem.despawnProjectile(proj.id)
        this.particleSystem.burst({ x: proj.x, y: 0.5, z: proj.z }, 8, 0.0, 1.0, 0.4)
        if (this.player.takeDamage(1)) {
          this.particleSystem.burst({ x: pX, y: 0.6, z: pZ }, 12, 1.0, 0.2, 0.2)
          this.ps1Pass.triggerDamageGlitch()
        }
      }
    }
  }

  private triggerOverclockChoice(): void {
    this.choiceUI.show((choice) => {
      if (!choice) {
        // [4] Refusal / Skip Overclock: +15% heating speed bonus for hard-mode score runners
        this.heatingSystem.heatingSpeedMultiplier += 0.15
        console.log(`[Overclock Refusal] Skip challenge activated! Heating speed multiplier is now ${this.heatingSystem.heatingSpeedMultiplier.toFixed(2)}x`)
        return
      }
      if (choice.build === 'A') {
        this.player.stats.auraRadius *= 1.35
        this.player.stats.auraPower *= 1.4
      } else if (choice.build === 'B') {
        this.player.stats.shootRate *= 0.60
        this.player.stats.shootDamage += 1.5
      } else if (choice.build === 'C') {
        this.player.stats.baseSpeed *= 1.30
        this.player.stats.dashCooldown *= 0.65
      }
    })
  }

  private handleVictory(): void {
    this.isVictory = true
    const result = RankSystem.evaluate({
      rawTimeSeconds: this.progressionSystem.totalTimeSeconds,
      kills: this.progressionSystem.kills,
      bossDefeated: true,
    })
    this.victoryScreen.showVictory(result, () => window.location.reload())
  }

  private handleGameOver(): void {
    this.isGameOver = true
    const result = RankSystem.evaluate({
      rawTimeSeconds: this.progressionSystem.totalTimeSeconds,
      kills: this.progressionSystem.kills,
      bossDefeated: false,
    })
    this.victoryScreen.showGameOver(result, this.heatingSystem.pucesHeatedCount, () => window.location.reload())
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game()
})

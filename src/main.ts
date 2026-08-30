import * as THREE from 'three'
import { PS1Pass } from './render/PS1Pass'
import { Motherboard } from './entities/Motherboard'
import { Player } from './entities/Player'
import { SpawnSystem } from './systems/SpawnSystem'
import { SpatialGrid } from './systems/SpatialGrid'
import { HeatingSystem } from './systems/HeatingSystem'
import { Boss } from './entities/Boss'
import { ChoiceUI } from './ui/ChoiceUI'
import { HUD } from './ui/HUD'
import { VictoryScreen } from './ui/VictoryScreen'
import { RankSystem } from './systems/RankSystem'
import { ProgressionSystem } from './systems/ProgressionSystem'
import { FourthWall } from './systems/FourthWall'

// via threejs-fundamentals: antialias false + camera follow 3D — via threejs-psx-shader: FBO 320x240 Nearest
// PolyRoot : Escape from PS1 — 3D Macro Motherboard Survivor with Rubber-Hose Animations & Free-Order Canalisation

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
  private hud: HUD
  private victoryScreen: VictoryScreen
  private rankSystem: RankSystem
  private progressionSystem: ProgressionSystem
  private fourthWall: FourthWall

  private clock = new THREE.Clock()
  private isGameOver = false
  private isVictory = false
  private cameraOffset = new THREE.Vector3(0, 9.5, 11.5) // Dynamic 3D third-person follow
  private nextChoiceThreshold = 2 // Triggers at 2, 4, 6, 8

  constructor() {
    // 1. WebGL Renderer Setup (960x720 internal pixelated)
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    this.renderer.setSize(960, 720, false)
    this.renderer.setPixelRatio(1.0)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const app = document.getElementById('app') || document.body
    app.appendChild(this.renderer.domElement)

    // 2. Scene & Fog Setup (PS1 15-bit aesthetic)
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a101d)
    this.scene.fog = new THREE.FogExp2(0x0a101d, 0.015)

    // 3. 3D Camera Setup (Third-person follow)
    this.camera = new THREE.PerspectiveCamera(48, 960 / 720, 0.1, 100)
    this.camera.position.set(18, 14, 25)
    this.camera.lookAt(18, 0, 13)

    // 4. Lighting Rig (Directional Shadow Caster + Colored Point Lights)
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.85)
    this.scene.add(ambientLight)

    const sun = new THREE.DirectionalLight(0xffeedd, 1.4)
    sun.position.set(14, 24, 18)
    sun.castShadow = true
    sun.shadow.mapSize.width = 2048
    sun.shadow.mapSize.height = 2048
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 60
    sun.shadow.camera.left = -22
    sun.shadow.camera.right = 22
    sun.shadow.camera.top = 22
    sun.shadow.camera.bottom = -22
    this.scene.add(sun)

    // Colored PCB Point Lights (RAM neon & CPU socket)
    const ramLight = new THREE.PointLight(0x00ffff, 1.2, 16)
    ramLight.position.set(24, 4, 16)
    const cpuLight = new THREE.PointLight(0xffaa00, 1.5, 14)
    cpuLight.position.set(16, 3, 12)
    this.scene.add(ramLight, cpuLight)

    // 5. PS1 Post-Processing Pass (320x240 Nearest + Bayer Dither 31.0 + Fog 0.015)
    this.ps1Pass = new PS1Pass(this.renderer)

    // 6. Subsystems Initialization
    this.motherboard = new Motherboard(this.scene, 36, 26)
    this.player = new Player(this.scene, 18, 13)
    this.spawnSystem = new SpawnSystem(this.scene)
    this.spatialGrid = new SpatialGrid(36, 26, 4.5)
    this.heatingSystem = new HeatingSystem(this.scene)
    this.boss = new Boss(this.scene)
    this.choiceUI = new ChoiceUI()
    this.hud = new HUD()
    this.victoryScreen = new VictoryScreen()
    this.rankSystem = new RankSystem()
    this.progressionSystem = new ProgressionSystem(this.scene)
    this.fourthWall = new FourthWall()

    // Setup 4th wall initial bubble & key listeners
    this.setupMetaEvents()

    // Start Game Loop
    this.animate()
  }

  private setupMetaEvents(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        window.location.reload()
      }
      if (e.key === 'g' || e.key === 'G') {
        FourthWall.triggerA3Glitch()
        this.ps1Pass.triggerGlitch()
      }
    })

    // Jury 10s watcher (Break E1)
    setTimeout(() => {
      const bubble = document.createElement('div')
      bubble.id = 'fourth-wall-bubble'
      bubble.style.position = 'fixed'
      bubble.style.bottom = '24px'
      bubble.style.right = '24px'
      bubble.style.background = 'rgba(0,0,0,0.85)'
      bubble.style.border = '2px solid #00ff88'
      bubble.style.color = '#00ff88'
      bubble.style.padding = '12px 18px'
      bubble.style.borderRadius = '8px'
      bubble.style.fontFamily = "'Space Grotesk', monospace"
      bubble.style.fontSize = '12px'
      bubble.style.maxWidth = '300px'
      bubble.style.zIndex = '999'
      bubble.textContent = 'Chut. Le jury hackathon nous regarde. Montre-leur le fun en 10 secondes.'
      document.body.appendChild(bubble)
      setTimeout(() => bubble.remove(), 4500)
    }, 1500)
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate)

    const dt = Math.min(this.clock.getDelta(), 0.1)

    if (!this.isGameOver && !this.isVictory) {
      if (!this.choiceUI.isOpen) {
        this.updateGame(dt)
      }
    }

    // Motherboard animated copper traces
    this.motherboard.update(this.clock.getElapsedTime())

    // Render via PS1 1-Pass pipeline
    this.ps1Pass.render(this.scene, this.camera)
  }

  private updateGame(dt: number): void {
    // 1. Update Player Movement & Rubber-Hose Animation
    const speedScale = this.heatingSystem.isPlayerInsideAny ? 0.70 : 1.0 // 70% speed when canalising
    this.player.update(dt, speedScale)

    const pPos = this.player.position

    // 2. Dynamic 3D Camera Follow (over-the-shoulder / follow with damping)
    const targetCamX = pPos.x + this.cameraOffset.x
    const targetCamY = pPos.y + this.cameraOffset.y
    const targetCamZ = pPos.z + this.cameraOffset.z

    this.camera.position.x += (targetCamX - this.camera.position.x) * Math.min(1.0, dt * 6.0)
    this.camera.position.y += (targetCamY - this.camera.position.y) * Math.min(1.0, dt * 6.0)
    this.camera.position.z += (targetCamZ - this.camera.position.z) * Math.min(1.0, dt * 6.0)
    this.camera.lookAt(pPos.x, pPos.y + 0.8, pPos.z)

    // 3. Update Non-Linear Heating System (Free order across all 8 puces)
    const { heatedAny, insidePuce } = this.heatingSystem.update(dt, pPos.x, pPos.z, (blownPuce) => {
      this.handlePuceBoom(blownPuce.x, blownPuce.z)
    })

    // Check Overclock Trigger every 2 puces
    if (this.heatingSystem.pucesHeatedCount >= this.nextChoiceThreshold && this.nextChoiceThreshold <= 8) {
      this.nextChoiceThreshold += 2
      this.triggerOverclockChoice()
    }

    // 4. Update Progression & Vacuum Gems
    this.progressionSystem.update(dt, pPos.x, pPos.z, () => {
      this.player.heal(1)
    })

    // 5. Update Enemies & Projectiles
    this.spawnSystem.update(dt, pPos.x, pPos.z, this.heatingSystem.pucesHeatedCount)

    // 6. Spatial Grid Collisions (Aura Damage & Player Contacts)
    this.handleCollisions(dt, pPos.x, pPos.z)

    // 7. Update Boss CyberLeek (triggered after 8 puces)
    if (this.boss.active) {
      const { won, shockwaveActive } = this.boss.update(dt, pPos.x, pPos.z, () => {
        // Boss horde summons
      })

      if (shockwaveActive) {
        this.player.takeDamage(1)
        this.ps1Pass.triggerDamageGlitch()
      }

      // Check Boss disc hits
      for (const disc of this.boss.getActiveDiscs()) {
        const dx = pPos.x - disc.x
        const dz = pPos.z - disc.z
        if (Math.sqrt(dx * dx + dz * dz) <= disc.radius + 0.5) {
          if (this.player.takeDamage(1)) {
            this.ps1Pass.triggerDamageGlitch()
          }
        }
      }

      if (won) {
        this.handleVictory()
      }
    }

    // 8. Check Game Over
    if (this.player.stats.hp <= 0) {
      this.handleGameOver()
    }

    // 9. Update Top Cyber HUD
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
      this.boss.maxTime
    )
  }

  private handlePuceBoom(x: number, z: number): void {
    console.log('[juice] PUCE BOOM triggered — trauma 0.8 heavy 150ms')
    this.ps1Pass.triggerExplosionShake()
    this.player.root.rig.triggerImpactSquash(0.6)

    // Spawn green energy gems for player vacuum
    this.progressionSystem.spawnGem(x, z)
    this.progressionSystem.spawnGem(x + 0.8, z)
    this.progressionSystem.spawnGem(x - 0.8, z)

    // Check if 8 puces completed -> Spawn Boss CyberLeek
    if (this.heatingSystem.isAllHeated() && !this.boss.active) {
      this.boss.spawn()
    }
  }

  private handleCollisions(dt: number, pX: number, pZ: number): void {
    const auraRadius = this.player.stats.auraRadius
    const auraRadSq = auraRadius * auraRadius

    // Check enemy contacts and aura burn
    for (const inst of this.spawnSystem.instances) {
      if (!inst.active) continue

      const dx = pX - inst.x
      const dz = pZ - inst.z
      const distSq = dx * dx + dz * dz
      const minDist = inst.radius + 0.55

      // Player Body Contact Damage
      if (distSq <= minDist * minDist) {
        if (this.player.takeDamage(1)) {
          this.ps1Pass.triggerDamageGlitch()
        }
      }

      // Player Aura Burn / Knockback
      if (distSq <= auraRadSq) {
        const dist = Math.max(0.1, Math.sqrt(distSq))
        // Knockback away from player
        inst.x -= (dx / dist) * 8.0 * dt
        inst.z -= (dz / dist) * 8.0 * dt

        const res = this.spawnSystem.damageEnemy(inst.id, dt * 3.5 * this.player.stats.auraPower)
        if (res && res.killed) {
          this.progressionSystem.kills++
          this.progressionSystem.spawnGem(res.x, res.z)
        }
      }
    }

    // Check PEPE energy projectile collisions with player
    for (const proj of this.spawnSystem.getActiveProjectiles()) {
      const dx = pX - proj.x
      const dz = pZ - proj.z
      if (Math.sqrt(dx * dx + dz * dz) <= proj.radius + 0.5) {
        if (this.player.takeDamage(1)) {
          this.ps1Pass.triggerDamageGlitch()
        }
      }
    }
  }

  private triggerOverclockChoice(): void {
    this.choiceUI.show((choice) => {
      if (choice.build === 'A') {
        this.player.stats.auraRadius *= 1.35
        this.player.stats.auraPower *= 1.4
      } else if (choice.build === 'B') {
        this.player.stats.shootRate *= 0.65
        this.player.stats.shootDamage += 1
      } else if (choice.build === 'C') {
        this.player.stats.baseSpeed *= 1.30
        this.player.stats.dashCooldown *= 0.65
      }
    })
  }

  private handleVictory(): void {
    this.isVictory = true
    const result = RankSystem.evaluate(this.progressionSystem.totalTimeSeconds, this.progressionSystem.kills)
    this.victoryScreen.showVictory(result, () => window.location.reload())
  }

  private handleGameOver(): void {
    this.isGameOver = true
    const result = RankSystem.evaluate(this.progressionSystem.totalTimeSeconds, this.progressionSystem.kills)
    this.victoryScreen.showGameOver(result, this.heatingSystem.pucesHeatedCount, () => window.location.reload())
  }
}

// Instantiate Game on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  new Game()
})

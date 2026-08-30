import * as THREE from 'three'
import { gsap } from 'gsap'
import { PS1Pass } from './render/PS1Pass'
import { Player } from './entities/Player'
import { SpawnSystem } from './systems/SpawnSystem'
import { SpatialGrid } from './systems/SpatialGrid'
import { HeatingSystem } from './systems/HeatingSystem'
import { Boss } from './entities/Boss'
import { JuiceSystem } from './systems/JuiceSystem'
import { CameraShake } from './systems/CameraShake'
import { ParticleSystem } from './systems/ParticleSystem'
import { SFX } from './audio/SFX'
import { ProgressionSystem } from './systems/ProgressionSystem'
import { ChoiceUI } from './ui/ChoiceUI'
import { HUD } from './ui/HUD'
import { VictoryScreen } from './ui/VictoryScreen'
import { RankSystem } from './systems/RankSystem'
import { FourthWall } from './systems/FourthWall'

// via threejs-fundamentals: antialias false pixelRatio1 + scene top-down camera top-down 45°
// via threejs-shaders: ShaderMaterial Bayer + via threejs-postprocessing: 1 pass ONLY — ctx7 r184
// via threejs-fundamentals: WebGLRenderer antialias:false powerPreference:high-performance pixelRatio:1.0 setSize(960,720,false) canvas image-rendering:pixelated 960×720
// via threejs-psx-shader: FBO 320×240 Nearest
// via threejs-perf: Instancing Float32Array setMatrixAt 9.9→0.5ms

const app = document.getElementById('app')!
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a3a2f)
scene.fog = new THREE.FogExp2(0x1a3a2f, 0.015) // FogExp2 density 0.015 — MUST

const camera = new THREE.PerspectiveCamera(60, 960 / 720, 0.1, 100)
camera.position.set(15, 18, 15) // top-down 45°
camera.lookAt(15, 0, 10)

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
renderer.setPixelRatio(1.0)
renderer.setSize(960, 720, false)
renderer.domElement.style.imageRendering = 'pixelated'
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.shadowMap.autoUpdate = true
app.appendChild(renderer.domElement)
renderer.domElement.style.width = '960px'
renderer.domElement.style.height = '720px'

// 1 ShaderPass maison — WebGLRenderTarget 320×240 Nearest + Bayer 4x4 + quantize 31 + FogExp2
const ps1Pass = new PS1Pass(renderer)

// via threejs-lighting: Directional 512 PCFSoft + Point lerp(player.position)
const dir = new THREE.DirectionalLight(0xffffff, 1.2)
dir.position.set(8, 12, 4)
dir.castShadow = true
dir.shadow.mapSize.set(512, 512)
dir.shadow.camera.near = 0.5
dir.shadow.camera.far = 40
scene.add(dir)
scene.add(new THREE.AmbientLight(0xffffff, 0.6))
scene.add(new THREE.HemisphereLight(0x88ffaa, 0x1a3a2f, 0.4))

// Point light follow Root — intensity 1.5 distance 8
const point = new THREE.PointLight(0xaaff00, 1.5, 8)
scene.add(point)

// Carte mère 30×20 — MeshLambert flatShading ONLY, 128 Nearest (baked)
const boardGeo = new THREE.BoxGeometry(30, 0.5, 20)
const boardMat = new THREE.MeshLambertMaterial({ color: 0x1e4a3a, flatShading: true })
const board = new THREE.Mesh(boardGeo, boardMat)
board.receiveShadow = true
board.position.set(15, -0.25, 10)
scene.add(board)

// Systems Setup
const cameraShake = new CameraShake(camera)
const particleSystem = new ParticleSystem(scene)
const sfx = new SFX()
const juiceSystem = new JuiceSystem(cameraShake, particleSystem, sfx)
const spatialGrid = new SpatialGrid(30, 20, 3.75)
const spawnSystem = new SpawnSystem(scene)
const heatingSystem = new HeatingSystem(scene)
const boss = new Boss(scene)
const choiceUI = new ChoiceUI()
const progression = new ProgressionSystem(scene, choiceUI, juiceSystem)
const hud = new HUD()
const victoryScreen = new VictoryScreen()

// Player Entity
const player = new Player(scene, 15, 10)

// Game State
let isGameOver = false
let isGameWon = false
let frameCount = 0
let lastTime = performance.now()

// E1 Fourth Wall: Jury watch on frame 1
function checkJuryWatch() {
  if (frameCount === 1) {
    FourthWall.triggerE1JuryWatch()
    player.root.lookAtCamera(0.18)
    const bubble = document.createElement('div')
    bubble.id = 'fourth-wall-bubble'
    bubble.textContent = 'Chut. Le jury hackathon nous regarde. Montre-leur le fun en 10 secondes.'
    bubble.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#aaff00;padding:8px 12px;font-family:Space Grotesk,monospace;font-size:10px;border:1px solid #aaff00;z-index:9999'
    document.body.appendChild(bubble)
    setTimeout(() => bubble.remove(), 2500)
  }
}

// A3 Glitch key shortcut
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyG') {
    FourthWall.triggerA3Glitch()
    ps1Pass.triggerGlitch()
  }
})

function restartGame() {
  isGameOver = false
  isGameWon = false
  player.stats.hp = player.stats.maxHp
  player.stats.pucesHeated = 0
  player.group.position.set(15, 0.55, 10)
  spawnSystem.clear()
  spatialGrid.clear()
  progression.reset()
  for (const puce of heatingSystem.puces) {
    puce.reset(puce.state.x, puce.state.z)
  }
  if (heatingSystem.puces[0]) {
    heatingSystem.puces[0].state.isActive = true
  }
  boss.active = false
  boss.group.visible = false
  victoryScreen.hide()
}

// Main Game Loop (60 FPS locked target)
function animate(currentTime: number) {
  requestAnimationFrame(animate)
  frameCount++
  checkJuryWatch()

  const dt = Math.min(0.1, (currentTime - lastTime) / 1000)
  lastTime = currentTime

  if (!isGameOver && !isGameWon && !choiceUI.visible) {
    // 1. Update Progression
    progression.update(dt)

    // 2. Update Heating
    const heatResult = heatingSystem.update(dt, player.position, juiceSystem)
    if (heatResult.boom) {
      progression.onPuceHeated(heatResult.puceIndex, player)
      if (heatResult.puceIndex === 1) {
        FourthWall.triggerA1LookAt()
      } else if (heatResult.puceIndex === 4 || heatResult.puceIndex === 8) {
        FourthWall.triggerA2Binary()
      }
    }

    if (heatResult.allComplete && !boss.active && !isGameWon) {
      boss.spawn()
      FourthWall.triggerB2CyberLeek(RankSystem.formatTime(progression.rawTime))
    }

    // 3. Update Player
    player.update(dt, heatResult.speedScale)

    // 4. Update Spawner & Spatial Grid
    spawnSystem.update(dt, { x: player.position.x, z: player.position.z }, spatialGrid)

    // 5. Update Boss
    if (boss.active) {
      const bossResult = boss.update(dt, spawnSystem, juiceSystem, player.position)
      if (bossResult.isFinished) {
        isGameWon = true
        const finalScore = RankSystem.evaluate(progression.rawTime, progression.kills)
        FourthWall.triggerE2BeatStudios(RankSystem.formatTime(finalScore.scoreTimeSeconds), finalScore.rank)
        FourthWall.triggerB3CpuIrl(particleSystem.particleCount, 3, 60)
        victoryScreen.showVictory(finalScore, restartGame)
      }
    }

    // 6. Collision: Player vs Enemies (using SpatialGrid)
    const nearby = spatialGrid.query(player.position.x, player.position.z, player.stats.auraRadius + 1.0)
    for (const item of nearby) {
      const dx = item.x - player.position.x
      const dz = item.z - player.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      // Aura pushback
      if (dist < player.stats.auraRadius + item.radius && dist > 0.01) {
        const enemy = spawnSystem.killEnemy(item.id, spatialGrid)
        if (enemy) {
          enemy.hp -= player.stats.auraPower * dt * 5.0
          if (enemy.hp <= 0) {
            progression.onEnemyKilled(enemy.x, enemy.z)
            juiceSystem.trigger('medium', { x: enemy.x, y: 0.4, z: enemy.z })
          }
        }
      }

      // Player take hit
      if (dist < 0.6 + item.radius) {
        const tookHit = player.takeDamage(1)
        if (tookHit) {
          juiceSystem.trigger('medium', { x: player.position.x, y: 0.5, z: player.position.z }, player.root.group)
          if (player.stats.hp <= 0) {
            isGameOver = true
            const finalScore = RankSystem.evaluate(progression.rawTime, progression.kills)
            if (finalScore.nearMissMessage) {
              FourthWall.triggerB1NearMiss(Math.ceil(finalScore.scoreTimeSeconds - 225))
            }
            FourthWall.triggerB3CpuIrl(particleSystem.particleCount, 3, 60)
            victoryScreen.showGameOver(finalScore, heatingSystem.heatedCount, restartGame)
          }
        }
      }
    }

    // 7. Collision: Player vs Projectiles
    for (const proj of spawnSystem.getActiveProjectiles()) {
      const dx = proj.x - player.position.x
      const dz = proj.z - player.position.z
      if (dx * dx + dz * dz < 0.4) {
        proj.active = false
        const tookHit = player.takeDamage(1)
        if (tookHit) {
          juiceSystem.trigger('light', { x: player.position.x, y: 0.5, z: player.position.z })
          if (player.stats.hp <= 0) {
            isGameOver = true
            const finalScore = RankSystem.evaluate(progression.rawTime, progression.kills)
            victoryScreen.showGameOver(finalScore, heatingSystem.heatedCount, restartGame)
          }
        }
      }
    }

    // 8. Auto-shoot nearest enemy
    player.stats.shootTimer -= dt
    if (player.stats.shootTimer <= 0) {
      player.stats.shootTimer = player.stats.shootRate
      const enemies = spawnSystem.getActiveEnemies()
      if (enemies.length > 0) {
        let nearest = enemies[0]!
        let minDistSq = 999999
        for (const e of enemies) {
          const dx = e.x - player.position.x
          const dz = e.z - player.position.z
          const dsq = dx * dx + dz * dz
          if (dsq < minDistSq) {
            minDistSq = dsq
            nearest = e
          }
        }
        if (minDistSq < 100) {
          nearest.hp -= player.stats.shootDamage
          juiceSystem.trigger('light', { x: nearest.x, y: 0.3, z: nearest.z })
          if (nearest.hp <= 0) {
            spawnSystem.killEnemy(nearest.id, spatialGrid)
            progression.onEnemyKilled(nearest.x, nearest.z)
          }
        }
      }
    }
  }

  // Update Particles
  particleSystem.update(dt)

  // Camera Shake & Lights
  cameraShake.update(dt, player.position)
  point.position.lerp(player.position, 0.1)
  point.position.y = 2.0

  // Update HUD
  hud.update(player, heatingSystem, boss, progression)

  // 1 ShaderPass render: 320x240 Nearest -> Bayer 31 + Fog 0.015 -> upscale 960x720
  ps1Pass.render(scene, camera)
}

requestAnimationFrame(animate)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  ps1Pass.setSize(960, 720)
})

console.log('[4th-wall] PolyRoot bootstrap OK — PS1 320×240 Nearest + quantize 31 + Fog 0.015 = lisibilité kiting')

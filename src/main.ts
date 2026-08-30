import * as THREE from 'three'
import { gsap } from 'gsap'
import { PS1Pass } from './render/PS1Pass'
import { Root } from './entities/Root'

// via threejs-fundamentals: antialias false pixelRatio1 + scene top-down camera top-down 45°
// via threejs-shaders: ShaderMaterial Bayer + via threejs-postprocessing: 1 pass ONLY — ctx7 r184
// via threejs-fundamentals: WebGLRenderer antialias:false powerPreference:high-performance pixelRatio:1.0 setSize(960,720,false) canvas image-rendering:pixelated 960×720
// via threejs-psx-shader: FBO 320×240 Nearest

const app = document.getElementById('app')!
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a3a2f)
scene.fog = new THREE.FogExp2(0x1a3a2f, 0.015) // FogExp2 density 0.015 — MUST

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(15, 18, 15) // top-down per prompt
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

// 1 ShaderPass maison — WebGLRenderTarget 320×240 Nearest + Bayer + quantize 31 + FogExp2
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

// Point follow Root — intensity 1.5 distance 8 lerp
const point = new THREE.PointLight(0xaaff00, 1.5, 8)
scene.add(point)

// Carte mère 30×20 — MeshLambert flatShading ONLY, 128 Nearest (baked)
const boardGeo = new THREE.BoxGeometry(30, 0.5, 20)
const boardMat = new THREE.MeshLambertMaterial({ color: 0x1e4a3a, flatShading: true })
boardMat.flatShading = true
const board = new THREE.Mesh(boardGeo, boardMat)
board.receiveShadow = true
board.position.set(15, -0.25, 10)
scene.add(board)

// Root low-poly fidèle — via threejs-materials MeshLambert flatShading ONLY 300 tris
const rootEntity = new Root()
rootEntity.group.position.set(15, 0.55, 10)
scene.add(rootEntity.group)

// 8 puces placeholder — MeshLambert flatShading, castShadow true
const puces: THREE.Mesh[] = []
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2
  const r = 8 + Math.random() * 4
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.4, 1.2),
    new THREE.MeshLambertMaterial({ color: 0x222222, emissive: 0x331111, emissiveIntensity: 0.2, flatShading: true })
  )
  mesh.position.set(15 + Math.cos(angle) * r, 0.2, 10 + Math.sin(angle) * r)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)
  puces.push(mesh)
}

// GSAP squash test — via gsap-core: gsap.to 1.3/0.7→1 0.18s BACK back.out(1.7)
gsap.to(rootEntity.group.scale, {
  x: 1.2,
  y: 0.8,
  z: 1.2,
  duration: 0.12,
  yoyo: true,
  repeat: 1,
  ease: 'back.out(1.7)',
  repeatDelay: 2,
  onRepeat: () => console.log('[4th-wall] squash OK'),
})

// Fourth wall E1: “Chut. Le jury hackathon nous regarde. Montre-leur le fun en 10 secondes.” frame==1
let frame = 0
let juryShown = false
function maybeShowJury() {
  if (!juryShown && frame === 1) {
    juryShown = true
    console.log('[4th-wall] jury-watch — Chut. Le jury hackathon nous regarde. Montre-leur le fun en 10 secondes.')
    rootEntity.lookAtCamera(0.18)
    const bubble = document.createElement('div')
    bubble.id = 'fourth-wall-bubble'
    bubble.textContent = 'Chut. Le jury hackathon nous regarde. Montre-leur le fun en 10 secondes.'
    bubble.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#aaff00;padding:8px 12px;font-family:Space Grotesk,monospace;font-size:10px;border:1px solid #aaff00;z-index:9999'
    document.body.appendChild(bubble)
    setTimeout(() => bubble.remove(), 2500)
  }
}

// A3 glitch demo: trauma 0.4+ → 1 frame
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyG') ps1Pass.triggerGlitch()
})

function animate() {
  requestAnimationFrame(animate)
  frame++
  maybeShowJury()
  rootEntity.group.rotation.y += 0.005
  point.position.lerp(rootEntity.group.position, 0.1)
  point.position.y += 2
  // 1 ShaderPass render: WebGLRenderTarget 320×240 Nearest → quad fullscreen Nearest sampling renderTarget.texture + setRenderTarget(null)
  ps1Pass.render(scene, camera)
}
animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  ps1Pass.setSize(960, 720)
})

console.log('[4th-wall] PolyRoot bootstrap OK — PS1 320×240 Nearest + quantize 31 + Fog 0.015 = lisibilité kiting')

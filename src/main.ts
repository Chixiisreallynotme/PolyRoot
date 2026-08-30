import * as THREE from 'three'
import { gsap } from 'gsap'

// PolyRoot — Bootstrap minimal (vérif build)
// TODO: Remplacer par PS1Pipeline + HeatingSystem + Horde

const app = document.getElementById('app')!
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a3a2f)
scene.fog = new THREE.Fog(0x1a3a2f, 12, 32)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 18, 12)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: false })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.shadowMap.autoUpdate = true
app.appendChild(renderer.domElement)

// Lumière unique 512 (P0)
const dir = new THREE.DirectionalLight(0xffffff, 1.2)
dir.position.set(8, 12, 4)
dir.castShadow = true
dir.shadow.mapSize.set(512, 512)
dir.shadow.camera.near = 0.5
dir.shadow.camera.far = 40
scene.add(dir)
scene.add(new THREE.AmbientLight(0xffffff, 0.6))
scene.add(new THREE.HemisphereLight(0x88ffaa, 0x1a3a2f, 0.4))

// Carte mère (placeholder 30x20)
const boardGeo = new THREE.BoxGeometry(30, 0.5, 20)
const boardMat = new THREE.MeshLambertMaterial({ color: 0x1e4a3a })
const board = new THREE.Mesh(boardGeo, boardMat)
board.receiveShadow = true
board.position.y = -0.25
scene.add(board)

// Root (placeholder cube)
const rootGeo = new THREE.BoxGeometry(0.9, 1.1, 0.9)
const rootMat = new THREE.MeshLambertMaterial({ color: 0xaaff00 })
const root = new THREE.Mesh(rootGeo, rootMat)
root.castShadow = true
root.position.set(0, 0.55, 0)
scene.add(root)

// 8 puces (placeholder)
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2
  const r = 8 + Math.random() * 4
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.4, 1.2),
    new THREE.MeshLambertMaterial({ color: 0x222222, emissive: 0x331111, emissiveIntensity: 0.2 })
  )
  mesh.position.set(Math.cos(angle) * r, 0.2, Math.sin(angle) * r)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)
}

// Test GSAP squash (P0 juice)
gsap.to(root.scale, { x: 1.2, y: 0.8, z: 1.2, duration: 0.12, yoyo: true, repeat: 1, ease: 'back.out(1.7)', repeatDelay: 2, onRepeat: () => console.log('squash OK') })

// Loop
function animate() {
  requestAnimationFrame(animate)
  root.rotation.y += 0.01
  renderer.render(scene, camera)
}
animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

console.log('PolyRoot bootstrap OK — Three r184, GSAP, Howler, Vite, Electron ready')
console.log('Skills prêts : threejs-shaders, game-feel, threejs-perf, electron-builder, etc. Voir outils.md')

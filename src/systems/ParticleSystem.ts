import * as THREE from 'three'

// ParticleSystem with 200 particle pool for hit sparks, gem sparkles, and chip explosion shockwaves
// 1 Draw call Points BufferGeometry with additive blending

export class ParticleSystem {
  public readonly points: THREE.Points
  private readonly geometry: THREE.BufferGeometry
  private readonly positions: Float32Array
  private readonly velocities: Float32Array
  private readonly lifetimes: Float32Array
  private readonly colors: Float32Array
  private readonly count = 200
  private active = 0

  private shockwaves: { mesh: THREE.Mesh; life: number; maxLife: number }[] = []

  constructor(scene: THREE.Scene) {
    this.geometry = new THREE.BufferGeometry()
    this.positions = new Float32Array(this.count * 3)
    this.velocities = new Float32Array(this.count * 3)
    this.lifetimes = new Float32Array(this.count)
    this.colors = new Float32Array(this.count * 3)

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))

    const material = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.22,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    this.points = new THREE.Points(this.geometry, material)
    this.points.frustumCulled = false
    scene.add(this.points)

    // Pool 4 reusable expanding shockwave meshes
    const ringGeo = new THREE.RingGeometry(0.2, 0.4, 32)
    ringGeo.rotateX(-Math.PI / 2)
    for (let i = 0; i < 4; i++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(ringGeo, ringMat)
      mesh.visible = false
      scene.add(mesh)
      this.shockwaves.push({ mesh, life: 0, maxLife: 0.5 })
    }
  }

  burst(pos: { x: number; y: number; z: number }, n: number, r = 0.0, g = 1.0, b = 0.5): void {
    const toEmit = Math.min(n, this.count - this.active)
    for (let i = 0; i < toEmit; i++) {
      const idx = this.findFreeSlot()
      if (idx < 0) break
      const i3 = idx * 3
      this.positions[i3] = pos.x + (Math.random() - 0.5) * 0.3
      this.positions[i3 + 1] = pos.y + 0.2
      this.positions[i3 + 2] = pos.z + (Math.random() - 0.5) * 0.3
      this.velocities[i3] = (Math.random() - 0.5) * 7
      this.velocities[i3 + 1] = Math.random() * 5 + 2
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 7
      this.colors[i3] = r
      this.colors[i3 + 1] = g
      this.colors[i3 + 2] = b
      this.lifetimes[idx] = 0.6 + Math.random() * 0.4
      this.active++
    }
    const posAttr = this.geometry.attributes['position']
    const colAttr = this.geometry.attributes['color']
    if (posAttr) posAttr.needsUpdate = true
    if (colAttr) colAttr.needsUpdate = true
  }

  explodeChip(x: number, z: number): void {
    // 1. Fiery explosion sparks (20 particles)
    this.burst({ x, y: 0.3, z }, 20, 1.0, 0.4, 0.0)

    // 2. Trigger expanding shockwave ring
    const sw = this.shockwaves.find((s) => s.life <= 0)
    if (sw) {
      sw.mesh.position.set(x, 0.08, z)
      sw.mesh.scale.set(0.1, 1, 0.1)
      sw.mesh.visible = true
      sw.life = sw.maxLife
      const mat = sw.mesh.material as THREE.MeshBasicMaterial
      mat.opacity = 0.95
    }
  }

  private findFreeSlot(): number {
    for (let i = 0; i < this.count; i++) if ((this.lifetimes[i] ?? 0) <= 0) return i
    return -1
  }

  update(dt: number): void {
    let alive = 0
    for (let i = 0; i < this.count; i++) {
      if ((this.lifetimes[i] ?? 0) <= 0) continue
      const i3 = i * 3
      this.positions[i3] = (this.positions[i3] ?? 0) + (this.velocities[i3] ?? 0) * dt
      this.positions[i3 + 1] = (this.positions[i3 + 1] ?? 0) + (this.velocities[i3 + 1] ?? 0) * dt
      this.positions[i3 + 2] = (this.positions[i3 + 2] ?? 0) + (this.velocities[i3 + 2] ?? 0) * dt
      this.velocities[i3 + 1] = (this.velocities[i3 + 1] ?? 0) - 9.8 * dt * 0.5
      this.lifetimes[i] = (this.lifetimes[i] ?? 0) - dt
      if ((this.lifetimes[i] ?? 0) > 0) alive++
    }
    this.active = alive
    const posAttr = this.geometry.attributes['position']
    if (posAttr) posAttr.needsUpdate = true

    // Update shockwaves
    for (const sw of this.shockwaves) {
      if (sw.life > 0) {
        sw.life -= dt
        const progress = 1.0 - sw.life / sw.maxLife
        const scale = 1.0 + progress * 14.0
        sw.mesh.scale.set(scale, 1, scale)
        const mat = sw.mesh.material as THREE.MeshBasicMaterial
        mat.opacity = Math.max(0, 1.0 - progress)
        if (sw.life <= 0) {
          sw.mesh.visible = false
        }
      }
    }
  }

  get particleCount(): number {
    return this.active
  }

  dispose(): void {
    this.geometry.dispose()
    ;(this.points.material as THREE.Material).dispose()
    for (const sw of this.shockwaves) {
      sw.mesh.geometry.dispose()
      ;(sw.mesh.material as THREE.Material).dispose()
    }
  }
}

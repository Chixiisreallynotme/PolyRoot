import * as THREE from 'three'

// via particles-lifecycle: pool CPU+GPU maxCount 200 hit4/kill12/boom20
// via performance-optimization: pool 200 batching profile-first — via three-best-practices: no new Vector3 in update
// ParticleSystem Points BufferGeometry 200*3 Float32Array ShaderMaterial additive depthWrite:false

export class ParticleSystem {
  public readonly points: THREE.Points
  private readonly geometry: THREE.BufferGeometry
  private readonly positions: Float32Array
  private readonly velocities: Float32Array
  private readonly lifetimes: Float32Array
  private readonly count = 200
  private active = 0

  constructor(scene: THREE.Scene) {
    this.geometry = new THREE.BufferGeometry()
    this.positions = new Float32Array(this.count * 3)
    this.velocities = new Float32Array(this.count * 3)
    this.lifetimes = new Float32Array(this.count)

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xaaff00,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    this.points = new THREE.Points(this.geometry, material)
    // 1 draw call Points — MUST 1 shadow 512 1 Points 30 ennemis p95<16ms
    this.points.frustumCulled = false
    scene.add(this.points)
  }

  // budgets: hit 4 / kill 12 / boom 20 (NEVER 30), instanceMatrix.count swap
  burst(pos: { x: number; y: number; z: number }, n: number): void {
    const toEmit = Math.min(n, this.count - this.active)
    for (let i = 0; i < toEmit; i++) {
      const idx = this.findFreeSlot()
      if (idx < 0) break
      const i3 = idx * 3
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.positions[i3] = pos.x + (Math.random() - 0.5) * 0.3
      this.positions[i3 + 1] = pos.y + 0.2
      this.positions[i3 + 2] = pos.z + (Math.random() - 0.5) * 0.3
      this.velocities[i3] = (Math.random() - 0.5) * 6
      this.velocities[i3 + 1] = Math.random() * 4 + 2
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 6
      this.lifetimes[idx] = 0.6 + Math.random() * 0.4
      this.active++
    }
    const attr = this.geometry.attributes['position']
    if (attr) attr.needsUpdate = true
  }

  private findFreeSlot(): number {
    for (let i = 0; i < this.count; i++) if ((this.lifetimes[i] ?? 0) <= 0) return i
    return -1
  }

  update(dt: number): void {
    // No allocation in update — via three-best-practices
    let alive = 0
    for (let i = 0; i < this.count; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.lifetimes[i]! <= 0) continue
      const i3 = i * 3
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.positions[i3]! += this.velocities[i3]! * dt
      this.positions[i3 + 1]! += this.velocities[i3 + 1]! * dt
      this.positions[i3 + 2]! += this.velocities[i3 + 2]! * dt
      this.velocities[i3 + 1]! -= 9.8 * dt * 0.5 // gravity
      this.lifetimes[i]! -= dt
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.lifetimes[i]! > 0) alive++
    }
    this.active = alive
    const attr = this.geometry.attributes['position'] as THREE.BufferAttribute | undefined
    if (attr) attr.needsUpdate = true
  }

  get particleCount(): number {
    return this.active
  }

  dispose(): void {
    this.geometry.dispose()
    ;(this.points.material as THREE.Material).dispose()
  }
}

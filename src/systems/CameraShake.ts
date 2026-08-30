import * as THREE from 'three'

// via camera-systems: CameraShake.ts addTrauma(v) lerp offset=(rand-0.5)*max*trauma² deadzone0.8 revert LateUpdate
// via game-feel: trauma 0.15/0.4/0.8 decay1.2 max_offset 12/8

export class CameraShake {
  private trauma = 0
  private readonly decay = 1.2 // per second
  private readonly deadzone = 0.8 // meters around Root — MUST
  private readonly maxOffsetHeavy = 12
  private readonly maxOffsetMedium = 8
  private readonly maxRoll = 0.12 // 0.05-0.12

  private basePosition = new THREE.Vector3()
  private baseRotation = new THREE.Euler()

  constructor(private camera: THREE.Camera) {
    this.basePosition.copy(camera.position)
    this.baseRotation.copy(camera.rotation)
  }

  // game-feel: trauma 0.15/0.4/0.8 decay1.2
  addTrauma(v: number): void {
    // NEVER trauma sans deadzone — check distance in caller
    this.trauma = Math.min(1, this.trauma + v)
  }

  // call each frame before render — LateUpdate revert
  update(dt: number, rootPos: THREE.Vector3): void {
    if (this.trauma < 0.01) {
      this.trauma = 0
      this.camera.position.copy(this.basePosition)
      this.camera.rotation.set(this.baseRotation.x, this.baseRotation.y, this.baseRotation.z)
      return
    }

    // deadzone 0.8m autour Root — NEVER shake si proche
    const dist = this.camera.position.distanceTo(rootPos)
    if (dist < this.deadzone) {
      this.trauma = Math.max(0, this.trauma - dt * this.decay * 2)
      return
    }

    const isHeavy = this.trauma > 0.3
    const maxOffset = isHeavy ? this.maxOffsetHeavy : this.maxOffsetMedium

    // shake_offset = max_offset * trauma*trauma (GDC) — trauma², trauma³ anti-nausée top-down
    const shake = this.trauma * this.trauma
    const offsetX = (Math.random() - 0.5) * maxOffset * shake * 0.01
    const offsetY = (Math.random() - 0.5) * maxOffset * shake * 0.01
    const roll = (Math.random() - 0.5) * this.maxRoll * shake

    this.camera.position.set(this.basePosition.x + offsetX, this.basePosition.y + offsetY, this.basePosition.z)
    this.camera.rotation.z = this.baseRotation.z + roll

    this.trauma = Math.max(0, this.trauma - dt * this.decay)
  }

  setBase(pos: THREE.Vector3, rot: THREE.Euler): void {
    this.basePosition.copy(pos)
    this.baseRotation.copy(rot)
  }

  get currentTrauma(): number {
    return this.trauma
  }
}

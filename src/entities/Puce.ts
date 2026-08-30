import * as THREE from 'three'

// Puce SMD on Motherboard with glowing heating circle (2.5m radius)
// Tracks independent heating progress (0..1) with non-linear free-order canalisation

export class Puce {
  public readonly id: number
  public readonly x: number
  public readonly z: number
  public readonly radius = 2.5 // 2.5m heating circle
  public readonly group: THREE.Group

  public progress = 0.0 // 0..1 (3.5s total canalisation)
  public isHeated = false
  public isPlayerInside = false

  private chipMesh: THREE.Mesh
  private circleMesh: THREE.Mesh
  private ringMaterial: THREE.MeshBasicMaterial
  private chipMaterial: THREE.MeshLambertMaterial

  constructor(scene: THREE.Scene, id: number, x: number, z: number) {
    this.id = id
    this.x = x
    this.z = z
    this.group = new THREE.Group()
    this.group.position.set(x, 0, z)

    // 1. SMD Black Silicon Chip Body (12 tris low-poly box)
    const chipGeo = new THREE.BoxGeometry(1.6, 0.35, 1.6)
    this.chipMaterial = new THREE.MeshLambertMaterial({
      color: 0x1a1a1a,
      flatShading: true,
    })
    this.chipMesh = new THREE.Mesh(chipGeo, this.chipMaterial)
    this.chipMesh.position.y = 0.175
    this.chipMesh.castShadow = true
    this.chipMesh.receiveShadow = true
    this.group.add(this.chipMesh)

    // Silver Chip Lead Pins (4 on each of the 4 sides)
    const pinGeo = new THREE.BoxGeometry(0.12, 0.08, 0.25)
    const pinMat = new THREE.MeshLambertMaterial({ color: 0xcccccc, flatShading: true })
    for (let i = -1; i <= 1; i += 0.66) {
      const pinN = new THREE.Mesh(pinGeo, pinMat)
      pinN.position.set(i * 0.6, 0.04, -0.88)
      const pinS = new THREE.Mesh(pinGeo, pinMat)
      pinS.position.set(i * 0.6, 0.04, 0.88)
      this.group.add(pinN, pinS)
    }

    // 2. Ground Heating Zone (2.5m Radius Neon Circle)
    const circleGeo = new THREE.RingGeometry(2.35, 2.5, 32)
    circleGeo.rotateX(-Math.PI / 2)
    this.ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x3388ff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.circleMesh = new THREE.Mesh(circleGeo, this.ringMaterial)
    this.circleMesh.position.y = 0.02
    this.group.add(this.circleMesh)

    // Inner Fill Arc indicator
    const fillGeo = new THREE.CircleGeometry(2.35, 32)
    fillGeo.rotateX(-Math.PI / 2)
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0xff3322,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    })
    const fill = new THREE.Mesh(fillGeo, fillMat)
    fill.position.y = 0.015
    this.group.add(fill)

    scene.add(this.group)
  }

  update(dt: number, isInside: boolean): boolean {
    if (this.isHeated) return false

    this.isPlayerInside = isInside

    if (isInside) {
      // Heat up (3.5s to reach 100%)
      this.progress += dt / 3.5
      const heatFactor = Math.min(1.0, this.progress)

      // Color shift from cold blue to fiery red/orange
      this.ringMaterial.color.setRGB(0.2 + 0.8 * heatFactor, 0.5 * (1 - heatFactor), 1.0 - heatFactor)
      this.ringMaterial.opacity = 0.7 + Math.sin(Date.now() * 0.012) * 0.25

      // Glow the chip
      this.chipMaterial.color.setRGB(0.1 + 0.6 * heatFactor, 0.1, 0.1)

      if (this.progress >= 1.0) {
        this.isHeated = true
        this.progress = 1.0
        this.ringMaterial.color.setHex(0x00ff88)
        this.ringMaterial.opacity = 0.2
        return true // Trigger BOOM
      }
    } else {
      // Freeze on exit (Poncle rule: zero decay!)
      this.ringMaterial.opacity = 0.4
    }

    return false
  }
}

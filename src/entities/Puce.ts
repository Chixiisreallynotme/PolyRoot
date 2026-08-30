import * as THREE from 'three'

// Puce SMD on Motherboard with glowing heating circle and charred burned visual on explosion

export class Puce {
  public readonly id: number
  public readonly x: number
  public readonly z: number
  public readonly radius = 2.5
  public readonly group: THREE.Group

  public progress = 0.0
  public isHeated = false
  public isPlayerInside = false

  private chipMesh: THREE.Mesh
  private circleMesh: THREE.Mesh
  private ringMaterial: THREE.MeshBasicMaterial
  private chipMaterial: THREE.MeshLambertMaterial
  private glowMesh: THREE.Mesh

  constructor(scene: THREE.Scene, id: number, x: number, z: number) {
    this.id = id
    this.x = x
    this.z = z
    this.group = new THREE.Group()
    this.group.position.set(x, 0, z)

    // 1. SMD Black Silicon Chip Body
    const chipGeo = new THREE.BoxGeometry(1.8, 0.4, 1.8)
    this.chipMaterial = new THREE.MeshLambertMaterial({
      color: 0x181818,
      flatShading: true,
    })
    this.chipMesh = new THREE.Mesh(chipGeo, this.chipMaterial)
    this.chipMesh.position.y = 0.2
    this.chipMesh.castShadow = true
    this.chipMesh.receiveShadow = true
    this.group.add(this.chipMesh)

    // Glowing core heat indicator on chip top
    const glowGeo = new THREE.BoxGeometry(1.2, 0.05, 1.2)
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 })
    this.glowMesh = new THREE.Mesh(glowGeo, glowMat)
    this.glowMesh.position.y = 0.42
    this.group.add(this.glowMesh)

    // Silver Chip Lead Pins (QFP style on 4 sides)
    const pinGeo = new THREE.BoxGeometry(0.14, 0.08, 0.3)
    const pinMat = new THREE.MeshLambertMaterial({ color: 0xd8dde4, flatShading: true })
    for (let i = -1; i <= 1; i += 0.66) {
      const pinN = new THREE.Mesh(pinGeo, pinMat)
      pinN.position.set(i * 0.65, 0.05, -0.98)
      const pinS = new THREE.Mesh(pinGeo, pinMat)
      pinS.position.set(i * 0.65, 0.05, 0.98)
      this.group.add(pinN, pinS)
    }

    // 2. Ground Heating Zone Ring
    const circleGeo = new THREE.RingGeometry(2.35, 2.5, 32)
    circleGeo.rotateX(-Math.PI / 2)
    this.ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.circleMesh = new THREE.Mesh(circleGeo, this.ringMaterial)
    this.circleMesh.position.y = 0.02
    this.group.add(this.circleMesh)

    scene.add(this.group)
  }

  update(dt: number, isInside: boolean): boolean {
    if (this.isHeated) return false

    this.isPlayerInside = isInside

    if (isInside) {
      this.progress += dt / 3.2
      const heatFactor = Math.min(1.0, this.progress)

      // Ring shifts from green to intense fiery orange/red
      this.ringMaterial.color.setRGB(heatFactor, 1.0 - heatFactor * 0.5, 1.0 - heatFactor)
      this.ringMaterial.opacity = 0.75 + Math.sin(Date.now() * 0.015) * 0.25

      // Glow pulse on the chip top
      const glowMat = this.glowMesh.material as THREE.MeshBasicMaterial
      glowMat.color.setRGB(1.0, 0.3 + 0.7 * (1.0 - heatFactor), 0.0)
      glowMat.opacity = 0.6 + heatFactor * 0.4

      if (this.progress >= 1.0) {
        this.isHeated = true
        this.progress = 1.0
        // Charred burned appearance upon explosion
        this.chipMaterial.color.setHex(0x050505)
        this.ringMaterial.color.setHex(0x334155)
        this.ringMaterial.opacity = 0.2
        glowMat.color.setHex(0x111111)
        glowMat.opacity = 0.1
        return true
      }
    } else {
      this.ringMaterial.opacity = 0.4
    }

    return false
  }
}

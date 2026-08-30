import * as THREE from 'three'

// via threejs-materials: MeshLambert flatShading ONLY — Puce 12 tris
// A2 HELP ME binary face — 01001000 01000101 01001100 01010000 00100000 01001101 01000101

export interface PuceState {
  id: number
  x: number
  z: number
  radius: number
  heatProgress: number // 0 to 3.5 seconds
  heatTarget: number // 3.5s
  isExploded: boolean
  isActive: boolean
}

export class Puce {
  public readonly group: THREE.Group
  public readonly mesh: THREE.Mesh
  public readonly ringMesh: THREE.Mesh
  public state: PuceState

  constructor(scene: THREE.Scene, id: number, x: number, z: number) {
    this.group = new THREE.Group()
    this.group.position.set(x, 0, z)

    this.state = {
      id,
      x,
      z,
      radius: 2.5,
      heatProgress: 0,
      heatTarget: 3.5,
      isExploded: false,
      isActive: false,
    }

    // Puce box geometry — 12 tris low-poly
    const boxGeo = new THREE.BoxGeometry(1.4, 0.35, 1.4)
    const boxMat = new THREE.MeshLambertMaterial({
      color: 0x1a1a1a,
      emissive: 0x330000,
      emissiveIntensity: 0.2,
      flatShading: true,
    })
    this.mesh = new THREE.Mesh(boxGeo, boxMat)
    this.mesh.position.y = 0.18
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.group.add(this.mesh)

    // Visual ring on ground for heating circle (2.5m radius)
    const ringGeo = new THREE.RingGeometry(2.3, 2.5, 32)
    ringGeo.rotateX(-Math.PI / 2)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff3322,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat)
    this.ringMesh.position.y = 0.02
    this.group.add(this.ringMesh)

    scene.add(this.group)
  }

  updateVisuals(isHeating: boolean, dt: number): void {
    if (this.state.isExploded) {
      this.group.visible = false
      return
    }

    const progressRatio = this.state.heatProgress / this.state.heatTarget
    const mat = this.mesh.material as THREE.MeshLambertMaterial

    if (isHeating) {
      // Pulse red glow when player is canalising
      const pulse = 0.5 + Math.sin(Date.now() * 0.01) * 0.5
      mat.emissive.setHex(0xff2200)
      mat.emissiveIntensity = 0.4 + pulse * 0.6 * progressRatio
      const ringMat = this.ringMesh.material as THREE.MeshBasicMaterial
      ringMat.opacity = 0.6 + pulse * 0.4
      ringMat.color.setHex(0xffaa00)
    } else {
      mat.emissive.setHex(0x330000)
      mat.emissiveIntensity = 0.2
      const ringMat = this.ringMesh.material as THREE.MeshBasicMaterial
      ringMat.opacity = 0.25
      ringMat.color.setHex(0xff2200)
    }
  }

  explode(): void {
    this.state.isExploded = true
    this.group.visible = false
  }

  reset(x: number, z: number): void {
    this.state.x = x
    this.state.z = z
    this.state.heatProgress = 0
    this.state.isExploded = false
    this.state.isActive = false
    this.group.position.set(x, 0, z)
    this.group.visible = true
  }
}

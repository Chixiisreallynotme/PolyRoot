import * as THREE from 'three'
import { RubberHoseRig } from '../render/RubberHoseRig'
import { RootTextureGenerator } from './RootTextureGenerator'

// Root: Iconic orange chibi mascot (media_1788110401238.png & media_1788110314292.png)
// Smooth spherical chibi head, massive glossy anime/chibi eyes with double specular reflections,
// happy open mouth with pink tongue, orange chibi body with ✌️ peace sign victory fingers.

export class Root {
  public readonly group: THREE.Group
  public readonly bodyGroup: THREE.Group
  public readonly headGroup: THREE.Group
  public readonly mesh: THREE.Mesh
  public readonly rig: RubberHoseRig

  private leftLeg: THREE.Group
  private rightLeg: THREE.Group
  private leftArm: THREE.Group
  private rightArm: THREE.Group
  private blinkTimer = 0
  private isWinking = false

  constructor() {
    this.group = new THREE.Group()
    this.bodyGroup = new THREE.Group()
    this.group.add(this.bodyGroup)

    const orangeMat = new THREE.MeshLambertMaterial({ color: 0xff6b22, flatShading: true })
    const darkOrangeMat = new THREE.MeshLambertMaterial({ color: 0xd94e0b, flatShading: true })
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true })
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true })

    // 1. Torso / Body (Smooth rounded orange chibi bean)
    const bodyGeo = new THREE.CylinderGeometry(0.32, 0.42, 0.62, 12)
    const body = new THREE.Mesh(bodyGeo, orangeMat)
    body.position.y = 0.62
    body.castShadow = true
    body.receiveShadow = true
    this.bodyGroup.add(body)
    this.mesh = body

    // 2. Head Group (Large expressive spherical chibi head)
    this.headGroup = new THREE.Group()
    this.headGroup.position.set(0, 1.22, 0)
    // Upward camera tilt (~20 degrees) so the face looks directly into the top-down camera
    this.headGroup.rotation.x = -0.22

    // Spherical head base
    const headGeo = new THREE.SphereGeometry(0.62, 16, 16)
    const headMesh = new THREE.Mesh(headGeo, orangeMat)
    headMesh.castShadow = true
    this.headGroup.add(headMesh)

    // Textured Front Face Plate (Curved circle plate with high-res face art)
    const faceTex = RootTextureGenerator.createFaceTexture()
    const faceMat = new THREE.MeshLambertMaterial({
      map: faceTex,
      color: 0xffffff,
      transparent: true,
    })
    const faceGeo = new THREE.CircleGeometry(0.60, 20)
    faceGeo.translate(0, 0, 0.45)
    const facePlate = new THREE.Mesh(faceGeo, faceMat)
    facePlate.position.set(0, 0, 0.16)
    this.headGroup.add(facePlate)

    this.bodyGroup.add(this.headGroup)

    // 3. Left Leg & Rounded Orange Chibi Foot
    this.leftLeg = new THREE.Group()
    this.leftLeg.position.set(-0.22, 0.34, 0)
    const limbGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.38, 8)
    const leftLegMesh = new THREE.Mesh(limbGeo, orangeMat)
    leftLegMesh.position.y = -0.15
    this.leftLeg.add(leftLegMesh)

    const footGeo = new THREE.SphereGeometry(0.18, 8, 8)
    footGeo.scale(1.0, 0.75, 1.4)
    const leftFoot = new THREE.Mesh(footGeo, darkOrangeMat)
    leftFoot.position.set(0, -0.32, 0.08)
    leftFoot.castShadow = true
    this.leftLeg.add(leftFoot)
    this.bodyGroup.add(this.leftLeg)

    // 4. Right Leg & Foot
    this.rightLeg = new THREE.Group()
    this.rightLeg.position.set(0.22, 0.34, 0)
    const rightLegMesh = new THREE.Mesh(limbGeo, orangeMat)
    rightLegMesh.position.y = -0.15
    this.rightLeg.add(rightLegMesh)

    const rightFoot = new THREE.Mesh(footGeo, darkOrangeMat)
    rightFoot.position.set(0, -0.32, 0.08)
    rightFoot.castShadow = true
    this.rightLeg.add(rightFoot)
    this.bodyGroup.add(this.rightLeg)

    // 5. Left Arm & Orange Chibi Hand
    this.leftArm = new THREE.Group()
    this.leftArm.position.set(-0.46, 0.82, 0)
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.38, 8)
    const leftArmMesh = new THREE.Mesh(armGeo, orangeMat)
    leftArmMesh.position.y = -0.18
    this.leftArm.add(leftArmMesh)

    const handGeo = new THREE.SphereGeometry(0.15, 8, 8)
    const leftHand = new THREE.Mesh(handGeo, orangeMat)
    leftHand.position.set(0, -0.36, 0)
    leftHand.castShadow = true
    this.leftArm.add(leftHand)
    this.bodyGroup.add(this.leftArm)

    // 6. Right Arm with ✌️ Peace Sign Fingers (Matching avatar pose in media_1788110401238.png)
    this.rightArm = new THREE.Group()
    this.rightArm.position.set(0.46, 0.82, 0)
    const rightArmMesh = new THREE.Mesh(armGeo, orangeMat)
    rightArmMesh.position.y = -0.18
    this.rightArm.add(rightArmMesh)

    const rightHand = new THREE.Mesh(handGeo, orangeMat)
    rightHand.position.set(0, -0.36, 0)
    rightHand.castShadow = true
    this.rightArm.add(rightHand)

    // ✌️ Peace Sign Fingers (Index & Middle)
    const fingerGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.22, 6)
    const finger1 = new THREE.Mesh(fingerGeo, orangeMat)
    finger1.rotation.z = 0.28
    finger1.position.set(-0.06, -0.48, 0.06)

    const finger2 = new THREE.Mesh(fingerGeo, orangeMat)
    finger2.rotation.z = -0.28
    finger2.position.set(0.06, -0.48, 0.06)

    // Thumb
    const thumbGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 6)
    const thumb = new THREE.Mesh(thumbGeo, orangeMat)
    thumb.rotation.x = Math.PI / 3
    thumb.position.set(0, -0.38, 0.12)

    this.rightArm.add(finger1, finger2, thumb)
    this.bodyGroup.add(this.rightArm)

    // Initialize Rubber-Hose Rig
    this.rig = new RubberHoseRig({
      body: this.bodyGroup,
      leftLeg: this.leftLeg,
      rightLeg: this.rightLeg,
      leftArm: this.leftArm,
      rightArm: this.rightArm,
      baseScaleY: 1.0,
      bounceSpeed: 14.0,
    })
  }

  update(dt: number, velocity: { x: number; z: number }, isDashing = false): void {
    this.rig.update(dt, velocity, isDashing)

    // Natural subtle head bobbing & camera tilt
    const speedLen = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
    if (speedLen > 0.1) {
      this.headGroup.rotation.z = Math.sin(Date.now() * 0.015) * 0.1
      this.headGroup.rotation.x = -0.22 + Math.sin(Date.now() * 0.02) * 0.05
    } else {
      this.headGroup.rotation.z = Math.sin(Date.now() * 0.003) * 0.04
      this.headGroup.rotation.x = -0.22 + Math.sin(Date.now() * 0.005) * 0.03
    }
  }

  lookAtCamera(duration = 0.18): void {
    console.log('[4th-wall] lookAt — Root salut la caméra avec son peace sign ✌️')
    this.headGroup.scale.set(1.1, 1.1, 1.1)
    setTimeout(() => {
      this.headGroup.scale.set(1.0, 1.0, 1.0)
    }, duration * 1000)
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }
}

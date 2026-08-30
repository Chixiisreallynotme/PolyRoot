import * as THREE from 'three'
import { RubberHoseRig } from '../render/RubberHoseRig'

// Root: Iconic orange chibi 3D mascot (media_1788110401238.png & media_1788110314292.png)
// 100% Volumetric 3D Geometry: Spherical chibi skull, inset 3D anime eyes with double spherical
// white glossy highlights, recessed 3D mouth with pink tongue, and 3D sculpted peace sign ✌️ fingers.

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
  private leftEyeGroup: THREE.Group
  private rightEyeGroup: THREE.Group
  private blinkTimer = 0

  constructor() {
    this.group = new THREE.Group()
    this.bodyGroup = new THREE.Group()
    this.group.add(this.bodyGroup)

    const orangeMat = new THREE.MeshLambertMaterial({ color: 0xff3d00, flatShading: true })
    const darkOrangeMat = new THREE.MeshLambertMaterial({ color: 0xbf1b00, flatShading: true })
    const peachMat = new THREE.MeshLambertMaterial({ color: 0xff7043, flatShading: true })
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true })
    const eyeBlackMat = new THREE.MeshLambertMaterial({ color: 0x070a10, flatShading: true })
    const mouthBlackMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true })
    const tonguePinkMat = new THREE.MeshLambertMaterial({ color: 0xfb7185, flatShading: true })

    // 1. Torso / Body (Smooth rounded orange chibi bean)
    const bodyGeo = new THREE.CylinderGeometry(0.32, 0.42, 0.62, 14)
    const body = new THREE.Mesh(bodyGeo, orangeMat)
    body.position.y = 0.62
    body.castShadow = true
    body.receiveShadow = true
    this.bodyGroup.add(body)
    this.mesh = body

    // Dark orange collar ring
    const collarGeo = new THREE.TorusGeometry(0.32, 0.04, 6, 16)
    collarGeo.rotateX(Math.PI / 2)
    const collar = new THREE.Mesh(collarGeo, darkOrangeMat)
    collar.position.y = 0.92
    this.bodyGroup.add(collar)

    // 2. Head Group (Volumetric spherical chibi skull)
    this.headGroup = new THREE.Group()
    this.headGroup.position.set(0, 1.26, 0)
    // 20-degree upward tilt to look straight into isometric camera
    this.headGroup.rotation.x = -0.22

    // Spherical head
    const headGeo = new THREE.SphereGeometry(0.58, 20, 20)
    const headMesh = new THREE.Mesh(headGeo, orangeMat)
    headMesh.castShadow = true
    this.headGroup.add(headMesh)

    // 3D Peach Cheek Blushes
    const cheekGeo = new THREE.SphereGeometry(0.12, 8, 8)
    cheekGeo.scale(1.0, 0.6, 0.4)
    const cheekL = new THREE.Mesh(cheekGeo, peachMat)
    cheekL.position.set(-0.36, -0.06, 0.42)
    const cheekR = new THREE.Mesh(cheekGeo, peachMat)
    cheekR.position.set(0.36, -0.06, 0.42)
    this.headGroup.add(cheekL, cheekR)

    // 3. Volumetric 3D Chibi Eyes (Matching media_1788110401238.png)
    const create3DEye = (isLeft: boolean): THREE.Group => {
      const eyeGroup = new THREE.Group()
      const eyeX = isLeft ? -0.20 : 0.20
      eyeGroup.position.set(eyeX, 0.04, 0.48)
      eyeGroup.rotation.y = isLeft ? -0.12 : 0.12
      eyeGroup.rotation.z = isLeft ? 0.05 : -0.05

      // Outer Black Eyeliner / Iris Base
      const irisGeo = new THREE.SphereGeometry(0.20, 12, 12)
      irisGeo.scale(0.85, 1.25, 0.35)
      const iris = new THREE.Mesh(irisGeo, eyeBlackMat)
      eyeGroup.add(iris)

      // Large Glossy White Highlight Bubble (Top-Left)
      const bigBubbleGeo = new THREE.SphereGeometry(0.075, 10, 10)
      const bigBubble = new THREE.Mesh(bigBubbleGeo, whiteMat)
      bigBubble.position.set(-0.06, 0.08, 0.09)
      eyeGroup.add(bigBubble)

      // Small Secondary Specular Bubble (Bottom-Right)
      const smallBubbleGeo = new THREE.SphereGeometry(0.04, 8, 8)
      const smallBubble = new THREE.Mesh(smallBubbleGeo, whiteMat)
      smallBubble.position.set(0.07, -0.07, 0.09)
      eyeGroup.add(smallBubble)

      return eyeGroup
    }

    this.leftEyeGroup = create3DEye(true)
    this.rightEyeGroup = create3DEye(false)
    this.headGroup.add(this.leftEyeGroup, this.rightEyeGroup)

    // 4. Volumetric 3D Open Mouth & Pink Tongue
    const mouthGroup = new THREE.Group()
    mouthGroup.position.set(0, -0.20, 0.52)

    // Recessed mouth cavity
    const mouthGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.06, 12)
    mouthGeo.rotateX(Math.PI / 2)
    mouthGeo.scale(1.1, 0.75, 1.0)
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthBlackMat)
    mouthGroup.add(mouthMesh)

    // 3D Pink Tongue
    const tongueGeo = new THREE.SphereGeometry(0.08, 8, 8)
    tongueGeo.scale(1.1, 0.5, 0.8)
    const tongueMesh = new THREE.Mesh(tongueGeo, tonguePinkMat)
    tongueMesh.position.set(0, -0.04, 0.03)
    mouthGroup.add(tongueMesh)

    this.headGroup.add(mouthGroup)
    this.bodyGroup.add(this.headGroup)

    // 5. Left Leg & Rounded Orange Chibi Foot
    this.leftLeg = new THREE.Group()
    this.leftLeg.position.set(-0.22, 0.34, 0)
    const limbGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.38, 8)
    const leftLegMesh = new THREE.Mesh(limbGeo, orangeMat)
    leftLegMesh.position.y = -0.15
    this.leftLeg.add(leftLegMesh)

    const footGeo = new THREE.SphereGeometry(0.18, 10, 10)
    footGeo.scale(1.0, 0.75, 1.4)
    const leftFoot = new THREE.Mesh(footGeo, darkOrangeMat)
    leftFoot.position.set(0, -0.32, 0.08)
    leftFoot.castShadow = true
    this.leftLeg.add(leftFoot)
    this.bodyGroup.add(this.leftLeg)

    // 6. Right Leg & Foot
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

    // 7. Left Arm & Hand
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

    // 8. Right Arm with 3D Peace Sign ✌️ Fingers (Matching media_1788110401238.png)
    this.rightArm = new THREE.Group()
    this.rightArm.position.set(0.46, 0.82, 0)
    const rightArmMesh = new THREE.Mesh(armGeo, orangeMat)
    rightArmMesh.position.y = -0.18
    this.rightArm.add(rightArmMesh)

    const rightHand = new THREE.Mesh(handGeo, orangeMat)
    rightHand.position.set(0, -0.36, 0)
    rightHand.castShadow = true
    this.rightArm.add(rightHand)

    // Index & Middle Peace Fingers (3D Cylinders with Spherical Tips)
    const fingerGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.22, 8)
    const tipGeo = new THREE.SphereGeometry(0.038, 6, 6)

    const fingerLGroup = new THREE.Group()
    fingerLGroup.position.set(-0.06, -0.48, 0.06)
    fingerLGroup.rotation.z = 0.28
    const fingerLMesh = new THREE.Mesh(fingerGeo, orangeMat)
    const tipLMesh = new THREE.Mesh(tipGeo, orangeMat)
    tipLMesh.position.y = 0.11
    fingerLGroup.add(fingerLMesh, tipLMesh)

    const fingerRGroup = new THREE.Group()
    fingerRGroup.position.set(0.06, -0.48, 0.06)
    fingerRGroup.rotation.z = -0.28
    const fingerRMesh = new THREE.Mesh(fingerGeo, orangeMat)
    const tipRMesh = new THREE.Mesh(tipGeo, orangeMat)
    tipRMesh.position.y = 0.11
    fingerRGroup.add(fingerRMesh, tipRMesh)

    // Thumb
    const thumbGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 6)
    const thumb = new THREE.Mesh(thumbGeo, orangeMat)
    thumb.rotation.x = Math.PI / 3
    thumb.position.set(0, -0.38, 0.12)

    this.rightArm.add(fingerLGroup, fingerRGroup, thumb)
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

    // Subtle head bobbing & natural animation
    const speedLen = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
    if (speedLen > 0.1) {
      this.headGroup.rotation.z = Math.sin(Date.now() * 0.015) * 0.1
      this.headGroup.rotation.x = -0.22 + Math.sin(Date.now() * 0.02) * 0.05
    } else {
      this.headGroup.rotation.z = Math.sin(Date.now() * 0.003) * 0.04
      this.headGroup.rotation.x = -0.22 + Math.sin(Date.now() * 0.005) * 0.03
    }

    // Procedural blink
    this.blinkTimer += dt
    if (this.blinkTimer > 3.4) {
      this.leftEyeGroup.scale.y = 0.15
      this.rightEyeGroup.scale.y = 0.15
      if (this.blinkTimer > 3.55) {
        this.leftEyeGroup.scale.y = 1.0
        this.rightEyeGroup.scale.y = 1.0
        this.blinkTimer = 0
      }
    }
  }

  lookAtCamera(duration = 0.18): void {
    console.log('[4th-wall] lookAt — Root salue la caméra avec son peace sign ✌️')
    this.headGroup.scale.set(1.1, 1.1, 1.1)
    setTimeout(() => {
      this.headGroup.scale.set(1.0, 1.0, 1.0)
    }, duration * 1000)
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }
}

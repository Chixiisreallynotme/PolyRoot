import * as THREE from 'three'
import { RubberHoseRig } from '../render/RubberHoseRig'

// via threejs-fundamentals: antialias false — via threejs-materials: MeshLambert flatShading ONLY
// Root low-poly character with 1930s Rubber-Hose cartoon animation (Cuphead/Mickey style)
// Orange #FF7A1A body, Blue #2A5BD7 contours and boots, White cartoon gloves ✌️

export class Root {
  public readonly group: THREE.Group
  public readonly bodyGroup: THREE.Group
  public readonly mesh: THREE.Mesh
  public readonly rig: RubberHoseRig

  private leftLeg: THREE.Group
  private rightLeg: THREE.Group
  private leftArm: THREE.Group
  private rightArm: THREE.Group
  private eyeLeft: THREE.Mesh
  private eyeRight: THREE.Mesh
  private blinkTimer = 0

  constructor() {
    this.group = new THREE.Group()
    this.bodyGroup = new THREE.Group()
    this.group.add(this.bodyGroup)

    const orangeMat = new THREE.MeshLambertMaterial({ color: 0xff7a1a, flatShading: true })
    const blueMat = new THREE.MeshLambertMaterial({ color: 0x2a5bd7, flatShading: true })
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf0f0f0, flatShading: true })
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x111111, flatShading: true })

    // 1. Torso / Body (Rounded low-poly bean shape)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.65, 8)
    const body = new THREE.Mesh(bodyGeo, orangeMat)
    body.position.y = 0.65
    body.castShadow = true
    body.receiveShadow = true
    this.bodyGroup.add(body)
    this.mesh = body

    // 2. Head (Large expressive cartoon head)
    const headGeo = new THREE.BoxGeometry(0.55, 0.58, 0.55)
    const head = new THREE.Mesh(headGeo, orangeMat)
    head.position.set(0, 1.18, 0)
    head.castShadow = true
    this.bodyGroup.add(head)

    // 3. Cute Cartoon Pie-Eyes
    const eyeGeo = new THREE.BoxGeometry(0.12, 0.16, 0.04)
    this.eyeLeft = new THREE.Mesh(eyeGeo, blackMat)
    this.eyeLeft.position.set(-0.14, 1.22, 0.29)
    this.eyeRight = new THREE.Mesh(eyeGeo, blackMat)
    this.eyeRight.position.set(0.14, 1.22, 0.29)
    this.bodyGroup.add(this.eyeLeft, this.eyeRight)

    // White eye reflections
    const pupilGeo = new THREE.BoxGeometry(0.04, 0.05, 0.05)
    const pupilL = new THREE.Mesh(pupilGeo, whiteMat)
    pupilL.position.set(-0.12, 1.25, 0.3)
    const pupilR = new THREE.Mesh(pupilGeo, whiteMat)
    pupilR.position.set(0.16, 1.25, 0.3)
    this.bodyGroup.add(pupilL, pupilR)

    // 4. Cheerful Smile & Blue Cheeks
    const smileGeo = new THREE.BoxGeometry(0.24, 0.04, 0.02)
    const smile = new THREE.Mesh(smileGeo, blackMat)
    smile.position.set(0, 1.05, 0.29)
    this.bodyGroup.add(smile)

    // 5. Left Leg & Oversized Cartoon Boot
    this.leftLeg = new THREE.Group()
    this.leftLeg.position.set(-0.2, 0.35, 0)
    const limbGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 6)
    const leftLegMesh = new THREE.Mesh(limbGeo, orangeMat)
    leftLegMesh.position.y = -0.15
    this.leftLeg.add(leftLegMesh)

    const bootGeo = new THREE.BoxGeometry(0.22, 0.18, 0.36)
    const leftBoot = new THREE.Mesh(bootGeo, blueMat)
    leftBoot.position.set(0, -0.32, 0.06)
    leftBoot.castShadow = true
    this.leftLeg.add(leftBoot)
    this.bodyGroup.add(this.leftLeg)

    // 6. Right Leg & Boot
    this.rightLeg = new THREE.Group()
    this.rightLeg.position.set(0.2, 0.35, 0)
    const rightLegMesh = new THREE.Mesh(limbGeo, orangeMat)
    rightLegMesh.position.y = -0.15
    this.rightLeg.add(rightLegMesh)

    const rightBoot = new THREE.Mesh(bootGeo, blueMat)
    rightBoot.position.set(0, -0.32, 0.06)
    rightBoot.castShadow = true
    this.rightLeg.add(rightBoot)
    this.bodyGroup.add(this.rightLeg)

    // 7. Left Arm & White Cartoon Glove
    this.leftArm = new THREE.Group()
    this.leftArm.position.set(-0.45, 0.82, 0)
    const armGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.38, 6)
    const leftArmMesh = new THREE.Mesh(armGeo, orangeMat)
    leftArmMesh.position.y = -0.18
    this.leftArm.add(leftArmMesh)

    const gloveGeo = new THREE.SphereGeometry(0.14, 6, 6)
    const leftGlove = new THREE.Mesh(gloveGeo, whiteMat)
    leftGlove.position.set(0, -0.38, 0)
    leftGlove.castShadow = true
    this.leftArm.add(leftGlove)
    this.bodyGroup.add(this.leftArm)

    // 8. Right Arm & White Glove with ✌️ Victory Sign
    this.rightArm = new THREE.Group()
    this.rightArm.position.set(0.45, 0.82, 0)
    const rightArmMesh = new THREE.Mesh(armGeo, orangeMat)
    rightArmMesh.position.y = -0.18
    this.rightArm.add(rightArmMesh)

    const rightGlove = new THREE.Mesh(gloveGeo, whiteMat)
    rightGlove.position.set(0, -0.38, 0)
    rightGlove.castShadow = true
    this.rightArm.add(rightGlove)

    // ✌️ Victory Two Fingers
    const fingerGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.16, 4)
    const finger1 = new THREE.Mesh(fingerGeo, whiteMat)
    finger1.rotation.z = 0.25
    finger1.position.set(-0.04, -0.5, 0.02)
    const finger2 = new THREE.Mesh(fingerGeo, whiteMat)
    finger2.rotation.z = -0.25
    finger2.position.set(0.04, -0.5, 0.02)
    this.rightArm.add(finger1, finger2)
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

    // Procedural blink cycle
    this.blinkTimer += dt
    if (this.blinkTimer > 3.2) {
      this.eyeLeft.scale.y = 0.1
      this.eyeRight.scale.y = 0.1
      if (this.blinkTimer > 3.35) {
        this.eyeLeft.scale.y = 1.0
        this.eyeRight.scale.y = 1.0
        this.blinkTimer = 0
      }
    }
  }

  lookAtCamera(duration = 0.18): void {
    console.log('[4th-wall] lookAt — Tu crois que c\'est juste une carte mère ?')
    this.eyeLeft.scale.y = 0.1 // wink
    setTimeout(() => {
      this.eyeLeft.scale.y = 1.0
    }, duration * 1000)
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }
}

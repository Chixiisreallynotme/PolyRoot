import * as THREE from 'three'

/**
 * CyberLeekRig — Dedicated skeletal and procedural animation rig for Boss Tactical CyberLeek.
 * 
 * 100% faithful to character concept & artwork:
 * 1. Leaner, curved stalk head with 3 swept-back green leaves and angular sunglasses.
 * 2. Articulated segmented forearms/gauntlets with elbow joints and glowing cyan cuffs.
 * 3. Articulated knee plates and heavy combat boots.
 * 4. Dual-fist leap slam ground shockwave state machine (Crouch -> Ascent -> Overhead Hammer -> Impact).
 * 5. Asymmetrical disc windup & explosive fling throw animation with kinetic torso uncoiling.
 * 6. Procedural Sawtooth zig-zag leek crown transition and dynamic pulsating glowing cyan energy fists.
 */

export type CyberLeekAnimationState =
  | 'idle'
  | 'march'
  | 'sprint'
  | 'leap_crouch'
  | 'leap_airborne'
  | 'leap_slam'
  | 'disc_windup'
  | 'disc_throw'

export interface CyberLeekNodes {
  root: THREE.Group
  body: THREE.Group
  head: THREE.Group
  leaves: THREE.Object3D[]
  leftArm: THREE.Group
  rightArm: THREE.Group
  leftFist: THREE.Mesh
  rightFist: THREE.Mesh
  leftLeg: THREE.Group
  rightLeg: THREE.Group
  leftBoot: THREE.Mesh | THREE.Group
  rightBoot: THREE.Mesh | THREE.Group
  torso?: THREE.Group
  chestPlate?: THREE.Mesh
  cyanPiping?: THREE.Mesh[]
  collar?: THREE.Mesh
  sawtoothTransition?: THREE.Object3D
  glasses?: THREE.Group | THREE.Mesh
  mouth?: THREE.Mesh
  belt?: THREE.Group | THREE.Mesh
  leftPouch?: THREE.Mesh
  rightPouch?: THREE.Mesh
  leftKnee?: THREE.Mesh | THREE.Group
  rightKnee?: THREE.Mesh | THREE.Group
  leftElbow?: THREE.Group | THREE.Mesh
  rightElbow?: THREE.Group | THREE.Mesh
  leftForearm?: THREE.Group
  rightForearm?: THREE.Group
  leftCuff?: THREE.Mesh
  rightCuff?: THREE.Mesh
}

export interface CyberLeekRigConfig {
  baseScaleY: number
  idleBobSpeed: number
  idleBobAmount: number
  marchFrequency: number
  sprintFrequency: number
  leafWindSpeed: number
  leafWindStrength: number
  fistPulseSpeed: number
  fistPulseMinScale: number
  fistPulseMaxScale: number
  armSwingAngle: number
  legSwingAngle: number
}

export interface CyberLeekUpdateState {
  velocity?: { x: number; z: number }
  isMoving?: boolean
  isSprinting?: boolean
  speed?: number
  phase?: 1 | 2
}

export class CyberLeekRig {
  private config: CyberLeekRigConfig
  private animState: CyberLeekAnimationState = 'idle'
  private globalTime = 0
  private strideTime = 0
  private actionTime = 0
  private actionDuration = 0

  private currentSpeed = 0
  private currentLeanX = 0
  private squashY = 1.0
  private squashXZ = 1.0
  private impactSquashVelocity = 0

  private onActionCallback: (() => void) | null = null
  private onActionRelease: (() => void) | null = null
  private actionTriggered = false

  private leafBaseRotations: { x: number; z: number }[] = []

  constructor(public readonly nodes: CyberLeekNodes, config?: Partial<CyberLeekRigConfig>) {
    this.config = {
      baseScaleY: config?.baseScaleY ?? 1.0,
      idleBobSpeed: config?.idleBobSpeed ?? 3.2,
      idleBobAmount: config?.idleBobAmount ?? 0.05,
      marchFrequency: config?.marchFrequency ?? 9.5,
      sprintFrequency: config?.sprintFrequency ?? 15.0,
      leafWindSpeed: config?.leafWindSpeed ?? 4.5,
      leafWindStrength: config?.leafWindStrength ?? 0.28,
      fistPulseSpeed: config?.fistPulseSpeed ?? 7.5,
      fistPulseMinScale: config?.fistPulseMinScale ?? 0.88,
      fistPulseMaxScale: config?.fistPulseMaxScale ?? 1.25,
      armSwingAngle: config?.armSwingAngle ?? 0.72,
      legSwingAngle: config?.legSwingAngle ?? 0.82,
    }

    if (this.nodes.leaves) {
      for (const leaf of this.nodes.leaves) {
        this.leafBaseRotations.push({
          x: leaf.rotation.x,
          z: leaf.rotation.z,
        })
      }
    }
  }

  static createModel(): { group: THREE.Group; nodes: CyberLeekNodes } {
    const root = new THREE.Group()
    const body = new THREE.Group()
    root.add(body)

    const leafGreenMat = new THREE.MeshLambertMaterial({ color: 0x22c55e, flatShading: true })
    const sawtoothGreenMat = new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true })
    const stalkPaleMat = new THREE.MeshLambertMaterial({ color: 0xdcfce7, flatShading: true })
    const cobaltBlueMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8, flatShading: true })
    const darkNavyMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true })
    const cyanPipingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const blackGlassesMat = new THREE.MeshLambertMaterial({ color: 0x050505, flatShading: true })
    const cyanLensMat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    const energyFistMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const bootSoleMat = new THREE.MeshLambertMaterial({ color: 0x090d16, flatShading: true })

    // ==========================================
    // 1. LEANER, CURVED STALK HEAD & SWEPT-BACK LEAVES
    // ==========================================
    const headGroup = new THREE.Group()
    headGroup.position.y = 3.6
    body.add(headGroup)

    // Leaner, tapered & curved stalk geometry
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.70, 2.0, 12), stalkPaleMat)
    stalk.position.set(0, 0, 0.05)
    stalk.rotation.x = -0.06
    stalk.castShadow = true
    headGroup.add(stalk)

    // Procedural Sawtooth / Crown Transition at top of stalk
    const sawtoothGeo = CyberLeekRig.createSawtoothGeometry(0.68, 0.58, 0.40, 10)
    const sawtoothTransition = new THREE.Mesh(sawtoothGeo, sawtoothGreenMat)
    sawtoothTransition.position.set(0, 0.95, 0.08)
    sawtoothTransition.rotation.x = -0.06
    sawtoothTransition.castShadow = true
    headGroup.add(sawtoothTransition)

    // Angular Sunglasses (Angular frame with beveled side wings + cyan reflective lenses)
    const glassesGroup = new THREE.Group()
    glassesGroup.position.set(0, 0.18, 0.68)
    glassesGroup.rotation.x = -0.06
    headGroup.add(glassesGroup)

    const glassesCenter = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.32, 0.22), blackGlassesMat)
    glassesGroup.add(glassesCenter)

    // Angled wing temples
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.22), blackGlassesMat)
    wingL.position.set(-0.68, 0, -0.08)
    wingL.rotation.y = -0.42
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.22), blackGlassesMat)
    wingR.position.set(0.68, 0, -0.08)
    wingR.rotation.y = 0.42
    glassesGroup.add(wingL, wingR)

    // Angular Cyan Lenses
    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.06), cyanLensMat)
    lensL.position.set(-0.34, 0, 0.12)
    const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.06), cyanLensMat)
    lensR.position.set(0.34, 0, 0.12)
    glassesGroup.add(lensL, lensR)

    // Smirk mouth
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.08), cobaltBlueMat)
    mouth.position.set(0, -0.35, 0.66)
    headGroup.add(mouth)

    // 3 Swept-Back Green Foliage Leaves
    const leaves: THREE.Object3D[] = []
    const leafOffsets = [
      { angleX: -0.72, angleZ: 0.38, len: 3.4, y: 1.15, radiusTop: 0.12, radiusBottom: 0.28 },
      { angleX: -0.92, angleZ: 0.0, len: 4.0, y: 1.35, radiusTop: 0.14, radiusBottom: 0.32 },
      { angleX: -0.72, angleZ: -0.38, len: 3.4, y: 1.15, radiusTop: 0.12, radiusBottom: 0.28 },
    ]
    for (const lo of leafOffsets) {
      const leafPivot = new THREE.Group()
      leafPivot.position.set(0, lo.y, -0.45)

      const leafGeo = new THREE.CylinderGeometry(lo.radiusTop, lo.radiusBottom, lo.len, 8)
      leafGeo.translate(0, lo.len / 2, 0)
      const leafMesh = new THREE.Mesh(leafGeo, leafGreenMat)
      leafMesh.rotation.x = lo.angleX
      leafMesh.rotation.z = lo.angleZ
      leafMesh.castShadow = true

      leafPivot.add(leafMesh)
      headGroup.add(leafPivot)
      leaves.push(leafPivot)
    }

    // ==========================================
    // 2. TORSO & TACTICAL ARMOR
    // ==========================================
    const torsoGroup = new THREE.Group()
    torsoGroup.position.y = 2.2
    body.add(torsoGroup)

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.80, 1.75, 1.20), cobaltBlueMat)
    torso.castShadow = true
    torsoGroup.add(torso)

    const armorPlate = new THREE.Mesh(new THREE.BoxGeometry(1.50, 1.20, 0.32), darkNavyMat)
    armorPlate.position.set(0, 0.08, 0.52)
    torsoGroup.add(armorPlate)

    const cyanStripeH = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.08, 0.08), cyanPipingMat)
    cyanStripeH.position.set(0, 0.25, 0.68)
    const cyanStripeV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.80, 0.08), cyanPipingMat)
    cyanStripeV.position.set(0, -0.15, 0.68)
    torsoGroup.add(cyanStripeH, cyanStripeV)

    const collar = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.45, 1.28), cobaltBlueMat)
    collar.position.set(0, 0.78, 0)
    torsoGroup.add(collar)

    // ==========================================
    // 3. ARTICULATED GAUNTLETS WITH ELBOW JOINTS & GLOWING CYAN CUFFS
    // ==========================================
    // Left Arm Hierarchy
    const leftArmPivot = new THREE.Group()
    leftArmPivot.position.set(-1.25, 2.75, 0)
    body.add(leftArmPivot)

    const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.55, 0.68), darkNavyMat)
    leftArmPivot.add(pauldronL)

    const upperArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.22, 0.65, 8), cobaltBlueMat)
    upperArmL.position.y = -0.35
    leftArmPivot.add(upperArmL)

    // Articulated Left Elbow Joint & Forearm Gauntlet
    const leftElbowPivot = new THREE.Group()
    leftElbowPivot.position.set(0, -0.70, 0)
    leftArmPivot.add(leftElbowPivot)

    const elbowCapL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), darkNavyMat)
    leftElbowPivot.add(elbowCapL)

    const leftForearmGroup = new THREE.Group()
    leftElbowPivot.add(leftForearmGroup)

    const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.65, 8), cobaltBlueMat)
    forearmL.position.y = -0.35
    leftForearmGroup.add(forearmL)

    const gauntletPlateL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.55, 0.30), darkNavyMat)
    gauntletPlateL.position.set(0, -0.35, 0.08)
    leftForearmGroup.add(gauntletPlateL)

    // Glowing Cyan Wrist Cuff
    const leftCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.16, 12), cyanPipingMat)
    leftCuff.position.set(0, -0.70, 0.04)
    leftForearmGroup.add(leftCuff)

    // Glowing Cyan Energy Fist
    const leftFist = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), energyFistMat)
    leftFist.position.set(0, -0.92, 0.06)
    leftForearmGroup.add(leftFist)

    // Right Arm Hierarchy
    const rightArmPivot = new THREE.Group()
    rightArmPivot.position.set(1.25, 2.75, 0)
    body.add(rightArmPivot)

    const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.55, 0.68), darkNavyMat)
    rightArmPivot.add(pauldronR)

    const upperArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.22, 0.65, 8), cobaltBlueMat)
    upperArmR.position.y = -0.35
    rightArmPivot.add(upperArmR)

    // Articulated Right Elbow Joint & Forearm Gauntlet
    const rightElbowPivot = new THREE.Group()
    rightElbowPivot.position.set(0, -0.70, 0)
    rightArmPivot.add(rightElbowPivot)

    const elbowCapR = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), darkNavyMat)
    rightElbowPivot.add(elbowCapR)

    const rightForearmGroup = new THREE.Group()
    rightElbowPivot.add(rightForearmGroup)

    const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.65, 8), cobaltBlueMat)
    forearmR.position.y = -0.35
    rightForearmGroup.add(forearmR)

    const gauntletPlateR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.55, 0.30), darkNavyMat)
    gauntletPlateR.position.set(0, -0.35, 0.08)
    rightForearmGroup.add(gauntletPlateR)

    // Glowing Cyan Wrist Cuff
    const rightCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.16, 12), cyanPipingMat)
    rightCuff.position.set(0, -0.70, 0.04)
    rightForearmGroup.add(rightCuff)

    // Glowing Cyan Energy Fist
    const rightFist = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), energyFistMat)
    rightFist.position.set(0, -0.92, 0.06)
    rightForearmGroup.add(rightFist)

    // ==========================================
    // 4. UTILITY BELT & POUCHES
    // ==========================================
    const belt = new THREE.Group()
    belt.position.set(0, 1.4, 0)
    const beltBand = new THREE.Mesh(new THREE.BoxGeometry(1.90, 0.26, 1.30), darkNavyMat)
    belt.add(beltBand)

    const pouchL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.40, 0.36), darkNavyMat)
    pouchL.position.set(-1.02, -0.08, 0)
    const pouchR = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.40, 0.36), darkNavyMat)
    pouchR.position.set(1.02, -0.08, 0)
    belt.add(pouchL, pouchR)
    body.add(belt)

    // ==========================================
    // 5. ARTICULATED KNEE PLATES & HEAVY COMBAT BOOTS
    // ==========================================
    // Left Leg Hierarchy
    const leftLegPivot = new THREE.Group()
    leftLegPivot.position.set(-0.55, 1.4, 0)
    body.add(leftLegPivot)

    const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.62, 8), cobaltBlueMat)
    thighL.position.y = -0.32
    leftLegPivot.add(thighL)

    // Articulated Left Knee Joint & Shin
    const leftKneePivot = new THREE.Group()
    leftKneePivot.position.set(0, -0.62, 0)
    leftLegPivot.add(leftKneePivot)

    const kneeCapL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), darkNavyMat)
    leftKneePivot.add(kneeCapL)

    // Articulated Knee Plate
    const kneePlateL = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.36, 0.22), darkNavyMat)
    kneePlateL.position.set(0, 0, 0.24)
    leftKneePivot.add(kneePlateL)

    const shinL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.58, 8), cobaltBlueMat)
    shinL.position.y = -0.32
    leftKneePivot.add(shinL)

    // Combat Boot with Treaded Sole & Toe Cap
    const bootGroupL = new THREE.Group()
    bootGroupL.position.set(0, -0.60, 0.12)
    leftKneePivot.add(bootGroupL)

    const bootUpperL = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.38, 0.60), darkNavyMat)
    bootUpperL.position.y = 0.16
    bootUpperL.castShadow = true

    const bootToeL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.35), darkNavyMat)
    bootToeL.position.set(0, 0.11, 0.32)
    bootToeL.castShadow = true

    const bootSoleL = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.14, 0.88), bootSoleMat)
    bootSoleL.position.set(0, -0.02, 0.08)
    bootSoleL.castShadow = true

    bootGroupL.add(bootUpperL, bootToeL, bootSoleL)

    // Right Leg Hierarchy
    const rightLegPivot = new THREE.Group()
    rightLegPivot.position.set(0.55, 1.4, 0)
    body.add(rightLegPivot)

    const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.62, 8), cobaltBlueMat)
    thighR.position.y = -0.32
    rightLegPivot.add(thighR)

    // Articulated Right Knee Joint & Shin
    const rightKneePivot = new THREE.Group()
    rightKneePivot.position.set(0, -0.62, 0)
    rightLegPivot.add(rightKneePivot)

    const kneeCapR = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), darkNavyMat)
    rightKneePivot.add(kneeCapR)

    // Articulated Knee Plate
    const kneePlateR = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.36, 0.22), darkNavyMat)
    kneePlateR.position.set(0, 0, 0.24)
    rightKneePivot.add(kneePlateR)

    const shinR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.58, 8), cobaltBlueMat)
    shinR.position.y = -0.32
    rightKneePivot.add(shinR)

    // Combat Boot with Treaded Sole & Toe Cap
    const bootGroupR = new THREE.Group()
    bootGroupR.position.set(0, -0.60, 0.12)
    rightKneePivot.add(bootGroupR)

    const bootUpperR = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.38, 0.60), darkNavyMat)
    bootUpperR.position.y = 0.16
    bootUpperR.castShadow = true

    const bootToeR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.35), darkNavyMat)
    bootToeR.position.set(0, 0.11, 0.32)
    bootToeR.castShadow = true

    const bootSoleR = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.14, 0.88), bootSoleMat)
    bootSoleR.position.set(0, -0.02, 0.08)
    bootSoleR.castShadow = true

    bootGroupR.add(bootUpperR, bootToeR, bootSoleR)

    const nodes: CyberLeekNodes = {
      root,
      body,
      head: headGroup,
      leaves,
      leftArm: leftArmPivot,
      rightArm: rightArmPivot,
      leftFist,
      rightFist,
      leftLeg: leftLegPivot,
      rightLeg: rightLegPivot,
      leftBoot: bootGroupL,
      rightBoot: bootGroupR,
      torso: torsoGroup,
      chestPlate: armorPlate,
      cyanPiping: [cyanStripeH, cyanStripeV],
      collar,
      sawtoothTransition,
      glasses: glassesGroup,
      mouth,
      belt,
      leftPouch: pouchL,
      rightPouch: pouchR,
      leftKnee: leftKneePivot,
      rightKnee: rightKneePivot,
      leftElbow: leftElbowPivot,
      rightElbow: rightElbowPivot,
      leftForearm: leftForearmGroup,
      rightForearm: rightForearmGroup,
      leftCuff,
      rightCuff,
    }

    return { group: root, nodes }
  }

  static createSawtoothGeometry(
    radiusBottom: number,
    radiusTop: number,
    height: number,
    teethCount: number
  ): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry()
    const positions: number[] = []

    const numSegments = teethCount * 2
    const angleStep = (Math.PI * 2) / numSegments

    for (let i = 0; i < numSegments; i++) {
      const a0 = i * angleStep
      const a1 = (i + 1) * angleStep
      const isPeak = i % 2 === 0

      const x0B = Math.cos(a0) * radiusBottom
      const z0B = Math.sin(a0) * radiusBottom
      const x1B = Math.cos(a1) * radiusBottom
      const z1B = Math.sin(a1) * radiusBottom
      const yB = -height * 0.5

      const rTop0 = isPeak ? radiusTop * 1.12 : radiusTop * 0.95
      const rTop1 = !isPeak ? radiusTop * 1.12 : radiusTop * 0.95
      const yT0 = isPeak ? height * 0.5 : 0
      const yT1 = !isPeak ? height * 0.5 : 0

      const x0T = Math.cos(a0) * rTop0
      const z0T = Math.sin(a0) * rTop0
      const x1T = Math.cos(a1) * rTop1
      const z1T = Math.sin(a1) * rTop1

      positions.push(x0B, yB, z0B, x1B, yB, z1B, x0T, yT0, z0T)
      positions.push(x1B, yB, z1B, x1T, yT1, z1T, x0T, yT0, z0T)
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.computeVertexNormals()
    return geo
  }

  triggerLeapSlam(duration = 1.0, onImpact?: () => void): void {
    this.animState = 'leap_crouch'
    this.actionTime = 0
    this.actionDuration = duration
    this.onActionCallback = onImpact ?? null
    this.actionTriggered = false
  }

  playLeapSlam(onImpact?: () => void, duration = 1.0): void {
    this.triggerLeapSlam(duration, onImpact)
  }

  triggerDiscThrow(duration = 0.6, onRelease?: () => void): void {
    this.animState = 'disc_windup'
    this.actionTime = 0
    this.actionDuration = duration
    this.onActionRelease = onRelease ?? null
    this.actionTriggered = false
  }

  playDiscThrow(onRelease?: () => void, duration = 0.6): void {
    this.triggerDiscThrow(duration, onRelease)
  }

  triggerImpactSquash(strength = 0.42): void {
    this.squashY = Math.max(0.45, 1.0 - strength)
    this.squashXZ = 1.0 + strength * 0.85
    this.impactSquashVelocity = strength * 14.0
  }

  getAnimationState(): CyberLeekAnimationState {
    return this.animState
  }

  isBusy(): boolean {
    return this.animState !== 'idle' && this.animState !== 'march' && this.animState !== 'sprint'
  }

  resetToIdle(): void {
    this.animState = 'idle'
    this.actionTime = 0
    this.actionTriggered = false
  }

  update(
    dt: number,
    isMovingOrState: boolean | CyberLeekUpdateState = false,
    speedOrSprint: number | boolean = 0
  ): void {
    this.globalTime += dt

    let isMoving = false
    let isSprinting = false
    let phase: 1 | 2 = 1

    if (typeof isMovingOrState === 'boolean') {
      isMoving = isMovingOrState
      if (typeof speedOrSprint === 'boolean') {
        isSprinting = speedOrSprint
        this.currentSpeed = isSprinting ? 6.0 : isMoving ? 3.2 : 0
      } else {
        this.currentSpeed = speedOrSprint
        isSprinting = this.currentSpeed > 4.5
      }
    } else {
      const state = isMovingOrState
      const vx = state.velocity?.x ?? 0
      const vz = state.velocity?.z ?? 0
      const velSpeed = Math.sqrt(vx * vx + vz * vz)
      this.currentSpeed = state.speed ?? (velSpeed > 0 ? velSpeed : (state.isMoving ? 3.2 : 0))
      isMoving = state.isMoving ?? this.currentSpeed > 0.08
      isSprinting = state.isSprinting ?? this.currentSpeed > 4.5
      phase = state.phase ?? 1
    }

    if (this.squashY < 0.999 || this.squashY > 1.001) {
      const forceY = (1.0 - this.squashY) * 32.0 - this.impactSquashVelocity * 7.5
      this.impactSquashVelocity += forceY * dt
      this.squashY += this.impactSquashVelocity * dt
      this.squashXZ = 1.0 + (1.0 - this.squashY) * 0.75
    } else {
      this.squashY = 1.0
      this.squashXZ = 1.0
      this.impactSquashVelocity = 0
    }

    this.updateActionStateMachine(dt, isMoving, isSprinting)
    this.updateLeafWindWaveAndBreathing(dt, isMoving, isSprinting, phase)
    this.updateCyanFistPulses(dt, phase)
    this.updateLimbKinematics(dt, isMoving, isSprinting, phase)

    this.nodes.body.scale.set(
      this.squashXZ,
      this.squashY * this.config.baseScaleY,
      this.squashXZ
    )
  }

  private updateActionStateMachine(dt: number, isMoving: boolean, isSprinting: boolean): void {
    if (this.animState === 'idle' || this.animState === 'march' || this.animState === 'sprint') {
      if (isMoving) {
        this.animState = isSprinting ? 'sprint' : 'march'
      } else {
        this.animState = 'idle'
      }
      return
    }

    this.actionTime += dt
    const progress = Math.min(1.0, this.actionTime / Math.max(0.01, this.actionDuration))

    if (this.animState === 'leap_crouch') {
      const crouchT = Math.min(1.0, progress / 0.25)
      this.squashY = 1.0 - Math.sin(crouchT * Math.PI * 0.5) * 0.35
      this.squashXZ = 1.0 + Math.sin(crouchT * Math.PI * 0.5) * 0.30

      if (this.nodes.leftKnee) this.nodes.leftKnee.rotation.x = 0.85
      if (this.nodes.rightKnee) this.nodes.rightKnee.rotation.x = 0.85
      if (this.nodes.leftElbow) this.nodes.leftElbow.rotation.x = 0.95
      if (this.nodes.rightElbow) this.nodes.rightElbow.rotation.x = 0.95

      if (progress >= 0.25) {
        this.animState = 'leap_airborne'
      }
    }

    if (this.animState === 'leap_airborne') {
      const airT = (progress - 0.25) / 0.6
      this.squashY = 1.0 + Math.sin(airT * Math.PI) * 0.28
      this.squashXZ = 1.0 - Math.sin(airT * Math.PI) * 0.18

      const armLift = Math.sin(airT * Math.PI * 0.85) * 2.7
      this.nodes.leftArm.rotation.x = -armLift
      this.nodes.rightArm.rotation.x = -armLift
      this.nodes.leftArm.rotation.z = -0.35
      this.nodes.rightArm.rotation.z = 0.35

      if (this.nodes.leftElbow) this.nodes.leftElbow.rotation.x = -0.45
      if (this.nodes.rightElbow) this.nodes.rightElbow.rotation.x = -0.45
      if (this.nodes.leftKnee) this.nodes.leftKnee.rotation.x = 0.15
      if (this.nodes.rightKnee) this.nodes.rightKnee.rotation.x = 0.15

      if (progress >= 0.85) {
        this.animState = 'leap_slam'
      }
    }

    if (this.animState === 'leap_slam') {
      if (!this.actionTriggered) {
        this.actionTriggered = true
        this.triggerImpactSquash(0.50)
        this.nodes.leftArm.rotation.x = 1.35
        this.nodes.rightArm.rotation.x = 1.35
        this.nodes.leftArm.rotation.z = 0
        this.nodes.rightArm.rotation.z = 0
        if (this.nodes.leftElbow) this.nodes.leftElbow.rotation.x = 0.55
        if (this.nodes.rightElbow) this.nodes.rightElbow.rotation.x = 0.55
        if (this.nodes.leftKnee) this.nodes.leftKnee.rotation.x = 0.65
        if (this.nodes.rightKnee) this.nodes.rightKnee.rotation.x = 0.65
        if (this.onActionCallback) {
          this.onActionCallback()
        }
      }

      if (progress >= 1.0) {
        this.animState = isMoving ? (isSprinting ? 'sprint' : 'march') : 'idle'
      }
    }

    if (this.animState === 'disc_windup') {
      const windT = progress / 0.45
      const easeWind = Math.sin(windT * Math.PI * 0.5)

      if (this.nodes.torso) this.nodes.torso.rotation.y = easeWind * 0.72
      this.nodes.rightArm.rotation.x = -easeWind * 1.85
      this.nodes.rightArm.rotation.z = -easeWind * 0.45
      if (this.nodes.rightElbow) this.nodes.rightElbow.rotation.x = -easeWind * 1.10
      this.nodes.leftArm.rotation.x = easeWind * 0.65
      if (this.nodes.leftElbow) this.nodes.leftElbow.rotation.x = easeWind * 0.45
      this.nodes.head.rotation.y = -easeWind * 0.45

      if (progress >= 0.45) {
        this.animState = 'disc_throw'
      }
    }

    if (this.animState === 'disc_throw') {
      const flingT = (progress - 0.45) / 0.55

      if (!this.actionTriggered && flingT >= 0.15) {
        this.actionTriggered = true
        if (this.onActionRelease) {
          this.onActionRelease()
        }
      }

      const snapT = Math.sin(flingT * Math.PI * 0.7)
      if (this.nodes.torso) this.nodes.torso.rotation.y = 0.72 - snapT * 1.4
      this.nodes.rightArm.rotation.x = -1.85 + snapT * 2.9
      this.nodes.rightArm.rotation.z = -0.45 + snapT * 0.85
      if (this.nodes.rightElbow) this.nodes.rightElbow.rotation.x = -1.10 + snapT * 1.50
      this.nodes.leftArm.rotation.x = 0.65 - snapT * 1.1
      if (this.nodes.leftElbow) this.nodes.leftElbow.rotation.x = 0.45 - snapT * 0.45
      this.nodes.head.rotation.y = -0.45 + snapT * 0.6

      if (progress >= 1.0) {
        if (this.nodes.torso) this.nodes.torso.rotation.y = 0
        this.nodes.head.rotation.y = 0
        if (this.nodes.rightElbow) this.nodes.rightElbow.rotation.x = 0
        if (this.nodes.leftElbow) this.nodes.leftElbow.rotation.x = 0
        this.animState = isMoving ? (isSprinting ? 'sprint' : 'march') : 'idle'
      }
    }
  }

  private updateLeafWindWaveAndBreathing(
    dt: number,
    isMoving: boolean,
    isSprinting: boolean,
    phase: 1 | 2
  ): void {
    const windSpeed = this.config.leafWindSpeed * (isSprinting ? 1.8 : 1.0)
    const windStrength = this.config.leafWindStrength * (isSprinting ? 1.5 : 1.0) * (phase === 2 ? 1.25 : 1.0)

    if (this.animState === 'idle') {
      const breathTime = this.globalTime * this.config.idleBobSpeed
      const breathBob = Math.sin(breathTime) * this.config.idleBobAmount
      const breathChest = Math.cos(breathTime) * 0.035

      this.nodes.body.position.y = breathBob
      if (this.nodes.torso) {
        this.nodes.torso.scale.set(1.0 + breathChest, 1.0 - breathChest * 0.5, 1.0 + breathChest)
      }

      if (this.nodes.glasses) {
        this.nodes.glasses.rotation.z = Math.sin(this.globalTime * 2.0) * 0.03
      }
      if (this.nodes.mouth) {
        this.nodes.mouth.scale.x = 1.0 + Math.sin(this.globalTime * 3.5) * 0.06
      }
    } else {
      if (this.nodes.glasses) this.nodes.glasses.rotation.z = 0
      if (this.nodes.mouth) this.nodes.mouth.scale.x = 1.0
    }

    const speedDrag = Math.min(0.45, this.currentSpeed * 0.08)

    if (this.nodes.leaves) {
      this.nodes.leaves.forEach((leaf, idx) => {
        const baseRot = this.leafBaseRotations[idx] ?? { x: -0.7, z: 0 }
        const phaseOffset = idx * 1.35

        const wavePitch =
          Math.sin(this.globalTime * windSpeed + phaseOffset) * windStrength +
          Math.cos(this.globalTime * windSpeed * 0.5 + idx) * (windStrength * 0.35) -
          speedDrag

        const waveRoll =
          Math.cos(this.globalTime * windSpeed * 0.75 + phaseOffset) * (windStrength * 0.65)
        const waveYaw =
          Math.sin(this.globalTime * windSpeed * 0.45 + phaseOffset) * (windStrength * 0.45)

        leaf.rotation.x = baseRot.x + wavePitch * 0.6
        leaf.rotation.z = baseRot.z + waveRoll * 0.6
        leaf.rotation.y = waveYaw * 0.4
      })
    }
  }

  private updateCyanFistPulses(dt: number, phase: 1 | 2): void {
    const isCharging =
      this.animState === 'leap_crouch' ||
      this.animState === 'leap_airborne' ||
      this.animState === 'disc_windup'

    const pulseSpeed =
      this.config.fistPulseSpeed * (isCharging ? 2.5 : phase === 2 ? 1.5 : 1.0)
    const basePulse = Math.sin(this.globalTime * pulseSpeed)

    const minScale = isCharging ? 1.15 : this.config.fistPulseMinScale
    const maxScale = isCharging ? 1.85 : phase === 2 ? 1.45 : this.config.fistPulseMaxScale
    const fistScale = minScale + (basePulse * 0.5 + 0.5) * (maxScale - minScale)

    this.nodes.leftFist.scale.set(fistScale, fistScale, fistScale)
    this.nodes.rightFist.scale.set(fistScale, fistScale, fistScale)

    const colorHex = isCharging
      ? (Math.sin(this.globalTime * 28.0) > 0 ? 0x00ffff : 0x38bdf8)
      : phase === 2
      ? 0x00ffff
      : 0x38bdf8

    if (this.nodes.leftFist.material instanceof THREE.MeshBasicMaterial) {
      this.nodes.leftFist.material.color.setHex(colorHex)
    }
    if (this.nodes.rightFist.material instanceof THREE.MeshBasicMaterial) {
      this.nodes.rightFist.material.color.setHex(colorHex)
    }

    if (this.nodes.leftCuff && this.nodes.leftCuff.material instanceof THREE.MeshBasicMaterial) {
      this.nodes.leftCuff.material.color.setHex(colorHex)
    }
    if (this.nodes.rightCuff && this.nodes.rightCuff.material instanceof THREE.MeshBasicMaterial) {
      this.nodes.rightCuff.material.color.setHex(colorHex)
    }

    if (this.nodes.cyanPiping && phase === 2) {
      const pipingPulse = 0.85 + Math.sin(this.globalTime * 12.0) * 0.15
      for (const pipe of this.nodes.cyanPiping) {
        pipe.scale.set(1.0, pipingPulse, 1.0)
      }
    }
  }

  private updateLimbKinematics(
    dt: number,
    isMoving: boolean,
    isSprinting: boolean,
    phase: 1 | 2
  ): void {
    const isPlayingSpecialAction =
      this.animState === 'leap_crouch' ||
      this.animState === 'leap_airborne' ||
      this.animState === 'leap_slam' ||
      this.animState === 'disc_windup' ||
      this.animState === 'disc_throw'

    if (isMoving) {
      const strideFreq = isSprinting
        ? this.config.sprintFrequency
        : this.config.marchFrequency
      this.strideTime += dt * strideFreq

      const targetLean = isSprinting ? 0.38 : 0.22
      this.currentLeanX += (targetLean - this.currentLeanX) * Math.min(1.0, dt * 10.0)

      const bounce = Math.abs(Math.sin(this.strideTime)) * (isSprinting ? 0.18 : 0.12)
      this.nodes.body.position.y = bounce

      if (!isPlayingSpecialAction && this.nodes.torso) {
        this.nodes.torso.rotation.z = Math.sin(this.strideTime) * (isSprinting ? 0.09 : 0.05)
        this.nodes.torso.rotation.y = -Math.sin(this.strideTime) * (isSprinting ? 0.14 : 0.08)
      }

      const legAngle = Math.sin(this.strideTime) * this.config.legSwingAngle
      this.nodes.leftLeg.rotation.x = legAngle
      this.nodes.rightLeg.rotation.x = -legAngle

      const leftFootLift = Math.max(0, -Math.sin(this.strideTime)) * (isSprinting ? 0.28 : 0.18)
      const rightFootLift = Math.max(0, Math.sin(this.strideTime)) * (isSprinting ? 0.28 : 0.18)
      this.nodes.leftLeg.position.y = 1.4 + leftFootLift
      this.nodes.rightLeg.position.y = 1.4 + rightFootLift

      // Articulated Knee Flexion during stride
      if (this.nodes.leftKnee) {
        this.nodes.leftKnee.rotation.x = Math.max(0, -legAngle) * 0.75
      }
      if (this.nodes.rightKnee) {
        this.nodes.rightKnee.rotation.x = Math.max(0, legAngle) * 0.75
      }

      this.nodes.leftBoot.rotation.x = -legAngle * 0.45
      this.nodes.rightBoot.rotation.x = legAngle * 0.45

      if (!isPlayingSpecialAction) {
        const armAngle = -Math.sin(this.strideTime) * this.config.armSwingAngle
        this.nodes.leftArm.rotation.x = armAngle
        this.nodes.rightArm.rotation.x = -armAngle
        this.nodes.leftArm.rotation.z = 0.12 + Math.abs(Math.sin(this.strideTime)) * 0.08
        this.nodes.rightArm.rotation.z = -0.12 - Math.abs(Math.sin(this.strideTime)) * 0.08

        // Articulated Elbow Pumping during march / sprint
        const elbowBase = isSprinting ? 0.85 : 0.45
        const elbowSwing = Math.sin(this.strideTime) * (isSprinting ? 0.35 : 0.20)
        if (this.nodes.leftElbow) this.nodes.leftElbow.rotation.x = elbowBase + elbowSwing
        if (this.nodes.rightElbow) this.nodes.rightElbow.rotation.x = elbowBase - elbowSwing
      }

      if (this.nodes.leftPouch && this.nodes.rightPouch) {
        const pouchJiggleY = Math.sin(this.strideTime * 2.0) * 0.04
        this.nodes.leftPouch.position.y = -0.08 + pouchJiggleY
        this.nodes.rightPouch.position.y = -0.08 + pouchJiggleY
      }
    } else {
      this.currentLeanX += (0 - this.currentLeanX) * Math.min(1.0, dt * 8.0)

      this.nodes.leftLeg.rotation.x = 0
      this.nodes.rightLeg.rotation.x = 0
      this.nodes.leftLeg.position.y = 1.4
      this.nodes.rightLeg.position.y = 1.4
      this.nodes.leftBoot.rotation.x = 0
      this.nodes.rightBoot.rotation.x = 0

      if (this.nodes.leftKnee && !isPlayingSpecialAction) this.nodes.leftKnee.rotation.x = 0
      if (this.nodes.rightKnee && !isPlayingSpecialAction) this.nodes.rightKnee.rotation.x = 0
      if (this.nodes.leftPouch) this.nodes.leftPouch.position.y = -0.08
      if (this.nodes.rightPouch) this.nodes.rightPouch.position.y = -0.08

      if (!isPlayingSpecialAction) {
        if (this.nodes.torso) {
          this.nodes.torso.rotation.z = 0
          this.nodes.torso.rotation.y = 0
        }

        const idleArm = Math.sin(this.globalTime * this.config.idleBobSpeed * 0.6) * 0.08
        this.nodes.leftArm.rotation.x = idleArm
        this.nodes.rightArm.rotation.x = -idleArm
        this.nodes.leftArm.rotation.z = 0.06
        this.nodes.rightArm.rotation.z = -0.06
        if (this.nodes.leftElbow) this.nodes.leftElbow.rotation.x = 0.25
        if (this.nodes.rightElbow) this.nodes.rightElbow.rotation.x = 0.25
      }
    }

    if (!isPlayingSpecialAction && this.nodes.torso) {
      this.nodes.torso.rotation.x = this.currentLeanX
    }
  }
}


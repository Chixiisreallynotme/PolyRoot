import * as THREE from 'three'
import { CyberLeekRig, type CyberLeekNodes } from '../render/CyberLeekRig'

// Boss CyberLeek — 100% faithful to artwork media_1788097114828.jpg
// Features:
// - Swept-back 3 green leek leaves with wind-wave simulation
// - White/cream stalk head with zig-zag leek crown transition, pixel sunglasses, and ^w^ smirk
// - Cobalt Blue & Navy Tactical Armor with glowing cyan piping, pauldrons, utility belt, knee pads, combat boots
// - Pulsing Cyan Energy Fists with CyberLeekRig procedural animation suite

export interface BossAttack {
  type: 'disc' | 'slam'
  x: number
  z: number
  vx: number
  vz: number
  radius: number
  active: boolean
  life: number
}

export class Boss {
  public readonly group: THREE.Group
  public readonly rig: CyberLeekRig
  public active = false
  public timer = 0
  public maxTime = 35
  public phase: 1 | 2 = 1

  public attacks: BossAttack[] = []
  private attackMesh: THREE.InstancedMesh
  private dummy = new THREE.Object3D()
  private maxAttacks = 60
  private attackTimer = 0
  private empWaveMesh: THREE.Mesh

  private isLeaping = false
  private leapTimer = 0
  private leapTarget = { x: 24, z: 18 }

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group()
    this.group.position.set(24, 0, 18)

    // Build Character Nodes & Hierarchy
    const nodes = this.buildCyberLeekHierarchy()
    this.group.add(nodes.root)
    this.rig = new CyberLeekRig(nodes)

    // Slam Shockwave ring
    const empGeo = new THREE.RingGeometry(0.4, 1.2, 32)
    empGeo.rotateX(-Math.PI / 2)
    const empMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.empWaveMesh = new THREE.Mesh(empGeo, empMat)
    this.empWaveMesh.position.y = 0.05
    this.group.add(this.empWaveMesh)

    // Instanced Projectiles for Spinning Game Discs
    const discGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 14)
    const discMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7, flatShading: true })
    this.attackMesh = new THREE.InstancedMesh(discGeo, discMat, this.maxAttacks)
    this.attackMesh.castShadow = true
    scene.add(this.attackMesh)

    for (let i = 0; i < this.maxAttacks; i++) {
      this.attacks.push({ type: 'disc', x: 0, z: 0, vx: 0, vz: 0, radius: 0.45, active: false, life: 0 })
    }

    this.group.visible = false
    scene.add(this.group)
  }

  private buildCyberLeekHierarchy(): CyberLeekNodes {
    const root = new THREE.Group()
    const body = new THREE.Group()
    root.add(body)

    const leafGreenMat = new THREE.MeshLambertMaterial({ color: 0x22c55e, flatShading: true })
    const crownGreenMat = new THREE.MeshLambertMaterial({ color: 0x16a34a, flatShading: true })
    const stalkPaleMat = new THREE.MeshLambertMaterial({ color: 0xecfdf5, flatShading: true })
    const cobaltBlueMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8, flatShading: true })
    const darkNavyMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true })
    const cyanPipingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const blackGlassesMat = new THREE.MeshLambertMaterial({ color: 0x050505, flatShading: true })
    const blueLensMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a })
    const energyFistMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })

    // 1. Pale Green Stalk Head
    const headGroup = new THREE.Group()
    headGroup.position.y = 3.6
    body.add(headGroup)

    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 1.8, 12), stalkPaleMat)
    stalk.castShadow = true
    headGroup.add(stalk)

    // Zig-Zag / Sawtooth Crown Transition where leaves meet the stalk
    for (let i = 0; i < 8; i++) {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 4), crownGreenMat)
      tooth.rotation.x = Math.PI
      const angle = (i / 8) * Math.PI * 2
      tooth.position.set(Math.cos(angle) * 0.73, 0.9, Math.sin(angle) * 0.73)
      headGroup.add(tooth)
    }

    // Pixelated Tactical Sunglasses
    const glassesFrame = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.38, 0.22), blackGlassesMat)
    glassesFrame.position.set(0, 0.15, 0.74)
    headGroup.add(glassesFrame)

    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.05), blueLensMat)
    lensL.position.set(-0.35, 0.15, 0.86)
    const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.05), blueLensMat)
    lensR.position.set(0.35, 0.15, 0.86)
    headGroup.add(lensL, lensR)

    // Cat-like Smirk Smile (^w^)
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.08), cobaltBlueMat)
    mouth.position.set(0, -0.32, 0.74)
    headGroup.add(mouth)

    // 2. Swept-Back 3 Green Leek Foliage Leaves
    const leaves: THREE.Object3D[] = []
    const leafOffsets = [
      { angleX: -0.65, angleZ: 0.35, len: 3.2, y: 1.2 },
      { angleX: -0.88, angleZ: 0.0, len: 3.8, y: 1.4 },
      { angleX: -0.65, angleZ: -0.35, len: 3.2, y: 1.2 },
    ]
    for (const lo of leafOffsets) {
      const leafPivot = new THREE.Group()
      leafPivot.position.set(0, lo.y, -0.5)

      const leafGeo = new THREE.CylinderGeometry(0.18, 0.38, lo.len, 8)
      leafGeo.translate(0, lo.len / 2, 0)
      const leafMesh = new THREE.Mesh(leafGeo, leafGreenMat)
      leafMesh.rotation.x = lo.angleX
      leafMesh.rotation.z = lo.angleZ
      leafMesh.castShadow = true

      leafPivot.add(leafMesh)
      headGroup.add(leafPivot)
      leaves.push(leafPivot)
    }

    // 3. Cobalt Blue Tactical Bodysuit Torso
    const torsoGroup = new THREE.Group()
    torsoGroup.position.y = 2.2
    body.add(torsoGroup)

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.8, 1.25), cobaltBlueMat)
    torso.castShadow = true
    torsoGroup.add(torso)

    // Chest Armor Plating & Collar
    const armorPlate = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.25, 0.35), darkNavyMat)
    armorPlate.position.set(0, 0.08, 0.55)
    torsoGroup.add(armorPlate)

    const cyanStripeH = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.08, 0.1), cyanPipingMat)
    cyanStripeH.position.set(0, 0.25, 0.72)
    const cyanStripeV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.1), cyanPipingMat)
    cyanStripeV.position.set(0, -0.15, 0.72)
    torsoGroup.add(cyanStripeH, cyanStripeV)

    // Tactical High Collar
    const collar = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.5, 1.35), cobaltBlueMat)
    collar.position.set(0, 0.8, 0)
    torsoGroup.add(collar)

    // 4. Arms & Glowing Cyan Energy Fists
    const leftArmPivot = new THREE.Group()
    leftArmPivot.position.set(-1.25, 2.8, 0)
    body.add(leftArmPivot)

    const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), darkNavyMat)
    leftArmPivot.add(pauldronL)

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.4, 8), cobaltBlueMat)
    armL.position.y = -0.7
    leftArmPivot.add(armL)

    const leftFist = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), energyFistMat)
    leftFist.position.set(0, -1.4, 0.1)
    leftArmPivot.add(leftFist)

    const rightArmPivot = new THREE.Group()
    rightArmPivot.position.set(1.25, 2.8, 0)
    body.add(rightArmPivot)

    const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), darkNavyMat)
    rightArmPivot.add(pauldronR)

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.4, 8), cobaltBlueMat)
    armR.position.y = -0.7
    rightArmPivot.add(armR)

    const rightFist = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), energyFistMat)
    rightFist.position.set(0, -1.4, 0.1)
    rightArmPivot.add(rightFist)

    // 5. Utility Combat Belt & Pouches
    const belt = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.28, 1.35), darkNavyMat)
    belt.position.set(0, 1.4, 0)
    body.add(belt)

    const pouchL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.38), darkNavyMat)
    pouchL.position.set(-1.05, 1.3, 0)
    const pouchR = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.38), darkNavyMat)
    pouchR.position.set(1.05, 1.3, 0)
    body.add(pouchL, pouchR)

    // 6. Armored Legs & Heavy Combat Boots
    const leftLegPivot = new THREE.Group()
    leftLegPivot.position.set(-0.55, 1.4, 0)
    body.add(leftLegPivot)

    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 8), cobaltBlueMat)
    legL.position.y = -0.55
    leftLegPivot.add(legL)

    const kneeL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.22), darkNavyMat)
    kneeL.position.set(0, -0.55, 0.28)
    leftLegPivot.add(kneeL)

    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 0.85), darkNavyMat)
    bootL.position.set(0, -1.15, 0.15)
    bootL.castShadow = true
    leftLegPivot.add(bootL)

    const rightLegPivot = new THREE.Group()
    rightLegPivot.position.set(0.55, 1.4, 0)
    body.add(rightLegPivot)

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 8), cobaltBlueMat)
    legR.position.y = -0.55
    rightLegPivot.add(legR)

    const kneeR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.22), darkNavyMat)
    kneeR.position.set(0, -0.55, 0.28)
    rightLegPivot.add(kneeR)

    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 0.85), darkNavyMat)
    bootR.position.set(0, -1.15, 0.15)
    bootR.castShadow = true
    rightLegPivot.add(bootR)

    return {
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
      leftBoot: bootL,
      rightBoot: bootR,
    }
  }

  spawn(): void {
    this.active = true
    this.timer = 0
    this.phase = 1
    this.group.visible = true
    console.log('[boss] CyberLeek spawned — Tactical 35s Survival starts!')
  }

  update(dt: number, playerX: number, playerZ: number, onSummonHorde: () => void): { won: boolean; shockwaveActive: boolean } {
    if (!this.active) return { won: false, shockwaveActive: false }

    this.timer += dt
    this.attackTimer += dt

    if (this.timer >= 20 && this.phase === 1) {
      this.phase = 2
      console.log('[boss] CyberLeek Phase 2 Overclock!')
    }

    const dx = playerX - this.group.position.x
    const dz = playerZ - this.group.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const isMoving = dist > 5.0 && !this.isLeaping

    // Update CyberLeek procedural animations
    this.rig.update(dt, isMoving, 3.2)

    // Leap Slam State Machine
    if (this.isLeaping) {
      this.leapTimer += dt
      this.group.position.x += (this.leapTarget.x - this.group.position.x) * dt * 4.0
      this.group.position.z += (this.leapTarget.z - this.group.position.z) * dt * 4.0

      if (this.leapTimer >= 1.1) {
        this.isLeaping = false
        this.triggerSlamShockwave()
        this.fireRadialDiscs(10)
      }
    } else {
      this.group.rotation.y = Math.atan2(dx, dz)

      if (dist > 5.0) {
        this.group.position.x += (dx / dist) * dt * 3.2
        this.group.position.z += (dz / dist) * dt * 3.2
      }

      if (this.attackTimer >= (this.phase === 1 ? 2.5 : 1.8)) {
        this.attackTimer = 0
        if (Math.random() < 0.45) {
          this.isLeaping = true
          this.leapTimer = 0
          this.leapTarget.x = playerX
          this.leapTarget.z = playerZ
          this.rig.triggerLeapSlam(1.1)
        } else {
          this.rig.triggerDiscThrow(0.6)
          this.fireFanDiscs(playerX, playerZ, 5)
          onSummonHorde()
        }
      }
    }

    // Update Shockwave Expansion
    let shockwaveHit = false
    if (this.empWaveMesh.scale.x > 0.1 && this.empWaveMesh.scale.x < 18) {
      this.empWaveMesh.scale.x += dt * 18.0
      this.empWaveMesh.scale.z += dt * 18.0
      const currentRadius = this.empWaveMesh.scale.x * 1.2
      const distToPlayer = Math.sqrt((playerX - this.group.position.x) ** 2 + (dz) ** 2)
      if (Math.abs(distToPlayer - currentRadius) < 1.4) {
        shockwaveHit = true
      }
      const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 1.0 - this.empWaveMesh.scale.x / 18)
    }

    this.updateProjectiles(dt)

    if (this.timer >= this.maxTime) {
      this.active = false
      this.group.visible = false
      return { won: true, shockwaveActive: false }
    }

    return { won: false, shockwaveActive: shockwaveHit }
  }

  private triggerSlamShockwave(): void {
    this.empWaveMesh.scale.set(0.1, 1, 0.1)
    const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
    mat.opacity = 0.95
    console.log('[juice] CyberLeek Slam — heavy shockwave')
  }

  private fireFanDiscs(playerX: number, playerZ: number, count: number): void {
    const baseAngle = Math.atan2(playerX - this.group.position.x, playerZ - this.group.position.z)
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 0.25
      const angle = baseAngle + offset
      const p = this.attacks.find((a) => !a.active)
      if (p) {
        p.x = this.group.position.x
        p.z = this.group.position.z
        p.vx = Math.sin(angle) * 11.0
        p.vz = Math.cos(angle) * 11.0
        p.active = true
        p.life = 3.2
      }
    }
  }

  private fireRadialDiscs(count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const p = this.attacks.find((a) => !a.active)
      if (p) {
        p.x = this.group.position.x
        p.z = this.group.position.z
        p.vx = Math.cos(angle) * 9.5
        p.vz = Math.sin(angle) * 9.5
        p.active = true
        p.life = 3.2
      }
    }
  }

  private updateProjectiles(dt: number): void {
    for (let i = 0; i < this.maxAttacks; i++) {
      const a = this.attacks[i]
      if (!a || !a.active) {
        this.dummy.position.set(0, -999, 0)
        this.dummy.updateMatrix()
        this.attackMesh.setMatrixAt(i, this.dummy.matrix)
        continue
      }

      a.x += a.vx * dt
      a.z += a.vz * dt
      a.life -= dt

      if (a.life <= 0 || a.x < 0 || a.x > 48 || a.z < 0 || a.z > 36) {
        a.active = false
      }

      this.dummy.position.set(a.x, 0.45, a.z)
      this.dummy.rotation.y += dt * 18.0
      this.dummy.updateMatrix()
      this.attackMesh.setMatrixAt(i, this.dummy.matrix)
    }
    this.attackMesh.instanceMatrix.needsUpdate = true
  }

  public getActiveDiscs(): { x: number; z: number; radius: number }[] {
    return this.attacks.filter((a) => a.active).map((a) => ({ x: a.x, z: a.z, radius: a.radius }))
  }
}

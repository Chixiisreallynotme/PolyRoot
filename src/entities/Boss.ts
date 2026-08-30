import * as THREE from 'three'

// Boss CyberLeek — Rebuilt 100% faithfully from official artwork (media_1788096782282.png)
// Features:
// - Swept-back 3 green leek foliage leaves
// - Pale green face with pixel sunglasses and ^w^ smirk
// - Cobalt Blue Tactical Exoskeleton Armor with glowing cyan piping
// - Shoulder pauldrons, combat belt with pouches, knee pads, and glowing cyan energy fists
// - Dynamic Combat Suite: Tactical Leap Slam, 5-Way Disc Blades, and Crypto Invocations

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
  public readonly mesh: THREE.Group
  public active = false
  public timer = 0
  public maxTime = 35 // 35s survival
  public phase: 1 | 2 = 1

  public attacks: BossAttack[] = []
  private attackMesh: THREE.InstancedMesh
  private dummy = new THREE.Object3D()
  private maxAttacks = 60
  private attackTimer = 0
  private empWaveMesh: THREE.Mesh

  private isLeaping = false
  private leapTimer = 0
  private leapTarget = { x: 18, z: 13 }
  private fistLeft: THREE.Mesh
  private fistRight: THREE.Mesh

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group()
    this.group.position.set(24, 0, 18)
    this.mesh = this.buildCyberLeekExactModel()
    this.group.add(this.mesh)

    // Glowing Fist Energy Mesh references
    const fistGeo = new THREE.SphereGeometry(0.35, 8, 8)
    const fistMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    this.fistLeft = new THREE.Mesh(fistGeo, fistMat)
    this.fistLeft.position.set(-1.4, 1.2, 0.4)
    this.fistRight = new THREE.Mesh(fistGeo, fistMat)
    this.fistRight.position.set(1.4, 1.2, 0.4)
    this.mesh.add(this.fistLeft, this.fistRight)

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

  private buildCyberLeekExactModel(): THREE.Group {
    const leek = new THREE.Group()

    const leafGreenMat = new THREE.MeshLambertMaterial({ color: 0x22c55e, flatShading: true })
    const facePaleMat = new THREE.MeshLambertMaterial({ color: 0xdcfce7, flatShading: true })
    const cobaltBlueMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8, flatShading: true })
    const darkNavyMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true })
    const cyanPipingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const blackGlassesMat = new THREE.MeshLambertMaterial({ color: 0x050505, flatShading: true })

    // 1. Pale Green Stalk Head with ^w^ Smirk
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.8, 10), facePaleMat)
    head.position.y = 3.6
    head.castShadow = true
    leek.add(head)

    // Pixelated Tactical Sunglasses
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 0.25), blackGlassesMat)
    glasses.position.set(0, 3.8, 0.72)
    leek.add(glasses)

    // Cat-like Smirk Smile (^w^)
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.1), cobaltBlueMat)
    mouth.position.set(0, 3.3, 0.72)
    leek.add(mouth)

    // 2. Swept-Back 3 Green Leek Foliage Leaves
    const leafOffsets = [
      { angleX: -0.65, angleZ: 0.35, len: 2.8, y: 4.8 },
      { angleX: -0.85, angleZ: 0.0, len: 3.4, y: 5.1 },
      { angleX: -0.65, angleZ: -0.35, len: 2.8, y: 4.8 },
    ]
    for (const lo of leafOffsets) {
      const leafGeo = new THREE.CylinderGeometry(0.2, 0.35, lo.len, 6)
      const leafMesh = new THREE.Mesh(leafGeo, leafGreenMat)
      leafMesh.rotation.x = lo.angleX
      leafMesh.rotation.z = lo.angleZ
      leafMesh.position.set(0, lo.y, -0.6)
      leafMesh.castShadow = true
      leek.add(leafMesh)
    }

    // 3. Cobalt Blue Tactical Bodysuit Torso with Glowing Cyan Accent Piping
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.2), cobaltBlueMat)
    torso.position.y = 2.2
    torso.castShadow = true
    leek.add(torso)

    // Chest Armor Plating & Collar
    const armorPlate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.3), darkNavyMat)
    armorPlate.position.set(0, 2.3, 0.55)
    leek.add(armorPlate)

    const cyanStripeH = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.1), cyanPipingMat)
    cyanStripeH.position.set(0, 2.5, 0.68)
    const cyanStripeV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.1), cyanPipingMat)
    cyanStripeV.position.set(0, 2.1, 0.68)
    leek.add(cyanStripeH, cyanStripeV)

    // Tactical High Collar
    const collar = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 1.3), cobaltBlueMat)
    collar.position.set(0, 3.0, 0)
    leek.add(collar)

    // 4. Shoulder Pauldrons & Armored Arms
    const pauldronGeo = new THREE.BoxGeometry(0.65, 0.55, 0.65)
    const pauldronL = new THREE.Mesh(pauldronGeo, darkNavyMat)
    pauldronL.position.set(-1.25, 2.8, 0)
    const pauldronR = new THREE.Mesh(pauldronGeo, darkNavyMat)
    pauldronR.position.set(1.25, 2.8, 0)
    leek.add(pauldronL, pauldronR)

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.4, 8)
    const armL = new THREE.Mesh(armGeo, cobaltBlueMat)
    armL.position.set(-1.25, 1.9, 0)
    const armR = new THREE.Mesh(armGeo, cobaltBlueMat)
    armR.position.set(1.25, 1.9, 0)
    leek.add(armL, armR)

    // 5. Utility Combat Belt & Pouches
    const belt = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 1.3), darkNavyMat)
    belt.position.set(0, 1.4, 0)
    leek.add(belt)

    const pouchL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.35), darkNavyMat)
    pouchL.position.set(-1.0, 1.3, 0)
    const pouchR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.35), darkNavyMat)
    pouchR.position.set(1.0, 1.3, 0)
    leek.add(pouchL, pouchR)

    // 6. Armored Legs & Heavy Combat Boots
    const legGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.2, 8)
    const legL = new THREE.Mesh(legGeo, cobaltBlueMat)
    legL.position.set(-0.55, 0.8, 0)
    const legR = new THREE.Mesh(legGeo, cobaltBlueMat)
    legR.position.set(0.55, 0.8, 0)
    leek.add(legL, legR)

    // Knee Armor Pads
    const kneeL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.2), darkNavyMat)
    kneeL.position.set(-0.55, 0.75, 0.28)
    const kneeR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.2), darkNavyMat)
    kneeR.position.set(0.55, 0.75, 0.28)
    leek.add(kneeL, kneeR)

    // Heavy Boots
    const bootGeo = new THREE.BoxGeometry(0.5, 0.45, 0.8)
    const bootL = new THREE.Mesh(bootGeo, darkNavyMat)
    bootL.position.set(-0.55, 0.22, 0.15)
    bootL.castShadow = true
    const bootR = new THREE.Mesh(bootGeo, darkNavyMat)
    bootR.position.set(0.55, 0.22, 0.15)
    bootR.castShadow = true
    leek.add(bootL, bootR)

    return leek
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

    // Glow pulsating fists
    const fistPulse = 0.9 + Math.sin(Date.now() * 0.01) * 0.2
    this.fistLeft.scale.set(fistPulse, fistPulse, fistPulse)
    this.fistRight.scale.set(fistPulse, fistPulse, fistPulse)

    // Leap Slam State Machine
    if (this.isLeaping) {
      this.leapTimer += dt
      const t = this.leapTimer / 1.1 // 1.1s total leap
      this.group.position.x += (this.leapTarget.x - this.group.position.x) * dt * 4.0
      this.group.position.z += (this.leapTarget.z - this.group.position.z) * dt * 4.0
      this.mesh.position.y = Math.sin(t * Math.PI) * 4.5

      if (this.leapTimer >= 1.1) {
        this.isLeaping = false
        this.mesh.position.y = 0
        this.triggerSlamShockwave()
        this.fireRadialDiscs(10)
      }
    } else {
      // Rotate towards player & follow
      const dx = playerX - this.group.position.x
      const dz = playerZ - this.group.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      this.mesh.rotation.y = Math.atan2(dx, dz)

      if (dist > 5.0) {
        this.group.position.x += (dx / dist) * dt * 3.2
        this.group.position.z += (dz / dist) * dt * 3.2
      }

      // Attack triggers
      if (this.attackTimer >= (this.phase === 1 ? 2.5 : 1.8)) {
        this.attackTimer = 0
        if (Math.random() < 0.45) {
          // Trigger Tactical Leap Slam
          this.isLeaping = true
          this.leapTimer = 0
          this.leapTarget.x = playerX
          this.leapTarget.z = playerZ
        } else {
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
      const dx = playerX - this.group.position.x
      const dz = playerZ - this.group.position.z
      const distToPlayer = Math.sqrt(dx * dx + dz * dz)
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

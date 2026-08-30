import * as THREE from 'three'

// Boss CyberLeek — Tactical GTA6 Leaker Leek anthropomorph
// White/Green stalk body, black tactical balaclava, combat harness with game discs, spiky leafy top hair
// 35s Survival Boss fight in 2 phases:
// Phase 1 (0-20s): Tactical Invocations & Disc blades
// Phase 2 (20-35s): Radial Disc Storm + Green EMP Knockback Shockwaves

export interface BossAttack {
  type: 'disc' | 'wave' | 'summon'
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

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group()
    this.group.position.set(18, 0, 13) // Central CPU Socket position
    this.mesh = this.buildTacticalLeekModel()
    this.group.add(this.mesh)

    // EMP Shockwave ring (Phase 2)
    const empGeo = new THREE.RingGeometry(0.5, 1.2, 32)
    empGeo.rotateX(-Math.PI / 2)
    const empMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.empWaveMesh = new THREE.Mesh(empGeo, empMat)
    this.empWaveMesh.position.y = 0.05
    this.group.add(this.empWaveMesh)

    // Instanced Projectiles for Spinning Game Discs & Poireaux blades
    const discGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.06, 12)
    const discMat = new THREE.MeshLambertMaterial({ color: 0x22aaff, flatShading: true })
    this.attackMesh = new THREE.InstancedMesh(discGeo, discMat, this.maxAttacks)
    this.attackMesh.castShadow = true
    scene.add(this.attackMesh)

    for (let i = 0; i < this.maxAttacks; i++) {
      this.attacks.push({ type: 'disc', x: 0, z: 0, vx: 0, vz: 0, radius: 0.4, active: false, life: 0 })
    }

    this.group.visible = false
    scene.add(this.group)
  }

  private buildTacticalLeekModel(): THREE.Group {
    const leekGroup = new THREE.Group()

    const stalkWhiteMat = new THREE.MeshLambertMaterial({ color: 0xedf2f7, flatShading: true })
    const stalkGreenMat = new THREE.MeshLambertMaterial({ color: 0x48bb78, flatShading: true })
    const darkLeafMat = new THREE.MeshLambertMaterial({ color: 0x22543d, flatShading: true })
    const tacticalBlackMat = new THREE.MeshLambertMaterial({ color: 0x171923, flatShading: true })
    const eyeYellowMat = new THREE.MeshLambertMaterial({ color: 0xffe066, flatShading: true })
    const discSilverMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e0, flatShading: true })

    // 1. Lower White Vegetable Stalk Body
    const lowerStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.8, 10), stalkWhiteMat)
    lowerStalk.position.y = 0.9
    lowerStalk.castShadow = true
    leekGroup.add(lowerStalk)

    // 2. Upper Green Gradient Stalk
    const upperStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.7, 1.6, 10), stalkGreenMat)
    upperStalk.position.y = 2.4
    upperStalk.castShadow = true
    leekGroup.add(upperStalk)

    // 3. Black Tactical Balaclava (Cagoule) covering head
    const balaclava = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 1.4), tacticalBlackMat)
    balaclava.position.set(0, 3.2, 0)
    balaclava.castShadow = true
    leekGroup.add(balaclava)

    // Glowing Yellow Tactical Goggle Eye Slits
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.1), eyeYellowMat)
    eyeL.position.set(-0.3, 3.25, 0.7)
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.1), eyeYellowMat)
    eyeR.position.set(0.3, 3.25, 0.7)
    leekGroup.add(eyeL, eyeR)

    // 4. Tactical Combat Chest Harness (Webbing straps + GTA6 Game Disc shield)
    const strapH = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 1.5), tacticalBlackMat)
    strapH.position.set(0, 1.6, 0)
    leekGroup.add(strapH)

    // Physical Game Disc Buckle on Chest
    const gameDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 12), discSilverMat)
    gameDisc.rotateX(Math.PI / 2)
    gameDisc.position.set(0, 1.6, 0.8)
    leekGroup.add(gameDisc)

    // Tactical Pouches on hips
    const pouchL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), tacticalBlackMat)
    pouchL.position.set(-0.85, 1.1, 0)
    const pouchR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), tacticalBlackMat)
    pouchR.position.set(0.85, 1.1, 0)
    leekGroup.add(pouchL, pouchR)

    // 5. Spiky Dark Green Leafy Top Hair (Poireau foliage)
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.25, 2.2, 4), darkLeafMat)
      const angle = (i / 6) * Math.PI * 2
      leaf.position.set(Math.cos(angle) * 0.35, 4.5, Math.sin(angle) * 0.35)
      leaf.rotation.z = Math.cos(angle) * 0.45
      leaf.rotation.x = Math.sin(angle) * 0.45
      leaf.castShadow = true
      leekGroup.add(leaf)
    }

    return leekGroup
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

    // Phase transition at 20s
    if (this.timer >= 20 && this.phase === 1) {
      this.phase = 2
      console.log('[boss] CyberLeek enters Phase 2 — Radial Disc Storm & EMP Shockwave!')
    }

    // Boss animated bobbing & rotation towards player
    this.mesh.position.y = Math.sin(this.timer * 3) * 0.2
    const dx = playerX - this.group.position.x
    const dz = playerZ - this.group.position.z
    this.mesh.rotation.y = Math.atan2(dx, dz)

    // Attacks execution
    if (this.phase === 1) {
      // Phase 1: Throws 3-way fan of spinning discs every 2s
      if (this.attackTimer >= 2.0) {
        this.attackTimer = 0
        this.fireFanDiscs(playerX, playerZ, 3)
        onSummonHorde()
      }
    } else {
      // Phase 2: Radial 8-way disc storm every 1.5s + EMP wave
      if (this.attackTimer >= 1.4) {
        this.attackTimer = 0
        this.fireRadialDiscs(8)
        this.triggerEmpWave()
      }
    }

    // Update EMP wave visual
    let shockwaveHit = false
    if (this.empWaveMesh.scale.x > 0.1 && this.empWaveMesh.scale.x < 18) {
      this.empWaveMesh.scale.x += dt * 16.0
      this.empWaveMesh.scale.z += dt * 16.0
      const currentRadius = this.empWaveMesh.scale.x * 1.2
      const distToPlayer = Math.sqrt(dx * dx + dz * dz)
      if (Math.abs(distToPlayer - currentRadius) < 1.2) {
        shockwaveHit = true
      }
      const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 1.0 - this.empWaveMesh.scale.x / 18)
    }

    // Update active projectiles
    this.updateProjectiles(dt)

    if (this.timer >= this.maxTime) {
      this.active = false
      this.group.visible = false
      return { won: true, shockwaveActive: false }
    }

    return { won: false, shockwaveActive: shockwaveHit }
  }

  private triggerEmpWave(): void {
    this.empWaveMesh.scale.set(0.1, 1, 0.1)
    const mat = this.empWaveMesh.material as THREE.MeshBasicMaterial
    mat.opacity = 0.9
  }

  private fireFanDiscs(playerX: number, playerZ: number, count: number): void {
    const baseAngle = Math.atan2(playerX - this.group.position.x, playerZ - this.group.position.z)
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 0.3
      const angle = baseAngle + offset
      const p = this.attacks.find((a) => !a.active)
      if (p) {
        p.x = this.group.position.x
        p.z = this.group.position.z
        p.vx = Math.sin(angle) * 9.5
        p.vz = Math.cos(angle) * 9.5
        p.active = true
        p.life = 3.5
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
        p.vx = Math.cos(angle) * 8.5
        p.vz = Math.sin(angle) * 8.5
        p.active = true
        p.life = 3.5
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

      if (a.life <= 0 || a.x < 0 || a.x > 36 || a.z < 0 || a.z > 26) {
        a.active = false
      }

      this.dummy.position.set(a.x, 0.4, a.z)
      this.dummy.rotation.y += dt * 15.0 // Spinning disc blade
      this.dummy.updateMatrix()
      this.attackMesh.setMatrixAt(i, this.dummy.matrix)
    }
    this.attackMesh.instanceMatrix.needsUpdate = true
  }

  public getActiveDiscs(): { x: number; z: number; radius: number }[] {
    return this.attacks.filter((a) => a.active).map((a) => ({ x: a.x, z: a.z, radius: a.radius }))
  }
}

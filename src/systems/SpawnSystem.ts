import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import { CryptoType, CryptoInstance, CRYPTO_DEFS } from '../entities/Crypto'
import { CryptoTextureGenerator } from '../entities/CryptoTextureGenerator'

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

function setSolidUVs(geo: THREE.BufferGeometry, u: number, v: number): THREE.BufferGeometry {
  const uvAttr = geo.attributes.uv
  if (uvAttr) {
    for (let i = 0; i < uvAttr.count; i++) {
      uvAttr.setXY(i, u, v)
    }
    uvAttr.needsUpdate = true
  }
  return geo
}

function flipGeometryUVsX(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const uvAttr = geo.attributes.uv
  if (uvAttr) {
    for (let i = 0; i < uvAttr.count; i++) {
      uvAttr.setX(i, 1.0 - uvAttr.getX(i))
    }
    uvAttr.needsUpdate = true
  }
  return geo
}

export class SpawnSystem {
  public instances: CryptoInstance[] = []
  private maxTotalEnemies = 30
  private dummy = new THREE.Object3D()
  private dummyProj = new THREE.Object3D()

  private meshes: Map<CryptoType, THREE.InstancedMesh> = new Map()
  private projectileMesh: THREE.InstancedMesh
  private projectiles: { x: number; z: number; vx: number; vz: number; active: boolean; life: number }[] = []
  private maxProjectiles = 60

  private spawnTimer = 0
  private spawnInterval = 1.4

  constructor(scene: THREE.Scene) {
    // 1. BTC Full Upright Character Compound & Material
    const btcGeo = this.createBtcFullCharacterGeometry()
    const btcTex = CryptoTextureGenerator.createBtcTexture()
    const btcMat = new THREE.MeshLambertMaterial({
      map: btcTex,
      color: 0xffffff,
      flatShading: true,
    })

    // 2. DOGE Full Upright Character Compound & Material
    const dogeGeo = this.createDogeFullCharacterGeometry()
    const dogeTex = CryptoTextureGenerator.createDogeTexture()
    const dogeMat = new THREE.MeshLambertMaterial({
      map: dogeTex,
      color: 0xffffff,
      flatShading: true,
    })

    // 3. PEPE Full Upright Character Compound & Material
    const pepeGeo = this.createPepeFullCharacterGeometry()
    const pepeTex = CryptoTextureGenerator.createPepeTexture()
    const pepeMat = new THREE.MeshLambertMaterial({
      map: pepeTex,
      color: 0xffffff,
      flatShading: true,
    })

    btcGeo.computeBoundsTree()
    dogeGeo.computeBoundsTree()
    pepeGeo.computeBoundsTree()

    const btcMesh = new THREE.InstancedMesh(btcGeo, btcMat, this.maxTotalEnemies)
    const dogeMesh = new THREE.InstancedMesh(dogeGeo, dogeMat, this.maxTotalEnemies)
    const pepeMesh = new THREE.InstancedMesh(pepeGeo, pepeMat, this.maxTotalEnemies)

    btcMesh.castShadow = true
    dogeMesh.castShadow = true
    pepeMesh.castShadow = true

    this.meshes.set('btc', btcMesh)
    this.meshes.set('doge', dogeMesh)
    this.meshes.set('pepe', pepeMesh)

    scene.add(btcMesh, dogeMesh, pepeMesh)

    // Projectiles InstancedMesh for PEPE energy blasts
    const projGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 6)
    projGeo.rotateX(Math.PI / 2)
    const projMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    this.projectileMesh = new THREE.InstancedMesh(projGeo, projMat, this.maxProjectiles)
    scene.add(this.projectileMesh)

    for (let i = 0; i < this.maxProjectiles; i++) {
      this.projectiles.push({ x: 0, z: 0, vx: 0, vz: 0, active: false, life: 0 })
    }

    this.dummy.position.set(0, -999, 0)
    this.dummy.updateMatrix()
    for (let i = 0; i < this.maxTotalEnemies; i++) {
      btcMesh.setMatrixAt(i, this.dummy.matrix)
      dogeMesh.setMatrixAt(i, this.dummy.matrix)
      pepeMesh.setMatrixAt(i, this.dummy.matrix)
    }
    btcMesh.instanceMatrix.needsUpdate = true
    dogeMesh.instanceMatrix.needsUpdate = true
    pepeMesh.instanceMatrix.needsUpdate = true

    this.spawnInitialEnemies(24, 18)
  }

  private createBtcFullCharacterGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = []

    // 1. Upright Coin Front Face (Circle with perfect [0,1] UVs matching ₿ emblem)
    const frontFace = new THREE.CircleGeometry(0.95, 16)
    frontFace.translate(0, 1.25, 0.16)
    parts.push(frontFace)

    // 2. Upright Coin Back Face (With proper colored metallic coin texture and unmirrored emblem)
    const backFace = new THREE.CircleGeometry(0.95, 16)
    backFace.rotateY(Math.PI)
    flipGeometryUVsX(backFace)
    backFace.translate(0, 1.25, -0.16)
    parts.push(backFace)

    // 3. Coin Cylindrical Metallic Rim (mapped to bottom-right metallic bronze)
    const rim = new THREE.CylinderGeometry(0.95, 0.95, 0.32, 16, 1, true)
    rim.rotateX(Math.PI / 2)
    setSolidUVs(rim, 0.95, 0.05)
    rim.translate(0, 1.25, 0)
    parts.push(rim)

    // 4. Two Heavyweight Legs (mapped to bottom-left golden orange)
    const legL = setSolidUVs(new THREE.CylinderGeometry(0.11, 0.11, 0.62, 6), 0.05, 0.05)
    legL.translate(-0.38, 0.5, 0)
    const legR = setSolidUVs(new THREE.CylinderGeometry(0.11, 0.11, 0.62, 6), 0.05, 0.05)
    legR.translate(0.38, 0.5, 0)
    parts.push(legL, legR)

    // 5. Two Chunky Combat Boots (mapped to top-right dark navy)
    const bootL = setSolidUVs(new THREE.BoxGeometry(0.44, 0.32, 0.64), 0.95, 0.95)
    bootL.translate(-0.38, 0.16, 0.12)
    const bootR = setSolidUVs(new THREE.BoxGeometry(0.44, 0.32, 0.64), 0.95, 0.95)
    bootR.translate(0.38, 0.16, 0.12)
    parts.push(bootL, bootR)

    // 6. Boxing Champion Arms & Big White Boxing Gloves
    const armL = setSolidUVs(new THREE.CylinderGeometry(0.1, 0.1, 0.72, 6), 0.05, 0.05)
    armL.rotateZ(Math.PI / 3.2)
    armL.translate(-0.98, 1.15, 0.12)
    const armR = setSolidUVs(new THREE.CylinderGeometry(0.1, 0.1, 0.72, 6), 0.05, 0.05)
    armR.rotateZ(-Math.PI / 3.2)
    armR.translate(0.98, 1.15, 0.12)

    // Heavy Boxing Gloves (mapped to top-left pure white)
    const gloveL = setSolidUVs(new THREE.SphereGeometry(0.38, 8, 8), 0.05, 0.95)
    gloveL.translate(-1.35, 1.2, 0.48)
    const gloveR = setSolidUVs(new THREE.SphereGeometry(0.38, 8, 8), 0.05, 0.95)
    gloveR.translate(1.35, 1.2, 0.48)
    parts.push(armL, armR, gloveL, gloveR)

    const merged = BufferGeometryUtils.mergeGeometries(parts)
    return merged || new THREE.BoxGeometry(1, 1, 1)
  }

  private createDogeFullCharacterGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = []

    // 1. Upright Coin Front Face (With Ð emblem and Shiba muzzle)
    const frontFace = new THREE.CircleGeometry(0.85, 16)
    frontFace.translate(0, 1.1, 0.14)
    parts.push(frontFace)

    // 2. Upright Coin Back Face (With proper colored metallic coin texture and unmirrored emblem)
    const backFace = new THREE.CircleGeometry(0.85, 16)
    backFace.rotateY(Math.PI)
    flipGeometryUVsX(backFace)
    backFace.translate(0, 1.1, -0.14)
    parts.push(backFace)

    // 3. Metallic Rim
    const rim = new THREE.CylinderGeometry(0.85, 0.85, 0.28, 16, 1, true)
    rim.rotateX(Math.PI / 2)
    setSolidUVs(rim, 0.95, 0.05)
    rim.translate(0, 1.1, 0)
    parts.push(rim)

    // 4. Shiba Inu Pointed Triangular Ears on Top (mapped to golden yellow)
    const earL = setSolidUVs(new THREE.ConeGeometry(0.28, 0.58, 4), 0.05, 0.05)
    earL.rotateZ(0.35)
    earL.translate(-0.52, 1.92, 0)
    const earR = setSolidUVs(new THREE.ConeGeometry(0.28, 0.58, 4), 0.05, 0.05)
    earR.rotateZ(-0.35)
    earR.translate(0.52, 1.92, 0)
    parts.push(earL, earR)

    // 5. Agile Canine Legs & Dark Brown Paws
    const legL = setSolidUVs(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 6), 0.05, 0.05)
    legL.translate(-0.32, 0.45, 0)
    const legR = setSolidUVs(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 6), 0.05, 0.05)
    legR.translate(0.32, 0.45, 0)
    const pawL = setSolidUVs(new THREE.SphereGeometry(0.25, 6, 6), 0.95, 0.95)
    pawL.translate(-0.32, 0.15, 0.1)
    const pawR = setSolidUVs(new THREE.SphereGeometry(0.25, 6, 6), 0.95, 0.95)
    pawR.translate(0.32, 0.15, 0.1)
    parts.push(legL, legR, pawL, pawR)

    // 6. White Swiping Paws (mapped to top-left pure white)
    const armL = setSolidUVs(new THREE.SphereGeometry(0.3, 6, 6), 0.05, 0.95)
    armL.translate(-0.92, 1.02, 0.42)
    const armR = setSolidUVs(new THREE.SphereGeometry(0.3, 6, 6), 0.05, 0.95)
    armR.translate(0.92, 1.02, 0.42)
    parts.push(armL, armR)

    const merged = BufferGeometryUtils.mergeGeometries(parts)
    return merged || new THREE.BoxGeometry(1, 1, 1)
  }

  private createPepeFullCharacterGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = []

    // 1. Upright Coin Front Face (With iconic Frog eyes & smirk)
    const frontFace = new THREE.CircleGeometry(0.88, 16)
    frontFace.translate(0, 1.1, 0.14)
    parts.push(frontFace)

    // 2. Upright Coin Back Face (With proper colored metallic coin texture and unmirrored emblem)
    const backFace = new THREE.CircleGeometry(0.88, 16)
    backFace.rotateY(Math.PI)
    flipGeometryUVsX(backFace)
    backFace.translate(0, 1.1, -0.14)
    parts.push(backFace)

    // 3. Metallic Green Rim
    const rim = new THREE.CylinderGeometry(0.88, 0.88, 0.28, 16, 1, true)
    rim.rotateX(Math.PI / 2)
    setSolidUVs(rim, 0.95, 0.05)
    rim.translate(0, 1.1, 0)
    parts.push(rim)

    // 4. Protruding Frog Eye Shells on Top (mapped to white)
    const eyeShellL = setSolidUVs(new THREE.SphereGeometry(0.34, 8, 8), 0.05, 0.95)
    eyeShellL.translate(-0.46, 1.95, 0.04)
    const eyeShellR = setSolidUVs(new THREE.SphereGeometry(0.34, 8, 8), 0.05, 0.95)
    eyeShellR.translate(0.46, 1.95, 0.04)
    parts.push(eyeShellL, eyeShellR)

    // 5. Spring Legs & Dark Green Webbed Feet
    const legL = setSolidUVs(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 6), 0.05, 0.05)
    legL.translate(-0.35, 0.45, 0)
    const legR = setSolidUVs(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 6), 0.05, 0.05)
    legR.translate(0.35, 0.45, 0)
    const footL = setSolidUVs(new THREE.BoxGeometry(0.46, 0.12, 0.54), 0.95, 0.95)
    footL.translate(-0.35, 0.1, 0.15)
    const footR = setSolidUVs(new THREE.BoxGeometry(0.46, 0.12, 0.54), 0.95, 0.95)
    footR.translate(0.35, 0.1, 0.15)
    parts.push(legL, legR, footL, footR)

    // 6. Extending Stretchy Arms & White Boxing Gloves for Slap Combos
    const armL = setSolidUVs(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 6), 0.05, 0.05)
    armL.rotateZ(Math.PI / 3)
    armL.translate(-0.88, 0.88, 0.22)
    const armR = setSolidUVs(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 6), 0.05, 0.05)
    armR.rotateZ(-Math.PI / 3)
    armR.translate(0.88, 0.88, 0.22)
    const gloveL = setSolidUVs(new THREE.SphereGeometry(0.34, 8, 8), 0.05, 0.95)
    gloveL.translate(-1.22, 0.98, 0.48)
    const gloveR = setSolidUVs(new THREE.SphereGeometry(0.34, 8, 8), 0.05, 0.95)
    gloveR.translate(1.22, 0.98, 0.48)
    parts.push(armL, armR, gloveL, gloveR)

    const merged = BufferGeometryUtils.mergeGeometries(parts)
    return merged || new THREE.BoxGeometry(1, 1, 1)
  }

  private spawnInitialEnemies(playerX: number, playerZ: number): void {
    const initialOffsets = [
      { dx: -7, dz: -6, type: 'doge' as CryptoType },
      { dx: 7, dz: -6, type: 'btc' as CryptoType },
      { dx: -8, dz: 6, type: 'pepe' as CryptoType },
      { dx: 8, dz: 6, type: 'doge' as CryptoType },
      { dx: 0, dz: -9, type: 'btc' as CryptoType },
    ]

    for (let i = 0; i < initialOffsets.length; i++) {
      const off = initialOffsets[i]
      if (!off) continue
      const def = CRYPTO_DEFS[off.type]
      this.instances.push({
        id: i,
        type: off.type,
        x: playerX + off.dx,
        z: playerZ + off.dz,
        vx: 0,
        vz: 0,
        hp: def.hp,
        maxHp: def.hp,
        speed: def.speed,
        radius: def.size * 0.75,
        active: true,
        shootCooldown: 1.5,
        animTime: Math.random() * 5,
        rotationY: 0,
      })
    }
  }

  update(
    dt: number,
    playerX: number,
    playerZ: number,
    pucesHeated: number,
    motherboard?: {
      checkCollision: (x: number, z: number, radius?: number, y?: number) => { collided: boolean; pushX: number; pushZ: number }
      getSupportHeight?: (x: number, z: number, radius?: number) => number
    }
  ): void {
    this.spawnTimer += dt
    const effectiveInterval = Math.max(0.6, this.spawnInterval - pucesHeated * 0.12)
    const activeCount = this.instances.filter((e) => e.active).length
    const maxAllowed = Math.min(this.maxTotalEnemies, 14 + pucesHeated * 3)

    if (this.spawnTimer >= effectiveInterval && activeCount < maxAllowed) {
      this.spawnTimer = 0
      this.spawnRandomEnemy(playerX, playerZ, pucesHeated)
    }

    for (const inst of this.instances) {
      if (!inst.active) continue

      inst.animTime += dt * 16.0

      const dx = playerX - inst.x
      const dz = playerZ - inst.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist > 0.1) {
        inst.vx = (dx / dist) * inst.speed
        inst.vz = (dz / dist) * inst.speed
        inst.rotationY = Math.atan2(dx, dz)
      }

      if (inst.type === 'pepe') {
        if (dist < 6.0) {
          inst.vx = -(dx / dist) * inst.speed * 0.8
          inst.vz = -(dz / dist) * inst.speed * 0.8
        }
        inst.shootCooldown -= dt
        if (inst.shootCooldown <= 0 && dist < 16.0) {
          inst.shootCooldown = 1.8
          this.fireProjectile(inst.x, inst.z, (dx / dist) * 12.0, (dz / dist) * 12.0)
        }
      }

      inst.x += inst.vx * dt
      inst.z += inst.vz * dt

      // Motherboard Physical Component Collisions & Step Heights for Enemies
      const targetFloorY = motherboard && motherboard.getSupportHeight
        ? motherboard.getSupportHeight(inst.x, inst.z, inst.radius)
        : 0
      inst.floorY = targetFloorY
      inst.y = inst.y !== undefined ? THREE.MathUtils.damp(inst.y, targetFloorY, 14, dt) : targetFloorY

      if (motherboard) {
        const col = motherboard.checkCollision(inst.x, inst.z, inst.radius, inst.y)
        if (col.collided) {
          inst.x += col.pushX
          inst.z += col.pushZ
        }
      }

      // Keep enemies safely on the PCB substrate
      inst.x = Math.max(2.0, Math.min(46.0, inst.x))
      inst.z = Math.max(2.0, Math.min(34.0, inst.z))
    }

    this.updateProjectiles(dt, motherboard)
    this.renderInstances(playerX, playerZ)
  }

  private spawnRandomEnemy(playerX: number, playerZ: number, pucesHeated: number): void {
    const types: CryptoType[] = ['doge', 'doge', 'btc', 'pepe']
    if (pucesHeated >= 2) types.push('pepe', 'btc')
    if (pucesHeated >= 5) types.push('btc', 'btc', 'pepe')

    const type: CryptoType = types[Math.floor(Math.random() * types.length)] ?? 'doge'
    const def = CRYPTO_DEFS[type]

    const angle = Math.random() * Math.PI * 2
    const spawnDist = 12.0 + Math.random() * 5.0
    const x = Math.max(3, Math.min(45, playerX + Math.cos(angle) * spawnDist))
    const z = Math.max(3, Math.min(33, playerZ + Math.sin(angle) * spawnDist))

    const existing = this.instances.find((e) => !e.active)
    if (existing) {
      existing.type = type
      existing.x = x
      existing.z = z
      existing.vx = 0
      existing.vz = 0
      existing.hp = def.hp
      existing.maxHp = def.hp
      existing.speed = def.speed
      existing.radius = def.size * 0.75
      existing.active = true
      existing.shootCooldown = 1.0 + Math.random()
      existing.animTime = Math.random() * 10
      existing.rotationY = 0
    } else if (this.instances.length < this.maxTotalEnemies) {
      this.instances.push({
        id: this.instances.length,
        type,
        x,
        z,
        vx: 0,
        vz: 0,
        hp: def.hp,
        maxHp: def.hp,
        speed: def.speed,
        radius: def.size * 0.75,
        active: true,
        shootCooldown: 1.0 + Math.random(),
        animTime: Math.random() * 10,
        rotationY: 0,
      })
    }
  }

  private fireProjectile(x: number, z: number, vx: number, vz: number): void {
    const p = this.projectiles.find((proj) => !proj.active)
    if (p) {
      p.x = x
      p.z = z
      p.vx = vx
      p.vz = vz
      p.active = true
      p.life = 2.8
    }
  }

  private updateProjectiles(
    dt: number,
    motherboard?: { checkCollision: (x: number, z: number, radius?: number, y?: number) => { collided: boolean; pushX: number; pushZ: number } }
  ): void {
    for (let i = 0; i < this.maxProjectiles; i++) {
      const p = this.projectiles[i]
      if (!p || !p.active) {
        this.dummyProj.position.set(0, -999, 0)
        this.dummyProj.updateMatrix()
        this.projectileMesh.setMatrixAt(i, this.dummyProj.matrix)
        continue
      }

      p.x += p.vx * dt
      p.z += p.vz * dt
      p.life -= dt

      // Despawn if expired or out of PCB motherboard bounds
      if (p.life <= 0 || p.x < 1.0 || p.x > 47.0 || p.z < 1.0 || p.z > 35.0) {
        p.active = false
        p.life = 0
        this.dummyProj.position.set(0, -999, 0)
        this.dummyProj.updateMatrix()
        this.projectileMesh.setMatrixAt(i, this.dummyProj.matrix)
        continue
      }

      // Check collision with motherboard physical components
      if (motherboard) {
        const col = motherboard.checkCollision(p.x, p.z, 0.25, 0.45)
        if (col.collided) {
          p.active = false
          p.life = 0
          this.dummyProj.position.set(0, -999, 0)
          this.dummyProj.updateMatrix()
          this.projectileMesh.setMatrixAt(i, this.dummyProj.matrix)
          continue
        }
      }

      this.dummyProj.position.set(p.x, 0.45, p.z)
      this.dummyProj.rotation.y = Math.atan2(p.vx, p.vz)
      this.dummyProj.updateMatrix()
      this.projectileMesh.setMatrixAt(i, this.dummyProj.matrix)
    }
    this.projectileMesh.instanceMatrix.needsUpdate = true
  }

  public getActiveProjectiles(): { id: number; x: number; z: number; radius: number }[] {
    const active: { id: number; x: number; z: number; radius: number }[] = []
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i]
      if (p && p.active && p.life > 0 && p.x >= 1.0 && p.x <= 47.0 && p.z >= 1.0 && p.z <= 35.0) {
        active.push({ id: i, x: p.x, z: p.z, radius: 0.4 })
      }
    }
    return active
  }

  public despawnProjectile(id: number): void {
    const p = this.projectiles[id]
    if (p && p.active) {
      p.active = false
      p.life = 0
      this.dummyProj.position.set(0, -999, 0)
      this.dummyProj.updateMatrix()
      this.projectileMesh.setMatrixAt(id, this.dummyProj.matrix)
      this.projectileMesh.instanceMatrix.needsUpdate = true
    }
  }

  private renderInstances(playerX = 24, playerZ = 18): void {
    const counts: Record<CryptoType, number> = { btc: 0, doge: 0, pepe: 0 }

    for (const inst of this.instances) {
      if (!inst.active) continue

      const mesh = this.meshes.get(inst.type)
      if (!mesh) continue

      const index = counts[inst.type]++
      if (index >= this.maxTotalEnemies) continue

      const dx = playerX - inst.x
      const dz = playerZ - inst.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      const isAttacking = dist < 3.8

      const baseFloorY = inst.y ?? 0
      let posX = inst.x
      let posY = baseFloorY
      let posZ = inst.z
      let rotX = -0.28
      let rotY = inst.rotationY
      let rotZ = 0
      let scaleX = 1.0
      let scaleY = 1.0
      let scaleZ = 1.0

      if (inst.type === 'btc') {
        // 1. BTC: Heavyweight boxing champion with rapid alternating left/right boxing glove jabs
        if (isAttacking) {
          const tAtk = inst.animTime * 3.8
          const jabPulse = Math.abs(Math.sin(tAtk)) * 0.58
          const jabRoll = Math.sin(tAtk) * 0.32
          const jabYaw = Math.sin(tAtk) * 0.22
          const duckBob = Math.abs(Math.sin(tAtk * 1.5)) * 0.16

          posX += Math.sin(inst.rotationY) * jabPulse
          posY = baseFloorY + duckBob
          posZ += Math.cos(inst.rotationY) * jabPulse

          rotX = -0.36
          rotY += jabYaw
          rotZ = jabRoll

          scaleY = 0.94 + Math.sin(tAtk * 2.0) * 0.10
          scaleX = 1.05 / Math.sqrt(scaleY)
          scaleZ = scaleX
        } else {
          const trotBounce = Math.abs(Math.sin(inst.animTime * 1.6)) * 0.22
          const swaggerRoll = Math.sin(inst.animTime * 1.6) * 0.14

          posY = baseFloorY + trotBounce
          rotX = -0.26
          rotZ = swaggerRoll

          scaleY = 1.0 + Math.sin(inst.animTime * 3.2) * 0.08
          scaleX = 1.0 / Math.sqrt(scaleY)
          scaleZ = scaleX
        }
      } else if (inst.type === 'doge') {
        // 2. DOGE: Shiba Inu lunge with leaping paw claws/swipes
        if (isAttacking) {
          const tPounce = inst.animTime * 2.8
          const leapY = Math.max(0, Math.sin(tPounce)) * 0.85
          const lungeForward = Math.cos(tPounce) * 0.68
          const clawSwipeRoll = Math.sin(inst.animTime * 5.6) * 0.42

          posX += Math.sin(inst.rotationY) * lungeForward
          posY = baseFloorY + leapY
          posZ += Math.cos(inst.rotationY) * lungeForward

          rotX = -0.42 + Math.sin(tPounce) * 0.24
          rotZ = clawSwipeRoll

          const isAirborne = Math.sin(tPounce) > 0
          scaleY = isAirborne ? 1.25 : 0.78
          scaleX = isAirborne ? 0.88 : 1.18
          scaleZ = scaleX
        } else {
          const trotBounce = Math.abs(Math.sin(inst.animTime * 2.8)) * 0.30
          const tailWagYaw = Math.sin(inst.animTime * 3.5) * 0.18
          const trotRoll = Math.sin(inst.animTime * 2.8) * 0.15

          posY = baseFloorY + trotBounce
          rotX = -0.28
          rotY += tailWagYaw
          rotZ = trotRoll

          scaleY = 1.0 + Math.sin(inst.animTime * 5.6) * 0.10
          scaleX = 1.0 / Math.sqrt(scaleY)
          scaleZ = scaleX
        }
      } else if (inst.type === 'pepe') {
        // 3. PEPE: Spring-loaded frog leap with extending stretchy arms and white boxing glove slap combo
        if (isAttacking) {
          const tSlap = inst.animTime * 3.2
          const leapY = Math.max(0, Math.sin(tSlap * 0.75)) * 1.15
          const slapReach = Math.sin(tSlap) * 0.85
          const slapRoll = Math.sin(tSlap * 1.5) * 0.46

          posX += Math.sin(inst.rotationY) * slapReach
          posY = baseFloorY + leapY
          posZ += Math.cos(inst.rotationY) * slapReach

          rotX = -0.24 + Math.cos(tSlap) * 0.28
          rotZ = slapRoll

          const isAir = leapY > 0.1
          scaleY = isAir ? 1.45 : 0.65
          scaleX = isAir ? 0.75 : 1.35
          scaleZ = scaleX
        } else {
          const hopY = Math.max(0, Math.sin(inst.animTime * 2.2)) * 0.45
          const hopForward = Math.max(0, Math.sin(inst.animTime * 2.2)) * 0.22
          const hopRoll = Math.sin(inst.animTime * 2.2) * 0.20

          posX += Math.sin(inst.rotationY) * hopForward
          posY = baseFloorY + hopY
          posZ += Math.cos(inst.rotationY) * hopForward

          rotX = -0.25
          rotZ = hopRoll

          scaleY = hopY > 0.05 ? 1.22 : 0.82
          scaleX = hopY > 0.05 ? 0.88 : 1.15
          scaleZ = scaleX
        }
      }

      this.dummy.position.set(posX, posY, posZ)
      this.dummy.rotation.set(rotX, rotY, rotZ)
      this.dummy.scale.set(scaleX, scaleY, scaleZ)
      this.dummy.updateMatrix()

      mesh.setMatrixAt(index, this.dummy.matrix)
    }

    this.dummy.position.set(0, -999, 0)
    this.dummy.updateMatrix()
    for (const type of ['btc', 'doge', 'pepe'] as CryptoType[]) {
      const mesh = this.meshes.get(type)
      if (!mesh) continue
      for (let i = counts[type]; i < this.maxTotalEnemies; i++) {
        mesh.setMatrixAt(i, this.dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }
  }

  public damageEnemy(id: number, damage = 1): { killed: boolean; x: number; z: number; type: CryptoType } | null {
    const inst = this.instances.find((e) => e.id === id && e.active)
    if (!inst) return null

    inst.hp -= damage
    if (inst.hp <= 0) {
      inst.active = false
      return { killed: true, x: inst.x, z: inst.z, type: inst.type }
    }
    return { killed: false, x: inst.x, z: inst.z, type: inst.type }
  }
}

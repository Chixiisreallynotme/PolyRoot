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
    // 1. BTC Full Character Compound & Material
    const btcGeo = this.createBtcFullCharacterGeometry()
    const btcTex = CryptoTextureGenerator.createBtcTexture()
    const btcMat = new THREE.MeshLambertMaterial({
      map: btcTex,
      color: 0xffffff,
      flatShading: true,
    })

    // 2. DOGE Full Character Compound & Material
    const dogeGeo = this.createDogeFullCharacterGeometry()
    const dogeTex = CryptoTextureGenerator.createDogeTexture()
    const dogeMat = new THREE.MeshLambertMaterial({
      map: dogeTex,
      color: 0xffffff,
      flatShading: true,
    })

    // 3. PEPE Full Character Compound & Material
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

    // 1. Upright Circle Front Face Disk (Naturally upright UVs: U in [0,1], V in [0,1])
    const frontFace = new THREE.CircleGeometry(0.92, 24)
    frontFace.translate(0, 1.2, 0.18)
    parts.push(frontFace)

    // 2. Coin Rim and Back Cylinder (Solid orange UVs: (0.04, 0.95))
    const coinBody = setSolidUVs(new THREE.CylinderGeometry(0.9, 0.9, 0.35, 20), 0.04, 0.95)
    coinBody.rotateX(Math.PI / 2)
    coinBody.translate(0, 1.2, 0)
    parts.push(coinBody)

    // 3. Two Rubber-Hose Legs (Solid orange UVs)
    const legL = setSolidUVs(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6), 0.04, 0.95)
    legL.translate(-0.35, 0.5, 0)
    const legR = setSolidUVs(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6), 0.04, 0.95)
    legR.translate(0.35, 0.5, 0)
    parts.push(legL, legR)

    // 4. Two Big Cartoon Boots (Solid dark charcoal UVs: (0.95, 0.04))
    const bootL = setSolidUVs(new THREE.BoxGeometry(0.38, 0.3, 0.58), 0.95, 0.04)
    bootL.translate(-0.35, 0.15, 0.1)
    const bootR = setSolidUVs(new THREE.BoxGeometry(0.38, 0.3, 0.58), 0.95, 0.04)
    bootR.translate(0.35, 0.15, 0.1)
    parts.push(bootL, bootR)

    // 5. Boxing Arms & Big White Boxing Gloves (Solid white UVs: (0.04, 0.04))
    const armL = setSolidUVs(new THREE.CylinderGeometry(0.09, 0.09, 0.65, 6), 0.04, 0.95)
    armL.rotateZ(Math.PI / 3)
    armL.translate(-0.9, 1.05, 0.15)
    const armR = setSolidUVs(new THREE.CylinderGeometry(0.09, 0.09, 0.65, 6), 0.04, 0.95)
    armR.rotateZ(-Math.PI / 3)
    armR.translate(0.9, 1.05, 0.15)

    const gloveL = setSolidUVs(new THREE.SphereGeometry(0.35, 8, 8), 0.04, 0.04)
    gloveL.translate(-1.25, 1.15, 0.45)
    const gloveR = setSolidUVs(new THREE.SphereGeometry(0.35, 8, 8), 0.04, 0.04)
    gloveR.translate(1.25, 1.15, 0.45)
    parts.push(armL, armR, gloveL, gloveR)

    const merged = BufferGeometryUtils.mergeGeometries(parts)
    return merged || new THREE.BoxGeometry(1, 1, 1)
  }

  private createDogeFullCharacterGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = []

    // 1. Upright Circle Front Face Disk (Shiba Inu face + Ð symbol)
    const frontFace = new THREE.CircleGeometry(0.8, 24)
    frontFace.translate(0, 1.0, 0.16)
    parts.push(frontFace)

    // 2. Coin Body
    const coinBody = setSolidUVs(new THREE.CylinderGeometry(0.78, 0.78, 0.3, 20), 0.04, 0.95)
    coinBody.rotateX(Math.PI / 2)
    coinBody.translate(0, 1.0, 0)
    parts.push(coinBody)

    // 3. Shiba Inu Triangular Ears on Top (Solid yellow UVs)
    const earL = setSolidUVs(new THREE.ConeGeometry(0.28, 0.55, 4), 0.04, 0.95)
    earL.rotateZ(0.35)
    earL.translate(-0.48, 1.8, 0)
    const earR = setSolidUVs(new THREE.ConeGeometry(0.28, 0.55, 4), 0.04, 0.95)
    earR.rotateZ(-0.35)
    earR.translate(0.48, 1.8, 0)
    parts.push(earL, earR)

    // 4. Legs & Feet
    const legL = setSolidUVs(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 6), 0.04, 0.95)
    legL.translate(-0.3, 0.45, 0)
    const legR = setSolidUVs(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 6), 0.04, 0.95)
    legR.translate(0.3, 0.45, 0)
    const pawL = setSolidUVs(new THREE.SphereGeometry(0.22, 6, 6), 0.04, 0.04)
    pawL.translate(-0.3, 0.15, 0.1)
    const pawR = setSolidUVs(new THREE.SphereGeometry(0.22, 6, 6), 0.04, 0.04)
    pawR.translate(0.3, 0.15, 0.1)
    parts.push(legL, legR, pawL, pawR)

    // 5. Front White Boxing Paws
    const armL = setSolidUVs(new THREE.SphereGeometry(0.28, 6, 6), 0.04, 0.04)
    armL.translate(-0.85, 0.9, 0.35)
    const armR = setSolidUVs(new THREE.SphereGeometry(0.28, 6, 6), 0.04, 0.04)
    armR.translate(0.85, 0.9, 0.35)
    parts.push(armL, armR)

    const merged = BufferGeometryUtils.mergeGeometries(parts)
    return merged || new THREE.BoxGeometry(1, 1, 1)
  }

  private createPepeFullCharacterGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = []

    // 1. Upright Circle Front Face Disk (Frog face with big eyes and red lips)
    const frontFace = new THREE.CircleGeometry(0.85, 24)
    frontFace.translate(0, 1.0, 0.16)
    parts.push(frontFace)

    // 2. Main Frog Coin Body
    const coinBody = setSolidUVs(new THREE.CylinderGeometry(0.82, 0.82, 0.3, 20), 0.04, 0.95)
    coinBody.rotateX(Math.PI / 2)
    coinBody.translate(0, 1.0, 0)
    parts.push(coinBody)

    // 3. Large Bulging Frog Eyeballs on Top (Solid green UVs)
    const eyeL = setSolidUVs(new THREE.SphereGeometry(0.32, 8, 8), 0.04, 0.95)
    eyeL.translate(-0.42, 1.85, 0.05)
    const eyeR = setSolidUVs(new THREE.SphereGeometry(0.32, 8, 8), 0.04, 0.95)
    eyeR.translate(0.42, 1.85, 0.05)
    parts.push(eyeL, eyeR)

    // 4. Spring Legs & Webbed Feet
    const legL = setSolidUVs(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 6), 0.04, 0.95)
    legL.translate(-0.35, 0.45, 0)
    const legR = setSolidUVs(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 6), 0.04, 0.95)
    legR.translate(0.35, 0.45, 0)
    const footL = setSolidUVs(new THREE.BoxGeometry(0.42, 0.12, 0.48), 0.95, 0.04)
    footL.translate(-0.35, 0.1, 0.15)
    const footR = setSolidUVs(new THREE.BoxGeometry(0.42, 0.12, 0.48), 0.95, 0.04)
    footR.translate(0.35, 0.1, 0.15)
    parts.push(legL, legR, footL, footR)

    // 5. Arms & White Boxing Gloves — Positioned properly at chest height
    const armL = setSolidUVs(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 6), 0.04, 0.95)
    armL.rotateZ(Math.PI / 3)
    armL.translate(-0.8, 0.75, 0.2)
    const armR = setSolidUVs(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 6), 0.04, 0.95)
    armR.rotateZ(-Math.PI / 3)
    armR.translate(0.8, 0.75, 0.2)
    const gloveL = setSolidUVs(new THREE.SphereGeometry(0.32, 8, 8), 0.04, 0.04)
    gloveL.translate(-1.15, 0.85, 0.45)
    const gloveR = setSolidUVs(new THREE.SphereGeometry(0.32, 8, 8), 0.04, 0.04)
    gloveR.translate(1.15, 0.85, 0.45)
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

  update(dt: number, playerX: number, playerZ: number, pucesHeated: number): void {
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
    }

    this.updateProjectiles(dt)
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

  private updateProjectiles(dt: number): void {
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

      if (p.life <= 0 || p.x < 0 || p.x > 48 || p.z < 0 || p.z > 36) {
        p.active = false
      }

      this.dummyProj.position.set(p.x, 0.45, p.z)
      this.dummyProj.rotation.y = Math.atan2(p.vx, p.vz)
      this.dummyProj.updateMatrix()
      this.projectileMesh.setMatrixAt(i, this.dummyProj.matrix)
    }
    this.projectileMesh.instanceMatrix.needsUpdate = true
  }

  public getActiveProjectiles(): { x: number; z: number; radius: number }[] {
    return this.projectiles.filter((p) => p.active).map((p) => ({ x: p.x, z: p.z, radius: 0.4 }))
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

      // Trot Bounce & Squash
      const trotBounce = Math.abs(Math.sin(inst.animTime)) * 0.22
      const trotSquash = 1.0 + Math.sin(inst.animTime * 2) * 0.12

      // Melee Punch Combo & Body Lunge
      const punchOffset = isAttacking ? Math.sin(inst.animTime * 2.5) * 0.55 : 0
      const bodyLungeX = isAttacking ? Math.sin(inst.animTime * 2.5) * 0.35 : 0.15

      this.dummy.position.set(
        inst.x + Math.sin(inst.rotationY) * punchOffset,
        trotBounce,
        inst.z + Math.cos(inst.rotationY) * punchOffset
      )
      this.dummy.rotation.y = inst.rotationY
      this.dummy.rotation.x = bodyLungeX
      this.dummy.rotation.z = Math.sin(inst.animTime) * (isAttacking ? 0.3 : 0.12)
      this.dummy.scale.set(1.0 / trotSquash, trotSquash, 1.0 / trotSquash)
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

import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import { CryptoType, CryptoInstance, CRYPTO_DEFS } from '../entities/Crypto'

// via three-mesh-bvh: computeBoundsTree + acceleratedRaycast O(log n)
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

// via threejs-perf: InstancedMesh(3) BTC/DOGE/PEPE + Compound Geometries with High Contrast Cuphead Limbs & Eyes
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
    // 1. BTC Compound Geometry (Massive Gold Coin + 2 Big Boots + Cartoon Eyes)
    const btcGeo = this.createBtcCompoundGeometry()
    const btcMat = new THREE.MeshLambertMaterial({
      color: 0xffa500,
      emissive: 0x442200,
      flatShading: true,
    })

    // 2. DOGE Compound Geometry (Bright Yellow Coin + Dog Ears + 4 Paws)
    const dogeGeo = this.createDogeCompoundGeometry()
    const dogeMat = new THREE.MeshLambertMaterial({
      color: 0xffe600,
      emissive: 0x443300,
      flatShading: true,
    })

    // 3. PEPE Compound Geometry (Electric Lime Green + Frog Eyes + Webbed Feet)
    const pepeGeo = this.createPepeCompoundGeometry()
    const pepeMat = new THREE.MeshLambertMaterial({
      color: 0x00ff66,
      emissive: 0x004411,
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
    const projGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.5, 6)
    projGeo.rotateX(Math.PI / 2)
    const projMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    this.projectileMesh = new THREE.InstancedMesh(projGeo, projMat, this.maxProjectiles)
    scene.add(this.projectileMesh)

    for (let i = 0; i < this.maxProjectiles; i++) {
      this.projectiles.push({ x: 0, z: 0, vx: 0, vz: 0, active: false, life: 0 })
    }

    // Hide all instances initially
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

    // Spawn 5 initial enemies immediately near player for instant action
    this.spawnInitialEnemies(18, 13)
  }

  private createBtcCompoundGeometry(): THREE.BufferGeometry {
    // Tall Upright Coin Body
    const coin = new THREE.CylinderGeometry(0.85, 0.85, 0.4, 10)
    coin.rotateX(Math.PI / 2)
    coin.translate(0, 0.95, 0)

    return coin
  }

  private createDogeCompoundGeometry(): THREE.BufferGeometry {
    const coin = new THREE.CylinderGeometry(0.65, 0.65, 0.35, 10)
    coin.rotateX(Math.PI / 2)
    coin.translate(0, 0.75, 0)

    return coin
  }

  private createPepeCompoundGeometry(): THREE.BufferGeometry {
    const coin = new THREE.CylinderGeometry(0.75, 0.75, 0.35, 8)
    coin.rotateX(Math.PI / 2)
    coin.translate(0, 0.85, 0)

    return coin
  }

  private spawnInitialEnemies(playerX: number, playerZ: number): void {
    const initialOffsets = [
      { dx: -7, dz: -6, type: 'doge' as CryptoType },
      { dx: 7, dz: -6, type: 'btc' as CryptoType },
      { dx: -8, dz: 6, type: 'pepe' as CryptoType },
      { dx: 8, dz: 6, type: 'doge' as CryptoType },
      { dx: 0, dz: -9, type: 'doge' as CryptoType },
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
        radius: def.size * 0.65,
        active: true,
        shootCooldown: 1.5,
        animTime: Math.random() * 5,
        rotationY: 0,
      })
    }
  }

  update(dt: number, playerX: number, playerZ: number, pucesHeated: number, onShoot?: (x: number, z: number, vx: number, vz: number) => void): void {
    // 1. Dynamic Spawning
    this.spawnTimer += dt
    const effectiveInterval = Math.max(0.6, this.spawnInterval - pucesHeated * 0.12)
    const activeCount = this.instances.filter((e) => e.active).length
    const maxAllowed = Math.min(this.maxTotalEnemies, 14 + pucesHeated * 3)

    if (this.spawnTimer >= effectiveInterval && activeCount < maxAllowed) {
      this.spawnTimer = 0
      this.spawnRandomEnemy(playerX, playerZ, pucesHeated)
    }

    // 2. Update Active Enemies with Cuphead Rubber-Hose Trot
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

      // PEPE Shooter Behavior
      if (inst.type === 'pepe') {
        if (dist < 6.0) {
          inst.vx = -(dx / dist) * inst.speed * 0.8
          inst.vz = -(dz / dist) * inst.speed * 0.8
        }
        inst.shootCooldown -= dt
        if (inst.shootCooldown <= 0 && dist < 14.0) {
          inst.shootCooldown = 1.8
          this.fireProjectile(inst.x, inst.z, (dx / dist) * 12.0, (dz / dist) * 12.0)
        }
      }

      inst.x += inst.vx * dt
      inst.z += inst.vz * dt
    }

    // 3. Update Projectiles
    this.updateProjectiles(dt)

    // 4. Batch matrix updates & force GPU upload
    this.renderInstances()
  }

  private spawnRandomEnemy(playerX: number, playerZ: number, pucesHeated: number): void {
    const types: CryptoType[] = ['doge', 'doge', 'btc', 'pepe']
    if (pucesHeated >= 2) types.push('pepe', 'btc')
    if (pucesHeated >= 5) types.push('btc', 'btc', 'pepe')

    const type: CryptoType = types[Math.floor(Math.random() * types.length)] ?? 'doge'
    const def = CRYPTO_DEFS[type]

    const angle = Math.random() * Math.PI * 2
    const spawnDist = 11.0 + Math.random() * 4.0
    const x = Math.max(2, Math.min(34, playerX + Math.cos(angle) * spawnDist))
    const z = Math.max(2, Math.min(24, playerZ + Math.sin(angle) * spawnDist))

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
      existing.radius = def.size * 0.65
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
        radius: def.size * 0.65,
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

      if (p.life <= 0 || p.x < 0 || p.x > 36 || p.z < 0 || p.z > 26) {
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

  private renderInstances(): void {
    const counts: Record<CryptoType, number> = { btc: 0, doge: 0, pepe: 0 }

    for (const inst of this.instances) {
      if (!inst.active) continue

      const mesh = this.meshes.get(inst.type)
      if (!mesh) continue

      const index = counts[inst.type]++
      if (index >= this.maxTotalEnemies) continue

      // Animated Trot & Lean
      const trotBounce = Math.abs(Math.sin(inst.animTime)) * 0.18
      const trotSquash = 1.0 + Math.sin(inst.animTime * 2) * 0.1

      this.dummy.position.set(inst.x, trotBounce, inst.z)
      this.dummy.rotation.y = inst.rotationY
      this.dummy.rotation.z = Math.sin(inst.animTime) * 0.15
      this.dummy.scale.set(1.0 / trotSquash, trotSquash, 1.0 / trotSquash)
      this.dummy.updateMatrix()

      mesh.setMatrixAt(index, this.dummy.matrix)
    }

    // Clear unused slots & update all GPU buffers
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

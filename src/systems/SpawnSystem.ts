import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'
import { CRYPTO_DEFS, type CryptoInstance, type CryptoType } from '../entities/Crypto'
import type { SpatialGrid } from './SpatialGrid'

// via threejs-perf: InstancedMesh(3) BTC/DOGE/PEPE 3 draw calls + setMatrixAt batched 9.9→0.5ms
// via three-mesh-bvh: computeBoundsTree + acceleratedRaycast O(log n)

// Attach BVH extension to THREE.BufferGeometry
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

export interface Projectile {
  id: number
  x: number
  z: number
  vx: number
  vz: number
  active: boolean
  lifetime: number
}

export class SpawnSystem {
  private instances: Map<CryptoType, CryptoInstance[]> = new Map()
  private meshes: Map<CryptoType, THREE.InstancedMesh> = new Map()
  private dummy = new THREE.Object3D()
  private nextId = 1
  private spawnTimer = 0
  private readonly maxTotalEnemies = 30
  private activeCount = 0

  // Projectiles pool for PEPE shooter (1 InstancedMesh)
  private projectileMesh: THREE.InstancedMesh
  private projectiles: Projectile[] = []
  private readonly maxProjectiles = 60

  constructor(private scene: THREE.Scene) {
    this.instances.set('btc', [])
    this.instances.set('doge', [])
    this.instances.set('pepe', [])

    // 3 InstancedMesh (BTC, DOGE, PEPE) = 3 draw calls total
    const btcGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 8)
    btcGeo.computeBoundsTree()
    const btcMat = new THREE.MeshLambertMaterial({ color: 0xff9900, flatShading: true })
    const btcMesh = new THREE.InstancedMesh(btcGeo, btcMat, this.maxTotalEnemies)
    btcMesh.castShadow = true
    btcMesh.receiveShadow = true
    btcMesh.count = 0
    this.meshes.set('btc', btcMesh)
    this.scene.add(btcMesh)

    const dogeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7)
    dogeGeo.computeBoundsTree()
    const dogeMat = new THREE.MeshLambertMaterial({ color: 0xffd700, flatShading: true })
    const dogeMesh = new THREE.InstancedMesh(dogeGeo, dogeMat, this.maxTotalEnemies)
    dogeMesh.castShadow = true
    dogeMesh.receiveShadow = true
    dogeMesh.count = 0
    this.meshes.set('doge', dogeMesh)
    this.scene.add(dogeMesh)

    const pepeGeo = new THREE.OctahedronGeometry(0.6, 0)
    pepeGeo.computeBoundsTree()
    const pepeMat = new THREE.MeshLambertMaterial({ color: 0x00ff66, flatShading: true })
    const pepeMesh = new THREE.InstancedMesh(pepeGeo, pepeMat, this.maxTotalEnemies)
    pepeMesh.castShadow = true
    pepeMesh.receiveShadow = true
    pepeMesh.count = 0
    this.meshes.set('pepe', pepeMesh)
    this.scene.add(pepeMesh)

    // Projectile mesh (1 draw call for enemy bullets)
    const projGeo = new THREE.SphereGeometry(0.18, 4, 4)
    projGeo.computeBoundsTree()
    const projMat = new THREE.MeshLambertMaterial({ color: 0xaaff00, emissive: 0x44aa00, flatShading: true })
    this.projectileMesh = new THREE.InstancedMesh(projGeo, projMat, this.maxProjectiles)
    this.projectileMesh.count = 0
    this.scene.add(this.projectileMesh)

    for (let i = 0; i < this.maxProjectiles; i++) {
      this.projectiles.push({ id: i, x: 0, z: 0, vx: 0, vz: 0, active: false, lifetime: 0 })
    }
  }

  spawnEnemy(type: CryptoType, x: number, z: number): CryptoInstance | null {
    if (this.activeCount >= this.maxTotalEnemies) return null
    const def = CRYPTO_DEFS[type]
    const list = this.instances.get(type)!
    let inst = list.find((it) => !it.active)
    if (!inst) {
      if (list.length >= this.maxTotalEnemies) return null
      inst = {
        id: this.nextId++,
        type,
        x,
        z,
        vx: 0,
        vz: 0,
        hp: def.hp,
        maxHp: def.hp,
        speed: def.speed,
        radius: def.size * 0.5,
        active: true,
        shootCooldown: Math.random() * 2,
      }
      list.push(inst)
    } else {
      inst.x = x
      inst.z = z
      inst.hp = def.hp
      inst.maxHp = def.hp
      inst.active = true
      inst.shootCooldown = Math.random() * 2
    }
    this.activeCount++
    return inst
  }

  spawnWave(type: CryptoType, count: number, center: { x: number; z: number }): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 12 + Math.random() * 6
      const x = Math.max(2, Math.min(28, center.x + Math.cos(angle) * dist))
      const z = Math.max(2, Math.min(18, center.z + Math.sin(angle) * dist))
      this.spawnEnemy(type, x, z)
    }
  }

  update(dt: number, playerPos: { x: number; z: number }, grid: SpatialGrid): void {
    this.spawnTimer += dt
    if (this.spawnTimer >= 3.0 && this.activeCount < this.maxTotalEnemies) {
      this.spawnTimer = 0
      const rand = Math.random()
      if (rand < 0.4) {
        this.spawnWave('doge', 3, playerPos)
      } else if (rand < 0.75) {
        this.spawnWave('pepe', 2, playerPos)
      } else {
        this.spawnWave('btc', 1, playerPos)
      }
    }

    // Update enemies with spatial grid
    const types: CryptoType[] = ['btc', 'doge', 'pepe']
    for (const type of types) {
      const list = this.instances.get(type)!
      const mesh = this.meshes.get(type)!
      let meshIdx = 0

      for (let i = 0; i < list.length; i++) {
        const inst = list[i]!
        if (!inst.active) continue

        const dx = playerPos.x - inst.x
        const dz = playerPos.z - inst.z
        const dist = Math.sqrt(dx * dx + dz * dz)

        // AI behavior
        if (dist > 0.1) {
          const dirX = dx / dist
          const dirZ = dz / dist

          if (inst.type === 'pepe') {
            // Keep medium distance and shoot
            if (dist < 4.0) {
              inst.x -= dirX * inst.speed * dt * 0.8
              inst.z -= dirZ * inst.speed * dt * 0.8
            } else if (dist > 8.0) {
              inst.x += dirX * inst.speed * dt
              inst.z += dirZ * inst.speed * dt
            }
            inst.shootCooldown -= dt
            if (inst.shootCooldown <= 0) {
              inst.shootCooldown = 2.5 + Math.random() * 0.5
              this.spawnProjectile(inst.x, inst.z, dirX * 5.0, dirZ * 5.0)
            }
          } else {
            // Move towards player
            inst.x += dirX * inst.speed * dt
            inst.z += dirZ * inst.speed * dt
          }
        }

        // Clamp to board boundaries
        inst.x = Math.max(1.0, Math.min(29.0, inst.x))
        inst.z = Math.max(1.0, Math.min(19.0, inst.z))

        // Update SpatialGrid
        grid.update({ id: inst.id, x: inst.x, z: inst.z, radius: inst.radius })

        // Update InstancedMesh transform via setMatrixAt
        this.dummy.position.set(inst.x, inst.radius, inst.z)
        this.dummy.rotation.y += dt * (inst.type === 'doge' ? 3.0 : 1.0)
        this.dummy.updateMatrix()
        mesh.setMatrixAt(meshIdx, this.dummy.matrix)
        meshIdx++
      }

      mesh.count = meshIdx
      mesh.instanceMatrix.needsUpdate = true
    }

    // Update projectiles
    let pMeshIdx = 0
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i]!
      if (!p.active) continue
      p.x += p.vx * dt
      p.z += p.vz * dt
      p.lifetime -= dt
      if (p.lifetime <= 0 || p.x < 0 || p.x > 30 || p.z < 0 || p.z > 20) {
        p.active = false
        continue
      }
      this.dummy.position.set(p.x, 0.4, p.z)
      this.dummy.updateMatrix()
      this.projectileMesh.setMatrixAt(pMeshIdx, this.dummy.matrix)
      pMeshIdx++
    }
    this.projectileMesh.count = pMeshIdx
    this.projectileMesh.instanceMatrix.needsUpdate = true
  }

  private spawnProjectile(x: number, z: number, vx: number, vz: number): void {
    const p = this.projectiles.find((it) => !it.active)
    if (!p) return
    p.x = x
    p.z = z
    p.vx = vx
    p.vz = vz
    p.active = true
    p.lifetime = 4.0
  }

  killEnemy(id: number, grid: SpatialGrid): CryptoInstance | null {
    for (const list of this.instances.values()) {
      const inst = list.find((it) => it.active && it.id === id)
      if (inst) {
        inst.active = false
        this.activeCount = Math.max(0, this.activeCount - 1)
        grid.remove(id)
        return inst
      }
    }
    return null
  }

  getActiveEnemies(): CryptoInstance[] {
    const result: CryptoInstance[] = []
    for (const list of this.instances.values()) {
      for (const inst of list) {
        if (inst.active) result.push(inst)
      }
    }
    return result
  }

  getActiveProjectiles(): Projectile[] {
    return this.projectiles.filter((p) => p.active)
  }

  get totalActive(): number {
    return this.activeCount
  }

  clear(): void {
    for (const list of this.instances.values()) {
      for (const it of list) it.active = false
    }
    for (const p of this.projectiles) p.active = false
    for (const mesh of this.meshes.values()) {
      mesh.count = 0
      mesh.instanceMatrix.needsUpdate = true
    }
    this.projectileMesh.count = 0
    this.projectileMesh.instanceMatrix.needsUpdate = true
    this.activeCount = 0
  }
}

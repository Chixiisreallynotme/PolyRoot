import * as THREE from 'three'
import enemiesData from '../data/enemies.json'

// via threejs-materials: MeshLambert flatShading ONLY
// Data-driven Crypto types (BTC / DOGE / PEPE)

export type CryptoType = 'btc' | 'doge' | 'pepe'

export interface CryptoInstance {
  id: number
  type: CryptoType
  x: number
  z: number
  vx: number
  vz: number
  hp: number
  maxHp: number
  speed: number
  radius: number
  active: boolean
  shootCooldown: number
}

export interface CryptoDef {
  id: string
  name: string
  role: string
  behavior: string
  hp: number
  speed: number
  color: string
  size: number
  damage: number
  score: number
}

export const CRYPTO_DEFS: Record<CryptoType, CryptoDef> = enemiesData as Record<CryptoType, CryptoDef>

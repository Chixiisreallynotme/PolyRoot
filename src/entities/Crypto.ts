import * as THREE from 'three'
import enemiesData from '../data/enemies.json'

// Crypto enemy definitions with Cuphead/Mickey style cartoon limbs
// BTC (Tank with trotting boots), DOGE (Swarm with bouncy paws), PEPE (Shooter with springy legs)

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
  animTime: number
  rotationY: number
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

export const CRYPTO_DEFS: Record<CryptoType, CryptoDef> = {
  btc: {
    id: 'btc',
    name: 'BTC',
    role: 'Tank',
    behavior: 'tank',
    hp: 4,
    speed: 2.2, // +40% rebalanced speed
    color: '#FF9900',
    size: 1.5,
    damage: 1,
    score: 60,
  },
  doge: {
    id: 'doge',
    name: 'DOGE',
    role: 'Swarm',
    behavior: 'swarm',
    hp: 2,
    speed: 4.0, // +40% rebalanced speed
    color: '#FFD700',
    size: 0.9,
    damage: 1,
    score: 25,
  },
  pepe: {
    id: 'pepe',
    name: 'PEPE',
    role: 'Shooter',
    behavior: 'shooter',
    hp: 3,
    speed: 3.0, // +40% rebalanced speed
    color: '#00FF66',
    size: 1.1,
    damage: 1,
    score: 45,
  },
}

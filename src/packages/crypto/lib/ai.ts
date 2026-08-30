import type { Result } from '../../core'
import { ok, err } from '../../core'

// data-driven enemies.json {hp,speed,behavior: tank|swarm|shooter}

export type Behavior = 'tank' | 'swarm' | 'shooter'

export interface EnemyDef {
  hp: number
  speed: number
  behavior: Behavior
}

export class CryptoAI {
  decide(def: EnemyDef, distToPlayer: number): Result<string, string> {
    if (def.hp <= 0) return err('dead')
    if (def.behavior === 'tank') return ok('push straight')
    if (def.behavior === 'swarm' && distToPlayer < 2) return ok('swarm')
    if (def.behavior === 'shooter' && distToPlayer < 8) return ok('shoot')
    return ok('chase')
  }
}

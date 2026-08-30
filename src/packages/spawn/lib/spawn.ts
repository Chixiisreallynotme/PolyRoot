import type { Result } from '../../core'
import { ok, err } from '../../core'

// via procedural-gen: seededShuffle 8/20 sans overlap

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  let s = seed
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296
    const j = s % (i + 1)
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

export class SpawnSystem {
  pickSpots(allSpots: { x: number; z: number }[], n: number, seed: number): Result<{ x: number; z: number }[], string> {
    if (n > allSpots.length) return err('n > spots')
    const shuffled = seededShuffle(allSpots, seed)
    return ok(shuffled.slice(0, n))
  }
}

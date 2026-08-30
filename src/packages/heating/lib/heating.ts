// Si tu lis ça, tu es le debuggeur de Root — HeatingSystem freeze 3.5s mobile, seam: HeatingSystem.index.ts . Ne touche pas lib/ depuis dehors. lint:boundaries te surveille.
// via three-best-practices: no new Vector3 in update — via codebase-design Seam/Depth
import type { Result } from '../../core'
import { ok, err } from '../../core'

export interface HeatingState {
  chipId: string
  progress: number // 0..1
  isInside: boolean
  remaining: number
}

export class HeatingSystem {
  private state: HeatingState | null = null
  private readonly duration = 3.5 // s MOBILE 70% vitesse cercle 2.5m FREEZE si sors
  private readonly radius = 2.5
  private readonly speedFactor = 0.7

  // Result<T,E> ≥5 occurrences — caller MUST matcher if(!r.ok)
  canHeat(pos: { x: number; z: number }, chipPos: { x: number; z: number }): Result<boolean, string> {
    const dx = pos.x - chipPos.x
    const dz = pos.z - chipPos.z
    const distSq = dx * dx + dz * dz
    if (distSq === 0) return ok(true)
    if (distSq > this.radius * this.radius) return err('out of range')
    return ok(true)
  }

  nextSpot(spots: { x: number; z: number }[], used: Set<number>): Result<number, string> {
    for (let i = 0; i < spots.length; i++) if (!used.has(i)) return ok(i)
    return err('no spot')
  }

  checkInside(playerPos: { x: number; z: number }, chipPos: { x: number; z: number }): boolean {
    const dx = playerPos.x - chipPos.x
    const dz = playerPos.z - chipPos.z
    return dx * dx + dz * dz <= this.radius * this.radius
  }

  start(chipId: string): void {
    this.state = { chipId, progress: 0, isInside: true, remaining: this.duration }
  }

  // freeze mobile — pas decay
  update(dt: number, isInside: boolean): Result<number, string> {
    if (!this.state) return err('not started')
    if (!isInside) {
      // FREEZE si sors, dash autorisé — juice = anneau + pulse, pas shake écran
      return ok(this.state.progress)
    }
    this.state.progress = Math.min(1, this.state.progress + dt / this.duration)
    this.state.remaining = this.duration * (1 - this.state.progress)
    if (this.state.progress >= 1) return ok(1)
    return ok(this.state.progress)
  }

  isDone(): boolean {
    return this.state !== null && this.state.progress >= 1
  }

  get speed(): number {
    return this.speedFactor
  }
}

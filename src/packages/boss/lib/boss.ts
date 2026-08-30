import type { Result } from '../../core'
import { ok, err } from '../../core'

// Boss 35s 2 phases (0-20s invoke 4-6/5s, 20-35s poireaux cercle 8/3s + onde verte/10s)

export class Boss {
  private t = 0
  constructor(private readonly duration = 35) {}

  update(dt: number): Result<string, string> {
    this.t += dt
    if (this.t > this.duration) return ok('victory')
    if (this.t < 20) {
      if (Math.floor(this.t / 5) !== Math.floor((this.t - dt) / 5)) return ok('invoke 4-6 cryptos')
    } else {
      if (Math.floor(this.t / 3) !== Math.floor((this.t - dt) / 3)) return ok('poireaux cercle 8')
      if (Math.floor(this.t / 10) !== Math.floor((this.t - dt) / 10)) return ok('onde verte')
    }
    return err('no event')
  }

  get time(): number {
    return this.t
  }
}

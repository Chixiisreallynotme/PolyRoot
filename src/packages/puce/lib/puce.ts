import type { Result } from '../../core'
import { ok, err } from '../../core'

export class Puce {
  constructor(public readonly id: string, public exploded = false) {}

  explode(): Result<boolean, string> {
    if (this.exploded) return err('already exploded')
    this.exploded = true
    return ok(true)
  }
}

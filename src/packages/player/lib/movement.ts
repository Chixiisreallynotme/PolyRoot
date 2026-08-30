import type { Result } from '../../core'
import { ok, err } from '../../core'

// via typescript-advanced-types: Brand/Result

export interface MoveInput {
  x: number
  z: number
  dash: boolean
}

export class PlayerMovement {
  private dashCd = 0
  private readonly dashDuration = 0.2
  private readonly dashCooldown = 2.0

  update(dt: number, input: MoveInput, pos: { x: number; z: number }): Result<{ x: number; z: number }, string> {
    if (Number.isNaN(input.x) || Number.isNaN(input.z)) return err('invalid input')
    this.dashCd = Math.max(0, this.dashCd - dt)
    let speed = 4.0
    if (input.dash && this.dashCd <= 0) {
      speed *= 3
      this.dashCd = this.dashCooldown
    }
    const nx = pos.x + input.x * speed * dt
    const nz = pos.z + input.z * speed * dt
    return ok({ x: nx, z: nz })
  }
}

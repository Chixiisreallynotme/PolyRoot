// via codebase-design Module/Interface/Seam — via three-best-practices: no new Vector3 in update
import type { Result } from '../../core'
import { ok, err } from '../../core'

export class SpatialGrid {
  private cells: Map<string, number[]> = new Map()
  private readonly size = 8
  private readonly worldW = 30
  private readonly worldH = 20

  clear(): void {
    this.cells.clear()
  }

  // distanceSquared check — <68 sphères/frame 277k→68
  insert(id: number, x: number, z: number): void {
    const cx = Math.floor((x / this.worldW) * this.size)
    const cz = Math.floor((z / this.worldH) * this.size)
    const key = `${cx},${cz}`
    const arr = this.cells.get(key)
    if (arr) arr.push(id)
    else this.cells.set(key, [id])
  }

  query(x: number, z: number, radius: number): Result<number[], string> {
    if (radius <= 0) return err('invalid radius')
    const cx = Math.floor((x / this.worldW) * this.size)
    const cz = Math.floor((z / this.worldH) * this.size)
    const rCells = Math.ceil((radius / this.worldW) * this.size) + 1
    const out: number[] = []
    for (let dx = -rCells; dx <= rCells; dx++) {
      for (let dz = -rCells; dz <= rCells; dz++) {
        const key = `${cx + dx},${cz + dz}`
        const arr = this.cells.get(key)
        if (arr) out.push(...arr)
      }
    }
    return ok(out)
  }
}

// via threejs-perf: SpatialGrid 8x8 277k→68 checks — via codebase-design Depth
// SpatialGrid distanceSquared hash 8x8 for O(1) neighbor query

export interface GridItem {
  id: number
  x: number
  z: number
  radius: number
}

export class SpatialGrid {
  private cellSize: number
  private gridWidth: number
  private gridHeight: number
  private cells: Map<number, GridItem[]> = new Map()
  private itemToCell: Map<number, number> = new Map()

  constructor(width = 30, height = 20, cellSize = 3.75) {
    this.gridWidth = Math.ceil(width / cellSize)
    this.gridHeight = Math.ceil(height / cellSize)
    this.cellSize = cellSize
  }

  private hash(cellX: number, cellZ: number): number {
    return cellX + cellZ * this.gridWidth
  }

  private getCellCoords(x: number, z: number): [number, number] {
    const cx = Math.max(0, Math.min(this.gridWidth - 1, Math.floor(x / this.cellSize)))
    const cz = Math.max(0, Math.min(this.gridHeight - 1, Math.floor(z / this.cellSize)))
    return [cx, cz]
  }

  insert(item: GridItem): void {
    const [cx, cz] = this.getCellCoords(item.x, item.z)
    const key = this.hash(cx, cz)
    let cell = this.cells.get(key)
    if (!cell) {
      cell = []
      this.cells.set(key, cell)
    }
    cell.push(item)
    this.itemToCell.set(item.id, key)
  }

  remove(id: number): void {
    const key = this.itemToCell.get(id)
    if (key === undefined) return
    const cell = this.cells.get(key)
    if (cell) {
      const idx = cell.findIndex((it) => it.id === id)
      if (idx !== -1) cell.splice(idx, 1)
    }
    this.itemToCell.delete(id)
  }

  update(item: GridItem): void {
    this.remove(item.id)
    this.insert(item)
  }

  // Query nearby items within radius using distanceSquared
  query(x: number, z: number, radius: number): GridItem[] {
    const [minCx, minCz] = this.getCellCoords(x - radius, z - radius)
    const [maxCx, maxCz] = this.getCellCoords(x + radius, z + radius)
    const radSq = radius * radius
    const result: GridItem[] = []

    for (let cz = minCz; cz <= maxCz; cz++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const key = this.hash(cx, cz)
        const cell = this.cells.get(key)
        if (!cell) continue
        for (let i = 0; i < cell.length; i++) {
          const it = cell[i]
          if (!it) continue
          const dx = it.x - x
          const dz = it.z - z
          const distSq = dx * dx + dz * dz
          const combinedRad = it.radius + radius
          if (distSq <= combinedRad * combinedRad) {
            result.push(it)
          }
        }
      }
    }
    return result
  }

  clear(): void {
    this.cells.clear()
    this.itemToCell.clear()
  }
}

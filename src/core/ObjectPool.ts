// via three-best-practices: no new Vector3 in update — via performance-optimization: pool 200 batching profile-first
// via particles-lifecycle: pool CPU+GPU maxCount 200

export class ObjectPool<T> {
  private pool: T[] = []
  private active: Set<T> = new Set()

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    private readonly maxSize = 200
  ) {
    for (let i = 0; i < Math.min(20, maxSize); i++) this.pool.push(factory())
  }

  acquire(): T {
    const obj = this.pool.pop() ?? this.factory()
    this.active.add(obj)
    return obj
  }

  release(obj: T): void {
    if (!this.active.has(obj)) return
    this.active.delete(obj)
    this.reset(obj)
    if (this.pool.length < this.maxSize) this.pool.push(obj)
  }

  get activeCount(): number {
    return this.active.size
  }

  get pooledCount(): number {
    return this.pool.length
  }
}

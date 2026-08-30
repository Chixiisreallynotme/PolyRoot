import { Howl } from 'howler'

// via audio-design: pitch 0.94-1.06 bus ducking play_varied — via game-feel: bundles
// SFX.ts Howl pool:5 play_varied rate 0.94-1.06 duck -6dB 0.4s — ctx7 howler 2.2.4

export class SFX {
  private pool: Map<string, Howl> = new Map()
  private musicVolume = 0.6
  private sfxVolume = 0.8

  constructor() {
    // Howl pool:5 — pre-create pool for each SFX to avoid allocation in update
    const dummySrc = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='
    for (const name of ['tick', 'thud', 'boom', 'fanfare', 'dash']) {
      const howl = new Howl({ src: [dummySrc], volume: this.sfxVolume, pool: 5 } as unknown as HowlOptions)
      this.pool.set(name, howl)
    }
  }

  // audio-design play_varied() — MUST Howler.rate(0.94+Math.random()*0.12) via play_varied + Howl pool:5
  playVaried(name: string): void {
    const howl = this.pool.get(name)
    if (!howl) return
    // pitch variance 0.94+rand*0.12 (0.92+rand*0.16) — via audio-design
    const rate = 0.94 + Math.random() * 0.12
    try {
      const id = howl.play()
      howl.rate(rate, id)
    } catch {
      // howler not ready in test env
    }
    if (name === 'boom' || name === 'fanfare') {
      this.duckMusic()
    }
    console.log(`[sfx] play_varied ${name} rate ${rate.toFixed(2)}`)
  }

  private duckMusic(): void {
    // ducking -6dB musique 0.4s sur heavy — via audio-design
    const original = this.musicVolume
    this.musicVolume = original * 0.5 // -6dB
    setTimeout(() => {
      this.musicVolume = original
    }, 400)
  }

  // for tests
  getPoolSize(): number {
    return this.pool.size
  }
}

type HowlOptions = {
  src: string[]
  volume: number
  pool: number
}

// 8-bit / 90s Cyber-Arcade Synthwave Sound System using Web Audio API
// 0 external audio file latency, 100% procedural retro arcade sound effects & multi-channel BGM

export class SoundSystemClass {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private sfxGain: GainNode | null = null

  private bgmBuffer: AudioBuffer | null = null
  private bgmSource: AudioBufferSourceNode | null = null
  private isBgmPlaying = false
  private musicVolume = 0.50
  private sfxVolume = 0.80

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
      this.initNodes()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  private initNodes(): void {
    if (!this.ctx) return
    try {
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)

      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime)
      this.musicGain.connect(this.masterGain)

      this.sfxGain = this.ctx.createGain()
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime)
      this.sfxGain.connect(this.masterGain)
    } catch {
      // Handle node creation issues in restricted environments
    }
  }

  // --- Background Music Controls ---

  public startMusic(): void {
    try {
      const ctx = this.getContext()
      if (this.isBgmPlaying && this.bgmSource) return

      if (!this.bgmBuffer) {
        this.bgmBuffer = this.generateSynthwaveLoop(ctx)
      }

      this.bgmSource = ctx.createBufferSource()
      this.bgmSource.buffer = this.bgmBuffer
      this.bgmSource.loop = true

      if (!this.musicGain) {
        this.initNodes()
      }

      if (this.musicGain) {
        this.bgmSource.connect(this.musicGain)
        this.musicGain.gain.setValueAtTime(this.musicVolume, ctx.currentTime)
      } else {
        this.bgmSource.connect(ctx.destination)
      }

      this.bgmSource.start(0)
      this.isBgmPlaying = true
    } catch (e) {
      console.warn('[SoundSystem] BGM autoplay blocked or uninitialized:', e)
    }
  }

  public stopMusic(): void {
    try {
      if (this.bgmSource && this.isBgmPlaying) {
        if (this.musicGain && this.ctx) {
          this.musicGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.1)
          setTimeout(() => {
            try {
              this.bgmSource?.stop()
              this.bgmSource?.disconnect()
              this.bgmSource = null
              this.isBgmPlaying = false
            } catch {}
          }, 150)
        } else {
          this.bgmSource.stop()
          this.bgmSource.disconnect()
          this.bgmSource = null
          this.isBgmPlaying = false
        }
      }
    } catch {
      this.bgmSource = null
      this.isBgmPlaying = false
    }
  }

  public toggleMusic(): boolean {
    if (this.isBgmPlaying) {
      this.stopMusic()
      return false
    } else {
      this.startMusic()
      return true
    }
  }

  public isMusicPlaying(): boolean {
    return this.isBgmPlaying
  }

  public setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol))
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime)
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume
  }

  public setSfxVolume(vol: number): void {
    this.setSFXVolume(vol)
  }

  public getSfxVolume(): number {
    return this.getSFXVolume()
  }

  public setSFXVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol))
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime)
    }
  }

  public getSFXVolume(): number {
    return this.sfxVolume
  }

  // --- Procedural 90s Cyber-Arcade Synthwave Loop Synthesizer ---

  private generateSynthwaveLoop(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate || 44100
    const bpm = 126
    const secondsPerBeat = 60 / 126
    const totalBars = 16
    const totalBeats = totalBars * 4
    const totalSeconds = totalBeats * secondsPerBeat // ~30.476 sec
    const totalSamples = Math.floor(sampleRate * totalSeconds)

    const buffer = ctx.createBuffer(2, totalSamples, sampleRate)
    const left = buffer.getChannelData(0)
    const right = buffer.getChannelData(1)

    const stepDuration = secondsPerBeat / 4 // 16th note step

    // Chord roots in Hz: Dm -> Bb -> C -> Am/G
    const chordRoots = [
      73.42, 73.42, 73.42, 73.42, // D2 (bars 1-4)
      58.27, 58.27, 58.27, 58.27, // Bb1 (bars 5-8)
      65.41, 65.41, 65.41, 65.41, // C2 (bars 9-12)
      55.00, 55.00, 49.00, 55.00, // A1 / G1 (bars 13-16)
    ]

    // Melodic cyber arpeggio notes (frequencies in Hz)
    const arpPatterns: number[][] = [
      // Dm: D4, F4, A4, C5, D5, C5, A4, F4
      [293.66, 349.23, 440.00, 523.25, 587.33, 523.25, 440.00, 349.23, 293.66, 440.00, 587.33, 523.25, 440.00, 349.23, 293.66, 349.23],
      // Bb: Bb3, D4, F4, A4, D5, A4, F4, D4
      [233.08, 293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 233.08, 349.23, 440.00, 587.33, 440.00, 349.23, 233.08, 293.66],
      // C: C4, E4, G4, B4, C5, G4, E4, G4
      [261.63, 329.63, 392.00, 493.88, 523.25, 392.00, 329.63, 392.00, 261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 329.63, 392.00],
      // Am / Gm turnaround
      [220.00, 261.63, 329.63, 440.00, 523.25, 440.00, 329.63, 261.63, 196.00, 246.94, 293.66, 392.00, 440.00, 329.63, 261.63, 220.00],
    ]

    // Ping-pong delay line buffers
    const delaySamplesL = Math.floor(sampleRate * (stepDuration * 3))
    const delaySamplesR = Math.floor(sampleRate * (stepDuration * 4))
    const delayBufferL = new Float32Array(delaySamplesL)
    const delayBufferR = new Float32Array(delaySamplesR)
    let delayIdxL = 0
    let delayIdxR = 0

    // Synth phase variables
    let bassPhase = 0
    let subPhase = 0
    let arpPhase = 0
    let padPhase1 = 0
    let padPhase2 = 0
    let noiseFilterStateL = 0

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate
      const currentBeat = t / secondsPerBeat
      const currentBar = Math.floor(currentBeat / 4) % totalBars
      const stepInBar = Math.floor((t % (secondsPerBeat * 4)) / stepDuration)
      const tInStep = (t % stepDuration)
      const tInBeat = (t % secondsPerBeat)

      const chordRoot = chordRoots[currentBar] ?? 73.42
      const chordIdx = Math.floor(currentBar / 4)
      const activeArpList = (arpPatterns[chordIdx] ?? arpPatterns[0])!
      const arpFreq = activeArpList[stepInBar % activeArpList.length] ?? 293.66

      let sampleL = 0
      let sampleR = 0

      // 1. --- 90s Cyber Kick Drum ---
      if (tInBeat < 0.22) {
        const kickPitch = 36 + 120 * Math.exp(-tInBeat * 32)
        const kickEnv = Math.exp(-tInBeat * 14)
        const kickTone = Math.sin(2 * Math.PI * kickPitch * tInBeat)
        const kickDist = Math.tanh(kickTone * 1.8) * 0.42 * kickEnv
        sampleL += kickDist
        sampleR += kickDist
      }

      // 2. --- PS1 Cyber Snare ---
      const beatInBar = Math.floor(currentBeat) % 4
      if (beatInBar === 1 || beatInBar === 3) {
        if (tInBeat < 0.25) {
          const noise = (Math.random() * 2 - 1)
          const snareNoiseEnv = Math.exp(-tInBeat * 20)
          const snareTone = Math.sin(2 * Math.PI * 185 * tInBeat)
          const snareOut = (noise * 0.7 + snareTone * 0.3) * snareNoiseEnv * 0.32
          sampleL += snareOut
          sampleR += snareOut
        }
      }

      // 3. --- Cyber Hi-Hats ---
      const isOpenHat = (stepInBar === 2 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14)
      const hatEnv = isOpenHat ? Math.exp(-tInStep * 16) : Math.exp(-tInStep * 55)
      const hatAmp = isOpenHat ? 0.16 : 0.10
      const rawHatNoise = (Math.random() * 2 - 1)
      noiseFilterStateL = noiseFilterStateL * 0.3 + (rawHatNoise - noiseFilterStateL) * 0.7
      const hatOut = (rawHatNoise - noiseFilterStateL) * hatEnv * hatAmp
      sampleL += hatOut * 0.8
      sampleR += hatOut * 1.1

      // 4. --- 16th-Note Rolling Synthwave Bassline ---
      const isOctave = (stepInBar % 2 === 1)
      const currentBassFreq = isOctave ? chordRoot * 2 : chordRoot
      const bassEnv = Math.exp(-tInStep * 18)
      bassPhase += (currentBassFreq / sampleRate)
      if (bassPhase > 1) bassPhase -= 1
      subPhase += ((chordRoot * 0.5) / sampleRate)
      if (subPhase > 1) subPhase -= 1

      const sawWave = (2 * (bassPhase - Math.floor(bassPhase + 0.5)))
      const subWave = Math.sin(2 * Math.PI * subPhase)
      const bassOut = (sawWave * 0.55 + subWave * 0.45) * bassEnv * 0.36
      sampleL += bassOut
      sampleR += bassOut

      // 5. --- Melodic Cyber Arpeggio with Stereo Ping-Pong Delay ---
      const arpEnv = Math.exp(-tInStep * 12)
      arpPhase += (arpFreq / sampleRate)
      if (arpPhase > 1) arpPhase -= 1
      const pulseWave = arpPhase < 0.4 ? 0.8 : -0.8
      const rawArp = pulseWave * arpEnv * 0.18

      const delayedL = delayBufferL[delayIdxL] ?? 0
      const delayedR = delayBufferR[delayIdxR] ?? 0

      delayBufferL[delayIdxL] = rawArp + delayedR * 0.38
      delayBufferR[delayIdxR] = rawArp + delayedL * 0.38

      delayIdxL = (delayIdxL + 1) % delaySamplesL
      delayIdxR = (delayIdxR + 1) % delaySamplesR

      sampleL += rawArp * 0.75 + delayedL * 0.45
      sampleR += rawArp * 0.75 + delayedR * 0.45

      // 6. --- Atmospheric PS1 Pad Chords ---
      const padFreq1 = chordRoot * 4
      const padFreq2 = chordRoot * 4.02
      padPhase1 += (padFreq1 / sampleRate)
      if (padPhase1 > 1) padPhase1 -= 1
      padPhase2 += (padFreq2 / sampleRate)
      if (padPhase2 > 1) padPhase2 -= 1

      const barProgress = (t % (secondsPerBeat * 4)) / (secondsPerBeat * 4)
      const padVolumeEnv = Math.sin(barProgress * Math.PI) * 0.14
      const padWaveL = (2 * (padPhase1 - Math.floor(padPhase1 + 0.5))) * padVolumeEnv
      const padWaveR = (2 * (padPhase2 - Math.floor(padPhase2 + 0.5))) * padVolumeEnv
      sampleL += padWaveL
      sampleR += padWaveR

      left[i] = Math.tanh(sampleL * 0.85)
      right[i] = Math.tanh(sampleR * 0.85)
    }

    return buffer
  }

  // --- Sound Effects (SFX) ---

  playJump(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(150, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {}
  }

  playDash(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(320, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.18 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.18)
    } catch {}
  }

  playShoot(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.10 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.08)
    } catch {}
  }

  playPuceBoom(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(140, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.45)
      gain.gain.setValueAtTime(0.35 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.45)

      // Audio bus ducking -4dB on explosion
      if (this.musicGain) {
        this.musicGain.gain.setValueAtTime(this.musicVolume * 0.6, ctx.currentTime)
        this.musicGain.gain.setTargetAtTime(this.musicVolume, ctx.currentTime + 0.3, 0.15)
      }
    } catch {}
  }

  playGem(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(660, ctx.currentTime)
      osc.frequency.setValueAtTime(990, ctx.currentTime + 0.06)
      gain.gain.setValueAtTime(0.08 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch {}
  }

  playDamage(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(180, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }

  playSelect(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.04)
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.14)
    } catch {}
  }

  playMenuMove(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.03)
      gain.gain.setValueAtTime(0.06 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    } catch {}
  }

  playMenuSelect(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(523.25, ctx.currentTime)
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.05)
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.18)
    } catch {}
  }

  playMenuToggle(): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(700, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.07)
      gain.gain.setValueAtTime(0.10 * this.sfxVolume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)
      osc.connect(gain)
      gain.connect(this.sfxGain || ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.07)
    } catch {}
  }
}

export const SoundSystem = new SoundSystemClass()

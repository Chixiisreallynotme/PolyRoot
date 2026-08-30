import { gsap } from 'gsap'
import { SoundSystem } from '../audio/SoundSystem'

export interface PauseUIOptions {
  onResume?: () => void
  onRestart?: () => void
  onVolumeChange?: (sfx: number, music: number) => void
  onShaderToggle?: (mode: 'crt' | 'sharp') => void
  getShaderMode?: () => 'crt' | 'sharp'
}

export class PauseUI {
  private container: HTMLDivElement
  private panel: HTMLDivElement
  public isOpen = false

  private sfxSlider!: HTMLInputElement
  private sfxValueLabel!: HTMLSpanElement
  private musicSlider!: HTMLInputElement
  private musicValueLabel!: HTMLSpanElement
  private shaderToggleBtn!: HTMLButtonElement
  private shaderModeLabel!: HTMLSpanElement

  private callbacks: PauseUIOptions = {}

  constructor(options: PauseUIOptions = {}) {
    this.callbacks = options

    this.container = document.createElement('div')
    this.container.id = 'pause-ui'
    this.container.style.position = 'fixed'
    this.container.style.inset = '0'
    this.container.style.display = 'none'
    this.container.style.alignItems = 'center'
    this.container.style.justifyContent = 'center'
    this.container.style.background = 'radial-gradient(ellipse at center, rgba(4, 12, 28, 0.92) 0%, rgba(2, 6, 16, 0.97) 100%)'
    this.container.style.backdropFilter = 'blur(10px)'
    this.container.style.zIndex = '500'
    this.container.style.pointerEvents = 'auto'
    this.container.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.container.style.color = '#ffffff'
    this.container.style.userSelect = 'none'

    this.panel = document.createElement('div')
    this.panel.id = 'pause-panel'
    this.buildPanel()
    this.container.appendChild(this.panel)

    document.body.appendChild(this.container)
    this.setupKeyboardListeners()
  }

  private buildPanel(): void {
    this.panel.style.width = '560px'
    this.panel.style.maxWidth = '92vw'
    this.panel.style.position = 'relative'
    this.panel.style.padding = '3px'
    this.panel.style.background = '#00ff88'
    // Stepped pixelated dithered corners via 4-step polygon
    this.panel.style.clipPath =
      'polygon(0 12px, 4px 12px, 4px 8px, 8px 8px, 8px 4px, 12px 4px, 12px 0, calc(100% - 12px) 0, calc(100% - 12px) 4px, calc(100% - 8px) 4px, calc(100% - 8px) 8px, calc(100% - 4px) 8px, calc(100% - 4px) 12px, 100% 12px, 100% calc(100% - 12px), calc(100% - 4px) calc(100% - 12px), calc(100% - 4px) calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) calc(100% - 4px), calc(100% - 12px) calc(100% - 4px), calc(100% - 12px) 100%, 12px 100%, 12px calc(100% - 4px), 8px calc(100% - 4px), 8px calc(100% - 8px), 4px calc(100% - 8px), 4px calc(100% - 12px), 0 calc(100% - 12px))'
    this.panel.style.boxShadow = '0 0 35px rgba(0, 255, 136, 0.35)'

    const inner = document.createElement('div')
    inner.style.background = 'linear-gradient(180deg, #091322 0%, #050b14 100%)'
    inner.style.clipPath =
      'polygon(0 10px, 3px 10px, 3px 6px, 6px 6px, 6px 3px, 10px 3px, 10px 0, calc(100% - 10px) 0, calc(100% - 10px) 3px, calc(100% - 6px) 3px, calc(100% - 6px) 6px, calc(100% - 3px) 6px, calc(100% - 3px) 10px, 100% 10px, 100% calc(100% - 10px), calc(100% - 3px) calc(100% - 10px), calc(100% - 3px) calc(100% - 6px), calc(100% - 6px) calc(100% - 6px), calc(100% - 6px) calc(100% - 3px), calc(100% - 10px) calc(100% - 3px), calc(100% - 10px) 100%, 10px 100%, 10px calc(100% - 3px), 6px calc(100% - 3px), 6px calc(100% - 6px), 3px calc(100% - 6px), 3px calc(100% - 10px), 0 calc(100% - 10px))'
    inner.style.padding = '28px 32px'
    inner.style.display = 'flex'
    inner.style.flexDirection = 'column'
    inner.style.gap = '20px'

    // 1. Header (PS1 BIOS Kernel)
    const header = document.createElement('div')
    header.style.textAlign = 'center'
    header.style.borderBottom = '1px solid #1e293b'
    header.style.paddingBottom = '16px'
    header.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 6px;">
        <span style="font-size: 11px; letter-spacing: 3px; color: #38bdf8; font-weight: 700; text-transform: uppercase;">
          [ SONY COMPUTER ENTERTAINMENT // PU-8 BIOS ]
        </span>
      </div>
      <h2 style="font-size: 28px; font-weight: 900; color: #00ff88; margin: 0; letter-spacing: 3px; text-shadow: 0 0 16px rgba(0, 255, 136, 0.6);">
        SYSTEM PAUSED
      </h2>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; letter-spacing: 1px;">
        POLYROOT KERNEL v1.0 // ROOT SHELL SUSPENDED
      </div>
    `
    inner.appendChild(header)

    // 2. Options Content
    const content = document.createElement('div')
    content.style.display = 'flex'
    content.style.flexDirection = 'column'
    content.style.gap = '16px'

    // Audio SFX Volume Row
    const sfxRow = document.createElement('div')
    sfxRow.style.display = 'flex'
    sfxRow.style.flexDirection = 'column'
    sfxRow.style.gap = '6px'

    const sfxHeader = document.createElement('div')
    sfxHeader.style.display = 'flex'
    sfxHeader.style.justifyContent = 'space-between'
    sfxHeader.style.fontSize = '13px'
    sfxHeader.style.color = '#cbd5e1'
    sfxHeader.style.fontWeight = '600'
    sfxHeader.style.letterSpacing = '1px'

    const currentSfx = Math.round(SoundSystem.getSfxVolume() * 100)
    sfxHeader.innerHTML = `
      <span>VOLUME EFFETS SONORES (SFX)</span>
      <span id="sfx-val" style="color: #00ff88; font-weight: 800;">${currentSfx}%</span>
    `
    this.sfxValueLabel = sfxHeader.querySelector('#sfx-val') as HTMLSpanElement

    this.sfxSlider = document.createElement('input')
    this.sfxSlider.type = 'range'
    this.sfxSlider.min = '0'
    this.sfxSlider.max = '100'
    this.sfxSlider.step = '5'
    this.sfxSlider.value = String(currentSfx)
    this.applySliderStyles(this.sfxSlider)

    this.sfxSlider.oninput = () => {
      const val = parseInt(this.sfxSlider.value, 10)
      this.sfxValueLabel.textContent = `${val}%`
      SoundSystem.setSfxVolume(val / 100)
      SoundSystem.playMenuMove()
      this.callbacks.onVolumeChange?.(val / 100, SoundSystem.getMusicVolume())
    }

    sfxRow.appendChild(sfxHeader)
    sfxRow.appendChild(this.sfxSlider)
    content.appendChild(sfxRow)

    // Audio Music Volume Row
    const musicRow = document.createElement('div')
    musicRow.style.display = 'flex'
    musicRow.style.flexDirection = 'column'
    musicRow.style.gap = '6px'

    const musicHeader = document.createElement('div')
    musicHeader.style.display = 'flex'
    musicHeader.style.justifyContent = 'space-between'
    musicHeader.style.fontSize = '13px'
    musicHeader.style.color = '#cbd5e1'
    musicHeader.style.fontWeight = '600'
    musicHeader.style.letterSpacing = '1px'

    const currentMusic = Math.round(SoundSystem.getMusicVolume() * 100)
    musicHeader.innerHTML = `
      <span>VOLUME MUSIQUE</span>
      <span id="music-val" style="color: #38bdf8; font-weight: 800;">${currentMusic}%</span>
    `
    this.musicValueLabel = musicHeader.querySelector('#music-val') as HTMLSpanElement

    this.musicSlider = document.createElement('input')
    this.musicSlider.type = 'range'
    this.musicSlider.min = '0'
    this.musicSlider.max = '100'
    this.musicSlider.step = '5'
    this.musicSlider.value = String(currentMusic)
    this.applySliderStyles(this.musicSlider, '#38bdf8')

    this.musicSlider.oninput = () => {
      const val = parseInt(this.musicSlider.value, 10)
      this.musicValueLabel.textContent = `${val}%`
      SoundSystem.setMusicVolume(val / 100)
      SoundSystem.playMenuMove()
      this.callbacks.onVolumeChange?.(SoundSystem.getSfxVolume(), val / 100)
    }

    musicRow.appendChild(musicHeader)
    musicRow.appendChild(this.musicSlider)
    content.appendChild(musicRow)

    // Screen Shader Toggle Button
    const shaderRow = document.createElement('div')
    shaderRow.style.display = 'flex'
    shaderRow.style.flexDirection = 'column'
    shaderRow.style.gap = '6px'
    shaderRow.style.marginTop = '4px'

    const shaderMode = this.callbacks.getShaderMode ? this.callbacks.getShaderMode() : 'crt'
    this.shaderToggleBtn = document.createElement('button')
    this.shaderToggleBtn.style.background = 'linear-gradient(180deg, #131c2e, #0e1624)'
    this.shaderToggleBtn.style.border = '1px solid #38bdf888'
    this.shaderToggleBtn.style.color = '#ffffff'
    this.shaderToggleBtn.style.padding = '12px 18px'
    this.shaderToggleBtn.style.borderRadius = '4px'
    this.shaderToggleBtn.style.cursor = 'pointer'
    this.shaderToggleBtn.style.display = 'flex'
    this.shaderToggleBtn.style.justifyContent = 'space-between'
    this.shaderToggleBtn.style.alignItems = 'center'
    this.shaderToggleBtn.style.fontFamily = 'inherit'
    this.shaderToggleBtn.style.fontSize = '13px'
    this.shaderToggleBtn.style.fontWeight = '700'
    this.shaderToggleBtn.style.letterSpacing = '1px'
    this.shaderToggleBtn.style.transition = 'all 0.15s ease'

    this.shaderToggleBtn.innerHTML = `
      <span>RENDU SHADER ÉCRAN</span>
      <span id="shader-mode-label" style="background: #00ff8822; color: #00ff88; padding: 4px 10px; border-radius: 3px; border: 1px solid #00ff8866; font-size: 11px;">
        ${shaderMode === 'crt' ? 'CRT PS1 (15-BIT DITHER)' : 'SHARP (DIRECT RGB)'}
      </span>
    `
    this.shaderModeLabel = this.shaderToggleBtn.querySelector('#shader-mode-label') as HTMLSpanElement

    this.shaderToggleBtn.onmouseenter = () => {
      this.shaderToggleBtn.style.borderColor = '#00ff88'
      this.shaderToggleBtn.style.background = '#1a263c'
      SoundSystem.playMenuMove()
    }
    this.shaderToggleBtn.onmouseleave = () => {
      this.shaderToggleBtn.style.borderColor = '#38bdf888'
      this.shaderToggleBtn.style.background = 'linear-gradient(180deg, #131c2e, #0e1624)'
    }
    this.shaderToggleBtn.onclick = () => {
      this.toggleShader()
    }

    shaderRow.appendChild(this.shaderToggleBtn)
    content.appendChild(shaderRow)

    inner.appendChild(content)

    // 3. Action Buttons (Resume & Restart)
    const btnGroup = document.createElement('div')
    btnGroup.style.display = 'grid'
    btnGroup.style.gridTemplateColumns = '1fr 1fr'
    btnGroup.style.gap = '14px'
    btnGroup.style.marginTop = '10px'

    const resumeBtn = document.createElement('button')
    resumeBtn.id = 'btn-resume'
    resumeBtn.style.background = '#00ff88'
    resumeBtn.style.color = '#040e18'
    resumeBtn.style.border = 'none'
    resumeBtn.style.padding = '14px 18px'
    resumeBtn.style.borderRadius = '4px'
    resumeBtn.style.cursor = 'pointer'
    resumeBtn.style.fontFamily = 'inherit'
    resumeBtn.style.fontSize = '14px'
    resumeBtn.style.fontWeight = '900'
    resumeBtn.style.letterSpacing = '1px'
    resumeBtn.style.boxShadow = '0 0 16px rgba(0, 255, 136, 0.4)'
    resumeBtn.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease'
    resumeBtn.innerHTML = `REPRENDRE [ESC]`

    resumeBtn.onmouseenter = () => {
      resumeBtn.style.transform = 'translateY(-2px)'
      resumeBtn.style.boxShadow = '0 0 24px rgba(0, 255, 136, 0.65)'
      SoundSystem.playMenuMove()
    }
    resumeBtn.onmouseleave = () => {
      resumeBtn.style.transform = 'translateY(0)'
      resumeBtn.style.boxShadow = '0 0 16px rgba(0, 255, 136, 0.4)'
    }
    resumeBtn.onclick = () => {
      SoundSystem.playMenuSelect()
      this.close()
    }

    const restartBtn = document.createElement('button')
    restartBtn.id = 'btn-pause-restart'
    restartBtn.style.background = '#1e293b'
    restartBtn.style.color = '#f87171'
    restartBtn.style.border = '1px solid #ef444466'
    restartBtn.style.padding = '14px 18px'
    restartBtn.style.borderRadius = '4px'
    restartBtn.style.cursor = 'pointer'
    restartBtn.style.fontFamily = 'inherit'
    restartBtn.style.fontSize = '14px'
    restartBtn.style.fontWeight = '800'
    restartBtn.style.letterSpacing = '1px'
    restartBtn.style.transition = 'transform 0.1s ease, background 0.1s ease'
    restartBtn.innerHTML = `RECOMMENCER [R]`

    restartBtn.onmouseenter = () => {
      restartBtn.style.transform = 'translateY(-2px)'
      restartBtn.style.background = '#ef444422'
      restartBtn.style.borderColor = '#ef4444'
      SoundSystem.playMenuMove()
    }
    restartBtn.onmouseleave = () => {
      restartBtn.style.transform = 'translateY(0)'
      restartBtn.style.background = '#1e293b'
      restartBtn.style.borderColor = '#ef444466'
    }
    restartBtn.onclick = () => {
      SoundSystem.playMenuSelect()
      this.close()
      if (this.callbacks.onRestart) {
        this.callbacks.onRestart()
      } else {
        window.location.reload()
      }
    }

    btnGroup.appendChild(resumeBtn)
    btnGroup.appendChild(restartBtn)
    inner.appendChild(btnGroup)

    // 4. Footer BIOS status
    const footer = document.createElement('div')
    footer.style.textAlign = 'center'
    footer.style.fontSize = '11px'
    footer.style.color = '#64748b'
    footer.style.borderTop = '1px solid #1e293b'
    footer.style.paddingTop = '12px'
    footer.style.letterSpacing = '1px'
    footer.innerHTML = `HARDWARE BUS STATUS: 60 FPS p95 // MEMORY CARD 1: OK`
    inner.appendChild(footer)

    this.panel.appendChild(inner)
  }

  private applySliderStyles(slider: HTMLInputElement, accentColor = '#00ff88'): void {
    slider.style.width = '100%'
    slider.style.height = '8px'
    slider.style.appearance = 'none'
    slider.style.outline = 'none'
    slider.style.background = '#141e30'
    slider.style.borderRadius = '2px'
    slider.style.border = `1px solid ${accentColor}55`
    slider.style.cursor = 'pointer'
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggle()
      } else if (this.isOpen && (e.key === 'r' || e.key === 'R')) {
        this.close()
        if (this.callbacks.onRestart) {
          this.callbacks.onRestart()
        } else {
          window.location.reload()
        }
      }
    })
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  public open(): void {
    if (this.isOpen) return
    this.isOpen = true

    // Sync sliders with current sound state
    const currentSfx = Math.round(SoundSystem.getSfxVolume() * 100)
    const currentMusic = Math.round(SoundSystem.getMusicVolume() * 100)
    if (this.sfxSlider) this.sfxSlider.value = String(currentSfx)
    if (this.sfxValueLabel) this.sfxValueLabel.textContent = `${currentSfx}%`
    if (this.musicSlider) this.musicSlider.value = String(currentMusic)
    if (this.musicValueLabel) this.musicValueLabel.textContent = `${currentMusic}%`

    const mode = this.callbacks.getShaderMode ? this.callbacks.getShaderMode() : 'crt'
    this.updateShaderLabel(mode)

    this.container.style.display = 'flex'
    SoundSystem.playMenuSelect()

    gsap.fromTo(this.panel, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(1.5)' })
  }

  public close(): void {
    if (!this.isOpen) return
    this.isOpen = false

    gsap.to(this.panel, {
      scale: 0.92,
      opacity: 0,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => {
        this.container.style.display = 'none'
        this.callbacks.onResume?.()
      },
    })
  }

  public toggleShader(): void {
    SoundSystem.playMenuToggle()
    const current = this.callbacks.getShaderMode ? this.callbacks.getShaderMode() : 'crt'
    const next = current === 'crt' ? 'sharp' : 'crt'
    this.callbacks.onShaderToggle?.(next)
    this.updateShaderLabel(next)
  }

  private updateShaderLabel(mode: 'crt' | 'sharp'): void {
    if (!this.shaderModeLabel) return
    if (mode === 'crt') {
      this.shaderModeLabel.textContent = 'CRT PS1 (15-BIT DITHER)'
      this.shaderModeLabel.style.color = '#00ff88'
      this.shaderModeLabel.style.background = '#00ff8822'
      this.shaderModeLabel.style.borderColor = '#00ff8866'
    } else {
      this.shaderModeLabel.textContent = 'SHARP (DIRECT RGB)'
      this.shaderModeLabel.style.color = '#38bdf8'
      this.shaderModeLabel.style.background = '#38bdf822'
      this.shaderModeLabel.style.borderColor = '#38bdf866'
    }
  }
}

import { Puce } from '../entities/Puce'
import { PixelArt } from './PixelArt'
import { SoundSystem } from '../audio/SoundSystem'
import { PS1_BEVEL_8PX, PS1_BEVEL_4PX, PS1_DITHER_BG } from './ChoiceUI'

// HUD with Bitcount Grid Double font, Pixel Art Vector SVGs & PS1 Stepped Bresenham Corners (Zero emojis)

export class HUD {
  private container: HTMLDivElement
  private hpEl: HTMLDivElement
  private chronoEl: HTMLDivElement
  private puceTrackerEl: HTMLDivElement
  private heatingBarEl: HTMLDivElement
  private heatingFillEl: HTMLDivElement
  private dashIndicatorEl: HTMLDivElement
  private bossBarEl: HTMLDivElement
  private bossFillEl: HTMLDivElement
  private audioToggleEl: HTMLDivElement

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'hud-container'
    this.container.style.position = 'fixed'
    this.container.style.inset = '0'
    this.container.style.pointerEvents = 'none'
    this.container.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.container.style.color = '#ffffff'
    this.container.style.padding = '18px 24px'
    this.container.style.imageRendering = 'pixelated'
    document.body.appendChild(this.container)

    // Top Bar (Health, Chrono, Puces, Audio Control)
    const topBar = document.createElement('div')
    topBar.style.display = 'flex'
    topBar.style.justifyContent = 'space-between'
    topBar.style.alignItems = 'flex-start'
    topBar.style.width = '100%'

    // Left Column: Health Panel with PS1 Stepped Corner Frame
    const leftCol = document.createElement('div')
    leftCol.style.display = 'flex'
    leftCol.style.flexDirection = 'column'
    leftCol.style.gap = '8px'

    const hpOuter = document.createElement('div')
    hpOuter.style.background = '#00ff8844'
    hpOuter.style.padding = '2px'
    hpOuter.style.clipPath = PS1_BEVEL_8PX

    const hpInner = document.createElement('div')
    hpInner.style.background = '#0a101a'
    hpInner.style.backgroundImage = PS1_DITHER_BG
    hpInner.style.clipPath = PS1_BEVEL_8PX
    hpInner.style.padding = '8px 14px'
    hpInner.style.display = 'flex'
    hpInner.style.flexDirection = 'column'
    hpInner.style.gap = '4px'

    const hpLabel = document.createElement('div')
    hpLabel.textContent = 'ROOT CORE HP'
    hpLabel.style.fontSize = '10px'
    hpLabel.style.fontWeight = '700'
    hpLabel.style.letterSpacing = '2px'
    hpLabel.style.color = '#00ff88'
    hpInner.appendChild(hpLabel)

    this.hpEl = document.createElement('div')
    this.hpEl.style.display = 'flex'
    this.hpEl.style.gap = '8px'
    this.hpEl.style.alignItems = 'center'
    hpInner.appendChild(this.hpEl)

    hpOuter.appendChild(hpInner)
    leftCol.appendChild(hpOuter)
    topBar.appendChild(leftCol)

    // Center Column: Chrono Timer & Kills with PS1 Stepped Corner Box
    const chronoOuter = document.createElement('div')
    chronoOuter.style.background = '#00ff8844'
    chronoOuter.style.padding = '2px'
    chronoOuter.style.clipPath = PS1_BEVEL_8PX

    const chronoInner = document.createElement('div')
    chronoInner.style.background = '#0a101a'
    chronoInner.style.backgroundImage = PS1_DITHER_BG
    chronoInner.style.clipPath = PS1_BEVEL_8PX
    chronoInner.style.padding = '8px 24px'
    chronoInner.style.textAlign = 'center'

    this.chronoEl = document.createElement('div')
    this.chronoEl.style.fontSize = '26px'
    this.chronoEl.style.fontWeight = '700'
    this.chronoEl.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.chronoEl.style.letterSpacing = '2px'
    this.chronoEl.style.color = '#00ff88'
    this.chronoEl.style.textShadow = '0 0 14px rgba(0,255,136,0.6)'
    chronoInner.appendChild(this.chronoEl)

    chronoOuter.appendChild(chronoInner)
    topBar.appendChild(chronoOuter)

    // Right Column: Puces Tracker + BGM Toggle Button
    const rightCol = document.createElement('div')
    rightCol.style.display = 'flex'
    rightCol.style.flexDirection = 'column'
    rightCol.style.alignItems = 'flex-end'
    rightCol.style.gap = '8px'

    const puceOuter = document.createElement('div')
    puceOuter.style.background = '#00ff8844'
    puceOuter.style.padding = '2px'
    puceOuter.style.clipPath = PS1_BEVEL_8PX

    this.puceTrackerEl = document.createElement('div')
    this.puceTrackerEl.style.background = '#0a101a'
    this.puceTrackerEl.style.backgroundImage = PS1_DITHER_BG
    this.puceTrackerEl.style.clipPath = PS1_BEVEL_8PX
    this.puceTrackerEl.style.padding = '8px 16px'
    this.puceTrackerEl.style.display = 'flex'
    this.puceTrackerEl.style.flexDirection = 'column'
    this.puceTrackerEl.style.alignItems = 'flex-end'
    this.puceTrackerEl.style.gap = '4px'

    puceOuter.appendChild(this.puceTrackerEl)
    rightCol.appendChild(puceOuter)

    // Audio BGM Toggle Badge (Interactive with pointer events enabled)
    this.audioToggleEl = document.createElement('div')
    this.audioToggleEl.style.pointerEvents = 'auto'
    this.audioToggleEl.style.cursor = 'pointer'
    this.audioToggleEl.style.display = 'flex'
    this.audioToggleEl.style.alignItems = 'center'
    this.audioToggleEl.style.gap = '6px'
    this.audioToggleEl.style.background = 'rgba(10, 16, 26, 0.92)'
    this.audioToggleEl.style.backgroundImage = PS1_DITHER_BG
    this.audioToggleEl.style.padding = '6px 12px'
    this.audioToggleEl.style.clipPath = PS1_BEVEL_4PX
    this.audioToggleEl.style.border = '1px solid #00ff8866'
    this.audioToggleEl.style.fontSize = '11px'
    this.audioToggleEl.style.fontWeight = '700'
    this.audioToggleEl.style.color = '#00ff88'
    this.audioToggleEl.style.letterSpacing = '1px'
    this.audioToggleEl.style.transition = 'all 0.15s ease'
    this.audioToggleEl.title = 'Basculer la musique 90s Synthwave [Touche M]'

    this.updateAudioBadge()

    this.audioToggleEl.onclick = () => {
      SoundSystem.toggleMusic()
      this.updateAudioBadge()
      SoundSystem.playSelect()
    }
    this.audioToggleEl.onmouseenter = () => {
      this.audioToggleEl.style.borderColor = '#00ff88'
      this.audioToggleEl.style.boxShadow = '0 0 12px rgba(0,255,136,0.4)'
    }
    this.audioToggleEl.onmouseleave = () => {
      this.audioToggleEl.style.borderColor = '#00ff8866'
      this.audioToggleEl.style.boxShadow = 'none'
    }

    rightCol.appendChild(this.audioToggleEl)
    topBar.appendChild(rightCol)
    this.container.appendChild(topBar)

    // 4. Center Heating Progress Bar with PS1 Stepped Frame
    this.heatingBarEl = document.createElement('div')
    this.heatingBarEl.style.position = 'fixed'
    this.heatingBarEl.style.bottom = '85px'
    this.heatingBarEl.style.left = '50%'
    this.heatingBarEl.style.transform = 'translateX(-50%)'
    this.heatingBarEl.style.width = '340px'
    this.heatingBarEl.style.background = '#0a101a'
    this.heatingBarEl.style.backgroundImage = PS1_DITHER_BG
    this.heatingBarEl.style.border = '2px solid #00ff88'
    this.heatingBarEl.style.clipPath = PS1_BEVEL_8PX
    this.heatingBarEl.style.padding = '8px 12px'
    this.heatingBarEl.style.boxShadow = '0 0 24px rgba(0,255,136,0.35)'
    this.heatingBarEl.style.display = 'none'

    const heatingBarTrack = document.createElement('div')
    heatingBarTrack.style.width = '100%'
    heatingBarTrack.style.height = '14px'
    heatingBarTrack.style.background = '#050b14'
    heatingBarTrack.style.clipPath = PS1_BEVEL_4PX
    heatingBarTrack.style.border = '1px solid #1e293b'

    this.heatingFillEl = document.createElement('div')
    this.heatingFillEl.style.height = '100%'
    this.heatingFillEl.style.width = '0%'
    this.heatingFillEl.style.background = 'linear-gradient(90deg, #00ff88, #ffaa00, #ff2200)'
    this.heatingFillEl.style.clipPath = PS1_BEVEL_4PX
    this.heatingFillEl.style.transition = 'width 0.08s linear'
    heatingBarTrack.appendChild(this.heatingFillEl)
    this.heatingBarEl.appendChild(heatingBarTrack)

    const heatingLabel = document.createElement('div')
    heatingLabel.textContent = 'SURCHAUFFE DU SUBSTRAT EN COURS'
    heatingLabel.style.fontFamily = "'Bitcount Grid Double', monospace"
    heatingLabel.style.fontSize = '11px'
    heatingLabel.style.fontWeight = '700'
    heatingLabel.style.letterSpacing = '2px'
    heatingLabel.style.textAlign = 'center'
    heatingLabel.style.marginTop = '6px'
    heatingLabel.style.color = '#00ff88'
    this.heatingBarEl.appendChild(heatingLabel)
    this.container.appendChild(this.heatingBarEl)

    // 5. Dash & Jump Controls Indicator (Bottom Left) with PS1 Stepped Bevel
    this.dashIndicatorEl = document.createElement('div')
    this.dashIndicatorEl.style.position = 'fixed'
    this.dashIndicatorEl.style.bottom = '24px'
    this.dashIndicatorEl.style.left = '24px'
    this.dashIndicatorEl.style.display = 'flex'
    this.dashIndicatorEl.style.alignItems = 'center'
    this.dashIndicatorEl.style.gap = '10px'
    this.dashIndicatorEl.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.dashIndicatorEl.style.fontSize = '12px'
    this.dashIndicatorEl.style.fontWeight = '700'
    this.dashIndicatorEl.style.letterSpacing = '1px'
    this.dashIndicatorEl.style.color = '#00ff88'
    this.dashIndicatorEl.style.background = '#0a101a'
    this.dashIndicatorEl.style.backgroundImage = PS1_DITHER_BG
    this.dashIndicatorEl.style.padding = '10px 18px'
    this.dashIndicatorEl.style.clipPath = PS1_BEVEL_8PX
    this.dashIndicatorEl.style.border = '2px solid #00ff8866'
    this.dashIndicatorEl.style.boxShadow = '0 0 16px rgba(0,0,0,0.6)'
    this.container.appendChild(this.dashIndicatorEl)

    // 6. Boss Survival Bar (Top Center) with PS1 Stepped Frame
    this.bossBarEl = document.createElement('div')
    this.bossBarEl.style.position = 'fixed'
    this.bossBarEl.style.top = '78px'
    this.bossBarEl.style.left = '50%'
    this.bossBarEl.style.transform = 'translateX(-50%)'
    this.bossBarEl.style.width = '460px'
    this.bossBarEl.style.background = '#18080c'
    this.bossBarEl.style.backgroundImage = PS1_DITHER_BG
    this.bossBarEl.style.border = '2px solid #ff2244'
    this.bossBarEl.style.clipPath = PS1_BEVEL_8PX
    this.bossBarEl.style.padding = '8px 14px'
    this.bossBarEl.style.boxShadow = '0 0 28px rgba(255,34,68,0.5)'
    this.bossBarEl.style.display = 'none'

    const bossTrack = document.createElement('div')
    bossTrack.style.width = '100%'
    bossTrack.style.height = '14px'
    bossTrack.style.background = '#0f0406'
    bossTrack.style.clipPath = PS1_BEVEL_4PX
    bossTrack.style.border = '1px solid #ff224455'

    this.bossFillEl = document.createElement('div')
    this.bossFillEl.style.height = '100%'
    this.bossFillEl.style.width = '100%'
    this.bossFillEl.style.background = 'linear-gradient(90deg, #ff2244, #ff8800)'
    this.bossFillEl.style.clipPath = PS1_BEVEL_4PX
    bossTrack.appendChild(this.bossFillEl)
    this.bossBarEl.appendChild(bossTrack)

    const bossLabel = document.createElement('div')
    bossLabel.style.display = 'flex'
    bossLabel.style.alignItems = 'center'
    bossLabel.style.justifyContent = 'center'
    bossLabel.style.gap = '8px'
    bossLabel.style.marginTop = '6px'
    bossLabel.innerHTML = `
      ${PixelArt.leekLogo}
      <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #ff5566;">
        BOSS : TACTICAL CYBERLEEK [SURVIE 35s]
      </span>
    `
    this.bossBarEl.appendChild(bossLabel)
    this.container.appendChild(this.bossBarEl)

    // Keyboard listener for 'M' music toggle
    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        SoundSystem.toggleMusic()
        this.updateAudioBadge()
      }
    })
  }

  public updateAudioBadge(): void {
    const isPlaying = SoundSystem.isMusicPlaying()
    this.audioToggleEl.innerHTML = isPlaying
      ? `${PixelArt.musicOn} <span>BGM: ACTIF [M]</span>`
      : `${PixelArt.musicOff} <span style="color: #94a3b8;">BGM: MUET [M]</span>`
  }

  update(
    hp: number,
    timeSeconds: number,
    kills: number,
    puces: Puce[],
    pucesHeatedCount: number,
    dashTimer: number,
    dashCooldown: number,
    insidePuce: Puce | null,
    bossActive: boolean,
    bossTimer: number,
    bossMaxTime: number
  ): void {
    // 1. Pixel Art Hearts
    let heartsHtml = ''
    for (let i = 0; i < 3; i++) {
      heartsHtml += i < hp ? PixelArt.heartFull : PixelArt.heartEmpty
    }
    this.hpEl.innerHTML = heartsHtml

    // 2. Chrono Timer + Kills
    const m = Math.floor(timeSeconds / 60)
    const s = Math.floor(timeSeconds % 60)
    const ms = Math.floor((timeSeconds % 1) * 10)
    this.chronoEl.innerHTML = `
      ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}
      <div style="font-size: 12px; font-weight: 700; color: #cbd5e0; letter-spacing: 2px; margin-top: 2px; display: flex; align-items: center; justify-content: center; gap: 6px;">
        ${PixelArt.skull} KILLS: ${kills}
      </div>
    `

    // 3. Puce Status Tracker
    let pipsHtml = `<div style="font-size: 12px; font-weight: 700; color: #00ff88; letter-spacing: 2px; font-family: 'Bitcount Grid Double', monospace;">PUCES: ${pucesHeatedCount}/8</div><div style="display: flex; gap: 6px; margin-top: 4px;">`
    for (let i = 0; i < puces.length; i++) {
      const p = puces[i]
      if (!p) continue
      const color = p.isHeated ? '#00ff88' : p.progress > 0 ? '#ffaa00' : '#1e293b'
      pipsHtml += `<div style="width: 10px; height: 10px; background: ${color}; clip-path: ${PS1_BEVEL_4PX}; box-shadow: 0 0 6px ${color}; image-rendering: pixelated;"></div>`
    }
    pipsHtml += '</div>'
    this.puceTrackerEl.innerHTML = pipsHtml

    // 4. Inside Puce Heating Bar
    if (insidePuce && !insidePuce.isHeated) {
      this.heatingBarEl.style.display = 'block'
      this.heatingFillEl.style.width = `${Math.min(100, insidePuce.progress * 100)}%`
    } else {
      this.heatingBarEl.style.display = 'none'
    }

    // 5. Dash & Jump Controls Indicator
    if (dashTimer <= 0) {
      this.dashIndicatorEl.innerHTML = `
        <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          ${PixelArt.speed}
        </div>
        <span>DASH [SHIFT] | SAUT [ESPACE]</span>
      `
      this.dashIndicatorEl.style.color = '#00ff88'
      this.dashIndicatorEl.style.borderColor = '#00ff8866'
    } else {
      const pct = Math.floor(((dashCooldown - dashTimer) / dashCooldown) * 100)
      this.dashIndicatorEl.innerHTML = `
        <div style="width: 14px; height: 14px; border: 2px solid #ffaa00; border-top-color: transparent; clip-path: ${PS1_BEVEL_4PX}; animation: spin 1s linear infinite;"></div>
        <span>RECHARGE DASH (${pct}%) | SAUT [ESPACE]</span>
      `
      this.dashIndicatorEl.style.color = '#ffaa00'
      this.dashIndicatorEl.style.borderColor = '#ffaa0066'
    }

    // 6. Boss Survival Bar
    if (bossActive) {
      this.bossBarEl.style.display = 'block'
      const remain = Math.max(0, bossMaxTime - bossTimer)
      const pct = (remain / bossMaxTime) * 100
      this.bossFillEl.style.width = `${pct}%`
    } else {
      this.bossBarEl.style.display = 'none'
    }
  }
}


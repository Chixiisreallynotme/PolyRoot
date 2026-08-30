import { Puce } from '../entities/Puce'
import { PixelArt } from './PixelArt'
import { SoundSystem } from '../audio/SoundSystem'
import { PS1_BEVEL_8PX, PS1_BEVEL_4PX, PS1_DITHER_BG } from './ChoiceUI'

// HUD with Bitcount Grid Double font, Pixel Art Vector SVGs & PS1 Stepped Bresenham Corners (Zero emojis)

// Inject HUD Keyframe Animations if not present
if (typeof document !== 'undefined' && !document.getElementById('polyroot-hud-styles')) {
  const style = document.createElement('style')
  style.id = 'polyroot-hud-styles'
  style.textContent = `
    @keyframes pixelHeatingBlink {
      0% {
        background-color: #ef4444;
        box-shadow: 0 0 14px #ef4444, inset 0 0 4px #ffffff;
        filter: brightness(1.35);
      }
      100% {
        background-color: #7f1d1d;
        box-shadow: 0 0 4px #7f1d1d;
        filter: brightness(0.7);
      }
    }
  `
  document.head.appendChild(style)
}

export function getHeatingSegmentColor(index: number): { color: string; isBlinking: boolean } {
  const ratio = (index + 1) / 16
  if (ratio <= 0.40) {
    return { color: '#00ff88', isBlinking: false }
  } else if (ratio <= 0.70) {
    return { color: '#facc15', isBlinking: false }
  } else if (ratio <= 0.90) {
    return { color: '#f97316', isBlinking: false }
  } else {
    return { color: '#ef4444', isBlinking: true }
  }
}

export class HUD {
  private container: HTMLDivElement
  private hpEl: HTMLDivElement
  private chronoEl: HTMLDivElement
  private puceTrackerEl: HTMLDivElement
  private heatingBarEl: HTMLDivElement
  private heatingSegments: HTMLDivElement[] = []
  private heatingLabelEl: HTMLDivElement
  private heatingHeaderPctEl: HTMLDivElement
  private dashIndicatorEl: HTMLDivElement
  private bossBarEl: HTMLDivElement
  private bossFillEl: HTMLDivElement
  private bossLabelEl!: HTMLDivElement
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

    // 4. Center Heating Progress Bar with 16-Segment Discrete Pixel Blocks & PS1 Stepped Frame
    this.heatingBarEl = document.createElement('div')
    this.heatingBarEl.id = 'hud-heating-bar'
    this.heatingBarEl.style.position = 'fixed'
    this.heatingBarEl.style.bottom = '85px'
    this.heatingBarEl.style.left = '50%'
    this.heatingBarEl.style.transform = 'translateX(-50%)'
    this.heatingBarEl.style.width = '380px'
    this.heatingBarEl.style.background = '#0a101a'
    this.heatingBarEl.style.backgroundImage = PS1_DITHER_BG
    this.heatingBarEl.style.border = '2px solid #00ff88'
    this.heatingBarEl.style.clipPath = PS1_BEVEL_8PX
    this.heatingBarEl.style.padding = '10px 14px'
    this.heatingBarEl.style.boxShadow = '0 0 24px rgba(0,255,136,0.35)'
    this.heatingBarEl.style.display = 'none'

    // Heating Bar Header (Title & Percentage)
    const heatingHeader = document.createElement('div')
    heatingHeader.style.display = 'flex'
    heatingHeader.style.justifyContent = 'space-between'
    heatingHeader.style.alignItems = 'center'
    heatingHeader.style.marginBottom = '6px'

    const heatingHeaderTitle = document.createElement('div')
    heatingHeaderTitle.textContent = 'PUCE SOLDER CORE // SURCHAUFFE'
    heatingHeaderTitle.style.fontFamily = "'Bitcount Grid Double', monospace"
    heatingHeaderTitle.style.fontSize = '10px'
    heatingHeaderTitle.style.fontWeight = '700'
    heatingHeaderTitle.style.letterSpacing = '1.5px'
    heatingHeaderTitle.style.color = '#94a3b8'
    heatingHeader.appendChild(heatingHeaderTitle)

    this.heatingHeaderPctEl = document.createElement('div')
    this.heatingHeaderPctEl.textContent = '[ 0% ]'
    this.heatingHeaderPctEl.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.heatingHeaderPctEl.style.fontSize = '11px'
    this.heatingHeaderPctEl.style.fontWeight = '900'
    this.heatingHeaderPctEl.style.letterSpacing = '1px'
    this.heatingHeaderPctEl.style.color = '#00ff88'
    heatingHeader.appendChild(this.heatingHeaderPctEl)

    this.heatingBarEl.appendChild(heatingHeader)

    // Segmented Tick Marks Calibration Line (0%, 40%, 70%, 90%, 100%)
    const tickRuler = document.createElement('div')
    tickRuler.style.display = 'flex'
    tickRuler.style.justifyContent = 'space-between'
    tickRuler.style.alignItems = 'flex-end'
    tickRuler.style.padding = '0 2px'
    tickRuler.style.marginBottom = '4px'
    tickRuler.style.fontSize = '8px'
    tickRuler.style.fontWeight = '700'
    tickRuler.style.letterSpacing = '1px'
    tickRuler.innerHTML = `
      <span style="color: #00ff88;">0%</span>
      <span style="color: #facc15;">40%</span>
      <span style="color: #f97316;">70%</span>
      <span style="color: #ef4444;">90%</span>
      <span style="color: #ef4444;">MAX</span>
    `
    this.heatingBarEl.appendChild(tickRuler)

    // 16-Segment Discrete Pixel Track Container
    const heatingTrack = document.createElement('div')
    heatingTrack.id = 'hud-heating-track'
    heatingTrack.style.display = 'flex'
    heatingTrack.style.gap = '3px'
    heatingTrack.style.width = '100%'
    heatingTrack.style.height = '18px'
    heatingTrack.style.background = '#050b14'
    heatingTrack.style.clipPath = PS1_BEVEL_4PX
    heatingTrack.style.border = '1px solid #1e293b'
    heatingTrack.style.padding = '3px'
    heatingTrack.style.boxSizing = 'border-box'

    this.heatingSegments = []
    for (let i = 0; i < 16; i++) {
      const seg = document.createElement('div')
      seg.className = `heating-segment segment-${i}`
      seg.style.flex = '1'
      seg.style.height = '100%'
      seg.style.background = '#08101a'
      seg.style.border = '1px solid #152238'
      seg.style.clipPath = PS1_BEVEL_4PX
      seg.style.opacity = '0.35'
      seg.style.boxSizing = 'border-box'
      seg.style.transition = 'background 0.05s ease, opacity 0.05s ease, box-shadow 0.05s ease'
      heatingTrack.appendChild(seg)
      this.heatingSegments.push(seg)
    }
    this.heatingBarEl.appendChild(heatingTrack)

    // Heating Status Label
    this.heatingLabelEl = document.createElement('div')
    this.heatingLabelEl.textContent = 'SURCHAUFFE DU SUBSTRAT EN COURS'
    this.heatingLabelEl.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.heatingLabelEl.style.fontSize = '11px'
    this.heatingLabelEl.style.fontWeight = '700'
    this.heatingLabelEl.style.letterSpacing = '2px'
    this.heatingLabelEl.style.textAlign = 'center'
    this.heatingLabelEl.style.marginTop = '8px'
    this.heatingLabelEl.style.color = '#00ff88'
    this.heatingBarEl.appendChild(this.heatingLabelEl)

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

    this.bossLabelEl = document.createElement('div')
    this.bossLabelEl.style.display = 'flex'
    this.bossLabelEl.style.alignItems = 'center'
    this.bossLabelEl.style.justifyContent = 'center'
    this.bossLabelEl.style.gap = '8px'
    this.bossLabelEl.style.marginTop = '6px'
    this.bossLabelEl.innerHTML = `
      ${PixelArt.leekLogo}
      <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #ff5566;">
        BOSS : TACTICAL CYBERLEEK [PHASE 1 - 100%]
      </span>
    `
    this.bossBarEl.appendChild(this.bossLabelEl)
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
    bossMaxTime: number,
    bossHp = 100,
    bossMaxHp = 100,
    bossPhase: 1 | 2 | 3 = 1
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
      const pct = Math.min(100, Math.floor(insidePuce.progress * 100))
      this.heatingHeaderPctEl.textContent = `[ ${pct}% ]`

      // Update Segmented Level Indicators
      const activeCount = Math.floor((pct / 100) * 16)
      for (let i = 0; i < 16; i++) {
        const seg = this.heatingSegments[i]
        if (!seg) continue
        if (i < activeCount) {
          const { color, isBlinking } = getHeatingSegmentColor(i)
          seg.style.background = color
          seg.style.opacity = '1.0'
          seg.style.borderColor = '#ffffff88'
          seg.style.boxShadow = `0 0 8px ${color}`
          if (isBlinking) {
            seg.style.animation = 'pixelHeatingBlink 0.18s infinite alternate'
          } else {
            seg.style.animation = 'none'
          }
        } else {
          seg.style.background = '#08101a'
          seg.style.opacity = '0.35'
          seg.style.borderColor = '#152238'
          seg.style.boxShadow = 'none'
          seg.style.animation = 'none'
        }
      }

      if (pct >= 90) {
        this.heatingBarEl.style.borderColor = '#ef4444'
        this.heatingBarEl.style.boxShadow = '0 0 28px rgba(239, 68, 68, 0.65)'
        this.heatingLabelEl.textContent = `SURCHAUFFE CRITIQUE [${pct}%] - NIVEAU 4 MAXIMUM`
        this.heatingLabelEl.style.color = '#ef4444'
        this.heatingHeaderPctEl.style.color = '#ef4444'
      } else if (pct >= 70) {
        this.heatingBarEl.style.borderColor = '#f97316'
        this.heatingBarEl.style.boxShadow = '0 0 26px rgba(249, 115, 22, 0.5)'
        this.heatingLabelEl.textContent = `SURCHAUFFE DU SUBSTRAT [${pct}%] - NIVEAU 3 ELEVE`
        this.heatingLabelEl.style.color = '#f97316'
        this.heatingHeaderPctEl.style.color = '#f97316'
      } else if (pct >= 40) {
        this.heatingBarEl.style.borderColor = '#facc15'
        this.heatingBarEl.style.boxShadow = '0 0 24px rgba(250, 204, 21, 0.45)'
        this.heatingLabelEl.textContent = `SURCHAUFFE DU SUBSTRAT [${pct}%] - NIVEAU 2 MOYEN`
        this.heatingLabelEl.style.color = '#facc15'
        this.heatingHeaderPctEl.style.color = '#facc15'
      } else {
        this.heatingBarEl.style.borderColor = '#00ff88'
        this.heatingBarEl.style.boxShadow = '0 0 24px rgba(0, 255, 136, 0.35)'
        this.heatingLabelEl.textContent = `SURCHAUFFE DU SUBSTRAT [${pct}%] - NIVEAU 1 STABLE`
        this.heatingLabelEl.style.color = '#00ff88'
        this.heatingHeaderPctEl.style.color = '#00ff88'
      }
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

    // 6. Boss 3-Phase Health & Survival Bar
    if (bossActive) {
      this.bossBarEl.style.display = 'block'
      const hpPct = Math.max(0, Math.min(100, Math.ceil((bossHp / bossMaxHp) * 100)))
      this.bossFillEl.style.width = `${hpPct}%`

      let phaseTitle = 'PHASE 1: HEAVY MARCH'
      let phaseColor = '#38bdf8'
      let fillGradient = 'linear-gradient(90deg, #38bdf8, #00ffff)'

      if (bossPhase === 2) {
        phaseTitle = 'PHASE 2: OVERCLOCK RAGE'
        phaseColor = '#f97316'
        fillGradient = 'linear-gradient(90deg, #ff8800, #ff2244)'
      } else if (bossPhase === 3) {
        phaseTitle = 'PHASE 3: QUANTUM DASH'
        phaseColor = '#c084fc'
        fillGradient = 'linear-gradient(90deg, #a855f7, #00ffff)'
      }

      this.bossFillEl.style.background = fillGradient
      this.bossLabelEl.innerHTML = `
        ${PixelArt.leekLogo}
        <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 13px; font-weight: 700; letter-spacing: 2px; color: ${phaseColor};">
          BOSS : TACTICAL CYBERLEEK [${phaseTitle} - ${hpPct}%]
        </span>
      `
    } else {
      this.bossBarEl.style.display = 'none'
    }
  }
}

import { SoundSystem } from '../audio/SoundSystem'
import { PixelArt } from './PixelArt'

export const PS1_DITHER_BG = `repeating-conic-gradient(#000000 0% 25%, #050b14 0% 50%) 50% / 4px 4px`
export const PS1_BEVEL_8PX = `polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))`
export const PS1_BEVEL_4PX = `polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))`

// Discrete 16-segment 4-color palette brackets:
// Segments 0..5 (0-40%): Green (#00ff88)
// Segments 6..10 (40-70%): Yellow (#facc15)
// Segments 11..13 (70-90%): Orange (#f97316)
// Segments 14..15 (90-100%): Blinking Red (#ef4444)
export function getHeatingSegmentColor(segmentIndex: number): { color: string; isBlinking: boolean } {
  if (segmentIndex < 6) return { color: '#00ff88', isBlinking: false }
  if (segmentIndex < 11) return { color: '#facc15', isBlinking: false }
  if (segmentIndex < 14) return { color: '#f97316', isBlinking: false }
  return { color: '#ef4444', isBlinking: true }
}

export class HUD {
  private container: HTMLDivElement
  private hpEl: HTMLDivElement
  private timerEl: HTMLDivElement
  private puceTrackerEl: HTMLDivElement
  private heatingBarEl: HTMLDivElement
  private heatingHeaderPctEl: HTMLDivElement
  private heatingSegments: HTMLDivElement[] = []
  private dashIndicatorEl: HTMLDivElement
  private bossBarEl: HTMLDivElement
  private bossHpFillEl: HTMLDivElement
  private bossTimerEl: HTMLDivElement
  private bossPhaseBadgeEl: HTMLElement
  private audioToggleEl: HTMLDivElement

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'hud-container'
    this.container.style.position = 'fixed'
    this.container.style.top = '0'
    this.container.style.left = '0'
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'
    this.container.style.pointerEvents = 'none'
    this.container.style.userSelect = 'none'
    this.container.style.zIndex = '50'
    this.container.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.container.style.color = '#00ff88'
    this.container.style.boxSizing = 'border-box'

    // Keyframe Animation for Critical Blinking Red Segments
    if (!document.getElementById('pixel-heating-keyframes')) {
      const style = document.createElement('style')
      style.id = 'pixel-heating-keyframes'
      style.textContent = `
        @keyframes pixelHeatingBlink {
          0% { opacity: 1.0; filter: drop-shadow(0 0 6px #ef4444); }
          50% { opacity: 0.15; filter: none; }
          100% { opacity: 1.0; filter: drop-shadow(0 0 8px #ef4444); }
        }
      `
      document.head.appendChild(style)
    }

    // Top Status Bar Container
    const topBar = document.createElement('div')
    topBar.style.display = 'flex'
    topBar.style.justifyContent = 'space-between'
    topBar.style.alignItems = 'flex-start'
    topBar.style.padding = '16px 24px'
    topBar.style.width = '100%'
    topBar.style.boxSizing = 'border-box'

    // 1. Left: Root Core HP
    const hpOuter = document.createElement('div')
    hpOuter.style.background = '#00ff88'
    hpOuter.style.clipPath = PS1_BEVEL_8PX
    hpOuter.style.padding = '2px'
    hpOuter.style.boxShadow = '0 0 16px rgba(0,255,136,0.3)'

    this.hpEl = document.createElement('div')
    this.hpEl.style.background = '#0a101a'
    this.hpEl.style.backgroundImage = PS1_DITHER_BG
    this.hpEl.style.clipPath = PS1_BEVEL_8PX
    this.hpEl.style.padding = '8px 16px'
    this.hpEl.style.display = 'flex'
    this.hpEl.style.alignItems = 'center'
    this.hpEl.style.gap = '8px'
    this.hpEl.style.fontSize = '12px'
    this.hpEl.style.fontWeight = '700'
    this.hpEl.style.letterSpacing = '1px'

    hpOuter.appendChild(this.hpEl)
    topBar.appendChild(hpOuter)

    // 2. Center: Chrono Timer & Kill Count
    const timerOuter = document.createElement('div')
    timerOuter.style.background = '#00ff88'
    timerOuter.style.clipPath = PS1_BEVEL_8PX
    timerOuter.style.padding = '2px'
    timerOuter.style.boxShadow = '0 0 16px rgba(0,255,136,0.3)'

    this.timerEl = document.createElement('div')
    this.timerEl.style.background = '#0a101a'
    this.timerEl.style.backgroundImage = PS1_DITHER_BG
    this.timerEl.style.clipPath = PS1_BEVEL_8PX
    this.timerEl.style.padding = '8px 24px'
    this.timerEl.style.textAlign = 'center'
    this.timerEl.style.fontSize = '16px'
    this.timerEl.style.fontWeight = '900'
    this.timerEl.style.letterSpacing = '2px'

    timerOuter.appendChild(this.timerEl)
    topBar.appendChild(timerOuter)

    // 3. Right Column: Puces Overclock Tracker + Audio Toggle Badge
    const rightCol = document.createElement('div')
    rightCol.style.display = 'flex'
    rightCol.style.flexDirection = 'column'
    rightCol.style.alignItems = 'flex-end'
    rightCol.style.gap = '8px'

    const puceOuter = document.createElement('div')
    puceOuter.style.background = '#00ff88'
    puceOuter.style.clipPath = PS1_BEVEL_8PX
    puceOuter.style.padding = '2px'
    puceOuter.style.boxShadow = '0 0 16px rgba(0,255,136,0.3)'

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

    // Audio BGM Toggle Badge
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

    // 4. Center Minimalist Heating Progress Bar with Sharp Square Pixel Blocks
    this.heatingBarEl = document.createElement('div')
    this.heatingBarEl.id = 'hud-heating-bar'
    this.heatingBarEl.style.position = 'fixed'
    this.heatingBarEl.style.bottom = '80px'
    this.heatingBarEl.style.left = '50%'
    this.heatingBarEl.style.transform = 'translateX(-50%)'
    this.heatingBarEl.style.width = '280px'
    this.heatingBarEl.style.background = '#050a12'
    this.heatingBarEl.style.border = '2px solid #00ff88'
    this.heatingBarEl.style.borderRadius = '0px'
    this.heatingBarEl.style.padding = '6px 10px'
    this.heatingBarEl.style.boxShadow = '0 0 20px rgba(0,255,136,0.4)'
    this.heatingBarEl.style.display = 'none'
    this.heatingBarEl.style.boxSizing = 'border-box'

    // Minimal Header (Left: SURCHAUFFE, Right: [ 0% ])
    const heatingHeader = document.createElement('div')
    heatingHeader.style.display = 'flex'
    heatingHeader.style.justifyContent = 'space-between'
    heatingHeader.style.alignItems = 'center'
    heatingHeader.style.marginBottom = '5px'

    const heatingHeaderTitle = document.createElement('div')
    heatingHeaderTitle.textContent = 'SURCHAUFFE'
    heatingHeaderTitle.style.fontFamily = "'Bitcount Grid Double', monospace"
    heatingHeaderTitle.style.fontSize = '11px'
    heatingHeaderTitle.style.fontWeight = '900'
    heatingHeaderTitle.style.letterSpacing = '1px'
    heatingHeaderTitle.style.color = '#94a3b8'
    heatingHeader.appendChild(heatingHeaderTitle)

    this.heatingHeaderPctEl = document.createElement('div')
    this.heatingHeaderPctEl.textContent = '[ 0% ]'
    this.heatingHeaderPctEl.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.heatingHeaderPctEl.style.fontSize = '12px'
    this.heatingHeaderPctEl.style.fontWeight = '900'
    this.heatingHeaderPctEl.style.letterSpacing = '1px'
    this.heatingHeaderPctEl.style.color = '#00ff88'
    heatingHeader.appendChild(this.heatingHeaderPctEl)

    this.heatingBarEl.appendChild(heatingHeader)

    // 16 Discrete Sharp Square Pixel Blocks Track
    const heatingTrack = document.createElement('div')
    heatingTrack.id = 'hud-heating-track'
    heatingTrack.style.display = 'flex'
    heatingTrack.style.gap = '3px'
    heatingTrack.style.width = '100%'
    heatingTrack.style.height = '14px'
    heatingTrack.style.background = '#02060c'
    heatingTrack.style.border = '1px solid #132238'
    heatingTrack.style.borderRadius = '0px'
    heatingTrack.style.padding = '2px'
    heatingTrack.style.boxSizing = 'border-box'

    this.heatingSegments = []
    for (let i = 0; i < 16; i++) {
      const seg = document.createElement('div')
      seg.className = `heating-segment segment-${i}`
      seg.style.flex = '1'
      seg.style.height = '100%'
      seg.style.background = '#08101a'
      seg.style.borderRadius = '0px'
      seg.style.opacity = '0.35'
      seg.style.boxSizing = 'border-box'
      seg.style.imageRendering = 'pixelated'
      seg.style.transition = 'background 0.05s ease, opacity 0.05s ease, box-shadow 0.05s ease'
      heatingTrack.appendChild(seg)
      this.heatingSegments.push(seg)
    }
    this.heatingBarEl.appendChild(heatingTrack)

    this.container.appendChild(this.heatingBarEl)

    // 5. Dash & Jump Controls Indicator (Bottom Left)
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
    this.dashIndicatorEl.style.padding = '8px 16px'
    this.dashIndicatorEl.style.clipPath = PS1_BEVEL_8PX
    this.dashIndicatorEl.style.border = '1px solid #00ff88'
    this.dashIndicatorEl.style.boxShadow = '0 0 12px rgba(0,255,136,0.25)'
    this.dashIndicatorEl.innerHTML = `
      ${PixelArt.speed}
      <span>DASH [SHIFT] &nbsp;|&nbsp; SAUT [ESPACE]</span>
    `
    this.container.appendChild(this.dashIndicatorEl)

    // 6. Boss Tactical Bar (Top Center)
    this.bossBarEl = document.createElement('div')
    this.bossBarEl.id = 'hud-boss-bar'
    this.bossBarEl.style.position = 'fixed'
    this.bossBarEl.style.top = '16px'
    this.bossBarEl.style.left = '50%'
    this.bossBarEl.style.transform = 'translateX(-50%)'
    this.bossBarEl.style.width = '480px'
    this.bossBarEl.style.background = '#0a101a'
    this.bossBarEl.style.backgroundImage = PS1_DITHER_BG
    this.bossBarEl.style.border = '2px solid #ef4444'
    this.bossBarEl.style.clipPath = PS1_BEVEL_8PX
    this.bossBarEl.style.padding = '10px 16px'
    this.bossBarEl.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.4)'
    this.bossBarEl.style.display = 'none'

    const bossHeader = document.createElement('div')
    bossHeader.style.display = 'flex'
    bossHeader.style.justifyContent = 'space-between'
    bossHeader.style.alignItems = 'center'
    bossHeader.style.marginBottom = '6px'

    const bossTitle = document.createElement('div')
    bossTitle.style.display = 'flex'
    bossTitle.style.alignItems = 'center'
    bossTitle.style.gap = '8px'
    bossTitle.innerHTML = `
      ${PixelArt.leekLogo}
      <span style="color: #ef4444; font-size: 13px; font-weight: 800; letter-spacing: 1px;">
        BOSS : TACTICAL CYBERLEEK
      </span>
    `
    bossHeader.appendChild(bossTitle)

    const rightBossMeta = document.createElement('div')
    rightBossMeta.style.display = 'flex'
    rightBossMeta.style.alignItems = 'center'
    rightBossMeta.style.gap = '10px'

    this.bossPhaseBadgeEl = document.createElement('span')
    this.bossPhaseBadgeEl.style.fontSize = '10px'
    this.bossPhaseBadgeEl.style.color = '#38bdf8'
    this.bossPhaseBadgeEl.style.fontWeight = '700'
    this.bossPhaseBadgeEl.textContent = 'PHASE 1'
    rightBossMeta.appendChild(this.bossPhaseBadgeEl)

    this.bossTimerEl = document.createElement('div')
    this.bossTimerEl.style.color = '#fbbf24'
    this.bossTimerEl.style.fontSize = '14px'
    this.bossTimerEl.style.fontWeight = '900'
    this.bossTimerEl.textContent = '45.0s'
    rightBossMeta.appendChild(this.bossTimerEl)

    bossHeader.appendChild(rightBossMeta)
    this.bossBarEl.appendChild(bossHeader)

    const bossTrack = document.createElement('div')
    bossTrack.style.width = '100%'
    bossTrack.style.height = '12px'
    bossTrack.style.background = '#1e1b2e'
    bossTrack.style.border = '1px solid #ef4444'
    bossTrack.style.clipPath = PS1_BEVEL_4PX
    bossTrack.style.overflow = 'hidden'

    this.bossHpFillEl = document.createElement('div')
    this.bossHpFillEl.style.width = '100%'
    this.bossHpFillEl.style.height = '100%'
    this.bossHpFillEl.style.background = 'linear-gradient(90deg, #ef4444, #f97316)'
    this.bossHpFillEl.style.transition = 'width 0.1s linear'
    bossTrack.appendChild(this.bossHpFillEl)

    this.bossBarEl.appendChild(bossTrack)
    this.container.appendChild(this.bossBarEl)

    document.body.appendChild(this.container)
  }

  public updateAudioBadge(): void {
    if (!this.audioToggleEl) return
    const isPlaying = SoundSystem.isMusicPlaying()
    if (isPlaying) {
      this.audioToggleEl.innerHTML = `${PixelArt.musicOn} <span>BGM: ACTIF [M]</span>`
      this.audioToggleEl.style.borderColor = '#00ff88'
      this.audioToggleEl.style.color = '#00ff88'
    } else {
      this.audioToggleEl.innerHTML = `${PixelArt.musicOff} <span style="color: #94a3b8;">BGM: MUET [M]</span>`
      this.audioToggleEl.style.borderColor = '#475569'
      this.audioToggleEl.style.color = '#94a3b8'
    }
  }

  update(
    hp: number,
    timeSeconds: number,
    kills: number,
    puces: { isHeated: boolean; progress: number }[],
    pucesHeatedCount: number,
    dashTimer: number,
    dashCooldown: number,
    insidePuce: { isHeated: boolean; progress: number } | null,
    bossActive: boolean,
    bossTimer: number,
    bossMaxTime: number,
    bossHp?: number,
    bossMaxHp?: number,
    bossPhase?: number
  ): void {
    // 1. HP Hearts (Max 3)
    let heartsHtml = '<div style="display: flex; gap: 4px; align-items: center;">'
    for (let i = 0; i < 3; i++) {
      if (i < hp) {
        heartsHtml += PixelArt.heartFull
      } else {
        heartsHtml += PixelArt.heartEmpty
      }
    }
    heartsHtml += '</div>'
    this.hpEl.innerHTML = heartsHtml

    // 2. Timer & Kills
    const mins = Math.floor(timeSeconds / 60)
    const secs = (timeSeconds % 60).toFixed(1).padStart(4, '0')
    this.timerEl.innerHTML = `
      <div style="color: #00ff88; text-shadow: 0 0 8px rgba(0,255,136,0.5);">${mins.toString().padStart(2, '0')}:${secs}</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        ${PixelArt.skull} KILLS: ${kills}
      </div>
    `

    // 3. Puces Tracker (8 Puces)
    let pipsHtml = `<div style="display: flex; justify-content: space-between; width: 100%; font-size: 10px; color: #94a3b8; font-weight: 700; margin-bottom: 2px;">
      <span>PUCES:</span>
      <span style="color: ${pucesHeatedCount >= 8 ? '#00ff88' : '#f8fafc'};">${pucesHeatedCount}/8</span>
    </div>`
    pipsHtml += '<div style="display: flex; gap: 4px;">'
    for (let i = 0; i < puces.length; i++) {
      const p = puces[i]!
      const color = p.isHeated ? '#00ff88' : p.progress > 0 ? '#ffaa00' : '#1e293b'
      pipsHtml += `<div style="width: 10px; height: 10px; background: ${color}; border-radius: 0px; box-shadow: 0 0 6px ${color}; image-rendering: pixelated;"></div>`
    }
    pipsHtml += '</div>'
    this.puceTrackerEl.innerHTML = pipsHtml

    // 4. Inside Puce Minimalist Square Pixel Heating Bar
    if (insidePuce && !insidePuce.isHeated) {
      this.heatingBarEl.style.display = 'block'
      const pct = Math.min(100, Math.floor(insidePuce.progress * 100))
      this.heatingHeaderPctEl.textContent = `[ ${pct}% ]`

      // Update 16 Discrete Square Pixel Blocks
      const activeCount = Math.floor((pct / 100) * 16)
      for (let i = 0; i < 16; i++) {
        const seg = this.heatingSegments[i]
        if (!seg) continue
        if (i < activeCount) {
          const { color, isBlinking } = getHeatingSegmentColor(i)
          seg.style.background = color
          seg.style.opacity = '1.0'
          seg.style.boxShadow = `0 0 6px ${color}`
          if (isBlinking) {
            seg.style.animation = 'pixelHeatingBlink 0.18s infinite alternate'
          } else {
            seg.style.animation = 'none'
          }
        } else {
          seg.style.background = '#08101a'
          seg.style.opacity = '0.35'
          seg.style.boxShadow = 'none'
          seg.style.animation = 'none'
        }
      }

      if (pct >= 90) {
        this.heatingBarEl.style.borderColor = '#ef4444'
        this.heatingBarEl.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.6)'
        this.heatingHeaderPctEl.style.color = '#ef4444'
      } else if (pct >= 70) {
        this.heatingBarEl.style.borderColor = '#f97316'
        this.heatingBarEl.style.boxShadow = '0 0 16px rgba(249, 115, 22, 0.5)'
        this.heatingHeaderPctEl.style.color = '#f97316'
      } else if (pct >= 40) {
        this.heatingBarEl.style.borderColor = '#facc15'
        this.heatingBarEl.style.boxShadow = '0 0 16px rgba(250, 204, 21, 0.45)'
        this.heatingHeaderPctEl.style.color = '#facc15'
      } else {
        this.heatingBarEl.style.borderColor = '#00ff88'
        this.heatingBarEl.style.boxShadow = '0 0 16px rgba(0, 255, 136, 0.35)'
        this.heatingHeaderPctEl.style.color = '#00ff88'
      }
    } else {
      this.heatingBarEl.style.display = 'none'
    }

    // 5. Dash Indicator
    if (dashTimer > 0) {
      const pct = 1 - dashTimer / dashCooldown
      this.dashIndicatorEl.style.opacity = '0.5'
      this.dashIndicatorEl.style.borderColor = '#475569'
      this.dashIndicatorEl.innerHTML = `
        ${PixelArt.speed}
        <span style="color: #94a3b8;">DASH [${Math.floor(pct * 100)}%]</span>
      `
    } else {
      this.dashIndicatorEl.style.opacity = '1.0'
      this.dashIndicatorEl.style.borderColor = '#00ff88'
      this.dashIndicatorEl.innerHTML = `
        ${PixelArt.speed}
        <span style="color: #00ff88;">DASH [SHIFT] &nbsp;|&nbsp; SAUT [ESPACE]</span>
      `
    }

    // 6. Boss Tactical Bar
    if (bossActive) {
      this.bossBarEl.style.display = 'block'
      const timeLeft = Math.max(0, bossMaxTime - bossTimer)
      this.bossTimerEl.textContent = `${timeLeft.toFixed(1)}s`

      if (bossPhase !== undefined) {
        this.bossPhaseBadgeEl.textContent = `PHASE ${bossPhase}`
      }

      if (bossHp !== undefined && bossMaxHp !== undefined && bossMaxHp > 0) {
        const hpPct = Math.max(0, (bossHp / bossMaxHp) * 100)
        this.bossHpFillEl.style.width = `${hpPct}%`
      } else {
        const timePct = Math.max(0, (timeLeft / bossMaxTime) * 100)
        this.bossHpFillEl.style.width = `${timePct}%`
      }
    } else {
      this.bossBarEl.style.display = 'none'
    }

    this.updateAudioBadge()
  }

  showGlitch(): void {
    const glitch = document.createElement('div')
    glitch.style.position = 'fixed'
    glitch.style.top = '0'
    glitch.style.left = '0'
    glitch.style.width = '100vw'
    glitch.style.height = '100vh'
    glitch.style.background = 'rgba(0, 255, 136, 0.15)'
    glitch.style.pointerEvents = 'none'
    glitch.style.zIndex = '999'
    document.body.appendChild(glitch)
    setTimeout(() => glitch.remove(), 80)
  }
}

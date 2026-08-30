import { Puce } from '../entities/Puce'
import { PixelArt } from './PixelArt'

// HUD with Bitcount Grid Double font, Pixel Art Vector SVGs (Zero emojis)

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

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'hud-container'
    this.container.style.position = 'fixed'
    this.container.style.inset = '0'
    this.container.style.pointerEvents = 'none'
    this.container.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.container.style.color = '#ffffff'
    this.container.style.padding = '18px 24px'
    document.body.appendChild(this.container)

    // Top Bar (Health, Chrono, Puces)
    const topBar = document.createElement('div')
    topBar.style.display = 'flex'
    topBar.style.justifyContent = 'space-between'
    topBar.style.alignItems = 'flex-start'
    topBar.style.width = '100%'

    // 1. Pixel Art Health Display
    this.hpEl = document.createElement('div')
    this.hpEl.style.display = 'flex'
    this.hpEl.style.gap = '6px'
    this.hpEl.style.alignItems = 'center'
    topBar.appendChild(this.hpEl)

    // 2. Chrono Timer & Kills
    this.chronoEl = document.createElement('div')
    this.chronoEl.style.fontSize = '26px'
    this.chronoEl.style.fontWeight = '600'
    this.chronoEl.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.chronoEl.style.letterSpacing = '2px'
    this.chronoEl.style.textAlign = 'center'
    this.chronoEl.style.color = '#00ff88'
    this.chronoEl.style.textShadow = '0 0 14px rgba(0,255,136,0.6)'
    topBar.appendChild(this.chronoEl)

    // 3. 8 Puces Status Tracker
    this.puceTrackerEl = document.createElement('div')
    this.puceTrackerEl.style.display = 'flex'
    this.puceTrackerEl.style.flexDirection = 'column'
    this.puceTrackerEl.style.alignItems = 'flex-end'
    this.puceTrackerEl.style.gap = '4px'
    topBar.appendChild(this.puceTrackerEl)

    this.container.appendChild(topBar)

    // 4. Center Heating Progress Bar
    this.heatingBarEl = document.createElement('div')
    this.heatingBarEl.style.position = 'fixed'
    this.heatingBarEl.style.bottom = '85px'
    this.heatingBarEl.style.left = '50%'
    this.heatingBarEl.style.transform = 'translateX(-50%)'
    this.heatingBarEl.style.width = '300px'
    this.heatingBarEl.style.background = 'rgba(8, 16, 28, 0.9)'
    this.heatingBarEl.style.border = '2px solid #00ff88'
    this.heatingBarEl.style.borderRadius = '6px'
    this.heatingBarEl.style.padding = '4px'
    this.heatingBarEl.style.boxShadow = '0 0 20px rgba(0,255,136,0.35)'
    this.heatingBarEl.style.display = 'none'

    this.heatingFillEl = document.createElement('div')
    this.heatingFillEl.style.height = '14px'
    this.heatingFillEl.style.width = '0%'
    this.heatingFillEl.style.background = 'linear-gradient(90deg, #00ff88, #ffaa00, #ff2200)'
    this.heatingFillEl.style.borderRadius = '3px'
    this.heatingFillEl.style.transition = 'width 0.08s linear'
    this.heatingBarEl.appendChild(this.heatingFillEl)

    const heatingLabel = document.createElement('div')
    heatingLabel.textContent = 'SURCHAUFFE EN COURS'
    heatingLabel.style.fontFamily = "'Bitcount Grid Double', monospace"
    heatingLabel.style.fontSize = '12px'
    heatingLabel.style.fontWeight = '600'
    heatingLabel.style.letterSpacing = '2px'
    heatingLabel.style.textAlign = 'center'
    heatingLabel.style.marginTop = '4px'
    heatingLabel.style.color = '#00ff88'
    this.heatingBarEl.appendChild(heatingLabel)
    this.container.appendChild(this.heatingBarEl)

    // 5. Dash & Jump Controls Indicator (Bottom Left)
    this.dashIndicatorEl = document.createElement('div')
    this.dashIndicatorEl.style.position = 'fixed'
    this.dashIndicatorEl.style.bottom = '24px'
    this.dashIndicatorEl.style.left = '24px'
    this.dashIndicatorEl.style.display = 'flex'
    this.dashIndicatorEl.style.alignItems = 'center'
    this.dashIndicatorEl.style.gap = '8px'
    this.dashIndicatorEl.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.dashIndicatorEl.style.fontSize = '12px'
    this.dashIndicatorEl.style.fontWeight = '600'
    this.dashIndicatorEl.style.letterSpacing = '1px'
    this.dashIndicatorEl.style.color = '#00ff88'
    this.dashIndicatorEl.style.background = 'rgba(8, 16, 28, 0.85)'
    this.dashIndicatorEl.style.padding = '8px 16px'
    this.dashIndicatorEl.style.borderRadius = '6px'
    this.dashIndicatorEl.style.border = '1px solid #00ff8855'
    this.dashIndicatorEl.style.boxShadow = '0 0 14px rgba(0,0,0,0.5)'
    this.container.appendChild(this.dashIndicatorEl)

    // 6. Boss Survival Bar (Top Center)
    this.bossBarEl = document.createElement('div')
    this.bossBarEl.style.position = 'fixed'
    this.bossBarEl.style.top = '72px'
    this.bossBarEl.style.left = '50%'
    this.bossBarEl.style.transform = 'translateX(-50%)'
    this.bossBarEl.style.width = '440px'
    this.bossBarEl.style.background = 'rgba(24, 8, 12, 0.92)'
    this.bossBarEl.style.border = '2px solid #ff2244'
    this.bossBarEl.style.borderRadius = '6px'
    this.bossBarEl.style.padding = '6px'
    this.bossBarEl.style.boxShadow = '0 0 24px rgba(255,34,68,0.45)'
    this.bossBarEl.style.display = 'none'

    this.bossFillEl = document.createElement('div')
    this.bossFillEl.style.height = '14px'
    this.bossFillEl.style.width = '100%'
    this.bossFillEl.style.background = 'linear-gradient(90deg, #ff2244, #ff8800)'
    this.bossFillEl.style.borderRadius = '3px'
    this.bossBarEl.appendChild(this.bossFillEl)

    const bossLabel = document.createElement('div')
    bossLabel.style.display = 'flex'
    bossLabel.style.alignItems = 'center'
    bossLabel.style.justifyContent = 'center'
    bossLabel.style.gap = '8px'
    bossLabel.style.marginTop = '5px'
    bossLabel.innerHTML = `
      ${PixelArt.leekLogo}
      <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #ff5566;">
        BOSS : TACTICAL CYBERLEEK [SURVIE 35s]
      </span>
    `
    this.bossBarEl.appendChild(bossLabel)
    this.container.appendChild(this.bossBarEl)
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
      <div style="font-size: 12px; font-weight: 600; color: #cbd5e0; letter-spacing: 2px; margin-top: 2px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        ${PixelArt.skull} KILLS: ${kills}
      </div>
    `

    // 3. Puce Status Tracker
    let pipsHtml = `<div style="font-size: 12px; font-weight: 600; color: #00ff88; letter-spacing: 2px; font-family: 'Bitcount Grid Double', monospace;">PUCES: ${pucesHeatedCount}/8</div><div style="display: flex; gap: 6px; margin-top: 4px;">`
    for (let i = 0; i < puces.length; i++) {
      const p = puces[i]
      if (!p) continue
      const color = p.isHeated ? '#00ff88' : p.progress > 0 ? '#ffaa00' : '#334155'
      pipsHtml += `<div style="width: 10px; height: 10px; background: ${color}; box-shadow: 0 0 6px ${color}; image-rendering: pixelated;"></div>`
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
        ${PixelArt.lightning}
        <span>DASH [SHIFT] | SAUT [ESPACE]</span>
      `
      this.dashIndicatorEl.style.color = '#00ff88'
      this.dashIndicatorEl.style.borderColor = '#00ff8866'
    } else {
      const pct = Math.floor(((dashCooldown - dashTimer) / dashCooldown) * 100)
      this.dashIndicatorEl.innerHTML = `
        <div style="width: 12px; height: 12px; border: 2px solid #ffaa00; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
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

import { Puce } from '../entities/Puce'

// HUD — Cyber Motherboard HUD with Space Grotesk typography, 8 Puces Tracker, and Boss Bar

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
    this.container.style.fontFamily = "'Space Grotesk', 'Chakra Petch', sans-serif"
    this.container.style.color = '#ffffff'
    this.container.style.padding = '16px 24px'
    document.body.appendChild(this.container)

    // Top Bar (Health, Chrono, Puces)
    const topBar = document.createElement('div')
    topBar.style.display = 'flex'
    topBar.style.justifyContent = 'space-between'
    topBar.style.alignItems = 'flex-start'
    topBar.style.width = '100%'

    // 1. Health Display
    this.hpEl = document.createElement('div')
    this.hpEl.style.fontSize = '22px'
    this.hpEl.style.letterSpacing = '4px'
    this.hpEl.style.textShadow = '0 0 10px rgba(255,50,50,0.6)'
    topBar.appendChild(this.hpEl)

    // 2. Chrono Timer & Kills
    this.chronoEl = document.createElement('div')
    this.chronoEl.style.fontSize = '26px'
    this.chronoEl.style.fontWeight = '800'
    this.chronoEl.style.fontFamily = "'Chakra Petch', monospace"
    this.chronoEl.style.letterSpacing = '2px'
    this.chronoEl.style.textAlign = 'center'
    this.chronoEl.style.color = '#33ff88'
    this.chronoEl.style.textShadow = '0 0 12px rgba(51,255,136,0.5)'
    topBar.appendChild(this.chronoEl)

    // 3. 8 Puces Status Tracker
    this.puceTrackerEl = document.createElement('div')
    this.puceTrackerEl.style.display = 'flex'
    this.puceTrackerEl.style.flexDirection = 'column'
    this.puceTrackerEl.style.alignItems = 'flex-end'
    this.puceTrackerEl.style.gap = '4px'
    topBar.appendChild(this.puceTrackerEl)

    this.container.appendChild(topBar)

    // 4. Center Heating Progress Bar (shown when inside any puce)
    this.heatingBarEl = document.createElement('div')
    this.heatingBarEl.style.position = 'fixed'
    this.heatingBarEl.style.bottom = '80px'
    this.heatingBarEl.style.left = '50%'
    this.heatingBarEl.style.transform = 'translateX(-50%)'
    this.heatingBarEl.style.width = '280px'
    this.heatingBarEl.style.background = 'rgba(10,20,30,0.8)'
    this.heatingBarEl.style.border = '2px solid #00ff88'
    this.heatingBarEl.style.borderRadius = '8px'
    this.heatingBarEl.style.padding = '4px'
    this.heatingBarEl.style.display = 'none'

    this.heatingFillEl = document.createElement('div')
    this.heatingFillEl.style.height = '12px'
    this.heatingFillEl.style.width = '0%'
    this.heatingFillEl.style.background = 'linear-gradient(90deg, #ff9900, #ff2200)'
    this.heatingFillEl.style.borderRadius = '4px'
    this.heatingFillEl.style.transition = 'width 0.1s linear'
    this.heatingBarEl.appendChild(this.heatingFillEl)

    const heatingLabel = document.createElement('div')
    heatingLabel.textContent = 'SURCHAUFFE EN COURS'
    heatingLabel.style.fontSize = '10px'
    heatingLabel.style.fontWeight = '700'
    heatingLabel.style.letterSpacing = '2px'
    heatingLabel.style.textAlign = 'center'
    heatingLabel.style.marginTop = '4px'
    heatingLabel.style.color = '#ffaa00'
    this.heatingBarEl.appendChild(heatingLabel)
    this.container.appendChild(this.heatingBarEl)

    // 5. Dash Cooldown Indicator (Bottom Left)
    this.dashIndicatorEl = document.createElement('div')
    this.dashIndicatorEl.style.position = 'fixed'
    this.dashIndicatorEl.style.bottom = '24px'
    this.dashIndicatorEl.style.left = '24px'
    this.dashIndicatorEl.style.fontSize = '12px'
    this.dashIndicatorEl.style.fontWeight = '700'
    this.dashIndicatorEl.style.letterSpacing = '1px'
    this.dashIndicatorEl.style.color = '#33ff88'
    this.dashIndicatorEl.style.background = 'rgba(0,0,0,0.6)'
    this.dashIndicatorEl.style.padding = '8px 14px'
    this.dashIndicatorEl.style.borderRadius = '6px'
    this.dashIndicatorEl.style.border = '1px solid #33ff8844'
    this.container.appendChild(this.dashIndicatorEl)

    // 6. Boss Survival Bar (Bottom Center)
    this.bossBarEl = document.createElement('div')
    this.bossBarEl.style.position = 'fixed'
    this.bossBarEl.style.top = '70px'
    this.bossBarEl.style.left = '50%'
    this.bossBarEl.style.transform = 'translateX(-50%)'
    this.bossBarEl.style.width = '420px'
    this.bossBarEl.style.background = 'rgba(20,5,5,0.85)'
    this.bossBarEl.style.border = '2px solid #ff3322'
    this.bossBarEl.style.borderRadius = '8px'
    this.bossBarEl.style.padding = '6px'
    this.bossBarEl.style.display = 'none'

    this.bossFillEl = document.createElement('div')
    this.bossFillEl.style.height = '14px'
    this.bossFillEl.style.width = '100%'
    this.bossFillEl.style.background = 'linear-gradient(90deg, #ff2200, #ff8800)'
    this.bossFillEl.style.borderRadius = '4px'
    this.bossBarEl.appendChild(this.bossFillEl)

    const bossLabel = document.createElement('div')
    bossLabel.textContent = 'BOSS : TACTICAL CYBERLEEK [SURVIE 35s]'
    bossLabel.style.fontSize = '11px'
    bossLabel.style.fontWeight = '800'
    bossLabel.style.letterSpacing = '2px'
    bossLabel.style.textAlign = 'center'
    bossLabel.style.marginTop = '4px'
    bossLabel.style.color = '#ff5544'
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
    // Health
    let hearts = ''
    for (let i = 0; i < 3; i++) {
      hearts += i < hp ? '❤️ ' : '🖤 '
    }
    this.hpEl.innerHTML = hearts

    // Chrono
    const m = Math.floor(timeSeconds / 60)
    const s = Math.floor(timeSeconds % 60)
    const ms = Math.floor((timeSeconds % 1) * 10)
    this.chronoEl.innerHTML = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}<div style="font-size: 11px; font-weight: 500; color: #8899aa; letter-spacing: 1px;">KILLS: ${kills}</div>`

    // Puce Status Pips (8 dots)
    let pipsHtml = `<div style="font-size: 12px; font-weight: 700; color: #00ff88; letter-spacing: 2px;">PUCES: ${pucesHeatedCount}/8</div><div style="display: flex; gap: 6px; margin-top: 4px;">`
    for (let i = 0; i < puces.length; i++) {
      const p = puces[i]
      if (!p) continue
      const color = p.isHeated ? '#00ff88' : p.progress > 0 ? '#ffaa00' : '#445566'
      pipsHtml += `<div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; box-shadow: 0 0 6px ${color};"></div>`
    }
    pipsHtml += '</div>'
    this.puceTrackerEl.innerHTML = pipsHtml

    // Inside Puce Heating Bar
    if (insidePuce && !insidePuce.isHeated) {
      this.heatingBarEl.style.display = 'block'
      this.heatingFillEl.style.width = `${Math.min(100, insidePuce.progress * 100)}%`
    } else {
      this.heatingBarEl.style.display = 'none'
    }

    // Dash Cooldown
    if (dashTimer <= 0) {
      this.dashIndicatorEl.innerHTML = '⚡ DASH PRÊT [ESPACE]'
      this.dashIndicatorEl.style.color = '#33ff88'
      this.dashIndicatorEl.style.borderColor = '#33ff8866'
    } else {
      const pct = Math.floor(((dashCooldown - dashTimer) / dashCooldown) * 100)
      this.dashIndicatorEl.innerHTML = `⏳ RECHARGE DASH (${pct}%)`
      this.dashIndicatorEl.style.color = '#ffaa00'
      this.dashIndicatorEl.style.borderColor = '#ffaa0066'
    }

    // Boss Bar
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

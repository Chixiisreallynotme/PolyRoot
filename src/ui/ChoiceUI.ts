import { gsap } from 'gsap'
import { PixelArt } from './PixelArt'

// Diegetic Overclock Cards Selection UI with Bitcount Grid Double & Pixel Art SVGs (Zero emojis)
// Builds: A Aura Overdrive, B Rapid Blast, C Cyber Speed

export interface UpgradeChoice {
  id: string
  build: 'A' | 'B' | 'C'
  title: string
  description: string
  badge: string
  iconSvg: string
  color: string
}

export const ALL_UPGRADES: UpgradeChoice[] = [
  {
    id: 'aura_1',
    build: 'A',
    title: 'AURA OVERDRIVE',
    description: 'Rayon de l\'aura +35% & Répulsion de choc des cryptos',
    badge: 'AURA',
    iconSvg: PixelArt.lightning,
    color: '#00ff88',
  },
  {
    id: 'shoot_1',
    build: 'B',
    title: 'TIR ACCÉLÉRÉ',
    description: 'Cadence de tir +50% & Projectiles perforants',
    badge: 'CANNON',
    iconSvg: PixelArt.cannon,
    color: '#3399ff',
  },
  {
    id: 'speed_1',
    build: 'C',
    title: 'VÉLOCITÉ CYBER',
    description: 'Vitesse de Root +30% & Cooldown du Dash -35%',
    badge: 'MOBILITY',
    iconSvg: PixelArt.speed,
    color: '#ffaa00',
  },
]

export class ChoiceUI {
  private container: HTMLDivElement
  public isOpen = false

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'choice-ui'
    this.container.style.position = 'fixed'
    this.container.style.inset = '0'
    this.container.style.display = 'none'
    this.container.style.alignItems = 'center'
    this.container.style.justifyContent = 'center'
    this.container.style.background = 'rgba(8, 14, 24, 0.88)'
    this.container.style.backdropFilter = 'blur(8px)'
    this.container.style.zIndex = '100'
    this.container.style.pointerEvents = 'auto'
    this.container.style.fontFamily = "'Bitcount Grid Double', 'Space Grotesk', monospace"
    document.body.appendChild(this.container)
  }

  show(onSelect: (choice: UpgradeChoice) => void): void {
    this.isOpen = true
    this.container.style.display = 'flex'
    this.container.innerHTML = ''

    const panel = document.createElement('div')
    panel.style.display = 'flex'
    panel.style.flexDirection = 'column'
    panel.style.alignItems = 'center'
    panel.style.gap = '22px'
    panel.style.maxWidth = '900px'
    panel.style.width = '90%'

    const header = document.createElement('div')
    header.style.textAlign = 'center'
    header.innerHTML = `
      <div style="font-family: 'Bitcount Grid Double', monospace; font-size: 14px; letter-spacing: 4px; color: #00ff88; text-transform: uppercase; margin-bottom: 6px;">[ SOLDER POINT COMPLETED ]</div>
      <h2 style="font-family: 'Bitcount Grid Double', monospace; font-size: 32px; font-weight: 900; color: #ffffff; margin: 0; text-shadow: 0 0 16px rgba(0,255,136,0.5); letter-spacing: 2px;">CHOISIS TON OVERCLOCK</h2>
      <div style="font-size: 13px; color: #94a3b8; margin-top: 6px; letter-spacing: 1px;">Appuie sur <b style="color: #00ff88;">[1]</b>, <b style="color: #3399ff;">[2]</b> ou <b style="color: #ffaa00;">[3]</b></div>
    `
    panel.appendChild(header)

    const cardsContainer = document.createElement('div')
    cardsContainer.style.display = 'grid'
    cardsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)'
    cardsContainer.style.gap = '18px'
    cardsContainer.style.width = '100%'

    ALL_UPGRADES.forEach((choice, idx) => {
      const card = document.createElement('div')
      card.style.background = 'linear-gradient(160deg, #142030, #0c1420)'
      card.style.border = `2px solid ${choice.color}55`
      card.style.borderRadius = '10px'
      card.style.padding = '24px 20px'
      card.style.display = 'flex'
      card.style.flexDirection = 'column'
      card.style.alignItems = 'center'
      card.style.textAlign = 'center'
      card.style.cursor = 'pointer'
      card.style.transition = 'all 0.2s ease'
      card.style.boxShadow = `0 10px 30px rgba(0,0,0,0.6)`

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 14px;">
          <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 12px; font-weight: 700; background: ${choice.color}22; color: ${choice.color}; padding: 4px 8px; border-radius: 4px; border: 1px solid ${choice.color}66; letter-spacing: 1px;">${choice.badge}</span>
          <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 15px; font-weight: 800; color: #ffffff; background: #1e293b; padding: 2px 10px; border-radius: 4px; border: 1px solid #334155;">[${idx + 1}]</span>
        </div>
        <div style="margin: 12px 0 16px 0; display: flex; align-items: center; justify-content: center;">
          ${choice.iconSvg}
        </div>
        <div style="font-family: 'Bitcount Grid Double', monospace; font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 10px; letter-spacing: 1px;">${choice.title}</div>
        <div style="font-size: 13px; color: #cbd5e0; line-height: 1.5; font-family: 'Space Grotesk', sans-serif;">${choice.description}</div>
      `

      card.onmouseenter = () => {
        card.style.borderColor = choice.color
        card.style.transform = 'translateY(-6px)'
        card.style.boxShadow = `0 14px 34px ${choice.color}44`
      }
      card.onmouseleave = () => {
        card.style.borderColor = `${choice.color}55`
        card.style.transform = 'translateY(0)'
        card.style.boxShadow = `0 10px 30px rgba(0,0,0,0.6)`
      }

      card.onclick = () => {
        this.selectChoice(choice, onSelect)
      }

      cardsContainer.appendChild(card)
    })

    panel.appendChild(cardsContainer)
    this.container.appendChild(panel)

    // GSAP Entrance
    gsap.fromTo(panel, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' })

    const keyHandler = (e: KeyboardEvent) => {
      if (!this.isOpen) return
      if (e.key === '1') {
        const c = ALL_UPGRADES[0]
        if (c) {
          window.removeEventListener('keydown', keyHandler)
          this.selectChoice(c, onSelect)
        }
      } else if (e.key === '2') {
        const c = ALL_UPGRADES[1]
        if (c) {
          window.removeEventListener('keydown', keyHandler)
          this.selectChoice(c, onSelect)
        }
      } else if (e.key === '3') {
        const c = ALL_UPGRADES[2]
        if (c) {
          window.removeEventListener('keydown', keyHandler)
          this.selectChoice(c, onSelect)
        }
      }
    }
    window.addEventListener('keydown', keyHandler)
  }

  private selectChoice(choice: UpgradeChoice, onSelect: (c: UpgradeChoice) => void): void {
    this.isOpen = false
    gsap.to(this.container, {
      opacity: 0,
      duration: 0.15,
      onComplete: () => {
        this.container.style.display = 'none'
        this.container.style.opacity = '1'
        onSelect(choice)
      },
    })
  }
}

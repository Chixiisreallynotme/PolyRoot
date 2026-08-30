import { gsap } from 'gsap'

// Diegetic Overclock Cards Selection UI with Space Grotesk & Chakra Petch typography
// Builds: A Aura Overdrive, B Rapid Blast, C Cyber Speed

export interface UpgradeChoice {
  id: string
  build: 'A' | 'B' | 'C'
  title: string
  description: string
  badge: string
  icon: string
  color: string
}

export const ALL_UPGRADES: UpgradeChoice[] = [
  {
    id: 'aura_1',
    build: 'A',
    title: 'Aura Overdrive',
    description: 'Rayon de l\'aura +35% & Répulsion de choc des cryptos',
    badge: 'AURA',
    icon: '⚡',
    color: '#00ff88',
  },
  {
    id: 'shoot_1',
    build: 'B',
    title: 'Tir Accéléré',
    description: 'Cadence de tir +50% & Projectiles perforants',
    badge: 'CANNON',
    icon: '🎯',
    color: '#3399ff',
  },
  {
    id: 'speed_1',
    build: 'C',
    title: 'Vélocité Cyber',
    description: 'Vitesse de Root +30% & Cooldown du Dash -35%',
    badge: 'MOBILITY',
    icon: '🚀',
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
    this.container.style.background = 'rgba(5, 10, 15, 0.85)'
    this.container.style.backdropFilter = 'blur(6px)'
    this.container.style.zIndex = '100'
    this.container.style.pointerEvents = 'auto'
    this.container.style.fontFamily = "'Space Grotesk', 'Chakra Petch', sans-serif"
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
    panel.style.gap = '20px'
    panel.style.maxWidth = '850px'
    panel.style.width = '90%'

    const header = document.createElement('div')
    header.style.textAlign = 'center'
    header.innerHTML = `
      <div style="font-family: 'Chakra Petch', sans-serif; font-size: 13px; letter-spacing: 4px; color: #00ff88; text-transform: uppercase; margin-bottom: 6px;">[ SOLDER POINT COMPLETED ]</div>
      <h2 style="font-size: 28px; font-weight: 800; color: #ffffff; margin: 0; text-shadow: 0 0 16px rgba(0,255,136,0.4);">CHOISIS TON OVERCLOCK</h2>
      <div style="font-size: 13px; color: #8899aa; margin-top: 4px;">Appuie sur <b style="color: #fff;">[1]</b>, <b style="color: #fff;">[2]</b> ou <b style="color: #fff;">[3]</b></div>
    `
    panel.appendChild(header)

    const cardsContainer = document.createElement('div')
    cardsContainer.style.display = 'grid'
    cardsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)'
    cardsContainer.style.gap = '16px'
    cardsContainer.style.width = '100%'

    ALL_UPGRADES.forEach((choice, idx) => {
      const card = document.createElement('div')
      card.style.background = 'linear-gradient(145deg, #101924, #0c1219)'
      card.style.border = `2px solid ${choice.color}44`
      card.style.borderRadius = '12px'
      card.style.padding = '22px 18px'
      card.style.display = 'flex'
      card.style.flexDirection = 'column'
      card.style.alignItems = 'center'
      card.style.textAlign = 'center'
      card.style.cursor = 'pointer'
      card.style.transition = 'all 0.2s ease'
      card.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5)`

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 11px; font-weight: 700; background: ${choice.color}22; color: ${choice.color}; padding: 4px 8px; border-radius: 4px; border: 1px solid ${choice.color}66;">${choice.badge}</span>
          <span style="font-size: 14px; font-weight: 800; color: #ffffff; background: #222; padding: 2px 8px; border-radius: 4px;">[${idx + 1}]</span>
        </div>
        <div style="font-size: 38px; margin: 8px 0;">${choice.icon}</div>
        <div style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">${choice.title}</div>
        <div style="font-size: 13px; color: #a0aec0; line-height: 1.4;">${choice.description}</div>
      `

      card.onmouseenter = () => {
        card.style.borderColor = choice.color
        card.style.transform = 'translateY(-6px)'
        card.style.boxShadow = `0 12px 30px ${choice.color}33`
      }
      card.onmouseleave = () => {
        card.style.borderColor = `${choice.color}44`
        card.style.transform = 'translateY(0)'
        card.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5)`
      }

      card.onclick = () => {
        this.selectChoice(choice, onSelect)
      }

      cardsContainer.appendChild(card)
    })

    panel.appendChild(cardsContainer)
    this.container.appendChild(panel)

    // GSAP Entrance
    gsap.fromTo(panel, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' })

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

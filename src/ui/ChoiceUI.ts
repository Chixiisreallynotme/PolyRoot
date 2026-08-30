import { gsap } from 'gsap'
import { PixelArt } from './PixelArt'
import { SoundSystem } from '../audio/SoundSystem'

// PS1 Bresenham Stepped Pixel Corner Clip Paths (8px -> 4px -> 2px -> 1px Bevels)
export const PS1_BEVEL_8PX = `polygon(
  8px 0px, calc(100% - 8px) 0px,
  calc(100% - 8px) 2px, calc(100% - 4px) 2px,
  calc(100% - 4px) 4px, calc(100% - 2px) 4px,
  calc(100% - 2px) 8px, 100% 8px,
  100% calc(100% - 8px),
  calc(100% - 2px) calc(100% - 8px), calc(100% - 2px) calc(100% - 4px),
  calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) calc(100% - 2px),
  calc(100% - 8px) calc(100% - 2px), calc(100% - 8px) 100%,
  8px 100%,
  8px calc(100% - 2px), 4px calc(100% - 2px),
  4px calc(100% - 4px), 2px calc(100% - 4px),
  2px calc(100% - 8px), 0px calc(100% - 8px),
  0px 8px,
  2px 8px, 2px 4px,
  4px 4px, 4px 2px,
  8px 2px
)`

export const PS1_BEVEL_4PX = `polygon(
  4px 0px, calc(100% - 4px) 0px,
  calc(100% - 4px) 1px, calc(100% - 2px) 1px,
  calc(100% - 2px) 2px, calc(100% - 1px) 2px,
  calc(100% - 1px) 4px, 100% 4px,
  100% calc(100% - 4px),
  calc(100% - 1px) calc(100% - 4px), calc(100% - 1px) calc(100% - 2px),
  calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) calc(100% - 1px),
  calc(100% - 4px) calc(100% - 1px), calc(100% - 4px) 100%,
  4px 100%,
  4px calc(100% - 1px), 2px calc(100% - 1px),
  2px calc(100% - 2px), 1px calc(100% - 2px),
  1px calc(100% - 4px), 0px calc(100% - 4px),
  0px 4px,
  1px 4px, 1px 2px,
  2px 2px, 2px 1px,
  4px 1px
)`

// 15-bit PS1 Bayer Dither Texture Pattern
export const PS1_DITHER_BG = `
  repeating-conic-gradient(rgba(0, 0, 0, 0.22) 0% 25%, rgba(255, 255, 255, 0.03) 0% 50%) 50% / 4px 4px
`

// Overclock Builds with Large Crisp PixelArt SVGs
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
    iconSvg: PixelArt.auraOverdrive,
    color: '#00ff88',
  },
  {
    id: 'shoot_1',
    build: 'B',
    title: 'CANNON OVERDRIVE',
    description: 'Cadence de tir +50% & Projectiles perforants accélérés',
    badge: 'CANNON',
    iconSvg: PixelArt.cannonOverdrive,
    color: '#00ffff',
  },
  {
    id: 'speed_1',
    build: 'C',
    title: 'CYBER MOBILITY',
    description: 'Vitesse de Root +30% & Cooldown du Dash -35%',
    badge: 'MOBILITY',
    iconSvg: PixelArt.cyberMobility,
    color: '#ffaa00',
  },
]

export class ChoiceUI {
  private container: HTMLDivElement
  private activeKeyHandler: ((e: KeyboardEvent) => void) | null = null
  public isOpen = false

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'choice-ui'
    this.container.style.position = 'fixed'
    this.container.style.inset = '0'
    this.container.style.display = 'none'
    this.container.style.alignItems = 'center'
    this.container.style.justifyContent = 'center'
    this.container.style.background = 'radial-gradient(circle, rgba(14, 23, 38, 0.92) 0%, rgba(4, 8, 14, 0.98) 100%)'
    this.container.style.backdropFilter = 'blur(10px)'
    this.container.style.zIndex = '100'
    this.container.style.pointerEvents = 'auto'
    this.container.style.fontFamily = "'Bitcount Grid Double', 'Space Grotesk', monospace"
    this.container.style.imageRendering = 'pixelated'
    document.body.appendChild(this.container)
  }

  show(onSelect: (choice: UpgradeChoice | null) => void): void {
    if (this.activeKeyHandler) {
      window.removeEventListener('keydown', this.activeKeyHandler)
      this.activeKeyHandler = null
    }

    this.isOpen = true
    this.container.style.display = 'flex'
    this.container.innerHTML = ''

    // Main Modal Frame with PS1 Stepped Corners
    const modalFrame = document.createElement('div')
    modalFrame.style.display = 'flex'
    modalFrame.style.flexDirection = 'column'
    modalFrame.style.alignItems = 'center'
    modalFrame.style.gap = '20px'
    modalFrame.style.maxWidth = '940px'
    modalFrame.style.width = '92%'
    modalFrame.style.background = '#0a101d'
    modalFrame.style.backgroundImage = PS1_DITHER_BG
    modalFrame.style.padding = '28px 28px 24px 28px'
    modalFrame.style.clipPath = PS1_BEVEL_8PX
    modalFrame.style.border = '2px solid #00ff88'
    modalFrame.style.boxShadow = '0 0 40px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1)'

    // Header with Dithered PS1 Stepped Badge & Instructions
    const header = document.createElement('div')
    header.style.textAlign = 'center'
    header.innerHTML = `
      <div style="display: inline-block; font-family: 'Bitcount Grid Double', monospace; font-size: 13px; letter-spacing: 3px; color: #00ff88; text-transform: uppercase; margin-bottom: 8px; background: rgba(0,255,136,0.12); padding: 4px 14px; clip-path: ${PS1_BEVEL_4PX}; border: 1px solid #00ff8866;">
        [ SOLDER POINT COMPLETED // KERNEL READY ]
      </div>
      <h2 style="font-family: 'Bitcount Grid Double', monospace; font-size: 32px; font-weight: 900; color: #ffffff; margin: 4px 0; text-shadow: 0 0 16px rgba(0,255,136,0.6); letter-spacing: 2px;">
        CHOISIS TON OVERCLOCK
      </h2>
      <div style="font-size: 13px; color: #94a3b8; margin-top: 4px; letter-spacing: 1px;">
        Appuie sur <b style="color: #00ff88; background: #0f172a; padding: 2px 6px; border: 1px solid #00ff8855; clip-path: ${PS1_BEVEL_4PX};">[1]</b>, <b style="color: #00ffff; background: #0f172a; padding: 2px 6px; border: 1px solid #00ffff55; clip-path: ${PS1_BEVEL_4PX};">[2]</b>, <b style="color: #ffaa00; background: #0f172a; padding: 2px 6px; border: 1px solid #ffaa0055; clip-path: ${PS1_BEVEL_4PX};">[3]</b> OU <b style="color: #f43f5e; background: #0f172a; padding: 2px 6px; border: 1px solid #f43f5e55; clip-path: ${PS1_BEVEL_4PX};">[4] PASSER</b>
      </div>
    `
    modalFrame.appendChild(header)

    // 3 Cards Grid
    const cardsContainer = document.createElement('div')
    cardsContainer.style.display = 'grid'
    cardsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)'
    cardsContainer.style.gap = '20px'
    cardsContainer.style.width = '100%'

    ALL_UPGRADES.forEach((choice, idx) => {
      // Outer Card Frame for Stepped PS1 Bevel Border
      const cardOuter = document.createElement('div')
      cardOuter.style.background = choice.color
      cardOuter.style.padding = '2px'
      cardOuter.style.clipPath = PS1_BEVEL_8PX
      cardOuter.style.cursor = 'pointer'
      cardOuter.style.transition = 'transform 0.15s ease, filter 0.15s ease'
      cardOuter.style.boxShadow = `0 10px 30px rgba(0,0,0,0.7), 0 0 15px ${choice.color}33`

      const card = document.createElement('div')
      card.style.background = '#0e1726'
      card.style.backgroundImage = `
        radial-gradient(circle at 50% 30%, ${choice.color}15 0%, transparent 70%),
        ${PS1_DITHER_BG}
      `
      card.style.clipPath = PS1_BEVEL_8PX
      card.style.padding = '22px 18px'
      card.style.display = 'flex'
      card.style.flexDirection = 'column'
      card.style.alignItems = 'center'
      card.style.textAlign = 'center'
      card.style.height = '100%'
      card.style.boxSizing = 'border-box'

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 12px;">
          <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 11px; font-weight: 700; background: ${choice.color}22; color: ${choice.color}; padding: 3px 8px; clip-path: ${PS1_BEVEL_4PX}; border: 1px solid ${choice.color}88; letter-spacing: 1px;">
            ${choice.badge}
          </span>
          <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 14px; font-weight: 900; color: #ffffff; background: #1e293b; padding: 2px 10px; clip-path: ${PS1_BEVEL_4PX}; border: 1px solid #475569;">
            [${idx + 1}]
          </span>
        </div>

        <div style="margin: 8px 0 16px 0; width: 84px; height: 84px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, ${choice.color}25 0%, rgba(0,0,0,0.5) 75%); clip-path: ${PS1_BEVEL_8PX}; border: 1px solid ${choice.color}55;">
          ${choice.iconSvg}
        </div>

        <div style="font-family: 'Bitcount Grid Double', monospace; font-size: 19px; font-weight: 900; color: #ffffff; margin-bottom: 10px; letter-spacing: 1px; text-shadow: 0 0 10px ${choice.color}88;">
          ${choice.title}
        </div>

        <div style="font-size: 13px; color: #cbd5e0; line-height: 1.45; font-family: 'Space Grotesk', sans-serif; flex-grow: 1;">
          ${choice.description}
        </div>

        <div style="margin-top: 14px; width: 100%; padding-top: 8px; border-top: 1px dashed ${choice.color}44; font-size: 11px; color: ${choice.color}; letter-spacing: 1px; font-weight: 700;">
          [ CLIQUEZ OU APPUYEZ SUR ${idx + 1} ]
        </div>
      `

      cardOuter.appendChild(card)

      cardOuter.onmouseenter = () => {
        cardOuter.style.transform = 'translateY(-6px) scale(1.02)'
        cardOuter.style.filter = `drop-shadow(0 0 20px ${choice.color}88)`
        SoundSystem.playGem()
      }
      cardOuter.onmouseleave = () => {
        cardOuter.style.transform = 'translateY(0) scale(1.0)'
        cardOuter.style.filter = 'none'
      }

      cardOuter.onclick = () => {
        this.selectChoice(choice, onSelect)
      }

      cardsContainer.appendChild(cardOuter)
    })

    modalFrame.appendChild(cardsContainer)

    // 4. Overclock Refusal / Skip Button [4]
    const skipOuter = document.createElement('div')
    skipOuter.id = 'choice-skip-button'
    skipOuter.style.width = '100%'
    skipOuter.style.background = '#f43f5e88'
    skipOuter.style.padding = '2px'
    skipOuter.style.clipPath = PS1_BEVEL_8PX
    skipOuter.style.cursor = 'pointer'
    skipOuter.style.transition = 'transform 0.15s ease, filter 0.15s ease, background 0.15s ease'
    skipOuter.style.boxShadow = '0 6px 20px rgba(0,0,0,0.6), 0 0 16px rgba(244,63,94,0.2)'

    const skipInner = document.createElement('div')
    skipInner.style.background = '#130810'
    skipInner.style.backgroundImage = `
      radial-gradient(circle at 50% 50%, rgba(244,63,94,0.14) 0%, transparent 80%),
      ${PS1_DITHER_BG}
    `
    skipInner.style.clipPath = PS1_BEVEL_8PX
    skipInner.style.padding = '14px 22px'
    skipInner.style.display = 'flex'
    skipInner.style.alignItems = 'center'
    skipInner.style.justifyContent = 'space-between'
    skipInner.style.gap = '16px'

    skipInner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 14px;">
        <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 14px; font-weight: 900; color: #ffffff; background: #881337; padding: 4px 10px; clip-path: ${PS1_BEVEL_4PX}; border: 1px solid #f43f5e;">
          [4]
        </span>
        <div style="display: flex; flex-direction: column; text-align: left; gap: 2px;">
          <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 14px; font-weight: 900; color: #f43f5e; letter-spacing: 1.5px; text-shadow: 0 0 10px rgba(244,63,94,0.6);">
            [4] PASSER L'OVERCLOCK (CHALLENGE ROOT +15% VITESSE CHAUFFE)
          </span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: #cbd5e0; letter-spacing: 0.5px;">
            Refuser l'overclock // Aucun perk accordé // +15% Vitesse de chauffe pour score runners hard-mode
          </span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 11px; font-weight: 700; color: #f43f5e; background: rgba(244,63,94,0.15); padding: 4px 10px; clip-path: ${PS1_BEVEL_4PX}; border: 1px dashed #f43f5e88;">
          [4] OU [ECHAP]
        </span>
      </div>
    `

    skipOuter.appendChild(skipInner)

    skipOuter.onmouseenter = () => {
      skipOuter.style.background = '#f43f5e'
      skipOuter.style.transform = 'translateY(-2px) scale(1.01)'
      skipOuter.style.filter = 'drop-shadow(0 0 18px rgba(244,63,94,0.6))'
      SoundSystem.playGem()
    }
    skipOuter.onmouseleave = () => {
      skipOuter.style.background = '#f43f5e88'
      skipOuter.style.transform = 'translateY(0) scale(1.0)'
      skipOuter.style.filter = 'none'
    }

    skipOuter.onclick = () => {
      this.selectChoice(null, onSelect)
    }

    modalFrame.appendChild(skipOuter)
    this.container.appendChild(modalFrame)

    // GSAP Entrance
    gsap.fromTo(modalFrame, { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(1.6)' })

    this.activeKeyHandler = (e: KeyboardEvent) => {
      if (!this.isOpen) return
      if (e.key === '1') {
        const c = ALL_UPGRADES[0]
        if (c) this.selectChoice(c, onSelect)
      } else if (e.key === '2') {
        const c = ALL_UPGRADES[1]
        if (c) this.selectChoice(c, onSelect)
      } else if (e.key === '3') {
        const c = ALL_UPGRADES[2]
        if (c) this.selectChoice(c, onSelect)
      } else if (e.key === '4' || e.key === 'Escape') {
        this.selectChoice(null, onSelect)
      }
    }
    window.addEventListener('keydown', this.activeKeyHandler)
  }

  private selectChoice(choice: UpgradeChoice | null, onSelect: (c: UpgradeChoice | null) => void): void {
    if (this.activeKeyHandler) {
      window.removeEventListener('keydown', this.activeKeyHandler)
      this.activeKeyHandler = null
    }

    this.isOpen = false
    SoundSystem.playSelect()
    onSelect(choice)
    gsap.to(this.container, {
      opacity: 0,
      duration: 0.15,
      onComplete: () => {
        this.container.style.display = 'none'
        this.container.style.opacity = '1'
      },
    })
  }
}



import { PS1_BEVEL_8PX, PS1_BEVEL_4PX, PS1_DITHER_BG } from './ChoiceUI'
import { SoundSystem } from '../audio/SoundSystem'
import { PixelArt } from './PixelArt'

export class IntroMenuUI {
  private container: HTMLDivElement
  private keydownHandler?: (e: KeyboardEvent) => void
  private isVisible = false

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'intro-menu-ui'
    this.container.style.display = 'none'
    this.container.style.position = 'fixed'
    this.container.style.top = '0'
    this.container.style.left = '0'
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'
    this.container.style.background = 'radial-gradient(circle, rgba(12, 18, 30, 0.96) 0%, rgba(4, 7, 12, 0.98) 100%)'
    this.container.style.backdropFilter = 'blur(10px)'
    this.container.style.zIndex = '2000'
    this.container.style.flexDirection = 'column'
    this.container.style.justifyContent = 'center'
    this.container.style.alignItems = 'center'
    this.container.style.fontFamily = "'Bitcount Grid Double', 'Space Grotesk', monospace"
    this.container.style.color = '#00ff88'
    this.container.style.userSelect = 'none'
    this.container.style.imageRendering = 'pixelated'
    this.container.style.overflowY = 'auto'
    this.container.style.padding = '20px'
    this.container.style.boxSizing = 'border-box'

    document.body.appendChild(this.container)
  }

  show(onStart: () => void): void {
    this.isVisible = true
    this.container.style.display = 'flex'
    this.cleanupKeyHandler()

    this.container.innerHTML = `
      <div style="text-align: center; max-width: 780px; width: 100%; padding: 28px 24px; border: 2px solid #00ff88; background: #0b111c; background-image: ${PS1_DITHER_BG}; box-shadow: 0 0 40px rgba(0, 255, 136, 0.35); clip-path: ${PS1_BEVEL_8PX}; box-sizing: border-box;">
        
        <!-- Header Badge -->
        <div style="display: inline-block; font-size: 11px; letter-spacing: 3px; color: #00ff88; text-transform: uppercase; margin-bottom: 6px; background: rgba(0,255,136,0.12); padding: 4px 14px; clip-path: ${PS1_BEVEL_4PX}; border: 1px solid #00ff8866;">
          [ PS1 PU-8 KERNEL // SYSTEM BOOT V1.02 ]
        </div>

        <h1 style="color: #00ff88; font-size: 32px; letter-spacing: 3px; margin: 4px 0 2px 0; text-shadow: 0 0 18px rgba(0,255,136,0.6);">
          POLYROOT : ESCAPE FROM PS1
        </h1>
        
        <p style="color: #38bdf8; font-size: 12px; margin-bottom: 16px; letter-spacing: 1.5px; font-weight: 700;">
          OVERCLOCK SURVIVOR &bull; MISSION ÉVASION
        </p>

        <!-- Lore Story Box -->
        <div style="background: #060a12; background-image: ${PS1_DITHER_BG}; border: 1px solid #00ff8844; clip-path: ${PS1_BEVEL_8PX}; padding: 16px 20px; text-align: left; margin-bottom: 18px; line-height: 1.6; font-size: 12px; color: #cbd5e0;">
          <div style="color: #facc15; font-weight: 800; font-size: 12px; letter-spacing: 1px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            ${PixelArt.skull} HISTOIRE : POURQUOI ROOT EST ICI ?
          </div>
          <p style="margin: 0 0 8px 0;">
            <strong style="color: #f8fafc;">Awyen</strong> a essayé de miner de la crypto sur une carte mère de PlayStation 1 d'origine... 
            Mais suite à une mauvaise manipulation et une violente surcharge de voltage, <strong style="color: #ff5500;">Root</strong> s'est retrouvé téléporté et emprisonné au cœur des circuits imprimés !
          </p>
          <p style="margin: 0; color: #94a3b8;">
            Pour s'échapper, Root doit parcourir le substrat, <strong style="color: #00ff88;">surchauffer les 8 puces du processeur</strong> pour provoquer une panne générale du BIOS SOLI, repousser les cryptos hostiles et terrasser le boss <strong style="color: #38bdf8;">CyberLeek</strong> !
          </p>
        </div>

        <!-- Controls Guide Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 22px;">
          
          <div style="background: #080d16; border: 1px solid #1e293b; clip-path: ${PS1_BEVEL_4PX}; padding: 10px 8px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase;">DÉPLACEMENTS</div>
            <div style="font-size: 14px; font-weight: 900; color: #00ff88; letter-spacing: 1px;">[ZQSD] / [FLÈCHES]</div>
          </div>

          <div style="background: #080d16; border: 1px solid #1e293b; clip-path: ${PS1_BEVEL_4PX}; padding: 10px 8px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase;">SAUT & PLATFORMING</div>
            <div style="font-size: 14px; font-weight: 900; color: #38bdf8; letter-spacing: 1px;">[ESPACE]</div>
          </div>

          <div style="background: #080d16; border: 1px solid #1e293b; clip-path: ${PS1_BEVEL_4PX}; padding: 10px 8px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase;">DASH & VITESSE</div>
            <div style="font-size: 14px; font-weight: 900; color: #facc15; letter-spacing: 1px;">[MAJ / SHIFT]</div>
          </div>

        </div>

        <!-- Launch CTA Button -->
        <button id="btn-start-game" style="background: #00ff88; color: #050b14; border: none; padding: 14px 44px; font-size: 16px; font-weight: 900; font-family: inherit; clip-path: ${PS1_BEVEL_4PX}; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; box-shadow: 0 0 24px rgba(0,255,136,0.6); letter-spacing: 1.5px;">
          [ESPACE / ENTRÉE] DÉMARRER L'ÉVASION
        </button>

        <div style="margin-top: 16px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 10px; letter-spacing: 1px; display: flex; justify-content: space-between;">
          <span>MUSIQUE : [M] ACTIVER/COUPER</span>
          <span>PAUSE : [ÉCHAP]</span>
          <span>60 FPS SOLID</span>
        </div>
      </div>
    `

    const startAction = () => {
      if (!this.isVisible) return
      this.hide()
      SoundSystem.playSelect()
      SoundSystem.startMusic()
      onStart()
    }

    const btn = document.getElementById('btn-start-game')
    btn?.addEventListener('mouseenter', () => SoundSystem.playGem())
    btn?.addEventListener('click', startAction)

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        startAction()
      }
    }
    window.addEventListener('keydown', this.keydownHandler)
  }

  private cleanupKeyHandler(): void {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler)
      this.keydownHandler = undefined
    }
  }

  hide(): void {
    this.isVisible = false
    this.cleanupKeyHandler()
    this.container.style.display = 'none'
  }

  isMenuOpen(): boolean {
    return this.isVisible
  }
}

import type { Player } from '../entities/Player'

// via roguelike: 3 builds A/B/C — via rpg: builds clamp — ChoiceUI 4/run
// [A] +25% Aura radius & knockback | [B] +35% Tir dégâts/cadence | [C] +15% Vitesse + taille aura

export type BuildChoice = 'A' | 'B' | 'C'

export class ChoiceUI {
  private container: HTMLDivElement | null = null
  private isOpen = false
  private onSelectCallback: ((choice: BuildChoice) => void) | null = null

  constructor() {
    this.setupKeyboard()
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return
      if (e.key === '1' || e.code === 'Digit1') this.select('A')
      if (e.key === '2' || e.code === 'Digit2') this.select('B')
      if (e.key === '3' || e.code === 'Digit3') this.select('C')
    })
  }

  show(puceNumber: number, onSelect: (choice: BuildChoice) => void): void {
    this.isOpen = true
    this.onSelectCallback = onSelect

    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = 'choice-modal'
      this.container.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(10, 20, 15, 0.85);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Space Grotesk', monospace;
        color: #aaff00;
        z-index: 10000;
        image-rendering: pixelated;
      `
      document.body.appendChild(this.container)
    }

    this.container.innerHTML = `
      <div style="background: #112218; border: 2px solid #aaff00; padding: 24px; max-width: 540px; text-align: center; box-shadow: 0 0 20px rgba(170,255,0,0.3);">
        <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #88ee00; margin-bottom: 8px;">
          ⚡ SURCHAUFFE PUCE #${puceNumber} VALIDÉE ⚡
        </div>
        <h2 style="font-size: 20px; margin: 0 0 16px 0; color: #ffffff;">CHOISIS TON OVERCLOCK</h2>
        
        <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 16px;">
          <div id="btn-choice-A" style="flex: 1; background: #1a3325; border: 1px solid #aaff00; padding: 14px 10px; cursor: pointer;">
            <div style="font-size: 16px; font-weight: bold; color: #aaff00; margin-bottom: 6px;">[1] AURA MAX</div>
            <div style="font-size: 11px; color: #ddffaa;">+25% Rayon Aura & Repoussement</div>
          </div>
          
          <div id="btn-choice-B" style="flex: 1; background: #1a3325; border: 1px solid #aaff00; padding: 14px 10px; cursor: pointer;">
            <div style="font-size: 16px; font-weight: bold; color: #aaff00; margin-bottom: 6px;">[2] TIR BOOST</div>
            <div style="font-size: 11px; color: #ddffaa;">+35% Dégâts & Cadence Tir</div>
          </div>
          
          <div id="btn-choice-C" style="flex: 1; background: #1a3325; border: 1px solid #aaff00; padding: 14px 10px; cursor: pointer;">
            <div style="font-size: 16px; font-weight: bold; color: #aaff00; margin-bottom: 6px;">[3] SPEED RUN</div>
            <div style="font-size: 11px; color: #ddffaa;">+15% Vitesse & Taille Globale</div>
          </div>
        </div>
        
        <div style="font-size: 11px; color: #88aa88;">Appuie sur [1], [2], ou [3] pour sélectionner</div>
      </div>
    `

    this.container.style.display = 'flex'

    document.getElementById('btn-choice-A')?.addEventListener('click', () => this.select('A'))
    document.getElementById('btn-choice-B')?.addEventListener('click', () => this.select('B'))
    document.getElementById('btn-choice-C')?.addEventListener('click', () => this.select('C'))
  }

  private select(choice: BuildChoice): void {
    if (!this.isOpen) return
    this.isOpen = false
    if (this.container) this.container.style.display = 'none'
    console.log(`[choice] Selected Overclock: [${choice}]`)
    if (this.onSelectCallback) this.onSelectCallback(choice)
  }

  applyChoiceToPlayer(choice: BuildChoice, player: Player): void {
    if (choice === 'A') {
      player.stats.auraRadius = Math.min(2.5, player.stats.auraRadius * 1.25)
      player.stats.auraPower *= 1.3
    } else if (choice === 'B') {
      player.stats.shootRate = Math.max(0.18, player.stats.shootRate * 0.75) // Faster
      player.stats.shootDamage *= 1.35
    } else if (choice === 'C') {
      player.stats.speedMult = Math.min(1.8, player.stats.speedMult * 1.15)
      player.stats.auraRadius = Math.min(2.5, player.stats.auraRadius * 1.1)
    }
  }

  get visible(): boolean {
    return this.isOpen
  }
}

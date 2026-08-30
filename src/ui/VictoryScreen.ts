import { RankSystem, type RunScore } from '../systems/RankSystem'

// UI for Victory and Game Over screens with Bitcount Grid Double & Pixel Art SVGs (Zero emojis, Zero slop)

export class VictoryScreen {
  private container: HTMLDivElement | null = null

  showVictory(score: RunScore, onRestart: () => void): void {
    this.render(true, score, 8, onRestart)
  }

  showGameOver(score: RunScore, pucesHeated: number, onRestart: () => void): void {
    this.render(false, score, pucesHeated, onRestart)
  }

  private render(isVictory: boolean, score: RunScore, pucesHeated: number, onRestart: () => void): void {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = 'end-screen-modal'
      this.container.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(8, 14, 24, 0.94);
        backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Bitcount Grid Double', monospace;
        color: #00ff88;
        z-index: 10000;
        image-rendering: pixelated;
      `
      document.body.appendChild(this.container)
    }

    const title = isVictory ? 'PU-8 RESTAURATION VALIDÉE // SYSTÈME EN LIGNE' : 'INTERRUPTION BUS CRITIQUE // ÉCHEC SYSTÈME'
    const titleColor = isVictory ? '#00ff88' : '#ff2244'
    const rankBadgeColor = score.rank === 'S' ? '#ffd700' : score.rank === 'A' ? '#00ff88' : '#3399ff'

    const nearMissHtml = score.nearMissMessage
      ? `<div style="font-size: 14px; color: #ffaa00; margin-bottom: 14px; letter-spacing: 1px;">[ ${score.nearMissMessage} ]</div>`
      : ''

    const subText = isVictory
      ? `8 / 8 CIRCUITS INTÉGRÉS SYNCHRONISÉS // CARTE MÈRE PU-8 OPÉRATIONNELLE`
      : `${pucesHeated} / 8 CIRCUITS INTÉGRÉS RESTAURÉS AVANT DÉCONNEXION MATÉRIELLE`

    this.container.innerHTML = `
      <div style="background: #0f1926; border: 2px solid ${titleColor}; padding: 36px 40px; max-width: 620px; text-align: center; box-shadow: 0 0 35px rgba(0,0,0,0.85); border-radius: 8px;">
        <h1 style="font-family: 'Bitcount Grid Double', monospace; font-size: 26px; font-weight: 900; margin: 0 0 12px 0; color: ${titleColor}; letter-spacing: 2px; text-shadow: 0 0 16px ${titleColor}66;">
          ${title}
        </h1>
        
        <p style="font-size: 13px; color: #cbd5e0; margin-bottom: 24px; line-height: 1.5; font-family: 'Bitcount Grid Double', monospace; letter-spacing: 1px;">
          ${subText}
        </p>

        <div style="background: #152233; border: 1px solid #1e3a5f; padding: 18px 22px; margin-bottom: 22px; text-align: left; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
            <span style="color: #94a3b8; letter-spacing: 1px;">CYCLE HORLOGE (TEMPS BRUT):</span>
            <span style="color: #ffffff; font-weight: bold; letter-spacing: 1px;">${RankSystem.formatTime(score.rawTimeSeconds)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
            <span style="color: #94a3b8; letter-spacing: 1px;">PURGE PARASITES (${score.kills} ÉLIMS):</span>
            <span style="color: #00ff88; font-weight: bold; letter-spacing: 1px;">-${(score.kills * 0.05).toFixed(2)}s</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
            <span style="color: #94a3b8; letter-spacing: 1px;">INDEX DE PERFORMANCE:</span>
            <span style="color: #00ff88; font-weight: bold; letter-spacing: 1px;">${RankSystem.formatTime(score.scoreTimeSeconds)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1e3a5f; padding-top: 12px; margin-top: 6px;">
            <span style="color: #94a3b8; letter-spacing: 1px;">QUALIFICATION SYSTÈME:</span>
            <span style="font-family: 'Bitcount Grid Double', monospace; font-size: 24px; font-weight: 900; color: ${rankBadgeColor}; letter-spacing: 2px;">RANG ${score.rank}</span>
          </div>
        </div>

        ${nearMissHtml}

        <button id="btn-restart-game" style="background: #00ff88; color: #081018; border: none; font-family: 'Bitcount Grid Double', monospace; font-size: 15px; font-weight: 900; padding: 14px 28px; cursor: pointer; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px; box-shadow: 0 0 16px rgba(0,255,136,0.4); transition: transform 0.15s ease;">
          [R] RÉINITIALISER LE CYCLE
        </button>
      </div>
    `

    this.container.style.display = 'flex'

    const restartHandler = () => {
      window.removeEventListener('keydown', keyHandler)
      this.hide()
      onRestart()
    }

    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        restartHandler()
      }
    }

    window.addEventListener('keydown', keyHandler)
    document.getElementById('btn-restart-game')?.addEventListener('click', restartHandler)
  }

  hide(): void {
    if (this.container) {
      this.container.style.display = 'none'
    }
  }
}

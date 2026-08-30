import { RankSystem, type RunScore } from '../systems/RankSystem'

// UI for Victory and Game Over screens
// E2 break: “Tu as battu les grands studios.”
// B1 break: “Encore raté ? T'étais à 3s du S !”
// B3 break: “Tu as chauffé ton CPU IRL”

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
        background: rgba(10, 15, 12, 0.92);
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

    const title = isVictory ? 'Tu as battu les grands studios.' : 'GAME OVER'
    const titleColor = isVictory ? '#aaff00' : '#ff3333'
    const rankBadgeColor = score.rank === 'S' ? '#ffd700' : score.rank === 'A' ? '#aaff00' : '#00ddff'

    const nearMissHtml = score.nearMissMessage
      ? `<div style="font-size: 14px; color: #ffaa00; margin-bottom: 12px;">⚡ ${score.nearMissMessage} ⚡</div>`
      : ''

    const subText = isVictory
      ? `8 puces en ${RankSystem.formatTime(score.rawTimeSeconds)} — Rang ${score.rank} — Eux avaient 800 ennemis. Toi tu avais du fun.`
      : `Grillé sur le circuit. ${pucesHeated} / 8 puces complétées.`

    // B3 overlay IRL CPU
    const irlCpuHtml = `
      <div style="font-size: 11px; color: #88aa88; margin-top: 14px; border-top: 1px dashed #335544; padding-top: 10px;">
        Tu as chauffé ton CPU IRL — 200 particules | 3 draw calls | 60 FPS p95
      </div>
    `

    this.container.innerHTML = `
      <div style="background: #112218; border: 2px solid ${titleColor}; padding: 32px; max-width: 580px; text-align: center; box-shadow: 0 0 30px rgba(0,0,0,0.8);">
        <h1 style="font-size: 26px; margin: 0 0 10px 0; color: ${titleColor}; letter-spacing: 1px;">
          ${title}
        </h1>
        
        <p style="font-size: 13px; color: #ffffff; margin-bottom: 20px; line-height: 1.5;">
          ${subText}
        </p>

        <div style="background: #1a3325; border: 1px solid #336644; padding: 16px; margin-bottom: 20px; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #88aa88;">TEMPS BRUT:</span>
            <span style="color: #ffffff; font-weight: bold;">${RankSystem.formatTime(score.rawTimeSeconds)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #88aa88;">BONUS KILLS (${score.kills} × -0.05s):</span>
            <span style="color: #aaff00; font-weight: bold;">-${(score.kills * 0.05).toFixed(2)}s</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #88aa88;">SCORE FINAL SPEEDRUN:</span>
            <span style="color: #aaff00; font-weight: bold;">${RankSystem.formatTime(score.scoreTimeSeconds)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #336644; padding-top: 8px;">
            <span style="color: #88aa88;">RANG ATTEINT:</span>
            <span style="font-size: 22px; font-weight: bold; color: ${rankBadgeColor};">RANG ${score.rank}</span>
          </div>
        </div>

        ${nearMissHtml}

        <button id="btn-restart-game" style="background: #aaff00; color: #112218; border: none; font-family: inherit; font-size: 14px; font-weight: bold; padding: 12px 24px; cursor: pointer; text-transform: uppercase;">
          [R] RECOMMENCER LA RUN
        </button>

        ${irlCpuHtml}
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

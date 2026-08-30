import { RunScore, RankSystem } from '../systems/RankSystem'

export class VictoryScreen {
  private container: HTMLDivElement

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'victory-screen'
    this.container.style.display = 'none'
    this.container.style.position = 'fixed'
    this.container.style.top = '0'
    this.container.style.left = '0'
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'
    this.container.style.background = 'rgba(8, 12, 20, 0.94)'
    this.container.style.backdropFilter = 'blur(6px)'
    this.container.style.zIndex = '1000'
    this.container.style.flexDirection = 'column'
    this.container.style.justifyContent = 'center'
    this.container.style.alignItems = 'center'
    this.container.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.container.style.color = '#00ff88'
    this.container.style.userSelect = 'none'

    document.body.appendChild(this.container)
  }

  showVictory(score: RunScore, onRestart: () => void): void {
    this.container.style.display = 'flex'
    const rankColor =
      score.rank === 'S'
        ? '#00ff88'
        : score.rank === 'A'
        ? '#38bdf8'
        : score.rank === 'B'
        ? '#facc15'
        : '#94a3b8'

    const rawTimeFormatted = RankSystem.formatTime(score.rawTimeSeconds)
    const scoreTimeFormatted = RankSystem.formatTime(score.scoreTimeSeconds)
    const killBonus = (score.kills * 0.05).toFixed(2)

    this.container.innerHTML = `
      <div style="text-align: center; max-width: 620px; padding: 32px; border: 2px solid #00ff88; background: #0c121e; box-shadow: 0 0 24px rgba(0, 255, 136, 0.25); border-radius: 8px;">
        <h1 style="color: #00ff88; font-size: 32px; letter-spacing: 2px; margin-bottom: 8px; text-shadow: 0 0 12px rgba(0,255,136,0.5);">
          SYSTEM OVERRIDE COMPLETED
        </h1>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
          PS1 PU-8 KERNEL OVERCLOCKED // ROOT ACCESS GRANTED
        </p>

        <div style="background: #080d16; border: 1px solid #1e293b; padding: 20px; border-radius: 6px; text-align: left; margin-bottom: 24px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #94a3b8;">
            <span>TEMPS BRUT :</span>
            <strong style="color: #f8fafc;">${rawTimeFormatted}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #94a3b8;">
            <span>BONUS NEUTRALISATIONS (${score.kills} × -0.05s) :</span>
            <strong style="color: #38bdf8;">-${killBonus}s</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 14px; color: #94a3b8;">
            <span>SCORE CHRONO FINAL :</span>
            <strong style="color: #f8fafc;">${scoreTimeFormatted}</strong>
          </div>
          <div style="border-top: 1px dashed #334155; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 16px; font-weight: 700; color: #f8fafc;">RANG DE PERFORMANCE :</span>
            <span style="font-size: 28px; font-weight: 900; color: ${rankColor}; text-shadow: 0 0 10px ${rankColor};">
              RANG ${score.rank}
            </span>
          </div>
        </div>

        <button id="btn-restart" style="background: #00ff88; color: #050b14; border: none; padding: 14px 28px; font-size: 15px; font-weight: 800; font-family: inherit; border-radius: 4px; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; box-shadow: 0 0 14px rgba(0,255,136,0.4);">
          [R] RECOMMENCER LA RUN
        </button>

        <div style="margin-top: 24px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px;">
          HARDWARE STATUS : 8/8 PUCES STABILISÉES // 60 FPS p95
        </div>
      </div>
    `

    const btn = document.getElementById('btn-restart')
    btn?.addEventListener('click', onRestart)
  }

  showGameOver(score: RunScore, pucesHeated: number, onRestart: () => void): void {
    this.container.style.display = 'flex'
    const rawTimeFormatted = RankSystem.formatTime(score.rawTimeSeconds)

    this.container.innerHTML = `
      <div style="text-align: center; max-width: 580px; padding: 32px; border: 2px solid #ef4444; background: #0f131c; box-shadow: 0 0 24px rgba(239, 68, 68, 0.25); border-radius: 8px;">
        <h1 style="color: #ef4444; font-size: 32px; letter-spacing: 2px; margin-bottom: 8px; text-shadow: 0 0 12px rgba(239,68,68,0.5);">
          CRITICAL SYSTEM FAILURE
        </h1>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
          SURCHAUFFE CRITIQUE DU SUBSTRAT // SÉCURITÉ MATÉRIELLE DÉCLENCHÉE
        </p>

        <div style="background: #080d16; border: 1px solid #1e293b; padding: 20px; border-radius: 6px; text-align: left; margin-bottom: 24px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #94a3b8;">
            <span>PUCES SURCHAUFFÉES :</span>
            <strong style="color: #fbbf24;">${pucesHeated} / 8</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #94a3b8;">
            <span>TEMPS DE SURVIE :</span>
            <strong style="color: #f8fafc;">${rawTimeFormatted}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; color: #94a3b8;">
            <span>NEUTRALISATIONS :</span>
            <strong style="color: #38bdf8;">${score.kills}</strong>
          </div>
        </div>

        <button id="btn-restart" style="background: #ef4444; color: #ffffff; border: none; padding: 14px 28px; font-size: 15px; font-weight: 800; font-family: inherit; border-radius: 4px; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; box-shadow: 0 0 14px rgba(239,68,68,0.4);">
          [R] REDÉMARRER LE SYSTÈME
        </button>
      </div>
    `

    const btn = document.getElementById('btn-restart')
    btn?.addEventListener('click', onRestart)
  }

  hide(): void {
    this.container.style.display = 'none'
  }
}

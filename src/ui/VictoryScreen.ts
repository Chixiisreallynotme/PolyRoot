import { RunScore, RankSystem } from '../systems/RankSystem'
import { PS1_BEVEL_8PX, PS1_BEVEL_4PX, PS1_DITHER_BG } from './ChoiceUI'
import { SoundSystem } from '../audio/SoundSystem'

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
    this.container.style.background = 'radial-gradient(circle, rgba(14, 23, 38, 0.94) 0%, rgba(4, 8, 14, 0.98) 100%)'
    this.container.style.backdropFilter = 'blur(10px)'
    this.container.style.zIndex = '1000'
    this.container.style.flexDirection = 'column'
    this.container.style.justifyContent = 'center'
    this.container.style.alignItems = 'center'
    this.container.style.fontFamily = "'Bitcount Grid Double', monospace"
    this.container.style.color = '#00ff88'
    this.container.style.userSelect = 'none'
    this.container.style.imageRendering = 'pixelated'

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
      <div style="text-align: center; max-width: 640px; width: 90%; padding: 34px 30px; border: 2px solid #00ff88; background: #0c121e; background-image: ${PS1_DITHER_BG}; box-shadow: 0 0 40px rgba(0, 255, 136, 0.35); clip-path: ${PS1_BEVEL_8PX};">
        <div style="display: inline-block; font-size: 12px; letter-spacing: 3px; color: #00ff88; text-transform: uppercase; margin-bottom: 8px; background: rgba(0,255,136,0.12); padding: 4px 12px; clip-path: ${PS1_BEVEL_4PX}; border: 1px solid #00ff8866;">
          [ ROOT ACCESS UNLOCKED ]
        </div>
        <h1 style="color: #00ff88; font-size: 32px; letter-spacing: 2px; margin: 8px 0 6px 0; text-shadow: 0 0 16px rgba(0,255,136,0.6);">
          SYSTEM OVERRIDE COMPLETED
        </h1>
        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 24px; letter-spacing: 1px;">
          PS1 PU-8 KERNEL OVERCLOCKED // HARDWARE STABILIZED
        </p>

        <div style="background: #060a12; background-image: ${PS1_DITHER_BG}; border: 1px solid #1e293b; clip-path: ${PS1_BEVEL_8PX}; padding: 20px 22px; text-align: left; margin-bottom: 26px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #94a3b8;">
            <span>TEMPS BRUT :</span>
            <strong style="color: #f8fafc; font-family: monospace; font-size: 15px;">${rawTimeFormatted}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #94a3b8;">
            <span>BONUS NEUTRALISATIONS (${score.kills} × -0.05s) :</span>
            <strong style="color: #38bdf8; font-family: monospace; font-size: 15px;">-${killBonus}s</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 14px; color: #94a3b8;">
            <span>SCORE CHRONO FINAL :</span>
            <strong style="color: #f8fafc; font-family: monospace; font-size: 15px;">${scoreTimeFormatted}</strong>
          </div>
          <div style="border-top: 1px dashed #334155; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 15px; font-weight: 700; color: #f8fafc;">RANG DE PERFORMANCE :</span>
            <span style="font-size: 30px; font-weight: 900; color: ${rankColor}; text-shadow: 0 0 14px ${rankColor};">
              RANG ${score.rank}
            </span>
          </div>
        </div>

        <button id="btn-restart" style="background: #00ff88; color: #050b14; border: none; padding: 14px 32px; font-size: 15px; font-weight: 900; font-family: inherit; clip-path: ${PS1_BEVEL_4PX}; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; box-shadow: 0 0 20px rgba(0,255,136,0.5); letter-spacing: 1px;">
          [R] RECOMMENCER LA RUN
        </button>

        <div style="margin-top: 24px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px; letter-spacing: 1px;">
          HARDWARE STATUS : 8/8 PUCES STABILISÉES // 60 FPS p95
        </div>
      </div>
    `

    const btn = document.getElementById('btn-restart')
    btn?.addEventListener('mouseenter', () => SoundSystem.playGem())
    btn?.addEventListener('click', () => {
      SoundSystem.playSelect()
      onRestart()
    })
  }

  showGameOver(score: RunScore, pucesHeated: number, onRestart: () => void): void {
    this.container.style.display = 'flex'
    const rawTimeFormatted = RankSystem.formatTime(score.rawTimeSeconds)

    this.container.innerHTML = `
      <div style="text-align: center; max-width: 600px; width: 90%; padding: 34px 30px; border: 2px solid #ef4444; background: #0f131c; background-image: ${PS1_DITHER_BG}; box-shadow: 0 0 40px rgba(239, 68, 68, 0.35); clip-path: ${PS1_BEVEL_8PX};">
        <div style="display: inline-block; font-size: 12px; letter-spacing: 3px; color: #ef4444; text-transform: uppercase; margin-bottom: 8px; background: rgba(239,68,68,0.12); padding: 4px 12px; clip-path: ${PS1_BEVEL_4PX}; border: 1px solid #ef444466;">
          [ SUBSTRATE OVERHEAT WARNING ]
        </div>
        <h1 style="color: #ef4444; font-size: 32px; letter-spacing: 2px; margin: 8px 0 6px 0; text-shadow: 0 0 16px rgba(239,68,68,0.6);">
          CRITICAL SYSTEM FAILURE
        </h1>
        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 24px; letter-spacing: 1px;">
          SURCHAUFFE CRITIQUE // SÉCURITÉ MATÉRIELLE DÉCLENCHÉE
        </p>

        <div style="background: #080d16; background-image: ${PS1_DITHER_BG}; border: 1px solid #1e293b; clip-path: ${PS1_BEVEL_8PX}; padding: 20px 22px; text-align: left; margin-bottom: 26px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #94a3b8;">
            <span>PUCES SURCHAUFFÉES :</span>
            <strong style="color: #fbbf24; font-family: monospace; font-size: 15px;">${pucesHeated} / 8</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #94a3b8;">
            <span>TEMPS DE SURVIE :</span>
            <strong style="color: #f8fafc; font-family: monospace; font-size: 15px;">${rawTimeFormatted}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; color: #94a3b8;">
            <span>NEUTRALISATIONS :</span>
            <strong style="color: #38bdf8; font-family: monospace; font-size: 15px;">${score.kills}</strong>
          </div>
        </div>

        <button id="btn-restart" style="background: #ef4444; color: #ffffff; border: none; padding: 14px 32px; font-size: 15px; font-weight: 900; font-family: inherit; clip-path: ${PS1_BEVEL_4PX}; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; box-shadow: 0 0 20px rgba(239,68,68,0.5); letter-spacing: 1px;">
          [R] REDÉMARRER LE SYSTÈME
        </button>
      </div>
    `

    const btn = document.getElementById('btn-restart')
    btn?.addEventListener('mouseenter', () => SoundSystem.playGem())
    btn?.addEventListener('click', () => {
      SoundSystem.playSelect()
      onRestart()
    })
  }

  hide(): void {
    this.container.style.display = 'none'
  }
}


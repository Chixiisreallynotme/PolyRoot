import { RunScore, RankSystem, Rank, CompositeGrade } from '../systems/RankSystem'
import { PS1_BEVEL_8PX, PS1_BEVEL_4PX, PS1_DITHER_BG } from './ChoiceUI'
import { SoundSystem } from '../audio/SoundSystem'

export class VictoryScreen {
  private container: HTMLDivElement
  private keydownHandler?: (e: KeyboardEvent) => void

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'victory-screen'
    this.container.style.display = 'none'
    this.container.style.position = 'fixed'
    this.container.style.top = '0'
    this.container.style.left = '0'
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'
    this.container.style.background = 'radial-gradient(circle, rgba(14, 23, 38, 0.96) 0%, rgba(4, 8, 14, 0.98) 100%)'
    this.container.style.backdropFilter = 'blur(10px)'
    this.container.style.zIndex = '1000'
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

  private getGradePalette(grade: CompositeGrade | Rank | null): { text: string; bg: string; border: string; glow: string } {
    switch (grade) {
      case 'S+':
        return {
          text: '#00ff88',
          bg: 'rgba(0, 255, 136, 0.16)',
          border: '#00ff88',
          glow: '0 0 24px rgba(0, 255, 136, 0.8), 0 0 36px rgba(250, 204, 21, 0.45)',
        }
      case 'S':
        return {
          text: '#00ff88',
          bg: 'rgba(0, 255, 136, 0.12)',
          border: '#00ff88',
          glow: '0 0 18px rgba(0, 255, 136, 0.6)',
        }
      case 'A':
        return {
          text: '#38bdf8',
          bg: 'rgba(56, 189, 248, 0.12)',
          border: '#38bdf8',
          glow: '0 0 16px rgba(56, 189, 248, 0.55)',
        }
      case 'B':
        return {
          text: '#facc15',
          bg: 'rgba(250, 204, 21, 0.12)',
          border: '#facc15',
          glow: '0 0 16px rgba(250, 204, 21, 0.5)',
        }
      case 'C':
        return {
          text: '#f97316',
          bg: 'rgba(249, 115, 22, 0.12)',
          border: '#f97316',
          glow: '0 0 12px rgba(249, 115, 22, 0.4)',
        }
      case 'D':
      default:
        return {
          text: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: '#ef4444',
          glow: '0 0 12px rgba(239, 68, 68, 0.4)',
        }
    }
  }

  showVictory(score: RunScore, onRestart: () => void): void {
    this.container.style.display = 'flex'
    this.cleanupKeyHandler()

    const composite = score.compositeGrade || 'D'
    const timeRank = score.timeRank || 'D'
    const killsRank = score.killsRank || 'D'

    const gradePal = this.getGradePalette(composite)
    const timePal = this.getGradePalette(timeRank)
    const killsPal = this.getGradePalette(killsRank)

    const rawTimeFormatted = RankSystem.formatTime(score.rawTimeSeconds)
    const scoreTimeFormatted = RankSystem.formatTime(score.scoreTimeSeconds)
    const killBonus = (score.kills * 0.05).toFixed(2)

    const gradeSubtitle =
      composite === 'S+'
        ? 'DOUBLE-S OVERCLOCK // EXECUTION OPTIMALE'
        : composite === 'S'
        ? 'CADENCE ELEVEE // OVERCLOCK PRECIS'
        : composite === 'A'
        ? 'PERFORMANCE ELEVEE // HARDWARE STABILISE'
        : composite === 'B'
        ? 'EXECUTION STANDARD // MARGE ACCEPTABLE'
        : composite === 'C'
        ? 'CYCLE CRITIQUE // INSTABILITE CHRONO'
        : 'SURCHAUFFE DU SYSTEME // CADENCE LENTE'

    this.container.innerHTML = `
      <div style="text-align: center; max-width: 760px; width: 100%; padding: 28px 24px; border: 2px solid #00ff88; background: #0c121e; background-image: ${PS1_DITHER_BG}; box-shadow: 0 0 40px rgba(0, 255, 136, 0.35); clip-path: ${PS1_BEVEL_8PX}; box-sizing: border-box;">
        
        <!-- Header Badge -->
        <div style="display: inline-block; font-size: 11px; letter-spacing: 3px; color: #00ff88; text-transform: uppercase; margin-bottom: 6px; background: rgba(0,255,136,0.12); padding: 4px 14px; clip-path: ${PS1_BEVEL_4PX}; border: 1px solid #00ff8866;">
          [ BOSS CYBERLEEK NEUTRALISE // RUN VALIDEE ]
        </div>

        <h1 style="color: #00ff88; font-size: 28px; letter-spacing: 2px; margin: 6px 0 4px 0; text-shadow: 0 0 16px rgba(0,255,136,0.6);">
          SYSTEME PURGE
        </h1>
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 20px; letter-spacing: 1px;">
          ${gradeSubtitle}
        </p>

        <!-- Composite Hardware Grade Main Banner -->
        <div style="background: #060a12; background-image: ${PS1_DITHER_BG}; border: 2px solid ${gradePal.border}; clip-path: ${PS1_BEVEL_8PX}; padding: 18px 20px; text-align: center; margin-bottom: 20px; box-shadow: ${gradePal.glow};">
          <div style="font-size: 12px; letter-spacing: 2px; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase;">
            GRADE MATERIEL
          </div>
          <div style="font-size: 48px; font-weight: 900; color: ${gradePal.text}; text-shadow: ${gradePal.glow}; letter-spacing: 4px; line-height: 1.1;">
            GRADE ${composite}
          </div>
          <div style="font-size: 12px; color: #cbd5e0; margin-top: 6px;">
            Temps Pondere : <strong style="color: #f8fafc; font-family: monospace;">${scoreTimeFormatted}</strong> (Brut : ${rawTimeFormatted}, Bonus : -${killBonus}s)
          </div>
        </div>

        <!-- 2-Category Breakdown Grid (Temps + Kills) -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
          
          <!-- Category 1: Time Rank -->
          <div style="background: #080d16; border: 1px solid ${timePal.border}; clip-path: ${PS1_BEVEL_8PX}; padding: 16px 12px; display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div style="font-size: 11px; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase;">
              TEMPS CHRONO
            </div>
            <div style="background: ${timePal.bg}; color: ${timePal.text}; border: 1px solid ${timePal.border}; padding: 6px 18px; clip-path: ${PS1_BEVEL_4PX}; font-size: 22px; font-weight: 900; letter-spacing: 2px; margin-bottom: 8px; text-shadow: ${timePal.glow};">
              RANG ${timeRank}
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #f8fafc; font-family: monospace; margin-bottom: 4px;">
              ${scoreTimeFormatted}
            </div>
            <div style="font-size: 10px; color: #64748b; line-height: 1.3;">
              ${score.categories.time?.threshold || 'S < 1:45 | A < 2:30 | B < 3:30 | C < 4:45 | D >= 4:45'}
            </div>
          </div>

          <!-- Category 2: Kills Rank -->
          <div style="background: #080d16; border: 1px solid ${killsPal.border}; clip-path: ${PS1_BEVEL_8PX}; padding: 16px 12px; display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div style="font-size: 11px; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase;">
              NEUTRALISATIONS
            </div>
            <div style="background: ${killsPal.bg}; color: ${killsPal.text}; border: 1px solid ${killsPal.border}; padding: 6px 18px; clip-path: ${PS1_BEVEL_4PX}; font-size: 22px; font-weight: 900; letter-spacing: 2px; margin-bottom: 8px; text-shadow: ${killsPal.glow};">
              RANG ${killsRank}
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #f8fafc; font-family: monospace; margin-bottom: 4px;">
              ${score.kills} KILLS
            </div>
            <div style="font-size: 10px; color: #64748b; line-height: 1.3;">
              ${score.categories.kills?.threshold || 'S >= 80 | A >= 55 | B >= 35 | C >= 20 | D < 20'}
            </div>
          </div>

        </div>

        <!-- Optional Near-Miss or New Best Alert Banner -->
        ${
          score.nearMissMessage
            ? `
          <div style="background: rgba(250,204,21,0.12); border: 1px dashed #facc15; padding: 8px 14px; clip-path: ${PS1_BEVEL_4PX}; color: #fde047; font-size: 12px; margin-bottom: 18px; letter-spacing: 1px;">
            ALERTE PERFORMANCE : ${score.nearMissMessage}
          </div>`
            : ''
        }

        ${
          score.isNewBest
            ? `
          <div style="background: rgba(0,255,136,0.15); border: 1px solid #00ff88; padding: 8px 14px; clip-path: ${PS1_BEVEL_4PX}; color: #00ff88; font-size: 12px; margin-bottom: 18px; letter-spacing: 1px;">
            NOUVEAU RECORD PERSONNEL ENREGISTRE
          </div>`
            : ''
        }

        <!-- Action Button -->
        <button id="btn-restart" style="background: #00ff88; color: #050b14; border: none; padding: 12px 36px; font-size: 15px; font-weight: 900; font-family: inherit; clip-path: ${PS1_BEVEL_4PX}; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; box-shadow: 0 0 20px rgba(0,255,136,0.5); letter-spacing: 1px;">
          [R] NOUVELLE TENTATIVE
        </button>

        <div style="margin-top: 18px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 10px; letter-spacing: 1px;">
          STATUS MATERIEL : 8/8 PUCES STABILISEES // BOSS VAINCU
        </div>
      </div>
    `

    const btn = document.getElementById('btn-restart')
    btn?.addEventListener('mouseenter', () => SoundSystem.playGem())
    btn?.addEventListener('click', () => {
      SoundSystem.playSelect()
      onRestart()
    })

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        SoundSystem.playSelect()
        onRestart()
      }
    }
    window.addEventListener('keydown', this.keydownHandler)
  }

  showGameOver(score: RunScore, pucesHeated: number, onRestart: () => void): void {
    this.container.style.display = 'flex'
    this.cleanupKeyHandler()

    const rawTimeFormatted = RankSystem.formatTime(score.rawTimeSeconds)

    this.container.innerHTML = `
      <div style="text-align: center; max-width: 680px; width: 100%; padding: 28px 24px; border: 2px solid #ef4444; background: #0f131c; background-image: ${PS1_DITHER_BG}; box-shadow: 0 0 40px rgba(239, 68, 68, 0.35); clip-path: ${PS1_BEVEL_8PX}; box-sizing: border-box;">
        
        <div style="display: inline-block; font-size: 11px; letter-spacing: 3px; color: #ef4444; text-transform: uppercase; margin-bottom: 6px; background: rgba(239,68,68,0.12); padding: 4px 14px; clip-path: ${PS1_BEVEL_4PX}; border: 1px solid #ef444466;">
          [ SURCHAUFFE DU SUBSTRAT // HARDWARE FAILURE ]
        </div>

        <h1 style="color: #ef4444; font-size: 28px; letter-spacing: 2px; margin: 6px 0 4px 0; text-shadow: 0 0 16px rgba(239,68,68,0.6);">
          CRITICAL SYSTEM FAILURE
        </h1>
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 20px; letter-spacing: 1px;">
          SECURITE MATERIELLE DECLENCHEE // RUN INTERROMPUE
        </p>

        <!-- No Rank Awarded Notice Banner -->
        <div style="background: #060a12; background-image: ${PS1_DITHER_BG}; border: 1px solid #ef444466; clip-path: ${PS1_BEVEL_8PX}; padding: 18px 20px; text-align: center; margin-bottom: 20px;">
          <div style="font-size: 11px; letter-spacing: 2px; color: #ef4444; margin-bottom: 6px; text-transform: uppercase; font-weight: 700;">
            NON QUALIFIE — AUCUN RANG ATTRIBUE
          </div>
          <div style="font-size: 13px; color: #cbd5e0; line-height: 1.5;">
            Le rang officiel (D a S+) est exclusivement decerne apres avoir surchauffe les 8 puces et <strong>vaincu le Boss CyberLeek</strong>.
          </div>
        </div>

        <!-- Telemetry Stats -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
          
          <div style="background: #080d16; border: 1px solid #1e293b; clip-path: ${PS1_BEVEL_8PX}; padding: 12px 8px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase;">TEMPS SURVECU</div>
            <div style="font-size: 16px; font-family: monospace; color: #f8fafc; font-weight: 700;">${rawTimeFormatted}</div>
          </div>

          <div style="background: #080d16; border: 1px solid #1e293b; clip-path: ${PS1_BEVEL_8PX}; padding: 12px 8px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase;">NEUTRALISATIONS</div>
            <div style="font-size: 16px; font-family: monospace; color: #f8fafc; font-weight: 700;">${score.kills} KILLS</div>
          </div>

          <div style="background: #080d16; border: 1px solid #1e293b; clip-path: ${PS1_BEVEL_8PX}; padding: 12px 8px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase;">PUCES SURCHAUFFEES</div>
            <div style="font-size: 16px; font-family: monospace; color: #fbbf24; font-weight: 700;">${pucesHeated} / 8</div>
          </div>

        </div>

        <button id="btn-restart" style="background: #ef4444; color: #ffffff; border: none; padding: 12px 34px; font-size: 15px; font-weight: 900; font-family: inherit; clip-path: ${PS1_BEVEL_4PX}; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; box-shadow: 0 0 20px rgba(239,68,68,0.5); letter-spacing: 1px;">
          [R] REESSAYER LA RUN
        </button>
      </div>
    `

    const btn = document.getElementById('btn-restart')
    btn?.addEventListener('mouseenter', () => SoundSystem.playGem())
    btn?.addEventListener('click', () => {
      SoundSystem.playSelect()
      onRestart()
    })

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        SoundSystem.playSelect()
        onRestart()
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
    this.cleanupKeyHandler()
    this.container.style.display = 'none'
  }
}

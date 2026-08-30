import { RankSystem } from '../systems/RankSystem'
import type { Player } from '../entities/Player'
import type { HeatingSystem } from '../systems/HeatingSystem'
import type { Boss } from '../entities/Boss'
import type { ProgressionSystem } from '../systems/ProgressionSystem'

// UI HUD for Chrono 00:00, 3 hearts, puce counter, dash CD, Boss 35s bar

export class HUD {
  private container: HTMLDivElement

  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'game-hud'
    this.container.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0;
      pointer-events: none;
      font-family: 'Space Grotesk', monospace;
      color: #aaff00;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      z-index: 5000;
      text-shadow: 0 0 4px #000;
      image-rendering: pixelated;
    `
    document.body.appendChild(this.container)
  }

  update(player: Player, heating: HeatingSystem, boss: Boss, progression: ProgressionSystem): void {
    const hearts = '❤️ '.repeat(player.stats.hp) + '🖤 '.repeat(player.stats.maxHp - player.stats.hp)
    const timeFormatted = RankSystem.formatTime(progression.rawTime)
    const bestFormatted = RankSystem.getBestScoreFormatted()
    const dashReady = player.stats.dashTimer <= 0
    const dashText = dashReady ? '⚡ DASH PRÊT [ESPACE]' : `⏳ DASH ${(player.stats.dashTimer).toFixed(1)}s`

    let bossBarHtml = ''
    if (boss.active) {
      const bossPercent = Math.max(0, Math.min(100, ((35 - boss.timer) / 35) * 100))
      bossBarHtml = `
        <div style="margin-top: 8px; width: 320px; background: #220000; border: 1px solid #ff4400; padding: 2px;">
          <div style="font-size: 10px; color: #ffaa00; text-align: center; margin-bottom: 2px;">SURCHAUFFE CYBERLEEK: ${(35 - boss.timer).toFixed(1)}s</div>
          <div style="width: ${bossPercent}%; height: 8px; background: #ff2200; transition: width 0.1s;"></div>
        </div>
      `
    }

    const currentPuce = heating.getCurrentPuce()
    let heatingProgressHtml = ''
    if (currentPuce && !currentPuce.state.isExploded) {
      const pPercent = Math.min(100, (currentPuce.state.heatProgress / currentPuce.state.heatTarget) * 100)
      heatingProgressHtml = `
        <div style="font-size: 11px; color: ${heating.isHeating ? '#ffaa00' : '#88aa88'};">
          CANALISATION: ${pPercent.toFixed(0)}% ${heating.isHeating ? '🔥' : '❄️ (FREEZE)'}
        </div>
      `
    }

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="font-size: 18px;">${hearts}</div>
        <div style="font-size: 12px; color: ${dashReady ? '#aaff00' : '#88aa88'};">${dashText}</div>
        <div style="font-size: 13px; color: #ffffff;">PUCES GRILLÉES: <span style="color: #ffaa00;">${heating.heatedCount} / ${heating.totalPuces}</span></div>
        ${heatingProgressHtml}
      </div>

      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #ffffff;">${timeFormatted}</div>
        <div style="font-size: 10px; color: #88aa88;">RECORD: ${bestFormatted}</div>
        ${bossBarHtml}
      </div>

      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
        <div style="font-size: 12px; color: #ffffff;">KILLS: <span style="color: #aaff00;">${progression.kills}</span></div>
        <div style="font-size: 10px; color: #88aa88;">OBJECTIF RANG S: &lt; 03:45</div>
      </div>
    `
  }

  destroy(): void {
    this.container.remove()
  }
}

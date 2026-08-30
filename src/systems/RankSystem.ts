// via roguelike: RankSystem ScoreTemps = tempsBrut - kills*0.05s — via game-feel: near-miss
// S < 3:45 (225s), A < 4:30 (270s), B < 6:00 (360s), C sinon

export type Rank = 'S' | 'A' | 'B' | 'C'

export interface RunScore {
  rawTimeSeconds: number
  kills: number
  scoreTimeSeconds: number
  rank: Rank
  isNewBest: boolean
  bestTimeSeconds: number
  nearMissMessage: string | null
}

export class RankSystem {
  private static readonly STORAGE_KEY = 'polyroot_best_score'

  static computeRank(scoreTimeSeconds: number): Rank {
    if (scoreTimeSeconds < 225) return 'S' // < 3:45
    if (scoreTimeSeconds < 270) return 'A' // < 4:30
    if (scoreTimeSeconds < 360) return 'B' // < 6:00
    return 'C'
  }

  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  static evaluate(rawTimeSeconds: number, kills: number): RunScore {
    // ScoreTemps = tempsBrut - kills*0.05s
    const scoreTimeSeconds = Math.max(0, rawTimeSeconds - kills * 0.05)
    const rank = this.computeRank(scoreTimeSeconds)

    let bestTime = parseFloat(localStorage.getItem(this.STORAGE_KEY) ?? '999999')
    let isNewBest = false

    if (scoreTimeSeconds < bestTime) {
      bestTime = scoreTimeSeconds
      isNewBest = true
      try {
        localStorage.setItem(this.STORAGE_KEY, scoreTimeSeconds.toFixed(2))
      } catch {
        // storage disabled in some envs
      }
    }

    // Near-miss casino calculation (if score is just above S rank < 3:45)
    let nearMissMessage: string | null = null
    if (scoreTimeSeconds > 225 && scoreTimeSeconds <= 235) {
      const diff = Math.ceil(scoreTimeSeconds - 225)
      nearMissMessage = `à ${diff}s du S !`
    }

    return {
      rawTimeSeconds,
      kills,
      scoreTimeSeconds,
      rank,
      isNewBest,
      bestTimeSeconds: bestTime === 999999 ? scoreTimeSeconds : bestTime,
      nearMissMessage,
    }
  }

  static getBestScoreFormatted(): string {
    try {
      const best = localStorage.getItem(this.STORAGE_KEY)
      if (!best) return '--:--'
      return this.formatTime(parseFloat(best))
    } catch {
      return '--:--'
    }
  }
}

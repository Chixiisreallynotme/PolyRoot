// PolyRoot Hardcore 2-Category Rank Engine (Temps + Kills)
// Le rang officiel n'est attribué QU'EN CAS DE VICTOIRE (Boss CyberLeek vaincu).
// Barème sévère :
// 1. Temps Chrono : S (< 1:45 / 105s), A (< 2:30 / 150s), B (< 3:30 / 210s), C (< 4:45 / 285s), D (>= 4:45)
// 2. Kills : S (>= 80 kills), A (>= 55 kills), B (>= 35 kills), C (>= 20 kills), D (< 20 kills)
// 3. Grade Composite : S+ (Double S), S (S+A), A (A+A / S+B), B (B+B / A+C), C (C+C / B+D), D (D+D)

export type Rank = 'S' | 'A' | 'B' | 'C' | 'D'
export type CompositeGrade = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D'

export interface CategoryScore {
  rank: Rank
  label: string
  detail: string
  description: string
  threshold: string
}

export interface RunScore {
  rawTimeSeconds: number
  kills: number
  scoreTimeSeconds: number
  bossDefeated: boolean
  rank: CompositeGrade | null
  compositeGrade: CompositeGrade | null
  timeRank: Rank | null
  killsRank: Rank | null
  categories: {
    time: CategoryScore | null
    kills: CategoryScore | null
  }
  isNewBest: boolean
  bestTimeSeconds: number
  nearMissMessage: string | null
}

export interface EvaluateOptions {
  rawTimeSeconds: number
  kills: number
  bossDefeated: boolean
}

export class RankSystem {
  private static readonly STORAGE_KEY = 'polyroot_best_score'

  static computeTimeRank(scoreTimeSeconds: number): Rank {
    if (scoreTimeSeconds < 105) return 'S' // < 1:45
    if (scoreTimeSeconds < 150) return 'A' // < 2:30
    if (scoreTimeSeconds < 210) return 'B' // < 3:30
    if (scoreTimeSeconds < 285) return 'C' // < 4:45
    return 'D'
  }

  static computeKillsRank(kills: number): Rank {
    if (kills >= 80) return 'S' // >= 80 kills
    if (kills >= 55) return 'A' // >= 55 kills
    if (kills >= 35) return 'B' // >= 35 kills
    if (kills >= 20) return 'C' // >= 20 kills
    return 'D'
  }

  static computeCompositeGrade(timeRank: Rank, killsRank: Rank): CompositeGrade {
    // S+ ONLY for flawless Double-S overclock performance
    if (timeRank === 'S' && killsRank === 'S') {
      return 'S+'
    }

    const rankToScore = (r: Rank): number => {
      switch (r) {
        case 'S': return 4
        case 'A': return 3
        case 'B': return 2
        case 'C': return 1
        case 'D': return 0
      }
    }

    const total = rankToScore(timeRank) + rankToScore(killsRank)
    if (total >= 7) return 'S' // S+A (7)
    if (total >= 5) return 'A' // A+A (6), S+B (6), A+B (5)
    if (total >= 3) return 'B' // B+B (4), A+C (4), B+C (3), S+D (4)
    if (total >= 1) return 'C' // C+C (2), B+D (2), C+D (1)
    return 'D'                 // D+D (0)
  }

  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  static computeRank(scoreTimeSeconds: number): Rank {
    return this.computeTimeRank(scoreTimeSeconds)
  }

  static evaluate(
    rawTimeOrOptions: number | EvaluateOptions,
    killsArg = 0,
    bossDefeatedArg = false
  ): RunScore {
    let rawTimeSeconds: number
    let kills: number
    let bossDefeated: boolean

    if (typeof rawTimeOrOptions === 'object') {
      rawTimeSeconds = rawTimeOrOptions.rawTimeSeconds
      kills = rawTimeOrOptions.kills
      bossDefeated = rawTimeOrOptions.bossDefeated
    } else {
      rawTimeSeconds = rawTimeOrOptions
      kills = killsArg
      bossDefeated = bossDefeatedArg
    }

    const scoreTimeSeconds = Math.max(0, rawTimeSeconds - kills * 0.05)

    // Only award official ranks if the boss has been defeated!
    if (!bossDefeated) {
      return {
        rawTimeSeconds,
        kills,
        scoreTimeSeconds,
        bossDefeated: false,
        rank: null,
        compositeGrade: null,
        timeRank: null,
        killsRank: null,
        categories: {
          time: null,
          kills: null,
        },
        isNewBest: false,
        bestTimeSeconds: 999999,
        nearMissMessage: null,
      }
    }

    const timeRank = this.computeTimeRank(scoreTimeSeconds)
    const killsRank = this.computeKillsRank(kills)
    const compositeGrade = this.computeCompositeGrade(timeRank, killsRank)

    let bestTime = 999999
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) bestTime = parseFloat(stored)
      }
    } catch {
      // storage disabled
    }

    let isNewBest = false
    if (scoreTimeSeconds < bestTime) {
      bestTime = scoreTimeSeconds
      isNewBest = true
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.STORAGE_KEY, scoreTimeSeconds.toFixed(2))
        }
      } catch {
        // storage disabled
      }
    }

    // Strict Near-miss calculations
    let nearMissMessage: string | null = null
    if (scoreTimeSeconds > 105 && scoreTimeSeconds <= 115) {
      const diff = Math.ceil(scoreTimeSeconds - 105)
      nearMissMessage = `à ${diff}s du rang S Chrono (< 1:45) !`
    } else if (kills >= 75 && kills < 80) {
      const diff = 80 - kills
      nearMissMessage = `à ${diff} neutralisation${diff > 1 ? 's' : ''} du rang S (80 kills) !`
    }

    const timeDescription =
      timeRank === 'S'
        ? 'Cadence chirurgicale d\'overclock (< 1:45)'
        : timeRank === 'A'
        ? 'Excellente vitesse d\'exécution (< 2:30)'
        : timeRank === 'B'
        ? 'Temps de cycle standard (< 3:30)'
        : timeRank === 'C'
        ? 'Cycle prolongé (< 4:45)'
        : 'Surchauffe / Temps dépassé'

    const killsDescription =
      killsRank === 'S'
        ? 'Purge totale de la mémoire (>= 80 kills)'
        : killsRank === 'A'
        ? 'Neutralisation massive (>= 55 kills)'
        : killsRank === 'B'
        ? 'Nettoyage intermédiaire (>= 35 kills)'
        : killsRank === 'C'
        ? 'Nettoyage minimal (>= 20 kills)'
        : 'Activité ennemie résiduelle élevée (< 20 kills)'

    return {
      rawTimeSeconds,
      kills,
      scoreTimeSeconds,
      bossDefeated: true,
      rank: compositeGrade,
      compositeGrade,
      timeRank,
      killsRank,
      categories: {
        time: {
          rank: timeRank,
          label: 'TEMPS CHRONO',
          detail: this.formatTime(scoreTimeSeconds),
          description: timeDescription,
          threshold: 'S < 1:45 | A < 2:30 | B < 3:30 | C < 4:45 | D >= 4:45',
        },
        kills: {
          rank: killsRank,
          label: 'NEUTRALISATIONS',
          detail: `${kills} KILLS`,
          description: killsDescription,
          threshold: 'S >= 80 | A >= 55 | B >= 35 | C >= 20 | D < 20',
        },
      },
      isNewBest,
      bestTimeSeconds: bestTime === 999999 ? scoreTimeSeconds : bestTime,
      nearMissMessage,
    }
  }

  static getBestScoreFormatted(): string {
    try {
      if (typeof localStorage === 'undefined') return '--:--'
      const best = localStorage.getItem(this.STORAGE_KEY)
      if (!best) return '--:--'
      return this.formatTime(parseFloat(best))
    } catch {
      return '--:--'
    }
  }
}

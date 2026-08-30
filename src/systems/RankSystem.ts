// PolyRoot Severe 2-Category Rank Engine (Temps + Kills)
// Le rang officiel n'est attribué QU'EN CAS DE VICTOIRE (Boss CyberLeek vaincu).
// Barème sévère :
// 1. Temps Chrono : S (< 2:30 / 150s), A (< 3:15 / 195s), B (< 4:15 / 255s), C (< 5:30 / 330s), D (>= 5:30)
// 2. Kills : S (>= 60 kills), A (>= 45 kills), B (>= 30 kills), C (>= 15 kills), D (< 15 kills)
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
    if (scoreTimeSeconds < 150) return 'S' // < 2:30
    if (scoreTimeSeconds < 195) return 'A' // < 3:15
    if (scoreTimeSeconds < 255) return 'B' // < 4:15
    if (scoreTimeSeconds < 330) return 'C' // < 5:30
    return 'D'
  }

  static computeKillsRank(kills: number): Rank {
    if (kills >= 60) return 'S' // >= 60 kills
    if (kills >= 45) return 'A' // >= 45 kills
    if (kills >= 30) return 'B' // >= 30 kills
    if (kills >= 15) return 'C' // >= 15 kills
    return 'D'
  }

  static computeCompositeGrade(timeRank: Rank, killsRank: Rank): CompositeGrade {
    // S+ for flawless Double-S overclock performance
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
    if (scoreTimeSeconds > 150 && scoreTimeSeconds <= 160) {
      const diff = Math.ceil(scoreTimeSeconds - 150)
      nearMissMessage = `à ${diff}s du rang S Chrono (< 2:30) !`
    } else if (kills >= 56 && kills < 60) {
      const diff = 60 - kills
      nearMissMessage = `à ${diff} neutralisation${diff > 1 ? 's' : ''} du rang S (60 kills) !`
    }

    const timeDescription =
      timeRank === 'S'
        ? 'Cadence chirurgicale d\'overclock (< 2:30)'
        : timeRank === 'A'
        ? 'Excellente vitesse d\'exécution (< 3:15)'
        : timeRank === 'B'
        ? 'Temps de cycle standard (< 4:15)'
        : timeRank === 'C'
        ? 'Cycle prolongé (< 5:30)'
        : 'Surchauffe / Temps dépassé'

    const killsDescription =
      killsRank === 'S'
        ? 'Purge totale de la mémoire (>= 60 kills)'
        : killsRank === 'A'
        ? 'Neutralisation massive (>= 45 kills)'
        : killsRank === 'B'
        ? 'Nettoyage intermédiaire (>= 30 kills)'
        : killsRank === 'C'
        ? 'Nettoyage minimal (>= 15 kills)'
        : 'Activité ennemie résiduelle élevée (< 15 kills)'

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
          threshold: 'S < 2:30 | A < 3:15 | B < 4:15 | C < 5:30 | D >= 5:30',
        },
        kills: {
          rank: killsRank,
          label: 'NEUTRALISATIONS',
          detail: `${kills} KILLS`,
          description: killsDescription,
          threshold: 'S >= 60 | A >= 45 | B >= 30 | C >= 15 | D < 15',
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

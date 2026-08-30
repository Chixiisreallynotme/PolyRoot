// PolyRoot Multi-Category Rank Architecture & Hardware Grade Engine (D to S+)
// 1. Time Rank: S (< 3:15 / 195s), A (< 4:00 / 240s), B (< 5:00 / 300s), C (< 6:30 / 390s), D (>= 6:30)
// 2. Kills Rank: S (>= 45 kills), A (>= 30 kills), B (>= 18 kills), C (>= 8 kills), D (< 8 kills)
// 3. Boss Mastery: S (Defeated in Phase 3 without dying), A (Defeated), B (Boss reached Phase 2/3), C (Boss spawned), D (Defeated before boss)
// 4. Overall Composite Hardware Grade: S+, S, A, B, C, D

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
  rank: CompositeGrade
  compositeGrade: CompositeGrade
  timeRank: Rank
  killsRank: Rank
  bossRank: Rank
  categories: {
    time: CategoryScore
    kills: CategoryScore
    boss: CategoryScore
  }
  isNewBest: boolean
  bestTimeSeconds: number
  nearMissMessage: string | null
  bossDefeated: boolean
  bossReached: boolean
  phase3Reached: boolean
  diedDuringBoss: boolean
}

export interface EvaluateOptions {
  rawTimeSeconds: number
  kills: number
  bossDefeated?: boolean
  bossReached?: boolean
  diedDuringBoss?: boolean
  phase3Reached?: boolean
}

export class RankSystem {
  private static readonly STORAGE_KEY = 'polyroot_best_score'

  static computeTimeRank(scoreTimeSeconds: number): Rank {
    if (scoreTimeSeconds < 195) return 'S' // < 3:15
    if (scoreTimeSeconds < 240) return 'A' // < 4:00
    if (scoreTimeSeconds < 300) return 'B' // < 5:00
    if (scoreTimeSeconds < 390) return 'C' // < 6:30
    return 'D'
  }

  static computeKillsRank(kills: number): Rank {
    if (kills >= 45) return 'S' // >= 45 kills
    if (kills >= 30) return 'A' // >= 30 kills
    if (kills >= 18) return 'B' // >= 18 kills
    if (kills >= 8) return 'C'  // >= 8 kills
    return 'D'
  }

  static computeBossMasteryRank(
    bossDefeated: boolean,
    bossReached: boolean,
    diedDuringBoss = false,
    phase3Reached = true
  ): Rank {
    if (bossDefeated && !diedDuringBoss) return 'S' // Defeated in Phase 3 without dying
    if (bossDefeated) return 'A'                   // Defeated
    if (bossReached && phase3Reached) return 'B'   // Reached advanced boss phase
    if (bossReached) return 'C'                    // Reached boss
    return 'D'                                     // Defeated before boss
  }

  static computeCompositeGrade(timeRank: Rank, killsRank: Rank, bossRank: Rank): CompositeGrade {
    // S+ for flawless Triple-S performance across all 3 disciplines
    if (timeRank === 'S' && killsRank === 'S' && bossRank === 'S') {
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

    const total = rankToScore(timeRank) + rankToScore(killsRank) + rankToScore(bossRank)
    if (total >= 11) return 'S' // e.g. S+S+A (11), S+A+A (10)
    if (total >= 8) return 'A'  // e.g. A+A+B (8), S+B+B (8), A+A+A (9)
    if (total >= 5) return 'B'  // e.g. B+B+C (5), B+B+B (6)
    if (total >= 2) return 'C'  // e.g. C+C+D (2), C+C+C (3)
    return 'D'                  // < 2 (D+D+D, D+D+C)
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
    bossDefeatedArg = false,
    bossReachedArg = false,
    diedDuringBossArg = false,
    phase3ReachedArg = true
  ): RunScore {
    let rawTimeSeconds: number
    let kills: number
    let bossDefeated: boolean
    let bossReached: boolean
    let diedDuringBoss: boolean
    let phase3Reached: boolean

    if (typeof rawTimeOrOptions === 'object') {
      rawTimeSeconds = rawTimeOrOptions.rawTimeSeconds
      kills = rawTimeOrOptions.kills
      bossDefeated = rawTimeOrOptions.bossDefeated ?? false
      bossReached = rawTimeOrOptions.bossReached ?? false
      diedDuringBoss = rawTimeOrOptions.diedDuringBoss ?? false
      phase3Reached = rawTimeOrOptions.phase3Reached ?? true
    } else {
      rawTimeSeconds = rawTimeOrOptions
      kills = killsArg
      bossDefeated = bossDefeatedArg
      bossReached = bossReachedArg
      diedDuringBoss = diedDuringBossArg
      phase3Reached = phase3ReachedArg
    }

    const scoreTimeSeconds = Math.max(0, rawTimeSeconds - kills * 0.05)

    const timeRank = this.computeTimeRank(scoreTimeSeconds)
    const killsRank = this.computeKillsRank(kills)
    const bossRank = this.computeBossMasteryRank(bossDefeated, bossReached, diedDuringBoss, phase3Reached)
    const compositeGrade = this.computeCompositeGrade(timeRank, killsRank, bossRank)

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

    // Near-miss casino calculations
    let nearMissMessage: string | null = null
    if (scoreTimeSeconds > 195 && scoreTimeSeconds <= 205) {
      const diff = Math.ceil(scoreTimeSeconds - 195)
      nearMissMessage = `à ${diff}s du rang S Chrono (< 3:15) !`
    } else if (kills >= 42 && kills < 45) {
      const diff = 45 - kills
      nearMissMessage = `à ${diff} neutralisation${diff > 1 ? 's' : ''} du rang S (45 kills) !`
    }

    const timeDescription =
      timeRank === 'S'
        ? 'Vitesse maximale optimale (< 3:15)'
        : timeRank === 'A'
        ? 'Excellente cadence d\'overclock (< 4:00)'
        : timeRank === 'B'
        ? 'Temps de cycle standard (< 5:00)'
        : timeRank === 'C'
        ? 'Cycle prolongé (< 6:30)'
        : 'Surchauffe critique / Temps dépassé'

    const killsDescription =
      killsRank === 'S'
        ? 'Purge totale de la mémoire (>= 45 kills)'
        : killsRank === 'A'
        ? 'Neutralisation massive (>= 30 kills)'
        : killsRank === 'B'
        ? 'Nettoyage intermédiaire (>= 18 kills)'
        : killsRank === 'C'
        ? 'Nettoyage minimal (>= 8 kills)'
        : 'Activité ennemie résiduelle élevée'

    const bossDescription =
      bossRank === 'S'
        ? 'Vaincu en Phase 3 sans mourir'
        : bossRank === 'A'
        ? 'CyberLeek vaincu avec succès'
        : bossRank === 'B'
        ? 'Phases avancées du boss atteintes'
        : bossRank === 'C'
        ? 'Boss CyberLeek engagé'
        : 'Échec avant l\'engagement du boss'

    return {
      rawTimeSeconds,
      kills,
      scoreTimeSeconds,
      rank: compositeGrade,
      compositeGrade,
      timeRank,
      killsRank,
      bossRank,
      categories: {
        time: {
          rank: timeRank,
          label: 'TEMPS CHRONO',
          detail: this.formatTime(scoreTimeSeconds),
          description: timeDescription,
          threshold: 'S < 3:15 | A < 4:00 | B < 5:00 | C < 6:30 | D >= 6:30',
        },
        kills: {
          rank: killsRank,
          label: 'NEUTRALISATIONS',
          detail: `${kills} KILLS`,
          description: killsDescription,
          threshold: 'S >= 45 | A >= 30 | B >= 18 | C >= 8 | D < 8',
        },
        boss: {
          rank: bossRank,
          label: 'MAÎTRISE BOSS',
          detail: bossDefeated ? (diedDuringBoss ? 'VAINCU' : 'SANS DÉGÂTS') : bossReached ? 'ENGAGÉ' : 'NON ATTEINT',
          description: bossDescription,
          threshold: 'S: Phase 3 sans mourir | A: Vaincu | B: Phase 2/3 | C: Engagé | D: Échec',
        },
      },
      isNewBest,
      bestTimeSeconds: bestTime === 999999 ? scoreTimeSeconds : bestTime,
      nearMissMessage,
      bossDefeated,
      bossReached,
      phase3Reached,
      diedDuringBoss,
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

// PolyRoot Multi-Category Rank Architecture & Hardware Grade Engine
// 1. Time Rank: S (< 3:30 / 210s), A (< 4:15 / 255s), B (< 5:30 / 330s), C (>= 5:30)
// 2. Kills Rank: S (>= 40 kills), A (>= 25 kills), B (>= 15 kills), C (< 15 kills)
// 3. Boss Mastery: S (Defeated in Phase 3 without dying), A (Defeated), B (Boss reached), C (Defeated before boss)
// 4. Overall Composite Hardware Grade: S+, S, A, B, C

export type Rank = 'S' | 'A' | 'B' | 'C'
export type CompositeGrade = 'S+' | 'S' | 'A' | 'B' | 'C'

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
    if (scoreTimeSeconds < 210) return 'S' // < 3:30
    if (scoreTimeSeconds < 255) return 'A' // < 4:15
    if (scoreTimeSeconds < 330) return 'B' // < 5:30
    return 'C'
  }

  static computeKillsRank(kills: number): Rank {
    if (kills >= 40) return 'S' // >= 40 kills
    if (kills >= 25) return 'A' // >= 25 kills
    if (kills >= 15) return 'B' // >= 15 kills
    return 'C'
  }

  static computeBossMasteryRank(
    bossDefeated: boolean,
    bossReached: boolean,
    diedDuringBoss = false,
    _phase3Reached = true
  ): Rank {
    if (bossDefeated && !diedDuringBoss) return 'S' // Defeated in Phase 3 without dying
    if (bossDefeated) return 'A' // Defeated
    if (bossReached) return 'B' // Boss reached
    return 'C' // Defeated before boss
  }

  static computeCompositeGrade(timeRank: Rank, killsRank: Rank, bossRank: Rank): CompositeGrade {
    // S+ for flawless Triple-S overclock performance across all 3 disciplines
    if (timeRank === 'S' && killsRank === 'S' && bossRank === 'S') {
      return 'S+'
    }

    const rankToScore = (r: Rank): number => {
      switch (r) {
        case 'S': return 4
        case 'A': return 3
        case 'B': return 2
        case 'C': return 1
      }
    }

    const total = rankToScore(timeRank) + rankToScore(killsRank) + rankToScore(bossRank)
    if (total >= 10) return 'S' // e.g. S+S+A (11), S+A+A (10)
    if (total >= 7) return 'A'  // e.g. A+A+A (9), S+B+B (8), A+A+B (8), A+B+B (7)
    if (total >= 4) return 'B'  // e.g. B+B+B (6), B+B+C (5), B+C+C (4)
    return 'C'                  // C+C+C (3)
  }

  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Backward-compatible evaluate helper:
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

    // ScoreTemps = tempsBrut - kills*0.05s
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
      // storage disabled in some envs
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
        // storage disabled in some envs
      }
    }

    // Near-miss calculations
    let nearMissMessage: string | null = null
    if (scoreTimeSeconds > 210 && scoreTimeSeconds <= 220) {
      const diff = Math.ceil(scoreTimeSeconds - 210)
      nearMissMessage = `à ${diff}s du rang S Chrono (< 3:30) !`
    } else if (kills >= 37 && kills < 40) {
      const diff = 40 - kills
      nearMissMessage = `à ${diff} neutralisation${diff > 1 ? 's' : ''} du rang S (40 kills) !`
    }

    const timeDescription =
      timeRank === 'S'
        ? 'Vitesse maximale optimale'
        : timeRank === 'A'
        ? 'Excellente cadence d\'overclock'
        : timeRank === 'B'
        ? 'Temps de cycle standard'
        : 'Surchauffe / Cycle prolongé'

    const killsDescription =
      killsRank === 'S'
        ? 'Purge totale de la mémoire'
        : killsRank === 'A'
        ? 'Neutralisation massive du réseau'
        : killsRank === 'B'
        ? 'Nettoyage intermédiaire'
        : 'Nettoyage minimal des registres'

    const bossDescription =
      bossRank === 'S'
        ? 'Vaincu en Phase 3 sans mourir'
        : bossRank === 'A'
        ? 'CyberLeek vaincu avec succès'
        : bossRank === 'B'
        ? 'Boss CyberLeek atteint'
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
          threshold: 'S < 3:30 | A < 4:15 | B < 5:30',
        },
        kills: {
          rank: killsRank,
          label: 'NEUTRALISATIONS',
          detail: `${kills} KILLS`,
          description: killsDescription,
          threshold: 'S >= 40 | A >= 25 | B >= 15',
        },
        boss: {
          rank: bossRank,
          label: 'MAÎTRISE BOSS',
          detail: bossDefeated ? (diedDuringBoss ? 'VAINCU' : 'SANS DÉGÂTS') : bossReached ? 'ENGAGÉ' : 'NON ATTEINT',
          description: bossDescription,
          threshold: 'S: Phase 3 sans mourir | A: Vaincu | B: Atteint',
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


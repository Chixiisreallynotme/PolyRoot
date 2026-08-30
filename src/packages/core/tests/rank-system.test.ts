import { describe, it, expect } from 'vitest'
import { RankSystem } from '../../../systems/RankSystem'

describe('RankSystem Multi-Category Rank Architecture (D to S+)', () => {
  describe('Time Rank Thresholds', () => {
    it('computes S rank for time < 3:15 (195s)', () => {
      expect(RankSystem.computeTimeRank(194)).toBe('S')
      expect(RankSystem.computeTimeRank(150)).toBe('S')
      expect(RankSystem.computeTimeRank(0)).toBe('S')
    })

    it('computes A rank for time < 4:00 (240s) and >= 3:15', () => {
      expect(RankSystem.computeTimeRank(195)).toBe('A')
      expect(RankSystem.computeTimeRank(239)).toBe('A')
    })

    it('computes B rank for time < 5:00 (300s) and >= 4:00', () => {
      expect(RankSystem.computeTimeRank(240)).toBe('B')
      expect(RankSystem.computeTimeRank(299)).toBe('B')
    })

    it('computes C rank for time < 6:30 (390s) and >= 5:00', () => {
      expect(RankSystem.computeTimeRank(300)).toBe('C')
      expect(RankSystem.computeTimeRank(389)).toBe('C')
    })

    it('computes D rank for time >= 6:30 (390s)', () => {
      expect(RankSystem.computeTimeRank(390)).toBe('D')
      expect(RankSystem.computeTimeRank(500)).toBe('D')
    })
  })

  describe('Kills Rank Thresholds', () => {
    it('computes S rank for >= 45 kills', () => {
      expect(RankSystem.computeKillsRank(45)).toBe('S')
      expect(RankSystem.computeKillsRank(65)).toBe('S')
    })

    it('computes A rank for >= 30 kills and < 45', () => {
      expect(RankSystem.computeKillsRank(30)).toBe('A')
      expect(RankSystem.computeKillsRank(44)).toBe('A')
    })

    it('computes B rank for >= 18 kills and < 30', () => {
      expect(RankSystem.computeKillsRank(18)).toBe('B')
      expect(RankSystem.computeKillsRank(29)).toBe('B')
    })

    it('computes C rank for >= 8 kills and < 18', () => {
      expect(RankSystem.computeKillsRank(8)).toBe('C')
      expect(RankSystem.computeKillsRank(17)).toBe('C')
    })

    it('computes D rank for < 8 kills', () => {
      expect(RankSystem.computeKillsRank(7)).toBe('D')
      expect(RankSystem.computeKillsRank(0)).toBe('D')
    })
  })

  describe('Boss Mastery Rank', () => {
    it('computes S rank when boss defeated in Phase 3 without dying', () => {
      expect(RankSystem.computeBossMasteryRank(true, true, false, true)).toBe('S')
    })

    it('computes A rank when boss defeated with deaths/damage taken', () => {
      expect(RankSystem.computeBossMasteryRank(true, true, true, true)).toBe('A')
    })

    it('computes B rank when advanced phase reached but not defeated', () => {
      expect(RankSystem.computeBossMasteryRank(false, true, false, true)).toBe('B')
    })

    it('computes C rank when boss was engaged/spawned', () => {
      expect(RankSystem.computeBossMasteryRank(false, true, false, false)).toBe('C')
    })

    it('computes D rank when defeated before reaching the boss', () => {
      expect(RankSystem.computeBossMasteryRank(false, false, true, false)).toBe('D')
    })
  })

  describe('Composite Hardware Grade', () => {
    it('awards S+ for Triple-S flawless runs', () => {
      expect(RankSystem.computeCompositeGrade('S', 'S', 'S')).toBe('S+')
    })

    it('awards S for high composite performance', () => {
      expect(RankSystem.computeCompositeGrade('S', 'S', 'A')).toBe('S')
      expect(RankSystem.computeCompositeGrade('S', 'A', 'A')).toBe('A')
    })

    it('awards A for solid performance', () => {
      expect(RankSystem.computeCompositeGrade('A', 'A', 'A')).toBe('A')
      expect(RankSystem.computeCompositeGrade('S', 'B', 'B')).toBe('A')
    })

    it('awards B for standard performance', () => {
      expect(RankSystem.computeCompositeGrade('B', 'B', 'B')).toBe('B')
      expect(RankSystem.computeCompositeGrade('B', 'B', 'C')).toBe('B')
    })

    it('awards C for sub-optimal runs', () => {
      expect(RankSystem.computeCompositeGrade('C', 'C', 'C')).toBe('C')
      expect(RankSystem.computeCompositeGrade('C', 'C', 'D')).toBe('C')
    })

    it('awards D for critical failure runs', () => {
      expect(RankSystem.computeCompositeGrade('D', 'D', 'D')).toBe('D')
    })
  })

  describe('evaluate with breakdown', () => {
    it('returns full breakdown and bonus score calculations', () => {
      const score = RankSystem.evaluate({
        rawTimeSeconds: 180,
        kills: 50,
        bossDefeated: true,
        bossReached: true,
        diedDuringBoss: false,
      })

      expect(score.compositeGrade).toBe('S+')
      expect(score.timeRank).toBe('S')
      expect(score.killsRank).toBe('S')
      expect(score.bossRank).toBe('S')
      expect(score.categories.time.label).toBe('TEMPS CHRONO')
      expect(score.categories.kills.label).toBe('NEUTRALISATIONS')
      expect(score.categories.boss.label).toBe('MAÎTRISE BOSS')
    })
  })
})

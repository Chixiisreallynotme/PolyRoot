import { describe, it, expect } from 'vitest'
import { RankSystem } from '../../../systems/RankSystem'

describe('RankSystem Multi-Category Rank Architecture', () => {
  describe('Time Rank Thresholds', () => {
    it('computes S rank for time < 3:30 (210s)', () => {
      expect(RankSystem.computeTimeRank(209)).toBe('S')
      expect(RankSystem.computeTimeRank(180)).toBe('S')
      expect(RankSystem.computeTimeRank(0)).toBe('S')
    })

    it('computes A rank for time < 4:15 (255s) and >= 3:30', () => {
      expect(RankSystem.computeTimeRank(210)).toBe('A')
      expect(RankSystem.computeTimeRank(254)).toBe('A')
    })

    it('computes B rank for time < 5:30 (330s) and >= 4:15', () => {
      expect(RankSystem.computeTimeRank(255)).toBe('B')
      expect(RankSystem.computeTimeRank(329)).toBe('B')
    })

    it('computes C rank for time >= 5:30 (330s)', () => {
      expect(RankSystem.computeTimeRank(330)).toBe('C')
      expect(RankSystem.computeTimeRank(400)).toBe('C')
    })
  })

  describe('Kills Rank Thresholds', () => {
    it('computes S rank for >= 40 kills', () => {
      expect(RankSystem.computeKillsRank(40)).toBe('S')
      expect(RankSystem.computeKillsRank(65)).toBe('S')
    })

    it('computes A rank for >= 25 kills and < 40', () => {
      expect(RankSystem.computeKillsRank(25)).toBe('A')
      expect(RankSystem.computeKillsRank(39)).toBe('A')
    })

    it('computes B rank for >= 15 kills and < 25', () => {
      expect(RankSystem.computeKillsRank(15)).toBe('B')
      expect(RankSystem.computeKillsRank(24)).toBe('B')
    })

    it('computes C rank for < 15 kills', () => {
      expect(RankSystem.computeKillsRank(14)).toBe('C')
      expect(RankSystem.computeKillsRank(0)).toBe('C')
    })
  })

  describe('Boss Mastery Rank', () => {
    it('computes S rank when boss defeated in Phase 3 without dying', () => {
      expect(RankSystem.computeBossMasteryRank(true, true, false, true)).toBe('S')
    })

    it('computes A rank when boss defeated with deaths/damage taken', () => {
      expect(RankSystem.computeBossMasteryRank(true, true, true, true)).toBe('A')
    })

    it('computes B rank when boss was reached but not defeated', () => {
      expect(RankSystem.computeBossMasteryRank(false, true, true, true)).toBe('B')
    })

    it('computes C rank when defeated before reaching the boss', () => {
      expect(RankSystem.computeBossMasteryRank(false, false, true, false)).toBe('C')
    })
  })

  describe('Composite Hardware Grade', () => {
    it('awards S+ for Triple-S flawless runs', () => {
      expect(RankSystem.computeCompositeGrade('S', 'S', 'S')).toBe('S+')
    })

    it('awards S for high composite performance', () => {
      expect(RankSystem.computeCompositeGrade('S', 'S', 'A')).toBe('S')
      expect(RankSystem.computeCompositeGrade('S', 'A', 'A')).toBe('S')
    })

    it('awards A for solid performance', () => {
      expect(RankSystem.computeCompositeGrade('A', 'A', 'A')).toBe('A')
      expect(RankSystem.computeCompositeGrade('S', 'B', 'B')).toBe('A')
      expect(RankSystem.computeCompositeGrade('A', 'B', 'B')).toBe('A')
    })

    it('awards B for standard performance', () => {
      expect(RankSystem.computeCompositeGrade('B', 'B', 'B')).toBe('B')
      expect(RankSystem.computeCompositeGrade('B', 'B', 'C')).toBe('B')
      expect(RankSystem.computeCompositeGrade('A', 'C', 'C')).toBe('B')
    })

    it('awards C for sub-optimal runs', () => {
      expect(RankSystem.computeCompositeGrade('C', 'C', 'C')).toBe('C')
    })
  })

  describe('evaluate with breakdown', () => {
    it('returns full breakdown and bonus score calculations', () => {
      const score = RankSystem.evaluate({
        rawTimeSeconds: 200,
        kills: 45,
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

import { describe, it, expect } from 'vitest'
import { RankSystem } from '../../../systems/RankSystem'

describe('RankSystem Hardcore 2-Category Architecture (Temps + Kills)', () => {
  describe('Time Rank Thresholds (Hardcore)', () => {
    it('computes S rank for time < 1:45 (105s)', () => {
      expect(RankSystem.computeTimeRank(104)).toBe('S')
      expect(RankSystem.computeTimeRank(90)).toBe('S')
    })

    it('computes A rank for time < 2:30 (150s) and >= 1:45', () => {
      expect(RankSystem.computeTimeRank(105)).toBe('A')
      expect(RankSystem.computeTimeRank(149)).toBe('A')
    })

    it('computes B rank for time < 3:30 (210s) and >= 2:30', () => {
      expect(RankSystem.computeTimeRank(150)).toBe('B')
      expect(RankSystem.computeTimeRank(209)).toBe('B')
    })

    it('computes C rank for time < 4:45 (285s) and >= 3:30', () => {
      expect(RankSystem.computeTimeRank(210)).toBe('C')
      expect(RankSystem.computeTimeRank(284)).toBe('C')
    })

    it('computes D rank for time >= 4:45 (285s)', () => {
      expect(RankSystem.computeTimeRank(285)).toBe('D')
      expect(RankSystem.computeTimeRank(400)).toBe('D')
    })
  })

  describe('Kills Rank Thresholds (Hardcore)', () => {
    it('computes S rank for >= 80 kills', () => {
      expect(RankSystem.computeKillsRank(80)).toBe('S')
      expect(RankSystem.computeKillsRank(110)).toBe('S')
    })

    it('computes A rank for >= 55 kills and < 80', () => {
      expect(RankSystem.computeKillsRank(55)).toBe('A')
      expect(RankSystem.computeKillsRank(79)).toBe('A')
    })

    it('computes B rank for >= 35 kills and < 55', () => {
      expect(RankSystem.computeKillsRank(35)).toBe('B')
      expect(RankSystem.computeKillsRank(54)).toBe('B')
    })

    it('computes C rank for >= 20 kills and < 35', () => {
      expect(RankSystem.computeKillsRank(20)).toBe('C')
      expect(RankSystem.computeKillsRank(34)).toBe('C')
    })

    it('computes D rank for < 20 kills', () => {
      expect(RankSystem.computeKillsRank(19)).toBe('D')
      expect(RankSystem.computeKillsRank(0)).toBe('D')
    })
  })

  describe('Composite Hardware Grade (Double-Axis)', () => {
    it('awards S+ only for Double-S (S Temps + S Kills)', () => {
      expect(RankSystem.computeCompositeGrade('S', 'S')).toBe('S+')
    })

    it('awards S for S+A combinations', () => {
      expect(RankSystem.computeCompositeGrade('S', 'A')).toBe('S')
      expect(RankSystem.computeCompositeGrade('A', 'S')).toBe('S')
    })

    it('awards A for A+A or S+B combinations', () => {
      expect(RankSystem.computeCompositeGrade('A', 'A')).toBe('A')
      expect(RankSystem.computeCompositeGrade('S', 'B')).toBe('A')
    })

    it('awards B for B+B or A+C combinations', () => {
      expect(RankSystem.computeCompositeGrade('B', 'B')).toBe('B')
      expect(RankSystem.computeCompositeGrade('A', 'C')).toBe('B')
    })

    it('awards C for C+C or B+D combinations', () => {
      expect(RankSystem.computeCompositeGrade('C', 'C')).toBe('C')
      expect(RankSystem.computeCompositeGrade('B', 'D')).toBe('C')
    })

    it('awards D for D+D combinations', () => {
      expect(RankSystem.computeCompositeGrade('D', 'D')).toBe('D')
    })
  })

  describe('Boss Prerequisite Condition', () => {
    it('returns null ranks when boss was not defeated (Game Over)', () => {
      const score = RankSystem.evaluate({
        rawTimeSeconds: 95,
        kills: 90,
        bossDefeated: false,
      })

      expect(score.bossDefeated).toBe(false)
      expect(score.rank).toBeNull()
      expect(score.compositeGrade).toBeNull()
      expect(score.timeRank).toBeNull()
      expect(score.killsRank).toBeNull()
    })

    it('awards official ranks upon boss victory', () => {
      const score = RankSystem.evaluate({
        rawTimeSeconds: 100,
        kills: 85,
        bossDefeated: true,
      })

      expect(score.bossDefeated).toBe(true)
      expect(score.compositeGrade).toBe('S+')
      expect(score.timeRank).toBe('S')
      expect(score.killsRank).toBe('S')
      expect(score.categories.time?.label).toBe('TEMPS CHRONO')
      expect(score.categories.kills?.label).toBe('NEUTRALISATIONS')
    })
  })
})

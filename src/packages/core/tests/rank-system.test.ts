import { describe, it, expect } from 'vitest'
import { RankSystem } from '../../../systems/RankSystem'

describe('RankSystem Severe 2-Category Architecture (Temps + Kills)', () => {
  describe('Time Rank Thresholds (Severe)', () => {
    it('computes S rank for time < 2:30 (150s)', () => {
      expect(RankSystem.computeTimeRank(149)).toBe('S')
      expect(RankSystem.computeTimeRank(120)).toBe('S')
    })

    it('computes A rank for time < 3:15 (195s) and >= 2:30', () => {
      expect(RankSystem.computeTimeRank(150)).toBe('A')
      expect(RankSystem.computeTimeRank(194)).toBe('A')
    })

    it('computes B rank for time < 4:15 (255s) and >= 3:15', () => {
      expect(RankSystem.computeTimeRank(195)).toBe('B')
      expect(RankSystem.computeTimeRank(254)).toBe('B')
    })

    it('computes C rank for time < 5:30 (330s) and >= 4:15', () => {
      expect(RankSystem.computeTimeRank(255)).toBe('C')
      expect(RankSystem.computeTimeRank(329)).toBe('C')
    })

    it('computes D rank for time >= 5:30 (330s)', () => {
      expect(RankSystem.computeTimeRank(330)).toBe('D')
      expect(RankSystem.computeTimeRank(450)).toBe('D')
    })
  })

  describe('Kills Rank Thresholds (Severe)', () => {
    it('computes S rank for >= 60 kills', () => {
      expect(RankSystem.computeKillsRank(60)).toBe('S')
      expect(RankSystem.computeKillsRank(80)).toBe('S')
    })

    it('computes A rank for >= 45 kills and < 60', () => {
      expect(RankSystem.computeKillsRank(45)).toBe('A')
      expect(RankSystem.computeKillsRank(59)).toBe('A')
    })

    it('computes B rank for >= 30 kills and < 45', () => {
      expect(RankSystem.computeKillsRank(30)).toBe('B')
      expect(RankSystem.computeKillsRank(44)).toBe('B')
    })

    it('computes C rank for >= 15 kills and < 30', () => {
      expect(RankSystem.computeKillsRank(15)).toBe('C')
      expect(RankSystem.computeKillsRank(29)).toBe('C')
    })

    it('computes D rank for < 15 kills', () => {
      expect(RankSystem.computeKillsRank(14)).toBe('D')
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
        rawTimeSeconds: 120,
        kills: 75,
        bossDefeated: false,
      })

      expect(score.bossDefeated).toBe(false)
      expect(score.rank).toBeNull()
      expect(score.compositeGrade).toBeNull()
      expect(score.timeRank).toBeNull()
      expect(score.killsRank).toBeNull()
      expect(score.categories.time).toBeNull()
      expect(score.categories.kills).toBeNull()
    })

    it('awards official ranks upon boss victory', () => {
      const score = RankSystem.evaluate({
        rawTimeSeconds: 140,
        kills: 65,
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

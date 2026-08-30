import { describe, it, expect, beforeEach } from 'vitest'
import { SoundSystem, SoundSystemClass } from '../../../audio/SoundSystem'
import { PixelArt } from '../../../ui/PixelArt'
import { PS1_BEVEL_8PX, PS1_BEVEL_4PX, PS1_DITHER_BG, ALL_UPGRADES } from '../../../ui/ChoiceUI'

describe('SoundSystem 90s Cyber-Arcade Synthwave Engine', () => {
  let sound: SoundSystemClass

  beforeEach(() => {
    sound = new SoundSystemClass()
  })

  it('exports singleton instance and class', () => {
    expect(SoundSystem).toBeDefined()
    expect(sound).toBeInstanceOf(SoundSystemClass)
  })

  it('initializes with default volume settings', () => {
    expect(sound.getMusicVolume()).toBe(0.50)
    expect(sound.getSFXVolume()).toBe(0.80)
  })

  it('adjusts music volume with clamping', () => {
    sound.setMusicVolume(0.75)
    expect(sound.getMusicVolume()).toBe(0.75)
    sound.setMusicVolume(1.5)
    expect(sound.getMusicVolume()).toBe(1.0)
    sound.setMusicVolume(-0.2)
    expect(sound.getMusicVolume()).toBe(0.0)
  })

  it('adjusts SFX volume with clamping', () => {
    sound.setSFXVolume(0.65)
    expect(sound.getSFXVolume()).toBe(0.65)
    sound.setSFXVolume(2.0)
    expect(sound.getSFXVolume()).toBe(1.0)
    sound.setSFXVolume(-1.0)
    expect(sound.getSFXVolume()).toBe(0.0)
  })

  it('toggles music state without throwing in headless environments', () => {
    expect(sound.isMusicPlaying()).toBe(false)
    expect(() => sound.startMusic()).not.toThrow()
    expect(() => sound.stopMusic()).not.toThrow()
    expect(() => sound.toggleMusic()).not.toThrow()
  })

  it('executes all diegetic SFX triggers safely', () => {
    expect(() => sound.playJump()).not.toThrow()
    expect(() => sound.playDash()).not.toThrow()
    expect(() => sound.playShoot()).not.toThrow()
    expect(() => sound.playPuceBoom()).not.toThrow()
    expect(() => sound.playGem()).not.toThrow()
    expect(() => sound.playDamage()).not.toThrow()
    expect(() => sound.playSelect()).not.toThrow()
  })
})

describe('PixelArt 15-bit PS1 ChoiceUI Redesign', () => {
  it('provides large, crisp Aura Overdrive SVG with radial shockwave markers', () => {
    expect(PixelArt.auraOverdrive).toBeDefined()
    expect(PixelArt.auraOverdrive).toContain('viewBox="0 0 32 32"')
    expect(PixelArt.auraOverdrive).toContain('#00ff88')
    expect(PixelArt.lightning).toBe(PixelArt.auraOverdrive)
  })

  it('provides large, crisp Cannon Overdrive SVG with dual plasma blaster barrels', () => {
    expect(PixelArt.cannonOverdrive).toBeDefined()
    expect(PixelArt.cannonOverdrive).toContain('viewBox="0 0 32 32"')
    expect(PixelArt.cannonOverdrive).toContain('#00ffff')
    expect(PixelArt.cannon).toBe(PixelArt.cannonOverdrive)
  })

  it('provides large, crisp Cyber Mobility SVG with winged combat boots and speed streaks', () => {
    expect(PixelArt.cyberMobility).toBeDefined()
    expect(PixelArt.cyberMobility).toContain('viewBox="0 0 32 32"')
    expect(PixelArt.cyberMobility).toContain('#ffaa00')
    expect(PixelArt.speed).toBe(PixelArt.cyberMobility)
  })

  it('provides audio toggle icons and retro health hearts', () => {
    expect(PixelArt.musicOn).toContain('#00ff88')
    expect(PixelArt.musicOff).toContain('#ef4444')
    expect(PixelArt.heartFull).toContain('#ff1a40')
    expect(PixelArt.heartEmpty).toContain('#1e2430')
  })
})

describe('PS1 Stepped Bresenham Bevels & ChoiceUI Cards', () => {
  it('defines 8px and 4px Bresenham polygon clip-paths', () => {
    expect(PS1_BEVEL_8PX).toContain('8px 0px')
    expect(PS1_BEVEL_8PX).toContain('calc(100% - 8px)')
    expect(PS1_BEVEL_4PX).toContain('4px 0px')
    expect(PS1_DITHER_BG).toContain('repeating-conic-gradient')
  })

  it('maps all upgrade choices to high-definition pixel art and correct titles', () => {
    expect(ALL_UPGRADES).toHaveLength(3)
    const c1 = ALL_UPGRADES[0]!
    const c2 = ALL_UPGRADES[1]!
    const c3 = ALL_UPGRADES[2]!
    expect(c1.title).toBe('AURA OVERDRIVE')
    expect(c1.iconSvg).toBe(PixelArt.auraOverdrive)
    expect(c2.title).toBe('CANNON OVERDRIVE')
    expect(c2.iconSvg).toBe(PixelArt.cannonOverdrive)
    expect(c3.title).toBe('CYBER MOBILITY')
    expect(c3.iconSvg).toBe(PixelArt.cyberMobility)
  })
})

describe('HUD 16-Segment Pixel-Stepped Heating Bar & Color Tiers', () => {
  it('computes exact discrete color brackets for all 16 segments', async () => {
    const { getHeatingSegmentColor } = await import('../../../ui/HUD')
    // 0-40%: Green (#00ff88) (segments 0..5)
    for (let i = 0; i <= 5; i++) {
      const res = getHeatingSegmentColor(i)
      expect(res.color).toBe('#00ff88')
      expect(res.isBlinking).toBe(false)
    }

    // 40-70%: Yellow (#facc15) (segments 6..10)
    for (let i = 6; i <= 10; i++) {
      const res = getHeatingSegmentColor(i)
      expect(res.color).toBe('#facc15')
      expect(res.isBlinking).toBe(false)
    }

    // 70-90%: Orange (#f97316) (segments 11..13)
    for (let i = 11; i <= 13; i++) {
      const res = getHeatingSegmentColor(i)
      expect(res.color).toBe('#f97316')
      expect(res.isBlinking).toBe(false)
    }

    // 90-100%: Blinking Flashing Crimson Red (#ef4444) (segments 14..15)
    for (let i = 14; i <= 15; i++) {
      const res = getHeatingSegmentColor(i)
      expect(res.color).toBe('#ef4444')
      expect(res.isBlinking).toBe(true)
    }
  })
})

describe('ChoiceUI Overclock Refusal & Skip Hard-Mode Challenge', () => {
  it('renders modal with updated instructions text and 4th skip option button', async () => {
    const { ChoiceUI } = await import('../../../ui/ChoiceUI')
    const ui = new ChoiceUI()
    let chosen: any = 'not-called'

    ui.show((choice) => {
      chosen = choice
    })

    const el = document.getElementById('choice-ui')
    expect(el).toBeDefined()
    expect(el?.textContent).toContain('[1], [2], [3] OU [4] PASSER')
    expect(el?.textContent).toContain("[4] PASSER L'OVERCLOCK (CHALLENGE ROOT +15% VITESSE CHAUFFE)")
    expect(el?.textContent).toContain('[4] OU [ECHAP]')

    // Clicking skip button passes null
    const skipBtn = document.getElementById('choice-skip-button')
    expect(skipBtn).toBeDefined()
    skipBtn?.click()
    expect(chosen).toBeNull()
  })

  it('triggers skip via keyboard [4] or [Escape]', async () => {
    const { ChoiceUI } = await import('../../../ui/ChoiceUI')
    const ui = new ChoiceUI()
    let chosen: any = 'not-called'

    ui.show((choice) => {
      chosen = choice
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(chosen).toBeNull()
  })
})


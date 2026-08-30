// 12 breaks du 4ème mur déterministes ≤400ms log [4th-wall]
// A1-A3 (Render), B1-B3 (Juice), C1-C2 (Electron), D1-D2 (Archi), E1-E2 (Méta)

export class FourthWall {
  private static juryTriggered = false
  private static firstPuceTriggered = false
  private static cyberLeekTriggered = false

  // A1: Root brise regard 1ère puce
  static triggerA1LookAt(): void {
    if (this.firstPuceTriggered) return
    this.firstPuceTriggered = true
    console.log('[4th-wall] lookAt — Tu crois que c\'est juste une carte mère ?')
  }

  // A2: Binary HELP ME face
  static triggerA2Binary(): void {
    console.log('[4th-wall] helpme-binary — 01001000 01000101 01001100 01010000 00100000 01001101 01000101')
  }

  // A3: Glitch PS1 1 frame
  static triggerA3Glitch(): void {
    console.log('[4th-wall] glitch — // HeatingSystem.ts:42 freeze=true // SpatialGrid 8x8 277k→68 checks')
  }

  // B1: Near-miss commentaire
  static triggerB1NearMiss(secondsFromS: number): void {
    console.log(`[4th-wall] near-miss — Encore raté ? T'étais à ${secondsFromS}s du S !`)
  }

  // B2: CyberLeek DevTools console log
  static triggerB2CyberLeek(timeFormatted: string): void {
    if (this.cyberLeekTriggered) return
    this.cyberLeekTriggered = true
    console.log(
      '%c🧅 CYBERLEEK: Tu crois t\'échapper ? J\'ai leak ton temps : ' + timeFormatted + ' — reviens grinder, noob.',
      'color:#aaff00;background:#1a1a1a;padding:4px;font-weight:bold;'
    )
    console.log('[4th-wall] cyberleek — CyberLeek console log dispatched')
  }

  // B3: CPU IRL stats
  static triggerB3CpuIrl(particles = 200, drawCalls = 3, fps = 60): void {
    console.log(`[4th-wall] cpu-irl — Tu as chauffé ton CPU IRL — ${particles} particules | ${drawCalls} draw calls | ${fps} FPS`)
  }

  // C1: OS Window title
  static triggerC1WindowTitle(): void {
    console.log('[4th-wall:electron] window-title — Tu es coincé aussi ?')
  }

  // C2: OS Escape attempt main logs
  static triggerC2EscapeAttempt(pid = 0): void {
    console.log(`[4th-wall:electron] escape-attempt — PolyRoot a essayé de s'échapper de ton OS — PID ${pid}`)
  }

  // D1: Debug comment
  static triggerD1DebugComment(): void {
    console.log('[4th-wall:archi] debug-comment — Si tu lis ça, tu es le debuggeur de Root')
  }

  // D2: README reader
  static triggerD2ReadmeReader(): void {
    console.log('[4th-wall:archi] readme-reader — Root: merci d\'avoir lu le README... Score +0.05s offert')
  }

  // E1: Jury hackathon
  static triggerE1JuryWatch(): void {
    if (this.juryTriggered) return
    this.juryTriggered = true
    console.log('[4th-wall] jury-watch — Chut. Le jury hackathon nous regarde. Montre-leur le fun en 10 secondes.')
  }

  // E2: Beat grands studios
  static triggerE2BeatStudios(timeStr: string, rank: string): void {
    console.log(`[4th-wall] beat-studios — Tu as battu les grands studios. 8 puces en ${timeStr} — Rang ${rank}`)
  }
}

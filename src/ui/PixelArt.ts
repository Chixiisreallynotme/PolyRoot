// PixelArt SVG Assets for PolyRoot (Zero emojis)
// Crisp pixel-perfect vector sprites with 15-bit PS1 palette

export const PixelArt = {
  // 1. Aura Overdrive: Glowing pulsing neon energy shield ring with radial shockwaves
  auraOverdrive: `
    <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; filter: drop-shadow(0 0 10px rgba(0,255,136,0.7));">
      <!-- Radial Shockwave Spikes (8 Directions) -->
      <path d="M15 0H17V4H15V0ZM15 28H17V32H15V28ZM0 15H4V17H0V15ZM28 15H32V17H28V15Z" fill="#00ff88"/>
      <path d="M3 3H5V5H3V3ZM27 3H29V5H27V3ZM3 27H5V29H3V27ZM27 27H29V29H27V27Z" fill="#55ffaa"/>
      <path d="M5 5H7V7H5V5ZM25 5H27V7H25V5ZM5 25H7V27H5V25ZM25 25H27V27H25V25Z" fill="#00ff88"/>
      
      <!-- Outer Shield Energy Ring -->
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10 3H22V5H25V7H27V10H29V22H27V25H25V27H22V29H10V27H7V25H5V22H3V10H5V7H7V5H10V3ZM11 5H21V7H24V10H26V11H27V21H26V22H24V25H21V27H11V25H8V22H6V21H5V11H6V10H8V7H11V5Z" fill="#00ff88"/>
      
      <!-- Inner Shield Ring & Sub-Bevel -->
      <path d="M11 6H21V8H24V11H26V21H24V24H21V26H11V24H8V21H6V11H8V8H11V6Z" fill="#052e16" fill-opacity="0.75"/>
      <path d="M12 8H20V10H22V12H24V20H22V22H20V24H12V22H10V20H8V12H10V10H12V8Z" fill="#00aa55" fill-opacity="0.5"/>
      
      <!-- 4 Orbital Focus Nodes (N, S, E, W) -->
      <rect x="14" y="4" width="4" height="2" fill="#ffffff"/>
      <rect x="14" y="26" width="4" height="2" fill="#ffffff"/>
      <rect x="4" y="14" width="2" height="4" fill="#ffffff"/>
      <rect x="26" y="14" width="2" height="4" fill="#ffffff"/>
      
      <!-- Central Energy Flux Core & Lightning Arcs -->
      <path d="M14 11H18V13H20V15H21V17H20V19H18V21H14V19H12V17H11V15H12V13H14V11Z" fill="#00ff88"/>
      <path d="M13 13H19V15H20V17H19V19H13V17H12V15H13V13Z" fill="#a7f3d0"/>
      <rect x="14" y="14" width="4" height="4" fill="#ffffff"/>
      <rect x="15" y="15" width="2" height="2" fill="#ffffff"/>
      
      <!-- Lightning Arc Spikes -->
      <path d="M15 9H17V11H15V9ZM15 21H17V23H15V21ZM9 15H11V17H9V15ZM21 15H23V17H21V15Z" fill="#ffffff"/>
    </svg>
  `,

  // 2. Cannon Overdrive: High-tech dual-barrel plasma blaster with glowing cyan muzzle flares
  cannonOverdrive: `
    <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; filter: drop-shadow(0 0 10px rgba(0,255,255,0.7));">
      <!-- Muzzle Blast Energy Flares (Dual Barrels) -->
      <!-- Top Barrel Muzzle Flare -->
      <path d="M25 8H31V10H25V8Z" fill="#00ffff"/>
      <path d="M27 6H30V12H27V6Z" fill="#38bdf8"/>
      <rect x="26" y="8" width="4" height="2" fill="#ffffff"/>
      <path d="M30 5H32V7H30V5ZM30 11H32V13H30V11Z" fill="#00ffff"/>
      
      <!-- Bottom Barrel Muzzle Flare -->
      <path d="M25 20H31V22H25V20Z" fill="#00ffff"/>
      <path d="M27 18H30V24H27V18Z" fill="#38bdf8"/>
      <rect x="26" y="20" width="4" height="2" fill="#ffffff"/>
      <path d="M30 17H32V19H30V17ZM30 23H32V25H30V23Z" fill="#00ffff"/>
      
      <!-- Dual Steel Barrels (Top & Bottom) -->
      <rect x="12" y="7" width="13" height="4" fill="#1e293b"/>
      <rect x="12" y="19" width="13" height="4" fill="#1e293b"/>
      <rect x="14" y="8" width="10" height="2" fill="#38bdf8"/>
      <rect x="14" y="20" width="10" height="2" fill="#38bdf8"/>
      <rect x="23" y="6" width="2" height="6" fill="#64748b"/>
      <rect x="23" y="18" width="2" height="6" fill="#64748b"/>
      
      <!-- Energized Magnetic Accelerator Rings / Plasma Coils -->
      <rect x="15" y="6" width="2" height="6" fill="#00ffff"/>
      <rect x="19" y="6" width="2" height="6" fill="#00ffff"/>
      <rect x="15" y="18" width="2" height="6" fill="#00ffff"/>
      <rect x="19" y="18" width="2" height="6" fill="#00ffff"/>
      
      <!-- Heavy Receiver Chassis & Plasma Core Housing -->
      <path d="M2 11H12V19H2V11Z" fill="#0f172a"/>
      <path d="M4 9H12V21H4V19H2V11H4V9Z" fill="#1e293b"/>
      <rect x="5" y="12" width="6" height="6" fill="#0284c7"/>
      <rect x="6" y="13" width="4" height="4" fill="#00ffff"/>
      <rect x="7" y="14" width="2" height="2" fill="#ffffff"/>
      
      <!-- Top Cooling Heatsink Fins -->
      <path d="M6 7H11V9H6V7ZM7 5H10V7H7V5Z" fill="#475569"/>
      <!-- Bottom Ammo Magazine / Power Cell -->
      <path d="M5 21H10V26H7V24H5V21Z" fill="#334155"/>
      <rect x="6" y="22" width="3" height="2" fill="#00ffff"/>
    </svg>
  `,

  // 3. Cyber Mobility: Winged cyber combat boots with speed motion streaks
  cyberMobility: `
    <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; filter: drop-shadow(0 0 10px rgba(255,170,0,0.7));">
      <!-- Speed Motion Streaks (Trailing Behind Boot) -->
      <path d="M0 10H6V11H0V10ZM1 13H8V14H1V13ZM0 19H5V20H0V19ZM2 22H9V23H2V22ZM0 25H7V26H0V25Z" fill="#ffaa00" fill-opacity="0.85"/>
      <path d="M4 11H9V12H4V11ZM3 16H10V17H3V16ZM4 20H10V21H4V20ZM3 24H9V25H3V24Z" fill="#ffe066"/>
      
      <!-- Swept-Back Cyber Aerodynamic Wings -->
      <path d="M6 7H14V9H18V11H14V13H10V11H6V7Z" fill="#ffaa00"/>
      <path d="M8 8H13V9H17V10H13V12H9V10H8V8Z" fill="#fde047"/>
      <rect x="10" y="8" width="5" height="1" fill="#ffffff"/>
      <path d="M4 4H10V6H14V8H10V6H4V4Z" fill="#d97706"/>
      <rect x="5" y="5" width="4" height="1" fill="#fde047"/>
      
      <!-- Armored Cyber Combat Boot Chassis -->
      <!-- Shin Guard / Boot Leg -->
      <path d="M12 11H18V18H15V20H12V11Z" fill="#1e293b"/>
      <rect x="14" y="12" width="3" height="5" fill="#334155"/>
      <rect x="15" y="13" width="1" height="3" fill="#ffaa00"/>
      
      <!-- Heel & Rocket Thruster Nozzle -->
      <path d="M10 18H14V23H9V20H10V18Z" fill="#0f172a"/>
      <rect x="8" y="19" width="3" height="3" fill="#d97706"/>
      
      <!-- Thruster Fiery Plasma Afterburner Flame -->
      <path d="M4 19H8V22H4V19Z" fill="#ff3b00"/>
      <path d="M2 20H5V21H2V20Z" fill="#ffe066"/>
      <rect x="4" y="20" width="2" height="1" fill="#ffffff"/>
      
      <!-- Reinforced Foot & Articulated Toe Box -->
      <path d="M14 18H23V21H26V25H25V26H11V23H14V18Z" fill="#1e293b"/>
      <path d="M15 19H22V21H25V24H12V23H15V19Z" fill="#475569"/>
      <path d="M18 20H22V21H24V23H18V20Z" fill="#ffaa00"/>
      <rect x="19" y="21" width="3" height="1" fill="#ffffff"/>
      
      <!-- Power Sole & Grip Cleats -->
      <path d="M10 25H26V27H24V28H22V27H18V28H16V27H12V28H10V25Z" fill="#0f172a"/>
      <rect x="12" y="26" width="12" height="1" fill="#ffaa00"/>
    </svg>
  `,

  // Aliases for full backward compatibility across all modules
  get lightning(): string {
    return this.auraOverdrive
  },
  get cannon(): string {
    return this.cannonOverdrive
  },
  get speed(): string {
    return this.cyberMobility
  },
  get boss(): string {
    return this.leekLogo
  },

  // Full Red Pixel Heart (Health)
  heartFull: `
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; filter: drop-shadow(0 0 6px #ff2244);">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M2 3H5V5H7V7H9V5H11V3H14V7H13V9H11V11H9V13H7V11H5V9H3V7H2V3Z" fill="#ff1a40"/>
      <path d="M3 4H5V5H3V4ZM11 4H13V5H11V4Z" fill="#ff8099"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M1 2H5V3H2V7H1V2ZM11 2H15V7H14V3H11V2ZM1 7H2V9H3V11H5V13H7V15H9V13H11V11H13V9H14V7H15V8H14V10H12V12H10V14H6V12H4V10H2V8H1V7Z" fill="#7a0018"/>
    </svg>
  `,

  // Empty Dark Pixel Heart
  heartEmpty: `
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; opacity: 0.35;">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M2 3H5V5H7V7H9V5H11V3H14V7H13V9H11V11H9V13H7V11H5V9H3V7H2V3Z" fill="#1e2430"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M1 2H5V3H2V7H1V2ZM11 2H15V7H14V3H11V2ZM1 7H2V9H3V11H5V13H7V15H9V13H11V11H13V9H14V7H15V8H14V10H12V12H10V14H6V12H4V10H2V8H1V7Z" fill="#0b0e14"/>
    </svg>
  `,

  // Pixel Skull / Kills Icon
  skull: `
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; vertical-align: middle;">
      <path d="M4 2H12V4H14V10H12V13H10V15H6V13H4V10H2V4H4V2Z" fill="#cbd5e0"/>
      <rect x="4" y="6" width="3" height="3" fill="#1a202c"/>
      <rect x="9" y="6" width="3" height="3" fill="#1a202c"/>
      <rect x="7" y="10" width="2" height="2" fill="#1a202c"/>
    </svg>
  `,

  // Pixel Microchip Icon
  chip: `
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; vertical-align: middle;">
      <rect x="3" y="3" width="10" height="10" fill="#1e293b"/>
      <rect x="5" y="5" width="6" height="6" fill="#3b82f6"/>
      <path d="M5 1V3M8 1V3M11 1V3M5 13V15M8 13V15M11 13V15M1 5H3M1 8H3M1 11H3M13 5H15M13 8H15M13 11H15" stroke="#94a3b8" stroke-width="1.5"/>
    </svg>
  `,

  // Pixel Cyber Leek Logo
  leekLogo: `
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated;">
      <path d="M6 15H10V10H12V6H14V1H11V4H9V2H7V4H5V1H2V6H4V10H6V15Z" fill="#48bb78"/>
      <path d="M6 10H10V15H6V10Z" fill="#edf2f7"/>
      <path d="M5 7H11V10H5V7Z" fill="#171923"/>
      <rect x="6" y="8" width="1" height="1" fill="#ffe066"/>
      <rect x="9" y="8" width="1" height="1" fill="#ffe066"/>
    </svg>
  `,

  // Pixel Audio Note / Speaker Icons for BGM Toggle
  musicOn: `
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; vertical-align: middle;">
      <path d="M1 5H4L8 1V15L4 11H1V5Z" fill="#00ff88"/>
      <path d="M10 5H12V11H10V5ZM13 2H15V14H13V2Z" fill="#55ffaa"/>
    </svg>
  `,
  musicOff: `
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; vertical-align: middle; opacity: 0.6;">
      <path d="M1 5H4L8 1V15L4 11H1V5Z" fill="#94a3b8"/>
      <path d="M11 5L15 11M15 5L11 11" stroke="#ef4444" stroke-width="1.5"/>
    </svg>
  `
}


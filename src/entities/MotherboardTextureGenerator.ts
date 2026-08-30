import * as THREE from 'three'

// Procedural Texture Generator for PS1 PU-8 Motherboard & Molded Gray ABS Console Chassis Interior

export class MotherboardTextureGenerator {
  /**
   * Generates the authentic PlayStation 1 PU-8 PCB Green Substrate (2048x1536, 4:3)
   * complete with FR-4 soldermask weave, gold grounding pour, high-speed GPU/CPU/VRAM bus lines,
   * via arrays, component solder pads, and crisp white silkscreen annotations.
   */
  static createPcbTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1536
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // 1. Base FR-4 Deep Green Solder Mask (#124f2b / #0d381e)
    ctx.fillStyle = '#124f2b'
    ctx.fillRect(0, 0, 2048, 1536)

    // Subtle fiberglass cross-weave pattern
    ctx.strokeStyle = 'rgba(16, 75, 41, 0.45)'
    ctx.lineWidth = 1
    for (let x = 0; x < 2048; x += 8) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 1536)
      ctx.stroke()
    }
    for (let y = 0; y < 1536; y += 8) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(2048, y)
      ctx.stroke()
    }

    // 2. Copper Ground Plane Pours & Hatching Zones
    ctx.fillStyle = '#175e34'
    // GPU Ground plane zone
    ctx.fillRect(1000, 650, 420, 360)
    // CPU Ground plane zone
    ctx.fillRect(1350, 720, 420, 420)
    // SPU & Audio analog ground island
    ctx.fillRect(600, 240, 480, 440)
    // Power regulation plane
    ctx.fillRect(80, 950, 320, 500)

    // Cross-hatch copper ground shading
    ctx.strokeStyle = 'rgba(23, 102, 56, 0.6)'
    ctx.lineWidth = 1.5
    for (let d = 0; d < 3584; d += 24) {
      ctx.beginPath()
      ctx.moveTo(d, 0)
      ctx.lineTo(d - 1536, 1536)
      ctx.stroke()
    }

    // 3. Gold Perimeter Grounding Guard Ring & Corner Pads
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 14
    ctx.strokeRect(20, 20, 2008, 1496)

    ctx.strokeStyle = '#eab308'
    ctx.lineWidth = 4
    ctx.strokeRect(28, 28, 1992, 1480)

    // 4. Standoff Gold Grounding Rings with 8 Radial Thermal Relief Spokes
    const standoffCoords = [
      { x: 1.6, z: 1.6 },
      { x: 46.4, z: 1.6 },
      { x: 1.6, z: 34.4 },
      { x: 46.4, z: 34.4 },
      { x: 24, z: 1.4 },
      { x: 24, z: 34.6 },
      { x: 1.4, z: 18 },
      { x: 46.6, z: 18 },
    ]

    for (const so of standoffCoords) {
      const cx = (so.x / 48) * 2048
      const cy = (so.z / 36) * 1536

      ctx.fillStyle = '#d4af37'
      ctx.beginPath()
      ctx.arc(cx, cy, 32, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.arc(cx, cy, 18, 0, Math.PI * 2)
      ctx.fill()

      // 8 Spokes
      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 3
      for (let a = 0; a < 8; a++) {
        const rad = (a * Math.PI) / 4
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(rad) * 18, cy + Math.sin(rad) * 18)
        ctx.lineTo(cx + Math.cos(rad) * 32, cy + Math.sin(rad) * 32)
        ctx.stroke()
      }
    }

    // 5. Crisp Gold & Copper Circuit Trace Buses
    const drawTraceBus = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      lines: number,
      pitch: number,
      color = '#d4af37',
      width = 2
    ) => {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      for (let i = 0; i < lines; i++) {
        const offset = (i - (lines - 1) / 2) * pitch
        ctx.beginPath()
        ctx.moveTo(startX + offset, startY)
        const midY = (startY + endY) / 2
        ctx.lineTo(startX + offset, midY)
        ctx.lineTo(endX + offset, midY)
        ctx.lineTo(endX + offset, endY)
        ctx.stroke()
      }
    }

    // (A) GPU <-> CPU 32-bit High Speed Bus
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 2.5
    for (let i = 0; i < 16; i++) {
      const yOff = (i - 7.5) * 10
      ctx.beginPath()
      ctx.moveTo(1320, 810 + yOff)
      ctx.lineTo(1370, 810 + yOff)
      ctx.lineTo(1410, 870 + yOff)
      ctx.lineTo(1440, 870 + yOff)
      ctx.stroke()
    }

    // (B) GPU <-> VRAM1 & VRAM2 32-bit High-Speed Dual-Port Memory Traces
    for (let i = 0; i < 12; i++) {
      const xOff = (i - 5.5) * 12
      // VRAM1
      ctx.beginPath()
      ctx.moveTo(1070, 780 + xOff * 0.4)
      ctx.lineTo(1020, 734 + xOff)
      ctx.lineTo(960, 734 + xOff)
      ctx.stroke()
      // VRAM2
      ctx.beginPath()
      ctx.moveTo(1070, 840 + xOff * 0.4)
      ctx.lineTo(1020, 905 + xOff)
      ctx.lineTo(960, 905 + xOff)
      ctx.stroke()
    }

    // (C) GPU <-> X101 NTSC Master Clock (53.69MHz) Differential Pair
    ctx.strokeStyle = '#eab308'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(1250, 930)
    ctx.lineTo(1290, 980)
    ctx.lineTo(1330, 1070)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(1260, 930)
    ctx.lineTo(1300, 980)
    ctx.lineTo(1340, 1070)
    ctx.stroke()

    // (D) GPU <-> Video D/A Converter & Rear I/O RGB Video Traces
    drawTraceBus(1195, 680, 1024, 80, 8, 8, '#d4af37', 2)

    // (E) CPU <-> Main RAM 1-4 Memory Bus (KM4216V256G)
    drawTraceBus(1536, 980, 1536, 1160, 16, 12, '#d4af37', 2)

    // (F) CPU <-> BIOS ROM IC102 Address & Data Bus
    drawTraceBus(1536, 810, 1536, 510, 16, 10, '#d4af37', 2)

    // (G) SPU CXD2922Q <-> AK4309AVM Audio DAC & Crystal X102
    drawTraceBus(930, 430, 750, 310, 6, 8, '#f59e0b', 2)
    drawTraceBus(680, 430, 580, 280, 4, 8, '#f59e0b', 2)

    // (H) Power Rails from CN601 (+3.5V, +5V, +8V, GND)
    ctx.strokeStyle = '#b45309'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(200, 1210)
    ctx.lineTo(600, 1210)
    ctx.lineTo(1100, 1050)
    ctx.lineTo(1500, 1050)
    ctx.stroke()

    // 6. Component Footprint Solder Pad Arrays
    // (A) CXD8514Q GPU QFP-160 Footprint (4 rows of 40 gold pads)
    const drawQfpPads = (centerX: number, centerY: number, size: number, countPerSide: number) => {
      ctx.fillStyle = '#d4af37'
      const half = size / 2
      const step = (size - 16) / (countPerSide - 1)
      const start = -half + 8

      for (let i = 0; i < countPerSide; i++) {
        const p = start + i * step
        // Top & Bottom rows
        ctx.fillRect(centerX + p - 1.5, centerY - half - 12, 3, 10)
        ctx.fillRect(centerX + p - 1.5, centerY + half + 2, 3, 10)
        // Left & Right columns
        ctx.fillRect(centerX - half - 12, centerY + p - 1.5, 10, 3)
        ctx.fillRect(centerX + half + 2, centerY + p - 1.5, 10, 3)
      }
    }

    drawQfpPads(1195, 811, 248, 40) // GPU QFP-160
    drawQfpPads(1536, 896, 276, 52) // CPU QFP-208

    // (B) TSOP-28 Pads for VRAM & RAM
    const drawTsopPads = (cx: number, cy: number, w: number, h: number, count: number) => {
      ctx.fillStyle = '#d4af37'
      const step = (w - 12) / (count - 1)
      for (let i = 0; i < count; i++) {
        const px = cx - w / 2 + 6 + i * step
        ctx.fillRect(px - 1.5, cy - h / 2 - 8, 3, 7)
        ctx.fillRect(px - 1.5, cy + h / 2 + 1, 3, 7)
      }
    }

    drawTsopPads(960, 734, 180, 100, 14) // VRAM1
    drawTsopPads(960, 905, 180, 100, 14) // VRAM2
    drawTsopPads(1429, 1160, 150, 90, 14) // RAM1
    drawTsopPads(1643, 1160, 150, 90, 14) // RAM2
    drawTsopPads(1429, 1331, 150, 90, 14) // RAM3
    drawTsopPads(1643, 1331, 150, 90, 14) // RAM4

    // (C) DIP-32 Through-hole Solder Rings for BIOS ROM
    const drawDipPads = (cx: number, cy: number, len: number, dist: number, count: number) => {
      const step = (len - 16) / (count - 1)
      for (let i = 0; i < count; i++) {
        const px = cx - len / 2 + 8 + i * step
        // North & South pins
        for (const py of [cy - dist / 2, cy + dist / 2]) {
          ctx.fillStyle = '#d4af37'
          ctx.beginPath()
          ctx.arc(px, py, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#0f172a'
          ctx.beginPath()
          ctx.arc(px, py, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    drawDipPads(1536, 478, 230, 100, 16)

    // 7. Gold Via Array (Miniature vias across grounding planes)
    ctx.fillStyle = '#d4af37'
    for (let x = 120; x < 1920; x += 64) {
      for (let y = 120; y < 1420; y += 64) {
        ctx.beginPath()
        ctx.arc(x + ((y % 128 === 0) ? 32 : 0), y, 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.fillStyle = '#0a2215'
    for (let x = 120; x < 1920; x += 64) {
      for (let y = 120; y < 1420; y += 64) {
        ctx.beginPath()
        ctx.arc(x + ((y % 128 === 0) ? 32 : 0), y, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 8. Crisp Silkscreen Markings & Typography
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px monospace'
    ctx.fillText('PU-8', 110, 600)
    ctx.font = 'bold 22px monospace'
    ctx.fillText('1-658-467-11', 110, 635)
    ctx.fillText('SOLI COMPUTER ENTERTAINMENT INC.', 110, 665)
    ctx.fillText('MADE IN JAPAN   REV. C', 110, 695)

    // Chip Outlines and Labels
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2

    // GPU Silkscreen Box
    ctx.strokeRect(1060, 676, 270, 270)
    ctx.font = 'bold 18px monospace'
    ctx.fillText('IC201 (GPU)', 1070, 700)
    ctx.fillText('CXD8514Q', 1070, 720)

    // CPU Silkscreen Box
    ctx.strokeRect(1385, 745, 302, 302)
    ctx.fillText('IC101 (CPU)', 1395, 770)
    ctx.fillText('CXD8530BQ', 1395, 790)

    // VRAM Boxes
    ctx.strokeRect(860, 674, 200, 120)
    ctx.fillText('IC202 (VRAM-1)', 870, 696)
    ctx.strokeRect(860, 845, 200, 120)
    ctx.fillText('IC203 (VRAM-2)', 870, 867)

    // BIOS Box
    ctx.strokeRect(1410, 420, 252, 116)
    ctx.fillText('IC102 (BIOS ROM)', 1420, 442)

    // SPU & Mechacon Boxes
    ctx.strokeRect(825, 405, 210, 214)
    ctx.fillText('IC301 (SPU)', 835, 428)
    ctx.strokeRect(578, 405, 210, 214)
    ctx.fillText('IC701 (MECHACON)', 588, 428)
    ctx.strokeRect(330, 490, 154, 264)
    ctx.fillText('IC702 (DSP)', 340, 514)

    // DAC & Oscillators
    ctx.strokeRect(695, 268, 104, 78)
    ctx.fillText('IC302', 705, 290)
    ctx.strokeRect(1284, 1058, 120, 60)
    ctx.fillText('X101 (53.69MHz)', 1290, 1080)
    ctx.strokeRect(520, 247, 120, 60)
    ctx.fillText('X102 (67.73MHz)', 526, 269)

    // Safety Warning Banner
    ctx.strokeRect(850, 1380, 600, 48)
    ctx.font = 'bold 16px monospace'
    ctx.fillText('CAUTION: HIGH VOLTAGE / SERVICE BY QUALIFIED PERSONNEL ONLY', 865, 1410)

    // Optical Alignment Crosshair Marks
    const drawFiducial = (fx: number, fy: number) => {
      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(fx, fy, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(fx - 16, fy)
      ctx.lineTo(fx + 16, fy)
      ctx.moveTo(fx, fy - 16)
      ctx.lineTo(fx, fy + 16)
      ctx.stroke()
    }
    drawFiducial(80, 80)
    drawFiducial(1968, 80)
    drawFiducial(80, 1456)
    drawFiducial(1968, 1456)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }

  /**
   * Generates the authentic PlayStation 1 gray molded console chassis interior (#7d8797 / #6c7582)
   * with ABS plastic structural ribbing, ventilation louvers, mold markings, and screw wells.
   */
  static createChassisTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // 1. Base PS1 Gray Molded ABS Plastic (#7b8595)
    ctx.fillStyle = '#7b8595'
    ctx.fillRect(0, 0, 1024, 1024)

    // Subtle ABS plastic stipple texture
    const imgData = ctx.getImageData(0, 0, 1024, 1024)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 10
      data[i] = Math.max(0, Math.min(255, (data[i] ?? 123) + noise))
      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] ?? 133) + noise))
      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] ?? 149) + noise))
    }
    ctx.putImageData(imgData, 0, 0)

    // 2. Molded ABS Structural Reinforcing Ribs Matrix
    const ribSpacing = 64
    for (let x = 0; x <= 1024; x += ribSpacing) {
      // Groove shadow
      ctx.strokeStyle = '#5a6270'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 1024)
      ctx.stroke()

      // Bevel highlight
      ctx.strokeStyle = '#9aa5b6'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(x + 2, 0)
      ctx.lineTo(x + 2, 1024)
      ctx.stroke()
    }

    for (let y = 0; y <= 1024; y += ribSpacing) {
      ctx.strokeStyle = '#5a6270'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1024, y)
      ctx.stroke()

      ctx.strokeStyle = '#9aa5b6'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(0, y + 2)
      ctx.lineTo(1024, y + 2)
      ctx.stroke()
    }

    // 3. Diagonal Structural Corner Gussets
    ctx.strokeStyle = '#687383'
    ctx.lineWidth = 2
    for (let d = -1024; d <= 1024; d += 128) {
      ctx.beginPath()
      ctx.moveTo(d, 0)
      ctx.lineTo(d + 1024, 1024)
      ctx.stroke()
    }

    // 4. Air Ventilation Louvers / Cooling Slits (Left & Right Grills)
    const drawLouverGrill = (startX: number, startY: number, w: number, h: number) => {
      ctx.fillStyle = '#3a404d'
      ctx.fillRect(startX, startY, w, h)

      const slitHeight = 8
      const slitGap = 6
      for (let y = startY + 6; y < startY + h - 6; y += slitHeight + slitGap) {
        ctx.fillStyle = '#1c2027'
        ctx.fillRect(startX + 6, y, w - 12, slitHeight)
        ctx.fillStyle = '#7a8596'
        ctx.fillRect(startX + 6, y + slitHeight - 2, w - 12, 2)
      }

      ctx.strokeStyle = '#939fae'
      ctx.lineWidth = 2
      ctx.strokeRect(startX, startY, w, h)
    }

    drawLouverGrill(32, 120, 110, 360)
    drawLouverGrill(32, 544, 110, 360)
    drawLouverGrill(882, 120, 110, 360)
    drawLouverGrill(882, 544, 110, 360)

    // 5. Mold Markings & Ejector Pin Circles
    const ejectorPins = [
      { x: 80, y: 60 },
      { x: 944, y: 60 },
      { x: 80, y: 964 },
      { x: 944, y: 964 },
      { x: 200, y: 80 },
      { x: 824, y: 80 },
      { x: 200, y: 944 },
      { x: 824, y: 944 },
    ]

    for (const ep of ejectorPins) {
      ctx.fillStyle = '#656f7f'
      ctx.beginPath()
      ctx.arc(ep.x, ep.y, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#4e5664'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.strokeStyle = '#9aa5b6'
      ctx.beginPath()
      ctx.arc(ep.x - 2, ep.y - 2, 16, 0, Math.PI * 2)
      ctx.stroke()
    }

    // 6. Molded Screw Wells
    const screwWells = [
      { x: 160, y: 160 },
      { x: 864, y: 160 },
      { x: 160, y: 864 },
      { x: 864, y: 864 },
      { x: 512, y: 80 },
      { x: 512, y: 944 },
    ]

    for (const sw of screwWells) {
      ctx.fillStyle = '#474e5b'
      ctx.beginPath()
      ctx.arc(sw.x, sw.y, 26, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#2b303a'
      ctx.lineWidth = 3
      ctx.stroke()

      // Silver screw head
      ctx.fillStyle = '#94a3b8'
      ctx.beginPath()
      ctx.arc(sw.x, sw.y, 14, 0, Math.PI * 2)
      ctx.fill()

      // Philips cross
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(sw.x - 9, sw.y)
      ctx.lineTo(sw.x + 9, sw.y)
      ctx.moveTo(sw.x, sw.y - 9)
      ctx.lineTo(sw.x, sw.y + 9)
      ctx.stroke()
    }

    // 7. Authentic Sony/Soli Console Mold Markings
    ctx.fillStyle = '#555e6c'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('SOLI COMPUTER ENTERTAINMENT INC.', 220, 60)
    ctx.font = 'bold 14px monospace'
    ctx.fillText('HOUSING LOWER SCPH-1001 / SCPH-5501', 220, 82)
    ctx.fillText('MATERIAL: >ABS-FR<  CAVITY #4  REV-C', 220, 102)
    ctx.fillText('PART NO. 1-456-789-11', 220, 122)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }

  /**
   * Replaces cutting mat with chassis texture (retained for backward compatibility).
   */
  static createCuttingMatTexture(): THREE.CanvasTexture {
    return this.createChassisTexture()
  }

  /**
   * Generates SOLI CPU CXD8530BQ Silkscreen (MIPS R3000A)
   */
  static createCpuTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Dark Matte Silicon Epoxy
    ctx.fillStyle = '#16181f'
    ctx.fillRect(0, 0, 512, 512)

    // Pin 1 Index Notch in corner
    ctx.fillStyle = '#0c0e12'
    ctx.beginPath()
    ctx.arc(48, 48, 22, 0, Math.PI * 2)
    ctx.fill()

    // SOLI Corporate Logo
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 68px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI', 256, 135)

    ctx.font = 'bold 22px monospace'
    ctx.fillStyle = '#cbd5e1'
    ctx.fillText('Computer Entertainment Inc.', 256, 178)

    // Part Numbers
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 36px monospace'
    ctx.fillText('CXD8530BQ', 256, 245)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 24px monospace'
    ctx.fillText('MIPS R3000A CORE', 256, 290)
    ctx.fillText('LSIL L9A0025', 256, 330)

    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 20px monospace'
    ctx.fillText('TBG 9532 A', 256, 375)
    ctx.fillText('HONG KONG', 256, 415)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    return texture
  }

  /**
   * Generates SOLI GPU CXD8514Q Silkscreen
   */
  static createGpuTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Dark Matte Silicon Epoxy Body
    ctx.fillStyle = '#161920'
    ctx.fillRect(0, 0, 512, 512)

    // Pin 1 Index Notch in corner
    ctx.fillStyle = '#0c0e12'
    ctx.beginPath()
    ctx.arc(44, 44, 20, 0, Math.PI * 2)
    ctx.fill()

    // Metallic gold registration corner marks
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 3
    ctx.strokeRect(16, 16, 480, 480)

    // SOLI Corporate Emblem
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 64px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI', 256, 140)

    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 38px monospace'
    ctx.fillText('CXD8514Q', 256, 215)

    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('3D GRAPHICS ENGINE', 256, 265)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('SOLI ENTERTAINMENT INC.', 256, 310)
    ctx.fillText('JAPAN 9536 KOREA', 256, 355)

    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('TBG 9536 A - 160 PIN QFP', 256, 410)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    return texture
  }

  /**
   * Generates SOLI SPU CXD2922Q / CD Mechacon Silkscreen
   */
  static createSpuTexture(label = 'CXD2922Q'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    ctx.fillStyle = '#161920'
    ctx.fillRect(0, 0, 512, 512)

    ctx.fillStyle = '#cbd5e1'
    ctx.font = 'bold 52px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI JAPAN', 256, 160)

    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 42px monospace'
    ctx.fillText(label, 256, 250)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 28px monospace'
    ctx.fillText('534F75E', 256, 330)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    return texture
  }

  /**
   * Generates SEC KOREA TSOP RAM Silkscreen
   */
  static createRamTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    ctx.fillStyle = '#14171e'
    ctx.fillRect(0, 0, 512, 256)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 44px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SEC KOREA', 256, 80)

    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 30px monospace'
    ctx.fillText('KM4216V256G-60', 256, 140)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('532A 33S', 256, 195)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    return texture
  }

  /**
   * Generates authentic PS1 PU-8 BIOS ROM IC102 (DIP32 rectangular chip with SOLI BIOS text)
   */
  static createBiosTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Dark molded epoxy package
    ctx.fillStyle = '#11141a'
    ctx.fillRect(0, 0, 512, 256)

    // Semi-circular index notch on the left side
    ctx.fillStyle = '#080a0d'
    ctx.beginPath()
    ctx.arc(0, 128, 28, -Math.PI / 2, Math.PI / 2)
    ctx.fill()

    // Pin 1 indicator dot
    ctx.beginPath()
    ctx.arc(36, 42, 10, 0, Math.PI * 2)
    ctx.fill()

    // SOLI BIOS Silkscreen Text
    ctx.fillStyle = '#f1f5f9'
    ctx.font = 'bold 44px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI BIOS', 256, 75)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 30px monospace'
    ctx.fillText('IC102 - PU-8 V2.2', 256, 125)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('LH534C00 / CXK581000M', 256, 168)
    ctx.fillText('© 1994-1995 SONY ENT.', 256, 205)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    return texture
  }

  /**
   * Generates AK4309AVM Audio DAC Silkscreen Texture
   */
  static createDacTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    ctx.fillStyle = '#171922'
    ctx.fillRect(0, 0, 256, 256)

    // Pin 1 dot
    ctx.fillStyle = '#090a0f'
    ctx.beginPath()
    ctx.arc(28, 28, 12, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 26px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('AKM DAC', 128, 80)

    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('AK4309AVM', 128, 130)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 18px monospace'
    ctx.fillText('532B 16-BIT', 128, 175)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    return texture
  }

  /**
   * Generates Laser-Etched Metallic Crystal Oscillator Can Texture (X101 / X102)
   */
  static createOscillatorTexture(freq: string, label: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Metallic brushed aluminum finish
    const grad = ctx.createLinearGradient(0, 0, 256, 128)
    grad.addColorStop(0, '#d1d5db')
    grad.addColorStop(0.3, '#f3f4f6')
    grad.addColorStop(0.7, '#9ca3af')
    grad.addColorStop(1, '#e5e7eb')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 256, 128)

    // Stamped metal rim border
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 4
    ctx.strokeRect(4, 4, 248, 120)

    // Laser-etched black lettering
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(freq, 128, 52)

    ctx.font = 'bold 20px monospace'
    ctx.fillText(label, 128, 86)

    ctx.font = 'bold 14px monospace'
    ctx.fillStyle = '#4b5563'
    ctx.fillText('SOLI JAPAN', 128, 110)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    return texture
  }
}


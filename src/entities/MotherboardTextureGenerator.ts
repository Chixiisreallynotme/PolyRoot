import * as THREE from 'three'

// Procedural Texture Generator for PS1 PU-8 Motherboard & Molded Gray ABS Console Chassis Interior

export class MotherboardTextureGenerator {
  /**
   * Generates the authentic PlayStation 1 gray molded console chassis interior (#8d99ae / #7a8699)
   * with ABS plastic structural ribbing, ventilation louvers, mold markings, and metal shield zones.
   */
  static createChassisTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // 1. Base PS1 Gray Molded ABS Plastic (#8d99ae)
    ctx.fillStyle = '#8d99ae'
    ctx.fillRect(0, 0, 1024, 1024)

    // Subtle ABS plastic stipple texture
    const imgData = ctx.getImageData(0, 0, 1024, 1024)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12
      data[i] = Math.max(0, Math.min(255, (data[i] ?? 141) + noise))
      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] ?? 153) + noise))
      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] ?? 174) + noise))
    }
    ctx.putImageData(imgData, 0, 0)

    // 2. Molded ABS Structural Reinforcing Ribs Matrix (Grid with bevel highlights)
    const ribSpacing = 64
    for (let x = 0; x <= 1024; x += ribSpacing) {
      // Dark groove shadow
      ctx.strokeStyle = '#6c757d'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 1024)
      ctx.stroke()

      // Light bevel highlight
      ctx.strokeStyle = '#a2afc4'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x + 2, 0)
      ctx.lineTo(x + 2, 1024)
      ctx.stroke()
    }

    for (let y = 0; y <= 1024; y += ribSpacing) {
      ctx.strokeStyle = '#6c757d'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1024, y)
      ctx.stroke()

      ctx.strokeStyle = '#a2afc4'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, y + 2)
      ctx.lineTo(1024, y + 2)
      ctx.stroke()
    }

    // 3. Diagonal Structural Gussets & Honeycomb Corner Bracing
    ctx.strokeStyle = '#7a8699'
    ctx.lineWidth = 2.5
    for (let d = -1024; d <= 1024; d += 128) {
      ctx.beginPath()
      ctx.moveTo(d, 0)
      ctx.lineTo(d + 1024, 1024)
      ctx.stroke()
    }

    // 4. Air Ventilation Louvers / Cooling Slits (Left & Right Grills)
    const drawLouverGrill = (startX: number, startY: number, w: number, h: number) => {
      ctx.fillStyle = '#495057'
      ctx.fillRect(startX, startY, w, h)

      const slitHeight = 8
      const slitGap = 6
      for (let y = startY + 6; y < startY + h - 6; y += slitHeight + slitGap) {
        // Deep shadow slot
        ctx.fillStyle = '#2b2d42'
        ctx.fillRect(startX + 6, y, w - 12, slitHeight)
        // Louver slat highlight
        ctx.fillStyle = '#8d99ae'
        ctx.fillRect(startX + 6, y + slitHeight - 2, w - 12, 2)
      }

      // Louver border frame
      ctx.strokeStyle = '#adb5bd'
      ctx.lineWidth = 2
      ctx.strokeRect(startX, startY, w, h)
    }

    drawLouverGrill(48, 128, 140, 360)
    drawLouverGrill(48, 540, 140, 360)
    drawLouverGrill(836, 128, 140, 360)
    drawLouverGrill(836, 540, 140, 360)

    // 5. Metal Grounding Shield Zone Footprints (Galvanized Steel Pattern)
    ctx.fillStyle = 'rgba(196, 205, 213, 0.45)'
    ctx.fillRect(240, 180, 544, 664)
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 3
    ctx.strokeRect(240, 180, 544, 664)

    // 6. Mold Markings & Ejector Pin Witness Circles
    const ejectorPins = [
      { x: 120, y: 80 },
      { x: 900, y: 80 },
      { x: 120, y: 940 },
      { x: 900, y: 940 },
      { x: 300, y: 240 },
      { x: 720, y: 240 },
      { x: 300, y: 780 },
      { x: 720, y: 780 },
    ]

    for (const ep of ejectorPins) {
      ctx.fillStyle = '#7a8699'
      ctx.beginPath()
      ctx.arc(ep.x, ep.y, 22, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.strokeStyle = '#cbd5e1'
      ctx.beginPath()
      ctx.arc(ep.x - 2, ep.y - 2, 18, 0, Math.PI * 2)
      ctx.stroke()
    }

    // 7. Authentic Sony/Soli & PS1 Mold Markings
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 20px monospace'
    ctx.fillText('SOLI COMPUTER ENTERTAINMENT INC.', 260, 220)
    ctx.font = 'bold 16px monospace'
    ctx.fillText('HOUSING LOWER SCPH-1001 / SCPH-5501', 260, 246)
    ctx.fillText('MATERIAL: >ABS-FR<  CAVITY #4  REV-B', 260, 270)
    ctx.fillText('PART NO. 1-456-789-11', 260, 294)

    // CD-ROM Optical Drive Sled Well Guidance Silkscreen
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(380, 480, 110, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('OPTICAL PICKUP BAY [KSM-440ACM]', 290, 485)
    ctx.fillText('CAUTION: CLASS 1 LASER PRODUCT', 290, 510)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.NearestFilter
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

    // Dark Matte Silicon
    ctx.fillStyle = '#181a20'
    ctx.fillRect(0, 0, 512, 512)

    // Pin 1 Index Notch in corner
    ctx.fillStyle = '#0f1115'
    ctx.beginPath()
    ctx.arc(48, 48, 24, 0, Math.PI * 2)
    ctx.fill()

    // SOLI Corporate Logo
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 72px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI', 256, 140)

    ctx.font = 'bold 24px monospace'
    ctx.fillStyle = '#cbd5e1'
    ctx.fillText('Computer Entertainment Inc.', 256, 185)

    // Part Numbers
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 36px monospace'
    ctx.fillText('CXD8530BQ', 256, 250)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 26px monospace'
    ctx.fillText('LSIL L9A0025', 256, 300)
    ctx.fillText('WK80624', 256, 340)

    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('TBG 9532 A', 256, 385)
    ctx.fillText('HONG KONG', 256, 425)

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

    ctx.fillStyle = '#1a1d24'
    ctx.fillRect(0, 0, 512, 512)

    ctx.fillStyle = '#0f1115'
    ctx.beginPath()
    ctx.arc(44, 44, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 64px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI', 256, 150)

    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 38px monospace'
    ctx.fillText('CXD8514Q', 256, 230)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 24px monospace'
    ctx.fillText('Entertainment Inc.', 256, 290)
    ctx.fillText('JAPAN 9536 KOREA', 256, 340)

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

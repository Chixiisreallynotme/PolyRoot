import * as THREE from 'three'

// Procedural Texture Generator for PS1 PU-8 Motherboard & Workshop Cutting Mat

export class MotherboardTextureGenerator {
  /**
   * Generates the Green Cutting Mat floor with yellow measurement grid and degree arcs.
   */
  static createCuttingMatTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Dark Emerald Green Cutting Mat Base (#1b4d3e)
    ctx.fillStyle = '#1b4d3e'
    ctx.fillRect(0, 0, 1024, 1024)

    // Minor Grid Lines (1cm equivalent) - Light Green
    ctx.strokeStyle = '#2d6a54'
    ctx.lineWidth = 1.5
    const step = 32
    for (let x = 0; x <= 1024; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 1024)
      ctx.stroke()
    }
    for (let y = 0; y <= 1024; y += step) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1024, y)
      ctx.stroke()
    }

    // Major Grid Lines (5cm equivalent) - Yellow/Gold
    ctx.strokeStyle = '#eab308'
    ctx.lineWidth = 2.5
    const majorStep = 160
    for (let x = 0; x <= 1024; x += majorStep) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 1024)
      ctx.stroke()
    }
    for (let y = 0; y <= 1024; y += majorStep) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(1024, y)
      ctx.stroke()
    }

    // Circular Degree Arcs in Bottom-Left (10°, 20° ... 90°)
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 2.0
    const radii = [120, 240, 360, 480]
    for (const r of radii) {
      ctx.beginPath()
      ctx.arc(0, 1024, r, 0, -Math.PI / 2, true)
      ctx.stroke()
    }

    // Degree text annotations
    ctx.fillStyle = '#fef08a'
    ctx.font = 'bold 22px monospace'
    const angles = [10, 20, 30, 45, 60, 70, 80]
    for (const deg of angles) {
      const rad = (deg * Math.PI) / 180
      const x = Math.cos(rad) * 440
      const y = 1024 - Math.sin(rad) * 440
      ctx.fillText(`${deg}°`, x, y)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.NearestFilter
    return texture
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
}

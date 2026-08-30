import * as THREE from 'three'

// Procedural CanvasTexture Generator for PS1 PU-8 Motherboard Chips with Fictionalized Markings (SOLI, SEK)

export class MotherboardTextureGenerator {
  static createCpuTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Dark Matte Charcoal Ceramic Chip Body
    ctx.fillStyle = '#181b22'
    ctx.fillRect(0, 0, 512, 512)

    // Gold Beveled Silk Border
    ctx.lineWidth = 10
    ctx.strokeStyle = '#c59b27'
    ctx.strokeRect(16, 16, 480, 480)

    // Pin 1 Index Dot
    ctx.fillStyle = '#c59b27'
    ctx.beginPath()
    ctx.arc(48, 48, 14, 0, Math.PI * 2)
    ctx.fill()

    // Fictionalized Brand: SOLI
    ctx.fillStyle = '#e2b538'
    ctx.font = 'bold 76px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI', 256, 130)

    ctx.font = 'bold 22px monospace'
    ctx.fillText('© Soli Computer', 256, 175)
    ctx.fillText('Entertainment Inc.', 256, 205)

    // Chip Specs
    ctx.font = 'bold 36px monospace'
    ctx.fillText('CXD8530BQ', 256, 275)

    ctx.font = '22px monospace'
    ctx.fillStyle = '#d4af37'
    ctx.fillText('LSIL L9A0025', 256, 325)
    ctx.fillText('WK80624', 256, 360)
    ctx.fillText('TBG 9532 A', 256, 395)
    ctx.fillText('HONG KONG', 256, 440)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }

  static createGpuTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    ctx.fillStyle = '#1c202a'
    ctx.fillRect(0, 0, 512, 512)

    ctx.lineWidth = 8
    ctx.strokeStyle = '#94a3b8'
    ctx.strokeRect(16, 16, 480, 480)

    ctx.fillStyle = '#cbd5e1'
    ctx.beginPath()
    ctx.arc(48, 48, 12, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = 'bold 64px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI', 256, 140)

    ctx.font = '24px monospace'
    ctx.fillText('CXD8514Q', 256, 210)
    ctx.fillText('3D GRAPHICS GPU', 256, 260)
    ctx.fillText('JAPAN 9534E', 256, 310)
    ctx.fillText('PO10903', 256, 360)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }

  static createSpuTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    ctx.fillStyle = '#151820'
    ctx.fillRect(0, 0, 512, 512)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 44px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI JAPAN', 256, 140)
    ctx.font = 'bold 36px monospace'
    ctx.fillText('CXD2922Q', 256, 220)
    ctx.font = '28px monospace'
    ctx.fillText('534F75E SPU', 256, 300)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }

  static createMechaconTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    ctx.fillStyle = '#151820'
    ctx.fillRect(0, 0, 512, 512)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 44px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('SOLI JAPAN', 256, 140)
    ctx.font = 'bold 36px monospace'
    ctx.fillText('CXD1815Q', 256, 220)
    ctx.font = '28px monospace'
    ctx.fillText('533E67E MECHA', 256, 300)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }

  static createRamTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    ctx.fillStyle = '#181b22'
    ctx.fillRect(0, 0, 512, 256)

    ctx.fillStyle = '#cbd5e1'
    ctx.font = 'bold 50px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('SEK KOREA', 256, 85)

    ctx.font = '32px monospace'
    ctx.fillText('KM4216V256G-60', 256, 155)
    ctx.fillText('532A TSOP', 256, 210)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }
}

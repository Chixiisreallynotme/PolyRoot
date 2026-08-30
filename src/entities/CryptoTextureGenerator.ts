import * as THREE from 'three'

// Procedural High-Contrast Pixel Art Textures for BTC, DOGE, and PEPE
// Sharp, recognizable retro PS1 arcade textures with pure corner palette patches for limbs

export class CryptoTextureGenerator {
  static createBtcTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Palette Corners:
    // (0,0): Pure White for Boxing Gloves
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 24, 24)
    // (232,0): Dark Charcoal for Boots
    ctx.fillStyle = '#18181b'
    ctx.fillRect(232, 0, 24, 24)
    // (0,232): Vivid Bitcoin Orange for Limbs/Sides
    ctx.fillStyle = '#f7931a'
    ctx.fillRect(0, 232, 24, 24)

    // 1. Vibrant Bitcoin Gold/Orange Coin Face
    ctx.fillStyle = '#f7931a'
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()

    // Outer Beveled Rim
    ctx.lineWidth = 14
    ctx.strokeStyle = '#c25e00'
    ctx.stroke()

    // Inner Golden Dotted Ring
    ctx.lineWidth = 5
    ctx.strokeStyle = '#ffedd5'
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.arc(128, 128, 102, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // 2. Bold White Bitcoin Emblem (₿) - Upright, Centered, Razor Sharp
    ctx.fillStyle = '#0f172a'
    ctx.font = '900 135px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('₿', 128, 132)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 130px monospace'
    ctx.fillText('₿', 128, 130)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }

  static createDogeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Palette Corners:
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 24, 24)
    ctx.fillStyle = '#451a03'
    ctx.fillRect(232, 0, 24, 24)
    ctx.fillStyle = '#eab308'
    ctx.fillRect(0, 232, 24, 24)

    // 1. Golden Yellow Coin Base
    ctx.fillStyle = '#eab308'
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 14
    ctx.strokeStyle = '#a16207'
    ctx.stroke()

    // 2. Shiba Inu Face
    // White Muzzle
    ctx.fillStyle = '#fef9c3'
    ctx.beginPath()
    ctx.ellipse(128, 160, 68, 48, 0, 0, Math.PI * 2)
    ctx.fill()

    // Dark Eyes with White Highlights
    ctx.fillStyle = '#451a03'
    ctx.beginPath()
    ctx.ellipse(82, 112, 14, 18, -0.15, 0, Math.PI * 2)
    ctx.ellipse(174, 112, 14, 18, 0.15, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(86, 108, 5, 0, Math.PI * 2)
    ctx.arc(178, 108, 5, 0, Math.PI * 2)
    ctx.fill()

    // Black Nose & Mouth
    ctx.fillStyle = '#1c1917'
    ctx.beginPath()
    ctx.ellipse(128, 150, 15, 11, 0, 0, Math.PI * 2)
    ctx.fill()

    // 3. Dogecoin Emblem (Ð) Centered at the top
    ctx.fillStyle = '#451a03'
    ctx.font = '900 100px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Ð', 128, 68)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 95px monospace'
    ctx.fillText('Ð', 128, 66)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }

  static createPepeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Palette Corners:
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 24, 24)
    ctx.fillStyle = '#14532d'
    ctx.fillRect(232, 0, 24, 24)
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(0, 232, 24, 24)

    // 1. Vibrant Green Frog Face
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 14
    ctx.strokeStyle = '#15803d'
    ctx.stroke()

    // 2. Large Iconic Frog Eyes (Upright)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.ellipse(82, 85, 38, 32, -0.1, 0, Math.PI * 2)
    ctx.ellipse(174, 85, 38, 32, 0.1, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 7
    ctx.strokeStyle = '#14532d'
    ctx.stroke()

    // Black Pupils (Droopy classic Pepe expression)
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.ellipse(86, 88, 18, 22, 0.1, 0, Math.PI * 2)
    ctx.ellipse(178, 88, 18, 22, -0.1, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(92, 82, 6, 0, Math.PI * 2)
    ctx.arc(184, 82, 6, 0, Math.PI * 2)
    ctx.fill()

    // 3. Wide Red Pepe Lips / Mouth
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.ellipse(128, 168, 72, 28, 0, 0, Math.PI)
    ctx.fill()

    ctx.lineWidth = 10
    ctx.strokeStyle = '#991b1b'
    ctx.beginPath()
    ctx.moveTo(56, 164)
    ctx.quadraticCurveTo(128, 210, 200, 164)
    ctx.stroke()

    ctx.lineWidth = 8
    ctx.strokeStyle = '#14532d'
    ctx.beginPath()
    ctx.moveTo(52, 162)
    ctx.quadraticCurveTo(128, 148, 204, 162)
    ctx.stroke()

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }
}

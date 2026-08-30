import * as THREE from 'three'

// Procedural Pixel Art CanvasTexture Generator for Crypto Enemies (BTC, DOGE, PEPE)
// Generates bold, recognizable pixel art faces with crisp typography and high contrast.

export class CryptoTextureGenerator {
  static createBtcTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Corner Palettes for UV-mapped limbs:
    // (0,0): Pure White for Boxing Gloves
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 24, 24)
    // (232,0): Dark Navy/Charcoal for Boots
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(232, 0, 24, 24)
    // (0,232): Deep Orange for Rim/Arms/Legs
    ctx.fillStyle = '#d97706'
    ctx.fillRect(0, 232, 24, 24)

    // 1. Bright Golden Orange Coin Face
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()

    // Outer Dark Gold Rim
    ctx.lineWidth = 14
    ctx.strokeStyle = '#b45309'
    ctx.stroke()

    // Inner Dotted Border
    ctx.lineWidth = 6
    ctx.strokeStyle = '#fef08a'
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.arc(128, 128, 102, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // 2. Bold High-Contrast Bitcoin Emblem (₿)
    ctx.fillStyle = '#0f172a'
    ctx.font = '900 135px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('₿', 128, 134)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 128px monospace'
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

    // (0,0): Pure White for Boxing Paws
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 24, 24)
    // (232,0): Dark Brown for Feet
    ctx.fillStyle = '#451a03'
    ctx.fillRect(232, 0, 24, 24)
    // (0,232): Gold for Body/Ears
    ctx.fillStyle = '#ca8a04'
    ctx.fillRect(0, 232, 24, 24)

    // 1. Golden Yellow Coin Base
    ctx.fillStyle = '#eab308'
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 14
    ctx.strokeStyle = '#a16207'
    ctx.stroke()

    // 2. Shiba Inu White/Cream Muzzle
    ctx.fillStyle = '#fef08a'
    ctx.beginPath()
    ctx.ellipse(128, 155, 68, 48, 0, 0, Math.PI * 2)
    ctx.fill()

    // Shiba Dark Eyes with Sparkles
    ctx.fillStyle = '#451a03'
    ctx.beginPath()
    ctx.ellipse(82, 110, 14, 18, -0.2, 0, Math.PI * 2)
    ctx.ellipse(174, 110, 14, 18, 0.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(86, 105, 5, 0, Math.PI * 2)
    ctx.arc(178, 105, 5, 0, Math.PI * 2)
    ctx.fill()

    // Nose
    ctx.fillStyle = '#1c1917'
    ctx.beginPath()
    ctx.ellipse(128, 148, 16, 11, 0, 0, Math.PI * 2)
    ctx.fill()

    // 3. Bold Dogecoin (Ð) Emblem on top forehead
    ctx.fillStyle = '#451a03'
    ctx.font = '900 85px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Ð', 128, 68)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 80px monospace'
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

    // (0,0): Pure White for Gloves
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 24, 24)
    // (232,0): Dark Green for Webbed Feet
    ctx.fillStyle = '#14532d'
    ctx.fillRect(232, 0, 24, 24)
    // (0,232): Bright Frog Green for Body
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(0, 232, 24, 24)

    // 1. Vibrant Frog Green Face
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 14
    ctx.strokeStyle = '#15803d'
    ctx.stroke()

    // 2. Large Iconic Frog Eyes
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(80, 85, 38, 0, Math.PI * 2)
    ctx.arc(176, 85, 38, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 6
    ctx.strokeStyle = '#14532d'
    ctx.stroke()

    // Pupils
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.ellipse(82, 86, 18, 22, 0.1, 0, Math.PI * 2)
    ctx.ellipse(174, 86, 18, 22, -0.1, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(86, 80, 7, 0, Math.PI * 2)
    ctx.arc(178, 80, 7, 0, Math.PI * 2)
    ctx.fill()

    // 3. Wide Red Pepe Lips/Mouth
    ctx.fillStyle = '#b91c1c'
    ctx.beginPath()
    ctx.ellipse(128, 172, 75, 26, 0, 0, Math.PI)
    ctx.fill()

    ctx.lineWidth = 8
    ctx.strokeStyle = '#7f1d1d'
    ctx.stroke()

    ctx.lineWidth = 7
    ctx.strokeStyle = '#14532d'
    ctx.beginPath()
    ctx.moveTo(50, 168)
    ctx.quadraticCurveTo(128, 155, 206, 168)
    ctx.stroke()

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }
}

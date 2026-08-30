import * as THREE from 'three'

// Procedural Pixel Art CanvasTexture Generator for Crypto Enemies (BTC, DOGE, PEPE)
// Generates bold, recognizable pixel art faces with metallic coin rims, crisp emblems,
// and 4-corner UV color palettes for limbs, boots, and metallic edges.

export class CryptoTextureGenerator {
  static createBtcTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Corner Palettes for UV-mapped limbs:
    // (0,0) Top-Left -> Three.js UV (0.05, 0.95): Pure White for Boxing Gloves & speculars
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 28, 28)

    // (228,0) Top-Right -> Three.js UV (0.95, 0.95): Dark Navy/Charcoal for Heavy Boots
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(228, 0, 28, 28)

    // (0,228) Bottom-Left -> Three.js UV (0.05, 0.05): Golden Orange for Arms/Legs
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(0, 228, 28, 28)

    // (228,228) Bottom-Right -> Three.js UV (0.95, 0.05): Dark Bronze/Gold for Coin Rim
    ctx.fillStyle = '#b45309'
    ctx.fillRect(228, 228, 28, 28)

    // 1. Outer Dark Gold Coin Rim & Base
    ctx.fillStyle = '#b45309'
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()

    // 2. Bright Metallic Golden Orange Coin Face
    const grad = ctx.createRadialGradient(115, 115, 10, 128, 128, 114)
    grad.addColorStop(0, '#fde047')
    grad.addColorStop(0.35, '#fbbf24')
    grad.addColorStop(0.75, '#f59e0b')
    grad.addColorStop(1, '#d97706')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(128, 128, 110, 0, Math.PI * 2)
    ctx.fill()

    // Outer Dark Gold Rim Border
    ctx.lineWidth = 8
    ctx.strokeStyle = '#92400e'
    ctx.beginPath()
    ctx.arc(128, 128, 110, 0, Math.PI * 2)
    ctx.stroke()

    // Inner Dotted Border
    ctx.lineWidth = 5
    ctx.strokeStyle = '#fef08a'
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.arc(128, 128, 98, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Circuit Line Accents
    ctx.lineWidth = 3
    ctx.strokeStyle = '#d97706'
    ctx.beginPath()
    ctx.moveTo(60, 128)
    ctx.lineTo(82, 128)
    ctx.moveTo(174, 128)
    ctx.lineTo(196, 128)
    ctx.moveTo(128, 55)
    ctx.lineTo(128, 72)
    ctx.moveTo(128, 184)
    ctx.lineTo(128, 201)
    ctx.stroke()

    // 3. Bold High-Contrast Bitcoin Emblem (₿)
    // Dark Shadow / Outline
    ctx.fillStyle = '#0f172a'
    ctx.font = '900 135px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('₿', 128, 136)

    // Inner Deep Orange Shadow Layer
    ctx.fillStyle = '#78350f'
    ctx.font = '900 130px monospace'
    ctx.fillText('₿', 128, 133)

    // Crisp Bright White/Gold Fill
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 126px monospace'
    ctx.fillText('₿', 128, 128)

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

    // (0,0) Top-Left -> Three.js UV (0.05, 0.95): Pure White for Boxing Paws
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 28, 28)

    // (228,0) Top-Right -> Three.js UV (0.95, 0.95): Dark Brown for Feet / Pads
    ctx.fillStyle = '#451a03'
    ctx.fillRect(228, 0, 28, 28)

    // (0,228) Bottom-Left -> Three.js UV (0.05, 0.05): Golden Yellow for Body/Ears
    ctx.fillStyle = '#eab308'
    ctx.fillRect(0, 228, 28, 28)

    // (228,228) Bottom-Right -> Three.js UV (0.95, 0.05): Dark Gold for Coin Rim
    ctx.fillStyle = '#a16207'
    ctx.fillRect(228, 228, 28, 28)

    // 1. Outer Dark Gold Coin Rim & Base
    ctx.fillStyle = '#a16207'
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()

    // 2. Golden Yellow Coin Base
    const grad = ctx.createRadialGradient(115, 115, 10, 128, 128, 114)
    grad.addColorStop(0, '#fef08a')
    grad.addColorStop(0.4, '#facc15')
    grad.addColorStop(0.8, '#eab308')
    grad.addColorStop(1, '#ca8a04')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(128, 128, 110, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 8
    ctx.strokeStyle = '#854d0e'
    ctx.beginPath()
    ctx.arc(128, 128, 110, 0, Math.PI * 2)
    ctx.stroke()

    // Inner Dotted Border
    ctx.lineWidth = 4
    ctx.strokeStyle = '#fef9c3'
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.arc(128, 128, 98, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // 3. Shiba Inu White/Cream Muzzle
    ctx.fillStyle = '#fef9c3'
    ctx.beginPath()
    ctx.ellipse(128, 155, 68, 48, 0, 0, Math.PI * 2)
    ctx.fill()

    // Shiba Muzzle Outline
    ctx.lineWidth = 3
    ctx.strokeStyle = '#ca8a04'
    ctx.stroke()

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

    // Cute Black Nose
    ctx.fillStyle = '#1c1917'
    ctx.beginPath()
    ctx.ellipse(128, 148, 16, 11, 0, 0, Math.PI * 2)
    ctx.fill()

    // Cute W-mouth line
    ctx.lineWidth = 3
    ctx.strokeStyle = '#1c1917'
    ctx.beginPath()
    ctx.moveTo(112, 162)
    ctx.quadraticCurveTo(120, 168, 128, 162)
    ctx.quadraticCurveTo(136, 168, 144, 162)
    ctx.stroke()

    // 4. Bold Dogecoin (Ð) Emblem on top forehead
    ctx.fillStyle = '#451a03'
    ctx.font = '900 86px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Ð', 128, 68)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 80px monospace'
    ctx.fillText('Ð', 128, 65)

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

    // (0,0) Top-Left -> Three.js UV (0.05, 0.95): Pure White for Gloves / Eye highlights
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 28, 28)

    // (228,0) Top-Right -> Three.js UV (0.95, 0.95): Dark Green for Webbed Feet
    ctx.fillStyle = '#14532d'
    ctx.fillRect(228, 0, 28, 28)

    // (0,228) Bottom-Left -> Three.js UV (0.05, 0.05): Bright Frog Green for Body/Limbs
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(0, 228, 28, 28)

    // (228,228) Bottom-Right -> Three.js UV (0.95, 0.05): Dark Emerald Green for Coin Rim
    ctx.fillStyle = '#15803d'
    ctx.fillRect(228, 228, 28, 28)

    // 1. Outer Dark Emerald Coin Rim & Base
    ctx.fillStyle = '#15803d'
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()

    // 2. Vibrant Frog Green Metallic Face
    const grad = ctx.createRadialGradient(115, 115, 10, 128, 128, 114)
    grad.addColorStop(0, '#86efac')
    grad.addColorStop(0.35, '#4ade80')
    grad.addColorStop(0.75, '#22c55e')
    grad.addColorStop(1, '#16a34a')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(128, 128, 110, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 8
    ctx.strokeStyle = '#14532d'
    ctx.beginPath()
    ctx.arc(128, 128, 110, 0, Math.PI * 2)
    ctx.stroke()

    // Inner Dotted Border
    ctx.lineWidth = 4
    ctx.strokeStyle = '#bbf7d0'
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.arc(128, 128, 98, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // 3. Large Iconic Frog Eyes
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(80, 85, 36, 0, Math.PI * 2)
    ctx.arc(176, 85, 36, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 6
    ctx.strokeStyle = '#14532d'
    ctx.beginPath()
    ctx.arc(80, 85, 36, 0, Math.PI * 2)
    ctx.arc(176, 85, 36, 0, Math.PI * 2)
    ctx.stroke()

    // Pupils
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.ellipse(82, 86, 17, 21, 0.1, 0, Math.PI * 2)
    ctx.ellipse(174, 86, 17, 21, -0.1, 0, Math.PI * 2)
    ctx.fill()

    // Specular Highlights
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(86, 80, 7, 0, Math.PI * 2)
    ctx.arc(178, 80, 7, 0, Math.PI * 2)
    ctx.fill()

    // 4. Wide Red Pepe Smirk Lips & Mouth
    ctx.fillStyle = '#b91c1c'
    ctx.beginPath()
    ctx.ellipse(128, 172, 75, 26, 0, 0, Math.PI)
    ctx.fill()

    ctx.lineWidth = 7
    ctx.strokeStyle = '#7f1d1d'
    ctx.stroke()

    // Smirk Crease Line
    ctx.lineWidth = 6
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

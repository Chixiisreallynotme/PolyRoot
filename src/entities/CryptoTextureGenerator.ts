import * as THREE from 'three'

// Procedural Pixel Art CanvasTexture Generator for Crypto Enemies
// Generates crisp, high-contrast, recognizable face & emblem textures for BTC, DOGE, and PEPE
// Also includes solid color pixel palettes in corners for UV-mapped limbs, boots, and gloves

export class CryptoTextureGenerator {
  static createBtcTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // Corner Palettes for Limbs:
    // (0,0): Pure White for Gloves
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 20, 20)
    // (236,0): Dark Navy for Boots
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(236, 0, 20, 20)
    // (0,236): Orange for Legs/Arms
    ctx.fillStyle = '#d97706'
    ctx.fillRect(0, 236, 20, 20)

    // 1. Gold/Orange Coin Background
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(128, 128, 116, 0, Math.PI * 2)
    ctx.fill()

    // Outer Dark Gold Rim
    ctx.lineWidth = 14
    ctx.strokeStyle = '#b45309'
    ctx.stroke()

    // Inner Dotted Border
    ctx.lineWidth = 6
    ctx.strokeStyle = '#fde68a'
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.arc(128, 128, 102, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // 2. Angry Cartoon Eyebrows
    ctx.fillStyle = '#78350f'
    ctx.beginPath()
    ctx.moveTo(60, 60)
    ctx.lineTo(110, 80)
    ctx.lineTo(105, 90)
    ctx.lineTo(55, 70)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(196, 60)
    ctx.lineTo(146, 80)
    ctx.lineTo(151, 90)
    ctx.lineTo(201, 70)
    ctx.fill()

    // 3. Bold White & Dark Bitcoin (₿) Emblem
    ctx.fillStyle = '#1e1b4b'
    ctx.font = 'bold 125px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('₿', 128, 142)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 120px monospace'
    ctx.fillText('₿', 128, 140)

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

    // Corner Palettes for Limbs:
    // (0,0): Pure White for Paws
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 20, 20)
    // (236,0): Dark Brown for Feet
    ctx.fillStyle = '#451a03'
    ctx.fillRect(236, 0, 20, 20)
    // (0,236): Yellow for Legs/Ears
    ctx.fillStyle = '#ca8a04'
    ctx.fillRect(0, 236, 20, 20)

    // 1. Golden Yellow Coin Base
    ctx.fillStyle = '#eab308'
    ctx.beginPath()
    ctx.arc(128, 128, 116, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 14
    ctx.strokeStyle = '#a16207'
    ctx.stroke()

    // 2. Shiba Inu White Muzzle Area
    ctx.fillStyle = '#fef08a'
    ctx.beginPath()
    ctx.ellipse(128, 155, 65, 45, 0, 0, Math.PI * 2)
    ctx.fill()

    // Shiba Dark Eyes
    ctx.fillStyle = '#451a03'
    ctx.beginPath()
    ctx.ellipse(85, 105, 12, 16, -0.2, 0, Math.PI * 2)
    ctx.ellipse(171, 105, 12, 16, 0.2, 0, Math.PI * 2)
    ctx.fill()

    // White Eye Sparkles
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(88, 100, 4, 0, Math.PI * 2)
    ctx.arc(174, 100, 4, 0, Math.PI * 2)
    ctx.fill()

    // Shiba Nose & Mouth
    ctx.fillStyle = '#1c1917'
    ctx.beginPath()
    ctx.ellipse(128, 145, 14, 10, 0, 0, Math.PI * 2)
    ctx.fill()

    // 3. Crisp Dark & Gold Dogecoin (Ð) Symbol
    ctx.fillStyle = '#713f12'
    ctx.font = 'bold 95px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Ð', 128, 75)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 90px monospace'
    ctx.fillText('Ð', 128, 73)

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

    // Corner Palettes for Limbs:
    // (0,0): Pure White for Boxing Gloves & Eyes
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 20, 20)
    // (236,0): Dark Green for Webbed Feet
    ctx.fillStyle = '#14532d'
    ctx.fillRect(236, 0, 20, 20)
    // (0,236): Bright Green for Arms/Legs
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(0, 236, 20, 20)

    // 1. Electric Lime Green Frog Face Base
    ctx.fillStyle = '#16a34a'
    ctx.beginPath()
    ctx.arc(128, 128, 116, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 14
    ctx.strokeStyle = '#14532d'
    ctx.stroke()

    // 2. Frog Eyes with Sclera & Pupils
    // Eye White Sclera
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(80, 80, 36, 0, Math.PI * 2)
    ctx.arc(176, 80, 36, 0, Math.PI * 2)
    ctx.fill()

    ctx.lineWidth = 6
    ctx.strokeStyle = '#14532d'
    ctx.stroke()

    // Black Eyeballs / Pupils
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.ellipse(82, 82, 16, 20, 0.15, 0, Math.PI * 2)
    ctx.ellipse(174, 82, 16, 20, -0.15, 0, Math.PI * 2)
    ctx.fill()

    // White Eye Reflections
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(86, 76, 6, 0, Math.PI * 2)
    ctx.arc(178, 76, 6, 0, Math.PI * 2)
    ctx.fill()

    // 3. Wide Iconic Pepe Frog Mouth / Lips
    ctx.fillStyle = '#991b1b'
    ctx.beginPath()
    ctx.ellipse(128, 168, 70, 24, 0, 0, Math.PI)
    ctx.fill()

    ctx.lineWidth = 10
    ctx.strokeStyle = '#b91c1c'
    ctx.beginPath()
    ctx.moveTo(55, 165)
    ctx.quadraticCurveTo(128, 205, 201, 165)
    ctx.stroke()

    ctx.lineWidth = 8
    ctx.strokeStyle = '#14532d'
    ctx.beginPath()
    ctx.moveTo(50, 162)
    ctx.quadraticCurveTo(128, 150, 206, 162)
    ctx.stroke()

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }
}

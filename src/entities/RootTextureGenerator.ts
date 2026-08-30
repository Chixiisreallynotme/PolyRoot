import * as THREE from 'three'

// Procedural CanvasTexture Generator for Root's Authentic Chibi Face
// Faithfully reproduces the official avatar (media_1788110401238.png & media_1788110314292.png)
// Massive glossy black anime/chibi eyes with double specular reflection bubbles and cheerful smile.

export class RootTextureGenerator {
  static createFaceTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    // 1. Base Vibrant Warm Orange Skin
    const grad = ctx.createRadialGradient(256, 240, 20, 256, 256, 256)
    grad.addColorStop(0, '#ff7e33')
    grad.addColorStop(0.8, '#f95f15')
    grad.addColorStop(1, '#e04805')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 512)

    // Cute Soft Peach/Rosy Cheek Blushes
    ctx.fillStyle = 'rgba(255, 100, 80, 0.35)'
    ctx.beginPath()
    ctx.ellipse(110, 310, 48, 28, 0, 0, Math.PI * 2)
    ctx.ellipse(402, 310, 48, 28, 0, 0, Math.PI * 2)
    ctx.fill()

    // 2. Huge Adorable Glossy Chibi Eyes (Matching reference media_1788110401238.png)
    const drawEye = (centerX: number, centerY: number, tilt: number) => {
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(tilt)

      // Outer Black Eyeliner Contour
      ctx.fillStyle = '#0a0d14'
      ctx.beginPath()
      ctx.ellipse(0, 0, 78, 105, 0, 0, Math.PI * 2)
      ctx.fill()

      // Deep Glossy Espresso Iris
      ctx.fillStyle = '#1e1410'
      ctx.beginPath()
      ctx.ellipse(0, 6, 72, 96, 0, 0, Math.PI * 2)
      ctx.fill()

      // Lower Iris Warm Ambient Glow
      const irisGlow = ctx.createRadialGradient(0, 45, 10, 0, 45, 65)
      irisGlow.addColorStop(0, '#78350f')
      irisGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = irisGlow
      ctx.beginPath()
      ctx.ellipse(0, 30, 60, 55, 0, 0, Math.PI * 2)
      ctx.fill()

      // Large Primary Specular Highlight Bubble (Top-Left)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.ellipse(-24, -36, 32, 40, -0.2, 0, Math.PI * 2)
      ctx.fill()

      // Small Secondary Specular Bubble (Bottom-Right)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
      ctx.beginPath()
      ctx.arc(28, 38, 16, 0, Math.PI * 2)
      ctx.fill()

      // Tiny Tertiary Sparkle (Far Edge)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
      ctx.beginPath()
      ctx.arc(-36, 18, 7, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Left & Right Large Eyes
    drawEye(160, 205, -0.06)
    drawEye(352, 205, 0.06)

    // 3. Open Joyful Chibi Mouth (Black interior with cute pink tongue)
    ctx.save()
    ctx.translate(256, 345)

    // Mouth Outer Shape
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.moveTo(-45, -15)
    ctx.quadraticCurveTo(0, -24, 45, -15)
    ctx.quadraticCurveTo(52, 42, 0, 46)
    ctx.quadraticCurveTo(-52, 42, -45, -15)
    ctx.fill()

    // Cute Pink Tongue
    ctx.fillStyle = '#fb7185'
    ctx.beginPath()
    ctx.moveTo(-32, 18)
    ctx.quadraticCurveTo(0, -2, 32, 18)
    ctx.quadraticCurveTo(0, 45, -32, 18)
    ctx.fill()

    // Mouth Lip Border Outline
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 4
    ctx.stroke()

    ctx.restore()

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }
}

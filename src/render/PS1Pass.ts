import * as THREE from 'three'
import ps1Frag from '../shaders/ps1.frag?raw'
import ps1Vert from '../shaders/ps1.vert?raw'

// via threejs-fundamentals: antialias false + pixelRatio 1.0 + setSize 960,720 image-rendering:pixelated
// via threejs-shaders: ShaderMaterial Bayer + quantize 31 + FogExp2 0.015 — ctx7 r184: WebGLRenderTarget NearestFilter
// via threejs-postprocessing: 1 ShaderPass maison ONLY — NEVER EffectComposer multi
// via threejs-psx-shader: FBO 320×240 Nearest pattern disable V1 uSnapRes=0
// 320×240 Nearest + quantize 31 + Fog 0.015 = lisibilité kiting — addiction

export class PS1Pass {
  public readonly renderTarget: THREE.WebGLRenderTarget
  public readonly quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  public readonly scene: THREE.Scene
  public readonly camera: THREE.OrthographicCamera

  constructor(private renderer: THREE.WebGLRenderer) {
    // WebGLRenderTarget 320×240 NearestFilter min+mag depthBuffer:true — MUST
    this.renderTarget = new THREE.WebGLRenderTarget(320, 240, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: true,
      stencilBuffer: false,
    })

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null as THREE.Texture | null },
        uResolution: { value: new THREE.Vector2(320, 240) },
        uFogDensity: { value: 0.015 },
        uFogColor: { value: new THREE.Color(0x1a3a2f) },
        uGlitch: { value: 0.0 },
        uTrauma: { value: 0.0 },
      },
      vertexShader: ps1Vert,
      fragmentShader: ps1Frag,
      depthWrite: false,
      depthTest: false,
    })

    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    this.scene = new THREE.Scene()
    this.scene.add(this.quad)
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  }

  triggerDamageGlitch(): void {
    const m = this.quad.material as THREE.ShaderMaterial
    if (m.uniforms['uGlitch']) m.uniforms['uGlitch'].value = 0.8
    setTimeout(() => {
      if (m.uniforms['uGlitch']) m.uniforms['uGlitch'].value = 0.0
    }, 90)
  }

  triggerExplosionShake(): void {
    const m = this.quad.material as THREE.ShaderMaterial
    if (m.uniforms['uTrauma']) m.uniforms['uTrauma'].value = 0.8
    if (m.uniforms['uGlitch']) m.uniforms['uGlitch'].value = 0.5
    setTimeout(() => {
      if (m.uniforms['uGlitch']) m.uniforms['uGlitch'].value = 0.0
      if (m.uniforms['uTrauma']) m.uniforms['uTrauma'].value = 0.0
    }, 180)
  }

  // triggerGlitch for A3: trauma 0.4+ 1 frame uGlitch 1.0 → 0.0
  triggerGlitch(line = '// HeatingSystem.ts:42 freeze=true // SpatialGrid 8x8 277k→68 checks'): void {
    const m = this.quad.material as THREE.ShaderMaterial
    m.uniforms['uGlitch']!.value = 1.0
    console.log('[4th-wall] A3 glitch PS1 1 frame code source —', line)
    setTimeout(() => {
      m.uniforms['uGlitch']!.value = 0.0
    }, 80)
  }

  setTrauma(v: number): void {
    const m = this.quad.material as THREE.ShaderMaterial
    m.uniforms['uTrauma']!.value = Math.max(0, Math.min(1, v))
  }

  // Render pipeline: scene → RT → quad fullscreen Nearest sampling renderTarget.texture → setRenderTarget(null)
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.render(scene, camera)
    const mat = this.quad.material as THREE.ShaderMaterial
    mat.uniforms['tDiffuse']!.value = this.renderTarget.texture
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)
  }

  setSize(width: number, height: number): void {
    this.renderTarget.setSize(320, 240)
    this.renderer.setSize(width, height, false)
  }

  dispose(): void {
    this.renderTarget.dispose()
    this.quad.geometry.dispose()
    ;(this.quad.material as THREE.Material).dispose()
  }
}

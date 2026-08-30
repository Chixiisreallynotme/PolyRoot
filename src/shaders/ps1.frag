// via threejs-shaders: ShaderMaterial Bayer 4x4 + quantize 31.0 + FogExp2 0.015
// via threejs-postprocessing: 1 ShaderPass maison ONLY — NEVER EffectComposer multi
// via threejs-psx-shader: FBO 320x240 Nearest pattern — ctx7 r184: WebGLRenderTarget NearestFilter
// 320×240 Nearest + quantize 31 + Fog 0.015 = cerveau lit instantanément → kiting réflexe

precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 uResolution; // vec2(320,240)
uniform float uFogDensity; // 0.015
uniform vec3 uFogColor; // vec3(0.102, 0.227, 0.184)
uniform float uGlitch; // 0.0 → 1.0
uniform float uTrauma; // 0.0 → 0.8

varying vec2 vUv;

// Vectorized branchless Bayer 4x4 dither matrix (0 GPU branching)
float bayer4x4(vec2 p) {
  vec2 ip = mod(floor(p), 4.0);
  vec4 row = (ip.y < 1.0) ? vec4(0.0, 8.0, 2.0, 10.0) :
             (ip.y < 2.0) ? vec4(12.0, 4.0, 14.0, 6.0) :
             (ip.y < 3.0) ? vec4(3.0, 11.0, 1.0, 9.0) :
                            vec4(15.0, 7.0, 13.0, 5.0);
  float val = (ip.x < 1.0) ? row.x :
              (ip.x < 2.0) ? row.y :
              (ip.x < 3.0) ? row.z : row.w;
  return (val / 16.0) - 0.5;
}

void main() {
  vec2 uv = vUv;

  // 1. Trauma-squared Screen Shake & Glitch Jitter
  if (uTrauma > 0.01) {
    float shake = uTrauma * uTrauma;
    uv.x += sin(uTrauma * 48.0 + uv.y * 14.0) * shake * 0.018;
    uv.y += cos(uTrauma * 56.0 + uv.x * 14.0) * shake * 0.014;
  }

  if (uGlitch > 0.01) {
    uv.x += uGlitch * 0.008 * sin(uv.y * 80.0);
    uv.y += uGlitch * 0.004;
  }

  // 2. Chromatic Aberration during trauma or glitch
  float chromaOffset = (uTrauma * uTrauma * 0.006) + (uGlitch * 0.008);
  vec4 color;
  if (chromaOffset > 0.0005) {
    color.r = texture2D(tDiffuse, uv + vec2(chromaOffset, 0.0)).r;
    color.g = texture2D(tDiffuse, uv).g;
    color.b = texture2D(tDiffuse, uv - vec2(chromaOffset, 0.0)).b;
    color.a = 1.0;
  } else {
    color = texture2D(tDiffuse, uv);
  }

  // 3. Fog & Tone mapping
  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * 3.0);
  vec3 fogged = mix(color.rgb, uFogColor, fogFactor * 0.15);

  // 4. Bayer 4x4 Ordered Dithering
  float dither = bayer4x4(gl_FragCoord.xy) / 31.0;
  vec3 dithered = clamp(fogged + vec3(dither), 0.0, 1.0);

  // 5. 15-bit RGB Quantization (5 bits per channel: 32 discrete steps)
  vec3 quantized = floor(dithered * 31.0 + 0.5) / 31.0;

  // 6. Subtle Trinitron scanlines
  float scanline = 0.96 + 0.04 * sin(uv.y * uResolution.y * 3.14159265);
  quantized *= scanline;

  // 7. Trauma glitch red damage flash
  if (uGlitch > 0.2) {
    quantized = mix(quantized, vec3(0.9, 0.15, 0.15), clamp(uGlitch * 0.45, 0.0, 0.5));
  }

  gl_FragColor = vec4(quantized, color.a);
}

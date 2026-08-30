import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import electron from 'vite-plugin-electron/simple'
import path from 'path'

// via antfu/skills@vite 33.9K Vite 8 Rolldown — via threejs-shaders HMR <200ms
// ctx7 vite-plugin-electron 1.1.1: simple + ctx7 r184: WebGLRenderer antialias:false pixelRatio:1
// EVAL electron-vite 5.0.0: vite-plugin-electron retenu car HMR <200ms + 1 config vs 3 — voir EVAL_ELECTRON_VITE.md
export default defineConfig({
  plugins: [
    glsl({
      include: ['**/*.glsl', '**/*.wgsl', '**/*.vert', '**/*.frag'] as unknown as string,
      watch: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/three/examples/jsm/libs/draco/*',
          dest: 'draco',
        },
        {
          src: 'node_modules/three/examples/jsm/libs/basis/*',
          dest: 'basis',
        },
      ],
    }),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: 'electron/preload.ts',
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/systems': path.resolve(__dirname, './src/systems'),
      '@/entities': path.resolve(__dirname, './src/entities'),
      '@/render': path.resolve(__dirname, './src/render'),
      '@/data': path.resolve(__dirname, './src/data'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
        },
      },
    },
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})

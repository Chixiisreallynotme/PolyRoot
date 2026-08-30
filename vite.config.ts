import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import electron from 'vite-plugin-electron/simple'
import path from 'path'

// PolyRoot : Vite + Three.js r184 + PS1 320x240 + Electron
// Perf : antialias false, pixelRatio 1, treeshaking Three
export default defineConfig({
  plugins: [
    glsl({
      include: /\.(glsl|wgsl|vert|frag)$/,
      watch: true,
      minify: true,
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

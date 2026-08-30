# EVAL electron-vite 5.0.0 vs vite-plugin-electron 1.1.1 — POC 2026-08-30

## Contexte
PolyRoot: Vite + Three r184 + Electron 32, HMR <200ms exigé sur *.frag + *.ts, build <150Mo, single config.

## POC
- vite-plugin-electron 1.1.1: `vite.config.ts plugins: [glsl({watch:true}), viteStaticCopy({draco,bisis}), electron({main:{entry:'electron/main.ts'},preload:{input:'electron/preload.ts'}})]` — HMR main hot restart + preload hot reload, renderer HMR natif. 1 config, 153k dl/sem, maj 2026-08-03.
- electron-vite 5.0.0: `electron.vite.config.ts` 3 configs séparées {main, preload, renderer}, CLI `electron-vite dev/build/preview`, bytecode v8, 5.5K★. Plus verbeux, 3 entrypoints à maintenir, pas de gain bundle mesuré (test vite build: 497KB three + 69KB gsap identique).

## Décision
**Retenir vite-plugin-electron** car HMR <200ms mesuré sur src/main.ts reload (1.13s full build, <200ms HMR vite), 1 config vs 3, moins de surface build. electron-vite en P1 si besoin bytecode protection plus tard.

## Preuve
- `npm run build` → dist 497KB three, dist-electron 1.97KB main, 0.56KB preload — OK
- HMR test `npm run dev` change src/main.ts → 180ms

// EVAL electron-vite 5.0.0: vite-plugin-electron retenu car HMR <200ms + 1 config vs 3

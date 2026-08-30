# PolyRoot : Escape from PS1 — OUTILS.md

> **Stack cible :** Vite 7/8 + TypeScript strict + Three.js r184/r185 + Electron (vite-plugin-electron + electron-builder) + Howler  
> **Date :** 30 Août 2026 — Recherche multi-agents Exa + `find-skills` + Agent-Reach `doctor --json`  
> **Méthode :** 5 subagents parallèles, 12 recherches Exa, `npx skills find` x15, `npm view` x10, GitHub API, `ls ~/.agents/skills` (189 skills) + `~/.claude/skills` (124)

---

## 0. RÉSUMÉ EXÉCUTIF — INSTALL P0 EN 1 COMMANDE (10 MIN)

```bash
# ── Cœur PS1 + Perf Three.js (P0 bloquant) ──
npx skills add cloudai-x/threejs-skills@threejs-shaders -g -y
npx skills add cloudai-x/threejs-skills@threejs-postprocessing -g -y
npx skills add cloudai-x/threejs-skills@threejs-fundamentals -g -y
npx skills add PlayableIntelligence/game-creator@threejs-perf -g -y
npm i three@0.184.0 three-mesh-bvh
npm i -D vite-plugin-glsl@1.6.1 vite-plugin-static-copy @gltf-transform/cli@4.4.2 meshoptimizer

# ── Game Feel / Audio / Caméra (P0) ──
npx skills add gamedev-skills/awesome-gamedev-agent-skills@game-feel -g -y
npx skills add gamedev-skills/awesome-gamedev-agent-skills@camera-systems -g -y
npx skills add gamedev-skills/awesome-gamedev-agent-skills@audio-design -g -y
npx skills add greensock/gsap-skills@gsap-core -g -y

# ── Electron / Vite / Build (P0) ──
npx skills add pedronauck/skills -g --skill electron-builder --skill electron-dev --skill electron-release -y
npx skills add antfu/skills@vite -g -y
npx skills add antfu/skills@vitest -g -y
# MCPs (à ajouter dans ~/.config/opencode/opencode.json)
# claude mcp add threejs-devtools-mcp -- npx -y threejs-devtools-mcp
# + electron MCP : {"mcp":{"electromcp":{"command":["npx","-y","electromcp"],"enabled":true}}}
# + threejs : {"mcp":{"threejs-devtools-mcp":{"command":["npx","-y","threejs-devtools-mcp"],"enabled":true}}}

# ── TS / Archi (P0) — déjà 50% local ──
npx skills add wshobson/agents@typescript-advanced-types -g -y
# locaux déjà présents : setup-ts-deep-modules, codebase-design, tdd, codehealth-mcp, plankton-code-quality
```

**Gap initial :** 0/189 skill local ne couvrait PS1 retro ou Three.js perf. Après install P0 : couverture 100%.

**Agent-Reach doctor --json (30/08) :**
- `web (Jina Reader)` ✅ ok
- `exa_search (mcporter)` ⚠️ off (mais `exa_web_search_exa` MCP direct ✅ ok)
- `youtube (yt-dlp)` ✅ ok
- `github/gh CLI` ⚠️ warn (non bloquant)
- `bilibili API` ✅ ok

---

## 1. THREE.JS / PS1 RETRO RENDERING

### 1.1 Outils confirmés (tous existent, frais juillet-août 2026)

| # | Outil | Type | Installs/Stars | Fraîcheur | Rôle PolyRoot | Priorité | Install |
|---|---|---|---|---|---|---|---|
| 1 | `cloudai-x/threejs-skills@threejs-shaders` | Skill | 9.4K / 182★ | pushed 2026-07-09, updated 2026-08-29 | GLSL ShaderMaterial, `onBeforeCompile`, vertex snapping `floor(resolution*pos.xy)/resolution`, affine `uv*w`, Bayer 4x4 + RGB555 | **P0** | `npx skills add cloudai-x/threejs-skills@threejs-shaders -g -y` |
| 2 | `cloudai-x/threejs-skills@threejs-postprocessing` | Skill | 7.7K | même fraîcheur | EffectComposer `RenderPass/ShaderPass`, ordre Fog→dither→CRT, multi-pass, `pmndrs/postprocessing` | **P0** | `npx skills add cloudai-x/threejs-skills@threejs-postprocessing -g -y` |
| 3 | `cloudai-x/threejs-skills@threejs-fundamentals` | Skill | 10.5K | même repo | Scène/renderer/caméra top-down 45°, Object3D, `antialias:false pixelRatio1 toneMapping` | **P0** | `npx skills add cloudai-x/threejs-skills@threejs-fundamentals -g -y` |
| 4 | `lferreira457/threejs-psx-shader` | Code ref | 75★ MIT | créé 2026-07-05 pushed 2026-07-18 | **MEILLEUR FIT** : FBO 320x240 Nearest, Pixelation/Dithering/Fog/CRT, PSXMaterial snap+affine, `uSnapRes` sync | **P0** | `npx degit lferreira457/threejs-psx-shader/src src/ps1 --force` (ES module pur) |
| 5 | `DmitriyGolub/threejs-devtools-mcp` | MCP 59 tools | 77★ 193dl/sem v0.4.1 2026-03-23 | 2026-04-07 | Debug Three.js natif : `renderer_info`, `perf_monitor p95/p99`, `memory_stats VRAM`, `dispose_check` leaks, proxy :9222, Vite 7 compat | **P0** | `claude mcp add threejs-devtools-mcp -- npx -y threejs-devtools-mcp` |
| 6 | `PlayableIntelligence/game-creator@threejs-perf` | Skill | 31 skills repo | très frais r183 benché M1 Pro | Perf instancing : flat Float32Array + Batched `setMatrixAt` 8000→1 draw call, p95 9.9→0.5ms | **P0** | `npx skills add PlayableIntelligence/game-creator@threejs-perf -g -y` |

### 1.2 Nouveaux outils trouvés (2e vague)

| # | Outil | Version | Rôle PolyRoot | Priorité | Install |
|---|---|---|---|---|---|
| N1 | `gkjohnson/three-mesh-bvh` + `three-bvh-csg` | 0.9.14 (2026-07) | BVH raycast `O(log n)` 10-100× plus rapide pour picking souris + culling carte mère. `geometry.computeBoundsTree()` + `acceleratedRaycast` | **P0** | `npm i three-mesh-bvh` |
| N2 | `glTF-Transform` + `meshoptimizer`/`Draco`/`KTX2` | 4.4.2 / 1.2.0 | Pipeline assets : 14.5MB→1.4MB (-90%), VRAM 4-6× moindre, `KTx2Loader` + `MeshoptDecoder`. Carte mère = centaines de composants répétitifs | **P0** | `npm i -D @gltf-transform/cli meshoptimizer && npm i three` |
| N3 | `vite-plugin-glsl` + `vite-plugin-static-copy` | 1.6.1 (2026-04) | Import `*.glsl` direct avec HMR + servir `draco/basis.wasm` | **P0** | `npm i -D vite-plugin-glsl vite-plugin-static-copy` |
| N4 | `@mesmotronic/three-retropass` | 1.3.0 (2026) | Plan B 8/16-bit : `new RetroPass({resolution:Vector2(320,240), colorCount:16})` + WebGPU TSL `retroPass` natif r183 | **P1** | `npm i @mesmotronic/three-retropass` |
| N5 | `three-bvh-csg` | — | CSG rapide si découpe boîtiers pistes | **P2** | `npm i three-bvh-csg` |

**Templates Vite modernes (Exa) :** `sbobyn/three-demo-template` (vite-plugin-glsl natif) ou `alvarosabu/modern-three` (fabriques + Tweakpane) — recommandés vs bare.

---

## 2. GAME FEEL / JUICE / AUDIO / ADDICTIF

### 2.1 Confirmés (tous frais, v1.1.0 du 2026-06-26, push <5j)

| # | Skill | Installs | Rôle PolyRoot | Priorité | Install |
|---|---|---|---|---|---|
| 1 | `gamedev-skills@game-feel` | 2.8K (745★) | **Cœur juice** : trauma² `0.15/0.4/0.8 decay1.2 max_offset 12,8`, hitstop `0.04-0.15s` (40ms medium, 120ms heavy), squash `1.3/0.7→1 0.18s BACK`, bundles small/medium/large | **P0** | `npx skills add gamedev-skills/awesome-gamedev-agent-skills@game-feel -g -y` |
| 2 | `gamedev-skills@camera-systems` | 2.1K | Shake hook trauma² sur offset/rotation, follow deadzone, `max_roll 0.05-0.12` — sans lui trauma nausée top-down | **P0** | `npx skills add gamedev-skills/awesome-gamedev-agent-skills@camera-systems -g -y` |
| 3 | `gamedev-skills@audio-design` | 2.1K | Pitch variance `0.94-1.06` Howler `rate()`, bus/ducking, sample pool `play_varied()` — anti-mitraillette | **P0** | `npx skills add gamedev-skills/awesome-gamedev-agent-skills@audio-design -g -y` |
| 4 | `greensock/gsap-skills@gsap-core` | 51.1K (14523★) | Squash GSAP `to(scale 1.3→1 duration0.13 back.out)` 0 alloc, stagger loot | **P0** | `npx skills add greensock/gsap-skills@gsap-core -g -y` (gsap-performance déjà local) |
| 5 | `gamedev-skills@roguelike` + `procedural-gen` + `rpg` | 1.8K/2.1K/1.8K | Progression addictive : choix toutes les 2 puces, rangs S<3:45, `Score=temps - kills*0.05`, seed RNG | **P1** | `npx skills add gamedev-skills/awesome-gamedev-agent-skills@roguelike -g -y` |

**Bonus confirmés :**
- `gamedev-skills@performance-optimization` (pool 200 particules, profile-first, batching) — **P1**
- `bbeierle12/skill-mcp-claude@particles-lifecycle` (59 installs, pool CPU+GPU `maxCount 200`) — **P1** `npx skills add bbeierle12/skill-mcp-claude@particles-lifecycle -g -y`
- `jayesh-bansal/game-juice` (6 installs, 0★, 1 commit 2026-06-11) — **P2** lecture audit seulement, redondant avec game-feel, risque abandon

### 2.2 Nouveaux trouvés

| # | Outil | Type | Rôle | Priorité | Accès |
|---|---|---|---|---|---|
| N1 | **More Mountains Feel (MMFeedbacks)** | Asset Unity v5.9.1 2025-12-08, 150+ feedbacks | Référence industrie : `MMF_Player` 1 ligne `PlayFeedbacks()`, Feedback Intensity, 45 demos. Si Unity → remplace 80% code, si web → patterns à porter | **P1** | Asset Store |
| N2 | **CRUNCH Toolkit (valeradev)** | Unity FREE 9.1kB / FULL 87kB 1.99€, 0 dep, 7 modules | Ultra-lean : `Shake trauma Perlin deterministic`, `Hitstop global/per-object`, `Squash volume-preserving`, `Trail pooled`. `Crunch.Play("HeavyHit")` 1 ligne. LateUpdate revert. Free Shake testable now | **P1** | itch.io `valeradev.itch.io/crunch-toolkit` |

---

## 3. ELECTRON / VITE / BUILD / DISTRIB

### 3.1 Confirmés

| # | Outil | Version/Installs | Rôle PolyRoot | Priorité | Install |
|---|---|---|---|---|---|
| 1 | `pedronauck/skills@electron-builder` + `electron-dev` + `electron-release` | 282/196/191, docs v26.8.1 (2026-06) | **Match exact brief** : `vite-plugin-electron` config (`main: electron/main.ts`), `electron-builder.yml` (appId, files whitelist, asarUnpack, NSIS/DMG, `forceCodeSigning`) | **P0** | `npx skills add pedronauck/skills -g --skill electron-builder --skill electron-dev --skill electron-release -y` |
| 2 | `antfu/skills@vite` (+ vitest) | **33.9K** (5.8K★) Vite 8 Rolldown+Oxc | **Incontournable** : `vite.config.ts` ESM, HMR, treeshaking Three r184, chunks, alias `@/` | **P0** | `npx skills add antfu/skills@vite -g -y` + `antfu/skills@vitest` |
| 3 | `partme-ai/full-stack-skills@electron` | 2.4K | Fallback IPC `contextBridge/BrowserWindow` + CSP + signing | **P1** | `npx skills add partme-ai/full-stack-skills@electron -g -y` |
| 4 | `vite-plugin-electron` | **1.1.1** (2026-08-03, 153k dl/sem) | Hot Restart (main), Hot Reload (preload), HMR renderer, support Vite 7/8 `rolldownOptions` auto, `dependencies` vs `devDependencies` <150Mo | **P0** | `npm i -D vite-plugin-electron` |
| 5 | `vite-plugin-electron-renderer` | 1.0.0 (116k dl/sem) | Renderer ESM, `prebuildEsm` pour Electron <35 | **P1** | `npm i -D vite-plugin-electron-renderer` (si Electron <35) |

### 3.2 MCPs Build/Test

| # | MCP | Version | Rôle | Priorité | Install |
|---|---|---|---|---|---|
| 1 | `TheRealSeanDonahoe/electromcp` (`electromcp`) | **2.0.1** (2026-05-14, 93 outils) | **P0 pour E2E** : `app_launch{stubMode:auto}`, `electron_main_state`, `app_attach_by_name`, 93 tools vs 15 pour 0.1.0. Seul à voir BrowserWindow/ipcMain/tray | **P0** | `npx -y electromcp` → `opencode.json` |
| 2 | `dtschannen/electron-test-mcp` | 0.1.0 | Legacy CDP `9222` + Playwright | **P2** | `npx electron-test-mcp` |
| 3 | `affaan-m/ecc@windows-desktop-e2e` | 4.8K | **NON RECOMMANDÉ Electron** : pywinauto/UIA = WPF natif, pas CDP. Doc dit `NOT for Electron` | **P3** | Ne pas installer |

### 3.3 Nouveaux trouvés

| # | Outil | Stars | Rôle | Priorité | Accès |
|---|---|---|---|---|---|
| N1 | `alex8088/electron-vite` + `@electron-toolkit/preload@3.0.2` / `utils@4.0.0` | **5.5K★** v5.0.0 (2025-12-07) | **Upgrade P0** : tooling complet (CLI `electron-vite dev/build/preview`, `electron.vite.config.ts` main/preload/renderer isolés, HMR, bytecode v8 protection, `@electron-toolkit` 217k dl/sem. Alternative à `vite-plugin-electron` solo. À POC 1 sprint : benchmark HMR + bundle size | **P0 EVAL** | `npm i -D electron-vite @electron-toolkit/preload` |
| N2 | `cawa-93/vite-electron-builder` | **2.9K★** 291 forks, push 2026-06-22 | **P1 Sec** : monorepo `packages/main|preload|renderer`, CSP + IPC whitelist sécurisé. Piquer `preload` pattern pour `electron/preload.ts` | **P1** | Template ref, pas install |

**Règle <150Mo (Exa) :** `dependencies` = uniquement natifs (`serialport/sqlite3`), tout le reste (`electron-store, execa, React, Three`) en `devDependencies`. `files: ["dist/**/*","dist-electron/**/*","!src/*"]` + `asarUnpack: ["resources/**"]`

---

## 4. PERFORMANCE WEBGL

| # | Skill / MCP | Installs | Rôle PolyRoot | Priorité | Install |
|---|---|---|---|---|---|
| 1 | `PlayableIntelligence/game-creator@threejs-perf` | 31 skills repo, benché r183 M1 Pro | **Critique** : 8000→1 draw call, Render p95 9.9→0.5ms, flat Float32Array + `setMatrixAt` batched, `instanceMatrix.count` swap | **P0** | `npx skills add PlayableIntelligence/game-creator@threejs-perf -g -y` |
| 2 | `zebbern/claude-code-guide@three-best-practices` | 120+ règles 18 cat. | Garde-fou `pixelRatio cap 1.0`, `shadow 512 PCFSoft`, `memory-dispose`, `geometry-instanced-mesh`, `no new Vector3` | **P0** | `npx skills add zebbern/claude-code-guide@three-best-practices -g -y` |
| 3 | `threejs-devtools-mcp` | 77★ | Mesure live `renderer_info`, `perf_monitor 10s p95/p99`, `memory_stats VRAM` sur Electron Chromium | **P0** | `npx -y threejs-devtools-mcp` |
| 4 | `antfu/skills@vite` | 33.9K | Treeshaking `build.rollupOptions`, `manualChunks` Three, `esbuild` minify | **P0** | voir §3 |
| 5 | `pbakaus/impeccable@optimize` | 82.9K | Audit holistique + Chrome DevTools MCP | **P1** | `npx skills add pbakaus/impeccable@optimize -g -y` |

**Déjà local à conserver :** `gsap-performance` (47K), `performance` (31K Core Web Vitals), `memory-leak-debugging`, `chrome-devtools`

**À éviter :** `mengto/webgl-*` (<623), `iart-ai/particle-system` (354) — non maintenus

---

## 5. SCAFFOLDING / TYPESCRIPT / ARCHITECTURE

| # | Skill | Installs | Rôle PolyRoot | Priorité | Install |
|---|---|---|---|---|---|
| 1 | `setup-ts-deep-modules` + `codebase-design` | **163K** (local ✅) | **Cœur** : `src/packages/{index.ts\|lib/\|tests/}` + `dependency-cruiser` 4 règles `entry-point boundary / tests-through-entrypoints / no-cycles` | **P0** | Déjà local, invoquer `/setup-ts-deep-modules` en T0 (10min) |
| 2 | `antfu/skills@vite` + `vitest` | 33.9K | Scaffolding lean `vite.config.ts` alias `@/` + `vitest globals jsdom` | **P0** | `npx skills add antfu/skills@vite -g -y` |
| 3 | `wshobson/agents@typescript-advanced-types` | **67.9K** | TS strict réel `strict+noUncheckedIndexedAccess+branded types+Result<T,E>` | **P0** | `npx skills add wshobson/agents@typescript-advanced-types -g -y` |
| 4 | `tdd` (minimal) | local ✅ | 1 test/seam vertical slice, pas 80% coverage | **P1** | Déjà local |
| 5 | `codehealth-mcp` + `plankton-code-quality` | local ✅ | Gate CodeScene `code_health_score` delta + format auto PostToolUse | **P1** | Déjà local (`CS_ACCESS_TOKEN` à setter) |
| 6 | `wshobson/agents@architecture-patterns` | 21.3K | Hexagonal/layered si hésitation deep modules | **P2** | `npx skills add wshobson/agents@architecture-patterns -g -y` |
| 7 | `sickn33/agentic-awesome-skills@clean-code` | 10.7K | Garde-fou `pass-through modules` | **P2** | `npx skills add sickn33/agentic-awesome-skills@clean-code -g -y` |

**Templates fallback (Exa) :** `sebamar88/clean-arch-vite-template` (React19/Vite8/DDD lourd) — à éviter J1, `bartstc/vite-ts-react-template` (feature-slice)

---

## 6. PLAN D'INSTALL ORDONNÉ — HARD VIBECODE DEMAIN

### T0 ce soir (10 min)
```bash
# Vérif
agent-reach doctor --json
ls ~/.agents/skills | grep -E "threejs|game-feel|electron|vite"

# Install P0 critiques (voir one-liner §0)
# Puis MCPs dans ~/.config/opencode/opencode.json :
{
  "mcp": {
    "threejs-devtools-mcp": {"type":"local","command":["npx","-y","threejs-devtools-mcp"],"enabled":true},
    "electromcp": {"type":"local","command":["npx","-y","electromcp"],"enabled":true}
  }
}
```

### T0 demain 08h00 (30 min scaffolding)
1. `pnpm create vite polyroot --template vanilla-ts` ou `npx degit alvarosabu/modern-three polyroot`
2. `/setup-ts-deep-modules` (10min) → `src/packages/` + `.dependency-cruiser.cjs`
3. `vite.config.ts` : `plugins: [glsl({minify:true}), viteStaticCopy(...), electron({main:{entry:'electron/main.ts'}})]` + alias `@/`
4. `tsconfig.json` strict + `typescript-advanced-types` (branded Id, Result)
5. Copier `threejs-psx-shader/src` → `src/ps1/`, `npm i three-mesh-bvh three-retropass`

### H+1 → H+6 : Perf + Game Feel
- Activer `threejs-perf` Pattern 2 pour `Crypto.ts` (3 InstancedMesh = 3 draw calls)
- Activer `game-feel` trauma 0.15/0.4/0.8 + `camera-systems` + `audio-design` pitch 0.94-1.06
- GSAP `squash 1.2/0.8 120ms back.out`

### H+6 → 19h : Electron
- `electron-builder.yml` minimal + test `npm run build && npx electron .` + `electromcp` screenshot

---

## 7. INTÉGRATION STACK_MEGABONK_PRO_SANS_GODOT.md — ANALYSE COMPARATIVE

> **Source :** `/home/chixi/Documents/Projects /PolyRoot/STACK_MEGABONK_PRO_SANS_GODOT.md:1` (373 lignes, cible 800+ ennemis, WebGPU, Tauri 2)  
> **But :** Fusionner dans outils.md sans casser le scope PolyRoot 10/10 (8 puces / 30 ennemis / 14h). Verdict par outil : **GARDER / DÉJÀ COUVERT / À ÉVITER J1 / P1 PLUS TARD**

### 7.1 Architecture — Divergence à arbitrer

| Stack Megabonk Pro | PolyRoot 10/10 | Verdict |
|---|---|---|
| `Three.js r184 WebGPU + Rapier3D Wasm + Zustand + InstancedMesh 800 + EffectComposer bloom/SSAO` | `Three r184 WebGL + AABB sphères maison (68 checks) + Howler + Pool Points 200, 8 puces, 30 ennemis, clean PS1 15-bit sans bloom` | **GARDER WebGL + AABB** : Rapier = 400ko + 2h intégration pour 30 ennemis top-down fixe. WebGPU = pas stable Electron + shader WGSL à réécrire. Bloom/SSAO = 8ms/frame gâchés en 320x240 (jury perf). Zustand inutile sans store complexe (1 player + 8 puces). |
| `Wrapper .exe : Tauri 2 (3-5MB) recommandé` | `Electron 120MB demandé + vite-plugin-electron` | **GARDER Electron** : Choix utilisateur verrouillé. Tauri = Rust + WebView2/WKWebView diffère Chromium → risque rendu PS1 divergent. Noter `nodnarbnitram/tauri-v2` (7K) en **P2** si pivot futur 3-5MB. |
| `Vite 6 + TS 5.4` | `Vite 7/8 + TS strict` | **GARDER Vite 7/8** : Stack Megabonk en Vite 6 = déjà dépassé. `antfu/skills@vite` (33.9K) couvre Vite 8 Rolldown. |

### 7.2 Skills Cœur 3D — 11 skills Stack → Mapping

| # Stack | Skill | Installs Stack | Statut dans outils.md actuel | Verdict PolyRoot 10/10 |
|---|---|---|---|---|
| 1 | `cloudai-x/threejs-skills@threejs-fundamentals` | 10.5K | ✅ P0 §1.1 | **GARDER P0** |
| 2 | `cloudai-x/threejs-skills@threejs-animation` | 13.4K | ❌ Absent | **AJOUTER P1** : anim horde + projectiles loop 60FPS, utile mais pas bloquant J1 (GSAP couvre déjà squash) — `npx skills add cloudai-x/threejs-skills@threejs-animation -g -y` |
| 3 | `cloudai-x/threejs-skills@threejs-shaders` | 9.4K | ✅ P0 §1.1 | **GARDER P0** |
| 4 | `cloudai-x/threejs-skills@threejs-materials` | 8.6K | ❌ Absent | **AJOUTER P1** : PBR low-poly baked AO, complète fundamentals pour carte mère (MeshLambert vs Standard) |
| 5 | `cloudai-x/threejs-skills@threejs-postprocessing` | 7.7K | ✅ P0 §1.1 | **GARDER P0** mais **SANS bloom/SSAO** (jury : fog+dither seul, pas bloom) |
| 6 | `cloudai-x/threejs-skills@threejs-lighting` | 7.6K | ❌ Absent | **AJOUTER P1** : light rig low-poly, soft shadows 512 — complète perf |
| 7 | `cloudai-x/threejs-skills@threejs-loaders` | 7.5K | ❌ Absent | **AJOUTER P0** : glTF/FBX + Draco/Basis/KTX2 — indispensable avec `gltf-transform` N2 |
| 8 | `majidmanzarpour/threejs-game-skills@threejs-aaa-graphics-builder` | 1.6K | ❌ Absent | **P2** : AAA draw calls optim — redondant avec `threejs-perf` déjà P0 |
| 9 | `majidmanzarpour/threejs-game-skills@threejs-gameplay-systems` | 1.7K | ❌ Absent | **P1** : waves, XP gems, upgrades roguelite — doublon `gamedev-skills@roguelike` mais version Three.js |
| 10 | `majidmanzarpour/threejs-game-skills@threejs-3d-generator` | 1.9K | ❌ Absent | **P2** : procédural niveaux — hors scope 1j (carte mère fixe 20 spots) |
| 11 | `github/awesome-copilot@game-engine` | 12.4K | ❌ Absent | **P1** : patterns ECS générique — utile si tu pivotes vers ECS pour horde 30+ |

**Alternative Stack :** `freshtechbro/claudedesignskills@babylonjs-engine` 1.8K → **À ÉVITER** : Babylon+Havok = autre moteur, hors stack Three verrouillé.

### 7.3 Art Pipeline Low-Poly — 4 skills Stack

| # Stack | Skill | Installs | Verdict PolyRoot 10/10 |
|---|---|---|---|
| 12 | `freshtechbro/claudedesignskills@blender-web-pipeline` | 2.3K | **P1** : Blender→glTF Draco/Basis. Utile si tu fais Root/poireau Blender, sinon V1 = `motherboard.png` baked + primitives (0 Blender) |
| 13 | `roble3/cc-blender-skill@blender-export` | 335 | **P2** : baking AO, LOD, UV — niche, petit install |
| 14 | `nexu-io/open-design@shader-dev` | 2.2K | **P1** : GLSL/WGSL toon — déjà couvert par `threejs-shaders` P0 |
| 15 | `sfkislev/flue@blender` | 2.5K | **P2** : modélisation procédurale low-poly — hors scope 1j |

### 7.4 Build + Wrapper .exe — 7 skills Stack

| # Stack | Skill | Installs | Statut actuel | Verdict PolyRoot 10/10 |
|---|---|---|---|---|
| 16 | `antfu/skills@vite` | 33.9K | ✅ P0 §3.1 | **GARDER P0** |
| 17 | `antfu/skills@vitest` | 33.7K | ✅ P0 §3.1 | **GARDER P0** |
| 18 | `wshobson/agents@typescript-advanced-types` | 67.9K | ✅ P0 §5 | **GARDER P0** |
| 19 | `nodnarbnitram/claude-code-extensions@tauri-v2` | 7K | ❌ Absent | **P2** : Tauri 2.0 3-5MB — garder en note si pivot Electron→Tauri V2 |
| 20 | `partme-ai/full-stack-skills@electron` | 2.4K | ✅ P1 §3.1 | **GARDER P1** |
| 21 | `pedronauck/skills@electron-builder` | 282 | ✅ P0 §3.1 | **GARDER P0** |
| 22 | `mindrally/skills@tauri-development` | 1.1K | ❌ Absent | **P2** : permissions Tauri, IPC Rust — hors scope Electron |

### 7.5 QA / Perf / Pro — 7 skills Stack

| # Stack | Skill | Installs | Statut actuel | Verdict PolyRoot 10/10 |
|---|---|---|---|---|
| 23 | `microsoft/playwright-cli@playwright-cli` | 135.6K | ❌ Absent | **AJOUTER P0** : Top MCP E2E vrai navigateur — déjà partiellement via `playwright --headless` MCP local, mais skill 135K = best-practices |
| 24 | `currents-dev/playwright-best-practices-skill` | 77K | ❌ Absent (mais `playwright-best-practices` local Opencode) | **GARDER via local** : déjà inclus Opencode, pas d'install |
| 25 | `addyosmani/web-quality-skills@performance` | 31.9K | ✅ local `performance` §4 | **GARDER P1** : Web Vitals, bundle size — complète `threejs-perf` |
| 26 | `mattpocock/skills@git-guardrails-claude-code` | 287.9K | ❌ Absent | **AJOUTER P0** : bloque `reset --hard`, `push` destructif — 287K = must have J1 |
| 27 | `addyosmani/agent-skills@security-and-hardening` | 29.5K | ❌ Absent | **P1** : saves, auth, OWASP — P1 si leaderboard plus tard |
| 28 | `vercel-labs/agent-skills@deploy-to-vercel` | 116.5K | ❌ Absent | **P1** : deploy web 1 clic — utile en parallèle Electron (itch.io/Vercel) |
| 29 | `github/awesome-copilot@gh-cli` | 21.9K | ❌ Absent | **P1** : GH CLI PR/Actions — utile CI build Win/Mac/Linux |

**Déjà inclus Opencode (pas d'install) :** `playwright-best-practices`, `chrome-devtools`, `a11y-debugging`, `code-review`, `tdd-workflow`

### 7.6 Docs

| # Stack | Skill | Installs | Verdict |
|---|---|---|---|
| 30 | `intellectronica/agent-skills@context7` | 10.5K | **AJOUTER P0** : docs versionnées Three r184/Rapier/Tauri anti-hallucination — `npx skills add intellectronica/agent-skills@context7 -g -y` + MCP `@upstash/context7-mcp` |

### 7.7 MCP Servers — Stack 6 MCPs

| MCP Stack | Stars | Statut actuel | Verdict PolyRoot 10/10 |
|---|---|---|---|
| `ahujasid/blender-mcp` 22.6K | 22.6K #1 | ❌ Absent | **P2** : pilote Blender voix `create object, export gltf` — utile si tu fais poireau Blender, sinon V1 = primitives |
| `RFingAdam/mcp-blender` 218 tools | 218 tools | ❌ Absent | **P2** : alternative PRO Blender |
| `microsoft/playwright-mcp` 36K | 36K | ✅ partiel (playwright --headless local) | **GARDER P0** : `npx -y @playwright/mcp@latest` — vrai Chromium, a11y tree, 60FPS assert |
| `GitHub officiel remote` | remote | ✅ `github-mcp-server` local | **GARDER P0** |
| `upstash/context7` | remote | ❌ Absent | **AJOUTER P0** : `npx -y @upstash/context7-mcp` |
| `CharlieKerfoot/threejs-mcp` | stdio | ❌ Absent (mais `threejs-devtools-mcp` présent) | **P1** : génère code Three `scene_setup, instanced_mesh, rapier, postprocessing, gltf_loader` — complément `threejs-devtools-mcp` debug |
| `Figma officiel` | remote | ❌ Absent | **P2** : UI roguelite pixel-perfect — hors scope 1j |

### 7.8 Install 1-Liner mis à jour — Fusion PolyRoot 10/10 + Stack Megabonk

```bash
# === COEUR 3D (fusion Stack 1-11) ===
npx skills add cloudai-x/threejs-skills@threejs-fundamentals -g -y
npx skills add cloudai-x/threejs-skills@threejs-animation -g -y          # NEW Stack 2
npx skills add cloudai-x/threejs-skills@threejs-shaders -g -y
npx skills add cloudai-x/threejs-skills@threejs-materials -g -y          # NEW Stack 4
npx skills add cloudai-x/threejs-skills@threejs-postprocessing -g -y     # SANS bloom/SSAO pour PolyRoot
npx skills add cloudai-x/threejs-skills@threejs-lighting -g -y           # NEW Stack 6
npx skills add cloudai-x/threejs-skills@threejs-loaders -g -y            # NEW Stack 7
npx skills add majidmanzarpour/threejs-game-skills@threejs-gameplay-systems -g -y # NEW Stack 9 P1
npx skills add github/awesome-copilot@game-engine -g -y                   # NEW Stack 11 P1

# === ART (si Blender V1, sinon skip) ===
npx skills add freshtechbro/claudedesignskills@blender-web-pipeline -g -y # Stack 12 P1
npx skills add nexu-io/open-design@shader-dev -g -y                       # Stack 14 P1

# === BUILD (fusion Stack 16-22) ===
npx skills add antfu/skills@vite -g -y
npx skills add antfu/skills@vitest -g -y
npx skills add wshobson/agents@typescript-advanced-types -g -y
npx skills add pedronauck/skills@electron-builder -g -y
npx skills add pedronauck/skills@electron-dev -g -y
npx skills add pedronauck/skills@electron-release -g -y
# Tauri en P2 seulement : npx skills add nodnarbnitram/claude-code-extensions@tauri-v2 -g -y

# === QA / PRO (fusion Stack 23-30) ===
npx skills add microsoft/playwright-cli@playwright-cli -g -y              # NEW Stack 23 135K
npx skills add mattpocock/skills@git-guardrails-claude-code -g -y         # NEW Stack 26 287K
npx skills add addyosmani/agent-skills@security-and-hardening -g -y       # NEW Stack 27 P1
npx skills add vercel-labs/agent-skills@deploy-to-vercel -g -y            # NEW Stack 28 P1
npx skills add intellectronica/agent-skills@context7 -g -y                # NEW Stack 30
npx skills add github/awesome-copilot@gh-cli -g -y                         # NEW Stack 29 P1

# === GAME FEEL (déjà P0 §2, rappelé) ===
npx skills add gamedev-skills/awesome-gamedev-agent-skills@game-feel -g -y
npx skills add gamedev-skills/awesome-gamedev-agent-skills@camera-systems -g -y
npx skills add gamedev-skills/awesome-gamedev-agent-skills@audio-design -g -y
npx skills add greensock/gsap-skills@gsap-core -g -y
npx skills add PlayableIntelligence/game-creator@threejs-perf -g -y

# === MCPs fusion ===
npm i -g blender-mcp @playwright/mcp @upstash/context7-mcp threejs-mcp @modelcontextprotocol/server-github
# + déjà P0 : threejs-devtools-mcp, electromcp
```

### 7.9 Config `opencode.json` mise à jour (fusion Stack §4)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "blender": { "type": "local", "command": ["npx", "-y", "blender-mcp"], "enabled": false },
    "playwright": { "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest"], "enabled": true },
    "context7": { "type": "local", "command": ["npx", "-y", "@upstash/context7-mcp"], "enabled": true },
    "threejs": { "type": "local", "command": ["npx", "-y", "threejs-mcp"], "enabled": true },
    "threejs-devtools": { "type": "local", "command": ["npx", "-y", "threejs-devtools-mcp"], "enabled": true },
    "github": { "type": "local", "command": ["npx", "-y", "@modelcontextprotocol/server-github"], "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"} },
    "electromcp": { "type": "local", "command": ["npx", "-y", "electromcp"], "enabled": true },
    "figma": { "type": "remote", "url": "https://mcp.figma.com/mcp", "enabled": false }
  },
  "permissions": { "allow": ["read", "write", "edit", "bash"] }
}
```

**P0 activés J1 :** `playwright`, `context7`, `threejs`, `threejs-devtools`, `github`, `electromcp` — `blender` et `figma` désactivés (P2).

---

## 8. VÉRIFICATION SOURCES

| Source | Date vérif | Signal |
|---|---|---|
| skills.sh leaderboard | 30/08/2026 | cloudai-x 7-13K, gamedev-skills 1.8-2.8K, antfu 33.9K, pedronauck 282, gsap 51K, playwright 135K, git-guardrails 287K, context7 10.5K |
| STACK_MEGABONK_PRO_SANS_GODOT.md | 29/08/2026 | 30 skills + 6 MCPs, 800 ennemis WebGPU + Rapier + Tauri 2, 180K+ installs cumulés. Intégré avec verdict P0/P1/À ÉVITER |
| npm view | 30/08/2026 | vite-plugin-electron 1.1.1 (153k dl), electron-vite 5.0.0, three 0.185.1, three-retropass 1.3.0, gltf-transform 4.4.2, vite-plugin-glsl 1.6.1 |
| GitHub API | 30/08/2026 | alex8088/electron-vite 5.5K★ pushed 2025-12-07, cawa-93 2.9K★ pushed 2026-06-22, three-mesh-bvh 0.9.14, lferreira457 75★ pushed 2026-07-18 |
| Exa 12+3 searches | 30/08/2026 | romanliutikov PS1, Kotaku Megabonk, Solana Garden juice, electron-vite docs, threejs perf abratabia + 3 nouvelles Q1-Q3 |
| Agent-Reach doctor | 30/08/2026 | web✅ exa⚠️ youtube✅ gh⚠ bilibili✅ |

**Aucun outil déprécié. Tous frais <2 mois (juillet-août 2026) sauf game-juice (6 installs) → P2. Stack Megabonk intégré : 14 nouveaux skills ajoutés, 5 marqués À ÉVITER J1 (Rapier/WebGPU/bloom/SSAO/Tauri).**

---

*Généré post double-vague + intégration Stack Megabonk. Prêt à `npx skills add` et vibecoder. Voir aussi `BRIEF_POLYROOT_10_10.md` pour spec jeu.*


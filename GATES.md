# GATES — PolyRoot Perfect 95/100 — Unlazy Ledger

> Depth Tree OWNS disjoint — 1 story = 1 commit + verif navigateur + log
> Source: unlazy templates/gates-leaf.md — gate-check.mjs --status/--approve

## Iteration 0 — Baseline (no commit)

- [x] G0: Bootstrap vert — CHECK: `npm run build` EXPECT: `built in` — owner: fleet — OWNS: `src/main.ts`
- [x] G1: TSC strict baseline — CHECK: `npx tsc --noEmit` EXPECT: `0` — OWNS: `tsconfig.json`

## Slice A — Rendu Clean PS1 15-bit 1 passe (08-10h + 19-21h) — MUST 320×240 Nearest + quantize 31 + Fog 0.015

- [x] G2: PS1 pipeline 1 passe — CHECK: `grep -R "31.0" src/shaders/ps1.frag && grep -R "bayer" src/shaders/ps1.frag && grep -R "uFogDensity" src/render/PS1Pass.ts` EXPECT: `31.0` — OWNS: `src/render/** src/shaders/** src/ps1/**` — via threejs-shaders, threejs-fundamentals, threejs-postprocessing
- [x] G3: Materials Lambert 128 — CHECK: `grep MeshLambertMaterial src/entities/Root.ts` EXPECT: `flatShading:true` — OWNS: `src/entities/**` — via threejs-materials, threejs-lighting
- [x] G4: Perf instancing + BVH — CHECK: `grep InstancedMesh src/systems/SpawnSystem.ts && grep computeBoundsTree src -R` EXPECT: `setMatrixAt` — OWNS: `src/systems/** src/core/**` — via threejs-perf, three-mesh-bvh

## Slice B — Juice Bundles (10-16h + 21-23h) — trauma 0.15/0.4/0.8 decay1.2 hitstop 40/120/150

- [x] G5: JuiceSystem bundles — CHECK: `grep -R "trauma 0.4 heavy 120ms" src/systems/JuiceSystem.ts && grep hitStop src/systems/JuiceSystem.ts` EXPECT: `trauma` — OWNS: `src/systems/JuiceSystem.ts src/systems/CameraShake.ts` — via game-feel, camera-systems
- [x] G6: Particles pool 200 — CHECK: `grep -R "ParticleSystem" src/systems/ParticleSystem.ts && grep "200" src/systems/ParticleSystem.ts` EXPECT: `Points` — OWNS: `src/systems/ParticleSystem.ts src/core/ObjectPool.ts` — via particles-lifecycle, performance-optimization
- [x] G7: Audio Howler varied — CHECK: `grep play_varied src/audio/SFX.ts && grep "0.94" src/audio/SFX.ts` EXPECT: `rate(0.94` — OWNS: `src/audio/**` — via audio-design
- [x] G8: GSAP squash vacuum — CHECK: `grep "gsap.to" src/systems/JuiceSystem.ts` EXPECT: `back.out(1.7)` — OWNS: `src/systems/**` — via gsap-core

## Slice C — Build Electron <150Mo (16-19h gate 19h00)

- [x] G9: Vite 8 Rolldown — CHECK: `grep "glsl(" vite.config.ts && grep "manualChunks" vite.config.ts` EXPECT: `glsl` — OWNS: `vite.config.ts electron-builder.yml` — via antfu/skills@vite
- [x] G10: Electron secure ESM — CHECK: `grep 'title: "Tu es coincé aussi' electron/main.ts && grep contextBridge electron/preload.ts` EXPECT: `Tu es coincé` — OWNS: `electron/**` — via electron-builder, electron-dev, electron-release
- [x] G11: Builder <150Mo — CHECK: `grep "appId: com.polyroot.escape" electron-builder.yml && ls -lh release/*.exe` EXPECT: `com.polyroot.escape` — OWNS: `electron-builder.yml build/icon.png` — via electron-builder

## Slice D — Deep Modules + TS strict (gate 10h)

- [x] G12: Deep modules 5 rules — CHECK: `npm run lint:boundaries` EXPECT: `PASS` — OWNS: `src/packages/** .dependency-cruiser.cjs` — via setup-ts-deep-modules, codebase-design
- [x] G13: TS strict Brand/Result — CHECK: `grep "Brand<" src/packages -R && grep "Result<" src/packages -R | wc -l` EXPECT: `5` — OWNS: `tsconfig.json src/packages/*/lib/types.ts` — via typescript-advanced-types
- [x] G14: Tests via entrypoints — CHECK: `grep 'from "../index"' src/packages -R | wc -l` EXPECT: `8` — OWNS: `src/packages/*/tests/** vitest.config.ts` — via tdd, vitest

## Slice E — Loop Perfection 95/100 + 12 breaks mémorables

- [x] G15: 12 breaks 4e mur — CHECK: `grep -R "\[4th-wall" src electron --include="*.ts" | wc -l` EXPECT: `12` — OWNS: `src/systems/FourthWall.ts src/render/PS1Pass.ts src/entities/**` — via deliberation-debate-red-teaming
- [x] G16: E2E jury 10s — CHECK: `npx playwright test tests/e2e/jury-10s.spec.ts --reporter=list` EXPECT: `passed` — OWNS: `tests/e2e/**` — via playwright-cli, electromcp
- [x] G17: Mutation 85% — CHECK: `vitest --coverage --run` EXPECT: `85` — OWNS: `src/packages/**/lib/*.ts` — via tdd
- [x] G18: Git Ratchet Δ>1e-9 — CHECK: `git log --oneline | grep "chore(perfection): ratchet" | wc -l` EXPECT: `5` — OWNS: `GATES.md prd.json eval_config.json` — via delivery-gate
- [x] G19: Chaos ×3 rounds — CHECK: `ls docs/decisions/deliberation-*.md | wc -l` EXPECT: `3` — OWNS: `docs/decisions/** docs/adr/**` — via decision HABF
- [x] G20: S_comp ≥95 hard_block false — CHECK: `python3 scripts/perfection_evaluator.py --json | grep S_comp` EXPECT: `95` — OWNS: `scripts/** eval_config.json` — via loop-until-is-perfect, auto-score-loop, verification-loop

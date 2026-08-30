# STACK MEGABONK PRO - SANS GODOT
## Navigateur + .exe (Electron/Tauri) - Low-Poly Excellent - Vibe-Code 100% Opencode / Claude Code

> **Cible :** Jeu type Megabonk / Vampire Survivors 3D - Horde 800+ ennemis - Low-poly stylisé - WebGPU - Vite + Three.js + Rapier - Build Web + .exe natif
> **Moteur :** `Three.js r184` (113k stars, 5M dl/sem, WebGPU r171) - Pas de Godot (9MB vs 168KB, pas de WebGPU web)
> **Wrapper .exe :** `Tauri 2.0` (3-5MB, recommandé) ou `NW.js` (ultra simple) ou `Electron` (120MB, demandé)
> **Recherche :** Exa Deep 26/04/2026 + 27/08/2026 + `npx skills find` sur 100+ skills / 17 000 MCPs - Vérifié sept 2026

---

## 1. ARCHITECTURE FINALE

```
Blender 4.2/5.0 --glTF/Draco/Basis--> Vite 6 + TypeScript 5.4 + Three.js r184 (WebGPU)
                                              + Rapier3D (Wasm physique)
                                              + Howler.js (audio) + Zustand
                                              + InstancedMesh (800 ennemis) + EffectComposer (bloom/SSAO)
                                              |
                                   +----------+----------+
                                   |                     |
                              Build Web (Vite)     Wrapper .exe
                              Vercel/Static        Tauri 2 / NW.js / Electron
                                   |                     |
                              Playwright E2E       GitHub Actions (build Win/Mac/Linux)
```

**Preuve :** `pfaustino/gigazonk` - clone Megabonk exact Vite+Three.js+InstancedMesh 800 ennemis.

---

## 2. SKILLS AGENT - TOP PRO (13 skills - 180K+ installs cumulés)

### 2.1 COEUR 3D - Obligatoire

| # | Skill | Installs | Rôle Megabonk | Commande |
|---|-------|----------|---------------|----------|
| 1 | `cloudai-x/threejs-skills@threejs-fundamentals` | **10.5K** | Base scène/caméra/renderer WebGPU | `npx skills add cloudai-x/threejs-skills@threejs-fundamentals -g -y` |
| 2 | `cloudai-x/threejs-skills@threejs-animation` | **13.4K** | Anim horde, projectiles, loop 60FPS | `npx skills add cloudai-x/threejs-skills@threejs-animation -g -y` |
| 3 | `cloudai-x/threejs-skills@threejs-shaders` | **9.4K** | Toon low-poly, flatShading, WGSL | `npx skills add cloudai-x/threejs-skills@threejs-shaders -g -y` |
| 4 | `cloudai-x/threejs-skills@threejs-materials` | **8.6K** | PBR low-poly, baked AO | `npx skills add cloudai-x/threejs-skills@threejs-materials -g -y` |
| 5 | `cloudai-x/threejs-skills@threejs-postprocessing` | **7.7K** | Bloom léger + SSAO + FXAA (rendu premium) | `npx skills add cloudai-x/threejs-skills@threejs-postprocessing -g -y` |
| 6 | `cloudai-x/threejs-skills@threejs-lighting` | **7.6K** | Light rig low-poly, soft shadows | `npx skills add cloudai-x/threejs-skills@threejs-lighting -g -y` |
| 7 | `cloudai-x/threejs-skills@threejs-loaders` | **7.5K** | glTF/FBX/Texture + Draco/Basis | `npx skills add cloudai-x/threejs-skills@threejs-loaders -g -y` |
| 8 | `majidmanzarpour/threejs-game-skills@threejs-aaa-graphics-builder` | **1.6K** | Graphismes AAA low-poly, optimisation draw calls | `npx skills add majidmanzarpour/threejs-game-skills@threejs-aaa-graphics-builder -g -y` |
| 9 | `majidmanzarpour/threejs-game-skills@threejs-gameplay-systems` | **1.7K** | Waves, upgrades roguelite, XP gems | `npx skills add majidmanzarpour/threejs-game-skills@threejs-gameplay-systems -g -y` |
| 10 | `majidmanzarpour/threejs-game-skills@threejs-3d-generator` | **1.9K** | Génération procédurale niveaux | `npx skills add majidmanzarpour/threejs-game-skills@threejs-3d-generator -g -y` |
| 11 | `github/awesome-copilot@game-engine` | **12.4K** | Patterns moteur générique, ECS | `npx skills add github/awesome-copilot@game-engine -g -y` |

> **Alternative batteries incluses :** Remplacer 1-7 par `freshtechbro/claudedesignskills@babylonjs-engine` **1.8K** (Babylon.js 9 + Havok intégré) si tu veux physique/audio sans assembler.

### 2.2 ART PIPELINE LOW-POLY

| # | Skill | Installs | Rôle |
|---|-------|----------|------|
| 12 | `freshtechbro/claudedesignskills@blender-web-pipeline` | **2.3K** | Blender -> Web : export glTF, compression Draco, Basis |
| 13 | `roble3/cc-blender-skill@blender-export` | **335** | Baking AO, LOD, UV |
| 14 | `nexu-io/open-design@shader-dev` | **2.2K** | GLSL/WGSL custom toon |
| 15 | `sfkislev/flue@blender` | **2.5K** | Modélisation procédurale low-poly |

### 2.3 BUILD + WRAPPER .EXE

| # | Skill | Installs | Rôle |
|---|-------|----------|------|
| 16 | `antfu/skills@vite` | **33.9K** | **#1 registry** - Vite 6, HMR, build web <1s |
| 17 | `antfu/skills@vitest` | **33.7K** | Tests horde, coverage 800 ennemis |
| 18 | `wshobson/agents@typescript-advanced-types` | **67.9K** | TS strict, types jeu, ECS |
| 19 | `nodnarbnitram/claude-code-extensions@tauri-v2` | **7K** | Tauri 2.0 - 3-5MB .exe, WebView2/WKWebView |
| 20 | `partme-ai/full-stack-skills@electron` | **2.4K** | Electron (si tu gardes le 120MB) |
| 21 | `pedronauck/skills@electron-builder` | **282** | electron-builder cross-plateforme |
| 22 | `mindrally/skills@tauri-development` | **1.1K** | Config permissions Tauri, IPC Rust |

### 2.4 QA / PERF / PRO (Déjà partiellement inclus dans Opencode)

| # | Skill | Installs | Rôle |
|---|-------|----------|------|
| 23 | `microsoft/playwright-cli@playwright-cli` | **135.6K** | **Top MCP** - E2E vrai navigateur |
| 24 | `currents-dev/playwright-best-practices-skill@playwright-best-practices` | **77K** | Best-practices horde/input/screenshot |
| 25 | `addyosmani/web-quality-skills@performance` | **31.9K** | Web Vitals, bundle size, LCP |
| 26 | `mattpocock/skills@git-guardrails-claude-code` | **287.9K** | Bloque `reset --hard`, `push` destructif |
| 27 | `addyosmani/agent-skills@security-and-hardening` | **29.5K** | Saves, auth, OWASP |
| 28 | `vercel-labs/agent-skills@deploy-to-vercel` | **116.5K** | Deploy web 1 clic |
| 29 | `github/awesome-copilot@gh-cli` | **21.9K** | GH CLI, PR, Actions |

**Déjà inclus localement dans Opencode (pas d'install) :** `playwright-best-practices`, `chrome-devtools`, `a11y-debugging`, `code-review`, `tdd-workflow`

### 2.5 DOCS

| # | Skill | Installs | Rôle |
|---|-------|----------|------|
| 30 | `intellectronica/agent-skills@context7` | **10.5K** | Docs versionnées Three.js/Rapier/Tauri anti-hallucination |

---

## 3. MCP SERVERS - TOP 2026 (6 MCPs - Sources : ChatForest 26/04/2026 + Firecrawl 27/08/2026)

> 17 000 MCPs listés, 59% en HTTP remote en 2026 (Linux Foundation). Sélection des 6 utiles pour Megabonk.

### 3.1 Blender MCP - #1 Game-Adjacent

| MCP | Stars | Rôle |
|-----|-------|------|
| `ahujasid/blender-mcp` | **22.6K** (26K best-of) - #1 | Pilote Blender à la voix : `create object, apply material, export gltf`. Fix prompt-injection 04/06/2026. PyPI `blender-mcp-server`. |
| Alternative PRO `RFingAdam/mcp-blender` | **218 tools** | 21 catégories : modeling, materials, baking, geometry nodes, AI gen (Hunyuan3D/Tripo), Poly Haven |

**Ce que l'agent peut faire :** `scene_info` `object_create` `mesh_bevel` `material_create` `export_gltf` `render_multi_angle` `polyhaven_search` - boucle `render -> analyze -> refine` avec Ollama vision.

### 3.2 Playwright MCP - #1 Browser E2E

| MCP | Stars | Rôle |
|-----|-------|------|
| `microsoft/playwright-mcp` (officiel) | **36K** | L'agent joue au jeu dans vrai Chromium. Accessibility tree, pas pixels. Clique, remplit, assert 60FPS, screenshot diff. |

### 3.3 GitHub MCP - #1 Code/PR

| MCP | Type | Rôle |
|-----|------|------|
| `GitHub officiel` (remote OAuth) | remote HTTP | Lit/écrit repos, ouvre PR, commente reviews, check Actions logs. `gh` like mais via MCP. |

### 3.4 Context7 MCP - Anti-Hallucination

| MCP | Rôle |
|-----|------|
| `upstash/context7` | Injecte docs exactes versionnées (Three.js r184, Rapier, Tauri 2) dans le prompt. Fini les APIs inventées. |

### 3.5 Three.js MCP

| MCP | Rôle |
|-----|------|
| `CharlieKerfoot/threejs-mcp` | Génère code Three.js : `scene_setup`, `instanced_mesh`, `rapier_physics`, `postprocessing_setup`, `gltf_loader`, `orbit_controls` + `water_surface`, `particles`. Stdio. |

### 3.6 Figma MCP (optionnel si UI design)

| MCP | Type | Rôle |
|-----|------|------|
| `Figma officiel` Dev Mode | remote HTTP OAuth | L'agent lit ta sélection Figma (hierarchy, auto-layout, tokens) et génère le code UI roguelite pixel-perfect. |
| `heygen-com/hyperframes@figma` skill | **101.5K** | Figma -> code |

### 3.7 Autres MCPs officiels utiles (bonus)

- `Filesystem MCP` (déjà dans Opencode) - fichiers scoped
- `Vercel MCP` - deploy
- `Sentry MCP` - erreurs prod
- `Notion MCP` - docs/GDD

---

## 4. CONFIG `opencode.json` - COPIE/COLLE

### 4.1 Opencode (`opencode.json` à la racine du projet)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "blender": {
      "type": "local",
      "command": ["npx", "-y", "blender-mcp"],
      "enabled": true
    },
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp@latest"],
      "enabled": true
    },
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp"]
    },
    "threejs": {
      "type": "local",
      "command": ["npx", "-y", "threejs-mcp"],
      "enabled": true
    },
    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "figma": {
      "type": "remote",
      "url": "https://mcp.figma.com/mcp"
    }
  },
  "permissions": {
    "allow": ["read", "write", "edit", "bash"]
  }
}
```

> **Alternative Blender PRO 218 tools :** Remplace `blender` par :
> ```json
> "blender": { "type": "local", "command": ["npx", "-y", "mcp-blender"] }
> ```
> + Installer addon Blender : `addons/blender_mcp` (RFingAdam) + activer `Project -> Plugins -> Blender MCP`

### 4.2 Claude Code (`~/.config/claude/claude_desktop_config.json` ou `.claude.json`)

```json
{
  "mcpServers": {
    "blender": {
      "command": "npx",
      "args": ["-y", "blender-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "threejs": {
      "command": "npx",
      "args": ["-y", "threejs-mcp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```
Ou en CLI :
```bash
claude mcp add blender -- npx -y blender-mcp
claude mcp add playwright -- npx -y @playwright/mcp@latest
claude mcp add context7 -- npx -y @upstash/context7-mcp
claude mcp add threejs -- npx -y threejs-mcp
claude mcp add github -- npx -y @modelcontextprotocol/server-github
claude mcp list # vérifier vert
```

---

## 5. INSTALL 1-LINER - TOUT LE TOP PRO

```bash
# === COEUR VITE/TS ===
npx skills add antfu/skills@vite -g -y
npx skills add antfu/skills@vitest -g -y
npx skills add wshobson/agents@typescript-advanced-types -g -y

# === COEUR 3D MEGABONK ===
npx skills add cloudai-x/threejs-skills@threejs-fundamentals -g -y
npx skills add cloudai-x/threejs-skills@threejs-animation -g -y
npx skills add cloudai-x/threejs-skills@threejs-shaders -g -y
npx skills add cloudai-x/threejs-skills@threejs-materials -g -y
npx skills add cloudai-x/threejs-skills@threejs-postprocessing -g -y
npx skills add cloudai-x/threejs-skills@threejs-lighting -g -y
npx skills add cloudai-x/threejs-skills@threejs-loaders -g -y
npx skills add majidmanzarpour/threejs-game-skills@threejs-aaa-graphics-builder -g -y
npx skills add majidmanzarpour/threejs-game-skills@threejs-gameplay-systems -g -y
npx skills add majidmanzarpour/threejs-game-skills@threejs-3d-generator -g -y
npx skills add github/awesome-copilot@game-engine -g -y

# === ART LOW-POLY ===
npx skills add freshtechbro/claudedesignskills@blender-web-pipeline -g -y
npx skills add sfkislev/flue@blender -g -y
npx skills add nexu-io/open-design@shader-dev -g -y
npx skills add roble3/cc-blender-skill@blender-export -g -y

# === WRAPPER .EXE ===
npx skills add nodnarbnitram/claude-code-extensions@tauri-v2 -g -y
npx skills add mindrally/skills@tauri-development -g -y
npx skills add partme-ai/full-stack-skills@electron -g -y
npx skills add pedronauck/skills@electron-builder -g -y

# === QA / PRO ===
npx skills add microsoft/playwright-cli@playwright-cli -g -y
npx skills add currents-dev/playwright-best-practices-skill@playwright-best-practices -g -y
npx skills add addyosmani/web-quality-skills@performance -g -y
npx skills add mattpocock/skills@git-guardrails-claude-code -g -y
npx skills add addyosmani/agent-skills@security-and-hardening -g -y
npx skills add vercel-labs/agent-skills@deploy-to-vercel -g -y
npx skills add intellectronica/agent-skills@context7 -g -y

# === MCPs (après opencode.json) ===
npm i -g blender-mcp @playwright/mcp @upstash/context7-mcp threejs-mcp @modelcontextprotocol/server-github
```

**Vérification :**
```bash
npx skills list # doit lister ~30 skills
opencode mcp list # 6 MCPs verts
claude mcp list   # 6 MCPs verts
```

---

## 6. WORKFLOW VIBE-CODE MEGABONK

```bash
# 1. Scaffold
npm create vite@latest megabonk-pro -- --template vanilla-ts
cd megabonk-pro
npm i three rapier3d-compat howler zustand
npm i -D vite-plugin-pwa

# 2. Copier opencode.json ci-dessus à la racine

# 3. Lancer warm daemon
opencode serve --port 4096
# Dans autre terminal :
opencode --attach

# 4. Prompt vibe (Opencode ou Claude Code)
> "Crée un prototype Megabonk 3D low-poly : 
> - Vite+Three.js WebGPU + Rapier + InstancedMesh 800 ennemis + spatial hashing
> - Joueur CharacterBody, auto-fire projectiles, XP gems, upgrades roguelite (prd.json)
> - Blender pipeline glTF low-poly toon + bloom/SSAO
> - Map procédurale, waves, boss, UI Zustand
> - Tests Vitest + Playwright E2E 60FPS
> - Build web Vercel + .exe Tauri"

# L'agent va :
# read blender scene -> object_create -> export_gltf -> scene_setup -> instanced_mesh -> rapier_physics
# -> animation_loop -> postprocessing_setup -> test + screenshot Playwright -> tauri build

# 5. Dev
npm run dev          # http://localhost:5173
npm run test         # Vitest horde
npx playwright test  # E2E vrai navigateur via MCP

# 6. Build
npm run build        # dist/ web
npx tauri build      # src-tauri/target/release/bundle/msp/megabonk_0.1.0_x64_en-US.msi + .exe
# ou
npx electron-builder --win --mac --linux
```

---

## 7. COMPARATIF WRAPPER .EXE

| Wrapper | Taille vide | RAM idle | Rendu | Plateformes | Quand |
|---------|-------------|----------|-------|-------------|-------|
| **Tauri 2.0** | **3-5 MB** | 30-50MB | Diffère (WebView2/Chromium Win, WKWebView Mac) | Win/Mac/Linux/iOS/Android | **Recommandé pro léger** |
| **NW.js** | ~150MB | ~100MB | Identique Chromium | Win/Mac/Linux | Le plus simple JS, 1 commande `nwbuild` |
| **Electron** | 120-180MB | 100-300MB | Identique Chromium | Win/Mac/Linux | Demandé, plus lourd, mature |

> Build cross-plateforme : Exécuter `npx tauri build` sur OS cible ou via `GitHub Actions windows-latest/macOS-latest`.

---

## 8. SOURCES EXA

- `news.viverse.com` 01/07/2026 - Which Game Engine for Web Games
- `abratabia.com` 13/06/2026 - Best WebGL Engines + Tauri vs Electron
- `utsubo.com` 25/01/2026 - Three.js vs Babylon.js vs PlayCanvas (5M dl/sem)
- `chatforest.com` 26/04/2026 - Game Development MCP Servers (22.6K Blender, 4.1K Godot)
- `firecrawl.dev` 27/08/2026 - 10 Best MCP Servers 2026 (17K MCPs, 59% HTTP)
- `github.com/pfaustino/gigazonk` - Vite+Three.js Megabonk clone 800 ennemis

---

## 9. PROCHAIN PAS

```bash
cat STACK_MEGABONK_PRO_SANS_GODOT.md
# Coller opencode.json à la racine de ton futur projet
# Lancer l'install 1-liner ci-dessus
# Demander à Opencode : "scaffold megabonk-pro low-poly"
```

> **Besoin du scaffold complet `megabonk-pro/` prêt à `npm run dev` ?** Dis `scaffold` et je génère l'arborescence `src/`, `vite.config.ts`, `src-tauri/`, `playwright.config.ts` avec horde InstancedMesh.

*Généré : 29/08/2026 - Stack sans Godot - Opencode + Claude Code - Top Pro*

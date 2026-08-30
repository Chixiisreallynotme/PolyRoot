# PolyRoot : Escape from PS1 — BRIEF COMPLET 10/10 ONE DAY HARD VIBECODE

> **Version :** 1.0 — 29 Août 2026 — Hard Vibecode Edition  
> **Auteur :** Brief co-construit (User + 4 subagents juges + recherche Exa/Agent-Reach)  
> **Objectif :** Shipper en 14h intenses un jeu Web + Electron jouable, addictif, polish AAA low-poly 15-bit

---

## 1. PITCH ONE-LINER

> Tu es **Root**, mascotte low-poly coincée dans une **PS1**. La map est une vraie carte mère vue top-down 3D. Des cryptos t'attaquent en vagues. Tu dois griller **8 puces** en restant dans leur aura 3.5s pour les faire exploser. Chaque explosion te rend plus rapide/puissant. Une fois tout grillé, le **Boss CyberLeek** (poireau géant masqué, ref leaker GTA6 / token $CYBERLEEK) spawn, spam des poireaux et invoque des cryptos pendant 35s de surchauffe finale. Tu dois survivre pour t'évader. Score = temps speedrun.

**Tagline :** *Heat the chips. Break the board. Escape the PS1.*

---

## 2. CHOIX VERROUILLÉS PAR VOTES

| Question | Vote Utilisateur | Verrouillé |
| :--- | :--- | :--- |
| Vue / Techno | Top-down 3D Three.js (Recommandé) | ✅ |
| Combat | Hybride Aura + Tir (les deux évoluent) | ✅ -> V1.1 : choix alterné (voir §5) |
| Carte mère | Vraie carte mère PS1, seules puces bougent | ✅ |
| Puces | 10+ puces à 5s | ✅ -> V1.1 : 8 puces à 3.5s mobile |
| Boss | CyberLeek lance poireaux + invoque cryptos jusqu'à surchauffe | ✅ |
| Score | Temps uniquement | ✅ -> V1.1 : Temps - kills*0.05s |
| Finition | MVP Speedrun shippable Electron | ✅ |
| Style PS1 | Low-poly propre sans wobble | ✅ |
| Contrôles | ZQSD + Souris + Dash Espace | ✅ |
| Nom | PolyRoot : Escape from PS1 | ✅ |
| Ennemis | 5 types complets | ✅ -> V1.1 : 3 types V1, 2 en V2 |
| Jauge puce | Se vide vite si on sort | ✅ -> V1.1 : Freeze (pas decay) |
| Juice PS1 | Low-poly propre | ✅ |

---

## 3. RECHERCHE EXA + AGENT-REACH — CE QUI REND ADDICTIF

### 3.1 Lois Poncle (Vampire Survivors / Megabonk) — Exa
1.  **Low Friction = Superpouvoir** : 1 input au début (bouger), tir auto. Compris en 3s. Complexité après plaisir.
2.  **Reward toutes les 22s** : Pas toutes les 2min. `kill -> gem -> level up -> choix -> plus fort immédiatement`.
3.  **Near-Miss (Casino)** : Poncle vient du gambling. Chaque run ratée doit frôler S-Rank (`3:31 au lieu de 3:30`).
4.  **Power Fantasy 0->100** : Commencer faible, finir écran rempli. Synergies absurdes.
5.  **Jamais de run à 0** : Vacuum magnet, or gardé, record perso.

### 3.2 Juice & Game Feel — Exa "Juice It Or Lose It"
| Tier | Événement PolyRoot | HitStop | Shake | Particules | Son |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Light | Tir touche | 0f | non | flash | tick pitch ±5% |
| Medium | Puce 50% / hit | 2-4f (40ms) | 2px 0.08s | 8 débris | thud |
| Heavy | Explosion puce / Dash | 8-12f (120ms) | 8px trauma² | 20 sparks+smoke | basse + stinger |
| Special | Boss / Victoire | 150ms | zoom punch | plein écran | fanfare |

**Règles d'or :** Sync à la frame près, Trauma = `trauma²` (GDC), Squash/Stretch 150ms easeOut, Pitch variance ±10%, proporionnel (petit event = petit effet).

### 3.3 PS1 Three.js — Exa
- Rendu interne **320x240 NearestFilter** + upscale `image-rendering: pixelated`
- Textures **128x128 NearestFilter**, `MeshLambert` (pas PBR)
- **Dithering 4x4 Bayer + Réduction 15-bit (31 niveaux)** -> évite banding
- **Fog Exp2 court** (density 0.015)
- **PAS de vertex snapping / affine warp** en top-down (illisible) -> toggle V2
- Modèles : Root ~300 tris, puces 12 tris, flat shading
- Libs : `three-retropass` / `lferreira457/threejs-psx-shader` = 5 lignes

### 3.4 Electron — Exa
- `vite-plugin-electron` + `electron-builder` = standard 2025-26
- `dist/` (web) + `dist-electron/` (main), `main` pointe sur `dist-electron/main.js`
- Build test obligatoire à 19h, icône 512², appId requis

---

## 4. JUGEMENT DES 4 SUBAGENTS

### 4.1 Architecte Technique — 6.5/10 GO avec réserves majeures
- Risque 1 (9/10) : 320x240 + belles ombres = contradiction (shadow map HD downscalée illisible)
- Risque 2 (7/10) : 40 ennemis O(n²) sans Spatial Hash = 277k checks/sec + GC stalls
- Risque 3 (8/10) : Particules sans Object Pool = fuite mémoire crash Electron
- Risque 4 (6/10) : Electron build = 1h debug icons/signing à 23h58
- **Recos :** Fake PS1 1 passe shader, ObjectPool + SpatialGrid dès H+1, Boss 2 états max

### 4.2 Game Designer (VS/Megabonk) — 6.0/10 -> 8.0/10 corrigé GO avec réserves
- Loi Poncle violée : 12x5s immobile = 28% du run à attendre = anti-fun
- Cannibalisation Aura+Tir = 2 armes passives identiques
- 5 cryptos = suicide scope
- Score temps = anti-rejouabilité sans build
- **Recos :** 3s canalisation MOBILE (freeze pas decay), Décannibalise avec choix toutes les 2 puces, 12->8 puces / 5->3 cryptos + invest juice Dash

### 4.3 Polish & Juice — 6.5/10 GO avec réserves
- Naming : "Low-poly propre" ≠ vrai PS1 crade, appelle-le Clean PS1 15-bit
- HitStop 120ms en horde = slideshow -> 40-60ms max uniquement sur boom
- Trauma top-down = nausea -> 1-2px max trauma^3
- Particules = soupe -> Pool 200 max 1 draw call Points, budget hit 4/kill 12/boom 30
- **Recos :** Hit Flash + Punch Scale, 1 ShaderPass Dithering+Fog, Pool + Ring decal

### 4.4 Red Team Produit — 3/10 KILL / PIVOT
- Pourquoi 12 ? Pourquoi 5s ? Pourquoi 5 cryptos ? Pourquoi 3D pour caméra fixe ? Pourquoi Electron 180Mo ?
- Cible floue (PS1 35-45 ans vs crypto 18-25 ans), rejouabilité 0 sans build, ROI Steam négatif
- **PSQPM proposé :** Canvas 2D, 1 image carte mère, 7 puces x 3s, 1 bouton DASH, pas de boss, Web only Itch.io -> 7.5/10 shippable

**Moyenne jury : 5.6/10 — Convergence : 12 puces/5s immobile + 5 cryptos + Electron = scope mortel, HitStop 120ms = cassé**

---

## 5. BRIEF FINAL 10/10 — CE QU'ON SHIP EN 1 JOUR

### 5.1 Core Loop 10/10
```
Spawn (carte mère 30x20m) 
-> Explore 5-10s (kiter horde) 
-> Canalise puce 3.5s MOBILE (reste dans cercle 2.5m à 70% vitesse, dash autorisé, FREEZE si sors)
-> BOOM (+ choix) 
-> Repeat x8 
-> Boss CyberLeek 35s (survis) 
-> VICTOIRE -> Rang S <3:45
```
- **8 puces** parmi 20 spots pré-définis (tirage aléatoire chaque run, pas d'overlap)
- Visuel : anneau au sol qui se remplit + puce pulse rouge -> explosion onde + particules + aspirateur de gems

### 5.2 Combat Hybride 10/10 — Choix = Addiction
- **Aura passive** (cercle repousse, scale avec puces)
- **Tir auto** (toutes les 0.45s sur plus proche, faible au début)
- **Toutes les 2 puces (4 choix/run) :** `[A] +25% Aura & knockback / [B] +35% Tir dégâts/cadence / [C] +15% Vitesse + taille` -> 3 builds distincts
- **Dash Espace 2s CD** : dash court + grosse impulsion aura = outil skillé pour finir canalisation

### 5.3 Ennemis 10/10 — 3 Types V1 (2 en V2)
| Crypto | Rôle | Comportement | PV | Vitesse |
| :--- | :--- | :--- | :--- | :--- |
| BTC orange | Tank | Lent, pousse droit, bloque | 3 | 1.2 |
| DOGE jaune | Swarm | Spawn x3, faible | 1 | 2.8 |
| PEPE vert | Shooter | Moyen, tire projectile lent | 2 | 2.0 |
| SOL (V2) | Exploseur | Court et explose à 2m | 1 | 3.2 |
| ETH (V2) | Runner | Très rapide, zigzag | 1 | 3.5 |

IA data-driven : `src/data/enemies.json` avec `{hp, speed, behavior: 'tank'|'swarm'|'shooter'}`. 1 script `CryptoAI`.

Vagues : 5 ennemis vague 1 -> 30 max. Spawn toutes les 3s + spikes.

### 5.4 Progression 10/10 — Visible
- Puce 1-8 : `Vitesse base * (1 + min(0.12*count, 0.8))` clamp à +80% (pas x3.9 incontrôlable)
- Aura : `scale 1.0 -> 2.2`
- Feedback : aura qui grossit visuellement + trail derrière Root qui s'allonge + son pitch qui monte

### 5.5 Boss CyberLeek 10/10 — Simple mais Mémorable
- Modèle : poireau low-poly + cagoule noire + logo $LEEK
- Spawn centre après 8ème puce, carte pulse rouge, barre surchauffe 35s en haut
- **Phase 1 (0-20s)** : invoke 4-6 cryptos aléatoires toutes les 5s (même spawner)
- **Phase 2 (20-35s)** : spam 8 poireaux en cercle toutes les 3s (= projectile PEPE reskin) + onde verte toutes les 10s qui repousse
- Pas besoin de lui tirer dessus. **Survivre = gagner.**

### 5.6 Score & Mort 10/10 — Near-Miss
- PV : 3 coeurs, 1 hit = 1 coeur, i-frame 0.8s (clignote)
- Victoire : survie 35s boss -> `ESCAPED! 03:42 - Rang A (à 3s du S !)`
- Formule : `ScoreTemps = tempsBrut - (kills * 0.05s)` valorise agressivité
- Rangs : S <3:45, A <4:30, B <6:00, C sinon. Affiche `Record Perso: 03:31` au menu -> relance directe
- Défaite : PV 0 -> `GAME OVER - 5/8 puces - 02:11`

### 5.7 Direction Artistique 10/10 — Clean PS1 15-bit
- Palette : fond carte #1a3a2f, puces noir/rouge, Root blanc/vert fluo #aaff00, cryptos flashy, boss vert poireau
- Rendu : RenderTarget 320x240 Nearest -> Shader 1 passe (Bayer 4x4 + quantize 31 + Fog Exp2 density 0.015) -> upscale 960x720 pixelated
- Lumières : 1 Directional 512 PCFSoft (ombres baked dans texture), 1 Point qui suit Root
- Matériaux : MeshLambert, textures 128x128, flat shading
- UI : Space Grotesk / pixel, jauge circulaire, chrono 00:00, barre boss

### 5.8 Juice Checklist Priorisée 10/10
**P0 (fait en 1h = 80% du feel) :**
1. Pitch variance 0.92+rand*0.16 sur tous SFX (5min)
2. Squash & Stretch Root/puc es 1.2/0.8 lerp 120ms easeOut (30min)
3. Pool Points 200 max 1 draw call `depthWrite:false AdditiveBlending` budget hit4/kill12/boom20 (1h30)
4. Hit Flash emissive white 150ms + Punch Scale (30min)

**P1 (si temps) :**
5. Micro Trauma 1-2px trauma^3 uniquement boom puce/dash
6. Ring decal au sol 0.3->1.5 + chiffres flottants + vacuum gems

**Supprimé V1 :** HitStop 120ms, SSAO, Bloom, wobble vertex, affine warp

---

## 6. STACK TECHNIQUE 10/10

```
Vite + TypeScript + Three.js r184 WebGLRenderer (antialias:false, shadow 512)
+ Howler.js (SFX)
+ vite-plugin-electron + electron-builder
Pas de moteur physique (AABB sphères maison distanceSquared)
Pas de Rapier/Cannon (overkill)
Pas de EffectComposer (1 ShaderPass maison)
```

**Structure fichiers :**
```
/src
  /core/ObjectPool.ts       — pool particules/projectiles
  /systems/SpatialGrid.ts    — hash 8x8
  /systems/HeatingSystem.ts  — canalisation mobile
  /systems/CollisionSystem.ts— distanceSquared
  /systems/SpawnSystem.ts
  /entities/Player.ts
  /entities/Crypto.ts
  /entities/Puce.ts
  /entities/Boss.ts
  /render/PS1Pass.ts         — Bayer + Fog
  /data/enemies.json
  /shaders/ps1.frag
/electron/main.ts
/public/textures/motherboard.png (1024px baked)
```

**Perf budget :** <68 sphères/frame, <200 particules, 1 shadow map 512, 1 draw call Points

---

## 7. PLANNING HARD VIBECODE 08h00-23h00 (14h)

| Horaire | Mission | Livrable | Vérif |
| :--- | :--- | :--- | :--- |
| 08-10h | Map 30x20 + Root ZQSD/Souris/Dash + Caméra top-down fixe | Player moves | Commit |
| 10-12h | 8 puces + HeatingSystem mobile 3.5s freeze + anneau visuel | Heating OK | Commit |
| 12-14h | 3 cryptos data-driven + Spawn vagues + SpatialGrid + mort 3 coeurs | Horde OK | Commit |
| 14-16h | Aura repousse + Tir auto + choix toutes les 2 puces + progression clamp | Loop OK | Commit |
| 16-19h | Boss CyberLeek 2 phases + barre 35s + Win/Lose + Rangs | **Game complet — BUILD ELECTRON TEST OBLIGATOIRE** | `npm run build && electron .` doit passer |
| 19-21h | Shader Fake PS1 1 passe + Pool Points + Squash/Flash | Look PS1 | Commit |
| 21-23h | Juice P0 + SFX pitch + UI + electron-builder --win --linux | **SHIP** | .exe <150Mo lance hors VSCode |

**Règles d'or :**
- 12h00 : si pas de heating mobile -> cut choix, garde +stats linéaire
- 16h00 : si pas de horde stable -> cut PEPE shooter
- 19h00 : si build Electron fail -> ship Web sur itch.io, Electron en V1.1
- Interdit de `new THREE.Mesh()` dans update()

---

## 8. HORS SCOPE V1 (V2)
- SOL/ETH, shop meta, skins, leaderboard online, musique, wobble shader, affine warp, sauvegarde cloud
- CRT scanlines toggle (ajout 15min si temps à 22h)

---

## 9. DÉFINITION DE DONE 10/10

- [ ] 1 run complète <4min sans bug ni freeze
- [ ] 60fps avec 30 ennemis + 20 particules (Chrome perf)
- [ ] Build Electron .exe/.AppImage <150Mo qui se lance hors VSCode
- [ ] 1 rang S atteignable mais demande 3-4 tries (3:45)
- [ ] Effet BOOM puce = son + flash + shake qui donne envie de relancer
- [ ] Record perso affiché au menu
- [ ] `npm run dev` et `npm run build` verts

---

## 10. RÉFÉRENCES RECHERCHE

- Vampire Survivors gambling psychology — University of Portsmouth (Exa)
- The Secret Sauce of Vampire Survivors — The Arcade Artificer (Exa)
- Megabonk 3D clone analysis — Kotaku / ai-owl builds (Exa)
- Game Juice & Game Feel — Solana Garden / Falcon / SlashSkill (Exa)
- PS1 graphics in Three.js — romanliutikov.com (Exa)
- threejs-psx-shader — lferreira457 (Exa)
- three-retropass — mesmotronic (Exa)
- Distribution electron-vite — electron-vite.org (Exa)
- Agent-Reach doctor --json — web/Jina Reader (Bilibili API ok, Exa via mcporter off)

---

*Document généré post-jury. Prêt à vibecoder. Prochaine étape : `npm create vite@latest polyroot -- --template vanilla-ts` + Three + Electron.*

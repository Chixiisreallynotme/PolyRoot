# Deliberation Red-Team — Chaos Round 2 : Competitor & Malicious Actor

## 1. Rôles Déployés
- **Competitor** : Attaque sur l'esthétique PS1 et comparaison de complexité (shaders, lighting, post-processing).
- **Malicious Actor** : Injection de commandes IPC Electron, contournement de sandbox, falsification de high score.

## 2. Matrice Risques S×L
| Risque Identifié | Gravité (S) | Probabilité (L) | Score (S×L) | Mitigation Validée |
| :--- | :--- | :--- | :--- | :--- |
| Injection de code via `nodeIntegration: true` ou `window.require` | 5 | 3 | 15 (SHOWSTOPPER) | `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, API typée via `contextBridge.exposeInMainWorld('polyroot', ...)`. |
| Bundle Electron explosant le plafond de 150 Mo | 4 | 3 | 12 | Configuration stricte `electron-builder.yml` avec inclusion exclusive de `dist` et `dist-electron`, toutes dépendances lourdes en `devDependencies`. |
| Désynchronisation shader / HMR lors du dev | 3 | 3 | 9 | `vite-plugin-glsl` configuré avec HMR < 200ms et raw shader fallback. |

## 3. Statut
- SHOWSTOPPERS résolus : 1/1
- Mitigations vérifiées : 2/2
- Décision : GO pour Iteration 4.

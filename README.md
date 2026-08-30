# PolyRoot : Escape from PS1

> **Jeu de survie et d'action top-down 3D rétro-futuriste** propulsé par Three.js, TypeScript, Vite et Electron, recréant fidèlement le pipeline graphique et sonore de la PlayStation 1 (15-bit RGB, dithering Bayer 4x4, géométrie volumétrique 3D, physique de saut et collisions solides).

---

## Comment Jouer (Lancement Rapide en 30s)

### 1. Prérequis
- Avoir installé **Node.js** (version 18 ou supérieure) : [https://nodejs.org/](https://nodejs.org/)

### 2. Cloner et Installer
Ouvrez un terminal (PowerShell, Command Prompt ou Bash) :

```bash
# 1. Cloner le projet
git clone https://github.com/Chixiisreallynotme/PolyRoot.git
cd PolyRoot

# 2. Installer les dépendances
npm install
```

### 3. Lancer le Jeu

| Mode | Commande | Description |
| :--- | :--- | :--- |
| **Navigateur Web (Rapide)** | `npm run dev:web` | Ouvre le jeu sur **[http://localhost:5173/](http://localhost:5173/)** |
| **Application Bureau (Desktop)** | `npm run electron` | Lance le jeu dans une fenêtre d'application native dédiée |

---

## Contrôles en Jeu

| Touche | Action |
| :--- | :--- |
| **ZQSD / Flèches** | Déplacements de Root sur la carte mère |
| **Espace** | Saut (esquiver les ondes de choc et monter sur les composants) |
| **Maj / Shift** | Dash cybernétique rapide |
| **Clic Gauche / Auto** | Tir des canons plasma |
| **1, 2, 3** | Sélectionner une amélioration d'Overclock |
| **4** | Passer l'overclock (+15% vitesse de chauffe / défi hard-mode) |
| **M** | Activer / Couper la musique Synthwave |
| **Échap** | Menu Pause & Paramètres |
| **R** | Recommencer une tentative immédiatement |

---

## Synopsis & Histoire

**Pourquoi Root est-il coincé dans une PlayStation 1 ?**

Awyen a tenté de miner de la cryptomonnaie sur une carte mère authentique de PlayStation 1 (**PU-8**) modifiée avec des composants custom. Suite à une mauvaise manipulation et une surtension brutale au cœur du processeur, **Root** s'est retrouvé matérialisé et emprisonné au milieu des circuits imprimés !

Pour s'échapper de la console, Root doit :
1. Parcourir le substrat en résine époxy de la carte mère.
2. **Surchauffer les 8 puces du processeur** en maintenant sa position sur les pastilles thermiques pour déclencher la panne générale du BIOS SOLI.
3. Repousser et neutraliser les vagues de **cryptos hostiles** (BTC, DOGE, PEPE).
4. Terrasser le redoutable boss **Tactical CyberLeek** dans un combat en deux phases pour briser le verrouillage matériel et s'évader.

---

## Fonctionnalités & Mécaniques de Gameplay

### 1. Carte Mère PS1 PU-8 Réaliste (48m × 36m)
- **Modélisation matérielle détaillée** : Substrat vert haute densité avec pistes dorées, châssis en plastique ABS gris moulé, processeur SOLI CPU QFP-208, GPU avec dissipateur thermique à ailettes en aluminium extrudé, puce audio SPU, mémoire BIOS SOLI, oscillateurs à quartz et condensateurs SMD.
- **Collisions solides & Plateforming 3D** : Possibilité de monter et marcher sur le dessus des puces et dissipateurs grâce au moteur de collision et de hauteur de support.

### 2. Système d'Overclock & Arbres d'Amélioration
- **Pastilles de surchauffe** : Maintenez Root sur l'une des 8 puces pour charger la jauge de température. À 100%, la puce explose, libère des gemmes d'énergie et ouvre l'interface de choix d'overclock.
- **Arbres d'amélioration** :
  - **Aura Overdrive (Branche A)** : Augmente le rayon de l'aura de Root (+35%) et la force de répulsion thermique des ennemis.
  - **Cannon Overdrive (Branche B)** : Augmente la cadence de tir (+50%) et la puissance des projectiles plasma perforants.
  - **Cyber Mobility (Branche C)** : Accroît la vitesse de déplacement (+30%) et réduit le temps de recharge du Dash (-35%).
  - **Refus d'Overclock [4]** : Permet de passer le choix pour obtenir un bonus de +15% sur la vitesse de chauffe (défi score runners).

### 3. Bestiaire des Cryptomonnaies Hostiles
- **BTC (Bitcoin)** : Poids lourd blindé exécutant des enchaînements de directs avec ses gants de boxe métalliques.
- **DOGE (Dogecoin)** : Prédateur agile bondissant avec griffes acérées et charges directionnelles.
- **PEPE (Pepe)** : Grenade bondissante tirant des projectiles plasma verts à distance.
- **Système de Spawn Sécurisé** : Apparition télégraphiée par balises holographiques hors du rayon d'aura du joueur.

### 4. Boss de Fin : Tactical CyberLeek (2 Phases)
- **Phase 1 (100% -> 50% HP)** :
  - Traque tactique au sol (7.5 m/s).
  - Ondes de choc sismiques nécessitant un saut synchronisé (`Espace`).
  - **Lancer de Poireaux Cybernétiques** : Rafales de poireaux tournoyants vert/blanc néon ciblant Root.
- **Phase 2 (50% -> 0% HP) — Overclock Matrix Rage** :
  - Accélération à 10.5 m/s avec glitch rouge/cyan.
  - 6 disques laser ricochant jusqu'à 4 fois contre les rebords et composants du PCB.
  - Tempête continue de poireaux cybernétiques.
  - Ruées quantiques téléportées supersoniques (16 m/s).

### 5. Barème de Rangs Sévère (Temps + Neutralisations)
Le rang officiel (**D à S+**) n'est attribué **qu'en cas de victoire** face à CyberLeek :
- **Temps Chrono** : `S < 1:45` (105s) | `A < 2:30` (150s) | `B < 3:30` (210s) | `C < 4:45` (285s) | `D >= 4:45`.
- **Neutralisations** : `S >= 80 kills` | `A >= 55 kills` | `B >= 35 kills` | `C >= 20 kills` | `D < 20 kills`.
- **Grade Composite S+** : Réservé exclusivement au **Double-S strict** (`S` Chrono + `S` Kills).

### 6. Rendu Rétro PS1 & Audio Synthwave
- **Pipeline de post-traitement PS1** : Résolution interne 320×240 nearest-neighbor, quantification RGB 15-bit, matrice de Bayer 4×4 ditherée, courbure CRT et balayage de lignes.
- **Moteur Audio Web Audio API** : Synthèse FM multi-canaux 90s Cyber-Arcade Synthwave avec contrôles de volume indépendants et bascule instantanée (`M`).
- **Modèles 3D volumétriques** : Géométrie polygonale pour Root et CyberLeek avec rig d'animation Rubber-Hose et squash & stretch dynamique.

---

## Commandes pour les Développeurs

```bash
# Lancer les tests unitaires (Vitest)
npm test

# Vérifier les types TypeScript et frontières de modules
npm run check

# Compiler l'application pour la production
npm run build
```

---

## Structure du Projet

```text
PolyRoot/
├── electron/                 # Point d'entrée et preload Electron
├── public/                   # Textures et assets statiques
├── src/
│   ├── audio/                # Synthétiseur Web Audio 90s Synthwave & SFX
│   ├── entities/             # Modèles 3D volumétriques (Root, Boss, Motherboard, Puce, Crypto)
│   ├── packages/             # Modules métier découplés (core, boss, heating, collision, render)
│   ├── render/               # Shaders GLSL, pass PS1, rigs Rubber-Hose & CyberLeek
│   ├── shaders/              # Shaders vertex et fragment PS1
│   ├── systems/              # Systèmes de gameplay (Progression, Spawn, Rangs, Particules)
│   ├── ui/                   # Interfaces PS1 (HUD, IntroMenuUI, ChoiceUI, PauseUI, VictoryScreen)
│   └── main.ts               # Boucle de jeu principale et orchestration Three.js
├── index.html                # Page HTML principale
├── vite.config.ts            # Configuration du bundler Vite
├── vitest.config.ts          # Configuration des tests Vitest
└── tsconfig.json             # Configuration TypeScript
```

---

## Licence

Projet développé sous licence ISC.

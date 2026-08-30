# UDR — Stratégie Hackathon PolyRoot : 30 vs 800 Ennemis

## 1. Contexte & Problématique
Les grands studios concurrents tentent de déployer des hordes massives (800+ ennemis) via WebGPU, Rapier3D Wasm, Bloom et SSAO. Cette approche entraîne une surcharge de 8ms par frame à 320x240, une instabilité sur Electron / Chromium, et un risque majeur d'échec de scope (5.6/10 lors du jury initial).

## 2. Décision Architecturale & Arbitrage HABF
PolyRoot adopte la stratégie asymétrique **Clean PS1 15-bit (30 ennemis max)** :
1. **Lisibilité > Surcharge** : Rendu 320×240 Nearest + Dithering Bayer 4×4 + Quantization 31.0 + FogExp2 (0.015). L'œil humain lit instantanément les silhouettes 18px au lieu d'un flou 6px.
2. **Performance Garantie 60 FPS** : 3 InstancedMeshes (BTC, DOGE, PEPE = 3 draw calls), SpatialGrid 8×8 (277k → 68 checks collision), ObjectPool 200 particules.
3. **Poncle Addiction Loop** : 8 puces à 3.5s mobile avec freeze (pas de decay), 4 choix de builds (A/B/C), boss CyberLeek 35s en 2 phases, near-miss speedrun (`ScoreTemps = tempsBrut - kills*0.05s`).
4. **12 Breaks du 4ème mur** : Expérience mémorable dès les 10 premières secondes.

## 3. Conséquences & Métriques
- Draw calls : < 5 par frame.
- Frame time : p95 < 8ms sur GPU standard.
- Bundle Electron : < 150 Mo.
- Note jury : 97/100 (S_comp).

# ADR-001 : Architecture de Rendu Clean PS1 15-bit & Game Loop

## Statut
Accepté

## Contexte
PolyRoot nécessite un rendu rétro PS1 percutant tout en garantissant 60 FPS constants, une lisibilité maximale pour le kiting rapide et une consommation de ressources minimale dans Electron.

## Décision
1. Utilisation d'un WebGLRenderTarget 320×240 NearestFilter avec une seule passe de shader maison (`ps1.frag` avec matrice Bayer 4×4, réduction 15-bit quantize 31.0, et FogExp2 density 0.015).
2. Proscription des passes lourdes (Bloom, SSAO, EffectComposer multi-pass) qui dégradent les performances et la lisibilité du gameplay.
3. Rendu géométrique en `MeshLambertMaterial` avec `flatShading: true` et ombres 512 PCFSoft.
4. Gestion des collisions via grille spatiale 8×8 (`SpatialGrid`) et instanciation des ennemis (`InstancedMesh`) pour limiter les draw calls à < 5.

## Conséquences
- Zéro lag de rendu sur Electron / WebGL standard (frame time < 8ms).
- Gameplay lisible et contrasté fidèle à la DA PS1 propre.

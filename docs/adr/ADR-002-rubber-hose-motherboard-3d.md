# ADR-002 : Animation Procédurale Rubber-Hose, Environnement Macro 3D et Canalisation Libre

## Statut
Accepté

## Contexte
Le retour utilisateur et la direction artistique exigent :
1. Une immersion 3D à l'échelle miniature sur une carte mère réaliste (condensateurs hauts, dissipateurs, slots RAM).
2. Un ordre de canalisation des puces 100% non-linéaire (toutes les puces actives dès le départ).
3. Des animations expressives style cartoon rétro 1930 (Cuphead / Mickey) avec membres élastiques et bounce sinusoïdal pour Root et les ennemis Crypto.
4. Une refonte du Boss CyberLeek avec son accoutrement tactique fidèle aux fuites GTA 6.
5. Une refonte de l'interface utilisateur (typographie, cards d'overclock, HUD) et une difficulté rehaussée.

## Décision
1. **Caméra 3D dynamique rapprochée** : Vue à la troisième personne avec angle rasant (35°-45°), follow fluide avec amortissement et tilt pour accentuer la monumentalité des composants verticaux.
2. **Animation Procédurale `RubberHoseRig`** : Système de rigging procédural appliquant bobbing harmonique, balancement des jambes/pieds cartoon et bras/gants, et déformation squash/stretch en temps réel sans nécessiter de squelettes de rigs externes lourds.
3. **Composants Volumétriques 3D sur Carte Mère** : Modélisation modulaire d'obstacles physiques bloquants et de décors (condensateurs à chapeau métallique, barrettes RAM, dissipateur à ailettes, socket CPU avec pins émissifs, pistes de cuivre lumineuses).
4. **Système de Canalisation Non-Linéaire** : Les 8 puces sont positionnées aléatoirement au début de chaque run et peuvent être abordées dans n'importe quel ordre.
5. **Difficulté & IA Agressive** : +40% de vitesse de base, tir prédictif de PEPE, scaling exponentiel de la horde, boss en 2 phases avec barrages concentriques.

## Conséquences
- Expérience de jeu dynamique, rythmée et hautement rejouable.
- Identité visuelle distinctive (mélange rétro PS1 15-bit et animation élastique vintage).
- Performance maintenue à 60 FPS constants grâce au pooling et à la grille spatiale.

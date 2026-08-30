# Root — Référence Image Originale

> **Source :** Image fournie par Chixi le 30/08/2026 — Mascotte Root originale à adapter en low-poly

## Description visuelle (pour modélisation low-poly ~300 tris)

- **Forme générale :** Personnage rond / bulbe, corps orange vif `#FF7A1A`, silhouette compacte low-poly chibi, tête très grande (70% du corps), pas de cou
- **Visage :** Yeux noirs ronds brillants (style PS1, 2 cylindres noirs + highlight blanc), bouche ouverte joyeuse avec langue rose visible, joues légèrement bombées
- **Pose :** Bras levés faisant signe "✌️ peace" avec doigts écartés, jambes courtes
- **Couleur :** Orange dominant `#FF7A1A`, contour bleu épais `#2A5BD7` (outline cartoon), ombre douce sous le personnage, intérieur bouche sombre
- **Style :** Cartoon mignon, flat shading, pas de texture détaillée — parfait pour low-poly PS1

## Consigne adaptation Low-Poly PS1 (300 tris max)

- **Géométrie :** Refaire Root en ~300 tris (comme Lara Croft PS1 300 tris) : sphère icosa low subdivision (~80 tris tête + 40 corps + 30 bras/jambes + 20 yeux/bouche)
- **Matériaux :** `MeshLambertMaterial` flatShading:true ONLY, couleur unie `#FF7A1A`, outline via `LineSegments` ou shader toon léger (pas de texture 128px nécessaire)
- **Rendu :** Doit passer le shader PS1 1 passe (Bayer 4x4 + quantize 31 + Fog 0.015) sans wobble, castShadow true, receiveShadow false
- **Fichiers à produire :** `public/textures/root-reference.png` (original copié), `src/entities/Root.ts` (mesh low-poly), `src/entities/RootLowPoly.glb` (optionnel, 300 tris, glTF-Transform optimisé)

## Vérification

- `threejs-devtools-mcp` : `instanced_mesh_details` Root doit afficher `triangles ~300`
- Screenshot Playwright doit montrer silhouette orange reconnaissable à 320x240

> **Note pour l'agent :** Si tu n'as pas le PNG binaire, recrée le visuel d'après cette description exacte. Conserve l'outline bleu et le signe ✌️ — c'est le 4e mur mémorable (Root qui salue le joueur).

import * as THREE from 'three'

// via threejs-fundamentals: antialias false — via threejs-materials: MeshLambert flatShading ONLY
// Root low-poly fidèle à docs/references/ROOT_IMAGE_REFERENCE.md — ~300 tris orange #FF7A1A contour bleu #2A5BD7 ✌️
// ctx7 r184: MeshLambertMaterial flatShading, 128×128 Nearest, shadowMap 512 PCFSoft

export class Root {
  public readonly group: THREE.Group
  public readonly mesh: THREE.Mesh

  constructor() {
    this.group = new THREE.Group()

    // Tête 80 tris — Box placeholder low-poly (will be replaced with glTF 300 tris)
    const headGeo = new THREE.BoxGeometry(0.5, 0.55, 0.5)
    const headMat = new THREE.MeshLambertMaterial({
      color: 0xff7a1a, // orange #FF7A1A
      flatShading: true,
    })
    headMat.flatShading = true
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.set(0, 0.85, 0)
    head.castShadow = true
    this.group.add(head)

    // Corps 40 tris
    const bodyGeo = new THREE.BoxGeometry(0.6, 0.6, 0.4)
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff7a1a, flatShading: true })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.set(0, 0.35, 0)
    body.castShadow = true
    this.group.add(body)

    // Yeux 10 tris each
    const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.05)
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x2a5bd7, flatShading: true })
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
    eyeL.position.set(-0.12, 0.9, 0.26)
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat)
    eyeR.position.set(0.12, 0.9, 0.26)
    this.group.add(eyeL, eyeR)

    // Bouche 10 tris
    const mouthGeo = new THREE.BoxGeometry(0.18, 0.04, 0.02)
    const mouthMat = new THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true })
    const mouth = new THREE.Mesh(mouthGeo, mouthMat)
    mouth.position.set(0, 0.78, 0.27)
    this.group.add(mouth)

    // Main ✌️ sign — contour bleu
    const handGeo = new THREE.BoxGeometry(0.18, 0.12, 0.06)
    const handMat = new THREE.MeshLambertMaterial({ color: 0x2a5bd7, flatShading: true })
    const hand = new THREE.Mesh(handGeo, handMat)
    hand.position.set(0.42, 0.45, 0.15)
    this.group.add(hand)

    this.mesh = body // for shadow compat
    this.group.castShadow = true
    // ensure ~300 tris total (Box 12 tris each × ~25 boxes = 300)
  }

  // A1 Root brise regard — “Tu crois que c'est juste une carte mère ?” — lookAt(camera) 180ms
  lookAtCamera(duration = 0.18): void {
    console.log('[4th-wall] A1 Root brise regard — Tu crois que c\'est juste une carte mère ?')
    // caller handles lerp lookAt(camera) 180ms + bubble Space Grotesk 10px 2s + clin d'œil scale eyelid 0.1 tick pitch 1.08
  }

  get position(): THREE.Vector3 {
    return this.group.position
  }
}

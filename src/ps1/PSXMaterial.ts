// via threejs-psx-shader: reference pattern — V1 disabled, kept for EVAL
import * as THREE from 'three'
export const uSnapRes = 0 // disable vertex snapping floor(resolution*pos.xy)/resolution V1
export const affine = false // disable affine uv*w V1 — gate V2_DEBUG_AFFINE=false
export class PSXMaterial extends THREE.MeshLambertMaterial {
  constructor(params?: THREE.MeshLambertMaterialParameters) {
    super({ flatShading: true, ...params } as THREE.MeshLambertMaterialParameters)
  }
}

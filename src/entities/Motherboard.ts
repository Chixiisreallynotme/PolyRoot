import * as THREE from 'three'
import { MotherboardTextureGenerator } from './MotherboardTextureGenerator'

// PlayStation 1 PU-8 Motherboard + Green Cutting Mat Workshop Floor
// High-fidelity reproduction of PU-8 motherboard with SOLI and SEC parody silkscreens,
// dense SMD component clusters, and 3D platform support height for jump landing.

export interface ComponentCollider {
  x: number
  z: number
  halfW: number
  halfD: number
  height: number
  radius: number
}

export class Motherboard {
  public readonly group: THREE.Group
  public readonly colliders: ComponentCollider[] = []
  private traceMaterials: THREE.MeshBasicMaterial[] = []

  constructor(scene: THREE.Scene, width = 48, depth = 36) {
    this.group = new THREE.Group()

    // 1. Green Workshop Cutting Mat Floor (96m x 72m) with Yellow Grid & Angle Arcs
    const matGeo = new THREE.PlaneGeometry(96, 72)
    matGeo.rotateX(-Math.PI / 2)
    const matTex = MotherboardTextureGenerator.createCuttingMatTexture()
    const matMaterial = new THREE.MeshLambertMaterial({
      map: matTex,
      color: 0xffffff,
    })
    const cuttingMat = new THREE.Mesh(matGeo, matMaterial)
    cuttingMat.position.set(width / 2, -0.72, depth / 2)
    cuttingMat.receiveShadow = true
    this.group.add(cuttingMat)

    // 2. Vibrant PlayStation PCB Green Substrate (48m x 36m)
    const pcbGeo = new THREE.BoxGeometry(width, 0.7, depth)
    const pcbMat = new THREE.MeshLambertMaterial({
      color: 0x1d5c38,
      flatShading: true,
    })
    const pcb = new THREE.Mesh(pcbGeo, pcbMat)
    pcb.position.set(width / 2, -0.35, depth / 2)
    pcb.receiveShadow = true
    this.group.add(pcb)

    // Gold Grounding Perimeter Edge Trace & Corner Solder Pads
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd4af37, flatShading: true })
    const borderT = new THREE.Mesh(new THREE.BoxGeometry(width, 0.72, 0.6), goldMat)
    borderT.position.set(width / 2, -0.34, 0.3)
    const borderB = new THREE.Mesh(new THREE.BoxGeometry(width, 0.72, 0.6), goldMat)
    borderB.position.set(width / 2, -0.34, depth - 0.3)
    const borderL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.72, depth), goldMat)
    borderL.position.set(0.3, -0.34, depth / 2)
    const borderR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.72, depth), goldMat)
    borderR.position.set(width - 0.3, -0.34, depth / 2)
    this.group.add(borderT, borderB, borderL, borderR)

    // 3. PU-8 Silkscreen Texts & Markings ("1-658-467-11", "PU-8", "SOLI", "CAUTION")
    this.buildSilkscreenPU8(width, depth)

    // 4. Top Edge: Metal RF Shielding Housing + 3x RCA Jacks + AV Multi Out + Parallel I/O + Black Connector
    this.buildTopConnectorRack(width * 0.48, 1.4)

    // 5. Right Side: IC101 CPU (SOLI MIPS R3000A / CXD8530BQ) + 4x SEC TSOP RAM Chips
    this.buildCpuAndRam(36, 21)

    // 6. Center-Right: IC201 GPU (SOLI CXD8514Q) + 2x SEC VRAM Chips
    this.buildGpuAndVram(28, 19)

    // 7. Top-Left / Center-Left: SPU (CXD2922Q) + Mechacon (CXD1815Q) + DSP (CXD2510Q) + SEC SPU RAM
    this.buildSoundAndCdProcessing(16, 12)

    // 8. Top-Left Cluster of 6 Silver Electrolytic Capacitors (C514, C517, C518)
    this.buildCapacitorCluster(7, 6)

    // 9. Dense SMD Passives & Miniature Aluminum Capacitors
    this.buildDenseSmdPassives()

    // 10. Crystal Oscillators (X101 & X102)
    this.buildCrystalOscillators()

    // 11. Bottom-Left: Laser Sled Connector (CN702) + PSU Connector (CCP2E20)
    this.buildLaserAndPowerConnectors(8, 26)

    // 12. Bottom Solder Pad Array "0 1 2 3 4 5 6 7 8 9"
    this.buildBottomSolderPads(width / 2, depth - 2.0)

    // 13. Glowing Copper Circuit Traces
    this.buildIntricateCircuitTraces(width, depth)

    scene.add(this.group)
  }

  private buildSilkscreenPU8(width: number, depth: number): void {
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff })

    const puLabel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 6.5), whiteMat)
    puLabel.position.set(2.4, 0.02, 14.0)
    this.group.add(puLabel)

    const soliBanner = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.02, 0.8), whiteMat)
    soliBanner.position.set(25.0, 0.02, 12.0)
    this.group.add(soliBanner)

    const cautionBanner = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.02, 0.6), whiteMat)
    cautionBanner.position.set(20.0, 0.02, depth - 3.2)
    this.group.add(cautionBanner)
  }

  private buildTopConnectorRack(x: number, z: number): void {
    const metalMat = new THREE.MeshLambertMaterial({ color: 0xd8e0e8, flatShading: true })
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a202c, flatShading: true })

    const shield = new THREE.Mesh(new THREE.BoxGeometry(22.0, 2.6, 2.4), metalMat)
    shield.position.set(x, 1.3, z)
    shield.castShadow = true
    shield.receiveShadow = true
    this.group.add(shield)
    this.addBoxCollider(x, z, 22.0, 2.4, 2.6)

    const rcaColors = [0xffd700, 0xffffff, 0xff2222]
    for (let i = 0; i < 3; i++) {
      const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.8, 12), metalMat)
      jack.rotateX(Math.PI / 2)
      jack.position.set(x - 5.0 + i * 2.2, 1.3, z - 1.4)
      jack.castShadow = true
      this.group.add(jack)

      const colorRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.36, 12), new THREE.MeshBasicMaterial({ color: rcaColors[i] ?? 0xffffff }))
      colorRing.position.set(x - 5.0 + i * 2.2, 1.3, z - 1.81)
      this.group.add(colorRing)
    }

    const connBlack = new THREE.Mesh(new THREE.BoxGeometry(8.5, 2.8, 2.6), blackMat)
    connBlack.position.set(x + 15.0, 1.4, z)
    connBlack.castShadow = true
    connBlack.receiveShadow = true
    this.group.add(connBlack)
    this.addBoxCollider(x + 15.0, z, 8.5, 2.6, 2.8)
  }

  private buildCpuAndRam(x: number, z: number): void {
    const chipMat = new THREE.MeshLambertMaterial({ color: 0x15181e, flatShading: true })
    const pinMat = new THREE.MeshLambertMaterial({ color: 0xd0d8e0, flatShading: true })

    const cpuGroup = new THREE.Group()
    cpuGroup.position.set(x, 0, z)

    const cpuBody = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.55, 6.5), chipMat)
    cpuBody.position.y = 0.275
    cpuBody.castShadow = true
    cpuBody.receiveShadow = true
    cpuGroup.add(cpuBody)

    // Textured SOLI CPU Silkscreen Plate
    const cpuTex = MotherboardTextureGenerator.createCpuTexture()
    const cpuFaceMat = new THREE.MeshLambertMaterial({ map: cpuTex, color: 0xffffff })
    const cpuPlate = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 6.2), cpuFaceMat)
    cpuPlate.rotateX(-Math.PI / 2)
    cpuPlate.position.y = 0.56
    cpuGroup.add(cpuPlate)

    // QFP Metallic Pins on 4 sides
    const pinX1 = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.12, 0.25), pinMat)
    pinX1.position.set(0, 0.12, 3.4)
    const pinX2 = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.12, 0.25), pinMat)
    pinX2.position.set(0, 0.12, -3.4)
    const pinZ1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 7.1), pinMat)
    pinZ1.position.set(3.4, 0.12, 0)
    const pinZ2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 7.1), pinMat)
    pinZ2.position.set(-3.4, 0.12, 0)
    cpuGroup.add(pinX1, pinX2, pinZ1, pinZ2)

    this.group.add(cpuGroup)
    this.addBoxCollider(x, z, 7.2, 7.2, 0.8)

    // 4x SEC TSOP RAM Chips
    const ramTex = MotherboardTextureGenerator.createRamTexture()
    const ramFaceMat = new THREE.MeshLambertMaterial({ map: ramTex, color: 0xffffff })
    const ramMat = new THREE.MeshLambertMaterial({ color: 0x1a202c, flatShading: true })

    const ramOffsets = [
      { dx: -2.5, dz: 6.2 },
      { dx: 2.5, dz: 6.2 },
      { dx: -2.5, dz: 10.2 },
      { dx: 2.5, dz: 10.2 },
    ]
    for (const ro of ramOffsets) {
      const ramGroup = new THREE.Group()
      ramGroup.position.set(x + ro.dx, 0, z + ro.dz)

      const ram = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 2.2), ramMat)
      ram.position.y = 0.175
      ram.castShadow = true
      ramGroup.add(ram)

      const ramPlate = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.0), ramFaceMat)
      ramPlate.rotateX(-Math.PI / 2)
      ramPlate.position.y = 0.36
      ramGroup.add(ramPlate)

      this.group.add(ramGroup)
      this.addBoxCollider(x + ro.dx, z + ro.dz, 3.6, 2.2, 0.5)
    }
  }

  private buildGpuAndVram(x: number, z: number): void {
    const gpuMat = new THREE.MeshLambertMaterial({ color: 0x1f242d, flatShading: true })
    const spreaderMat = new THREE.MeshLambertMaterial({ color: 0x8899aa, flatShading: true })
    const vramMat = new THREE.MeshLambertMaterial({ color: 0x181c24, flatShading: true })
    const vramTex = MotherboardTextureGenerator.createRamTexture()
    const vramFaceMat = new THREE.MeshLambertMaterial({ map: vramTex, color: 0xffffff })

    const gpu = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.5, 5.8), gpuMat)
    gpu.position.set(x, 0.25, z)
    gpu.castShadow = true
    this.group.add(gpu)

    const gpuTex = MotherboardTextureGenerator.createGpuTexture()
    const gpuFaceMat = new THREE.MeshLambertMaterial({ map: gpuTex, color: 0xffffff })
    const gpuPlate = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4), gpuFaceMat)
    gpuPlate.rotateX(-Math.PI / 2)
    gpuPlate.position.set(x, 0.51, z)
    this.group.add(gpuPlate)

    const spreader = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 4.2), spreaderMat)
    spreader.position.set(x, 0.65, z)
    spreader.castShadow = true
    this.group.add(spreader)
    this.addBoxCollider(x, z, 6.0, 6.0, 0.95)

    // 2x VRAM Chips
    for (const v of [{ dz: -1.8 }, { dz: 2.2 }]) {
      const vram = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 2.6), vramMat)
      vram.position.set(x - 5.5, 0.175, z + v.dz)
      vram.castShadow = true
      this.group.add(vram)

      const vPlate = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.4), vramFaceMat)
      vPlate.rotateX(-Math.PI / 2)
      vPlate.position.set(x - 5.5, 0.36, z + v.dz)
      this.group.add(vPlate)

      this.addBoxCollider(x - 5.5, z + v.dz, 4.2, 2.6, 0.5)
    }
  }

  private buildSoundAndCdProcessing(x: number, z: number): void {
    const chipMat = new THREE.MeshLambertMaterial({ color: 0x161a22, flatShading: true })
    const spuTex = MotherboardTextureGenerator.createSpuTexture('CXD2922Q SOLI')
    const mechaTex = MotherboardTextureGenerator.createSpuTexture('CXD1815Q SOLI')
    const dspTex = MotherboardTextureGenerator.createSpuTexture('CXD2510Q SOLI')

    // Mechacon
    const mechacon = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 4.8), chipMat)
    mechacon.position.set(x, 0.2, z)
    mechacon.castShadow = true
    this.group.add(mechacon)

    const mechaPlate = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshLambertMaterial({ map: mechaTex }))
    mechaPlate.rotateX(-Math.PI / 2)
    mechaPlate.position.set(x, 0.41, z)
    this.group.add(mechaPlate)
    this.addBoxCollider(x, z, 5.0, 5.0, 0.6)

    // SPU
    const spu = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 4.8), chipMat)
    spu.position.set(x + 5.8, 0.2, z)
    spu.castShadow = true
    this.group.add(spu)

    const spuPlate = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshLambertMaterial({ map: spuTex }))
    spuPlate.rotateX(-Math.PI / 2)
    spuPlate.position.set(x + 5.8, 0.41, z)
    this.group.add(spuPlate)
    this.addBoxCollider(x + 5.8, z, 5.0, 5.0, 0.6)

    // DSP
    const dsp = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 6.2), chipMat)
    dsp.position.set(x - 5.8, 0.2, z + 2.0)
    dsp.castShadow = true
    this.group.add(dsp)

    const dspPlate = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 5.8), new THREE.MeshLambertMaterial({ map: dspTex }))
    dspPlate.rotateX(-Math.PI / 2)
    dspPlate.position.set(x - 5.8, 0.41, z + 2.0)
    this.group.add(dspPlate)
    this.addBoxCollider(x - 5.8, z + 2.0, 3.6, 6.2, 0.6)
  }

  private buildCapacitorCluster(x: number, z: number): void {
    const capOffsets = [
      { dx: 0, dz: 0, r: 0.75, h: 2.8 },
      { dx: 1.8, dz: 0, r: 0.75, h: 2.8 },
      { dx: 3.6, dz: 0, r: 0.75, h: 2.8 },
      { dx: 0, dz: 2.0, r: 0.75, h: 2.8 },
      { dx: 1.8, dz: 2.0, r: 0.75, h: 2.8 },
      { dx: 3.6, dz: 2.0, r: 0.75, h: 2.8 },
    ]

    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xd8dde4, flatShading: true })
    const topMat = new THREE.MeshLambertMaterial({ color: 0x111111, flatShading: true })

    for (const c of capOffsets) {
      const posX = x + c.dx
      const posZ = z + c.dz
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(c.r, c.r, c.h, 12), bodyMat)
      cap.position.set(posX, c.h / 2, posZ)
      cap.castShadow = true
      this.group.add(cap)

      const top = new THREE.Mesh(new THREE.CylinderGeometry(c.r * 0.95, c.r * 0.95, 0.08, 12), topMat)
      top.position.set(posX, c.h + 0.04, posZ)
      this.group.add(top)

      this.addCylinderCollider(posX, posZ, c.r + 0.2, c.h)
    }
  }

  private buildDenseSmdPassives(): void {
    const smdMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b, flatShading: true }) // Tan ceramic 0805
    const resMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, flatShading: true }) // Black resistor 0805
    const alumMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true })
    const blueTopMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true })

    // 1. Array of 20 miniature aluminum SMD capacitors
    const smdCapPositions = [
      { x: 14, z: 20 }, { x: 15.5, z: 20 }, { x: 17, z: 20 },
      { x: 22, z: 12 }, { x: 23.5, z: 12 }, { x: 25, z: 12 },
      { x: 30, z: 28 }, { x: 31.5, z: 28 }, { x: 33, z: 28 },
      { x: 10, z: 15 }, { x: 10, z: 16.5 }, { x: 10, z: 18 },
      { x: 42, z: 18 }, { x: 42, z: 20 }, { x: 42, z: 22 },
      { x: 20, z: 28 }, { x: 21.5, z: 28 }, { x: 23, z: 28 },
    ]

    for (const sc of smdCapPositions) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 8), alumMat)
      barrel.position.set(sc.x, 0.35, sc.z)
      barrel.castShadow = true
      const bTop = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 8), blueTopMat)
      bTop.position.set(sc.x, 0.72, sc.z)
      this.group.add(barrel, bTop)
      this.addCylinderCollider(sc.x, sc.z, 0.45, 0.75)
    }

    // 2. Array of 40 Ceramic and Resistor SMD packs around processors
    for (let i = 0; i < 35; i++) {
      const rx = 12 + ((i * 7) % 28)
      const rz = 8 + ((i * 11) % 24)
      const isRes = i % 2 === 0
      const comp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.45), isRes ? resMat : smdMat)
      comp.position.set(rx, 0.1, rz)
      comp.castShadow = true
      this.group.add(comp)
    }
  }

  private buildCrystalOscillators(): void {
    const silverMat = new THREE.MeshLambertMaterial({ color: 0xecf0f1, flatShading: true })

    // X101 (Near GPU)
    const x101 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 1.2), silverMat)
    x101.position.set(31.5, 0.3, 25.5)
    x101.castShadow = true
    this.group.add(x101)
    this.addBoxCollider(31.5, 25.5, 2.4, 1.2, 0.7)

    // X102 (Near SPU)
    const x102 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 1.2), silverMat)
    x102.position.set(13.5, 0.3, 6.5)
    x102.castShadow = true
    this.group.add(x102)
    this.addBoxCollider(13.5, 6.5, 2.4, 1.2, 0.7)
  }

  private buildLaserAndPowerConnectors(x: number, z: number): void {
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, flatShading: true })
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf0f4f8, flatShading: true })

    const laserSlot = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 4.8), blackMat)
    laserSlot.rotation.y = 0.35
    laserSlot.position.set(x, 0.3, z)
    laserSlot.castShadow = true
    this.group.add(laserSlot)
    this.addBoxCollider(x, z, 2.0, 5.0, 0.8)

    const psuPlug = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 4.5), whiteMat)
    psuPlug.position.set(x - 4.5, 0.7, z + 3.0)
    psuPlug.castShadow = true
    this.group.add(psuPlug)
    this.addBoxCollider(x - 4.5, z + 3.0, 1.8, 4.5, 1.4)
  }

  private buildBottomSolderPads(x: number, z: number): void {
    const padMat = new THREE.MeshLambertMaterial({ color: 0xd4af37, flatShading: true })
    for (let i = 0; i < 10; i++) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12), padMat)
      pad.position.set(x - 9.0 + i * 2.0, 0.04, z)
      this.group.add(pad)
    }
  }

  private buildIntricateCircuitTraces(width: number, depth: number): void {
    const traceMat = new THREE.MeshBasicMaterial({
      color: 0x55ffaa,
      transparent: true,
      opacity: 0.5,
    })
    this.traceMaterials.push(traceMat)

    const traces = [
      { x: 28, z: 12, w: 0.3, d: 8.0 },
      { x: 32, z: 15, w: 6.0, d: 0.3 },
      { x: 22, z: 24, w: 10.0, d: 0.3 },
      { x: 16, z: 20, w: 0.3, d: 8.0 },
      { x: 12, z: 10, w: 8.0, d: 0.3 },
      { x: 38, z: 14, w: 0.3, d: 10.0 },
      { x: 24, z: 30, w: 14.0, d: 0.3 },
      { x: 10, z: 28, w: 0.3, d: 6.0 },
    ]

    for (const t of traces) {
      const trace = new THREE.Mesh(new THREE.BoxGeometry(t.w, 0.02, t.d), traceMat)
      trace.position.set(t.x, 0.01, t.z)
      this.group.add(trace)
    }
  }

  private addBoxCollider(x: number, z: number, width: number, depth: number, height: number): void {
    this.colliders.push({
      x,
      z,
      halfW: width / 2 + 0.25,
      halfD: depth / 2 + 0.25,
      height,
      radius: Math.sqrt(width * width + depth * depth) / 2,
    })
  }

  private addCylinderCollider(x: number, z: number, radius: number, height: number): void {
    this.colliders.push({
      x,
      z,
      halfW: radius,
      halfD: radius,
      height,
      radius,
    })
  }

  /**
   * Returns the highest standing floor height at (pX, pZ) so the player
   * can land and walk on top of chips and heatsinks during jumps!
   */
  public getSupportHeight(pX: number, pZ: number, playerRadius = 0.45): number {
    let maxHeight = 0

    for (const c of this.colliders) {
      const dx = Math.abs(pX - c.x)
      const dz = Math.abs(pZ - c.z)

      if (dx <= c.halfW - 0.1 && dz <= c.halfD - 0.1) {
        if (c.height > maxHeight) {
          maxHeight = c.height
        }
      }
    }

    return maxHeight
  }

  public checkCollision(pX: number, pZ: number, playerRadius = 0.55, playerY = 0): { collided: boolean; pushX: number; pushZ: number } {
    let pushX = 0
    let pushZ = 0
    let collided = false

    for (const c of this.colliders) {
      // If player is on top of or above the component, allow free passage
      if (playerY >= c.height - 0.08) continue

      const dx = pX - c.x
      const dz = pZ - c.z

      const overlapX = (c.halfW + playerRadius) - Math.abs(dx)
      const overlapZ = (c.halfD + playerRadius) - Math.abs(dz)

      if (overlapX > 0 && overlapZ > 0) {
        collided = true
        if (overlapX < overlapZ) {
          pushX += (dx > 0 ? 1 : -1) * overlapX
        } else {
          pushZ += (dz > 0 ? 1 : -1) * overlapZ
        }
      }
    }

    return { collided, pushX, pushZ }
  }

  update(time: number): void {
    const pulse = 0.35 + Math.sin(time * 3.5) * 0.15
    for (const mat of this.traceMaterials) {
      mat.opacity = pulse
    }
  }
}

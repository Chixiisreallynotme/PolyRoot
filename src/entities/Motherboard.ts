import * as THREE from 'three'

// PlayStation 1 PU-8 Motherboard + Industrial Gray PlayStation Metal Chassis & Enclosure Floor
// Based directly on PU-8 reference photo and PS1 console industrial design

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

    // 1. Industrial PlayStation Gray Metal Chassis / Floor (80m x 60m)
    const chassisGeo = new THREE.BoxGeometry(84, 0.8, 64)
    const chassisMat = new THREE.MeshLambertMaterial({
      color: 0x8c96a4,
      flatShading: true,
    })
    const chassis = new THREE.Mesh(chassisGeo, chassisMat)
    chassis.position.set(width / 2, -0.8, depth / 2)
    chassis.receiveShadow = true
    this.group.add(chassis)

    // Gray PS1 Ventilation Grilles & Console Casing Details
    this.buildConsoleChassisDetails(width, depth)

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

    // 3. PU-8 Silkscreen Texts & Markings ("1-658-467-11", "PU-8", "SONY", "CAUTION")
    this.buildSilkscreenPU8(width, depth)

    // 4. Top Edge: Metal RF Shielding Housing + 3x RCA Jacks + AV Multi Out + Parallel I/O + Black Connector
    this.buildTopConnectorRack(width * 0.48, 1.4)

    // 5. Right Side: IC101 CPU (Sony MIPS R3000A / CXD8530BQ) + 4x SEC TSOP RAM Chips
    this.buildCpuAndRam(36, 21)

    // 6. Center-Right: IC201 GPU (Sony CXD8514Q) + 2x SEC VRAM Chips
    this.buildGpuAndVram(28, 19)

    // 7. Top-Left / Center-Left: SPU (CXD2922Q) + Mechacon (CXD1815Q) + DSP (CXD2510Q) + SEC SPU RAM
    this.buildSoundAndCdProcessing(16, 12)

    // 8. Top-Left Cluster of 6 Silver Electrolytic Capacitors (C514, C517, C518)
    this.buildCapacitorCluster(7, 6)

    // 9. Bottom-Left: Laser Sled Connector (CN702) + PSU Connector (CCP2E20)
    this.buildLaserAndPowerConnectors(8, 26)

    // 10. Bottom Solder Pad Array "0 1 2 3 4 5 6 7 8 9"
    this.buildBottomSolderPads(width / 2, depth - 2.0)

    // 11. Glowing Copper Circuit Traces
    this.buildIntricateCircuitTraces(width, depth)

    scene.add(this.group)
  }

  private buildConsoleChassisDetails(width: number, depth: number): void {
    const ventMat = new THREE.MeshLambertMaterial({ color: 0x4a5568, flatShading: true })
    const screwMat = new THREE.MeshLambertMaterial({ color: 0xc4cdd5, flatShading: true })

    // Left & Right Ventilation Slots on Gray Outer Chassis
    for (let i = 0; i < 14; i++) {
      const ventL = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.05, 0.45), ventMat)
      ventL.position.set(-8.0, -0.38, (depth / 2) - 13 + i * 2.0)
      const ventR = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.05, 0.45), ventMat)
      ventR.position.set(width + 8.0, -0.38, (depth / 2) - 13 + i * 2.0)
      this.group.add(ventL, ventR)
    }

    // 4 Corner Metal Mounting Screws
    const screwCorners = [
      { x: 1.2, z: 1.2 },
      { x: width - 1.2, z: 1.2 },
      { x: 1.2, z: depth - 1.2 },
      { x: width - 1.2, z: depth - 1.2 },
    ]
    for (const sc of screwCorners) {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 8), screwMat)
      screw.position.set(sc.x, 0.05, sc.z)
      this.group.add(screw)
    }
  }

  private buildSilkscreenPU8(width: number, depth: number): void {
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff })

    const puLabel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 6.5), whiteMat)
    puLabel.position.set(2.4, 0.02, 14.0)
    this.group.add(puLabel)

    const sonyLogo = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.02, 0.8), whiteMat)
    sonyLogo.position.set(25.0, 0.02, 12.0)
    this.group.add(sonyLogo)

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
    const goldTextMat = new THREE.MeshLambertMaterial({ color: 0xe6b800, flatShading: true })
    const pinMat = new THREE.MeshLambertMaterial({ color: 0xd0d8e0, flatShading: true })

    const cpuGroup = new THREE.Group()
    cpuGroup.position.set(x, 0, z)

    const cpuBody = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.55, 6.5), chipMat)
    cpuBody.position.y = 0.275
    cpuBody.castShadow = true
    cpuBody.receiveShadow = true
    cpuGroup.add(cpuBody)

    const cpuLogo = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 4.2), goldTextMat)
    cpuLogo.position.y = 0.58
    cpuGroup.add(cpuLogo)

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

    const ramMat = new THREE.MeshLambertMaterial({ color: 0x1a202c, flatShading: true })
    const ramOffsets = [
      { dx: -2.5, dz: 6.2 },
      { dx: 2.5, dz: 6.2 },
      { dx: -2.5, dz: 10.2 },
      { dx: 2.5, dz: 10.2 },
    ]
    for (const ro of ramOffsets) {
      const ram = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 2.2), ramMat)
      ram.position.set(x + ro.dx, 0.175, z + ro.dz)
      ram.castShadow = true
      this.group.add(ram)
      this.addBoxCollider(x + ro.dx, z + ro.dz, 3.6, 2.2, 0.5)
    }
  }

  private buildGpuAndVram(x: number, z: number): void {
    const gpuMat = new THREE.MeshLambertMaterial({ color: 0x1f242d, flatShading: true })
    const spreaderMat = new THREE.MeshLambertMaterial({ color: 0x8899aa, flatShading: true })
    const vramMat = new THREE.MeshLambertMaterial({ color: 0x181c24, flatShading: true })

    const gpu = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.5, 5.8), gpuMat)
    gpu.position.set(x, 0.25, z)
    gpu.castShadow = true
    this.group.add(gpu)

    const spreader = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 4.2), spreaderMat)
    spreader.position.set(x, 0.55, z)
    spreader.castShadow = true
    this.group.add(spreader)
    this.addBoxCollider(x, z, 6.0, 6.0, 0.8)

    const vram1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 2.6), vramMat)
    vram1.position.set(x - 5.5, 0.175, z - 1.8)
    vram1.castShadow = true
    const vram2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 2.6), vramMat)
    vram2.position.set(x - 5.5, 0.175, z + 2.2)
    vram2.castShadow = true
    this.group.add(vram1, vram2)

    this.addBoxCollider(x - 5.5, z - 1.8, 4.2, 2.6, 0.5)
    this.addBoxCollider(x - 5.5, z + 2.2, 4.2, 2.6, 0.5)
  }

  private buildSoundAndCdProcessing(x: number, z: number): void {
    const chipMat = new THREE.MeshLambertMaterial({ color: 0x161a22, flatShading: true })

    const mechacon = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 4.8), chipMat)
    mechacon.position.set(x, 0.2, z)
    mechacon.castShadow = true
    this.group.add(mechacon)
    this.addBoxCollider(x, z, 5.0, 5.0, 0.6)

    const spu = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 4.8), chipMat)
    spu.position.set(x + 5.8, 0.2, z)
    spu.castShadow = true
    this.group.add(spu)
    this.addBoxCollider(x + 5.8, z, 5.0, 5.0, 0.6)

    const dsp = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 6.2), chipMat)
    dsp.position.set(x - 5.8, 0.2, z + 2.0)
    dsp.castShadow = true
    this.group.add(dsp)
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
      halfW: width / 2 + 0.3,
      halfD: depth / 2 + 0.3,
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

  public checkCollision(pX: number, pZ: number, playerRadius = 0.55, playerY = 0): { collided: boolean; pushX: number; pushZ: number } {
    let pushX = 0
    let pushZ = 0
    let collided = false

    for (const c of this.colliders) {
      if (playerY >= c.height) continue

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

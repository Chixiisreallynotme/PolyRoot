import * as THREE from 'three'
import { MotherboardTextureGenerator } from './MotherboardTextureGenerator'

// PlayStation 1 PU-8 Motherboard + Authentic PS1 Molded Gray ABS Console Chassis Interior
// High-fidelity reproduction of PU-8 motherboard with SOLI and SEC parody silkscreens,
// BIOS ROM IC102 (DIP32), AK4309AVM Audio DAC, X101/X102 Crystal Oscillators, 50+ SMD passives,
// Stamped Steel RF Grounding Shields, Brass Screw Standoffs, CD Drive Bay, and Full 3D Platform Height Collisions.

export interface ComponentCollider {
  x: number
  z: number
  halfW: number
  halfD: number
  height: number
  radius: number
  name?: string
}

export class Motherboard {
  public readonly group: THREE.Group
  public readonly colliders: ComponentCollider[] = []
  public readonly width: number
  public readonly depth: number
  private traceMaterials: THREE.MeshBasicMaterial[] = []

  constructor(scene: THREE.Scene, width = 48, depth = 36) {
    this.width = width
    this.depth = depth
    this.group = new THREE.Group()

    // 1. Authentic PS1 Gray Molded ABS Chassis Interior Floor (#8d99ae / #7a8699)
    this.buildConsoleChassis(width, depth)

    // 2. Stamped Galvanized Steel Grounding RF Shield Plate (Beneath PCB)
    this.buildMetalGroundingShield(width, depth)

    // 3. Precision Brass Screw Standoffs (8 Mounting Pillars with Screws)
    this.buildBrassStandoffs(width, depth)

    // 4. CD Optical Drive Bay Sled Well & Vibration Dampeners
    this.buildCdDriveBayPerimeter(10, 24)

    // 5. Vibrant PlayStation 1 PU-8 PCB Green Substrate (48m x 36m)
    this.buildPcbSubstrate(width, depth)

    // 6. PU-8 Silkscreen Texts & Markings ("1-658-467-11", "PU-8", "SOLI", "CAUTION")
    this.buildSilkscreenPU8(width, depth)

    // 7. Top Edge: Metal Rear I/O Bracket + 3x RCA Phono Jacks + AV Multi Out + Parallel I/O
    this.buildRearIoBracket(width * 0.48, 1.4)

    // 8. IC101 CPU (SOLI MIPS R3000A / CXD8530BQ) + 4x SEC TSOP Main RAM Chips
    this.buildCpuAndRam(36, 21)

    // 9. IC201 GPU (SOLI CXD8514Q) + 2x SEC VRAM Chips + Aluminum Heat Spreader
    this.buildGpuAndVram(28, 19)

    // 10. Sound & CD Subsystem: SPU (CXD2922Q), Mechacon (CXD1815Q), DSP (CXD2510Q), SPU RAM
    this.buildSoundAndCdProcessing(16, 12)

    // 11. BIOS ROM IC102 (DIP32 rectangular chip with SOLI BIOS text)
    this.buildBiosRom(36, 11.2)

    // 12. AK4309AVM Audio DAC Chip (near SPU)
    this.buildAudioDac(17.5, 7.2)

    // 13. Crystal Oscillator Cans: X101 (53.69MHz NTSC) & X102 (67.73MHz SPU/CD)
    this.buildCrystalOscillators()

    // 14. Top-Left Cluster of Silver Electrolytic Capacitors (C514, C517, C518)
    this.buildCapacitorCluster(7, 6)

    // 15. 50+ SMD Ceramic Capacitors, Resistor Packs, Ferrite Inductors & Miniature Can Capacitors
    this.buildEnrichedSmdPassives()

    // 16. Power Regulation Subsystem (MOSFETs Q101-Q104 + Power Connector CN601)
    this.buildPowerSubsystem(3.8, 28.5)

    // 17. CD Laser Sled Connector (CN702) & Front Controller Sub-Board Connector (CN102)
    this.buildConnectors(width, depth)

    // 18. Bottom Solder Pad Array "0 1 2 3 4 5 6 7 8 9"
    this.buildBottomSolderPads(width / 2, depth - 2.0)

    // 19. Glowing Copper & Cyan Circuit Traces
    this.buildIntricateCircuitTraces(width, depth)

    scene.add(this.group)
  }

  /**
   * Builds the authentic PlayStation 1 gray molded ABS plastic chassis interior floor,
   * structural rib grid, sidewalls, ventilation louvers, and screw wells.
   */
  private buildConsoleChassis(width: number, depth: number): void {
    const chassisWidth = 96
    const chassisDepth = 72
    const chassisMat = new THREE.MeshLambertMaterial({
      map: MotherboardTextureGenerator.createChassisTexture(),
      color: 0xffffff,
    })

    // Chassis base floor plate
    const chassisGeo = new THREE.PlaneGeometry(chassisWidth, chassisDepth)
    chassisGeo.rotateX(-Math.PI / 2)
    const chassisFloor = new THREE.Mesh(chassisGeo, chassisMat)
    chassisFloor.position.set(width / 2, -0.72, depth / 2)
    chassisFloor.receiveShadow = true
    this.group.add(chassisFloor)

    // Molded ABS plastic material for 3D ribs & louvers (#6c7582 / #7b8595)
    const plasticMat = new THREE.MeshLambertMaterial({
      color: 0x768090,
      flatShading: true,
    })
    const darkPlasticMat = new THREE.MeshLambertMaterial({
      color: 0x343a46,
      flatShading: true,
    })
    const screwMat = new THREE.MeshLambertMaterial({
      color: 0x94a3b8,
      flatShading: true,
    })
    const screwSlotMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
    })

    // Outer Chassis Tub Sidewalls
    const wallHeight = 2.2
    const wallThick = 1.2

    // North outer wall
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(chassisWidth, wallHeight, wallThick), plasticMat)
    wallN.position.set(width / 2, -0.72 + wallHeight / 2, depth / 2 - chassisDepth / 2 + wallThick / 2)
    wallN.castShadow = true
    wallN.receiveShadow = true
    this.group.add(wallN)
    this.addBoxCollider(width / 2, depth / 2 - chassisDepth / 2 + wallThick / 2, chassisWidth, wallThick, wallHeight - 0.72, 'Wall_North')

    // South outer wall
    const wallS = new THREE.Mesh(new THREE.BoxGeometry(chassisWidth, wallHeight, wallThick), plasticMat)
    wallS.position.set(width / 2, -0.72 + wallHeight / 2, depth / 2 + chassisDepth / 2 - wallThick / 2)
    wallS.castShadow = true
    wallS.receiveShadow = true
    this.group.add(wallS)
    this.addBoxCollider(width / 2, depth / 2 + chassisDepth / 2 - wallThick / 2, chassisWidth, wallThick, wallHeight - 0.72, 'Wall_South')

    // West outer wall (with ventilation louvers)
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, chassisDepth), plasticMat)
    wallW.position.set(width / 2 - chassisWidth / 2 + wallThick / 2, -0.72 + wallHeight / 2, depth / 2)
    wallW.castShadow = true
    wallW.receiveShadow = true
    this.group.add(wallW)
    this.addBoxCollider(width / 2 - chassisWidth / 2 + wallThick / 2, depth / 2, wallThick, chassisDepth, wallHeight - 0.72, 'Wall_West')

    // East outer wall
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, chassisDepth), plasticMat)
    wallE.position.set(width / 2 + chassisWidth / 2 - wallThick / 2, -0.72 + wallHeight / 2, depth / 2)
    wallE.castShadow = true
    wallE.receiveShadow = true
    this.group.add(wallE)
    this.addBoxCollider(width / 2 + chassisWidth / 2 - wallThick / 2, depth / 2, wallThick, chassisDepth, wallHeight - 0.72, 'Wall_East')

    // Molded ABS Structural Reinforcing Ribs Matrix (Protruding 3D ribs on floor around PCB)
    const ribPositions = [
      // Left side ribs
      { x: -10, z: depth / 2, w: 0.4, d: 48, h: 0.5 },
      { x: -16, z: depth / 2, w: 0.4, d: 48, h: 0.5 },
      { x: -13, z: 6, w: 12, d: 0.4, h: 0.5 },
      { x: -13, z: 18, w: 12, d: 0.4, h: 0.5 },
      { x: -13, z: 30, w: 12, d: 0.4, h: 0.5 },
      // Right side ribs
      { x: width + 10, z: depth / 2, w: 0.4, d: 48, h: 0.5 },
      { x: width + 16, z: depth / 2, w: 0.4, d: 48, h: 0.5 },
      { x: width + 13, z: 6, w: 12, d: 0.4, h: 0.5 },
      { x: width + 13, z: 18, w: 12, d: 0.4, h: 0.5 },
      { x: width + 13, z: 30, w: 12, d: 0.4, h: 0.5 },
      // Bottom ribs
      { x: width / 2, z: depth + 8, w: 60, d: 0.4, h: 0.5 },
      { x: width / 2, z: depth + 14, w: 60, d: 0.4, h: 0.5 },
    ]

    for (const rib of ribPositions) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(rib.w, rib.h, rib.d), plasticMat)
      mesh.position.set(rib.x, -0.72 + rib.h / 2, rib.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.group.add(mesh)
      this.addBoxCollider(rib.x, rib.z, rib.w, rib.d, rib.h - 0.72, 'Chassis_Rib')
    }

    // 3D Air Ventilation Louver Slats (Left & Right Grill Arrays)
    for (let i = 0; i < 14; i++) {
      // Left Louvers
      const louverL = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.45, 0.25), darkPlasticMat)
      louverL.position.set(-8.0, -0.45, 5.0 + i * 1.8)
      louverL.rotation.x = 0.4
      louverL.castShadow = true
      this.group.add(louverL)

      // Right Louvers
      const louverR = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.45, 0.25), darkPlasticMat)
      louverR.position.set(width + 8.0, -0.45, 5.0 + i * 1.8)
      louverR.rotation.x = 0.4
      louverR.castShadow = true
      this.group.add(louverR)
    }

    // 3D Molded Plastic Screw Wells in Chassis Tub (outside PCB perimeter)
    const screwWellPositions = [
      { x: -14, z: 8 },
      { x: -14, z: 28 },
      { x: width + 14, z: 8 },
      { x: width + 14, z: 28 },
      { x: width / 2, z: depth + 12 },
      { x: width / 2, z: -12 },
    ]

    for (const sw of screwWellPositions) {
      const wellGroup = new THREE.Group()
      wellGroup.position.set(sw.x, -0.72, sw.z)

      // Outer cylindrical boss collar
      const boss = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.35, 0.5, 16), plasticMat)
      boss.position.y = 0.25
      boss.castShadow = true
      boss.receiveShadow = true
      wellGroup.add(boss)

      // Inner recessed well hole
      const innerWell = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.52, 16), darkPlasticMat)
      innerWell.position.y = 0.26
      wellGroup.add(innerWell)

      // Silver screw inside well
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 12), screwMat)
      screw.position.y = 0.29
      wellGroup.add(screw)

      // Cross slots
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.1), screwSlotMat)
      c1.position.y = 0.34
      const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.5), screwSlotMat)
      c2.position.y = 0.34
      wellGroup.add(c1, c2)

      this.group.add(wellGroup)
      this.addCylinderCollider(sw.x, sw.z, 1.35, 0.5 - 0.72, 'Chassis_Screw_Well')
    }
  }

  /**
   * Builds the stamped zinc/tin plated steel grounding RF shielding tray directly below the PU-8 PCB.
   */
  private buildMetalGroundingShield(width: number, depth: number): void {
    const steelMat = new THREE.MeshLambertMaterial({
      color: 0xc4cdd5,
      flatShading: true,
    })
    const darkSteelMat = new THREE.MeshLambertMaterial({
      color: 0x94a3b8,
      flatShading: true,
    })

    // Stamped bottom RF shield pan
    const shieldPlate = new THREE.Mesh(new THREE.BoxGeometry(width + 1.4, 0.15, depth + 1.4), steelMat)
    shieldPlate.position.set(width / 2, -0.42, depth / 2)
    shieldPlate.receiveShadow = true
    this.group.add(shieldPlate)

    // Stamped Grounding Leaf Spring Prongs (Connecting shield to PCB ground)
    const springPositions = [
      { x: 2, z: depth / 2 },
      { x: width - 2, z: depth / 2 },
      { x: width / 2, z: 2 },
      { x: width / 2, z: depth - 2 },
      { x: 12, z: 4 },
      { x: 34, z: 4 },
    ]

    for (const sp of springPositions) {
      const spring = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.6), darkSteelMat)
      spring.position.set(sp.x, -0.22, sp.z)
      spring.rotation.z = 0.2
      this.group.add(spring)
    }
  }

  /**
   * Builds 8 precision hexagonal brass screw standoffs with Philips head screw washers.
   */
  private buildBrassStandoffs(width: number, depth: number): void {
    const brassMat = new THREE.MeshLambertMaterial({ color: 0xd4af37, flatShading: true })
    const screwMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true })
    const slotMat = new THREE.MeshBasicMaterial({ color: 0x1e293b })

    const standoffPositions = [
      { x: 1.6, z: 1.6 },
      { x: width - 1.6, z: 1.6 },
      { x: 1.6, z: depth - 1.6 },
      { x: width - 1.6, z: depth - 1.6 },
      { x: width / 2, z: 1.4 },
      { x: width / 2, z: depth - 1.4 },
      { x: 1.4, z: depth / 2 },
      { x: width - 1.4, z: depth / 2 },
    ]

    for (const pos of standoffPositions) {
      const standoffGroup = new THREE.Group()
      standoffGroup.position.set(pos.x, 0, pos.z)

      // Hexagonal Brass Pillar (Height from chassis -0.72 to PCB top +0.02)
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.76, 6), brassMat)
      pillar.position.y = -0.34
      pillar.castShadow = true
      standoffGroup.add(pillar)

      // Silver Screw Washer Head
      const screwHead = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 12), screwMat)
      screwHead.position.y = 0.05
      screwHead.castShadow = true
      standoffGroup.add(screwHead)

      // Philips cross slot
      const cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.1), slotMat)
      cross1.position.y = 0.11
      const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.5), slotMat)
      cross2.position.y = 0.11
      standoffGroup.add(cross1, cross2)

      this.group.add(standoffGroup)
      this.addCylinderCollider(pos.x, pos.z, 0.55, 0.72, 'Brass_Standoff')
    }
  }

  /**
   * Builds the CD optical drive bay mounting perimeter with rubber vibration dampener grommets.
   */
  private buildCdDriveBayPerimeter(x: number, z: number): void {
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x8a99a8, flatShading: true })
    const rubberMat = new THREE.MeshLambertMaterial({ color: 0x1f242d, flatShading: true })
    const brassMat = new THREE.MeshLambertMaterial({ color: 0xd4af37, flatShading: true })

    // Stamped Guide Rails & Mounting Perimeter Tray
    const tray = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.2, 12.0), frameMat)
    tray.position.set(x, 0.1, z)
    tray.castShadow = true
    this.group.add(tray)
    this.addBoxCollider(x, z, 10.5, 12.0, 0.35, 'CD_Drive_Tray')

    // Spindle Well Circular Rim
    const spindleRing = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.3, 20), frameMat)
    spindleRing.position.set(x, 0.25, z - 1.5)
    spindleRing.castShadow = true
    this.group.add(spindleRing)
    this.addCylinderCollider(x, z - 1.5, 3.2, 0.55, 'CD_Spindle_Well')

    // 3 Vibration Dampener Rubber Bushing Grommets with brass center sleeves
    const dampeners = [
      { dx: -4.2, dz: -4.5 },
      { dx: 4.2, dz: -4.5 },
      { dx: 0, dz: 4.8 },
    ]

    for (const d of dampeners) {
      const gx = x + d.dx
      const gz = z + d.dz

      const rubber = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.5, 12), rubberMat)
      rubber.position.set(gx, 0.35, gz)
      rubber.castShadow = true

      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.58, 8), brassMat)
      sleeve.position.set(gx, 0.39, gz)

      this.group.add(rubber, sleeve)
      this.addCylinderCollider(gx, gz, 0.75, 0.65, 'Drive_Dampener')
    }
  }

  /**
   * Vibrant PlayStation 1 PU-8 PCB Green Substrate (48m x 36m)
   * High-resolution FR-4 solder mask with gold grounding pour and circuit bus tracks
   */
  private buildPcbSubstrate(width: number, depth: number): void {
    const pcbGeo = new THREE.BoxGeometry(width, 0.7, depth)
    const pcbMat = new THREE.MeshLambertMaterial({
      color: 0x124f2b,
      flatShading: true,
    })
    const pcb = new THREE.Mesh(pcbGeo, pcbMat)
    pcb.position.set(width / 2, -0.35, depth / 2)
    pcb.receiveShadow = true
    this.group.add(pcb)

    // Top High-Resolution Textured PCB Plate
    const topPlateGeo = new THREE.PlaneGeometry(width, depth)
    topPlateGeo.rotateX(-Math.PI / 2)
    const pcbTopMat = new THREE.MeshLambertMaterial({
      map: MotherboardTextureGenerator.createPcbTexture(),
      color: 0xffffff,
    })
    const pcbTop = new THREE.Mesh(topPlateGeo, pcbTopMat)
    pcbTop.position.set(width / 2, 0.002, depth / 2)
    pcbTop.receiveShadow = true
    this.group.add(pcbTop)

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

  private buildRearIoBracket(x: number, z: number): void {
    const metalMat = new THREE.MeshLambertMaterial({ color: 0xd8e0e8, flatShading: true })
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a202c, flatShading: true })
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd4af37, flatShading: true })

    // Stamped Metal Rear Shielding Housing
    const shield = new THREE.Mesh(new THREE.BoxGeometry(22.0, 2.6, 2.4), metalMat)
    shield.position.set(x, 1.3, z)
    shield.castShadow = true
    shield.receiveShadow = true
    this.group.add(shield)
    this.addBoxCollider(x, z, 22.0, 2.4, 2.6, 'Rear_Shield_Housing')

    // 3x RCA Phono Jacks (Video Yellow, Audio L White, Audio R Red)
    const rcaColors = [0xffd700, 0xffffff, 0xff2222]
    for (let i = 0; i < 3; i++) {
      const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.8, 12), metalMat)
      jack.rotateX(Math.PI / 2)
      jack.position.set(x - 5.0 + i * 2.2, 1.3, z - 1.4)
      jack.castShadow = true
      this.group.add(jack)

      const colorRing = new THREE.Mesh(
        new THREE.RingGeometry(0.18, 0.36, 12),
        new THREE.MeshBasicMaterial({ color: rcaColors[i] ?? 0xffffff })
      )
      colorRing.position.set(x - 5.0 + i * 2.2, 1.3, z - 1.81)
      this.group.add(colorRing)
    }

    // AV Multi Out & Parallel I/O Black Port Housing
    const connBlack = new THREE.Mesh(new THREE.BoxGeometry(8.5, 2.8, 2.6), blackMat)
    connBlack.position.set(x + 15.0, 1.4, z)
    connBlack.castShadow = true
    connBlack.receiveShadow = true
    this.group.add(connBlack)
    this.addBoxCollider(x + 15.0, z, 8.5, 2.6, 2.8, 'AV_Multi_Out')

    // Parallel I/O Expansion Port (PIO Slot)
    const pioPort = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.8, 1.6), metalMat)
    pioPort.position.set(x - 14.5, 0.9, z + 0.2)
    pioPort.castShadow = true
    const pioSlot = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.4, 0.6), blackMat)
    pioSlot.position.set(x - 14.5, 0.9, z - 0.7)
    this.group.add(pioPort, pioSlot)
    this.addBoxCollider(x - 14.5, z + 0.2, 7.2, 1.6, 1.8, 'Parallel_IO_Port')
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
    this.addBoxCollider(x, z, 7.2, 7.2, 0.8, 'CPU_CXD8530BQ')

    // 4x SEC TSOP RAM Chips (KM4216V256G-60)
    const ramTex = MotherboardTextureGenerator.createRamTexture()
    const ramFaceMat = new THREE.MeshLambertMaterial({ map: ramTex, color: 0xffffff })
    const ramMat = new THREE.MeshLambertMaterial({ color: 0x1a202c, flatShading: true })

    const ramOffsets = [
      { dx: -2.5, dz: 6.2 },
      { dx: 2.5, dz: 6.2 },
      { dx: -2.5, dz: 10.2 },
      { dx: 2.5, dz: 10.2 },
    ]
    for (let i = 0; i < ramOffsets.length; i++) {
      const ro = ramOffsets[i]!
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
      this.addBoxCollider(x + ro.dx, z + ro.dz, 3.6, 2.2, 0.5, `RAM_${i + 1}`)
    }
  }

  private buildGpuAndVram(x: number, z: number): void {
    const gpuMat = new THREE.MeshLambertMaterial({ color: 0x16181f, flatShading: true })
    const pinMat = new THREE.MeshLambertMaterial({ color: 0xdce4ec, flatShading: true })
    const heatsinkMat = new THREE.MeshLambertMaterial({ color: 0x14161b, flatShading: true })
    const finEdgeMat = new THREE.MeshLambertMaterial({ color: 0x2e333d, flatShading: true })
    const clipMat = new THREE.MeshLambertMaterial({ color: 0xd8e0e8, flatShading: true })
    const vramMat = new THREE.MeshLambertMaterial({ color: 0x181c24, flatShading: true })
    const vramTex = MotherboardTextureGenerator.createRamTexture()
    const vramFaceMat = new THREE.MeshLambertMaterial({ map: vramTex, color: 0xffffff })

    const gpuGroup = new THREE.Group()
    gpuGroup.position.set(x, 0, z)

    // 1. Authentic CXD8514Q SOLI GPU QFP Package Body (5.8m x 0.45m x 5.8m)
    const gpuBody = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.45, 5.8), gpuMat)
    gpuBody.position.y = 0.225
    gpuBody.castShadow = true
    gpuBody.receiveShadow = true
    gpuGroup.add(gpuBody)

    // Top face silkscreen plate with high-resolution GPU markings
    const gpuTex = MotherboardTextureGenerator.createGpuTexture()
    const gpuFaceMat = new THREE.MeshLambertMaterial({ map: gpuTex, color: 0xffffff })
    const gpuPlate = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 5.5), gpuFaceMat)
    gpuPlate.rotateX(-Math.PI / 2)
    gpuPlate.position.y = 0.455
    gpuGroup.add(gpuPlate)

    // 2. Authentic 160 Silver Gull-Wing Lead Pins (40 pins per side)
    const pinCountPerSide = 40
    const span = 5.2
    const pinStep = span / (pinCountPerSide - 1)
    const startOffset = -span / 2

    // Pins on North & South edges (80 pins)
    for (let i = 0; i < pinCountPerSide; i++) {
      const p = startOffset + i * pinStep
      // North Pin
      const pinN = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.35), pinMat)
      pinN.position.set(p, 0.12, -3.02)
      gpuGroup.add(pinN)

      // South Pin
      const pinS = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.35), pinMat)
      pinS.position.set(p, 0.12, 3.02)
      gpuGroup.add(pinS)
    }

    // Pins on West & East edges (80 pins -> 160 pins total)
    for (let i = 0; i < pinCountPerSide; i++) {
      const p = startOffset + i * pinStep
      // West Pin
      const pinW = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.07), pinMat)
      pinW.position.set(-3.02, 0.12, p)
      gpuGroup.add(pinW)

      // East Pin
      const pinE = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.07), pinMat)
      pinE.position.set(3.02, 0.12, p)
      gpuGroup.add(pinE)
    }

    // 3. Extruded Black Anodized Aluminum Heatsink Base Plate (4.2m x 0.16m x 4.2m)
    const heatsinkBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.16, 4.2), heatsinkMat)
    heatsinkBase.position.y = 0.54
    heatsinkBase.castShadow = true
    heatsinkBase.receiveShadow = true
    gpuGroup.add(heatsinkBase)

    // 4. Individual Extruded Cooling Fin Blades (8 parallel fin blades)
    const finCount = 8
    const finHeight = 0.72
    const finThickness = 0.16
    const finSpan = 3.6
    const finStep = finSpan / (finCount - 1)
    const finStart = -finSpan / 2

    for (let i = 0; i < finCount; i++) {
      const fz = finStart + i * finStep

      // Main fin blade body
      const fin = new THREE.Mesh(new THREE.BoxGeometry(4.2, finHeight, finThickness), heatsinkMat)
      fin.position.set(0, 0.62 + finHeight / 2, fz)
      fin.castShadow = true
      fin.receiveShadow = true
      gpuGroup.add(fin)

      // Top chamfered edge highlight strip for sharp definition
      const finTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.04, finThickness * 0.9), finEdgeMat)
      finTop.position.set(0, 0.62 + finHeight + 0.02, fz)
      gpuGroup.add(finTop)
    }

    // 5. Silver Metallic Thermal Tension Retention Clip
    // (A) Cross clamping bar running perpendicular across the fins
    const clipBar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 4.6), clipMat)
    clipBar.position.set(0, 1.02, 0)
    clipBar.castShadow = true
    gpuGroup.add(clipBar)

    // (B) Central Tension Dimple / Pressure Screw Boss
    const clipDimple = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 12), clipMat)
    clipDimple.position.set(0, 1.12, 0)
    clipDimple.castShadow = true
    gpuGroup.add(clipDimple)

    const dimpleNotch = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.08), heatsinkMat)
    dimpleNotch.position.set(0, 1.21, 0)
    gpuGroup.add(dimpleNotch)

    // (C) Downward retention hooks clamping onto heatsink base on North & South ends
    const latchN = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.62, 0.14), clipMat)
    latchN.position.set(0, 0.72, -2.32)
    latchN.castShadow = true

    const tabN = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.28), clipMat)
    tabN.position.set(0, 0.44, -2.42)

    const latchS = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.62, 0.14), clipMat)
    latchS.position.set(0, 0.72, 2.32)
    latchS.castShadow = true

    const tabS = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.28), clipMat)
    tabS.position.set(0, 0.44, 2.42)

    gpuGroup.add(latchN, tabN, latchS, tabS)

    this.group.add(gpuGroup)
    this.addBoxCollider(x, z, 6.0, 6.0, 1.45, 'GPU_CXD8514Q')

    // 6. 2x SEC TSOP VRAM Chips (KM4216V256G)
    const vramOffsets = [{ dz: -1.8 }, { dz: 2.2 }]
    for (let i = 0; i < vramOffsets.length; i++) {
      const v = vramOffsets[i]!
      const vramGroup = new THREE.Group()
      vramGroup.position.set(x - 5.5, 0, z + v.dz)

      const vram = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 2.6), vramMat)
      vram.position.y = 0.175
      vram.castShadow = true
      vramGroup.add(vram)

      const vPlate = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.4), vramFaceMat)
      vPlate.rotateX(-Math.PI / 2)
      vPlate.position.set(x - 5.5, 0.36, z + v.dz)
      vramGroup.add(vPlate)

      // TSOP Lead Pins along North and South edges
      const tsopPinCount = 14
      const tsopSpan = 3.6
      const tsopStep = tsopSpan / (tsopPinCount - 1)
      for (let j = 0; j < tsopPinCount; j++) {
        const tx = -tsopSpan / 2 + j * tsopStep
        const pN = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.22), pinMat)
        pN.position.set(tx, 0.1, -1.38)
        const pS = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.22), pinMat)
        pS.position.set(tx, 0.1, 1.38)
        vramGroup.add(pN, pS)
      }

      this.group.add(vramGroup)
      this.addBoxCollider(x - 5.5, z + v.dz, 4.2, 2.6, 0.5, `VRAM_${i + 1}`)
    }
  }

  private buildSoundAndCdProcessing(x: number, z: number): void {
    const chipMat = new THREE.MeshLambertMaterial({ color: 0x161a22, flatShading: true })
    const spuTex = MotherboardTextureGenerator.createSpuTexture('CXD2922Q SOLI')
    const mechaTex = MotherboardTextureGenerator.createSpuTexture('CXD1815Q SOLI')
    const dspTex = MotherboardTextureGenerator.createSpuTexture('CXD2510Q SOLI')

    // Mechacon CXD1815Q
    const mechacon = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 4.8), chipMat)
    mechacon.position.set(x, 0.2, z)
    mechacon.castShadow = true
    this.group.add(mechacon)

    const mechaPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshLambertMaterial({ map: mechaTex })
    )
    mechaPlate.rotateX(-Math.PI / 2)
    mechaPlate.position.set(x, 0.41, z)
    this.group.add(mechaPlate)
    this.addBoxCollider(x, z, 5.0, 5.0, 0.6, 'Mechacon_CXD1815Q')

    // SPU CXD2922Q
    const spu = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 4.8), chipMat)
    spu.position.set(x + 5.8, 0.2, z)
    spu.castShadow = true
    this.group.add(spu)

    const spuPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshLambertMaterial({ map: spuTex })
    )
    spuPlate.rotateX(-Math.PI / 2)
    spuPlate.position.set(x + 5.8, 0.41, z)
    this.group.add(spuPlate)
    this.addBoxCollider(x + 5.8, z, 5.0, 5.0, 0.6, 'SPU_CXD2922Q')

    // SPU Sound Buffer RAM (SEC TSOP chip)
    const spuRamTex = MotherboardTextureGenerator.createRamTexture()
    const spuRamMat = new THREE.MeshLambertMaterial({ color: 0x181c24, flatShading: true })
    const spuRam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 2.2), spuRamMat)
    spuRam.position.set(x + 5.8, 0.175, z - 4.5)
    spuRam.castShadow = true
    this.group.add(spuRam)
    const spuRamPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2.0),
      new THREE.MeshLambertMaterial({ map: spuRamTex })
    )
    spuRamPlate.rotateX(-Math.PI / 2)
    spuRamPlate.position.set(x + 5.8, 0.36, z - 4.5)
    this.group.add(spuRamPlate)
    this.addBoxCollider(x + 5.8, z - 4.5, 3.6, 2.2, 0.5, 'SPU_RAM')

    // DSP CXD2510Q
    const dsp = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 6.2), chipMat)
    dsp.position.set(x - 5.8, 0.2, z + 2.0)
    dsp.castShadow = true
    this.group.add(dsp)

    const dspPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 5.8),
      new THREE.MeshLambertMaterial({ map: dspTex })
    )
    dspPlate.rotateX(-Math.PI / 2)
    dspPlate.position.set(x - 5.8, 0.41, z + 2.0)
    this.group.add(dspPlate)
    this.addBoxCollider(x - 5.8, z + 2.0, 3.6, 6.2, 0.6, 'DSP_CXD2510Q')
  }

  /**
   * Adds the authentic PS1 PU-8 BIOS ROM IC102 (DIP32 rectangular chip with SOLI BIOS text)
   * complete with 32 metallic DIP solder pins and registration in colliders.
   */
  private buildBiosRom(x: number, z: number): void {
    const biosMat = new THREE.MeshLambertMaterial({ color: 0x11141a, flatShading: true })
    const pinMat = new THREE.MeshLambertMaterial({ color: 0xd8e2ec, flatShading: true })

    const biosGroup = new THREE.Group()
    biosGroup.position.set(x, 0, z)

    // DIP-32 Epoxy Body (5.4m length x 2.2m width x 0.55m height)
    const body = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.55, 2.2), biosMat)
    body.position.y = 0.275
    body.castShadow = true
    biosGroup.add(body)

    // Silkscreened top label
    const biosTex = MotherboardTextureGenerator.createBiosTexture()
    const faceMat = new THREE.MeshLambertMaterial({ map: biosTex, color: 0xffffff })
    const facePlate = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.0), faceMat)
    facePlate.rotateX(-Math.PI / 2)
    facePlate.position.y = 0.56
    biosGroup.add(facePlate)

    // 32 DIP Metallic Pins (16 pins along North edge, 16 pins along South edge)
    const pinCount = 16
    const pinSpacing = 5.0 / (pinCount - 1)
    for (let i = 0; i < pinCount; i++) {
      const px = -2.5 + i * pinSpacing

      // North Pin
      const pinN = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.35), pinMat)
      pinN.position.set(px, 0.16, -1.25)
      biosGroup.add(pinN)

      // South Pin
      const pinS = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.35), pinMat)
      pinS.position.set(px, 0.16, 1.25)
      biosGroup.add(pinS)
    }

    this.group.add(biosGroup)
    this.addBoxCollider(x, z, 5.6, 2.8, 0.7, 'BIOS_ROM_IC102')
  }

  /**
   * Adds the AK4309AVM Audio DAC Chip (near SPU) with SSOP pins and silkscreen.
   */
  private buildAudioDac(x: number, z: number): void {
    const dacMat = new THREE.MeshLambertMaterial({ color: 0x171922, flatShading: true })
    const pinMat = new THREE.MeshLambertMaterial({ color: 0xd0d8e0, flatShading: true })

    const dacGroup = new THREE.Group()
    dacGroup.position.set(x, 0, z)

    const dacBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.8), dacMat)
    dacBody.position.y = 0.175
    dacBody.castShadow = true
    dacGroup.add(dacBody)

    const dacTex = MotherboardTextureGenerator.createDacTexture()
    const dacPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 1.6),
      new THREE.MeshLambertMaterial({ map: dacTex })
    )
    dacPlate.rotateX(-Math.PI / 2)
    dacPlate.position.y = 0.36
    dacGroup.add(dacPlate)

    // Side Lead Pins
    const pinsL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 1.8), pinMat)
    pinsL.position.set(-1.3, 0.1, 0)
    const pinsR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 1.8), pinMat)
    pinsR.position.set(1.3, 0.1, 0)
    dacGroup.add(pinsL, pinsR)

    this.group.add(dacGroup)
    this.addBoxCollider(x, z, 2.8, 2.0, 0.5, 'Audio_DAC_AK4309AVM')
  }

  /**
   * Adds Crystal Oscillator Cans X101 (53.69MHz NTSC) and X102 (67.73MHz SPU/CD)
   * with authentic laser-etched metallic textures, rounded can geometry, and colliders.
   */
  private buildCrystalOscillators(): void {
    const silverMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true })
    const tabMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true })

    // X101 (53.693175 MHz NTSC Master Clock near GPU)
    const x101Group = new THREE.Group()
    x101Group.position.set(31.5, 0, 25.5)

    const x101Body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.65, 1.4), silverMat)
    x101Body.position.y = 0.325
    x101Body.castShadow = true
    x101Group.add(x101Body)

    const x101Tex = MotherboardTextureGenerator.createOscillatorTexture('53.6931 MHz', 'X101 (NTSC)')
    const x101Top = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.2),
      new THREE.MeshLambertMaterial({ map: x101Tex })
    )
    x101Top.rotateX(-Math.PI / 2)
    x101Top.position.y = 0.66
    x101Group.add(x101Top)

    // Ground Solder Tabs
    const tab1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.6), tabMat)
    tab1.position.set(-1.4, 0.05, 0)
    const tab2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.6), tabMat)
    tab2.position.set(1.4, 0.05, 0)
    x101Group.add(tab1, tab2)

    this.group.add(x101Group)
    this.addBoxCollider(31.5, 25.5, 2.8, 1.6, 0.75, 'Oscillator_X101')

    // X102 (67.737600 MHz SPU / CD DSP Master Clock near SPU)
    const x102Group = new THREE.Group()
    x102Group.position.set(13.5, 0, 6.5)

    const x102Body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.65, 1.4), silverMat)
    x102Body.position.y = 0.325
    x102Body.castShadow = true
    x102Group.add(x102Body)

    const x102Tex = MotherboardTextureGenerator.createOscillatorTexture('67.7376 MHz', 'X102 (SPU/CD)')
    const x102Top = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.2),
      new THREE.MeshLambertMaterial({ map: x102Tex })
    )
    x102Top.rotateX(-Math.PI / 2)
    x102Top.position.y = 0.66
    x102Group.add(x102Top)

    const tab3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.6), tabMat)
    tab3.position.set(-1.4, 0.05, 0)
    const tab4 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.6), tabMat)
    tab4.position.set(1.4, 0.05, 0)
    x102Group.add(tab3, tab4)

    this.group.add(x102Group)
    this.addBoxCollider(13.5, 6.5, 2.8, 1.6, 0.75, 'Oscillator_X102')
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

    for (let i = 0; i < capOffsets.length; i++) {
      const c = capOffsets[i]!
      const posX = x + c.dx
      const posZ = z + c.dz
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(c.r, c.r, c.h, 12), bodyMat)
      cap.position.set(posX, c.h / 2, posZ)
      cap.castShadow = true
      this.group.add(cap)

      const top = new THREE.Mesh(new THREE.CylinderGeometry(c.r * 0.95, c.r * 0.95, 0.08, 12), topMat)
      top.position.set(posX, c.h + 0.04, posZ)
      this.group.add(top)

      this.addCylinderCollider(posX, posZ, c.r + 0.2, c.h, `Capacitor_${i + 1}`)
    }
  }

  /**
   * Greatly enriched PS1 PU-8 passive component network:
   * 24x miniature aluminum can capacitors, 40+ SMD ceramic capacitors (0805),
   * 35+ SMD resistors, 8x resistor array packs, and 8x ferrite inductors.
   */
  private buildEnrichedSmdPassives(): void {
    const ceramicMat = new THREE.MeshLambertMaterial({ color: 0xb48246, flatShading: true }) // Tan/Brown MLCC ceramic 0805
    const resMat = new THREE.MeshLambertMaterial({ color: 0x181c24, flatShading: true }) // Black SMD resistor 0805
    const termMat = new THREE.MeshLambertMaterial({ color: 0xd8e0e8, flatShading: true }) // Silver solder endcaps
    const alumMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true })
    const blueTopMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true })
    const ferriteMat = new THREE.MeshLambertMaterial({ color: 0x272e39, flatShading: true }) // Dark charcoal ferrite inductor

    // 1. Array of 24 miniature aluminum SMD capacitors with blue polarity marking
    const smdCapPositions = [
      { x: 14, z: 20 }, { x: 15.5, z: 20 }, { x: 17, z: 20 },
      { x: 22, z: 14 }, { x: 23.5, z: 14 }, { x: 25, z: 14 },
      { x: 30, z: 28 }, { x: 31.5, z: 28 }, { x: 33, z: 28 },
      { x: 10, z: 15 }, { x: 10, z: 16.5 }, { x: 10, z: 18 },
      { x: 42, z: 18 }, { x: 42, z: 20 }, { x: 42, z: 22 },
      { x: 20, z: 28 }, { x: 21.5, z: 28 }, { x: 23, z: 28 },
      { x: 34, z: 8 }, { x: 35.5, z: 8 }, { x: 37, z: 8 },
      { x: 26, z: 25 }, { x: 27.5, z: 25 }, { x: 29, z: 25 },
    ]

    for (let i = 0; i < smdCapPositions.length; i++) {
      const sc = smdCapPositions[i]!
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 8), alumMat)
      barrel.position.set(sc.x, 0.35, sc.z)
      barrel.castShadow = true
      const bTop = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 8), blueTopMat)
      bTop.position.set(sc.x, 0.72, sc.z)
      this.group.add(barrel, bTop)
      this.addCylinderCollider(sc.x, sc.z, 0.45, 0.75, `SMD_Cap_${i + 1}`)
    }

    // 2. 50+ SMD 0805 Ceramic Capacitors & Resistors with silver termination caps
    const smdPassives = [
      // CPU surrounding decoupling network
      { x: 32.5, z: 18.0, isCap: true }, { x: 32.5, z: 19.5, isCap: false }, { x: 32.5, z: 21.0, isCap: true },
      { x: 39.5, z: 18.0, isCap: false }, { x: 39.5, z: 19.5, isCap: true }, { x: 39.5, z: 21.0, isCap: false },
      { x: 34.0, z: 17.5, isCap: true }, { x: 36.0, z: 17.5, isCap: false }, { x: 38.0, z: 17.5, isCap: true },
      { x: 34.0, z: 24.5, isCap: false }, { x: 36.0, z: 24.5, isCap: true }, { x: 38.0, z: 24.5, isCap: false },

      // GPU & VRAM decoupling passives
      { x: 24.5, z: 17.0, isCap: true }, { x: 24.5, z: 19.0, isCap: false }, { x: 24.5, z: 21.0, isCap: true },
      { x: 31.5, z: 17.0, isCap: false }, { x: 31.5, z: 19.0, isCap: true }, { x: 31.5, z: 21.0, isCap: false },
      { x: 26.0, z: 15.5, isCap: true }, { x: 28.0, z: 15.5, isCap: false }, { x: 30.0, z: 15.5, isCap: true },

      // SPU & Audio DAC filtering network
      { x: 19.5, z: 6.0, isCap: true }, { x: 20.5, z: 6.0, isCap: false }, { x: 21.5, z: 6.0, isCap: true },
      { x: 16.0, z: 6.0, isCap: true }, { x: 17.0, z: 6.0, isCap: false }, { x: 18.0, z: 6.0, isCap: true },
      { x: 24.5, z: 10.0, isCap: false }, { x: 24.5, z: 12.0, isCap: true }, { x: 24.5, z: 14.0, isCap: false },

      // Mechacon & CD DSP termination resistors & caps
      { x: 13.0, z: 10.0, isCap: true }, { x: 13.0, z: 12.0, isCap: false }, { x: 13.0, z: 14.0, isCap: true },
      { x: 7.5, z: 12.0, isCap: false }, { x: 7.5, z: 14.0, isCap: true }, { x: 7.5, z: 16.0, isCap: false },
      { x: 10.0, z: 18.0, isCap: true }, { x: 11.5, z: 18.0, isCap: false }, { x: 13.0, z: 18.0, isCap: true },

      // BIOS ROM address pull-ups
      { x: 33.0, z: 9.8, isCap: false }, { x: 34.5, z: 9.8, isCap: true }, { x: 36.0, z: 9.8, isCap: false },
      { x: 37.5, z: 9.8, isCap: true }, { x: 39.0, z: 9.8, isCap: false },
      { x: 33.0, z: 12.6, isCap: true }, { x: 35.0, z: 12.6, isCap: false }, { x: 37.0, z: 12.6, isCap: true },
      { x: 39.0, z: 12.6, isCap: false },

      // General power rail smoothing caps
      { x: 5.0, z: 20.0, isCap: true }, { x: 5.0, z: 22.0, isCap: false }, { x: 5.0, z: 24.0, isCap: true },
      { x: 44.0, z: 10.0, isCap: true }, { x: 44.0, z: 12.0, isCap: false }, { x: 44.0, z: 14.0, isCap: true },
    ]

    for (let i = 0; i < smdPassives.length; i++) {
      const p = smdPassives[i]!
      const compGroup = new THREE.Group()
      compGroup.position.set(p.x, 0, p.z)

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.45), p.isCap ? ceramicMat : resMat)
      body.position.y = 0.11
      body.castShadow = true

      const cap1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.47), termMat)
      cap1.position.set(-0.35, 0.11, 0)
      const cap2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.47), termMat)
      cap2.position.set(0.35, 0.11, 0)

      compGroup.add(body, cap1, cap2)
      this.group.add(compGroup)
    }

    // 3. 8x Ferrite Inductors & Power Beads (L101-L108)
    const ferritePositions = [
      { x: 30.5, z: 16.0 }, { x: 35.0, z: 16.0 },
      { x: 26.0, z: 14.0 }, { x: 22.0, z: 10.0 },
      { x: 18.0, z: 5.0 }, { x: 12.0, z: 8.0 },
      { x: 6.0, z: 25.0 }, { x: 41.0, z: 16.0 },
    ]

    for (let i = 0; i < ferritePositions.length; i++) {
      const fp = ferritePositions[i]!
      const inductor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.9), ferriteMat)
      inductor.position.set(fp.x, 0.225, fp.z)
      inductor.castShadow = true

      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.25, 6), termMat)
      wire.rotateZ(Math.PI / 2)
      wire.position.set(fp.x, 0.46, fp.z)

      this.group.add(inductor, wire)
      this.addBoxCollider(fp.x, fp.z, 1.3, 1.0, 0.5, `Ferrite_L10${i + 1}`)
    }

    // 4. 8x Resistor Array Packs (Convex 8-pin resistor packs on data buses)
    const packPositions = [
      { x: 32.5, z: 23.0 }, { x: 39.5, z: 23.0 },
      { x: 25.0, z: 23.0 }, { x: 29.0, z: 23.0 },
      { x: 15.0, z: 16.0 }, { x: 18.0, z: 16.0 },
      { x: 33.0, z: 14.5 }, { x: 37.0, z: 14.5 },
    ]

    for (let i = 0; i < packPositions.length; i++) {
      const pp = packPositions[i]!
      const pack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.65), resMat)
      pack.position.set(pp.x, 0.14, pp.z)
      pack.castShadow = true
      this.group.add(pack)
    }
  }

  /**
   * Builds power regulation transistors with metal heatsink tabs (Q101-Q104) and PSU connector.
   */
  private buildPowerSubsystem(x: number, z: number): void {
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x141820, flatShading: true })
    const tabMat = new THREE.MeshLambertMaterial({ color: 0xc4cdd5, flatShading: true })
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf0f4f8, flatShading: true })

    // 4x TO-263 / D2PAK Power MOSFET Transistors with heatsink tabs
    for (let i = 0; i < 4; i++) {
      const qx = x + (i % 2) * 2.4
      const qz = z + Math.floor(i / 2) * 2.4

      const mosfet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 1.4), blackMat)
      mosfet.position.set(qx, 0.175, qz)
      mosfet.castShadow = true

      const tab = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 0.5), tabMat)
      tab.position.set(qx, 0.18, qz - 0.8)

      this.group.add(mosfet, tab)
      this.addBoxCollider(qx, qz, 1.4, 1.6, 0.45, `MOSFET_Q10${i + 1}`)
    }

    // 7-Pin PSU Power Cable Header Plug (CN601)
    const psuPlug = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 4.5), whiteMat)
    psuPlug.position.set(x - 0.8, 0.7, z + 4.5)
    psuPlug.castShadow = true
    this.group.add(psuPlug)
    this.addBoxCollider(x - 0.8, z + 4.5, 1.8, 4.5, 1.4, 'Power_Plug_CN601')
  }

  private buildConnectors(width: number, depth: number): void {
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, flatShading: true })
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd4af37, flatShading: true })

    // CD Laser Sled Flat Flexible Cable Connector (CN702)
    const laserSlot = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 4.8), blackMat)
    laserSlot.rotation.y = 0.35
    laserSlot.position.set(8.0, 0.3, 26.0)
    laserSlot.castShadow = true
    this.group.add(laserSlot)
    this.addBoxCollider(8.0, 26.0, 2.0, 5.0, 0.8, 'Laser_Slot_CN702')

    // Front Controller & Memory Card Ribbon Interface Connector (CN102)
    const padConn = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.9, 1.6), blackMat)
    padConn.position.set(width / 2, 0.45, depth - 1.2)
    padConn.castShadow = true
    this.group.add(padConn)
    this.addBoxCollider(width / 2, depth - 1.2, 9.5, 1.6, 1.0, 'Controller_CN102')
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
      { x: 36, z: 16, w: 0.3, d: 6.0 }, // BIOS to CPU bus
      { x: 17, z: 10, w: 0.3, d: 4.0 }, // SPU to DAC bus
      { x: 32, z: 20, w: 5.0, d: 0.3 }, // GPU to CPU bus
      { x: 25, z: 18, w: 3.5, d: 0.3 }, // GPU to VRAM1 bus
      { x: 25, z: 20, w: 3.5, d: 0.3 }, // GPU to VRAM2 bus
      { x: 29.5, z: 22.5, w: 0.3, d: 4.0 }, // GPU to X101 clock trace
    ]

    for (const t of traces) {
      const trace = new THREE.Mesh(new THREE.BoxGeometry(t.w, 0.02, t.d), traceMat)
      trace.position.set(t.x, 0.01, t.z)
      this.group.add(trace)
    }
  }

  private addBoxCollider(x: number, z: number, width: number, depth: number, height: number, name?: string): void {
    this.colliders.push({
      x,
      z,
      halfW: width / 2 + 0.25,
      halfD: depth / 2 + 0.25,
      height,
      radius: Math.sqrt(width * width + depth * depth) / 2,
      name,
    })
  }

  private addCylinderCollider(x: number, z: number, radius: number, height: number, name?: string): void {
    this.colliders.push({
      x,
      z,
      halfW: radius + 0.15,
      halfD: radius + 0.15,
      height,
      radius: radius + 0.15,
      name,
    })
  }

  /**
   * Returns the highest standing floor / platform height at (pX, pZ) for ANY entity
   * (player, crypto enemies, bosses) so they can smoothly land and walk on top of chips,
   * capacitors, heatsinks, standoffs, and chassis ribs during movement and jumps!
   */
  public getSupportHeight(pX: number, pZ: number, entityRadius = 0.45): number {
    // Base floor height: 0.0 on PCB substrate, -0.72 on outer chassis interior floor
    const isOnPcb = pX >= 0.5 && pX <= this.width - 0.5 && pZ >= 0.5 && pZ <= this.depth - 0.5
    let maxHeight = isOnPcb ? 0.0 : -0.72

    for (const c of this.colliders) {
      const dx = Math.abs(pX - c.x)
      const dz = Math.abs(pZ - c.z)

      // Bounding box coverage with entity tolerance
      if (dx <= c.halfW - 0.08 && dz <= c.halfD - 0.08) {
        if (c.height > maxHeight) {
          maxHeight = c.height
        }
      }
    }

    return maxHeight
  }

  /**
   * Checks collision against all motherboard and chassis components for both player AND crypto enemies.
   * If entityY >= component height (with step tolerance), free horizontal passage is permitted.
   * Otherwise, resolves horizontal penetration with sliding push vectors.
   */
  public checkCollision(
    pX: number,
    pZ: number,
    entityRadius = 0.55,
    entityY = 0
  ): { collided: boolean; pushX: number; pushZ: number } {
    let pushX = 0
    let pushZ = 0
    let collided = false

    for (const c of this.colliders) {
      // If entity is on top of or jumping above the component, allow free passage
      if (entityY >= c.height - 0.12) continue

      const dx = pX - c.x
      const dz = pZ - c.z

      const overlapX = c.halfW + entityRadius - Math.abs(dx)
      const overlapZ = c.halfD + entityRadius - Math.abs(dz)

      if (overlapX > 0 && overlapZ > 0) {
        collided = true
        if (overlapX < overlapZ) {
          pushX += (dx >= 0 ? 1 : -1) * overlapX
        } else {
          pushZ += (dz >= 0 ? 1 : -1) * overlapZ
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


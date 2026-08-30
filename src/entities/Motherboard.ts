import * as THREE from 'three'

// Authentic Sony PlayStation 1 (PU-18) Motherboard in 3D
// Faithful layout featuring:
// - IC101: Sony MIPS R3000A CPU (CXD8530AQ)
// - IC201: Sony GPU (CXD8561Q) with heatsink spreader
// - IC308: Sony SPU Sound Processor (CXD2925Q)
// - IC701: CD-ROM Mechacon Controller (CXD1815Q)
// - IC102/IC103: 2MB Work RAM TSOP chips
// - IC202/IC203: 1MB Dual-Port VRAM chips
// - IC104: 512KB BIOS ROM
// - CD-ROM Optical Drive spindle motor base & laser sled rail
// - Dual Controller & Memory Card front port block (Ports 1 & 2)
// - AV Multi-Out & Serial/Parallel rear connector blocks
// - Crystal Oscillators X101 / X201 (silver cans)
// - SMD Aluminium Capacitors & Silk-screen PCB markings

export class Motherboard {
  public readonly group: THREE.Group
  public readonly colliders: { x: number; z: number; radius: number; height: number }[] = []
  private traceMaterials: THREE.MeshBasicMaterial[] = []

  constructor(scene: THREE.Scene, width = 36, depth = 26) {
    this.group = new THREE.Group()

    // 1. Classic PS1 Forest Green PCB Substrate
    const pcbGeo = new THREE.BoxGeometry(width, 0.6, depth)
    const pcbMat = new THREE.MeshLambertMaterial({
      color: 0x1f4a32,
      flatShading: true,
    })
    const pcb = new THREE.Mesh(pcbGeo, pcbMat)
    pcb.position.set(width / 2, -0.3, depth / 2)
    pcb.receiveShadow = true
    this.group.add(pcb)

    // Gold grounding perimeter edge trace
    const goldBorderMat = new THREE.MeshLambertMaterial({ color: 0xd4af37, flatShading: true })
    const borderT = new THREE.Mesh(new THREE.BoxGeometry(width, 0.62, 0.4), goldBorderMat)
    borderT.position.set(width / 2, -0.29, 0.2)
    const borderB = new THREE.Mesh(new THREE.BoxGeometry(width, 0.62, 0.4), goldBorderMat)
    borderB.position.set(width / 2, -0.29, depth - 0.2)
    const borderL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.62, depth), goldBorderMat)
    borderL.position.set(0.2, -0.29, depth / 2)
    const borderR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.62, depth), goldBorderMat)
    borderR.position.set(width - 0.2, -0.29, depth / 2)
    this.group.add(borderT, borderB, borderL, borderR)

    // 2. PS1 Silk-Screen Text Plates ("SONY COMPUTER ENTERTAINMENT INC.", "PU-18", "MADE IN JAPAN")
    this.buildSilkscreenLabels(width, depth)

    // 3. Central Chips: CPU (IC101) & GPU (IC201) & SPU (IC308) & CD Mechacon (IC701)
    this.buildPs1Cpu(18, 13) // IC101 MIPS R3000A Center
    this.buildPs1Gpu(11, 13) // IC201 GPU Left
    this.buildPs1Spu(12, 19) // IC308 SPU
    this.buildPs1Mechacon(25, 9) // IC701 CD-ROM Controller
    this.buildBiosRom(11, 7) // IC104 BIOS

    // 4. Memory Chips: 2MB Work RAM & 1MB VRAM
    this.buildRamChips([
      { x: 17, z: 8, label: 'IC102 RAM' },
      { x: 19.5, z: 8, label: 'IC103 RAM' },
      { x: 8, z: 11, label: 'IC202 VRAM' },
      { x: 8, z: 15, label: 'IC203 VRAM' },
    ])

    // 5. CD-ROM Drive Spindle & Laser Carriage Assembly (Right Zone)
    this.buildCdRomSpindle(26, 17)

    // 6. Front Controller & Memory Card Ports Block (Dual Gray Ports)
    this.buildControllerPorts(18, 25.2)

    // 7. Rear Connectors (AV Multi-Out & Serial/Parallel I/O)
    this.buildRearConnectors(18, 0.8)

    // 8. PS1 Shiny Silver Crystal Oscillators (X101 67MHz, X201 53MHz)
    this.buildCrystalOscillators([
      { x: 15, z: 10 },
      { x: 9.5, z: 17 },
    ])

    // 9. Towering PS1 SMD Aluminium Electrolytic Capacitors
    this.buildPs1Capacitors([
      { x: 6, z: 5, radius: 0.75, height: 2.8 },
      { x: 7.8, z: 5, radius: 0.75, height: 2.8 },
      { x: 5, z: 19, radius: 0.85, height: 3.2 },
      { x: 7, z: 19, radius: 0.85, height: 3.2 },
      { x: 23, z: 5, radius: 0.7, height: 2.5 },
      { x: 31, z: 6, radius: 0.8, height: 3.0 },
      { x: 32, z: 11, radius: 0.7, height: 2.6 },
      { x: 31, z: 22, radius: 0.75, height: 2.8 },
      { x: 7, z: 23, radius: 0.75, height: 2.8 },
    ])

    // 10. PS1 Copper Traces & Power Lines
    this.buildCircuitTraces(width, depth)

    scene.add(this.group)
  }

  private buildSilkscreenLabels(width: number, depth: number): void {
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee })
    // SONY Silkscreen banner
    const sonyPlate = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.02, 0.6), whiteMat)
    sonyPlate.position.set(18, 0.02, 3.5)
    this.group.add(sonyPlate)

    // "PU-18" PCB Model Identifier
    const puPlate = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.02, 0.5), whiteMat)
    puPlate.position.set(4.5, 0.02, 3.5)
    this.group.add(puPlate)

    // "MADE IN JAPAN" Solder Pad label
    const japanPlate = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.02, 0.4), whiteMat)
    japanPlate.position.set(31, 0.02, 3.5)
    this.group.add(japanPlate)
  }

  private buildPs1Cpu(x: number, z: number): void {
    const cpuGroup = new THREE.Group()
    cpuGroup.position.set(x, 0, z)

    // Main Black Epoxy Package (Sony CXD8530AQ MIPS R3000A)
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x181818, flatShading: true })
    const body = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.45, 5.2), bodyMat)
    body.position.y = 0.225
    body.castShadow = true
    body.receiveShadow = true
    cpuGroup.add(body)

    // Gold "SONY" Heat Spreader Center Plate
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xe6b800, flatShading: true })
    const logoPlate = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 3.6), goldMat)
    logoPlate.position.y = 0.48
    logoPlate.castShadow = true
    cpuGroup.add(logoPlate)

    // Quad-side Silver Lead Pins (QFP package 208 pins representation)
    const pinMat = new THREE.MeshLambertMaterial({ color: 0xd0d8e0, flatShading: true })
    const pinBarX = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.1, 0.2), pinMat)
    pinBarX.position.set(0, 0.1, 2.7)
    const pinBarX2 = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.1, 0.2), pinMat)
    pinBarX2.position.set(0, 0.1, -2.7)
    const pinBarZ = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 5.6), pinMat)
    pinBarZ.position.set(2.7, 0.1, 0)
    const pinBarZ2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 5.6), pinMat)
    pinBarZ2.position.set(-2.7, 0.1, 0)
    cpuGroup.add(pinBarX, pinBarX2, pinBarZ, pinBarZ2)

    this.group.add(cpuGroup)
    this.colliders.push({ x, z, radius: 2.8, height: 0.8 })
  }

  private buildPs1Gpu(x: number, z: number): void {
    const gpuGroup = new THREE.Group()
    gpuGroup.position.set(x, 0, z)

    // Sony GPU Package (CXD8561Q)
    const gpuBody = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.4, 4.4), new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true }))
    gpuBody.position.y = 0.2
    gpuBody.castShadow = true
    gpuGroup.add(gpuBody)

    // Aluminum Heatsink plate
    const heatSpreader = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 3.2), new THREE.MeshLambertMaterial({ color: 0x99aab8, flatShading: true }))
    heatSpreader.position.y = 0.45
    heatSpreader.castShadow = true
    gpuGroup.add(heatSpreader)

    this.group.add(gpuGroup)
    this.colliders.push({ x, z, radius: 2.4, height: 0.7 })
  }

  private buildPs1Spu(x: number, z: number): void {
    const spuMat = new THREE.MeshLambertMaterial({ color: 0x1f1f1f, flatShading: true })
    const spu = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.35, 3.8), spuMat)
    spu.position.set(x, 0.175, z)
    spu.castShadow = true
    this.group.add(spu)
    this.colliders.push({ x, z, radius: 2.0, height: 0.6 })
  }

  private buildPs1Mechacon(x: number, z: number): void {
    const chipMat = new THREE.MeshLambertMaterial({ color: 0x181818, flatShading: true })
    const chip = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 3.2), chipMat)
    chip.position.set(x, 0.175, z)
    chip.castShadow = true
    this.group.add(chip)
    this.colliders.push({ x, z, radius: 1.8, height: 0.6 })
  }

  private buildBiosRom(x: number, z: number): void {
    const romMat = new THREE.MeshLambertMaterial({ color: 0x2d3748, flatShading: true })
    const rom = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 4.0), romMat)
    rom.position.set(x, 0.15, z)
    rom.castShadow = true
    this.group.add(rom)
    this.colliders.push({ x, z, radius: 1.8, height: 0.5 })
  }

  private buildRamChips(chips: { x: number; z: number; label: string }[]): void {
    const ramMat = new THREE.MeshLambertMaterial({ color: 0x151515, flatShading: true })
    for (const c of chips) {
      const ram = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 2.8), ramMat)
      ram.position.set(c.x, 0.125, c.z)
      ram.castShadow = true
      this.group.add(ram)
      this.colliders.push({ x: c.x, z: c.z, radius: 1.2, height: 0.4 })
    }
  }

  private buildCdRomSpindle(x: number, z: number): void {
    const cdGroup = new THREE.Group()
    cdGroup.position.set(x, 0, z)

    // Metallic Circular Drive Wells
    const wellMat = new THREE.MeshLambertMaterial({ color: 0x4a5568, flatShading: true })
    const well = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.8, 0.4, 24), wellMat)
    well.position.y = 0.2
    well.receiveShadow = true
    cdGroup.add(well)

    // Center Spindle Chuck (Black Hub with 3 Ball Bearings)
    const hubMat = new THREE.MeshLambertMaterial({ color: 0x111111, flatShading: true })
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 1.2, 16), hubMat)
    hub.position.y = 0.8
    hub.castShadow = true
    cdGroup.add(hub)

    // Top Spindle Cap
    const capMat = new THREE.MeshLambertMaterial({ color: 0xcccccc, flatShading: true })
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 12), capMat)
    cap.position.y = 1.5
    cap.castShadow = true
    cdGroup.add(cap)

    // Optical Laser Carriage Sled Rails (Silver Rods)
    const rodMat = new THREE.MeshLambertMaterial({ color: 0xd0d0d0, flatShading: true })
    const rod1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6.5), rodMat)
    rod1.rotation.z = Math.PI / 2
    rod1.position.set(0, 0.35, -2.2)
    const rod2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6.5), rodMat)
    rod2.rotation.z = Math.PI / 2
    rod2.position.set(0, 0.35, 2.2)
    cdGroup.add(rod1, rod2)

    this.group.add(cdGroup)
    this.colliders.push({ x, z, radius: 4.8, height: 1.8 })
  }

  private buildControllerPorts(x: number, z: number): void {
    // PS1 Front Dual Controller / Memory Card Ports Block
    const portGroup = new THREE.Group()
    portGroup.position.set(x, 0, z)

    const greyMat = new THREE.MeshLambertMaterial({ color: 0x889098, flatShading: true })
    const housing = new THREE.Mesh(new THREE.BoxGeometry(16.0, 2.6, 1.8), greyMat)
    housing.position.y = 1.3
    housing.castShadow = true
    housing.receiveShadow = true
    portGroup.add(housing)

    // Dual Controller Sockets (Port 1 & Port 2)
    const socketMat = new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true })
    const sock1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.8, 0.4), socketMat)
    sock1.position.set(-4.5, 0.8, -0.9)
    const sock2 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.8, 0.4), socketMat)
    sock2.position.set(4.5, 0.8, -0.9)
    portGroup.add(sock1, sock2)

    // Memory Card Slots above controller sockets
    const cardSlot1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 0.4), socketMat)
    cardSlot1.position.set(-4.5, 1.8, -0.9)
    const cardSlot2 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 0.4), socketMat)
    cardSlot2.position.set(4.5, 1.8, -0.9)
    portGroup.add(cardSlot1, cardSlot2)

    this.group.add(portGroup)
    this.colliders.push({ x, z, radius: 8.2, height: 2.6 })
  }

  private buildRearConnectors(x: number, z: number): void {
    const rearGroup = new THREE.Group()
    rearGroup.position.set(x, 0, z)

    const metalMat = new THREE.MeshLambertMaterial({ color: 0xa0aab4, flatShading: true })

    // AV Multi Out Port Block
    const avPort = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.2, 1.6), metalMat)
    avPort.position.set(-4.0, 1.1, 0)
    avPort.castShadow = true
    rearGroup.add(avPort)

    // Serial I/O & Parallel I/O Ports Block
    const serialPort = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.0, 1.6), metalMat)
    serialPort.position.set(4.5, 1.0, 0)
    serialPort.castShadow = true
    rearGroup.add(serialPort)

    this.group.add(rearGroup)
    this.colliders.push({ x, z, radius: 6.5, height: 2.2 })
  }

  private buildCrystalOscillators(crystals: { x: number; z: number }[]): void {
    const canMat = new THREE.MeshLambertMaterial({ color: 0xe0e6ed, flatShading: true })
    for (const c of crystals) {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 12), canMat)
      can.position.set(c.x, 0.6, c.z)
      can.castShadow = true
      this.group.add(can)
    }
  }

  private buildPs1Capacitors(caps: { x: number; z: number; radius: number; height: number }[]): void {
    for (const c of caps) {
      const capGroup = new THREE.Group()
      capGroup.position.set(c.x, 0, c.z)

      // PS1 Silver Aluminium SMD Cylinder Body
      const bodyGeo = new THREE.CylinderGeometry(c.radius, c.radius, c.height, 12)
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0xd8dde4, flatShading: true })
      const body = new THREE.Mesh(bodyGeo, bodyMat)
      body.position.y = c.height / 2
      body.castShadow = true
      body.receiveShadow = true
      capGroup.add(body)

      // Black top polarity marker semi-circle
      const topGeo = new THREE.CylinderGeometry(c.radius * 0.95, c.radius * 0.95, 0.08, 12)
      const topMat = new THREE.MeshLambertMaterial({ color: 0x1a202c, flatShading: true })
      const top = new THREE.Mesh(topGeo, topMat)
      top.position.y = c.height + 0.04
      top.castShadow = true
      capGroup.add(top)

      this.group.add(capGroup)
      this.colliders.push({ x: c.x, z: c.z, radius: c.radius + 0.2, height: c.height })
    }
  }

  private buildCircuitTraces(width: number, depth: number): void {
    // Glowing golden/green copper PCB trace tracks
    const traceMat = new THREE.MeshBasicMaterial({
      color: 0x44ff99,
      transparent: true,
      opacity: 0.45,
    })
    this.traceMaterials.push(traceMat)

    const traces = [
      { x: 18, z: 10.5, w: 0.25, d: 4.5 },
      { x: 14.5, z: 13, w: 6.5, d: 0.25 },
      { x: 18, z: 15.5, w: 0.25, d: 4.5 },
      { x: 21.5, z: 13, w: 6.5, d: 0.25 },
      { x: 12, z: 16, w: 0.25, d: 5.5 },
      { x: 25, z: 13, w: 0.25, d: 7.5 },
      { x: 11, z: 10, w: 0.25, d: 5.5 },
      { x: 18, z: 6, w: 10.0, d: 0.25 },
    ]

    for (const t of traces) {
      const trace = new THREE.Mesh(new THREE.BoxGeometry(t.w, 0.02, t.d), traceMat)
      trace.position.set(t.x, 0.01, t.z)
      this.group.add(trace)
    }
  }

  update(time: number): void {
    const pulse = 0.35 + Math.sin(time * 3.5) * 0.15
    for (const mat of this.traceMaterials) {
      mat.opacity = pulse
    }
  }
}

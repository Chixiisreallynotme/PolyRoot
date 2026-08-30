import * as THREE from 'three'

// 3D Macro Motherboard with towering electronic components (Capacitors, Heat Sink, RAM banks, CPU socket)
// Creates the physical sense of being tiny on a giant computer circuit board

export class Motherboard {
  public readonly group: THREE.Group
  public readonly colliders: { x: number; z: number; radius: number; height: number }[] = []
  private traceMaterials: THREE.MeshBasicMaterial[] = []

  constructor(scene: THREE.Scene, width = 36, depth = 26) {
    this.group = new THREE.Group()

    // 1. PCB Main Substrate — Dark green soldermask with gold edge bezel
    const pcbGeo = new THREE.BoxGeometry(width, 0.6, depth)
    const pcbMat = new THREE.MeshLambertMaterial({
      color: 0x143828,
      flatShading: true,
    })
    const pcb = new THREE.Mesh(pcbGeo, pcbMat)
    pcb.position.set(width / 2, -0.3, depth / 2)
    pcb.receiveShadow = true
    this.group.add(pcb)

    // Gold grounding border perimeter
    const borderMat = new THREE.MeshLambertMaterial({ color: 0xcc9922, flatShading: true })
    const borderT = new THREE.Mesh(new THREE.BoxGeometry(width, 0.62, 0.4), borderMat)
    borderT.position.set(width / 2, -0.29, 0.2)
    const borderB = new THREE.Mesh(new THREE.BoxGeometry(width, 0.62, 0.4), borderMat)
    borderB.position.set(width / 2, -0.29, depth - 0.2)
    const borderL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.62, depth), borderMat)
    borderL.position.set(0.2, -0.29, depth / 2)
    const borderR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.62, depth), borderMat)
    borderR.position.set(width - 0.2, -0.29, depth / 2)
    this.group.add(borderT, borderB, borderL, borderR)

    // 2. CPU Socket & Retention Plate (Center Area)
    this.buildCpuSocket(width * 0.45, depth * 0.45)

    // 3. Towering Electrolytic Capacitors (Clustered near CPU & power delivery)
    this.buildCapacitors([
      { x: 6, z: 5, radius: 0.9, height: 3.2, color: 0x1b2b52 },
      { x: 8, z: 5, radius: 0.9, height: 3.2, color: 0x1b2b52 },
      { x: 10, z: 5, radius: 0.9, height: 3.2, color: 0x1b2b52 },
      { x: 6, z: 7.5, radius: 0.75, height: 2.6, color: 0x222222 },
      { x: 8, z: 7.5, radius: 0.75, height: 2.6, color: 0x222222 },
      { x: 28, z: 6, radius: 0.85, height: 3.0, color: 0x661122 },
      { x: 28, z: 8.5, radius: 0.85, height: 3.0, color: 0x661122 },
      { x: 28, z: 11, radius: 0.85, height: 3.0, color: 0x661122 },
      { x: 7, z: 20, radius: 0.8, height: 2.8, color: 0x1b2b52 },
      { x: 9, z: 20, radius: 0.8, height: 2.8, color: 0x1b2b52 },
    ])

    // 4. Massive Aluminum Heatsink with Cooling Fins
    this.buildHeatsink(6, 13, 4.5, 4.0, 3.5)

    // 5. Dual RAM Memory Slots with Circuit Sticks
    this.buildRamSlots(24, 16, 2)

    // 6. PCIe Expansion Slots
    this.buildPcieSlot(14, 22, 14.0)

    // 7. Rear I/O Connectors (USB / Ethernet RJ45 metal towers)
    this.buildIoConnectors(1.5, 4)

    // 8. Glowing Copper Circuit Traces along the board floor
    this.buildCircuitTraces(width, depth)

    scene.add(this.group)
  }

  private buildCpuSocket(x: number, z: number): void {
    // Socket Base Plate
    const baseGeo = new THREE.BoxGeometry(6.5, 0.4, 6.5)
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a, flatShading: true })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.position.set(x, 0.2, z)
    base.receiveShadow = true
    this.group.add(base)

    // Gold Pin Grid Matrix
    const gridGeo = new THREE.BoxGeometry(5.2, 0.1, 5.2)
    const gridMat = new THREE.MeshLambertMaterial({ color: 0xe6b800, flatShading: true })
    const grid = new THREE.Mesh(gridGeo, gridMat)
    grid.position.set(x, 0.45, z)
    this.group.add(grid)

    // Metallic Retention Lever
    const leverGeo = new THREE.CylinderGeometry(0.08, 0.08, 6.8)
    const leverMat = new THREE.MeshLambertMaterial({ color: 0xd0d0d0, flatShading: true })
    const lever = new THREE.Mesh(leverGeo, leverMat)
    lever.rotation.z = Math.PI / 2
    lever.position.set(x, 0.5, z - 3.4)
    this.group.add(lever)
  }

  private buildCapacitors(caps: { x: number; z: number; radius: number; height: number; color: number }[]): void {
    for (const c of caps) {
      const capGroup = new THREE.Group()
      capGroup.position.set(c.x, 0, c.z)

      // Main cylinder body
      const bodyGeo = new THREE.CylinderGeometry(c.radius, c.radius, c.height, 12)
      const bodyMat = new THREE.MeshLambertMaterial({ color: c.color, flatShading: true })
      const body = new THREE.Mesh(bodyGeo, bodyMat)
      body.position.y = c.height / 2
      body.castShadow = true
      body.receiveShadow = true
      capGroup.add(body)

      // Metallic top cap with cross score
      const topGeo = new THREE.CylinderGeometry(c.radius * 0.95, c.radius * 0.95, 0.1, 12)
      const topMat = new THREE.MeshLambertMaterial({ color: 0xc0c0c0, flatShading: true })
      const top = new THREE.Mesh(topGeo, topMat)
      top.position.y = c.height + 0.05
      top.castShadow = true
      capGroup.add(top)

      // Minus stripe indicator (white vertical stripe)
      const stripeGeo = new THREE.BoxGeometry(0.1, c.height * 0.8, c.radius * 0.2)
      const stripeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true })
      const stripe = new THREE.Mesh(stripeGeo, stripeMat)
      stripe.position.set(c.radius * 0.92, c.height / 2, 0)
      capGroup.add(stripe)

      this.group.add(capGroup)
      this.colliders.push({ x: c.x, z: c.z, radius: c.radius + 0.3, height: c.height })
    }
  }

  private buildHeatsink(x: number, z: number, w: number, d: number, h: number): void {
    const hsGroup = new THREE.Group()
    hsGroup.position.set(x, 0, z)

    // Solid base plate
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x4a5568, flatShading: true })
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), baseMat)
    base.position.y = 0.25
    base.castShadow = true
    base.receiveShadow = true
    hsGroup.add(base)

    // Aluminum Cooling Fins Array (6 vertical fins)
    const finMat = new THREE.MeshLambertMaterial({ color: 0x718096, flatShading: true })
    const numFins = 6
    const finThickness = 0.2
    const spacing = (w - finThickness) / (numFins - 1)

    for (let i = 0; i < numFins; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(finThickness, h - 0.5, d), finMat)
      fin.position.set(-w / 2 + i * spacing + finThickness / 2, 0.5 + (h - 0.5) / 2, 0)
      fin.castShadow = true
      fin.receiveShadow = true
      hsGroup.add(fin)
    }

    this.group.add(hsGroup)
    this.colliders.push({ x, z, radius: Math.max(w, d) / 2, height: h })
  }

  private buildRamSlots(x: number, z: number, count: number): void {
    const slotSpacing = 1.4
    for (let s = 0; s < count; s++) {
      const slotZ = z + s * slotSpacing
      const ramGroup = new THREE.Group()
      ramGroup.position.set(x, 0, slotZ)

      // Black socket slot
      const socketMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, flatShading: true })
      const socket = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.4, 0.6), socketMat)
      socket.position.y = 0.2
      socket.castShadow = true
      ramGroup.add(socket)

      // Tall RAM PCB Stick
      const stickMat = new THREE.MeshLambertMaterial({ color: 0x0e4d2e, flatShading: true })
      const stick = new THREE.Mesh(new THREE.BoxGeometry(9.6, 2.2, 0.15), stickMat)
      stick.position.y = 1.4
      stick.castShadow = true
      stick.receiveShadow = true
      ramGroup.add(stick)

      // Black memory IC chips on the stick
      const chipMat = new THREE.MeshLambertMaterial({ color: 0x111111, flatShading: true })
      for (let c = 0; c < 6; c++) {
        const chip = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.22), chipMat)
        chip.position.set(-3.8 + c * 1.5, 1.4, 0)
        chip.castShadow = true
        ramGroup.add(chip)
      }

      // White lock latches at both ends
      const latchMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee, flatShading: true })
      const latchL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.5), latchMat)
      latchL.position.set(-5.0, 0.5, 0)
      const latchR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.5), latchMat)
      latchR.position.set(5.0, 0.5, 0)
      ramGroup.add(latchL, latchR)

      this.group.add(ramGroup)
      this.colliders.push({ x, z: slotZ, radius: 5.2, height: 2.6 })
    }
  }

  private buildPcieSlot(x: number, z: number, length: number): void {
    const slotMat = new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true })
    const slot = new THREE.Mesh(new THREE.BoxGeometry(length, 0.6, 0.8), slotMat)
    slot.position.set(x, 0.3, z)
    slot.castShadow = true
    slot.receiveShadow = true
    this.group.add(slot)
  }

  private buildIoConnectors(x: number, z: number): void {
    // Metal IO block (USB + Ethernet towers)
    const ioMat = new THREE.MeshLambertMaterial({ color: 0x8899aa, flatShading: true })
    const usbTower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 3.2), ioMat)
    usbTower.position.set(x, 1.4, z)
    usbTower.castShadow = true
    this.group.add(usbTower)

    const rj45 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.8), ioMat)
    rj45.position.set(x, 1.2, z + 4.0)
    rj45.castShadow = true
    this.group.add(rj45)

    this.colliders.push({ x, z: z + 2.0, radius: 2.5, height: 2.8 })
  }

  private buildCircuitTraces(width: number, depth: number): void {
    // Luminous glowing circuit paths on the floor
    const traceMat = new THREE.MeshBasicMaterial({
      color: 0x33ff88,
      transparent: true,
      opacity: 0.35,
    })
    this.traceMaterials.push(traceMat)

    const traces = [
      { x: 12, z: 10, w: 14, d: 0.2 },
      { x: 18, z: 8, w: 0.2, d: 10 },
      { x: 22, z: 14, w: 8, d: 0.2 },
      { x: 10, z: 18, w: 12, d: 0.2 },
      { x: 15, z: 16, w: 0.2, d: 8 },
      { x: 8, z: 12, w: 6, d: 0.2 },
      { x: 25, z: 9, w: 0.2, d: 6 },
    ]

    for (const t of traces) {
      const trace = new THREE.Mesh(new THREE.BoxGeometry(t.w, 0.02, t.d), traceMat)
      trace.position.set(t.x, 0.01, t.z)
      this.group.add(trace)
    }
  }

  update(time: number): void {
    // Subtle pulse of glowing copper traces
    const pulse = 0.25 + Math.sin(time * 3.0) * 0.15
    for (const mat of this.traceMaterials) {
      mat.opacity = pulse
    }
  }
}

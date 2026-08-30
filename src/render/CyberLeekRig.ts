import * as THREE from 'three'

// CyberLeekRig — Procedural Animation Rig for Boss CyberLeek
// Matches official artwork media_1788097114828.jpg:
// - 3 sweeping organic leek leaves with wind-wave simulation
// - Stalk head with zig-zag leek crown transition, pixel sunglasses, and ^w^ smirk
// - Tactical combat exoskeleton with shoulder pauldrons, utility belt, knee pads, combat boots
// - Glowing cyan energy fists
// - State machine: Idle breathing, Aggressive tactical stride, Dual-fist leap slam, and Disc fling

export interface CyberLeekNodes {
  root: THREE.Group
  body: THREE.Group
  head: THREE.Object3D
  leaves: THREE.Object3D[]
  leftArm: THREE.Object3D
  rightArm: THREE.Object3D
  leftFist: THREE.Mesh
  rightFist: THREE.Mesh
  leftLeg: THREE.Object3D
  rightLeg: THREE.Object3D
  leftBoot: THREE.Object3D
  rightBoot: THREE.Object3D
}

export class CyberLeekRig {
  private time = 0
  public state: 'idle' | 'chase' | 'leap_slam' | 'disc_throw' = 'idle'
  private actionTimer = 0
  private actionDuration = 1.0

  constructor(private nodes: CyberLeekNodes) {}

  update(dt: number, isMoving: boolean, speed = 0): void {
    this.time += dt * 8.0

    // Energy Fist Pulsation (Continuous)
    const fistPulse = 1.0 + Math.sin(this.time * 2.5) * 0.22
    this.nodes.leftFist.scale.set(fistPulse, fistPulse, fistPulse)
    this.nodes.rightFist.scale.set(fistPulse, fistPulse, fistPulse)

    // Sinuous Organic Leek Leaf Swaying
    for (let i = 0; i < this.nodes.leaves.length; i++) {
      const leaf = this.nodes.leaves[i]
      if (!leaf) continue
      const wave = Math.sin(this.time * 0.8 + i * 0.7) * 0.12
      const swayZ = Math.cos(this.time * 0.6 + i * 0.5) * 0.08
      leaf.rotation.x = -0.7 - wave - (isMoving ? 0.25 : 0)
      leaf.rotation.z = (i === 0 ? 0.3 : i === 2 ? -0.3 : 0) + swayZ
    }

    if (this.state === 'leap_slam') {
      this.updateLeapSlam(dt)
      return
    }

    if (this.state === 'disc_throw') {
      this.updateDiscThrow(dt)
      return
    }

    // Locomotion & Idle State Machine
    if (isMoving) {
      this.updateChaseWalk(dt, speed)
    } else {
      this.updateIdle(dt)
    }
  }

  private updateIdle(dt: number): void {
    const idleBreath = Math.sin(this.time * 0.5) * 0.05
    this.nodes.body.position.y = idleBreath
    this.nodes.body.scale.y = 1.0 + idleBreath * 0.3
    this.nodes.body.rotation.x = 0

    // Gentle arm resting pose
    this.nodes.leftArm.rotation.x = Math.sin(this.time * 0.4) * 0.06
    this.nodes.rightArm.rotation.x = -Math.sin(this.time * 0.4) * 0.06
    this.nodes.leftArm.rotation.z = 0.2
    this.nodes.rightArm.rotation.z = -0.2

    // Reset legs
    this.nodes.leftLeg.rotation.x = 0
    this.nodes.rightLeg.rotation.x = 0
    this.nodes.leftLeg.position.y = 0.8
    this.nodes.rightLeg.position.y = 0.8
  }

  private updateChaseWalk(dt: number, speed: number): void {
    const walkFreq = this.time * 1.5
    const stride = Math.sin(walkFreq) * 0.65

    // Tactical forward lean & bounce
    this.nodes.body.position.y = Math.abs(Math.sin(walkFreq)) * 0.15
    this.nodes.body.rotation.x = 0.22

    // Heavy combat stride
    this.nodes.leftLeg.rotation.x = stride
    this.nodes.rightLeg.rotation.x = -stride
    this.nodes.leftLeg.position.y = 0.8 + Math.max(0, -Math.sin(walkFreq) * 0.15)
    this.nodes.rightLeg.position.y = 0.8 + Math.max(0, Math.sin(walkFreq) * 0.15)

    if (this.nodes.leftBoot) this.nodes.leftBoot.rotation.x = -stride * 0.4
    if (this.nodes.rightBoot) this.nodes.rightBoot.rotation.x = stride * 0.4

    // Counter-swinging arms
    this.nodes.leftArm.rotation.x = -stride * 0.8
    this.nodes.rightArm.rotation.x = stride * 0.8
    this.nodes.leftArm.rotation.z = 0.35 + Math.abs(Math.sin(walkFreq)) * 0.15
    this.nodes.rightArm.rotation.z = -0.35 - Math.abs(Math.sin(walkFreq)) * 0.15
  }

  triggerLeapSlam(duration = 1.1): void {
    this.state = 'leap_slam'
    this.actionTimer = 0
    this.actionDuration = duration
  }

  private updateLeapSlam(dt: number): void {
    this.actionTimer += dt
    const t = Math.min(1.0, this.actionTimer / this.actionDuration)

    if (t < 0.35) {
      // 1. Crouch & Charge (squash)
      const chargeT = t / 0.35
      this.nodes.body.position.y = -0.4 * chargeT
      this.nodes.body.scale.set(1.2, 0.7, 1.2)
      this.nodes.leftArm.rotation.set(0.4, 0, 0.6)
      this.nodes.rightArm.rotation.set(0.4, 0, -0.6)
    } else if (t < 0.85) {
      // 2. High Jump & Raised Dual Fists
      const jumpT = (t - 0.35) / 0.5
      this.nodes.body.position.y = Math.sin(jumpT * Math.PI) * 4.5
      this.nodes.body.scale.set(0.85, 1.3, 0.85)
      // Raise both glowing fists high above head in power pose
      this.nodes.leftArm.rotation.set(-2.6, 0, 0.3)
      this.nodes.rightArm.rotation.set(-2.6, 0, -0.3)
      this.nodes.leftLeg.rotation.x = 0.4
      this.nodes.rightLeg.rotation.x = 0.4
    } else {
      // 3. Ground Slam Smash
      const slamT = (t - 0.85) / 0.15
      this.nodes.body.position.y = 0
      this.nodes.body.scale.set(1.4, 0.6, 1.4)
      this.nodes.leftArm.rotation.set(1.2, 0, 0.2)
      this.nodes.rightArm.rotation.set(1.2, 0, -0.2)
      if (t >= 1.0) {
        this.state = 'idle'
        this.nodes.body.scale.set(1, 1, 1)
      }
    }
  }

  triggerDiscThrow(duration = 0.6): void {
    this.state = 'disc_throw'
    this.actionTimer = 0
    this.actionDuration = duration
  }

  private updateDiscThrow(dt: number): void {
    this.actionTimer += dt
    const t = Math.min(1.0, this.actionTimer / this.actionDuration)

    if (t < 0.4) {
      // Windup right arm back
      this.nodes.rightArm.rotation.set(-1.8, 0, -0.8)
      this.nodes.body.rotation.y = -0.4
    } else {
      // Fling forward snap
      this.nodes.rightArm.rotation.set(1.4, 0, 0.2)
      this.nodes.body.rotation.y = 0.3
      if (t >= 1.0) {
        this.state = 'idle'
        this.nodes.body.rotation.y = 0
      }
    }
  }
}

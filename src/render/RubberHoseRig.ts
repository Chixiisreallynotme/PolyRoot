import * as THREE from 'three'

// RubberHoseRig — Procedural 1930s Cartoon / Cuphead / Vintage Mickey style animation rig
// Manages sinusoidal bobbing, elastic limb pendulum, banking into turns, and squash/stretch

export interface RubberHoseConfig {
  body: THREE.Object3D
  leftLeg?: THREE.Object3D
  rightLeg?: THREE.Object3D
  leftArm?: THREE.Object3D
  rightArm?: THREE.Object3D
  leftShoe?: THREE.Object3D
  rightShoe?: THREE.Object3D
  baseScaleY?: number
  bounceSpeed?: number
  stepFrequency?: number
  armSwingAngle?: number
  legSwingAngle?: number
}

export class RubberHoseRig {
  private time = 0
  private isMoving = false
  private speed = 0
  private currentLean = 0
  private jumpSquash = 1.0

  constructor(private config: RubberHoseConfig) {
    this.config.baseScaleY = this.config.baseScaleY ?? 1.0
    this.config.bounceSpeed = this.config.bounceSpeed ?? 14.0
    this.config.stepFrequency = this.config.stepFrequency ?? 12.0
    this.config.armSwingAngle = this.config.armSwingAngle ?? 0.65
    this.config.legSwingAngle = this.config.legSwingAngle ?? 0.85
  }

  update(dt: number, velocity: { x: number; z: number }, isDashing = false, isJumping = false): void {
    this.speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
    this.isMoving = this.speed > 0.1

    const animSpeed = this.isMoving ? (isDashing ? 22.0 : 14.0) : 4.0
    this.time += dt * animSpeed

    // 1. Vertical Harmonic Bobbing (Squash & Stretch breathing or trot)
    if (this.isMoving) {
      // Bouncy running step (2 bounces per walk cycle)
      const bounce = Math.abs(Math.sin(this.time)) * 0.15
      const squash = 1.0 + Math.sin(this.time * 2) * 0.08
      this.config.body.position.y = bounce + (isDashing ? -0.1 : 0)
      this.config.body.scale.y = (this.config.baseScaleY ?? 1.0) * (isDashing ? 0.75 : squash)
      this.config.body.scale.x = isDashing ? 1.3 : (2.0 - squash) * 0.5 + 0.5
      this.config.body.scale.z = isDashing ? 1.3 : (2.0 - squash) * 0.5 + 0.5
    } else {
      // Idle cartoon breathing bounce
      const idleBounce = Math.sin(this.time) * 0.04
      const idleSquash = 1.0 + Math.cos(this.time) * 0.04
      this.config.body.position.y = idleBounce
      this.config.body.scale.y = (this.config.baseScaleY ?? 1.0) * idleSquash
      this.config.body.scale.x = (2.0 - idleSquash) * 0.5 + 0.5
      this.config.body.scale.z = (2.0 - idleSquash) * 0.5 + 0.5
    }

    // 2. Dynamic Directional Lean
    if (this.isMoving) {
      const targetLean = isDashing ? 0.45 : 0.25
      this.currentLean += (targetLean - this.currentLean) * Math.min(1.0, dt * 10.0)
    } else {
      this.currentLean += (0 - this.currentLean) * Math.min(1.0, dt * 8.0)
    }
    this.config.body.rotation.x = this.currentLean

    // 3. Leg & Shoe Pendulum Motion
    if (this.config.leftLeg && this.config.rightLeg) {
      if (this.isMoving) {
        const legAngle = Math.sin(this.time) * (this.config.legSwingAngle ?? 0.85)
        this.config.leftLeg.rotation.x = legAngle
        this.config.rightLeg.rotation.x = -legAngle

        // Foot lift
        this.config.leftLeg.position.y = Math.max(0, -Math.sin(this.time) * 0.12)
        this.config.rightLeg.position.y = Math.max(0, Math.sin(this.time) * 0.12)

        if (this.config.leftShoe) this.config.leftShoe.rotation.x = -legAngle * 0.5
        if (this.config.rightShoe) this.config.rightShoe.rotation.x = legAngle * 0.5
      } else {
        this.config.leftLeg.rotation.x = 0
        this.config.rightLeg.rotation.x = 0
        this.config.leftLeg.position.y = 0
        this.config.rightLeg.position.y = 0
      }
    }

    // 4. Arm & Glove Counter-phase Swing
    if (this.config.leftArm && this.config.rightArm) {
      if (this.isMoving) {
        const armAngle = -Math.sin(this.time) * (this.config.armSwingAngle ?? 0.65)
        this.config.leftArm.rotation.x = armAngle
        this.config.rightArm.rotation.x = -armAngle
        this.config.leftArm.rotation.z = 0.2 + Math.abs(Math.sin(this.time)) * 0.15
        this.config.rightArm.rotation.z = -0.2 - Math.abs(Math.sin(this.time)) * 0.15
      } else {
        // Idle gentle arm swing
        const idleArm = Math.sin(this.time * 0.5) * 0.08
        this.config.leftArm.rotation.x = idleArm
        this.config.rightArm.rotation.x = -idleArm
        this.config.leftArm.rotation.z = 0.15
        this.config.rightArm.rotation.z = -0.15
      }
    }
  }

  triggerImpactSquash(strength = 0.35): void {
    this.config.body.scale.y = (this.config.baseScaleY ?? 1.0) * (1.0 - strength)
    this.config.body.scale.x = 1.0 + strength
    this.config.body.scale.z = 1.0 + strength
  }
}

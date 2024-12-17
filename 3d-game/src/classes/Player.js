import { Box } from "./Box.js";

export class Player {
  constructor(
    scene,
    gameStats,
    playerModel = new Box({
      width: 1,
      height: 1,
      depth: 1,
      velocity: { x: 0, y: 0, z: 0 },
    }),
    velocity = { x: 0, y: 0, z: 0 },
    position = { x: 0, y: 0, z: 0 },
  ) {
    this.gameStats = gameStats;
    this.scene = scene;
    this.model = playerModel;
    this.velocity = velocity;
    this.model.position.set(position.x, position.y, position.z);
    this.hitBox = new Box({
      width: 1.9,
      height: 1.25,
      depth: 5.1,
      velocity: { x: 0, y: 0, z: 0 },
      isVisible: false,
    });
    this.acceleration = 0.0075;
    this.deceleration = 0.001;
    this.maxSpeed = 3;
    this.turnSpeed = 0.0075;
    this.grip = 0.98;
    this.rotationSpeed = 0.0125;
    this.maxLeftRotation = 3.5;
    this.maxRightRotation = 2.8;
  }
  update(keys) {
    this.handleInput(keys);
    this.applyPhysics();
    this.updateHitbox();
    this.handleBoundaries();
  }
  handleBoundaries() {
    if (this.model.position.z >= 20) this.model.position.z = 20;
    else if (this.model.position.z <= -20) this.model.position.z = -20;
    if (this.model.position.x >= 18) this.model.position.x = 18;
    else if (this.model.position.x <= -18) this.model.position.x = -18;
  }
  applyPhysics() {
    this.model.position.x += this.velocity.x;
    this.model.position.z += this.velocity.z;
    this.velocity.x *= this.grip;
    this.velocity.z *= this.grip;
    if (Math.abs(this.velocity.x) < 0.0001) this.velocity.x = 0;
    if (Math.abs(this.velocity.z) < 0.0001) this.velocity.z = 0;
  }
  updateHitbox() {
    this.hitBox.position.set(
      this.model.position.x,
      this.model.position.y + 0.8,
      this.model.position.z
    );
    this.hitBox.rotation.y = this.model.rotation.y;
    this.hitBox.updateSides();
  }
  handleInput(keys) {
    if (keys.includes("KeyW")) {
      this.velocity.z = Math.max(
        this.velocity.z - this.acceleration,
        -this.maxSpeed
      );
      if (this.gameStats.speed < this.gameStats.maxSpeed) this.gameStats.speed += this.acceleration * 0.25;
    } else if (keys.includes("KeyS")) {
      this.velocity.z = Math.min(
        this.velocity.z + this.acceleration,
        this.maxSpeed
      );
      if (this.gameStats.speed > this.gameStats.minSpeed) this.gameStats.speed -= this.acceleration * 0.25;
    }
    if (keys.includes("KeyA")) {
      const speedFactor = 1 - (Math.abs(this.velocity.z) / this.maxSpeed) * 0.5;
      this.velocity.x = Math.max(
        this.velocity.x - this.turnSpeed * speedFactor,
        -this.maxSpeed * 0.75
      );
      this.model.rotation.y += this.rotationSpeed;
      if (this.model.rotation.y > this.maxLeftRotation)
        this.model.rotation.y = this.maxLeftRotation;
    } else if (keys.includes("KeyD")) {
      const speedFactor = 1 - (Math.abs(this.velocity.z) / this.maxSpeed) * 0.5;
      this.velocity.x = Math.min(
        this.velocity.x + this.turnSpeed * speedFactor,
        this.maxSpeed * 0.75
      );
      this.model.rotation.y -= this.rotationSpeed;
      if (this.model.rotation.y < this.maxRightRotation)
        this.model.rotation.y = this.maxRightRotation;
    }
    if (!keys.includes("KeyA") && !keys.includes("KeyD")) {
      const rotationDiff = Math.PI - this.model.rotation.y;
      if (Math.abs(rotationDiff) > this.rotationSpeed) {
        this.model.rotation.y += Math.sign(rotationDiff) * this.rotationSpeed;
      } else {
        this.model.rotation.y = Math.PI;
      }
    }
    if (!keys.includes("KeyW") && !keys.includes("KeyS")) {
      if (this.gameStats.speed > this.gameStats.idleSpeed) this.gameStats.speed -= this.acceleration * 0.25;
      else if (this.gameStats.speed < this.gameStats.idleSpeed) this.gameStats.speed += this.acceleration * 0.25; 
    }
  }
  setModel(newModel) {
    this.model = newModel;
    this.init();
  }
  init() {
    this.reset();
    this.scene.add(this.model);
    this.scene.add(this.hitBox);
  }
  reset() {
    this.velocity = { x: 0, y: 0, z: 0 };
    this.model.scale.set(0.02, 0.02, 0.02);
    this.model.position.set(0, -1.75, 0);
    this.model.rotation.y = Math.PI;
  }
}
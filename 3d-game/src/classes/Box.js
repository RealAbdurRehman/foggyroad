import * as THREE from "three";
import { boxCollision } from "../utils.js";

export class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = 0x00ff00,
    velocity = {
      x: 0,
      y: 0,
      z: 0,
    },
    position = {
      x: 0,
      y: 0,
      z: 0,
    },
    zAcceleration = false,
    isVisible = true,
    map = null,
    aoMap = null,
    normalMap = null,
    roughnessMap = null,
    displacementMap = null,
    displacementScale = null,
  }) {
    let material;
    if (map && aoMap && normalMap && displacementMap && displacementScale)
      material = new THREE.MeshStandardMaterial({
        map,
        aoMap,
        normalMap,
        roughnessMap,
        displacementMap,
        displacementScale,
      });
    else if (map && normalMap)
      material = new THREE.MeshStandardMaterial({
        map,
        normalMap,
        roughnessMap,
      });
    else material = new THREE.MeshStandardMaterial({ color });
    super(new THREE.BoxGeometry(width, height, depth), material);
    this.visible = isVisible;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.position.set(position.x, position.y, position.z);
    this.top = this.position.y + this.height / 2;
    this.bottom = this.position.y - this.height / 2;
    this.left = this.position.x - this.width / 2;
    this.right = this.position.x + this.width / 2;
    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
    this.velocity = velocity;
    this.gravity = -0.005;
    this.zAcceleration = zAcceleration;
    this.zAccelerationAmmount = Math.random() * 0.0025 + 0.0025;
  }
  update(ground) {
    this.updateSides();
    if (this.zAcceleration) this.velocity.z += this.zAccelerationAmmount;
    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;
    this.applyGravity(ground);
  }
  updateSides() {
    this.top = this.position.y + this.height / 2;
    this.bottom = this.position.y - this.height / 2;
    this.left = this.position.x - this.width / 2;
    this.right = this.position.x + this.width / 2;
    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }
  applyGravity(ground) {
    this.velocity.y += this.gravity;
    if (boxCollision({ box1: this, box2: ground })) {
      const friction = 0.5;
      this.velocity.y *= friction;
      this.velocity.y = -this.velocity.y;
    } else this.position.y += this.velocity.y;
  }
}
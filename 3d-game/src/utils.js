import * as THREE from "three";
import { Box } from "./classes/Box";

export function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
  const zCollision = box1.front >= box2.back && box1.back <= box2.front;
  return xCollision && yCollision && zCollision;
}

export function initiateShadows(object) {
  object.castShadow = true;
  object.receiveShadow = true;
}

export function generateBuildings(ground, scene) {
  const buildings = [];
  const groundLength = ground.depth;
  const groundWidth = ground.width;
  const groundPosition = ground.position;
  function generateSideBuildings(isRightSide) {
    let currentZ = groundLength / 2;
    while (currentZ > -groundLength / 2) {
      const color = `hsl(0, 0%, ${Math.random() * 20 + 60}%)`;
      const buildingHeight = Math.random() * 10 + 10;
      const buildingWidth = Math.random() * (groundWidth * 0.15) + 1;
      const buildingDepth = Math.random() * 2 + 2;
      const positionX = isRightSide
        ? groundPosition.x + groundWidth / 2
        : groundPosition.x - groundWidth / 2;
      const buildingPosition = {
        x: positionX,
        y: groundPosition.y + buildingHeight / 2,
        z: groundPosition.z + currentZ - buildingDepth / 2,
      };
      const building = new Box({
        width: buildingWidth,
        height: buildingHeight,
        depth: buildingDepth,
        position: buildingPosition,
        color,
      });
      buildings.push(building);
      scene.add(building);
      currentZ -= buildingDepth;
    }
  }
  function generateFrontBackBuildings(isBackSide) {
    let currentX = -groundWidth / 2;
    while (currentX < groundWidth / 2) {
      const color = `hsl(0, 0%, ${Math.random() * 20 + 60}%)`;
      const buildingHeight = Math.random() * 10 + 10;
      const buildingDepth = Math.random() * (groundWidth * 0.15) + 1;
      const buildingWidth = Math.random() * 2 + 2;
      const positionZ = isBackSide
        ? groundPosition.z - groundLength / 2
        : groundPosition.z + groundLength / 2;
      const buildingPosition = {
        x: groundPosition.x + currentX + buildingWidth / 2,
        y: groundPosition.y + buildingHeight / 2,
        z: positionZ,
      };
      const building = new Box({
        width: buildingWidth,
        height: buildingHeight,
        depth: buildingDepth,
        position: buildingPosition,
        color,
      });
      buildings.push(building);
      scene.add(building);
      currentX += buildingWidth;
    }
  }
  generateSideBuildings(true);
  generateSideBuildings(false);
  generateFrontBackBuildings(true);
  generateFrontBackBuildings(false);
  return buildings;
}
/* 
  TO DO:
  - Add score depending on interval
  - Add icon
  - Add music
*/

import * as THREE from "three";
import { Box } from "./classes/Box.js";
import { Player } from "./classes/Player.js";
import { RGBELoader } from "./RGBELoader.js";
import { InputHandler } from "./classes/InputHandler.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { boxCollision, initiateShadows, generateBuildings } from "./utils.js";

const stats = document.getElementById("stats");
const scoreEl = document.getElementById("score");
const distanceEl = document.getElementById("distance");
const finalTime = document.getElementById("finalTime");
const finalScore = document.getElementById("finalScore");
const startGameEl = document.getElementById("startGameEl");
const startGameBtn = document.getElementById("startGameBtn");
const restartGameEl = document.getElementById("restartGameEl");
const finalDistance = document.getElementById("finalDistance");
const restartGameBtn = document.getElementById("restartGameBtn");
const timeEl = document.getElementById("time");

const scene = new THREE.Scene();
new RGBELoader().load("/Sky.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});
scene.fog = new THREE.FogExp2(0xbbbbbb, 0.05);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const gameStats = {
  speed: 0.03,
  maxSpeed: 0.05,
  minSpeed: 0.01,
  idleSpeed: 0.03,
};

const player = new Player(scene, gameStats);
new GLTFLoader().load("/Player/scene.gltf", function (gltf) {
  player.setModel(gltf.scene);
});

let roadTextureOffset = 0;
let roadTextureSpeed = gameStats.speed;
const textureLoader = new THREE.TextureLoader();
const roadDiffuseMap = textureLoader.load(
  "/Textures/asphalt_02_diff_1k.jpg",
  (texture) => {
    texture.repeat.set(ground.width / 10, ground.depth / 10);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }
);
const roadNormalMap = textureLoader.load(
  "/Textures/asphalt_02_nor_gl_1k.jpg",
  (texture) => {
    texture.repeat.set(ground.width / 10, ground.depth / 10);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }
);
const roadRoughnessMap = textureLoader.load(
  "/Textures/asphalt_02_rough_1k.jpg",
  (texture) => {
    texture.repeat.set(ground.width / 10, ground.depth / 10);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }
);
const ground = new Box({
  width: 50,
  height: 0.5,
  depth: 100,
  color: 0x369a1,
  position: { x: 0, y: -2, z: 0 },
  map: roadDiffuseMap,
  normalMap: roadNormalMap,
  roughnessMap: roadRoughnessMap,
});
initiateShadows(ground);
scene.add(ground);
generateBuildings(ground, scene);

const light = new THREE.DirectionalLight(0x000000, 2);
light.position.y = 3;
light.position.z = 1;
light.castShadow = true;
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const boxNormalTexture = textureLoader.load(
  "/Textures/Crate/Wood_Crate_001_normal.jpg"
);
const boxHeightTexture = textureLoader.load(
  "/Textures/Crate/Wood_Crate_001_height.png"
);
const boxBaseColorTexture = textureLoader.load(
  "/Textures/Crate/Wood_Crate_001_basecolor.jpg"
);
const boxRoughnessTexture = textureLoader.load(
  "/Textures/Crate/Wood_Crate_001_roughness.jpg"
);
const boxAoTexture = textureLoader.load(
  "/Textures/Crate/Wood_Crate_001_ambientOcclusion.jpg"
);
function spawnEnemies(frames) {
  if (frames % spawnRate === 0) {
    if (spawnRate > 20) spawnRate -= 20;
    for (let i = 0; i < 2; i++) {
      const randomSpeed =
        Math.random() * (gameStats.maxSpeed - gameStats.minSpeed) +
        gameStats.minSpeed;
      const randomAcceleration = Math.random() * 0.005 + 0.001;
      const size = Math.random() * 1 + 1;
      const enemy = new Box({
        width: size,
        height: size,
        depth: size,
        velocity: { x: 0, y: 0, z: randomSpeed },
        position: {
          x: Math.random() * 40 - 20,
          y: 0,
          z: Math.random() * -10 - 40,
        },
        zAcceleration: true,
        zAccelerationAmmount: randomAcceleration,
        map: boxBaseColorTexture,
        normalMap: boxNormalTexture,
        roughnessMap: boxRoughnessTexture,
        aoMap: boxAoTexture,
        displacementMap: boxHeightTexture,
        displacementScale: 0.1,
      });
      enemy.castShadow = true;
      enemy.receiveShadow = true;
      scene.add(enemy);
      enemies.push(enemy);
    }
  }
}

function setCamera() {
  camera.position.set(
    -player.model.position.x,
    -player.model.position.y + 1,
    -player.model.position.z + 5
  );
  camera.lookAt(player.model.position);
}

function moveRoad() {
  roadTextureSpeed = gameStats.speed;
  roadDiffuseMap.offset.set(0, roadTextureOffset);
  roadNormalMap.offset.set(0, roadTextureOffset);
  roadTextureOffset += roadTextureSpeed;
  if (roadTextureOffset >= 1) roadTextureOffset = 0;
}

function updateStats(deltaTime) {
  if (timeToScoreIncrement >= scoreInterval) {
    score++;
    timeToScoreIncrement = 0;
  } else timeToScoreIncrement += deltaTime;
  if (timeToDistanceIncrement >= distanceInterval) {
    distance++;
    timeToDistanceIncrement = 0;
  } else timeToDistanceIncrement += deltaTime;
  time = Math.floor(clock.getElapsedTime());
  timeEl.innerHTML = time;
  scoreEl.innerHTML = score;
  distanceEl.innerHTML = distance;
}

const backgroundMusic = new Audio("/Audio/background.mp3");
backgroundMusic.loop = true;

function init() {
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
  gameOver = false;
  for (let i = 0; i < enemies.length; i++) scene.remove(enemies[i]);
  enemies = [];
  player.reset();
  spawnRate = 200;
  roadTextureOffset = 0;
  time = 0;
  score = 0;
  distance = 0;
  clock = new THREE.Clock();
  animate(0);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let enemies = [];
const inputHandler = new InputHandler(
  camera,
  { startGameBtn, startGameEl, restartGameEl, restartGameBtn, stats },
  init
);
let time = 0;
let score = 0;
const scoreInterval = 150;
let timeToScoreIncrement = 0;
let distance = 0;
const distanceInterval = 75;
let timeToDistanceIncrement = 0;
let clock = new THREE.Clock();

const fps = 60;
let frames = 0;
let lastTime = 0;
let spawnRate = 200;
let gameOver = false;
let timeToNewFrame = 0;
const frameInterval = 1000 / fps;
function animate(timestamp) {
  if (!gameOver) window.requestAnimationFrame(animate);
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNewFrame += deltaTime;
  if (timeToNewFrame >= frameInterval) {
    moveRoad();
    renderer.render(scene, camera);
    player.update(inputHandler.keys);
    enemies.forEach((enemy, enemyIndex) => {
      enemy.update(ground, inputHandler.keys);
      if (boxCollision({ box1: player.hitBox, box2: enemy })) {
        gameOver = true;
        stats.style.display = "none";
        restartGameEl.style.display = "block";
        finalTime.innerHTML = time;
        finalScore.innerHTML = score;
        finalDistance.innerHTML = distance;
        backgroundMusic.pause();
      } else if (enemy.position.y < ground.position.y - ground.height) {
        scene.remove(enemy);
        enemies.splice(enemyIndex, 1);
      }
    });
    setCamera();
    timeToNewFrame = 0;
  }
  frames++;
  spawnEnemies(frames);
  updateStats(deltaTime);
}
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe5ff);
scene.fog = new THREE.Fog(0xcfe5ff, 60, 250);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 600);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const hud = document.getElementById('hud');
const msgEl = document.getElementById('msg');

const hemi = new THREE.HemisphereLight(0xeaf3ff, 0x735c3a, 1.2);
scene.add(hemi);

const dirLight = new THREE.DirectionalLight(0xfff0cf, 1.1);
dirLight.position.set(60, 100, 30);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -120;
dirLight.shadow.camera.right = 120;
dirLight.shadow.camera.top = 120;
dirLight.shadow.camera.bottom = -120;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 220;
scene.add(dirLight);

const terrain = new THREE.Mesh(
  new THREE.PlaneGeometry(420, 420),
  new THREE.MeshStandardMaterial({ color: 0x77a657, roughness: 1 })
);
terrain.rotation.x = -Math.PI / 2;
terrain.receiveShadow = true;
scene.add(terrain);

const road = new THREE.Mesh(
  new THREE.BoxGeometry(220, 0.25, 44),
  new THREE.MeshStandardMaterial({ color: 0x7c6a58, roughness: 0.95 })
);
road.position.set(0, 0.12, 0);
road.receiveShadow = true;
scene.add(road);

const crossRoad = new THREE.Mesh(
  new THREE.BoxGeometry(44, 0.25, 220),
  new THREE.MeshStandardMaterial({ color: 0x7c6a58, roughness: 0.95 })
);
crossRoad.position.set(0, 0.12, 0);
crossRoad.receiveShadow = true;
scene.add(crossRoad);

const pathMat = new THREE.MeshStandardMaterial({ color: 0x8d7d62, roughness: 0.95 });
const shrineMat = new THREE.MeshStandardMaterial({ color: 0x8d5b2d, roughness: 0.8 });
const roofMat = new THREE.MeshStandardMaterial({ color: 0xba3b2f, roughness: 0.8 });

const colliders = [];

function addBuilding({ x, z, w, d, h, color = 0xdcc6a2, roofColor = 0xb53a2f }) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05 })
  );
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(w, d) * 0.8, 7, 4),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.8 })
  );
  roof.position.y = h + 3.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  for (let i = -1; i <= 1; i += 2) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, h * 0.9, d * 0.2),
      new THREE.MeshStandardMaterial({ color: 0x7f5637, roughness: 0.9 })
    );
    beam.position.set(i * (w * 0.24), h * 0.45, 0);
    beam.castShadow = true;
    group.add(beam);
  }

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.22, h * 0.48, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x4c2f1d, roughness: 0.9 })
  );
  door.position.set(0, h * 0.24, d / 2 + 0.32);
  group.add(door);

  for (let ix = -1; ix <= 1; ix += 2) {
    const windowMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.2, h * 0.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xa7d9ff, emissive: 0x1a3246, emissiveIntensity: 0.18 })
    );
    windowMesh.position.set(ix * (w * 0.22), h * 0.5, d / 2 + 0.3);
    group.add(windowMesh);
  }

  group.position.set(x, 0, z);
  scene.add(group);

  colliders.push({ x, z, w, d, h: h + 7 });
}

function addLantern(x, z) {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x5a4335, roughness: 0.8 })
  );
  pole.position.y = 1.5;
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffd194, emissive: 0xffb15a, emissiveIntensity: 0.7 })
  );
  lamp.position.y = 3.2;
  group.add(pole, lamp);
  group.position.set(x, 0, z);
  scene.add(group);
}

const buildingLayout = [
  { x: -58, z: -35, w: 18, d: 16, h: 18 },
  { x: 58, z: -35, w: 16, d: 14, h: 16 },
  { x: -90, z: 32, w: 18, d: 18, h: 18 },
  { x: 90, z: 32, w: 18, d: 18, h: 18 },
  { x: -150, z: 0, w: 18, d: 18, h: 20 },
  { x: 150, z: 0, w: 18, d: 18, h: 20 },
  { x: -110, z: -90, w: 30, d: 18, h: 20 },
  { x: 110, z: -90, w: 30, d: 18, h: 20 },
  { x: -110, z: 90, w: 30, d: 18, h: 20 },
  { x: 110, z: 90, w: 30, d: 18, h: 20 }
];

for (const cfg of buildingLayout) {
  addBuilding(cfg);
}

for (const x of [-110, -60, 60, 110]) {
  for (const z of [-90, 90]) {
    addLantern(x, z);
  }
}

for (let i = -3; i <= 3; i++) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.38, 3.2, 10),
    new THREE.MeshStandardMaterial({ color: 0x765335, roughness: 0.9 })
  );
  trunk.position.y = 1.6;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x3d7640, roughness: 1 })
  );
  leaves.position.y = 4.1;
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  tree.add(leaves);

  tree.position.set(i * 28, 0, -55);
  scene.add(tree);
}

const shrine = new THREE.Group();
const shrineBase = new THREE.Mesh(
  new THREE.CylinderGeometry(5, 5, 1.6, 24),
  shrineMat
);
shrineBase.position.y = 0.8;
shrine.add(shrineBase);

const shrineRoof = new THREE.Mesh(
  new THREE.ConeGeometry(6, 3.2, 4),
  roofMat
);
shrineRoof.position.y = 3.8;
shrineRoof.rotation.y = Math.PI / 4;
shrine.add(shrineRoof);

const shrineLantern = new THREE.Mesh(
  new THREE.CylinderGeometry(0.18, 0.18, 3, 8),
  new THREE.MeshStandardMaterial({ color: 0x5a4335, roughness: 0.8 })
);
shrineLantern.position.set(0, 1.5, 0);
shrine.add(shrineLantern);
shrine.position.set(0, 0, 120);
scene.add(shrine);

function createPlayer() {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf0cfb0, roughness: 0.9 });
  const outfitMat = new THREE.MeshStandardMaterial({ color: 0x2d3d7a, roughness: 0.9 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1d1b1a, roughness: 0.9 });
  const sandalMat = new THREE.MeshStandardMaterial({ color: 0x7a4127, roughness: 0.9 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.42), outfitMat);
  torso.position.y = 1.7;
  torso.castShadow = true;
  group.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.2, 10), skinMat);
  neck.position.y = 2.55;
  group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), skinMat);
  head.position.y = 3.15;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20, 0,Math.PI * 2, 0, Math.PI * 0.9), hairMat);
  hair.position.set(0, 3.36, -0.04);
  hair.scale.set(1.1, 0.95, 1.08);
  group.add(hair);

  const eyeGeo = new THREE.SphereGeometry(0.05, 10, 10);
  const leftEye = new THREE.Mesh(eyeGeo, new THREE.MeshStandardMaterial({ color: 0x1b1b1b }));
  leftEye.position.set(-0.12, 3.18, 0.31);
  const rightEye = leftEye.clone();
  rightEye.position.x = 0.12;
  group.add(leftEye, rightEye);

  const leftArm = new THREE.Group();
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.0, 0.22), outfitMat);
  leftArmMesh.position.y = -0.6;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  leftArm.position.set(-0.65, 2.2, 0);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  const rightArmMesh = leftArmMesh.clone();
  rightArm.add(rightArmMesh);
  rightArm.position.set(0.65, 2.2, 0);
  group.add(rightArm);

  const leftLeg = new THREE.Group();
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 0.32), outfitMat);
  leftLegMesh.position.y = -0.7;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);
  const leftSandal = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.5), sandalMat);
  leftSandal.position.set(0, -1.18, 0.12);
  leftLeg.add(leftSandal);
  leftLeg.position.set(-0.22, 0.95, 0);
  group.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.22;
  group.add(rightLeg);

  group.position.set(0, 0.9, 30);
  scene.add(group);

  return {
    root: group,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    velocityY: 0,
    onGround: true,
    stepTime: 0
  };
}

const player = createPlayer();

function getGroundHeight(x, z) {
  return 0;
}

function canMoveTo(x, z) {
  const radius = 0.9;
  for (const box of colliders) {
    const dx = Math.abs(x - box.x);
    const dz = Math.abs(z - box.z);
    if (dx < box.w / 2 + radius && dz < box.d / 2 + radius) {
      return false;
    }
  }
  return true;
}

const pointer = { yaw: 0, pitch: 0.55 };
const keys = {};

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

msgEl.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
  msgEl.style.display = 'none';
});

window.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === renderer.domElement) {
    pointer.yaw -= event.movementX * 0.0023;
    pointer.pitch -= event.movementY * 0.0018;
    pointer.pitch = THREE.MathUtils.clamp(pointer.pitch, -1.0, 1.1);
  }
});

const cameraTarget = new THREE.Vector3();
const playerVelocity = new THREE.Vector3();

let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  const moveVec = new THREE.Vector3();
  if (keys.KeyW) moveVec.z -= 1;
  if (keys.KeyS) moveVec.z += 1;
  if (keys.KeyA) moveVec.x -= 1;
  if (keys.KeyD) moveVec.x += 1;

  const forward = new THREE.Vector3(Math.sin(pointer.yaw), 0, Math.cos(pointer.yaw));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);

  if (moveVec.lengthSq() > 0) {
    moveVec.normalize();
    const dir = new THREE.Vector3();
    dir.addScaledVector(forward, moveVec.z);
    dir.addScaledVector(right, moveVec.x);
    dir.y = 0;
    if (dir.lengthSq() > 0) {
      dir.normalize();
      const speed = keys.Shift ? 9.5 : 5.5;
      const nextX = player.root.position.x + dir.x * speed * dt;
      const nextZ = player.root.position.z + dir.z * speed * dt;
      if (canMoveTo(nextX, nextZ)) {
        player.root.position.x = nextX;
        player.root.position.z = nextZ;
      }
      player.stepTime += dt * speed * 0.8;
      const swing = Math.sin(player.stepTime * 7.5) * 0.85;
      player.leftArm.rotation.x = swing;
      player.rightArm.rotation.x = -swing;
      player.leftLeg.rotation.x = -swing * 0.8;
      player.rightLeg.rotation.x = swing * 0.8;
    }
  } else {
    player.leftArm.rotation.x *= 0.8;
    player.rightArm.rotation.x *= 0.8;
    player.leftLeg.rotation.x *= 0.8;
    player.rightLeg.rotation.x *= 0.8;
  }

  if (keys.Space && player.onGround) {
    player.velocityY = 8.2;
    player.onGround = false;
  }

  player.velocityY -= 18 * dt;
  player.root.position.y += player.velocityY * dt;

  const groundY = getGroundHeight(player.root.position.x, player.root.position.z) + 0.9;
  if (player.root.position.y <= groundY) {
    player.root.position.y = groundY;
    player.velocityY = 0;
    player.onGround = true;
  }

  const camDist = 7.5;
  const camX = player.root.position.x - Math.sin(pointer.yaw) * camDist;
  const camY = player.root.position.y + 2.7 + Math.sin(pointer.pitch) * 3.2;
  const camZ = player.root.position.z - Math.cos(pointer.yaw) * camDist;

  camera.position.set(camX, camY, camZ);
  cameraTarget.set(player.root.position.x, player.root.position.y + 1.7, player.root.position.z);
  camera.lookAt(cameraTarget);

  hud.textContent = `Pos: X:${player.root.position.x.toFixed(0)} Z:${player.root.position.z.toFixed(0)}   Speed:${player.root.position.length().toFixed(0)}`;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(animate);

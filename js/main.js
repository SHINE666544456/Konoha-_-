import * as THREE from 'three';
import { createWorld } from './world.js';

// Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xd5e6f2, 250, 1500);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 4000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Load World Elements
createWorld(scene);

// Simple Player Placeholder (Shinobi Box)
const playerGeo = new THREE.BoxGeometry(1, 2, 1);
const playerMat = new THREE.MeshStandardMaterial({ color: 0x2a3a8a });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.set(0, 1, 30);
scene.add(player);

// Input Tracking
const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Pointer Lock for Camera Look
const msg = document.getElementById('msg');
msg.addEventListener('click', () => renderer.domElement.requestPointerLock());

let yaw = 0;
window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement) {
        yaw -= e.movementX * 0.002;
    }
});

// Game Loop
let lastTime = performance.now();
function animate(time) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;

    // Basic Player Movement
    const speed = 10;
    const moveDir = new THREE.Vector3();
    if (keys['KeyW']) moveDir.z -= 1;
    if (keys['KeyS']) moveDir.z += 1;
    if (keys['KeyA']) moveDir.x -= 1;
    if (keys['KeyD']) moveDir.x += 1;
    
    moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    moveDir.normalize();
    player.position.addScaledVector(moveDir, speed * dt);

    // Camera Follow
    camera.position.set(
        player.position.x - Math.sin(yaw) * 8,
        player.position.y + 4,
        player.position.z - Math.cos(yaw) * 8
    );
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);

    renderer.render(scene, camera);
    document.getElementById('hud').textContent = `Pos: X:${player.position.x.toFixed(0)} Z:${player.position.z.toFixed(0)}`;
}

requestAnimationFrame(animate);

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

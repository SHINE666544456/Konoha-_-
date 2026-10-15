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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
// make canvas focusable for pointer lock
renderer.domElement.tabIndex = 0;

// Load World Elements (receive colliders for simple collision checks)
const worldRes = createWorld(scene) || {};
const colliders = worldRes.colliders || [];

// Better Humanoid Placeholder (simple assembled geometry with limbs)
function createHumanoid() {
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

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.9), hairMat);
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

const player = createHumanoid();

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

// Input Tracking
const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Pointer Lock and overlay handling with fallback
const msgEl = document.getElementById('msg');
let pointerLockFallbackTimer = null;
let mouseLookFallbackEnabled = false;
let isMouseDownForFallback = false;

function enableMouseLookFallback() {
    if (mouseLookFallbackEnabled) return;
    mouseLookFallbackEnabled = true;
    // allow click-and-drag to look around when pointer lock is unavailable
    window.addEventListener('mousedown', () => { isMouseDownForFallback = true; });
    window.addEventListener('mouseup', () => { isMouseDownForFallback = false; });
    window.addEventListener('mousemove', (e) => {
        if (mouseLookFallbackEnabled && isMouseDownForFallback && document.pointerLockElement !== renderer.domElement) {
            yaw -= e.movementX * 0.0023;
            pitch -= e.movementY * 0.0018;
            pitch = THREE.MathUtils.clamp(pitch, -1.0, 1.1);
        }
    });
    // show a subtle hint in HUD
    const hud = document.getElementById('hud');
    if (hud) hud.textContent = (hud.textContent || '') + '  (Drag to look)';
}

if (msgEl) {
    msgEl.addEventListener('click', () => {
        try { renderer.domElement.focus(); } catch (e) {}
        // attempt pointer lock
        if (renderer.domElement.requestPointerLock) renderer.domElement.requestPointerLock();
        // fallback: if pointer lock doesn't activate quickly, hide overlay and enable mouse-look fallback
        if (pointerLockFallbackTimer) clearTimeout(pointerLockFallbackTimer);
        pointerLockFallbackTimer = setTimeout(() => {
            if (document.pointerLockElement !== renderer.domElement) {
                if (msgEl) msgEl.style.display = 'none';
                enableMouseLookFallback();
            }
        }, 600);
    });
}

// Hide overlay only after pointer lock starts; cancel fallback when pointerlockchange occurs
document.addEventListener('pointerlockchange', () => {
    try {
        if (pointerLockFallbackTimer) { clearTimeout(pointerLockFallbackTimer); pointerLockFallbackTimer = null; }
        if (document.pointerLockElement === renderer.domElement) {
            if (msgEl) msgEl.style.display = 'none';
        } else {
            if (msgEl) msgEl.style.display = 'flex';
        }
    } catch (err) { console.error('pointerlockchange handler error', err); }
});

document.addEventListener('pointerlockerror', (e) => {
    console.error('PointerLock error', e);
    if (pointerLockFallbackTimer) { clearTimeout(pointerLockFallbackTimer); pointerLockFallbackTimer = null; }
    if (msgEl) msgEl.style.display = 'none';
    enableMouseLookFallback();
});

// Pointer look handling
let yaw = 0;
let pitch = 0.55;
window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement) {
        yaw -= e.movementX * 0.0023;
        pitch -= e.movementY * 0.0018;
        pitch = THREE.MathUtils.clamp(pitch, -1.0, 1.1);
    }
});

// Game Loop
let lastTime = performance.now();
function animate(time) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;

    // Movement
    const moveDir = new THREE.Vector3();
    if (keys['KeyW']) moveDir.z -= 1;
    if (keys['KeyS']) moveDir.z += 1;
    if (keys['KeyA']) moveDir.x -= 1;
    if (keys['KeyD']) moveDir.x += 1;

    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        const dir = new THREE.Vector3();
        dir.addScaledVector(forward, moveDir.z);
        dir.addScaledVector(right, moveDir.x);
        dir.y = 0;
        if (dir.lengthSq() > 0) {
            dir.normalize();
            const speed = keys['ShiftLeft'] || keys['ShiftRight'] || keys['Shift'] ? 9.5 : 5.5;
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

    // Jump
    if ((keys['Space'] || keys['Spacebar']) && player.onGround) {
        player.velocityY = 8.2;
        player.onGround = false;
    }

    // Gravity
    player.velocityY -= 18 * dt;
    player.root.position.y += player.velocityY * dt;

    const groundY = getGroundHeight(player.root.position.x, player.root.position.z) + 0.9;
    if (player.root.position.y <= groundY) {
        player.root.position.y = groundY;
        player.velocityY = 0;
        player.onGround = true;
    }

    // Camera Follow
    const camDist = 7.5;
    const camX = player.root.position.x - Math.sin(yaw) * camDist;
    const camY = player.root.position.y + 2.7 + Math.sin(pitch) * 3.2;
    const camZ = player.root.position.z - Math.cos(yaw) * camDist;

    camera.position.set(camX, camY, camZ);
    camera.lookAt(player.root.position.x, player.root.position.y + 1.7, player.root.position.z);

    // HUD
    const hud = document.getElementById('hud');
    if (hud) hud.textContent = `Pos: X:${player.root.position.x.toFixed(0)} Z:${player.root.position.z.toFixed(0)}`;

    renderer.render(scene, camera);
}

requestAnimationFrame(animate);

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

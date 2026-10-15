import * as THREE from 'three';

export function createWorld(scene) {
    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xeaf3ff, 0x7a6a4a, 0.95);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xfff0d0, 0.9);
    sun.position.set(300, 400, 200);
    sun.castShadow = true;
    scene.add(sun);

    // Ground Plane (Konoha Base)
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x5fa043 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Simple test building (Placeholder for Konoha architecture)
    const bldGeo = new THREE.BoxGeometry(20, 30, 20);
    const bldMat = new THREE.MeshStandardMaterial({ color: 0xdc5539 });
    const building = new THREE.Mesh(bldGeo, bldMat);
    building.position.set(0, 15, -50);
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);
}

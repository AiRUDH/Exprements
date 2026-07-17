/**
 * Scene 4 — Expanding Orbital Rings / IIT Jodhpur
 * Instanced crystalline ring system; camera pulls back to scale.
 */
import * as THREE from 'three';

export function createScene4(renderer, camera) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010208, 0.004);
  const group = new THREE.Group();
  scene.add(group);

  const p = new Float32Array(3200 * 3);
  for (let i = 0; i < p.length; i++) p[i] = (Math.random() - 0.5) * 900;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xddeeff, size: 0.26, sizeAttenuation: true })));

  const sunLight = new THREE.DirectionalLight(0xfff5e0, 3.2);
  sunLight.position.set(80, 40, 20);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x080e1a, 1));

  const flareMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.MeshBasicMaterial({
      color: 0xfff5e0, transparent: true, opacity: 0.65,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  flareMesh.position.set(80, 40, 20);
  group.add(flareMesh);

  for (let i = 0; i < 3; i++) {
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(14 + i * 8, 14 + i * 8),
      new THREE.MeshBasicMaterial({
        color: 0xfff8d0, transparent: true, opacity: 0.035 - i * 0.008,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    halo.position.set(80, 40, 20);
    group.add(halo);
  }

  const RING_COUNT = 4200;
  const icoMesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.52, 0),
    new THREE.MeshStandardMaterial({
      color: 0x88ccff, emissive: 0x113355, roughness: 0.45, metalness: 0.7,
    }),
    RING_COUNT
  );
  icoMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const dummy = new THREE.Object3D();
  const ringData = [];
  for (let i = 0; i < RING_COUNT; i++) {
    const r = 30 + Math.random() * 40 + (Math.random() - 0.5) * 2;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 5;
    const scale = 0.5 + Math.random() * 1.05;
    const speed = (0.00028 + Math.random() * 0.00038) * (Math.random() < 0.5 ? 1 : -1);
    const rotX = Math.random() * Math.PI * 2;
    const rotY = Math.random() * Math.PI * 2;
    const rotZ = Math.random() * Math.PI * 2;
    ringData.push({ r, theta, y, scale, speed, rotX, rotY, rotZ });
    dummy.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
    dummy.rotation.set(rotX, rotY, rotZ);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    icoMesh.setMatrixAt(i, dummy.matrix);
  }
  icoMesh.instanceMatrix.needsUpdate = true;
  group.add(icoMesh);

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(14, 56, 56),
    new THREE.MeshStandardMaterial({ color: 0x121a2e, emissive: 0x040810, roughness: 0.9, metalness: 0.15 })
  );
  group.add(planet);

  const centralRing = new THREE.Mesh(
    new THREE.TorusGeometry(20, 0.35, 4, 100),
    new THREE.MeshBasicMaterial({
      color: 0x3ec8ff, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  centralRing.rotation.x = Math.PI * 0.5;
  group.add(centralRing);

  camera.position.set(0, 20, 80);
  camera.lookAt(0, 0, 0);
  let scrollProg = 0;

  return {
    scene,
    group,
    onProgress(p) { scrollProg = p; },
    onTick(dt, elapsed) {
      for (let i = 0; i < RING_COUNT; i++) {
        const d = ringData[i];
        d.theta += d.speed;
        dummy.position.set(
          Math.cos(d.theta) * d.r,
          d.y + 0.18 * Math.sin(elapsed * 0.5 + d.theta),
          Math.sin(d.theta) * d.r
        );
        dummy.rotation.set(d.rotX + elapsed * 0.1, d.rotY + elapsed * 0.07, d.rotZ);
        dummy.scale.setScalar(d.scale);
        dummy.updateMatrix();
        icoMesh.setMatrixAt(i, dummy.matrix);
      }
      icoMesh.instanceMatrix.needsUpdate = true;
      flareMesh.lookAt(camera.position);
      planet.rotation.y += 0.001;
      camera.position.z = THREE.MathUtils.lerp(80, 110, scrollProg);
      camera.position.y = THREE.MathUtils.lerp(20, 52, scrollProg);
      camera.position.x = Math.sin(scrollProg * Math.PI * 0.4) * 18;
      camera.lookAt(0, 0, 0);
    },
    onResize() {},
  };
}

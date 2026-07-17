/**
 * Scene 2 — Star Cluster / IIT Bombay
 * Warp streaks + six team nodes with connecting arcs.
 */
import * as THREE from 'three';

const trailVert = `
  attribute float aBrightness;
  varying float vBright;
  void main() {
    vBright = aBrightness;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const trailFrag = `
  varying float vBright;
  void main() {
    gl_FragColor = vec4(vec3(0.45 + vBright * 0.5, 0.82, 1.0), vBright * 0.38);
  }
`;

export function createScene2(renderer, camera) {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  scene.add(group);

  const bgPos = new Float32Array(2000 * 3);
  for (let i = 0; i < bgPos.length; i++) bgPos[i] = (Math.random() - 0.5) * 500;
  const bgGeo = new THREE.BufferGeometry();
  bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
  group.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.24, sizeAttenuation: true })));

  const COUNT = 2800;
  const positions = new Float32Array(COUNT * 6);
  const velocities = new Float32Array(COUNT * 3);
  const brightness = new Float32Array(COUNT * 2);
  const SPREAD = 140;

  for (let i = 0; i < COUNT; i++) {
    const vIdx = i * 6;
    const vVel = i * 3;
    const bIdx = i * 2;
    const x = (Math.random() - 0.5) * SPREAD;
    const y = (Math.random() - 0.5) * SPREAD;
    const z = (Math.random() - 0.5) * SPREAD;
    const speed = Math.random() * 0.38 + 0.1;
    positions[vIdx] = x; positions[vIdx + 1] = y; positions[vIdx + 2] = z;
    positions[vIdx + 3] = x; positions[vIdx + 4] = y; positions[vIdx + 5] = z + speed * 12;
    velocities[vVel + 2] = speed;
    const b = 0.3 + Math.random() * 0.7;
    brightness[bIdx] = b;
    brightness[bIdx + 1] = 0;
  }

  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  partGeo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));
  const particles = new THREE.LineSegments(partGeo, new THREE.ShaderMaterial({
    vertexShader: trailVert,
    fragmentShader: trailFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  group.add(particles);

  const NODE_COLORS = [0x3ec8ff, 0x6aa8ff, 0xff8a5c, 0x44d4a0, 0xffd166, 0xd48cff];
  const nodePositions = [];
  const nodeSpheres = [];

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r = 20 + Math.random() * 8;
    const pos = new THREE.Vector3(
      Math.cos(angle) * r,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 20
    );
    nodePositions.push(pos);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 16, 16),
      new THREE.MeshBasicMaterial({ color: NODE_COLORS[i] })
    );
    mesh.position.copy(pos);
    group.add(mesh);
    nodeSpheres.push(mesh);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(3.4, 8, 8),
      new THREE.MeshBasicMaterial({
        color: NODE_COLORS[i], transparent: true, opacity: 0.11,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    glow.position.copy(pos);
    group.add(glow);
  }

  const arcLines = [];
  for (let i = 0; i < 6; i++) {
    for (let j = i + 1; j < 6; j++) {
      const a = nodePositions[i];
      const b = nodePositions[j];
      const mid = new THREE.Vector3().lerpVectors(a, b, 0.5).add(new THREE.Vector3(0, 6, 0));
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x3ec8ff, transparent: true, opacity: 0.22,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)), lineMat);
      group.add(line);
      arcLines.push({ mat: lineMat });
    }
  }

  camera.position.set(0, 0, 80);
  camera.lookAt(0, 0, 0);
  let scrollProg = 0;

  return {
    scene,
    group,
    onProgress(p) { scrollProg = p; },
    onTick(dt, elapsed) {
      const pos = partGeo.attributes.position.array;
      const HALF = SPREAD * 0.5;
      for (let i = 0; i < COUNT; i++) {
        const vIdx = i * 6;
        const vVel = i * 3;
        pos[vIdx + 2] += velocities[vVel + 2];
        pos[vIdx + 5] += velocities[vVel + 2];
        if (pos[vIdx + 2] > HALF) {
          pos[vIdx + 2] -= SPREAD;
          pos[vIdx + 5] -= SPREAD;
        }
      }
      partGeo.attributes.position.needsUpdate = true;

      arcLines.forEach(({ mat }, idx) => {
        mat.opacity = 0.14 + 0.11 * Math.sin(elapsed * 2.1 + idx * 0.7);
      });
      nodeSpheres.forEach((ns, idx) => {
        ns.scale.setScalar(1 + 0.14 * Math.sin(elapsed * 2.4 + idx * 1.2));
      });

      camera.position.z = THREE.MathUtils.lerp(80, -18, scrollProg);
      camera.position.x = Math.sin(scrollProg * Math.PI) * 8;
      camera.lookAt(0, 0, 0);
    },
    getCameraShake() {
      return Math.sin(scrollProg * Math.PI) * 0.12;
    },
    onResize() {},
  };
}

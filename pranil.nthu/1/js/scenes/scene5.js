/**
 * Scene 5 — Station Assembly / IIT Dharwad return
 * Nodes lerp from scatter to assembled structure with energy lines.
 */
import * as THREE from 'three';

const lineFrag = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uProg;
  varying float vAlongLine;
  void main() {
    float wave = sin(vAlongLine * 12.0 - uTime * 4.0) * 0.5 + 0.5;
    float alpha = wave * 0.62 * uProg;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const lineVert = `
  attribute float aAlongLine;
  varying float vAlongLine;
  void main() {
    vAlongLine = aAlongLine;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nodeGlowFrag = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv - 0.5;
    float d = length(uv);
    float a = (1.0 - smoothstep(0.0, 0.5, d));
    a *= 0.7 + 0.3 * sin(uTime * 3.0);
    gl_FragColor = vec4(uColor, a);
  }
`;

const nodeGlowVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function createScene5(renderer, camera) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010408, 0.006);
  const group = new THREE.Group();
  scene.add(group);

  scene.add(new THREE.AmbientLight(0x0a1020, 1.4));
  const keyLight = new THREE.DirectionalLight(0x88bbff, 2.4);
  keyLight.position.set(30, 40, 20);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x3ec8ff, 1.1);
  rimLight.position.set(-30, -10, -20);
  scene.add(rimLight);

  const p = new Float32Array(2600 * 3);
  for (let i = 0; i < p.length; i++) p[i] = (Math.random() - 0.5) * 700;
  const bgGeo = new THREE.BufferGeometry();
  bgGeo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  group.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({ color: 0xddeeff, size: 0.28, sizeAttenuation: true })));

  const NODE_DEFS = [
    { x: 0, y: 0, z: 0, type: 'oct', scale: 2.2, color: 0x3ec8ff },
    { x: 12, y: 0, z: 0, type: 'box', scale: 1.4, color: 0x4a8cff },
    { x: -12, y: 0, z: 0, type: 'box', scale: 1.4, color: 0x4a8cff },
    { x: 0, y: 12, z: 0, type: 'box', scale: 1.4, color: 0x4a8cff },
    { x: 0, y: -12, z: 0, type: 'box', scale: 1.4, color: 0x4a8cff },
    { x: 0, y: 0, z: 12, type: 'oct', scale: 1.1, color: 0x6aa8ff },
    { x: 0, y: 0, z: -12, type: 'oct', scale: 1.1, color: 0x6aa8ff },
    { x: 22, y: 5, z: 0, type: 'oct', scale: 0.9, color: 0x00d4a0 },
    { x: -22, y: -5, z: 0, type: 'oct', scale: 0.9, color: 0x00d4a0 },
    { x: 5, y: 22, z: 0, type: 'box', scale: 0.8, color: 0x3ec8ff },
    { x: -5, y: -22, z: 0, type: 'box', scale: 0.8, color: 0x3ec8ff },
    { x: 18, y: 10, z: 8, type: 'oct', scale: 0.7, color: 0xffaa44 },
    { x: -18, y: -10, z: -8, type: 'oct', scale: 0.7, color: 0xffaa44 },
    { x: 10, y: -18, z: 8, type: 'box', scale: 0.7, color: 0xff6a8a },
    { x: -10, y: 18, z: -8, type: 'box', scale: 0.7, color: 0xff6a8a },
    { x: 28, y: 0, z: 5, type: 'ico', scale: 0.6, color: 0x88eeff },
    { x: -28, y: 0, z: -5, type: 'ico', scale: 0.6, color: 0x88eeff },
    { x: 0, y: 28, z: 5, type: 'ico', scale: 0.6, color: 0x88eeff },
    { x: 0, y: -28, z: -5, type: 'ico', scale: 0.6, color: 0x88eeff },
    { x: 5, y: 5, z: 22, type: 'oct', scale: 0.6, color: 0xa0c8ff },
    { x: -5, y: -5, z: -22, type: 'oct', scale: 0.6, color: 0xa0c8ff },
    { x: 30, y: 12, z: 0, type: 'ico', scale: 0.5, color: 0x00e0b8 },
    { x: -30, y: -12, z: 0, type: 'ico', scale: 0.5, color: 0x00e0b8 },
    { x: 12, y: 30, z: 0, type: 'ico', scale: 0.5, color: 0x00e0b8 },
    { x: -12, y: -30, z: 0, type: 'ico', scale: 0.5, color: 0x00e0b8 },
    { x: 0, y: 8, z: 30, type: 'oct', scale: 0.5, color: 0x6a9cff },
    { x: 0, y: -8, z: -30, type: 'oct', scale: 0.5, color: 0x6a9cff },
    { x: 20, y: -8, z: 18, type: 'box', scale: 0.5, color: 0xaaffee },
  ];

  const GEO_MAP = {
    oct: new THREE.OctahedronGeometry(1, 0),
    box: new THREE.BoxGeometry(1.6, 1.6, 1.6),
    ico: new THREE.IcosahedronGeometry(1, 0),
  };

  const nodes = [];
  const nodeMeshes = [];

  NODE_DEFS.forEach((def) => {
    const mat = new THREE.MeshStandardMaterial({
      color: def.color,
      emissive: def.color,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.8,
    });
    const mesh = new THREE.Mesh(GEO_MAP[def.type], mat);
    const targetPos = new THREE.Vector3(def.x, def.y, def.z);
    const startPos = new THREE.Vector3(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
    mesh.position.copy(startPos);
    mesh.scale.setScalar(def.scale);
    group.add(mesh);

    const glowMat = new THREE.ShaderMaterial({
      vertexShader: nodeGlowVert,
      fragmentShader: nodeGlowFrag,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(def.color) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glowSize = def.scale * 4;
    const glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(glowSize, glowSize), glowMat);
    group.add(glowMesh);

    nodes.push({ mesh, glowMesh, glowMat, startPos, targetPos });
    nodeMeshes.push(mesh);
  });

  const CONNECTIONS = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
    [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12],
    [1, 11], [2, 12], [3, 13], [4, 14], [7, 15], [8, 16],
    [9, 17], [10, 18], [5, 19], [6, 20], [11, 21], [12, 22],
    [13, 23], [14, 24], [15, 25], [16, 26], [0, 27],
  ].filter(([a, b]) => a < NODE_DEFS.length && b < NODE_DEFS.length);

  const LINE_COLORS = [0x3ec8ff, 0x6aa8ff, 0x00d4a0, 0xffaa44];
  const energyLines = CONNECTIONS.map(([ai, bi], idx) => {
    const segments = 18;
    const positions = new Float32Array((segments + 1) * 3);
    const alongLine = new Float32Array(segments + 1);
    for (let k = 0; k <= segments; k++) alongLine[k] = k / segments;
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeo.setAttribute('aAlongLine', new THREE.BufferAttribute(alongLine, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: lineVert,
      fragmentShader: lineFrag,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(LINE_COLORS[idx % LINE_COLORS.length]) },
        uProg: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(lineGeo, mat);
    group.add(line);
    return { geo: lineGeo, mat, ai, bi, segments };
  });

  camera.position.set(0, 20, 90);
  camera.lookAt(0, 0, 0);
  let scrollProg = 0;

  return {
    scene,
    group,
    onProgress(p) { scrollProg = p; },
    onTick(dt, elapsed) {
      const assemble = Math.min(scrollProg * 1.75, 1.0);
      nodes.forEach((n, i) => {
        const delay = i / NODE_DEFS.length * 0.4;
        const frac = THREE.MathUtils.clamp((assemble - delay) / (1 - delay), 0, 1);
        const eased = frac < 0.5 ? 2 * frac * frac : -1 + (4 - 2 * frac) * frac;
        n.mesh.position.lerpVectors(n.startPos, n.targetPos, eased);
        n.mesh.rotation.y = elapsed * 0.35 + i * 0.5;
        n.mesh.material.emissiveIntensity = 0.2 + 0.4 * eased;
        n.glowMesh.position.copy(n.mesh.position);
        n.glowMesh.lookAt(camera.position);
        n.glowMat.uniforms.uTime.value = elapsed;
      });

      energyLines.forEach(({ geo, mat, ai, bi, segments }) => {
        const posArr = geo.attributes.position.array;
        const a = nodeMeshes[ai].position;
        const b = nodeMeshes[bi].position;
        for (let k = 0; k <= segments; k++) {
          const t = k / segments;
          posArr[k * 3] = a.x + (b.x - a.x) * t;
          posArr[k * 3 + 1] = a.y + (b.y - a.y) * t + Math.sin(t * Math.PI) * 2;
          posArr[k * 3 + 2] = a.z + (b.z - a.z) * t;
        }
        geo.attributes.position.needsUpdate = true;
        mat.uniforms.uTime.value = elapsed;
        mat.uniforms.uProg.value = Math.min(scrollProg * 2.4, 1.0);
      });

      const camAngle = elapsed * 0.07 + scrollProg * Math.PI;
      camera.position.x = Math.sin(camAngle) * 80;
      camera.position.z = Math.cos(camAngle) * 80;
      camera.position.y = 20 - scrollProg * 8;
      camera.lookAt(0, 0, 0);
    },
    onResize() {},
  };
}

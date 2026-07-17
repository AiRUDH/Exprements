/**
 * Scene 6 — Pulsar Beam / Chang Lab · NTHU
 * On-axis gamma beam intensifies; camera locks into the pitch.
 */
import * as THREE from 'three';

const pulsarVert = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const pulsarFrag = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  void main() {
    vec2 uv = vUv + vec2(uTime * 1.7, 0.0);
    float band = pow(abs(sin(uv.x * 25.0 + noise(uv * 6.0) * 2.0)), 3.0);
    vec3 cold = vec3(0.05, 0.1, 0.48);
    vec3 hot = vec3(0.92, 0.96, 1.0);
    vec3 col = mix(cold, hot, band);
    vec3 viewDir = normalize(cameraPosition - vPos);
    float rim = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 2.0);
    col += rim * vec3(0.22, 0.65, 1.0) * 1.15;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const beamVert = `
  varying vec2 vUv;
  varying float vDist;
  void main() {
    vUv = uv;
    vDist = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beamFrag = `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  varying float vDist;
  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv) * 2.0;
    vec3 core = vec3(1.0);
    vec3 halo = vec3(0.32, 0.82, 1.0);
    vec3 outer = vec3(0.1, 0.32, 0.88);
    vec3 col = mix(core, halo, smoothstep(0.0, 0.35, r));
    col = mix(col, outer, smoothstep(0.3, 1.0, r));
    col *= 0.88 + 0.12 * sin(uTime * 26.0);
    float lenFade = 1.0 - smoothstep(0.0, 1.0, vDist * 0.9);
    float alpha = (1.0 - smoothstep(0.0, 1.0, r)) * lenFade * uIntensity;
    gl_FragColor = vec4(col, alpha * 0.9);
  }
`;

const bloomFrag = `
  uniform float uIntensity;
  uniform float uTime;
  void main() {
    float flicker = 0.9 + 0.1 * sin(uTime * 14.0);
    gl_FragColor = vec4(vec3(0.72, 0.9, 1.0), uIntensity * flicker * 0.5);
  }
`;

const bloomVert = `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export function createScene6(renderer, camera) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000002);
  const group = new THREE.Group();
  scene.add(group);

  const p = new Float32Array(1100 * 3);
  for (let i = 0; i < p.length; i++) p[i] = (Math.random() - 0.5) * 600;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8899cc, size: 0.18, sizeAttenuation: true })));

  const pulsarMat = new THREE.ShaderMaterial({
    vertexShader: pulsarVert,
    fragmentShader: pulsarFrag,
    uniforms: { uTime: { value: 0 } },
  });
  const pulsarMesh = new THREE.Mesh(new THREE.SphereGeometry(4, 64, 64), pulsarMat);
  pulsarMesh.position.set(0, 0, -30);
  group.add(pulsarMesh);

  for (let i = 0; i < 4; i++) {
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(4.5 + i * 1.8, 16, 16),
      new THREE.MeshBasicMaterial({
        color: i < 2 ? 0x4499ff : 0x3ec8ff,
        transparent: true,
        opacity: 0.055 - i * 0.01,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      })
    );
    glow.position.copy(pulsarMesh.position);
    group.add(glow);
  }

  const beamMats = [];
  for (let side = -1; side <= 1; side += 2) {
    for (let layer = 0; layer < 5; layer++) {
      const r = 1.5 + layer * 3.4;
      const len = side > 0 ? 210 : 55;
      const mat = new THREE.ShaderMaterial({
        vertexShader: beamVert,
        fragmentShader: beamFrag,
        uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, len, 56, 1, true), mat);
      const posOffset = side > 0 ? len / 2 : -len / 2;
      mesh.position.set(0, 0, -30 + posOffset * side);
      mesh.rotation.x = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      group.add(mesh);
      beamMats.push(mat);
    }
  }

  const bloomMat = new THREE.ShaderMaterial({
    vertexShader: bloomVert,
    fragmentShader: bloomFrag,
    uniforms: { uIntensity: { value: 0 }, uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    depthTest: false,
  });
  const bloomQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bloomMat);
  bloomQuad.renderOrder = 999;
  scene.add(bloomQuad);

  const pulseRings = [];
  for (let i = 0; i < 6; i++) {
    const rMat = new THREE.MeshBasicMaterial({
      color: 0x44aaff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 90), rMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(pulsarMesh.position);
    ring.userData.phase = (i / 6) * Math.PI * 2;
    group.add(ring);
    pulseRings.push({ mesh: ring, mat: rMat });
  }

  camera.position.set(0, 0, 80);
  camera.lookAt(0, 0, 0);
  let scrollProg = 0;

  return {
    scene,
    group,
    onProgress(p) { scrollProg = p; },
    onTick(dt, elapsed) {
      pulsarMat.uniforms.uTime.value = elapsed;
      pulsarMesh.rotation.y += 0.055;
      pulsarMesh.rotation.z += 0.012;

      const beamInt = THREE.MathUtils.clamp((scrollProg - 0.12) * 1.65, 0, 1);
      const easedInt = beamInt * beamInt;
      beamMats.forEach((mat) => {
        mat.uniforms.uTime.value = elapsed;
        mat.uniforms.uIntensity.value = easedInt;
      });
      bloomMat.uniforms.uIntensity.value = Math.pow(easedInt, 2) * 0.85;
      bloomMat.uniforms.uTime.value = elapsed;

      pulseRings.forEach(({ mesh, mat }) => {
        const t = ((elapsed * 1.15 + mesh.userData.phase / (Math.PI * 2)) % 1.0);
        mesh.scale.setScalar(4 + t * 30);
        mat.opacity = (1 - t) * 0.22 * easedInt;
      });

      camera.position.z = THREE.MathUtils.lerp(80, 12, scrollProg);
      camera.position.x = 0;
      camera.position.y = 0;
      camera.lookAt(pulsarMesh.position);
    },
    getCameraShake() {
      return Math.pow(scrollProg, 3) * 1.35;
    },
    onResize() {},
  };
}

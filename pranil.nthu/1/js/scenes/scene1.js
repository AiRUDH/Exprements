/**
 * Scene 1 — Protostar / IIT Patna
 * Nebula collapse into a glowing core; camera push-in.
 */
import * as THREE from 'three';

const starFrag = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv - 0.5;
    float dist = length(uv);
    vec3 core = mix(vec3(1.0), vec3(1.0, 0.88, 0.45), smoothstep(0.0, 0.18, dist));
    vec3 halo = mix(vec3(1.0, 0.52, 0.12), vec3(0.0), smoothstep(0.1, 0.5, dist));
    float alpha = (1.0 - smoothstep(0.0, 0.48, dist));
    alpha *= (0.85 + 0.15 * sin(uTime * 3.2));
    gl_FragColor = vec4(core + halo * 0.55, alpha);
  }
`;

const starVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function createScene1(renderer, camera) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010508, 0.012);
  const group = new THREE.Group();
  scene.add(group);

  const starCount = 2800;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 600;
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  group.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.32, sizeAttenuation: true, transparent: true, opacity: 0.9,
  })));

  const nebulaCount = 12000;
  const nebulaPos = new Float32Array(nebulaCount * 3);
  const nebulaColors = new Float32Array(nebulaCount * 3);
  for (let i = 0; i < nebulaCount; i++) {
    const r = Math.pow(Math.random(), 1.45) * 78;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    nebulaPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    nebulaPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.48;
    nebulaPos[i * 3 + 2] = r * Math.cos(phi);
    const color = new THREE.Color();
    if (r < 18) color.setHex(0x5a7dff);
    else if (r < 48) color.setHex(0x2a3a88);
    else color.setHex(0x101830);
    nebulaColors[i * 3] = color.r;
    nebulaColors[i * 3 + 1] = color.g;
    nebulaColors[i * 3 + 2] = color.b;
  }
  const nebulaGeo = new THREE.BufferGeometry();
  nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
  nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));
  const nebulaCloud = new THREE.Points(nebulaGeo, new THREE.PointsMaterial({
    size: 2.2, vertexColors: true, transparent: true, opacity: 0.14,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  }));
  group.add(nebulaCloud);

  const starMat = new THREE.ShaderMaterial({
    vertexShader: starVert,
    fragmentShader: starFrag,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const protoStar = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), starMat);
  group.add(protoStar);

  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(10 + i * 6, 11 + i * 6, 64),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xffaa44 : i === 1 ? 0x3ec8ff : 0x4a6cff,
        transparent: true,
        opacity: 0.07 - i * 0.018,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    ring.userData.index = i;
    group.add(ring);
  }

  camera.position.set(0, 0, 80);
  camera.lookAt(0, 0, 0);

  let scrollProg = 0;

  return {
    scene,
    group,
    onProgress(p) { scrollProg = p; },
    onTick(dt, elapsed) {
      starMat.uniforms.uTime.value = elapsed;
      nebulaCloud.rotation.y = elapsed * 0.045;
      nebulaCloud.rotation.z = elapsed * 0.018;
      camera.position.z = THREE.MathUtils.lerp(80, 28, scrollProg);
      camera.lookAt(0, 0, 0);
      group.children.forEach((child) => {
        if (child.userData.index !== undefined) {
          const idx = child.userData.index;
          child.material.opacity = (0.07 - idx * 0.018) * (0.7 + 0.3 * Math.sin(elapsed * 1.4 + idx));
          child.rotation.z += 0.001 * (idx + 1);
        }
      });
    },
    onResize() {},
  };
}

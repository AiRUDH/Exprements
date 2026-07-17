/**
 * Scene 3 — Neutron Star / IIT Dharwad
 * Dense core, accretion disk, orbital camera.
 */
import * as THREE from 'three';

const nsVert = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nsFrag = `
  uniform float uTime;
  uniform vec3 uLightDir;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p){
    float v=0.0,a=0.5;
    for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.0+vec2(1.7,9.2); a*=0.5; }
    return v;
  }
  void main() {
    vec2 uv = vUv + vec2(uTime * 0.35, 0.0);
    float n = fbm(uv * 8.0);
    vec3 cold = vec3(0.08, 0.18, 0.55);
    vec3 hot = vec3(0.95, 0.98, 1.0);
    vec3 col = mix(cold, hot, pow(n, 1.45));
    float diff = max(0.0, dot(vNormal, uLightDir));
    col *= (0.32 + 0.68 * diff);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float rim = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 2.4);
    col += rim * vec3(0.28, 0.62, 1.0) * 0.85;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const diskVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const diskFrag = `
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  void main() {
    float r = vUv.x;
    float theta = vUv.y;
    float n = pow(noise(vec2(r * 8.0, theta * 4.0 + uTime * (1.4 - r))), 1.15);
    vec3 inner = vec3(1.0, 0.95, 0.88);
    vec3 mid = vec3(1.0, 0.55, 0.08);
    vec3 outer = vec3(0.5, 0.06, 0.03);
    vec3 col = mix(inner, mid, smoothstep(0.0, 0.45, r));
    col = mix(col, outer, smoothstep(0.4, 1.0, r));
    col *= (0.6 + 0.4 * n);
    float a = n * (1.0 - smoothstep(0.8, 1.0, r)) * smoothstep(0.0, 0.1, r) * 0.82;
    gl_FragColor = vec4(col, a);
  }
`;

export function createScene3(renderer, camera) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000308, 0.008);
  const group = new THREE.Group();
  scene.add(group);

  const p = new Float32Array(2400 * 3);
  for (let i = 0; i < p.length; i++) p[i] = (Math.random() - 0.5) * 800;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, sizeAttenuation: true })));

  const nsMat = new THREE.ShaderMaterial({
    vertexShader: nsVert,
    fragmentShader: nsFrag,
    uniforms: {
      uTime: { value: 0 },
      uLightDir: { value: new THREE.Vector3(0.5, 0.6, 1.0).normalize() },
    },
  });
  const nsStar = new THREE.Mesh(new THREE.SphereGeometry(5, 64, 64), nsMat);
  group.add(nsStar);

  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(5.8, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x3388ff, transparent: true, opacity: 0.11,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
    })
  ));

  const lensMat = new THREE.MeshBasicMaterial({
    color: 0xaaccff, transparent: true, opacity: 0.055,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const lensRing = new THREE.Mesh(new THREE.RingGeometry(6.5, 9, 128), lensMat);
  lensRing.rotation.x = Math.PI * 0.15;
  group.add(lensRing);

  const diskMat = new THREE.ShaderMaterial({
    vertexShader: diskVert,
    fragmentShader: diskFrag,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const disk = new THREE.Mesh(new THREE.TorusGeometry(14, 5, 4, 180), diskMat);
  disk.rotation.x = Math.PI * 0.5;
  group.add(disk);

  const jetMat = new THREE.LineBasicMaterial({
    color: 0x88ccff, transparent: true, opacity: 0.32,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  for (let pole = -1; pole <= 1; pole += 2) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5 * pole, 0),
      new THREE.Vector3(1.4 * pole, 12 * pole, 0),
      new THREE.Vector3(0, 22 * pole, 0),
    ]);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)), jetMat));
  }

  camera.position.set(0, 18, 42);
  camera.lookAt(0, 0, 0);
  let scrollProg = 0;

  return {
    scene,
    group,
    onProgress(p) { scrollProg = p; },
    onTick(dt, elapsed) {
      nsMat.uniforms.uTime.value = elapsed;
      diskMat.uniforms.uTime.value = elapsed;
      nsStar.rotation.y += 0.014;
      disk.rotation.z += 0.002;
      lensMat.opacity = 0.035 + 0.035 * Math.sin(elapsed * 3.8);
      const angle = scrollProg * Math.PI * 0.55;
      const r = 42;
      camera.position.x = Math.sin(angle) * r;
      camera.position.z = Math.cos(angle) * r;
      camera.position.y = 12 + scrollProg * 8;
      camera.lookAt(0, 0, 0);
    },
    onResize() {},
  };
}

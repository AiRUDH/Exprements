import * as THREE from 'three';

export function createScene6(renderer, camera) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const group = new THREE.Group();
  scene.add(group);

  // Background stars
  const p = new Float32Array(1500 * 3);
  for (let i = 0; i < p.length; i++) p[i] = (Math.random() - 0.5) * 800;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x555555, size: 0.2, sizeAttenuation: true })));

  // Wireframe Satellite (COSI)
  const satGroup = new THREE.Group();
  
  // Create geometries
  const bodyGeo = new THREE.CylinderGeometry(2, 2, 8, 16, 4);
  const solarGeo = new THREE.BoxGeometry(16, 0.2, 4, 16, 1, 4);
  const dishGeo = new THREE.ConeGeometry(2.5, 2, 16, 4, true);
  const sensorGeo = new THREE.CylinderGeometry(1, 1, 3, 12, 2);

  const materials = []; // We will store materials to pulse them

  function addWireframePart(geometry, position, rotation) {
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ 
      color: 0xff9e00, 
      transparent: true, 
      opacity: 0.8 
    });
    const line = new THREE.LineSegments(edges, material);
    if (position) line.position.copy(position);
    if (rotation) line.rotation.set(rotation.x, rotation.y, rotation.z);
    satGroup.add(line);
    materials.push(material);
  }

  // Body
  addWireframePart(bodyGeo, new THREE.Vector3(0, 0, 0));
  
  // Solar Panels
  addWireframePart(solarGeo, new THREE.Vector3(0, 0, 0));
  
  // Dish
  addWireframePart(dishGeo, new THREE.Vector3(0, 4, 0));
  
  // Sensor below
  addWireframePart(sensorGeo, new THREE.Vector3(0, -5.5, 0));
  
  // Outer rings
  const ringGeo1 = new THREE.TorusGeometry(6, 0.1, 8, 32);
  const ringGeo2 = new THREE.TorusGeometry(8, 0.1, 8, 32);
  addWireframePart(ringGeo1, new THREE.Vector3(0,0,0), new THREE.Vector3(Math.PI/2, 0, 0));
  addWireframePart(ringGeo2, new THREE.Vector3(0,0,0), new THREE.Vector3(0, Math.PI/2, 0));

  satGroup.position.set(0, 0, -20);
  group.add(satGroup);

  camera.position.set(0, 0, 80);
  camera.lookAt(0, 0, 0);
  
  let scrollProg = 0;
  let focusLevel = 0; // 0 to 1 based on mouse proximity

  return {
    scene,
    group,
    onProgress(p) { scrollProg = p; },
    setFocus(f) { focusLevel = f; },
    onTick(dt, elapsed) {
      // Rotation logic influenced by focus
      const baseSpeed = 0.15;
      const focusSpeed = 2.0; // Significant spin increase when focused
      const speed = baseSpeed + (focusLevel * focusSpeed);
      
      satGroup.rotation.y += dt * speed;
      satGroup.rotation.x += dt * (speed * 0.2);
      satGroup.rotation.z += dt * (speed * 0.1);
      
      // Data Realism (Wireframe Pulse)
      materials.forEach(mat => {
        // Randomly pulse opacity between 40% and 100%
        if (Math.random() > 0.7) {
           mat.opacity = 0.4 + (Math.random() * 0.6) + (focusLevel * 0.3); 
        }
      });
      
      camera.position.z = THREE.MathUtils.lerp(80, 25, scrollProg);
      camera.lookAt(satGroup.position);
    },
    getCameraShake() {
      // More shake if focused
      return Math.pow(scrollProg, 3) * (0.2 + focusLevel * 0.8);
    },
    onResize() {},
  };
}

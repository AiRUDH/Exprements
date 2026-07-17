/**
 * Accretion — orchestrator
 * Three.js + GSAP ScrollTrigger · 6-scene narrative for Prof. Chang
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';

import { createScene1 } from './scenes/scene1.js';
import { createScene2 } from './scenes/scene2.js';
import { createScene3 } from './scenes/scene3.js';
import { createScene4 } from './scenes/scene4.js';
import { createScene5 } from './scenes/scene5.js';
import { createScene6 } from './scenes/scene6.js';

const SCENES = [
  {
    counter: '01 — 06',
    metaphor: 'The Protostar',
    tag: '01 / 06 · Protostar',
    title: 'Foundation & Capacity',
    subtitle: 'IIT Patna · 2024–2028',
    body: 'Building a rigorous foundation in physics, mathematics, and computational modeling—the theoretical mass required for extreme-environment research.',
    evidence: [
      'B.Tech CS · Business Development with AI',
      'Optics · Photonics · Quantum foundations',
    ],
    hud: { status: 'INITIATING BASE FRAMEWORK', metric: 'Data Vol: 0%' },
    cta: false,
    typed: false,
  },
  {
    counter: '02 — 06',
    metaphor: 'The Star Cluster',
    tag: '02 / 06 · Star Cluster',
    title: 'High-Velocity Operations',
    subtitle: 'IIT Bombay · Dec 2024',
    body: 'High-velocity collision of ideas at a national tech fest. Six-person core team operating under competitive pressure—theory stress-tested in real time.',
    evidence: [
      'Six-person technical core',
      'Rapid adaptation under live constraints',
    ],
    hud: { status: 'TEAM OPERATIONS ACTIVE', metric: 'Velocity: Max' },
    cta: false,
    typed: false,
  },
  {
    counter: '03 — 06',
    metaphor: 'The Neutron Star',
    tag: '03 / 06 · Neutron Star',
    title: 'Hardware/Software Delivery',
    subtitle: 'IIT Dharwad · 6-month deep dive',
    body: 'Dense gravitational pull into applied R&D. Moving from models to verified hardware and software outcomes that survive contact with reality.',
    evidence: [
      'Six-month intensive delivery cycle',
      'Theory → functional execution',
    ],
    hud: { status: 'APPLIED ENG: ACTIVE', metric: 'System Stress: High | Output: Verified' },
    cta: false,
    typed: false,
  },
  {
    counter: '04 — 06',
    metaphor: 'Orbital Rings',
    tag: '04 / 06 · Orbital Rings',
    title: 'Global Scaling & Markets',
    subtitle: 'IIT Jodhpur · International markets',
    body: 'Expanding orbital radius: technology transfer, global market dynamics, and the economics that fund large scientific missions.',
    evidence: [
      'International business internship lens',
      'Mission-scale collaboration economies',
    ],
    hud: { status: 'MARKET DYNAMICS: SYNCED', metric: 'Scope: International' },
    cta: false,
    typed: false,
  },
  {
    counter: '05 — 06',
    metaphor: 'Station Assembly',
    tag: '05 / 06 · Station Assembly',
    title: 'Ecosystem Architecture',
    subtitle: 'IIT Dharwad · Return loop',
    body: 'Feedback loop closed. Business architecture and engineering mass recombined to assemble a startup ecosystem—systems thinking at station scale.',
    evidence: [
      'Startup ecosystem architecture',
      'Leadership · rapid prototyping · ops',
    ],
    hud: { status: 'ECOSYSTEM SCALING', metric: 'Nodes Linked: 14,024 | Global Reach: Active' },
    cta: false,
    typed: false,
  },
  {
    counter: '06 — 06',
    metaphor: 'The Pulsar Beam',
    tag: '06 / 06 · Pulsar Beam',
    title: 'Value Delivery & Mission',
    subtitle: 'NTHU · Chang Lab',
    body: 'All gathered mass collimates here. Ready to apply optical physics, computational systems, and mission-minded engineering to GTM and COSI-class work.',
    evidence: [
      'Engineering mass assembled',
      'Focused on orbital instrumentation',
    ],
    hud: { status: 'TRAJECTORY LOCKED', metric: 'Target: NTHU_COSI | Execution Status: READY' },
    cta: true,
    typed: false,
  },
];

const canvas = document.getElementById('webgl-canvas');
const counterEl = document.getElementById('scene-counter');
const metaphorEl = document.getElementById('scene-metaphor');
const titleEl = document.getElementById('panel-title');
const subtitleEl = document.getElementById('panel-subtitle');
const bodyEl = document.getElementById('panel-body');
const evidenceEl = document.getElementById('panel-evidence');
const ctaGroup = document.getElementById('panel-cta');
const sceneTagEl = document.getElementById('current-scene-tag');
const textCard = document.getElementById('text-panel');
const hintArrow = document.getElementById('hint-arrow');
const vignette = document.getElementById('final-vignette');
const dots = document.querySelectorAll('.nav-dots .dot');
const cvSheet = document.getElementById('research-cv');
const cvClose = document.getElementById('cv-close');
const ctaCv = document.getElementById('cta-cv');
const hudStatusEl = document.getElementById('hud-status');
const hudMetricEl = document.getElementById('hud-metric');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.35; // Higher exposure for sharper contrast

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 60);

const dummyScene = new THREE.Scene();
const renderPass = new RenderPass(dummyScene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  2.5,  // strength
  0.15, // radius (tighter)
  0.85  // threshold (only brights)
);
const filmPass = new FilmPass(0.35, 0.15, 648, false); // noise, scanlines, scanlinesCount, grayscale

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(filmPass);

const clock = new THREE.Clock();

const allScenes = [
  createScene1(renderer, camera),
  createScene2(renderer, camera),
  createScene3(renderer, camera),
  createScene4(renderer, camera),
  createScene5(renderer, camera),
  createScene6(renderer, camera),
];

allScenes.forEach((s, i) => {
  s.group.visible = i === 0;
});

gsap.registerPlugin(ScrollTrigger);

let currentSceneIndex = 0;
let panelTimer = null;
let typewriterTimeouts = [];

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

window.addEventListener('mousemove', (e) => {
  // Normalize coordinates: -1 to 1 for Parallax
  targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
  targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function typeText(element, text, speed = 20) {
  element.innerHTML = '';
  element.classList.add('typing-cursor');
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      const timeout = setTimeout(type, speed + Math.random() * 15);
      typewriterTimeouts.push(timeout);
    } else {
      element.classList.remove('typing-cursor');
    }
  }
  type();
}

function clearTypewriters() {
  typewriterTimeouts.forEach(clearTimeout);
  typewriterTimeouts = [];
}

function applyPanel(idx) {
  const data = SCENES[idx];
  counterEl.textContent = data.counter;
  metaphorEl.textContent = data.metaphor;
  titleEl.textContent = data.title;
  subtitleEl.textContent = data.subtitle;
  
  if (data.hud) {
    hudStatusEl.textContent = data.hud.status;
    hudMetricEl.textContent = data.hud.metric;
  }
  
  evidenceEl.innerHTML = data.evidence.map((e) => `<li>${e}</li>`).join('');
  if (data.cta) ctaGroup.removeAttribute('hidden');
  else ctaGroup.setAttribute('hidden', '');
  hintArrow.style.opacity = idx === 0 ? '1' : '0';
  vignette.classList.toggle('is-on', idx === 5);
  
  clearTypewriters();
  bodyEl.classList.remove('typing-cursor');
  
  if (!data.typed) {
    // Run typewriter only the first time
    typeText(bodyEl, data.body);
    data.typed = true;
  } else {
    // Show instantly on subsequent scrolls
    bodyEl.textContent = data.body;
  }
}

function switchScene(idx) {
  if (idx === currentSceneIndex) return;
  currentSceneIndex = idx;

  allScenes.forEach((s, i) => {
    s.group.visible = i === idx;
  });

  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  sceneTagEl.textContent = SCENES[idx].tag;

  // "Explainer Video" GSAP Sequence
  const tl = gsap.timeline();
  
  tl.to(textCard, {
    opacity: 0,
    y: 15,
    duration: 0.25,
    ease: "power2.in",
    onComplete: () => {
      // 3D Objects animation and text reset syncs here
      applyPanel(idx);
    }
  }).to(textCard, {
    opacity: 1,
    y: 0,
    duration: 0.35,
    ease: "power2.out",
  });
}

allScenes.forEach((scene, idx) => {
  ScrollTrigger.create({
    trigger: `#sec-${idx + 1}`,
    start: 'top top',
    end: 'bottom top',
    scrub: 1.35,
    onUpdate(self) {
      if (scene.onProgress) scene.onProgress(self.progress, clock.getElapsedTime());
    },
    onEnter() { switchScene(idx); },
    onEnterBack() { switchScene(idx); },
  });
});

// Dot nav — avoid scrollIntoView (breaks embedded preview)
dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const target = parseInt(dot.dataset.target, 10);
    const el = document.getElementById(`sec-${target + 1}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

function openCv(e) {
  if (e) e.preventDefault();
  cvSheet.classList.add('is-open');
}

function closeCv() {
  cvSheet.classList.remove('is-open');
}

if (ctaCv) ctaCv.addEventListener('click', openCv);
if (cvClose) cvClose.addEventListener('click', closeCv);
cvSheet.addEventListener('click', (e) => {
  if (e.target === cvSheet) closeCv();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCv();
});

function tick() {
  requestAnimationFrame(tick);
  const dt = clock.getDelta();
  const elapsed = clock.getElapsedTime();
  const active = allScenes[currentSceneIndex];

  // Kinesthetic Control Parallax (Lerp 0.05)
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  if (active) {
    if (active.onTick) {
      active.onTick(dt, elapsed);
    }
    
    // Apply liquid smooth heavy parallax to camera
    camera.position.x = mouseX * 3.5;
    camera.position.y = mouseY * 3.5;
    camera.position.z = 60; // Keep base Z position
    
    if (active.getCameraShake && active.onTick) {
      const shake = active.getCameraShake();
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake;
    }
    
    // Slightly rotate the active scene group to enhance the physical mass feeling
    active.group.rotation.y = mouseX * 0.15;
    active.group.rotation.x = -mouseY * 0.15;
  }

  if (active) renderPass.scene = active.scene;
  composer.render();
}

tick();
applyPanel(0);

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(w, h);
  allScenes.forEach((s) => { if (s.onResize) s.onResize(w, h); });
});

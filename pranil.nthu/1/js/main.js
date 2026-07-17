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
    title: 'Academic Genesis',
    subtitle: 'IIT Patna · 2024–2028',
    body: 'Building a rigorous foundation in physics, mathematics, and computational modeling—the theoretical mass required for extreme-environment research.',
    evidence: [
      'B.Tech CS · Business Development with AI',
      'Optics · Photonics · Quantum foundations',
    ],
    cta: false,
  },
  {
    counter: '02 — 06',
    metaphor: 'The Star Cluster',
    tag: '02 / 06 · Star Cluster',
    title: 'Collaborative Dynamics',
    subtitle: 'IIT Bombay · Dec 2024',
    body: 'High-velocity collision of ideas at a national tech fest. Six-person core team operating under competitive pressure—theory stress-tested in real time.',
    evidence: [
      'Six-person technical core',
      'Rapid adaptation under live constraints',
    ],
    cta: false,
  },
  {
    counter: '03 — 06',
    metaphor: 'The Neutron Star',
    tag: '03 / 06 · Neutron Star',
    title: 'Applied Engineering',
    subtitle: 'IIT Dharwad · 6-month deep dive',
    body: 'Dense gravitational pull into applied R&D. Moving from models to verified hardware and software outcomes that survive contact with reality.',
    evidence: [
      'Six-month intensive delivery cycle',
      'Theory → functional execution',
    ],
    cta: false,
  },
  {
    counter: '04 — 06',
    metaphor: 'Orbital Rings',
    tag: '04 / 06 · Orbital Rings',
    title: 'Strategic Scope',
    subtitle: 'IIT Jodhpur · International markets',
    body: 'Expanding orbital radius: technology transfer, global market dynamics, and the economics that fund large scientific missions.',
    evidence: [
      'International business internship lens',
      'Mission-scale collaboration economies',
    ],
    cta: false,
  },
  {
    counter: '05 — 06',
    metaphor: 'Station Assembly',
    tag: '05 / 06 · Station Assembly',
    title: 'Systems Execution',
    subtitle: 'IIT Dharwad · Return loop',
    body: 'Feedback loop closed. Business architecture and engineering mass recombined to assemble a startup ecosystem—systems thinking at station scale.',
    evidence: [
      'Startup ecosystem architecture',
      'Leadership · rapid prototyping · ops',
    ],
    cta: false,
  },
  {
    counter: '06 — 06',
    metaphor: 'The Pulsar Beam',
    tag: '06 / 06 · Pulsar Beam',
    title: 'Targeted Trajectory',
    subtitle: 'NTHU · Chang Lab',
    body: 'All gathered mass collimates here. Ready to apply optical physics, computational systems, and mission-minded engineering to GTM and COSI-class work.',
    evidence: [
      'Engineering mass assembled',
      'Focused on orbital instrumentation',
    ],
    cta: true,
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

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x010508, 1);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.15;

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 60);

const dummyScene = new THREE.Scene();
const renderPass = new RenderPass(dummyScene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.85,
  0.42,
  0.82
);
const filmPass = new FilmPass(0.18, 0.0, 0, false);

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

function applyPanel(idx) {
  const data = SCENES[idx];
  counterEl.textContent = data.counter;
  metaphorEl.textContent = data.metaphor;
  titleEl.textContent = data.title;
  subtitleEl.textContent = data.subtitle;
  bodyEl.textContent = data.body;
  evidenceEl.innerHTML = data.evidence.map((e) => `<li>${e}</li>`).join('');
  if (data.cta) ctaGroup.removeAttribute('hidden');
  else ctaGroup.setAttribute('hidden', '');
  hintArrow.style.opacity = idx === 0 ? '1' : '0';
  vignette.classList.toggle('is-on', idx === 5);
}

function switchScene(idx) {
  if (idx === currentSceneIndex) return;
  currentSceneIndex = idx;

  allScenes.forEach((s, i) => {
    s.group.visible = i === idx;
  });

  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  sceneTagEl.textContent = SCENES[idx].tag;

  textCard.classList.add('is-transitioning');
  clearTimeout(panelTimer);
  panelTimer = setTimeout(() => {
    applyPanel(idx);
    textCard.classList.remove('is-transitioning');
  }, 380);
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

  if (active?.onTick) {
    active.onTick(dt, elapsed);
    if (active.getCameraShake) {
      const shake = active.getCameraShake();
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake;
    }
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

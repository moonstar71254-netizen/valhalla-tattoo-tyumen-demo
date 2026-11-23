import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const LINK_COUNT = 80;
const ORBITAL_DROP_COUNT = 8;
const ORBITAL_DISC_COUNT = 6;
const HALO_BEAD_COUNT = 12;
const PARTICLE_COUNT = 260;

const Z_REF = new THREE.Vector3(0, 0, 1);
const X_FALLBACK = new THREE.Vector3(1, 0, 0);

export const SCENE_CAMERA_PRESETS = [
  {
    cam: [0.1, 0.55, 9.8],
    look: [0.45, 0.1, 0.2],
    yShift: 8.4,
    haloPos: [1.05, 0.12, 1.45],
    haloScale: 1.02,
    haloRotY: -0.32,
    key: '#E8EEF5',
    rim: '#FFFFFF',
    fill: '#B6CBE0',
    emissive: '#18202C',
    cursorLight: '#E8EEF5',
  },
  {
    cam: [-1.1, 1.15, 6.4],
    look: [0.55, 0.05, -0.4],
    yShift: 3.8,
    haloPos: [0.65, 0.18, -1.9],
    haloScale: 1.26,
    haloRotY: 0.44,
    key: '#C49B66',
    rim: '#FFE0B2',
    fill: '#8E6230',
    emissive: '#28190B',
    cursorLight: '#E2B478',
  },
  {
    cam: [4.2, 0.35, 6.2],
    look: [0.35, -0.15, 0.5],
    yShift: -0.6,
    haloPos: [0.3, -0.55, -2.4],
    haloScale: 0.92,
    haloRotY: 1.18,
    key: '#D8A96E',
    rim: '#F5DFC2',
    fill: '#7F5932',
    emissive: '#25170C',
    cursorLight: '#E8BE82',
  },
  {
    cam: [-2.1, -1.75, 7.6],
    look: [-1.55, -0.1, 0.4],
    yShift: -5.0,
    haloPos: [2.45, 0.55, -2.2],
    haloScale: 0.82,
    haloRotY: 1.92,
    key: '#C94432',
    rim: '#FF8A78',
    fill: '#8A2116',
    emissive: '#260906',
    cursorLight: '#E55A44',
  },
  {
    cam: [-0.9, 1.65, 11.0],
    look: [0.3, 0.1, 0.0],
    yShift: -9.0,
    haloPos: [-1.35, 0.45, -2.2],
    haloScale: 0.96,
    haloRotY: 2.48,
    key: '#C8A86B',
    rim: '#C8DCF0',
    fill: '#7D96AE',
    emissive: '#1A212A',
    cursorLight: '#E5C47E',
  },
];

const DROP_FORMATIONS = [
  [
    [3.2, 2.2, 2.4, 0.96],
    [-1.4, 2.4, -1.6, 0.82],
    [3.8, -1.9, 1.4, 1.06],
    [-1.2, -2.2, 2.5, 0.76],
    [1.8, 3.1, -3.1, 0.88],
    [4.6, 0.2, -2.1, 0.98],
    [-2.8, 1.4, -3.8, 0.78],
    [0.8, -3.0, -1.3, 0.92],
  ],
  [
    [4.6, 2.9, 0.7, 1.04],
    [-2.4, 3.1, -2.5, 0.86],
    [4.9, -2.5, -0.5, 1.1],
    [-2.5, -2.6, 1.1, 0.82],
    [3.1, 3.6, -4.1, 0.92],
    [5.5, 0.4, -3.0, 1.0],
    [-3.5, 1.1, -4.5, 0.78],
    [2.5, -3.5, -2.4, 0.94],
  ],
  [
    [2.6, 2.1, 2.3, 1.0],
    [-0.4, 1.7, 3.0, 0.84],
    [-1.8, 0.1, 1.3, 0.88],
    [-0.2, -1.7, -0.9, 0.94],
    [2.8, -2.0, -1.3, 1.04],
    [4.1, -0.2, 0.5, 0.98],
    [1.2, 2.5, -2.3, 0.76],
    [1.4, -2.5, 2.1, 0.9],
  ],
  [
    [2.6, 2.1, 1.6, 0.98],
    [4.2, 0.7, 1.4, 0.92],
    [2.7, -0.9, 1.8, 1.02],
    [4.3, -2.1, 1.3, 0.88],
    [1.8, 1.7, -1.2, 0.8],
    [3.3, 0.1, -1.3, 0.86],
    [2.1, -1.7, -1.2, 0.82],
    [3.8, 1.4, -3.0, 0.76],
  ],
  [
    [-3.5, 2.8, -2.2, 0.9],
    [0.2, 3.4, -3.6, 0.8],
    [-4.0, -2.4, -1.7, 0.96],
    [-0.3, -3.2, -2.8, 0.84],
    [4.1, 3.5, -4.5, 0.86],
    [4.8, -3.1, -4.0, 0.92],
    [-2.4, 0.5, -4.9, 0.76],
    [1.9, -3.6, -4.8, 0.82],
  ],
];

const DISC_FORMATIONS = [
  [
    [-2.2, -1.4, -2.8, 0.95],
    [2.9, 1.6, -2.2, 0.82],
    [0.3, -2.6, -3.4, 0.75],
    [4.2, -1.2, -1.5, 0.9],
    [-1.1, 2.8, -3.6, 0.72],
    [2.1, 0.3, 2.8, 0.64],
  ],
  [
    [-3.1, -1.8, -3.2, 1.02],
    [3.8, 2.1, -2.4, 0.88],
    [0.6, -3.0, -3.9, 0.8],
    [4.9, -1.7, -2.1, 0.94],
    [-1.8, 3.2, -4.1, 0.78],
    [2.7, 0.9, 1.8, 0.7],
  ],
  [
    [-1.9, 1.6, 0.8, 0.96],
    [2.4, -1.5, 1.6, 0.92],
    [0.5, 2.2, -1.6, 0.84],
    [3.5, 0.8, -0.8, 0.88],
    [-0.9, -2.1, 0.4, 0.8],
    [1.6, -0.4, -2.6, 1.05],
  ],
  [
    [2.4, 1.9, 0.4, 0.96],
    [4.1, -0.4, 0.9, 0.92],
    [2.6, -1.9, 0.6, 0.88],
    [1.4, 1.1, -2.0, 0.84],
    [3.6, 1.5, -2.2, 0.82],
    [1.6, -1.5, -2.2, 0.86],
  ],
  [
    [-3.2, 1.8, -2.9, 0.94],
    [-2.6, -1.9, -2.4, 0.88],
    [0.4, 2.6, -4.2, 0.82],
    [1.1, -2.7, -3.8, 0.84],
    [3.6, 2.4, -4.8, 0.78],
    [-1.2, 0.1, -4.5, 0.96],
  ],
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createForgedMetalMaps() {
  const size = 512;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');

  const rand = mulberry32(72091);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#7c7c7c';
  rCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 150; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const radius = 10 + rand() * 28;
    const isDent = rand() > 0.35;
    const bumpShade = isDent ? 74 + Math.floor(rand() * 28) : 154 + Math.floor(rand() * 28);
    const roughShade = isDent ? 168 + Math.floor(rand() * 48) : 44 + Math.floor(rand() * 26);

    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const px = cx + ox * size;
        const py = cy + oy * size;
        if (px < -radius || px > size + radius || py < -radius || py > size + radius) continue;

        const bGrad = bCtx.createRadialGradient(px, py, 0, px, py, radius);
        bGrad.addColorStop(0, `rgba(${bumpShade},${bumpShade},${bumpShade},0.42)`);
        bGrad.addColorStop(0.7, `rgba(${bumpShade},${bumpShade},${bumpShade},0.14)`);
        bGrad.addColorStop(1, 'rgba(128,128,128,0)');
        bCtx.fillStyle = bGrad;
        bCtx.beginPath();
        bCtx.arc(px, py, radius, 0, Math.PI * 2);
        bCtx.fill();

        const rGrad = rCtx.createRadialGradient(px, py, 0, px, py, radius);
        rGrad.addColorStop(0, `rgba(${roughShade},${roughShade},${roughShade},0.48)`);
        rGrad.addColorStop(1, 'rgba(124,124,124,0)');
        rCtx.fillStyle = rGrad;
        rCtx.beginPath();
        rCtx.arc(px, py, radius, 0, Math.PI * 2);
        rCtx.fill();
      }
    }
  }

  for (let i = 0; i < 1400; i++) {
    const y = rand() * size;
    const x = rand() * size;
    const len = 24 + rand() * 140;
    const dy = (rand() - 0.5) * 4.5;
    const bright = rand() > 0.5;

    bCtx.strokeStyle = bright ? 'rgba(220,220,220,0.22)' : 'rgba(38,38,38,0.24)';
    bCtx.lineWidth = 0.5 + rand() * 0.9;
    bCtx.beginPath();
    bCtx.moveTo(x, y);
    bCtx.lineTo(x + len, y + dy);
    bCtx.stroke();
    if (x + len > size) {
      bCtx.beginPath();
      bCtx.moveTo(x - size, y);
      bCtx.lineTo(x + len - size, y + dy);
      bCtx.stroke();
    }

    rCtx.strokeStyle = bright ? 'rgba(218,218,218,0.28)' : 'rgba(30,30,30,0.32)';
    rCtx.lineWidth = 0.6 + rand() * 1.1;
    rCtx.beginPath();
    rCtx.moveTo(x, y);
    rCtx.lineTo(x + len, y + dy);
    rCtx.stroke();
    if (x + len > size) {
      rCtx.beginPath();
      rCtx.moveTo(x - size, y);
      rCtx.lineTo(x + len - size, y + dy);
      rCtx.stroke();
    }
  }

  for (let i = 0; i < 240; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const angle = (rand() - 0.5) * 0.65;
    const len = 14 + rand() * 68;
    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len;

    bCtx.strokeStyle = rand() > 0.45 ? 'rgba(24,24,24,0.44)' : 'rgba(238,238,238,0.34)';
    bCtx.lineWidth = 0.55 + rand() * 0.75;
    bCtx.beginPath();
    bCtx.moveTo(x, y);
    bCtx.lineTo(x2, y2);
    bCtx.stroke();

    rCtx.strokeStyle = 'rgba(235,235,235,0.4)';
    rCtx.lineWidth = 0.5 + rand() * 0.7;
    rCtx.beginPath();
    rCtx.moveTo(x, y);
    rCtx.lineTo(x2, y2);
    rCtx.stroke();
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 2);
  bumpMap.anisotropy = 4;
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(3, 2);
  roughnessMap.anisotropy = 4;
  roughnessMap.needsUpdate = true;

  return { bumpMap, roughnessMap };
}

function applyForgedWaveDeformation(geometry, amplitude, freqA, freqB) {
  const pos = geometry.attributes.position;
  const norm = geometry.attributes.normal;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(norm, i);
    const wave =
      Math.sin(v.x * freqA + v.y * freqB) * Math.cos(v.z * freqA - v.y * 1.7) +
      0.45 * Math.sin((v.x - v.z) * (freqB * 1.4));
    v.addScaledVector(n, wave * amplitude);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createBeveledMedallionGeometry() {
  const profile = [
    new THREE.Vector2(2.02, -0.045),
    new THREE.Vector2(2.08, -0.095),
    new THREE.Vector2(2.22, -0.105),
    new THREE.Vector2(2.33, -0.072),
    new THREE.Vector2(2.41, -0.025),
    new THREE.Vector2(2.44, 0.0),
    new THREE.Vector2(2.41, 0.025),
    new THREE.Vector2(2.33, 0.072),
    new THREE.Vector2(2.22, 0.105),
    new THREE.Vector2(2.08, 0.095),
    new THREE.Vector2(2.02, 0.045),
    new THREE.Vector2(2.0, 0.0),
    new THREE.Vector2(2.02, -0.045),
  ];
  const geo = new THREE.LatheGeometry(profile, 64);
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return applyForgedWaveDeformation(geo, 0.014, 3.2, 2.6);
}

function createHaloBeadGeometry() {
  const profile = [
    new THREE.Vector2(0.002, -0.15),
    new THREE.Vector2(0.036, -0.11),
    new THREE.Vector2(0.068, -0.04),
    new THREE.Vector2(0.078, 0.015),
    new THREE.Vector2(0.062, 0.075),
    new THREE.Vector2(0.028, 0.125),
    new THREE.Vector2(0.002, 0.15),
  ];
  const geo = new THREE.LatheGeometry(profile, 36);
  geo.computeVertexNormals();
  return geo;
}

function createSculptedDropGeometry() {
  const geo = new THREE.TorusGeometry(0.38, 0.085, 32, 64);
  geo.computeVertexNormals();
  return applyForgedWaveDeformation(geo, 0.011, 4.4, 3.6);
}

function createBeveledDiscGeometry() {
  const profile = [
    new THREE.Vector2(0.003, -0.035),
    new THREE.Vector2(0.18, -0.042),
    new THREE.Vector2(0.36, -0.068),
    new THREE.Vector2(0.46, -0.052),
    new THREE.Vector2(0.51, -0.018),
    new THREE.Vector2(0.52, 0.0),
    new THREE.Vector2(0.51, 0.018),
    new THREE.Vector2(0.46, 0.052),
    new THREE.Vector2(0.36, 0.068),
    new THREE.Vector2(0.18, 0.042),
    new THREE.Vector2(0.003, 0.035),
  ];
  const geo = new THREE.LatheGeometry(profile, 64);
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.65)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function detectSoftwareRenderer(gl) {
  try {
    const ctx = gl.getContext();
    const debugInfo = ctx.getExtension('WEBGL_debug_renderer_info');
    const unmasked = debugInfo ? ctx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    const renderer = String(unmasked || ctx.getParameter(ctx.RENDERER) || '');
    return /swiftshader|llvmpipe|software/i.test(renderer);
  } catch {
    return false;
  }
}

function BloomPostProcessing() {
  const { gl, scene, camera, size } = useThree();

  const { composer, bloomPass, renderTarget, isSoftware } = useMemo(() => {
    const software = detectSoftwareRenderer(gl);
    const rt = new THREE.WebGLRenderTarget(size.width, size.height, {
      type: THREE.HalfFloatType,
      samples: !software && gl.capabilities.isWebGL2 ? 2 : 0,
    });
    const comp = new EffectComposer(gl, rt);
    const renderPass = new RenderPass(scene, camera);
    const bloomScale = software ? 0.5 : 1;
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(
        Math.max(1, Math.floor(size.width * bloomScale)),
        Math.max(1, Math.floor(size.height * bloomScale))
      ),
      0.24,
      0.36,
      0.92
    );
    const outputPass = new OutputPass();

    comp.addPass(renderPass);
    comp.addPass(bloom);
    comp.addPass(outputPass);

    return { composer: comp, bloomPass: bloom, renderTarget: rt, isSoftware: software };
  }, [gl, scene, camera]);

  useEffect(() => {
    const dpr = isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const bloomScale = isSoftware ? 0.5 : 1;
    composer.setPixelRatio(dpr);
    composer.setSize(size.width, size.height);
    bloomPass.resolution.set(
      Math.max(1, Math.floor(size.width * bloomScale)),
      Math.max(1, Math.floor(size.height * bloomScale))
    );
  }, [composer, bloomPass, isSoftware, size.width, size.height]);

  useEffect(() => {
    return () => {
      composer.dispose();
      renderTarget.dispose();
    };
  }, [composer, renderTarget]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}

function ValhallaWorld({ sceneStateRef, pointerRef, activeScene }) {
  const chainRef = useRef(null);
  const chainMatRef = useRef(null);
  const haloGroupRef = useRef(null);
  const knotRef = useRef(null);
  const knotMatRef = useRef(null);
  const medallionRef = useRef(null);
  const innerHaloRef = useRef(null);
  const haloBeadsRef = useRef(null);
  const dropsRef = useRef(null);
  const dropsMatRef = useRef(null);
  const discsRef = useRef(null);
  const discsMatRef = useRef(null);
  const particlesRef = useRef(null);

  const keyLightRef = useRef(null);
  const rimLightRef = useRef(null);
  const fillLightRef = useRef(null);
  const cursorLightRef = useRef(null);

  const { size, camera } = useThree();
  const isMobile = size.width < 768;

  const metalMaps = useMemo(() => createForgedMetalMaps(), []);

  const geometries = useMemo(() => {
    const rawKnot = new THREE.TorusKnotGeometry(1.06, 0.21, 140, 32, 2, 3);
    const torusKnot = applyForgedWaveDeformation(rawKnot, 0.018, 3.8, 3.1);

    return {
      link: new THREE.TorusGeometry(0.52, 0.125, 32, 64),
      torusKnot,
      medallionHalo: createBeveledMedallionGeometry(),
      innerHalo: new THREE.TorusGeometry(1.76, 0.044, 32, 96),
      haloBead: createHaloBeadGeometry(),
      orbitalDrop: createSculptedDropGeometry(),
      orbitalDisc: createBeveledDiscGeometry(),
    };
  }, []);

  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    const cDust = new THREE.Color('#c8d5e4');
    const cBronze = new THREE.Color('#d49a5a');
    const cRuby = new THREE.Color('#e04d38');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const spreadX = (Math.random() - 0.5) * 24;
      const spreadY = (Math.random() - 0.5) * 16;
      const spreadZ =
        i < PARTICLE_COUNT * 0.25 ? 2.4 + Math.random() * 5.0 : -9.5 + Math.random() * 11.9;

      positions[i3] = spreadX;
      positions[i3 + 1] = spreadY;
      positions[i3 + 2] = spreadZ;

      const r = Math.random();
      const col = r < 0.6 ? cDust : r < 0.86 ? cBronze : cRuby;
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      speeds[i] = 0.16 + Math.random() * 0.4;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const tex = createParticleTexture();
    return { geo, speeds, phases, tex };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      metalMaps.bumpMap.dispose();
      metalMaps.roughnessMap.dispose();
      particleData.geo.dispose();
      particleData.tex.dispose();
    };
  }, [geometries, metalMaps, particleData]);

  useEffect(() => {
    const beads = haloBeadsRef.current;
    if (!beads) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < HALO_BEAD_COUNT; i++) {
      const angle = (i / HALO_BEAD_COUNT) * Math.PI * 2;
      const r = 2.22;
      dummy.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0.08);
      dummy.rotation.set(0, 0, angle - Math.PI / 2);
      const scaleY = i % 2 === 0 ? 1.15 : 0.78;
      dummy.scale.set(1, scaleY, 1);
      dummy.updateMatrix();
      beads.setMatrixAt(i, dummy.matrix);
    }
    beads.instanceMatrix.needsUpdate = true;
  }, []);

  const curve = useMemo(() => {
    const xScale = isMobile ? 0.52 : 1.0;
    const points = [
      new THREE.Vector3(-2.6 * xScale, 32, -1.6),
      new THREE.Vector3(0.4 * xScale, 22, 0.8),
      new THREE.Vector3(2.4 * xScale, 12, 1.8),
      new THREE.Vector3(0.7 * xScale, 3.5, 2.2),
      new THREE.Vector3(-1.4 * xScale, -4.5, 1.5),
      new THREE.Vector3(-2.6 * xScale, -12.5, 0.9),
      new THREE.Vector3(0.2 * xScale, -20.5, 1.8),
      new THREE.Vector3(2.5 * xScale, -28.5, 1.3),
      new THREE.Vector3(1.4 * xScale, -36.5, 0.4),
      new THREE.Vector3(-1.8 * xScale, -45.0, -1.2),
    ];
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  }, [isMobile]);

  const scratch = useMemo(() => {
    const dropStates = DROP_FORMATIONS[0].map(([x, y, z, s], idx) => ({
      x,
      y,
      z,
      s,
      rx: idx * 0.72,
      ry: idx * 1.08,
      rz: idx * 0.42,
      sx: 0.94 + (idx % 3) * 0.07,
      sy: 0.94 + (idx % 3) * 0.07,
      sz: 0.94 + (idx % 3) * 0.07,
    }));

    const discStates = DISC_FORMATIONS[0].map(([x, y, z, s], idx) => ({
      x,
      y,
      z,
      s,
      rx: 0.35 + idx * 0.55,
      ry: idx * 0.85,
      rz: idx * 0.3,
    }));

    return {
      pos: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      side: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      basis: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
      oddRot: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2),
      scale: new THREE.Vector3(1, 1.58, 1),
      matrix: new THREE.Matrix4(),
      dummy: new THREE.Object3D(),
      smoothPtrX: 0,
      smoothPtrY: 0,
      lookVec: new THREE.Vector3(0.45, 0.1, 0.2),
      dropStates,
      discStates,
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = sceneStateRef.current;
    const elapsed = state.clock.getElapsedTime();
    const xMul = isMobile ? 0.48 : 1.0;

    const chain = chainRef.current;
    if (chain) {
      for (let i = 0; i < LINK_COUNT; i++) {
        let t = (i / LINK_COUNT + s.chainOffset) % 1;
        if (t < 0) t += 1;

        curve.getPointAt(t, scratch.pos);
        curve.getTangentAt(t, scratch.tangent).normalize();

        scratch.pos.y += s.yShift + Math.sin(elapsed * 0.85 + i * 0.22) * 0.04;
        scratch.pos.x += Math.cos(elapsed * 0.65 + i * 0.18) * 0.045;

        const refAxis = Math.abs(scratch.tangent.dot(Z_REF)) > 0.98 ? X_FALLBACK : Z_REF;
        scratch.side.crossVectors(scratch.tangent, refAxis).normalize();
        scratch.forward.crossVectors(scratch.side, scratch.tangent).normalize();

        scratch.basis.makeBasis(scratch.side, scratch.tangent, scratch.forward);
        scratch.quat.setFromRotationMatrix(scratch.basis);

        if (i % 2 === 1) {
          scratch.quat.multiply(scratch.oddRot);
        }

        scratch.matrix.compose(scratch.pos, scratch.quat, scratch.scale);
        chain.setMatrixAt(i, scratch.matrix);
      }
      chain.instanceMatrix.needsUpdate = true;
    }

    if (haloGroupRef.current) {
      const hScale = s.haloScale * (isMobile ? 0.68 : 1.0);
      haloGroupRef.current.position.set(
        s.haloX * xMul,
        s.haloY + Math.sin(elapsed * 0.58) * 0.12,
        s.haloZ
      );
      haloGroupRef.current.rotation.set(
        0.16 + Math.sin(elapsed * 0.38) * 0.06,
        s.haloRotY + scratch.smoothPtrX * 0.2,
        Math.cos(elapsed * 0.3) * 0.05
      );
      haloGroupRef.current.scale.setScalar(hScale);
    }
    if (knotRef.current) {
      knotRef.current.rotation.x = elapsed * 0.22;
      knotRef.current.rotation.y = elapsed * 0.31 + s.chainOffset * 3.0;
      knotRef.current.rotation.z = Math.sin(elapsed * 0.35) * 0.18;
    }
    if (medallionRef.current) {
      medallionRef.current.rotation.z = elapsed * 0.14;
    }
    if (innerHaloRef.current) {
      innerHaloRef.current.rotation.z = -elapsed * 0.24;
      innerHaloRef.current.rotation.x = Math.sin(elapsed * 0.44) * 0.24;
    }

    const drops = dropsRef.current;
    if (drops) {
      const targetDrops = DROP_FORMATIONS[activeScene] || DROP_FORMATIONS[0];
      const lerpFactor = 1 - Math.exp(-dt * 4.2);
      const dummy = scratch.dummy;

      for (let i = 0; i < ORBITAL_DROP_COUNT; i++) {
        const st = scratch.dropStates[i];
        const [tx, ty, tz, ts] = targetDrops[i];

        st.x += (tx * xMul - st.x) * lerpFactor;
        st.y += (ty - st.y) * lerpFactor;
        st.z += (tz - st.z) * lerpFactor;
        st.s += (ts * (isMobile ? 0.72 : 1.0) - st.s) * lerpFactor;

        const bobY = Math.sin(elapsed * (0.68 + i * 0.09) + i * 1.4) * 0.14;
        const driftX = Math.cos(elapsed * (0.48 + i * 0.07) + i) * 0.09;

        dummy.position.set(st.x + driftX, st.y + bobY, st.z);
        dummy.rotation.set(
          st.rx + elapsed * (0.15 + (i % 3) * 0.05),
          st.ry + elapsed * (0.22 + (i % 2) * 0.08) + s.chainOffset * 2.2,
          st.rz + Math.sin(elapsed * 0.42 + i) * 0.16
        );
        dummy.scale.set(st.sx * st.s, st.sy * st.s, st.sz * st.s);
        dummy.updateMatrix();
        drops.setMatrixAt(i, dummy.matrix);
      }
      drops.instanceMatrix.needsUpdate = true;
    }

    const discs = discsRef.current;
    if (discs) {
      const targetDiscs = DISC_FORMATIONS[activeScene] || DISC_FORMATIONS[0];
      const lerpFactor = 1 - Math.exp(-dt * 3.8);
      const dummy = scratch.dummy;

      for (let i = 0; i < ORBITAL_DISC_COUNT; i++) {
        const st = scratch.discStates[i];
        const [tx, ty, tz, ts] = targetDiscs[i];

        st.x += (tx * xMul - st.x) * lerpFactor;
        st.y += (ty - st.y) * lerpFactor;
        st.z += (tz - st.z) * lerpFactor;
        st.s += (ts * (isMobile ? 0.7 : 1.0) - st.s) * lerpFactor;

        const bobY = Math.cos(elapsed * (0.55 + i * 0.11) + i) * 0.12;
        dummy.position.set(st.x, st.y + bobY, st.z);
        dummy.rotation.set(
          st.rx + Math.sin(elapsed * 0.35 + i) * 0.35,
          st.ry + elapsed * (0.24 + (i % 2) * 0.09) + s.chainOffset * 1.8,
          st.rz + elapsed * 0.14
        );
        dummy.scale.setScalar(st.s);
        dummy.updateMatrix();
        discs.setMatrixAt(i, dummy.matrix);
      }
      discs.instanceMatrix.needsUpdate = true;
    }

    if (particlesRef.current) {
      const posAttr = particleData.geo.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        arr[i3 + 1] += particleData.speeds[i] * dt;
        arr[i3] += Math.sin(elapsed * 0.55 + particleData.phases[i]) * 0.12 * dt;
        if (arr[i3 + 1] > 8.5) {
          arr[i3 + 1] = -8.5;
        }
      }
      posAttr.needsUpdate = true;
      particlesRef.current.rotation.y = scratch.smoothPtrX * 0.08 + s.chainOffset * 0.6;
    }

    const ptrLerp = 1 - Math.exp(-dt * 5.5);
    scratch.smoothPtrX += (pointerRef.current.x - scratch.smoothPtrX) * ptrLerp;
    scratch.smoothPtrY += (pointerRef.current.y - scratch.smoothPtrY) * ptrLerp;

    const mobileZ = isMobile ? 2.4 : 0;
    camera.position.set(
      s.camX * xMul + scratch.smoothPtrX * 0.52,
      s.camY + scratch.smoothPtrY * 0.45,
      s.camZ + mobileZ
    );
    scratch.lookVec.set(s.lookX * xMul, s.lookY, s.lookZ);
    camera.lookAt(scratch.lookVec);

    if (cursorLightRef.current) {
      if (isMobile) {
        cursorLightRef.current.position.set(
          Math.sin(elapsed * 0.55) * 4.2,
          Math.sin(elapsed * 1.1) * 2.5,
          5.6
        );
      } else {
        cursorLightRef.current.position.set(
          scratch.smoothPtrX * 6.8 + 0.6,
          scratch.smoothPtrY * 4.2,
          5.8
        );
      }
      cursorLightRef.current.color.setRGB(s.curR, s.curG, s.curB);
    }

    if (keyLightRef.current) keyLightRef.current.color.setRGB(s.keyR, s.keyG, s.keyB);
    if (rimLightRef.current) rimLightRef.current.color.setRGB(s.rimR, s.rimG, s.rimB);
    if (fillLightRef.current) fillLightRef.current.color.setRGB(s.fillR, s.fillG, s.fillB);
    if (chainMatRef.current) chainMatRef.current.emissive.setRGB(s.emR, s.emG, s.emB);
    if (knotMatRef.current) knotMatRef.current.emissive.setRGB(s.emR, s.emG, s.emB);
    if (dropsMatRef.current) dropsMatRef.current.emissive.setRGB(s.emR, s.emG, s.emB);
    if (discsMatRef.current) discsMatRef.current.emissive.setRGB(s.emR, s.emG, s.emB);
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 14, 34]} />

      <ambientLight intensity={0.34} color="#dbe4ef" />
      <directionalLight ref={keyLightRef} position={[6, 9, 10]} intensity={2.8} color="#E8EEF5" />
      <directionalLight ref={rimLightRef} position={[-8, 4, 7]} intensity={2.2} color="#FFFFFF" />
      <pointLight
        ref={fillLightRef}
        position={[4, -4, 8]}
        intensity={14}
        distance={30}
        decay={1.5}
        color="#B6CBE0"
      />
      <pointLight
        ref={cursorLightRef}
        position={[1.5, 1, 5.8]}
        intensity={20}
        distance={24}
        decay={1.4}
        color="#E8EEF5"
      />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={3.0}
          color="#e8eef6"
          scale={[16, 5, 1]}
          position={[0, 8, 5]}
          rotation={[Math.PI / 2.4, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#dce5f0"
          scale={[6, 15, 1]}
          position={[9, 1, 6]}
          rotation={[0, -Math.PI / 2.5, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#cfd9e6"
          scale={[6, 15, 1]}
          position={[-9, -1, 5]}
          rotation={[0, Math.PI / 2.5, 0]}
        />
        <Lightformer
          form="ring"
          intensity={1.9}
          color="#e5d5bc"
          scale={9}
          position={[2, -6, 6]}
          rotation={[-Math.PI / 3, 0, 0]}
        />
      </Environment>

      <instancedMesh ref={chainRef} args={[geometries.link, null, LINK_COUNT]} frustumCulled={false}>
        <meshPhysicalMaterial
          ref={chainMatRef}
          color="#2c323c"
          metalness={0.96}
          roughness={0.38}
          roughnessMap={metalMaps.roughnessMap}
          bumpMap={metalMaps.bumpMap}
          bumpScale={0.095}
          envMapIntensity={1.0}
          clearcoat={0.22}
          clearcoatRoughness={0.32}
          emissive="#18202C"
          emissiveIntensity={0.22}
        />
      </instancedMesh>

      <group ref={haloGroupRef} position={[1.05, 0.12, 1.45]}>
        <mesh ref={knotRef} geometry={geometries.torusKnot}>
          <meshPhysicalMaterial
            ref={knotMatRef}
            color="#343b46"
            metalness={0.96}
            roughness={0.36}
            roughnessMap={metalMaps.roughnessMap}
            bumpMap={metalMaps.bumpMap}
            bumpScale={0.11}
            envMapIntensity={1.1}
            clearcoat={0.26}
            clearcoatRoughness={0.28}
            emissive="#18202C"
            emissiveIntensity={0.2}
          />
        </mesh>

        <mesh ref={medallionRef} geometry={geometries.medallionHalo}>
          <meshPhysicalMaterial
            color="#262c35"
            metalness={0.96}
            roughness={0.42}
            roughnessMap={metalMaps.roughnessMap}
            bumpMap={metalMaps.bumpMap}
            bumpScale={0.11}
            envMapIntensity={0.95}
            clearcoat={0.2}
            clearcoatRoughness={0.34}
          />
        </mesh>

        <mesh ref={innerHaloRef} geometry={geometries.innerHalo}>
          <meshPhysicalMaterial
            color="#4a4236"
            metalness={0.94}
            roughness={0.35}
            roughnessMap={metalMaps.roughnessMap}
            bumpMap={metalMaps.bumpMap}
            bumpScale={0.085}
            envMapIntensity={1.05}
            clearcoat={0.24}
            clearcoatRoughness={0.26}
          />
        </mesh>

        <instancedMesh
          ref={haloBeadsRef}
          args={[geometries.haloBead, null, HALO_BEAD_COUNT]}
          frustumCulled={false}
        >
          <meshPhysicalMaterial
            color="#343b46"
            metalness={0.96}
            roughness={0.36}
            roughnessMap={metalMaps.roughnessMap}
            bumpMap={metalMaps.bumpMap}
            bumpScale={0.08}
            envMapIntensity={1.05}
            clearcoat={0.22}
          />
        </instancedMesh>
      </group>

      <instancedMesh
        ref={dropsRef}
        args={[geometries.orbitalDrop, null, ORBITAL_DROP_COUNT]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial
          ref={dropsMatRef}
          color="#232830"
          metalness={0.95}
          roughness={0.4}
          roughnessMap={metalMaps.roughnessMap}
          bumpMap={metalMaps.bumpMap}
          bumpScale={0.1}
          envMapIntensity={0.92}
          clearcoat={0.24}
          clearcoatRoughness={0.3}
          emissive="#18202C"
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      <instancedMesh
        ref={discsRef}
        args={[geometries.orbitalDisc, null, ORBITAL_DISC_COUNT]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial
          ref={discsMatRef}
          color="#2a303a"
          metalness={0.96}
          roughness={0.42}
          roughnessMap={metalMaps.roughnessMap}
          bumpMap={metalMaps.bumpMap}
          bumpScale={0.095}
          envMapIntensity={0.95}
          clearcoat={0.22}
          clearcoatRoughness={0.32}
          emissive="#18202C"
          emissiveIntensity={0.18}
        />
      </instancedMesh>

      <points ref={particlesRef} geometry={particleData.geo} frustumCulled={false}>
        <pointsMaterial
          size={0.15}
          map={particleData.tex}
          vertexColors
          transparent
          opacity={0.76}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      <BloomPostProcessing />
    </>
  );
}

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="webgl-fallback" aria-hidden="true" />;
    }
    return this.props.children;
  }
}

export default function ChainScene({ sceneStateRef, pointerRef, activeScene }) {
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const ctx = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!ctx) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }
  }, []);

  if (!webglOk) {
    return <div className="webgl-fallback" aria-hidden="true" />;
  }

  return (
    <div className="canvas-layer" aria-hidden="true">
      <SceneErrorBoundary>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0.1, 0.55, 9.8], fov: 42, near: 0.1, far: 80 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setWebglOk(false);
            });
          }}
        >
          <ValhallaWorld
            sceneStateRef={sceneStateRef}
            pointerRef={pointerRef}
            activeScene={activeScene}
          />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}

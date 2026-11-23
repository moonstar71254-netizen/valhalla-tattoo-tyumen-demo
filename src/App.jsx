import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import * as THREE from 'three';
import ChainScene, { SCENE_CAMERA_PRESETS } from './components/ChainScene.jsx';

gsap.registerPlugin(Observer);
gsap.ticker.lagSmoothing(0);

const SCENES = [
  { id: 'hero', label: 'Вход', mood: 'hero' },
  { id: 'atmosphere', label: 'Атмосфера', mood: 'atmosphere' },
  { id: 'approach', label: 'Подход', mood: 'approach' },
  { id: 'services', label: 'Услуги и прайс', mood: 'services' },
  { id: 'contacts', label: 'Контакты', mood: 'contacts' },
];

const DEFAULT_CONFIG = {
  brand: {
    nameLines: ['ВАЛЬХАЛЛА', 'ТАТУ'],
    shortName: 'ВАЛЬХАЛЛА',
    eyebrow: 'Тюмень · ул. Достоевского, 7 · 5.0 на 2ГИС',
    tagline: 'Авторская тату-студия в Тюмени',
    scrollCue: 'Листайте вниз',
  },
  atmosphere: {
    kicker: '01 / Атмосфера',
    titleLines: ['Зал северных', 'легенд'],
    lead:
      'Интерьер на ул. Достоевского, 7 собран вручную как музей скандинавской мифологии: внутри руны, статуэтки богов и живые музыкальные инструменты.',
    facts: [],
  },
  approach: {
    kicker: '02 / Подход',
    titleLines: ['8 часов', 'без спешки'],
    lead:
      'Совладельцы Марс и Ирина ведут крупные проекты и рукава вдумчиво. На длинных сеансах угощают свежесваренным кофе и заказывают пиццу, а перед стартом проводят бесплатную консультацию.',
    facts: [],
  },
  services: {
    kicker: '03 / Услуги и прайс',
    titleLines: ['Направления', 'работы'],
    items: [],
  },
  certificates: {
    kicker: '04 / Сертификаты и запись',
    titleLines: ['Сертификаты,', 'мерч и контакты'],
    tiers: [1500, 5000, 10000, 25000, 50000, 100000],
    merchNote: 'Подарочные сертификаты 1 500–100 000 ₽ и фирменный мерч студии доступны на Достоевского, 7 и в Telegram.',
  },
  contacts: {
    address: 'Тюмень, ул. Достоевского, 7, цокольный этаж · с 15:00 по записи',
    telegramStudioUrl: 'https://t.me/Valhalla_tattoo72',
    telegramStudioLabel: '@Valhalla_tattoo72',
    telegramMarsUrl: 'https://t.me/marselwolf_tattoo',
    telegramMarsLabel: '@marselwolf_tattoo',
    dgisUrl: 'https://2gis.ru/tyumen/firm/70000001039265379',
    vkUrl: 'https://vk.ru/valhalla_tattoo72',
  },
};

function createInitialSceneState() {
  const p = SCENE_CAMERA_PRESETS[0];
  const k = new THREE.Color(p.key);
  const r = new THREE.Color(p.rim);
  const f = new THREE.Color(p.fill);
  const e = new THREE.Color(p.emissive);
  const c = new THREE.Color(p.cursorLight);
  return {
    chainOffset: 0,
    yShift: p.yShift,
    camX: p.cam[0],
    camY: p.cam[1],
    camZ: p.cam[2],
    lookX: p.look[0],
    lookY: p.look[1],
    lookZ: p.look[2],
    haloX: p.haloPos[0],
    haloY: p.haloPos[1],
    haloZ: p.haloPos[2],
    haloScale: p.haloScale,
    haloRotY: p.haloRotY,
    keyR: k.r,
    keyG: k.g,
    keyB: k.b,
    rimR: r.r,
    rimG: r.g,
    rimB: r.b,
    fillR: f.r,
    fillG: f.g,
    fillB: f.b,
    emR: e.r,
    emG: e.g,
    emB: e.b,
    curR: c.r,
    curG: c.g,
    curB: c.b,
  };
}

function formatRub(value) {
  return `${Number(value).toLocaleString('ru-RU')} ₽`;
}

function getTransitionMode(prev, target) {
  const low = Math.min(prev, target);
  const high = Math.max(prev, target);
  if (low === 0 && high === 1) return 'flyZ';
  if (low === 1 && high === 2) return 'orbitalX';
  if (low === 2 && high === 3) return 'counter';
  if (low === 3 && high === 4) return 'pullback';
  // Direct nav jumps map cleanly to destination spatial signature
  if (target === 1) return 'flyZ';
  if (target === 2) return 'orbitalX';
  if (target === 3) return 'counter';
  if (target === 4) return 'pullback';
  return 'flyZ';
}

const tiltStateMap = new WeakMap();

function getTiltState(el) {
  let state = tiltStateMap.get(el);
  if (!state) {
    state = {
      curRx: 0,
      curRy: 0,
      curGx: 50,
      curGy: 50,
      targetRx: 0,
      targetRy: 0,
      targetGx: 50,
      targetGy: 50,
      active: false,
      baseRect: null,
      rafId: null,
    };
    tiltStateMap.set(el, state);
  }
  return state;
}

function stepSurfaceTilt(el) {
  const state = tiltStateMap.get(el);
  if (!state) return;
  const lerp = 0.16;
  state.curRx += (state.targetRx - state.curRx) * lerp;
  state.curRy += (state.targetRy - state.curRy) * lerp;
  state.curGx += (state.targetGx - state.curGx) * lerp;
  state.curGy += (state.targetGy - state.curGy) * lerp;

  el.style.setProperty('--rx', `${state.curRx.toFixed(2)}deg`);
  el.style.setProperty('--ry', `${state.curRy.toFixed(2)}deg`);
  el.style.setProperty('--gx', `${state.curGx.toFixed(1)}%`);
  el.style.setProperty('--gy', `${state.curGy.toFixed(1)}%`);

  const done =
    Math.abs(state.targetRx - state.curRx) < 0.01 &&
    Math.abs(state.targetRy - state.curRy) < 0.01 &&
    Math.abs(state.targetGx - state.curGx) < 0.05 &&
    Math.abs(state.targetGy - state.curGy) < 0.05;

  if (done) {
    state.curRx = state.targetRx;
    state.curRy = state.targetRy;
    state.curGx = state.targetGx;
    state.curGy = state.targetGy;
    el.style.setProperty('--rx', `${state.curRx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${state.curRy.toFixed(2)}deg`);
    el.style.setProperty('--gx', `${state.curGx.toFixed(1)}%`);
    el.style.setProperty('--gy', `${state.curGy.toFixed(1)}%`);
    state.rafId = null;
    if (!state.active) {
      el.classList.remove('is-tilting');
    }
    return;
  }

  state.rafId = requestAnimationFrame(() => stepSurfaceTilt(el));
}

function handleTiltMove(e, maxDeg = 2.5) {
  const el = e.currentTarget;
  const state = getTiltState(el);
  if (!state.active) {
    state.baseRect = el.getBoundingClientRect();
    state.active = true;
    el.classList.add('is-tilting');
  }
  const rect = state.baseRect || el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
  const clampedMax = Math.min(3, Math.max(1, maxDeg));

  state.targetRx = (0.5 - py) * clampedMax * 2;
  state.targetRy = (px - 0.5) * clampedMax * 2;
  state.targetGx = px * 100;
  state.targetGy = py * 100;

  if (!state.rafId) {
    state.rafId = requestAnimationFrame(() => stepSurfaceTilt(el));
  }
}

function handleTiltLeave(e) {
  const el = e.currentTarget;
  const state = getTiltState(el);
  state.active = false;
  state.baseRect = null;
  state.targetRx = 0;
  state.targetRy = 0;
  state.targetGx = 50;
  state.targetGy = 50;

  if (!state.rafId) {
    state.rafId = requestAnimationFrame(() => stepSurfaceTilt(el));
  }
}

export default function App() {
  const config = useMemo(() => window.SITE_CONFIG || DEFAULT_CONFIG, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const tiers = config.certificates.tiers || [1500, 5000, 10000, 25000, 50000, 100000];
  const [selectedTier, setSelectedTier] = useState(tiers[2] || 10000);

  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const sceneRefs = useRef([]);
  const sceneStateRef = useRef(createInitialSceneState());
  const pointerRef = useRef({ x: 0, y: 0 });
  const tlRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const certCardRef = useRef(null);
  const certTiltRef = useRef({
    curRx: 0,
    curRy: 0,
    curGx: 50,
    curGy: 50,
    targetRx: 0,
    targetRy: 0,
    targetGx: 50,
    targetGy: 50,
    rafId: null,
  });

  const stepCertTilt = useCallback(() => {
    const card = certCardRef.current;
    const st = certTiltRef.current;
    if (!card) {
      st.rafId = null;
      return;
    }

    const lerp = 0.14;
    st.curRx += (st.targetRx - st.curRx) * lerp;
    st.curRy += (st.targetRy - st.curRy) * lerp;
    st.curGx += (st.targetGx - st.curGx) * lerp;
    st.curGy += (st.targetGy - st.curGy) * lerp;

    card.style.setProperty('--rx', `${st.curRx.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${st.curRy.toFixed(2)}deg`);
    card.style.setProperty('--gx', `${st.curGx.toFixed(1)}%`);
    card.style.setProperty('--gy', `${st.curGy.toFixed(1)}%`);

    const settled =
      Math.abs(st.targetRx - st.curRx) < 0.01 &&
      Math.abs(st.targetRy - st.curRy) < 0.01 &&
      Math.abs(st.targetGx - st.curGx) < 0.01 &&
      Math.abs(st.targetGy - st.curGy) < 0.01;

    if (settled) {
      st.curRx = st.targetRx;
      st.curRy = st.targetRy;
      st.curGx = st.targetGx;
      st.curGy = st.targetGy;
      card.style.setProperty('--rx', `${st.curRx.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${st.curRy.toFixed(2)}deg`);
      card.style.setProperty('--gx', `${st.curGx.toFixed(1)}%`);
      card.style.setProperty('--gy', `${st.curGy.toFixed(1)}%`);
      st.rafId = null;
      return;
    }

    st.rafId = requestAnimationFrame(stepCertTilt);
  }, []);

  const handleCertMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      const maxDeg = 10;
      const st = certTiltRef.current;
      st.targetRx = (0.5 - py) * maxDeg * 2;
      st.targetRy = (px - 0.5) * maxDeg * 2;
      st.targetGx = px * 100;
      st.targetGy = py * 100;
      if (!st.rafId) {
        st.rafId = requestAnimationFrame(stepCertTilt);
      }
    },
    [stepCertTilt]
  );

  const handleCertLeave = useCallback(() => {
    const st = certTiltRef.current;
    st.targetRx = 0;
    st.targetRy = 0;
    st.targetGx = 50;
    st.targetGy = 50;
    if (!st.rafId) {
      st.rafId = requestAnimationFrame(stepCertTilt);
    }
  }, [stepCertTilt]);

  useEffect(() => {
    return () => {
      if (certTiltRef.current.rafId) {
        cancelAnimationFrame(certTiltRef.current.rafId);
        certTiltRef.current.rafId = null;
      }
    };
  }, []);

  const tierIntensity = useMemo(() => {
    const idx = Math.max(0, tiers.indexOf(selectedTier));
    return (0.28 + (idx / Math.max(1, tiers.length - 1)) * 0.72).toFixed(2);
  }, [tiers, selectedTier]);

  const resetSceneProps = useCallback((el) => {
    if (!el) return;
    const inner = el.querySelector('.scene-inner');
    const targets = [
      inner,
      ...el.querySelectorAll('.mask-inner, .draw-line, .stagger-item, .counter-head, .counter-row, .cert-stage-wrap'),
    ].filter(Boolean);
    gsap.set(targets, {
      clearProps: 'transform,opacity,filter',
    });
  }, []);

  const animateIntro = useCallback((el, tl) => {
    if (!el) return;
    const masks = el.querySelectorAll('.mask-inner');
    const lines = el.querySelectorAll('.draw-line');
    const items = el.querySelectorAll('.stagger-item');

    tl.set(el, { visibility: 'visible', pointerEvents: 'auto', zIndex: 20 }, 0.08);
    if (masks.length) {
      tl.fromTo(
        masks,
        { yPercent: 112 },
        { yPercent: 0, duration: 0.78, stagger: 0.09, ease: 'expo.out' },
        0.1
      );
    }
    if (lines.length) {
      tl.fromTo(
        lines,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.65, stagger: 0.06, ease: 'expo.out' },
        0.18
      );
    }
    if (items.length) {
      tl.fromTo(
        items,
        { z: -60, scale: 0.94, opacity: 0 },
        { z: 0, scale: 1, opacity: 1, duration: 0.62, stagger: 0.07, ease: 'power3.out' },
        0.22
      );
    }
  }, []);

  const goToScene = useCallback(
    (nextIndex, force = false) => {
      const target = Math.max(0, Math.min(SCENES.length - 1, nextIndex));
      const prev = activeIndexRef.current;
      if (target === prev) return;
      if (isTransitioningRef.current && !force) return;

      isTransitioningRef.current = true;
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
      const dir = target > prev ? 1 : -1;
      const mode = getTransitionMode(prev, target);
      const prevEl = sceneRefs.current[prev];
      const nextEl = sceneRefs.current[target];

      if (tlRef.current) tlRef.current.kill();

      // Ensure no stray scenes remain visible when interrupting a transition
      sceneRefs.current.forEach((el, idx) => {
        if (!el || idx === prev || idx === target) return;
        gsap.set(el, { visibility: 'hidden', pointerEvents: 'none', zIndex: 10 });
        resetSceneProps(el);
      });

      const preset = SCENE_CAMERA_PRESETS[target];
      const k = new THREE.Color(preset.key);
      const r = new THREE.Color(preset.rim);
      const f = new THREE.Color(preset.fill);
      const e = new THREE.Color(preset.emissive);
      const c = new THREE.Color(preset.cursorLight);

      const tl = gsap.timeline({
        onComplete: () => {
          if (transitionTimerRef.current) {
            clearTimeout(transitionTimerRef.current);
            transitionTimerRef.current = null;
          }
          if (prevEl) {
            gsap.set(prevEl, { visibility: 'hidden', pointerEvents: 'none', zIndex: 10 });
            resetSceneProps(prevEl);
          }
          if (nextEl) {
            resetSceneProps(nextEl);
          }
          isTransitioningRef.current = false;
        },
      });
      tlRef.current = tl;
      transitionTimerRef.current = setTimeout(() => {
        if (prevEl) {
          gsap.set(prevEl, { visibility: 'hidden', pointerEvents: 'none', zIndex: 10 });
          resetSceneProps(prevEl);
        }
        if (nextEl) {
          gsap.set(nextEl, { visibility: 'visible', pointerEvents: 'auto', zIndex: 20 });
          resetSceneProps(nextEl);
        }
        isTransitioningRef.current = false;
        transitionTimerRef.current = null;
      }, 1350);

      // 3D World transition (1.15s)
      tl.to(
        sceneStateRef.current,
        {
          chainOffset: sceneStateRef.current.chainOffset + dir * 0.14,
          yShift: preset.yShift,
          camX: preset.cam[0],
          camY: preset.cam[1],
          camZ: preset.cam[2],
          lookX: preset.look[0],
          lookY: preset.look[1],
          lookZ: preset.look[2],
          haloX: preset.haloPos[0],
          haloY: preset.haloPos[1],
          haloZ: preset.haloPos[2],
          haloScale: preset.haloScale,
          haloRotY: preset.haloRotY,
          keyR: k.r,
          keyG: k.g,
          keyB: k.b,
          rimR: r.r,
          rimG: r.g,
          rimB: r.b,
          fillR: f.r,
          fillG: f.g,
          fillB: f.b,
          emR: e.r,
          emG: e.g,
          emB: e.b,
          curR: c.r,
          curG: c.g,
          curB: c.b,
          duration: 1.15,
          ease: 'expo.inOut',
        },
        0
      );

      // Outgoing scene spatial exit (0.00 -> 0.40s)
      if (prevEl) {
        const prevInner = prevEl.querySelector('.scene-inner');
        const prevLines = prevEl.querySelectorAll('.draw-line');
        const prevItems = prevEl.querySelectorAll('.stagger-item, .counter-head, .counter-row, .cert-stage-wrap');

        tl.set(prevEl, { pointerEvents: 'none' }, 0);
        if (prevLines.length) {
          tl.to(prevLines, { scaleX: 0, duration: 0.26, ease: 'power3.in' }, 0);
        }

        if (mode === 'flyZ') {
          if (dir > 0) {
            tl.to(
              prevInner,
              { scale: 1.24, filter: 'blur(8px)', opacity: 0, duration: 0.4, ease: 'power3.in' },
              0
            );
          } else {
            tl.to(
              prevInner,
              { scale: 0.82, rotateX: 12, opacity: 0, duration: 0.4, ease: 'power3.in' },
              0
            );
          }
        } else if (mode === 'orbitalX') {
          tl.to(
            prevItems,
            {
              x: -140 * dir,
              rotateY: -18 * dir,
              opacity: 0,
              duration: 0.38,
              stagger: 0.02,
              ease: 'power3.in',
            },
            0
          );
          tl.to(prevInner, { opacity: 0, duration: 0.38, ease: 'power3.in' }, 0.02);
        } else if (mode === 'counter') {
          tl.to(
            prevItems,
            {
              x: -85 * dir,
              y: -22 * dir,
              rotateY: -10 * dir,
              opacity: 0,
              duration: 0.36,
              stagger: 0.02,
              ease: 'power3.in',
            },
            0
          );
          tl.to(prevInner, { opacity: 0, duration: 0.36, ease: 'power3.in' }, 0.02);
        } else {
          // pullback
          tl.to(
            prevInner,
            {
              y: -48 * dir,
              scale: 0.9,
              rotateX: 9 * dir,
              opacity: 0,
              duration: 0.38,
              ease: 'power3.in',
            },
            0
          );
        }
        tl.set(prevEl, { visibility: 'hidden', zIndex: 10 }, 0.41);
      }

      activeIndexRef.current = target;
      setActiveIndex(target);

      // Incoming scene spatial entry (0.42 -> 1.15s)
      if (nextEl) {
        const nextInner = nextEl.querySelector('.scene-inner');
        const nextMasks = nextEl.querySelectorAll('.mask-inner');
        const nextLines = nextEl.querySelectorAll('.draw-line');
        const nextItems = nextEl.querySelectorAll('.stagger-item');
        const counterHeads = nextEl.querySelectorAll('.counter-head');
        const counterRows = nextEl.querySelectorAll('.counter-row');
        const certWrap = nextEl.querySelector('.cert-stage-wrap');

        const startAt = 0.42;
        tl.set(nextEl, { visibility: 'visible', pointerEvents: 'auto', zIndex: 20 }, startAt);
        tl.set(nextInner, { opacity: 1, scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, filter: 'blur(0px)' }, startAt);

        if (nextLines.length) {
          tl.fromTo(
            nextLines,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.65, stagger: 0.05, ease: 'expo.out' },
            startAt + 0.08
          );
        }

        if (mode === 'flyZ') {
          if (dir > 0) {
            tl.fromTo(
              nextInner,
              { scale: 0.82, rotateX: 12, opacity: 0 },
              { scale: 1, rotateX: 0, opacity: 1, duration: 0.72, ease: 'expo.out' },
              startAt
            );
          } else {
            tl.fromTo(
              nextInner,
              { scale: 1.24, filter: 'blur(8px)', opacity: 0 },
              { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.72, ease: 'expo.out' },
              startAt
            );
          }
          if (nextMasks.length) {
            tl.fromTo(
              nextMasks,
              { yPercent: 105 * dir },
              { yPercent: 0, duration: 0.68, stagger: 0.07, ease: 'expo.out' },
              startAt + 0.04
            );
          }
          if (nextItems.length) {
            tl.fromTo(
              nextItems,
              { z: -50 * dir, opacity: 0 },
              { z: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' },
              startAt + 0.1
            );
          }
        } else if (mode === 'orbitalX') {
          if (nextMasks.length) {
            tl.fromTo(
              nextMasks,
              { x: 110 * dir, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.72, stagger: 0.07, ease: 'expo.out' },
              startAt
            );
          }
          if (nextItems.length) {
            tl.fromTo(
              nextItems,
              { x: 140 * dir, y: -30 * dir, rotateY: 18 * dir, opacity: 0 },
              {
                x: 0,
                y: 0,
                rotateY: 0,
                opacity: 1,
                duration: 0.72,
                stagger: 0.06,
                ease: 'expo.out',
              },
              startAt + 0.04
            );
          }
        } else if (mode === 'counter') {
          // Counter-motion: head from top-left, price rows from bottom-right with 3D tilt
          if (counterHeads.length) {
            tl.fromTo(
              counterHeads,
              { x: -90 * dir, y: -30 * dir, opacity: 0 },
              { x: 0, y: 0, opacity: 1, duration: 0.68, stagger: 0.06, ease: 'expo.out' },
              startAt
            );
          }
          if (nextMasks.length) {
            tl.fromTo(
              nextMasks,
              { x: -70 * dir, yPercent: 80 * dir },
              { x: 0, yPercent: 0, duration: 0.7, stagger: 0.07, ease: 'expo.out' },
              startAt
            );
          }
          if (counterRows.length) {
            tl.fromTo(
              counterRows,
              { x: 90 * dir, y: 24 * dir, rotateY: -10 * dir, opacity: 0 },
              {
                x: 0,
                y: 0,
                rotateY: 0,
                opacity: 1,
                duration: 0.68,
                stagger: 0.06,
                ease: 'expo.out',
              },
              startAt + 0.06
            );
          }
          if (nextItems.length) {
            tl.fromTo(
              nextItems,
              { x: -60 * dir, y: 22 * dir, opacity: 0 },
              { x: 0, y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' },
              startAt + 0.14
            );
          }
        } else {
          // pullback: contacts from bottom-left, 3D cert card unfolds from right rotateY 32deg
          if (nextMasks.length) {
            tl.fromTo(
              nextMasks,
              { x: -55 * dir, yPercent: 95 * dir },
              { x: 0, yPercent: 0, duration: 0.72, stagger: 0.07, ease: 'expo.out' },
              startAt
            );
          }
          if (nextItems.length) {
            tl.fromTo(
              nextItems,
              { x: -70 * dir, y: 50 * dir, opacity: 0 },
              {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.055,
                ease: 'expo.out',
              },
              startAt + 0.04
            );
          }
          if (certWrap) {
            tl.fromTo(
              certWrap,
              { rotateY: 32 * dir, scale: 0.86, x: 70 * dir, opacity: 0 },
              {
                rotateY: 0,
                scale: 1,
                x: 0,
                opacity: 1,
                duration: 0.78,
                ease: 'expo.out',
              },
              startAt + 0.08
            );
          }
        }
      }
    },
    [resetSceneProps]
  );

  useEffect(() => {
    sceneRefs.current.forEach((el, idx) => {
      if (!el) return;
      gsap.set(el, {
        visibility: idx === 0 ? 'visible' : 'hidden',
        pointerEvents: idx === 0 ? 'auto' : 'none',
        zIndex: idx === 0 ? 20 : 10,
      });
    });

    const introTl = gsap.timeline({
      onComplete: () => {
        if (transitionTimerRef.current) {
          clearTimeout(transitionTimerRef.current);
          transitionTimerRef.current = null;
        }
        resetSceneProps(sceneRefs.current[0]);
        isTransitioningRef.current = false;
      },
    });
    isTransitioningRef.current = true;
    animateIntro(sceneRefs.current[0], introTl);
    tlRef.current = introTl;
    transitionTimerRef.current = setTimeout(() => {
      resetSceneProps(sceneRefs.current[0]);
      isTransitioningRef.current = false;
      transitionTimerRef.current = null;
    }, 1350);

    return () => {
      introTl.kill();
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [animateIntro, resetSceneProps]);

  useEffect(() => {
    const obs = Observer.create({
      target: window,
      type: 'wheel,touch,pointer',
      wheelSpeed: -1,
      tolerance: 26,
      dragMinimum: 44,
      onUp: () => goToScene(activeIndexRef.current + 1),
      onDown: () => goToScene(activeIndexRef.current - 1),
    });

    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToScene(activeIndexRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToScene(activeIndexRef.current - 1);
      }
    };

    const onPointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      obs.kill();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [goToScene]);

  const activeMood = SCENES[activeIndex].mood;

  return (
    <div className="stage-root" data-mood={activeMood} data-scene={activeIndex}>
      <ChainScene
        sceneStateRef={sceneStateRef}
        pointerRef={pointerRef}
        activeScene={activeIndex}
      />
      <div className="readability-scrim" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />

      <header className="site-header">
        <button
          type="button"
          className="brand-mark"
          onClick={() => goToScene(0, true)}
        >
          <span className="brand-rune" aria-hidden="true" />
          <span>{config.brand.shortName}</span>
        </button>

        <nav className="header-nav" aria-label="Навигация по сценам" data-active-scene={activeIndex}>
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              type="button"
              className={`nav-link ${activeIndex === idx ? 'is-active' : ''}`}
              aria-current={activeIndex === idx ? 'step' : undefined}
              data-scene-target={idx}
              onClick={() => goToScene(idx, true)}
            >
              {scene.label}
            </button>
          ))}
        </nav>

        <a
          href={config.contacts.telegramStudioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="header-cta"
        >
          Telegram
        </a>
      </header>

      <aside className="chapter-rail" aria-label="Индикатор сцен" data-active-scene={activeIndex}>
        {SCENES.map((scene, idx) => (
          <button
            key={scene.id}
            type="button"
            className={`chapter-dot ${activeIndex === idx ? 'is-active' : ''}`}
            aria-current={activeIndex === idx ? 'step' : undefined}
            data-scene-target={idx}
            onClick={() => goToScene(idx, true)}
            aria-label={scene.label}
            title={scene.label}
          >
            <span className="chapter-tick" />
            <span className="chapter-label">{scene.label}</span>
          </button>
        ))}
      </aside>

      <main className="scenes-stack">
        {/* Scene 0: Hero */}
        <section
          ref={(el) => {
            sceneRefs.current[0] = el;
          }}
          className="scene-layer"
          data-scene-id="hero"
          aria-hidden={activeIndex !== 0}
        >
          <div className="scene-inner hero-layout">
            <div className="editorial-column">
              <div className="eyebrow stagger-item">
                <span className="eyebrow-line draw-line" aria-hidden="true" />
                <span>{config.brand.eyebrow}</span>
              </div>

              <h1 className="display-title">
                {config.brand.nameLines.map((line) => (
                  <span key={line} className="mask-line">
                    <span className="mask-inner">{line}</span>
                  </span>
                ))}
              </h1>

              <p className="hero-tagline stagger-item">{config.brand.tagline}</p>

              <div className="cta-row stagger-item">
                <a
                  href={config.contacts.telegramStudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Написать в Telegram
                </a>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => goToScene(3, true)}
                >
                  Смотреть прайс
                </button>
              </div>
            </div>

            <button
              type="button"
              className="scroll-cue stagger-item"
              onClick={() => goToScene(1, true)}
            >
              <span>{config.brand.scrollCue}</span>
              <span className="scroll-pulse" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Scene 1: Atmosphere */}
        <section
          ref={(el) => {
            sceneRefs.current[1] = el;
          }}
          className="scene-layer"
          data-scene-id="atmosphere"
          aria-hidden={activeIndex !== 1}
        >
          <div className="scene-inner">
            <div className="editorial-column wide-col">
              <div className="eyebrow stagger-item">
                <span className="eyebrow-line draw-line" aria-hidden="true" />
                <span>{config.atmosphere.kicker}</span>
              </div>

              <h2 className="scene-title">
                {config.atmosphere.titleLines.map((line) => (
                  <span key={line} className="mask-line">
                    <span className="mask-inner">{line}</span>
                  </span>
                ))}
              </h2>

              <p className="scene-lead stagger-item">{config.atmosphere.lead}</p>

              <div className="fact-list">
                {config.atmosphere.facts.map((fact) => (
                  <div
                    key={fact.index}
                    className="fact-row tilt-surface stagger-item"
                    onPointerMove={(e) => handleTiltMove(e, 2.5)}
                    onPointerLeave={handleTiltLeave}
                  >
                    <span className="draw-line fact-hairline" aria-hidden="true" />
                    <span className="fact-index">{fact.index}</span>
                    <span className="fact-text">{fact.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scene 2: Approach */}
        <section
          ref={(el) => {
            sceneRefs.current[2] = el;
          }}
          className="scene-layer"
          data-scene-id="approach"
          aria-hidden={activeIndex !== 2}
        >
          <div className="scene-inner">
            <div className="editorial-column wide-col">
              <div className="eyebrow stagger-item">
                <span className="eyebrow-line draw-line" aria-hidden="true" />
                <span>{config.approach.kicker}</span>
              </div>

              <h2 className="scene-title">
                {config.approach.titleLines.map((line) => (
                  <span key={line} className="mask-line">
                    <span className="mask-inner">{line}</span>
                  </span>
                ))}
              </h2>

              <p className="scene-lead stagger-item">{config.approach.lead}</p>

              <div className="fact-list">
                {config.approach.facts.map((fact) => (
                  <div
                    key={fact.index}
                    className="fact-row tilt-surface stagger-item"
                    onPointerMove={(e) => handleTiltMove(e, 2.5)}
                    onPointerLeave={handleTiltLeave}
                  >
                    <span className="draw-line fact-hairline" aria-hidden="true" />
                    <span className="fact-index">{fact.index}</span>
                    <span className="fact-text">{fact.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scene 3: Services & Price (Counter-motion assembly) */}
        <section
          ref={(el) => {
            sceneRefs.current[3] = el;
          }}
          className="scene-layer"
          data-scene-id="services"
          aria-hidden={activeIndex !== 3}
        >
          <div className="scene-inner">
            <div className="editorial-column wide-col">
              <div className="eyebrow counter-head">
                <span className="eyebrow-line draw-line" aria-hidden="true" />
                <span>{config.services.kicker}</span>
              </div>

              <h2 className="scene-title counter-head">
                {config.services.titleLines.map((line) => (
                  <span key={line} className="mask-line">
                    <span className="mask-inner">{line}</span>
                  </span>
                ))}
              </h2>

              <div className="price-list">
                {config.services.items.map((item) => (
                  <div
                    key={item.name}
                    className="price-row tilt-surface counter-row"
                    onPointerMove={(e) => handleTiltMove(e, 2.5)}
                    onPointerLeave={handleTiltLeave}
                  >
                    <span className="price-name">{item.name}</span>
                    <span className="price-value">{item.price}</span>
                    <span className="draw-line price-hairline" aria-hidden="true" />
                  </div>
                ))}
              </div>

              <div className="cta-row stagger-item">
                <a
                  href={config.contacts.telegramStudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Рассчитать эскиз в Telegram
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Scene 4: Certificates, 3D Metal Card & Contacts */}
        <section
          ref={(el) => {
            sceneRefs.current[4] = el;
          }}
          className="scene-layer"
          data-scene-id="contacts"
          aria-hidden={activeIndex !== 4}
        >
          <div className="scene-inner contacts-split">
            <div className="editorial-column contacts-left">
              <div className="eyebrow stagger-item">
                <span className="eyebrow-line draw-line" aria-hidden="true" />
                <span>{config.certificates.kicker}</span>
              </div>

              <h2 className="scene-title">
                {config.certificates.titleLines.map((line) => (
                  <span key={line} className="mask-line">
                    <span className="mask-inner">{line}</span>
                  </span>
                ))}
              </h2>

              <p className="scene-lead stagger-item">{config.certificates.merchNote}</p>

              <div className="tier-list stagger-item" role="group" aria-label="Номинал сертификата">
                {tiers.map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    className={`tier-chip ${selectedTier === tier ? 'is-active' : ''}`}
                    onClick={() => setSelectedTier(tier)}
                  >
                    {formatRub(tier)}
                  </button>
                ))}
              </div>

              <div className="cta-row stagger-item">
                <a
                  href={config.contacts.telegramStudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary cert-cta-btn"
                >
                  Оформить на {formatRub(selectedTier)}
                </a>
              </div>

              <div className="contact-meta stagger-item">
                <span className="draw-line fact-hairline" aria-hidden="true" />
                <div className="contact-address">{config.contacts.address}</div>
                <div className="contact-links">
                  <a
                    href={config.contacts.telegramStudioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-pill"
                  >
                    Telegram студии ({config.contacts.telegramStudioLabel})
                  </a>
                  <a
                    href={config.contacts.telegramMarsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-pill"
                  >
                    Telegram Марса ({config.contacts.telegramMarsLabel})
                  </a>
                  <a
                    href={config.contacts.dgisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-pill"
                  >
                    2ГИС · 5.0 ★
                  </a>
                  <a
                    href={config.contacts.vkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-pill"
                  >
                    ВКонтакте
                  </a>
                </div>
              </div>
            </div>

            <div
              className="cert-stage-wrap"
              onPointerMove={handleCertMove}
              onPointerLeave={handleCertLeave}
            >
              <div
                ref={certCardRef}
                className="cert-card-3d"
                style={{ '--glow-strength': tierIntensity }}
              >
                <div className="cert-card-edge" aria-hidden="true" />
                <div className="cert-card-face">
                  <div className="cert-card-sheen" aria-hidden="true" />
                  <div className="cert-card-top">
                    <span className="cert-card-brand">
                      <span className="cert-rune-dot" />
                      ВАЛЬХАЛЛА ТАТУ
                    </span>
                    <span className="cert-card-serial">№ VL-72</span>
                  </div>

                  <div className="cert-card-center">
                    <span className="cert-card-label">ПОДАРОЧНЫЙ СЕРТИФИКАТ</span>
                    <div className="cert-card-amount">{formatRub(selectedTier)}</div>
                  </div>

                  <div className="cert-card-bottom">
                    <span>Тюмень · ул. Достоевского, 7</span>
                    <span>Металл · Без срока</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

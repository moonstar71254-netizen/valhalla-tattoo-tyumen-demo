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
    items: [
      {
        name: 'Художественная татуировка',
        price: 'от 4 000 ₽',
        desc: 'Авторские эскизы и графика с проработкой под анатомию. Итоговая цена зависит от размера и детализации.',
      },
      {
        name: 'Крупные проекты и рукава',
        price: '8-часовые сеансы',
        desc: 'Совладельцы Марс и Ирина ведут масштабные работы вдумчиво. На длинном сеансе угощают кофе и заказывают пиццу.',
      },
      {
        name: 'Перекрытие шрамов и старых тату',
        price: 'Индивидуально',
        desc: 'Подбираем плотный эскиз и палитру так, чтобы полностью скрыть старый контур или рельеф кожи.',
      },
      {
        name: 'Лазерное удаление',
        price: 'По запросу',
        desc: 'Поэтапное осветление старых татуировок перед перекрытием или до чистой кожи по индивидуальному плану.',
      },
      {
        name: 'Пирсинг',
        price: 'По записи',
        desc: 'Стерильный кабинет и подбор базовых украшений. Работаем по предварительной записи с 15:00.',
      },
      {
        name: 'Консультация мастера',
        price: 'Бесплатно',
        desc: 'Разбираем идею, прикидываем расположение, количество сеансов и точную стоимость до записи.',
      },
    ],
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

function handleRowGlowMove(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
  el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
  el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
}

function handleRowGlowLeave(e) {
  const el = e.currentTarget;
  el.style.setProperty('--gx', '50%');
  el.style.setProperty('--gy', '50%');
}

export default function App() {
  const config = useMemo(() => window.SITE_CONFIG || DEFAULT_CONFIG, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const tiers = config.certificates.tiers || [1500, 5000, 10000, 25000, 50000, 100000];
  const [selectedTier, setSelectedTier] = useState(tiers[2] || 10000);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);

  const serviceItems = config.services.items?.length
    ? config.services.items
    : DEFAULT_CONFIG.services.items;
  const safeServiceIndex =
    selectedServiceIndex >= 0 && selectedServiceIndex < serviceItems.length
      ? selectedServiceIndex
      : 0;
  const selectedService = serviceItems[safeServiceIndex] || DEFAULT_CONFIG.services.items[0];

  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const sceneRefs = useRef([]);
  const sceneStateRef = useRef(createInitialSceneState());
  const pointerRef = useRef({ x: 0, y: 0 });
  const tlRef = useRef(null);
  const unlockTimerRef = useRef(null);
  const cleanupTimerRef = useRef(null);
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

    card.style.transform = `rotateX(${st.curRx.toFixed(2)}deg) rotateY(${st.curRy.toFixed(2)}deg)`;
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
      card.style.setProperty('--gx', `${st.curGx.toFixed(1)}%`);
      card.style.setProperty('--gy', `${st.curGy.toFixed(1)}%`);
      if (st.targetRx === 0 && st.targetRy === 0) {
        card.style.transform = 'none';
      } else {
        card.style.transform = `rotateX(${st.curRx.toFixed(2)}deg) rotateY(${st.curRy.toFixed(2)}deg)`;
      }
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

    tl.set(el, { visibility: 'visible', pointerEvents: 'auto', zIndex: 20 }, 0.04);
    if (masks.length) {
      tl.fromTo(
        masks,
        { yPercent: 112 },
        { yPercent: 0, duration: 0.56, stagger: 0.07, ease: 'expo.out' },
        0.06
      );
    }
    if (lines.length) {
      tl.fromTo(
        lines,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.48, stagger: 0.05, ease: 'expo.out' },
        0.12
      );
    }
    if (items.length) {
      tl.fromTo(
        items,
        { z: -48, scale: 0.95, opacity: 0 },
        { z: 0, scale: 1, opacity: 1, duration: 0.48, stagger: 0.05, ease: 'power3.out' },
        0.16
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
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = null;
      }
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
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
          if (cleanupTimerRef.current) {
            clearTimeout(cleanupTimerRef.current);
            cleanupTimerRef.current = null;
          }
          if (prevEl) {
            gsap.set(prevEl, { visibility: 'hidden', pointerEvents: 'none', zIndex: 10 });
            resetSceneProps(prevEl);
          }
          if (nextEl) {
            gsap.set(nextEl, { visibility: 'visible', pointerEvents: 'auto', zIndex: 20 });
            resetSceneProps(nextEl);
          }
          isTransitioningRef.current = false;
        },
      });
      tlRef.current = tl;

      unlockTimerRef.current = setTimeout(() => {
        isTransitioningRef.current = false;
        unlockTimerRef.current = null;
      }, 480);

      cleanupTimerRef.current = setTimeout(() => {
        if (prevEl) {
          gsap.set(prevEl, { visibility: 'hidden', pointerEvents: 'none', zIndex: 10 });
          resetSceneProps(prevEl);
        }
        if (nextEl) {
          gsap.set(nextEl, { visibility: 'visible', pointerEvents: 'auto', zIndex: 20 });
          resetSceneProps(nextEl);
        }
        cleanupTimerRef.current = null;
      }, 760);

      // 3D World transition (0.85s expo.out)
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
          duration: 0.85,
          ease: 'expo.out',
        },
        0
      );

      // Outgoing scene spatial exit (0.00 -> 0.24s, hidden at 0.25s)
      if (prevEl) {
        const prevInner = prevEl.querySelector('.scene-inner');
        const prevLines = prevEl.querySelectorAll('.draw-line');
        const prevItems = prevEl.querySelectorAll('.stagger-item, .counter-head, .counter-row, .cert-stage-wrap');

        tl.set(prevEl, { pointerEvents: 'none' }, 0);
        if (prevLines.length) {
          tl.to(prevLines, { scaleX: 0, duration: 0.18, ease: 'power3.in' }, 0);
        }

        if (mode === 'flyZ') {
          if (dir > 0) {
            tl.to(
              prevInner,
              { scale: 1.2, filter: 'blur(6px)', opacity: 0, duration: 0.24, ease: 'power3.in' },
              0
            );
          } else {
            tl.to(
              prevInner,
              { scale: 0.85, rotateX: 10, opacity: 0, duration: 0.24, ease: 'power3.in' },
              0
            );
          }
        } else if (mode === 'orbitalX') {
          tl.to(
            prevItems,
            {
              x: -110 * dir,
              rotateY: -14 * dir,
              opacity: 0,
              duration: 0.22,
              stagger: 0.012,
              ease: 'power3.in',
            },
            0
          );
          tl.to(prevInner, { opacity: 0, duration: 0.24, ease: 'power3.in' }, 0);
        } else if (mode === 'counter') {
          tl.to(
            prevItems,
            {
              x: -75 * dir,
              y: -18 * dir,
              rotateY: -8 * dir,
              opacity: 0,
              duration: 0.22,
              stagger: 0.012,
              ease: 'power3.in',
            },
            0
          );
          tl.to(prevInner, { opacity: 0, duration: 0.24, ease: 'power3.in' }, 0);
        } else {
          // pullback
          tl.to(
            prevInner,
            {
              y: -40 * dir,
              scale: 0.92,
              rotateX: 8 * dir,
              opacity: 0,
              duration: 0.24,
              ease: 'power3.in',
            },
            0
          );
        }
        tl.set(prevEl, { visibility: 'hidden', zIndex: 10 }, 0.25);
      }

      activeIndexRef.current = target;
      setActiveIndex(target);

      // Incoming scene spatial entry (0.22 -> 0.70s)
      if (nextEl) {
        const nextInner = nextEl.querySelector('.scene-inner');
        const nextMasks = nextEl.querySelectorAll('.mask-inner');
        const nextLines = nextEl.querySelectorAll('.draw-line');
        const nextItems = nextEl.querySelectorAll('.stagger-item');
        const counterHeads = nextEl.querySelectorAll('.counter-head');
        const counterRows = nextEl.querySelectorAll('.counter-row');
        const certWrap = nextEl.querySelector('.cert-stage-wrap');

        const startAt = 0.22;
        tl.set(nextEl, { visibility: 'visible', pointerEvents: 'auto', zIndex: 20 }, startAt);
        tl.set(nextInner, { opacity: 1, scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, filter: 'blur(0px)' }, startAt);

        if (nextLines.length) {
          tl.fromTo(
            nextLines,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.44, stagger: 0.025, ease: 'expo.out' },
            startAt + 0.04
          );
        }

        if (mode === 'flyZ') {
          if (dir > 0) {
            tl.fromTo(
              nextInner,
              { scale: 0.86, rotateX: 10, opacity: 0 },
              { scale: 1, rotateX: 0, opacity: 1, duration: 0.48, ease: 'expo.out' },
              startAt
            );
          } else {
            tl.fromTo(
              nextInner,
              { scale: 1.18, filter: 'blur(6px)', opacity: 0 },
              { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.48, ease: 'expo.out' },
              startAt
            );
          }
          if (nextMasks.length) {
            tl.fromTo(
              nextMasks,
              { yPercent: 105 * dir },
              { yPercent: 0, duration: 0.46, stagger: 0.04, ease: 'expo.out' },
              startAt + 0.02
            );
          }
          if (nextItems.length) {
            tl.fromTo(
              nextItems,
              { z: -40 * dir, opacity: 0 },
              { z: 0, opacity: 1, duration: 0.42, stagger: 0.035, ease: 'power3.out' },
              startAt + 0.05
            );
          }
        } else if (mode === 'orbitalX') {
          if (nextMasks.length) {
            tl.fromTo(
              nextMasks,
              { x: 96 * dir, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.48, stagger: 0.04, ease: 'expo.out' },
              startAt
            );
          }
          if (nextItems.length) {
            tl.fromTo(
              nextItems,
              { x: 115 * dir, y: -24 * dir, rotateY: 14 * dir, opacity: 0 },
              {
                x: 0,
                y: 0,
                rotateY: 0,
                opacity: 1,
                duration: 0.46,
                stagger: 0.035,
                ease: 'expo.out',
              },
              startAt + 0.03
            );
          }
        } else if (mode === 'counter') {
          if (counterHeads.length) {
            tl.fromTo(
              counterHeads,
              { x: -75 * dir, y: -24 * dir, opacity: 0 },
              { x: 0, y: 0, opacity: 1, duration: 0.46, stagger: 0.035, ease: 'expo.out' },
              startAt
            );
          }
          if (nextMasks.length) {
            tl.fromTo(
              nextMasks,
              { x: -60 * dir, yPercent: 75 * dir },
              { x: 0, yPercent: 0, duration: 0.48, stagger: 0.04, ease: 'expo.out' },
              startAt
            );
          }
          if (counterRows.length) {
            tl.fromTo(
              counterRows,
              { x: 75 * dir, y: 18 * dir, opacity: 0 },
              {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.44,
                stagger: 0.03,
                ease: 'expo.out',
              },
              startAt + 0.03
            );
          }
          if (nextItems.length) {
            tl.fromTo(
              nextItems,
              { x: -48 * dir, y: 18 * dir, opacity: 0 },
              { x: 0, y: 0, opacity: 1, duration: 0.42, stagger: 0.035, ease: 'power3.out' },
              startAt + 0.08
            );
          }
        } else {
          // pullback: contacts from bottom-left, 3D cert card unfolds from right
          if (nextMasks.length) {
            tl.fromTo(
              nextMasks,
              { x: -48 * dir, yPercent: 90 * dir },
              { x: 0, yPercent: 0, duration: 0.48, stagger: 0.04, ease: 'expo.out' },
              startAt
            );
          }
          if (nextItems.length) {
            tl.fromTo(
              nextItems,
              { x: -58 * dir, y: 40 * dir, opacity: 0 },
              {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.46,
                stagger: 0.035,
                ease: 'expo.out',
              },
              startAt + 0.03
            );
          }
          if (certWrap) {
            tl.fromTo(
              certWrap,
              { rotateY: 28 * dir, scale: 0.88, x: 56 * dir, opacity: 0 },
              {
                rotateY: 0,
                scale: 1,
                x: 0,
                opacity: 1,
                duration: 0.48,
                ease: 'expo.out',
              },
              startAt + 0.04
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
        if (cleanupTimerRef.current) {
          clearTimeout(cleanupTimerRef.current);
          cleanupTimerRef.current = null;
        }
        resetSceneProps(sceneRefs.current[0]);
        isTransitioningRef.current = false;
      },
    });
    isTransitioningRef.current = true;
    animateIntro(sceneRefs.current[0], introTl);
    tlRef.current = introTl;

    unlockTimerRef.current = setTimeout(() => {
      isTransitioningRef.current = false;
      unlockTimerRef.current = null;
    }, 480);

    cleanupTimerRef.current = setTimeout(() => {
      resetSceneProps(sceneRefs.current[0]);
      cleanupTimerRef.current = null;
    }, 760);

    return () => {
      introTl.kill();
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = null;
      }
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }
    };
  }, [animateIntro, resetSceneProps]);

  useEffect(() => {
    const obs = Observer.create({
      target: window,
      type: 'wheel,touch',
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
                    className="fact-row stagger-item"
                    onPointerMove={handleRowGlowMove}
                    onPointerLeave={handleRowGlowLeave}
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
                    className="fact-row stagger-item"
                    onPointerMove={handleRowGlowMove}
                    onPointerLeave={handleRowGlowLeave}
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

        {/* Scene 3: Services & Price (Counter-motion assembly + interactive service selector) */}
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

              <div className="price-list" role="list">
                {serviceItems.map((item, idx) => {
                  const isSelected = safeServiceIndex === idx;
                  const numLabel = String(idx + 1).padStart(2, '0');
                  return (
                    <div
                      key={item.name}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      className={`price-row counter-row ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedServiceIndex(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedServiceIndex(idx);
                        }
                      }}
                      onPointerEnter={(e) => {
                        if (e.pointerType === 'mouse') {
                          setSelectedServiceIndex(idx);
                        }
                      }}
                      onPointerMove={handleRowGlowMove}
                      onPointerLeave={handleRowGlowLeave}
                    >
                      <span className="price-index">{numLabel}</span>
                      <span className="price-name">{item.name}</span>
                      <span className="price-value">{item.price}</span>
                      <span className="draw-line price-hairline" aria-hidden="true" />
                    </div>
                  );
                })}
              </div>

              <div className="service-detail-bar stagger-item" aria-live="polite">
                <div className="service-detail-head">
                  <span className="service-detail-index">
                    {String(safeServiceIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="service-detail-title">{selectedService.name}</span>
                </div>
                <p className="service-detail-desc">{selectedService.desc}</p>
              </div>

              <div className="cta-row stagger-item">
                <a
                  href={config.contacts.telegramStudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Обсудить: {selectedService.name}
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

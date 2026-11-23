import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import * as THREE from 'three';
import ChainScene, { SCENE_CAMERA_PRESETS } from './components/ChainScene.jsx';

gsap.registerPlugin(Observer);

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
  return {
    chainOffset: 0,
    yShift: p.yShift,
    camX: p.cam[0],
    camY: p.cam[1],
    camZ: p.cam[2],
    lookX: p.look[0],
    lookY: p.look[1],
    lookZ: p.look[2],
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
  };
}

function formatRub(value) {
  return `${Number(value).toLocaleString('ru-RU')} ₽`;
}

export default function App() {
  const config = useMemo(() => window.SITE_CONFIG || DEFAULT_CONFIG, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedTier, setSelectedTier] = useState(
    config.certificates.tiers?.[2] || 10000
  );

  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const sceneRefs = useRef([]);
  const sceneStateRef = useRef(createInitialSceneState());
  const pointerRef = useRef({ x: 0, y: 0 });
  const tlRef = useRef(null);

  const animateIn = useCallback((el, startAt, tl) => {
    if (!el) return;
    const masks = el.querySelectorAll('.mask-inner');
    const lines = el.querySelectorAll('.draw-line');
    const items = el.querySelectorAll('.stagger-item');

    tl.set(el, { visibility: 'visible', pointerEvents: 'auto', zIndex: 20 }, startAt);
    if (masks.length) {
      tl.fromTo(
        masks,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.72, stagger: 0.08, ease: 'expo.out' },
        startAt
      );
    }
    if (lines.length) {
      tl.fromTo(
        lines,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.65, stagger: 0.06, ease: 'expo.out' },
        startAt + 0.08
      );
    }
    if (items.length) {
      tl.fromTo(
        items,
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.56, stagger: 0.07, ease: 'power3.out' },
        startAt + 0.12
      );
    }
  }, []);

  const goToScene = useCallback(
    (nextIndex) => {
      const target = Math.max(0, Math.min(SCENES.length - 1, nextIndex));
      const prev = activeIndexRef.current;
      if (target === prev || isTransitioningRef.current) return;

      isTransitioningRef.current = true;
      const direction = target > prev ? 1 : -1;
      const prevEl = sceneRefs.current[prev];
      const nextEl = sceneRefs.current[target];

      if (tlRef.current) tlRef.current.kill();

      const preset = SCENE_CAMERA_PRESETS[target];
      const k = new THREE.Color(preset.key);
      const r = new THREE.Color(preset.rim);
      const f = new THREE.Color(preset.fill);
      const e = new THREE.Color(preset.emissive);

      const tl = gsap.timeline({
        onComplete: () => {
          if (prevEl) {
            gsap.set(prevEl, { visibility: 'hidden', pointerEvents: 'none', zIndex: 10 });
          }
          isTransitioningRef.current = false;
        },
      });
      tlRef.current = tl;

      tl.to(
        sceneStateRef.current,
        {
          chainOffset: sceneStateRef.current.chainOffset + direction * 0.14,
          yShift: preset.yShift,
          camX: preset.cam[0],
          camY: preset.cam[1],
          camZ: preset.cam[2],
          lookX: preset.look[0],
          lookY: preset.look[1],
          lookZ: preset.look[2],
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
          duration: 1.15,
          ease: 'expo.inOut',
        },
        0
      );

      if (prevEl) {
        const prevMasks = prevEl.querySelectorAll('.mask-inner');
        const prevLines = prevEl.querySelectorAll('.draw-line');
        const prevItems = prevEl.querySelectorAll('.stagger-item');

        tl.set(prevEl, { pointerEvents: 'none' }, 0);
        if (prevItems.length) {
          tl.to(
            prevItems,
            { y: -28, opacity: 0, duration: 0.34, stagger: 0.03, ease: 'power3.in' },
            0
          );
        }
        if (prevMasks.length) {
          tl.to(
            prevMasks,
            { yPercent: -110, duration: 0.36, stagger: 0.03, ease: 'power3.in' },
            0.02
          );
        }
        if (prevLines.length) {
          tl.to(prevLines, { scaleX: 0, duration: 0.28, ease: 'power3.in' }, 0);
        }
        tl.set(prevEl, { visibility: 'hidden', zIndex: 10 }, 0.39);
      }

      activeIndexRef.current = target;
      setActiveIndex(target);

      animateIn(nextEl, 0.42, tl);
    },
    [animateIn]
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
        isTransitioningRef.current = false;
      },
    });
    isTransitioningRef.current = true;
    animateIn(sceneRefs.current[0], 0.12, introTl);
    tlRef.current = introTl;

    return () => {
      introTl.kill();
    };
  }, [animateIn]);

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
      <ChainScene sceneStateRef={sceneStateRef} pointerRef={pointerRef} />
      <div className="readability-scrim" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />

      <header className="site-header">
        <button
          type="button"
          className="brand-mark"
          onClick={() => goToScene(0)}
        >
          <span className="brand-rune" aria-hidden="true" />
          <span>{config.brand.shortName}</span>
        </button>

        <nav className="header-nav" aria-label="Навигация по сценам">
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              type="button"
              className={`nav-link ${activeIndex === idx ? 'is-active' : ''}`}
              onClick={() => goToScene(idx)}
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

      <aside className="chapter-rail" aria-label="Индикатор сцен">
        {SCENES.map((scene, idx) => (
          <button
            key={scene.id}
            type="button"
            className={`chapter-dot ${activeIndex === idx ? 'is-active' : ''}`}
            onClick={() => goToScene(idx)}
            aria-label={scene.label}
            title={scene.label}
          >
            <span className="chapter-tick" />
            <span className="chapter-label">{scene.label}</span>
          </button>
        ))}
      </aside>

      <main className="scenes-stack">
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
                  onClick={() => goToScene(3)}
                >
                  Смотреть прайс
                </button>
              </div>
            </div>

            <button
              type="button"
              className="scroll-cue stagger-item"
              onClick={() => goToScene(1)}
            >
              <span>{config.brand.scrollCue}</span>
              <span className="scroll-pulse" aria-hidden="true" />
            </button>
          </div>
        </section>

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
                  <div key={fact.index} className="fact-row stagger-item">
                    <span className="draw-line fact-hairline" aria-hidden="true" />
                    <span className="fact-index">{fact.index}</span>
                    <span className="fact-text">{fact.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
                  <div key={fact.index} className="fact-row stagger-item">
                    <span className="draw-line fact-hairline" aria-hidden="true" />
                    <span className="fact-index">{fact.index}</span>
                    <span className="fact-text">{fact.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
              <div className="eyebrow stagger-item">
                <span className="eyebrow-line draw-line" aria-hidden="true" />
                <span>{config.services.kicker}</span>
              </div>

              <h2 className="scene-title">
                {config.services.titleLines.map((line) => (
                  <span key={line} className="mask-line">
                    <span className="mask-inner">{line}</span>
                  </span>
                ))}
              </h2>

              <div className="price-list">
                {config.services.items.map((item) => (
                  <div key={item.name} className="price-row stagger-item">
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

        <section
          ref={(el) => {
            sceneRefs.current[4] = el;
          }}
          className="scene-layer"
          data-scene-id="contacts"
          aria-hidden={activeIndex !== 4}
        >
          <div className="scene-inner">
            <div className="editorial-column wide-col">
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
                {config.certificates.tiers.map((tier) => (
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
                  className="btn-primary"
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
          </div>
        </section>
      </main>
    </div>
  );
}

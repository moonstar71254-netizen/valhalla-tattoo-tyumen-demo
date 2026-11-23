import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'motion/react';
import ChainScene from './components/ChainScene.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ACTS = [
  { id: 'hero', label: 'Вход', target: 0.0, enter: [0.0, 0.0], exit: [0.20, 0.25] },
  { id: 'space', label: 'Пространство', target: 0.37, enter: [0.23, 0.28], exit: [0.48, 0.53] },
  { id: 'services', label: 'Услуги и прайс', target: 0.65, enter: [0.51, 0.56], exit: [0.76, 0.81] },
  { id: 'contacts', label: 'Сертификаты', target: 0.96, enter: [0.79, 0.84], exit: [1.0, 1.0] },
];

const DEFAULT_CONFIG = {
  brand: {
    name: 'Вальхалла тату',
    shortName: 'ВАЛЬХАЛЛА',
    eyebrow: 'Тюмень · ул. Достоевского, 7 · 5.0 на 2ГИС',
    tagline: 'Авторская тату-студия в Тюмени',
    description:
      'Художественная татуировка, крупные проекты и 8-часовые сеансы в пространстве скандинавской мифологии. Прием с 15:00 по записи.',
  },
  metrics: [
    { value: '5.0 ★', label: '237 отзывов (2ГИС)' },
    { value: 'от 4 000 ₽', label: 'Художественное тату' },
    { value: '0 ₽', label: 'Консультация' },
  ],
  space: {
    kicker: '01 / Пространство и подход',
    title: 'Студия как зал скандинавской мифологии',
    lead:
      'Совладельцы Марс и Ирина собрали пространство без потоковой спешки: внутри руны, статуэтки богов, музыкальные инструменты и вдумчивая работа над проектами.',
    pillars: [],
  },
  services: {
    kicker: '02 / Услуги и прайс',
    title: 'Направления работы',
    note: 'Точную стоимость и число сеансов рассчитываем на бесплатной консультации.',
    items: [],
  },
  certificates: {
    kicker: '03 / Сертификаты и контакты',
    title: 'Сертификаты, мерч и запись',
    description: 'Подарочные сертификаты от 1 500 до 100 000 ₽ и фирменный мерч студии.',
    tiers: [1500, 5000, 10000, 25000, 50000, 100000],
    merchNote: 'Мерч доступен в студии на Достоевского, 7 и под заказ в Telegram.',
  },
  contacts: {
    address: 'Тюмень, ул. Достоевского, 7, цокольный этаж (Калининский округ, 625000)',
    hours: 'С 15:00 по предварительной записи',
    telegramStudioUrl: 'https://t.me/Valhalla_tattoo72',
    telegramStudioLabel: '@Valhalla_tattoo72',
    telegramMarsUrl: 'https://t.me/marselwolf_tattoo',
    telegramMarsLabel: '@marselwolf_tattoo (Марс)',
    dgisUrl: 'https://2gis.ru/tyumen/firm/70000001039265379',
    vkUrl: 'https://vk.ru/valhalla_tattoo72',
  },
};

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function getActState(progress, act, index) {
  const [inStart, inEnd] = act.enter;
  const [outStart, outEnd] = act.exit;

  let opacity = 1;
  let scale = 1;

  if (index > 0 && progress < inEnd) {
    const t = clamp01((progress - inStart) / (inEnd - inStart || 1));
    opacity = t;
    scale = 1.04 - 0.04 * t;
  } else if (index < ACTS.length - 1 && progress > outStart) {
    const t = clamp01((progress - outStart) / (outEnd - outStart || 1));
    opacity = 1 - t;
    scale = 1 - 0.05 * t;
  }

  return { opacity, scale };
}

function getMoodForProgress(p) {
  if (p < 0.24) return 'hero';
  if (p < 0.52) return 'space';
  if (p < 0.80) return 'services';
  return 'contacts';
}

function formatRub(value) {
  return `${Number(value).toLocaleString('ru-RU')} ₽`;
}

export default function App() {
  const config = useMemo(() => window.SITE_CONFIG || DEFAULT_CONFIG, []);
  const [progress, setProgress] = useState(0);
  const [serviceTab, setServiceTab] = useState('tattoo');
  const [selectedTier, setSelectedTier] = useState(
    config.certificates.tiers?.[2] || 10000
  );

  const trackRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressRef = useRef(0);
  const lenisRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.35,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useGSAP(
    () => {
      const trigger = ScrollTrigger.create({
        trigger: trackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        ease: 'none',
        onUpdate: (self) => {
          const p = self.progress;
          progressRef.current = p;
          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${p})`;
          }
          setProgress(p);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: trackRef }
  );

  const scrollToProgress = useCallback((targetProgress) => {
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const y = Math.round(targetProgress * maxScroll);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(y, { duration: 1.05 });
    } else {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const mood = getMoodForProgress(progress);
  const actStates = ACTS.map((act, idx) => getActState(progress, act, idx));
  const activeIndex = actStates.reduce(
    (best, cur, idx) => (cur.opacity > actStates[best].opacity ? idx : best),
    0
  );

  const tattooServices = config.services.items.slice(0, 3);
  const extraServices = config.services.items.slice(3);
  const visibleServices = serviceTab === 'tattoo' ? tattooServices : extraServices;

  return (
    <div className="app-shell" data-mood={mood}>
      <div ref={trackRef} className="scroll-track" aria-hidden="true" />

      <div className="pinned-stage">
        <ChainScene progressRef={progressRef} />
        <div className="ambient-vignette" aria-hidden="true" />
        <div className="grain-layer" aria-hidden="true" />
        <div ref={progressBarRef} className="scroll-progress" aria-hidden="true" />

        <header className="site-header">
          <button
            type="button"
            className="brand-mark"
            onClick={() => scrollToProgress(ACTS[0].target)}
          >
            <span className="brand-rune" aria-hidden="true" />
            <span>{config.brand.shortName}</span>
          </button>

          <nav className="header-nav" aria-label="Навигация по главам">
            {ACTS.map((act, idx) => (
              <button
                key={act.id}
                type="button"
                className={`nav-link ${activeIndex === idx ? 'is-active' : ''}`}
                onClick={() => scrollToProgress(act.target)}
              >
                {act.label}
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

        <aside className="chapter-rail" aria-label="Индикатор глав">
          {ACTS.map((act, idx) => (
            <button
              key={act.id}
              type="button"
              className={`chapter-dot ${activeIndex === idx ? 'is-active' : ''}`}
              onClick={() => scrollToProgress(act.target)}
              aria-label={act.label}
              title={act.label}
            >
              <span className="chapter-tick" />
              <span className="chapter-label">{act.label}</span>
            </button>
          ))}
        </aside>

        <main className="acts-viewport">
          <section
            className="act-layer"
            data-act="hero"
            aria-hidden={actStates[0].opacity < 0.5}
            style={{
              opacity: actStates[0].opacity,
              transform: `scale(${actStates[0].scale})`,
              pointerEvents: actStates[0].opacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <div className="act-inner hero-inner">
              <div className="hero-stage">
                <div className="eyebrow">
                  <span className="eyebrow-line" aria-hidden="true" />
                  <span>{config.brand.eyebrow}</span>
                </div>

                <h1 className="hero-title">{config.brand.name}</h1>
                <p className="hero-subtitle">{config.brand.tagline}</p>
                <p className="hero-lead">{config.brand.description}</p>

                <div className="cta-row">
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
                    className="btn-secondary"
                    onClick={() => scrollToProgress(ACTS[2].target)}
                  >
                    Услуги и прайс
                  </button>
                </div>

                <div className="metrics-strip">
                  {config.metrics.map((item) => (
                    <div key={item.label} className="metric-item">
                      <div className="metric-value">{item.value}</div>
                      <div className="metric-label">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="scroll-hint"
                onClick={() => scrollToProgress(ACTS[1].target)}
              >
                <span>Листайте, чтобы войти</span>
                <span className="scroll-hint-bar" aria-hidden="true" />
              </button>
            </div>
          </section>

          <section
            className="act-layer"
            data-act="space"
            aria-hidden={actStates[1].opacity < 0.5}
            style={{
              opacity: actStates[1].opacity,
              transform: `scale(${actStates[1].scale})`,
              pointerEvents: actStates[1].opacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <div className="act-inner">
              <div className="section-header">
                <div className="eyebrow">
                  <span className="eyebrow-line" aria-hidden="true" />
                  <span>{config.space.kicker}</span>
                </div>
                <h2 className="section-title">{config.space.title}</h2>
                <p className="section-lead">{config.space.lead}</p>
              </div>

              <div className="pillars-grid">
                {config.space.pillars.map((pillar) => (
                  <article key={pillar.title} className="glass-panel">
                    <div className="pillar-index">{pillar.index}</div>
                    <h3 className="pillar-title">{pillar.title}</h3>
                    <p className="pillar-text">{pillar.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            className="act-layer"
            data-act="services"
            aria-hidden={actStates[2].opacity < 0.5}
            style={{
              opacity: actStates[2].opacity,
              transform: `scale(${actStates[2].scale})`,
              pointerEvents: actStates[2].opacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <div className="act-inner">
              <div className="services-head">
                <div className="section-header compact-header">
                  <div className="eyebrow">
                    <span className="eyebrow-line" aria-hidden="true" />
                    <span>{config.services.kicker}</span>
                  </div>
                  <h2 className="section-title">{config.services.title}</h2>
                  <p className="section-lead">{config.services.note}</p>
                </div>

                <div className="tabs-row" role="tablist" aria-label="Категории услуг">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={serviceTab === 'tattoo'}
                    className={`tab-btn ${serviceTab === 'tattoo' ? 'is-active' : ''}`}
                    onClick={() => setServiceTab('tattoo')}
                  >
                    Татуировка и проекты
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={serviceTab === 'extra'}
                    className={`tab-btn ${serviceTab === 'extra' ? 'is-active' : ''}`}
                    onClick={() => setServiceTab('extra')}
                  >
                    Удаление, пирсинг, консультация
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={serviceTab}
                  className="services-grid"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                >
                  {visibleServices.map((service) => (
                    <div key={service.name} className="service-card">
                      <div className="service-top">
                        <div className="service-name">{service.name}</div>
                        <div className="service-price">{service.price}</div>
                      </div>
                      <div className="service-detail">{service.detail}</div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              <div className="services-footer">
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
          </section>

          <section
            className="act-layer"
            data-act="contacts"
            aria-hidden={actStates[3].opacity < 0.5}
            style={{
              opacity: actStates[3].opacity,
              transform: `scale(${actStates[3].scale})`,
              pointerEvents: actStates[3].opacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <div className="act-inner">
              <div className="section-header compact-header">
                <div className="eyebrow">
                  <span className="eyebrow-line" aria-hidden="true" />
                  <span>{config.certificates.kicker}</span>
                </div>
                <h2 className="section-title">{config.certificates.title}</h2>
              </div>

              <div className="contacts-grid">
                <div className="glass-panel">
                  <div className="pillar-index">Подарочный сертификат</div>
                  <p className="pillar-text compact-mt">{config.certificates.description}</p>

                  <div className="tier-list" role="group" aria-label="Номинал сертификата">
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

                  <a
                    href={config.contacts.telegramStudioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Оформить на {formatRub(selectedTier)}
                  </a>
                  <p className="merch-note">{config.certificates.merchNote}</p>
                </div>

                <div className="glass-panel">
                  <div className="pillar-index">Контакты в Тюмени</div>
                  <div className="contact-list">
                    <div>
                      <div className="contact-block-label">Адрес</div>
                      <div className="contact-block-value">{config.contacts.address}</div>
                    </div>
                    <div>
                      <div className="contact-block-label">График</div>
                      <div className="contact-block-value">{config.contacts.hours}</div>
                    </div>
                    <div>
                      <div className="contact-block-label">Telegram</div>
                      <div className="contact-block-value">
                        {config.contacts.telegramStudioLabel} · {config.contacts.telegramMarsLabel}
                      </div>
                    </div>
                  </div>

                  <div className="contact-links">
                    <a
                      href={config.contacts.telegramStudioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-pill"
                    >
                      Telegram студии
                    </a>
                    <a
                      href={config.contacts.telegramMarsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-pill"
                    >
                      Telegram Марса
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
    </div>
  );
}

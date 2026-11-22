import React, { useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion } from 'motion/react';
import ChainScene from './components/ChainScene.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const DEFAULT_CONFIG = {
  brand: {
    name: 'Вальхалла тату',
    shortName: 'ВАЛЬХАЛЛА',
    cityPrepositional: 'в Тюмени',
    eyebrow: 'Тюмень · ул. Достоевского, 7 · 5.0 на 2ГИС',
    tagline: 'Авторская тату-студия в Тюмени',
    description:
      'Художественная татуировка, крупные проекты и 8-часовые сеансы в пространстве скандинавской мифологии. Работаем с 15:00 по предварительной записи.',
  },
  metrics: [
    { value: '5.0 ★', label: '237 отзывов и 278 оценок на 2ГИС' },
    { value: 'от 4 000 ₽', label: 'Художественная татуировка' },
    { value: '0 ₽', label: 'Консультация перед сеансом' },
  ],
  space: {
    kicker: '01 / Пространство и подход',
    title: 'Студия как зал скандинавской мифологии',
    lead:
      'Совладельцы Марс и Ирина собрали пространство без потоковой спешки: внутри руны, статуэтки богов, музыкальные инструменты и спокойный ритм работы над сложными проектами.',
    pillars: [],
  },
  services: {
    kicker: '02 / Услуги и прайс',
    title: 'Направления работы',
    note: '',
    items: [],
  },
  certificates: {
    kicker: '03 / Сертификаты и мерч',
    title: 'Подарочные сертификаты и фирменный мерч',
    description: '',
    tiers: [1500, 5000, 10000, 25000, 50000, 100000],
    merchNote: '',
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

const REVEAL_TRANSITION = {
  duration: 0.28,
  ease: [0.23, 1, 0.32, 1],
};

function formatRub(value) {
  return `${Number(value).toLocaleString('ru-RU')} ₽`;
}

export default function App() {
  const config = useMemo(() => window.SITE_CONFIG || DEFAULT_CONFIG, []);
  const [mood, setMood] = useState('hero');
  const [selectedTier, setSelectedTier] = useState(
    config.certificates.tiers?.[2] || 10000
  );

  const rootRef = useRef(null);
  const progressBarRef = useRef(null);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useGSAP(
    () => {
      const trigger = ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        ease: 'none',
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });

      const parallaxEls = gsap.utils.toArray('[data-parallax]');
      parallaxEls.forEach((el) => {
        const speed = Number(el.getAttribute('data-parallax')) || 24;
        gsap.fromTo(
          el,
          { y: speed },
          {
            y: -speed,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: rootRef }
  );

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]');
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const nextMood = entry.target.getAttribute('data-section');
            if (nextMood) setMood(nextMood);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="app-shell" data-mood={mood}>
      <ChainScene scrollRef={scrollProgressRef} mood={mood} />
      <div className="ambient-vignette" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />
      <div ref={progressBarRef} className="scroll-progress" aria-hidden="true" />

      <header className="site-header">
        <a href="#top" className="brand-mark">
          <span className="brand-rune" aria-hidden="true" />
          <span>{config.brand.shortName}</span>
        </a>

        <nav className="header-nav" aria-label="Навигация по разделам">
          <a href="#space">Пространство</a>
          <a href="#services">Услуги и прайс</a>
          <a href="#contacts">Сертификаты и контакты</a>
        </nav>

        <a
          href={config.contacts.telegramStudioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="header-cta"
        >
          Записаться в Telegram
        </a>
      </header>

      <main id="top" className="content-layer">
        <section className="section" data-section="hero">
          <div className="section-inner">
            <motion.div
              className="hero-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={REVEAL_TRANSITION}
            >
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
                <a href="#services" className="btn-secondary">
                  Смотреть услуги и прайс
                </a>
              </div>

              <div className="metrics-strip">
                {config.metrics.map((item) => (
                  <div key={item.label} className="metric-item">
                    <div className="metric-value">{item.value}</div>
                    <div className="metric-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="space" className="section" data-section="space">
          <div className="section-inner">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={REVEAL_TRANSITION}
            >
              <div className="eyebrow">
                <span className="eyebrow-line" aria-hidden="true" />
                <span>{config.space.kicker}</span>
              </div>
              <h2 className="section-title">{config.space.title}</h2>
              <p className="section-lead">{config.space.lead}</p>
            </motion.div>

            <div className="pillars-grid">
              {config.space.pillars.map((pillar, idx) => (
                <motion.article
                  key={pillar.title}
                  className="glass-panel"
                  data-parallax={14 + idx * 10}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={REVEAL_TRANSITION}
                >
                  <div className="pillar-index">{pillar.index}</div>
                  <h3 className="pillar-title">{pillar.title}</h3>
                  <p className="pillar-text">{pillar.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="section" data-section="services">
          <div className="section-inner">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={REVEAL_TRANSITION}
            >
              <div className="eyebrow">
                <span className="eyebrow-line" aria-hidden="true" />
                <span>{config.services.kicker}</span>
              </div>
              <h2 className="section-title">{config.services.title}</h2>
              <p className="section-lead">{config.services.note}</p>
            </motion.div>

            <div className="services-layout">
              {config.services.items.map((service) => (
                <motion.div
                  key={service.name}
                  className="service-row"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={REVEAL_TRANSITION}
                >
                  <div>
                    <div className="service-name">{service.name}</div>
                    <div className="service-detail">{service.detail}</div>
                  </div>
                  <div className="service-price">{service.price}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="contacts" className="section" data-section="contacts">
          <div className="section-inner">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={REVEAL_TRANSITION}
            >
              <div className="eyebrow">
                <span className="eyebrow-line" aria-hidden="true" />
                <span>{config.certificates.kicker}</span>
              </div>
              <h2 className="section-title">{config.certificates.title}</h2>
            </motion.div>

            <div className="contacts-grid">
              <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={REVEAL_TRANSITION}
              >
                <div className="pillar-index">Подарочный сертификат</div>
                <p className="pillar-text" style={{ marginTop: 12 }}>
                  {config.certificates.description}
                </p>

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
              </motion.div>

              <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={REVEAL_TRANSITION}
              >
                <div className="pillar-index">Контакты студии</div>

                <div className="contact-list">
                  <div>
                    <div className="contact-block-label">Адрес</div>
                    <div className="contact-block-value">{config.contacts.address}</div>
                  </div>
                  <div>
                    <div className="contact-block-label">График приема</div>
                    <div className="contact-block-value">{config.contacts.hours}</div>
                  </div>
                  <div>
                    <div className="contact-block-label">Прямая связь</div>
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
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>{config.brand.name} · {config.brand.tagline}</span>
        <span>{config.contacts.address}</span>
      </footer>
    </div>
  );
}

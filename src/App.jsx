import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { getSiteConfig } from './config.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import HallSection from './components/HallSection.jsx';
import ServicesLedger from './components/ServicesLedger.jsx';
import CraftSection from './components/CraftSection.jsx';
import MerchSection from './components/MerchSection.jsx';
import ReviewsBand from './components/ReviewsBand.jsx';
import ContactFooter from './components/ContactFooter.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TICKER_ITEMS = [
  'Художественная татуировка от 4 000 ₽',
  '8-часовые сеансы и рукава',
  'Перекрытие шрамов',
  'Лазерное удаление',
  'Пирсинг',
  'Собственный мерч',
  'Сертификаты 1 500–100 000 ₽',
  'Бесплатная консультация'
];

export default function App() {
  const rootRef = useRef(null);
  const config = useMemo(() => getSiteConfig(), []);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.4
    });

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const handleAnchorClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      event.preventDefault();
      lenis.scrollTo(targetEl, { offset: -64 });
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('[data-scroll-progress]', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true
          }
        });

        gsap.to('[data-hero-parallax]', {
          yPercent: 12,
          scale: 1.06,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });

        gsap.to('[data-ticker-track]', {
          xPercent: -14,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-ticker-band]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });

        gsap.utils.toArray('[data-parallax-img]').forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: {
                trigger: img.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
              }
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef}>
      <div className="grain-overlay" aria-hidden="true" />
      <div className="scroll-progress" data-scroll-progress aria-hidden="true" />

      <Header config={config} />

      <main>
        <Hero config={config} />

        <div className="ticker-band" data-ticker-band aria-hidden="true">
          <div className="ticker-track" data-ticker-track>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <span key={`${item}-${idx}`} className="ticker-item">
                <span>{item}</span>
                <span className="ticker-rune">ᛟ</span>
              </span>
            ))}
          </div>
        </div>

        <HallSection config={config} />
        <ServicesLedger config={config} />
        <CraftSection config={config} />
        <MerchSection config={config} />
        <ReviewsBand config={config} />
      </main>

      <ContactFooter config={config} />
    </div>
  );
}

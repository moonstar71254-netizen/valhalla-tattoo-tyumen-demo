import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

const EASE = [0.23, 1, 0.32, 1];

export default function Hero({ config }) {
  return (
    <section id="hero" className="hero">
      <div className="hero-media-wrap" aria-hidden="true">
        <img
          src={config.images.heroHall}
          alt={config.brand.name}
          className="hero-media"
          data-hero-parallax
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="hero-scrim" aria-hidden="true" />

      <div className="container hero-content">
        <motion.div
          className="hero-meta-bar"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <span>{config.brand.city}, {config.contacts.addressShort}</span>
          <span className="hero-meta-dot" aria-hidden="true" />
          <span>{config.contacts.schedule}</span>
          <span className="hero-meta-dot" aria-hidden="true" />
          <span>
            {config.rating.score} · {config.rating.reviewsCount} ({config.rating.platform})
          </span>
        </motion.div>

        <motion.h1
          className="display-title hero-heading"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06, ease: EASE }}
        >
          {config.brand.heroTitle}
        </motion.h1>

        <motion.div
          className="hero-bottom"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12, ease: EASE }}
        >
          <p className="body-lead">{config.brand.heroSubtitle}</p>

          <div className="hero-cta-group">
            <a
              href={config.contacts.telegramPrimary}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <span>Записаться в Telegram</span>
              <ArrowUpRight size={15} />
            </a>
            <a href="#services" className="btn btn-ghost">
              <span>Услуги и прайс</span>
              <ArrowDown size={15} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

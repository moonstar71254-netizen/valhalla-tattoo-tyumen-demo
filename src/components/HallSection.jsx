import React from 'react';
import { motion } from 'motion/react';

const EASE = [0.23, 1, 0.32, 1];

export default function HallSection({ config }) {
  return (
    <section id="hall" className="section">
      <div className="container hall-grid">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div className="eyebrow">{config.hall.eyebrow}</div>
          <h2 className="section-title">{config.hall.title}</h2>
          <p className="body-lead" style={{ marginTop: '24px' }}>
            {config.hall.lead}
          </p>

          <div className="hall-facts">
            {config.hall.facts.map((fact) => (
              <div key={fact.label} className="hall-fact-row">
                <span className="hall-fact-label">{fact.label}</span>
                <span className="hall-fact-value">{fact.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="parallax-frame"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div className="parallax-frame-wide" style={{ overflow: 'hidden' }}>
            <img
              src={config.images.studioLounge}
              alt="Зал ожидания и консультаций Вальхалла тату"
              className="parallax-img"
              data-parallax-img
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="frame-caption">
            <span>{config.brand.name} · Зал</span>
            <span>{config.contacts.addressShort}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

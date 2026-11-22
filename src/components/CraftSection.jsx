import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const EASE = [0.23, 1, 0.32, 1];

export default function CraftSection({ config }) {
  return (
    <section id="craft" className="section craft-section">
      <div className="container craft-grid">
        <motion.div
          className="parallax-frame"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div className="parallax-frame-portrait" style={{ overflow: 'hidden' }}>
            <img
              src={config.images.craftProcess}
              alt="Процесс художественной татуировки в студии Вальхалла"
              className="parallax-img"
              data-parallax-img
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="frame-caption">
            <span>Крупные проекты · 8 часов</span>
            <span>Авторская графика</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div className="eyebrow">{config.craft.eyebrow}</div>
          <h2 className="section-title">{config.craft.title}</h2>
          <p className="body-lead" style={{ marginTop: '24px' }}>
            {config.craft.text}
          </p>

          <ul className="craft-list">
            {config.craft.highlights.map((item) => (
              <li key={item}>
                <span className="craft-bullet" aria-hidden="true">
                  ✦
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="craft-actions">
            <a
              href={config.contacts.telegramPrimary}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <span>Запись в студию</span>
              <ArrowUpRight size={15} />
            </a>
            <a
              href={config.contacts.telegramMars}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <span>Написать Марсу</span>
              <ArrowUpRight size={15} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

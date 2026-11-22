import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const EASE = [0.23, 1, 0.32, 1];

export default function ReviewsBand({ config }) {
  return (
    <section id="reviews" className="section reviews-band">
      <div className="container reviews-layout">
        <motion.div
          className="score-monolith"
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div className="eyebrow">Репутация в {config.brand.city}</div>
          <div className="score-value">{config.rating.score}</div>
          <div className="score-meta">
            {config.rating.votesCount} · {config.rating.reviewsCount} на {config.rating.platform}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.28, delay: 0.05, ease: EASE }}
        >
          <div className="eyebrow">Открытые площадки</div>
          <h2 className="section-title">Живые отзывы и свежие работы</h2>
          <p className="body-lead" style={{ marginTop: '20px' }}>
            Ознакомьтесь с реальными отзывами гостей в карточке {config.rating.platform} и
            посмотрите актуальные зажившие работы и эскизы в сообществе ВКонтакте.
          </p>

          <div className="source-links">
            <a
              href={config.contacts.twoGis}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <span>Читать {config.rating.reviewsCount} на {config.rating.platform}</span>
              <ArrowUpRight size={15} />
            </a>
            <a
              href={config.contacts.vk}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <span>Работы во ВКонтакте</span>
              <ArrowUpRight size={15} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

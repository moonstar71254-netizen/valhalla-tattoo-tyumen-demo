import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const EASE = [0.23, 1, 0.32, 1];

export default function ContactFooter({ config }) {
  return (
    <footer id="contacts" className="contact-footer">
      <div className="container">
        <div className="contact-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="eyebrow">Запись на консультацию</div>
            <h2 className="section-title">Начните проект с бесплатной консультации</h2>
            <p className="body-lead" style={{ marginTop: '20px', maxWidth: '48ch' }}>
              Пришлите идею, референсы или фото участка кожи в Telegram — поможем
              определиться с композицией, длительностью сеанса и стоимостью.
            </p>

            <div className="source-links">
              <a
                href={config.contacts.telegramPrimary}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <span>Записаться ({config.contacts.telegramPrimaryLabel})</span>
                <ArrowUpRight size={15} />
              </a>
              <a
                href={config.contacts.telegramMars}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                <span>Марс ({config.contacts.telegramMarsLabel})</span>
                <ArrowUpRight size={15} />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="contact-details"
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.28, delay: 0.05, ease: EASE }}
          >
            <div className="contact-row">
              <div className="contact-row-label">Адрес студии</div>
              <div className="contact-row-value">{config.contacts.addressFull}</div>
            </div>

            <div className="contact-row">
              <div className="contact-row-label">График работы</div>
              <div className="contact-row-value">{config.contacts.schedule}</div>
            </div>

            <div className="contact-row">
              <div className="contact-row-label">Карта и отзывы</div>
              <div className="contact-row-value">
                <a
                  href={config.contacts.twoGis}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <span>Открыть в 2ГИС ({config.rating.score} · {config.rating.reviewsCount})</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>

            <div className="contact-row">
              <div className="contact-row-label">Сообщество</div>
              <div className="contact-row-value">
                <a
                  href={config.contacts.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <span>ВКонтакте — valhalla_tattoo72</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="footer-bottom">
          <span>{config.brand.name} · {config.brand.city}</span>
          <span>{config.contacts.schedule}</span>
        </div>
      </div>
    </footer>
  );
}

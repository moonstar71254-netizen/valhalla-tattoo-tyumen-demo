import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, ArrowUpRight } from 'lucide-react';

const EASE = [0.23, 1, 0.32, 1];

export default function ServicesLedger({ config }) {
  const [openId, setOpenId] = useState(config.services[0]?.id || null);

  return (
    <section id="services" className="section">
      <div className="container">
        <motion.div
          className="services-header"
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div>
            <div className="eyebrow">Услуги и стоимость</div>
            <h2 className="section-title">Направления работы студии</h2>
          </div>
          <p className="body-lead">
            Точная стоимость крупного проекта рассчитывается на бесплатной консультации —
            после обсуждения идеи, размера и детализации.
          </p>
        </motion.div>

        <div className="ledger" role="list">
          {config.services.map((service) => {
            const isOpen = openId === service.id;
            return (
              <div key={service.id} className="ledger-row" role="listitem">
                <button
                  type="button"
                  className="ledger-trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : service.id)}
                >
                  <span className="ledger-index">{service.index}</span>
                  <span className="ledger-title">{service.title}</span>
                  <span className="ledger-duration">{service.duration}</span>
                  <span className="ledger-price">{service.price}</span>
                  <span className={`ledger-icon ${isOpen ? 'open' : ''}`} aria-hidden="true">
                    <Plus size={18} strokeWidth={1.5} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="ledger-panel"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.24, ease: EASE }}
                    >
                      <div className="ledger-panel-inner">
                        <p className="ledger-desc">{service.description}</p>
                        <a
                          href={config.contacts.telegramPrimary}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost"
                        >
                          <span>Обсудить в Telegram</span>
                          <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

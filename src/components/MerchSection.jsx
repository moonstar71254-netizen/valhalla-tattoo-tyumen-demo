import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const EASE = [0.23, 1, 0.32, 1];
const CERT_AMOUNTS = ['1 500 ₽', '5 000 ₽', '10 000 ₽', '25 000 ₽', 'до 100 000 ₽'];

export default function MerchSection({ config }) {
  const [selectedCert, setSelectedCert] = useState(CERT_AMOUNTS[2]);

  return (
    <section id="merch" className="section">
      <div className="container merch-grid">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div className="eyebrow">{config.merch.eyebrow}</div>
          <h2 className="section-title">{config.merch.title}</h2>
          <p className="body-lead" style={{ marginTop: '24px' }}>
            {config.merch.text}
          </p>

          <div className="certificate-pills" role="group" aria-label="Номиналы подарочных сертификатов">
            {CERT_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`cert-pill ${selectedCert === amount ? 'active' : ''}`}
                onClick={() => setSelectedCert(amount)}
              >
                {amount}
              </button>
            ))}
          </div>

          <a
            href={config.contacts.telegramPrimary}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <span>Уточнить мерч и сертификат ({selectedCert})</span>
            <ArrowUpRight size={15} />
          </a>
        </motion.div>

        <motion.div
          className="parallax-frame"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div className="parallax-frame-merch" style={{ overflow: 'hidden' }}>
            <img
              src={config.images.merchArtifacts}
              alt="Фирменный мерч и скандинавские детали студии Вальхалла тату"
              className="parallax-img"
              data-parallax-img
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="frame-caption">
            <span>Собственный мерч</span>
            <span>Сертификаты 1 500–100 000 ₽</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

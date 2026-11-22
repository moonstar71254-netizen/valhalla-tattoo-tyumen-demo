import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X, ArrowUpRight, Star } from 'lucide-react';

const EASE = [0.23, 1, 0.32, 1];

const NAV_ITEMS = [
  { href: '#hall', label: 'Зал' },
  { href: '#services', label: 'Услуги и прайс' },
  { href: '#craft', label: 'Сеансы' },
  { href: '#merch', label: 'Мерч' },
  { href: '#contacts', label: 'Контакты' }
];

export default function Header({ config }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#hero" className="brand-mark" aria-label={config.brand.name}>
            <span>{config.brand.shortName}</span>
            <span className="brand-mark-sub">{config.brand.city}</span>
          </a>

          <nav className="nav-links" aria-label="Навигация по разделам">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a
              href={config.contacts.twoGis}
              target="_blank"
              rel="noopener noreferrer"
              className="rating-chip"
              title="Открыть отзывы на 2ГИС"
            >
              <Star size={13} strokeWidth={1.8} color="#c49b66" fill="#c49b66" />
              <strong>{config.rating.score}</strong>
              <span>{config.rating.platform}</span>
            </a>

            <a
              href={config.contacts.telegramPrimary}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary header-cta"
            >
              <span>Записаться</span>
              <ArrowUpRight size={14} />
            </a>

            <button
              type="button"
              className="menu-toggle"
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            <nav className="mobile-nav-list" aria-label="Мобильное меню">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div>
              <a
                href={config.contacts.telegramPrimary}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <span>Записаться в Telegram</span>
                <ArrowUpRight size={15} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

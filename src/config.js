export function getSiteConfig() {
  const cfg = typeof window !== 'undefined' && window.SITE_CONFIG ? window.SITE_CONFIG : {};
  return {
    brand: {
      name: 'Вальхалла тату',
      shortName: 'Вальхалла',
      city: 'Тюмень',
      tagline: 'Авторская тату-студия и зал скандинавской эстетики',
      heroTitle: 'Искусство на коже в зале северных легенд',
      heroSubtitle:
        'Художественная татуировка, масштабные проекты и 8-часовые сеансы в пространстве, оформленном как музей скандинавской мифологии.',
      ...(cfg.brand || {})
    },
    contacts: {
      telegramPrimary: 'https://t.me/Valhalla_tattoo72',
      telegramPrimaryLabel: '@Valhalla_tattoo72',
      telegramMars: 'https://t.me/marselwolf_tattoo',
      telegramMarsLabel: '@marselwolf_tattoo',
      vk: 'https://vk.ru/valhalla_tattoo72',
      twoGis: 'https://2gis.ru/tyumen/firm/70000001039265379',
      addressShort: 'ул. Достоевского, 7',
      addressFull: 'Тюмень, ул. Достоевского, 7, цокольный этаж, Калининский округ, 625000',
      schedule: 'С 15:00 по предварительной записи',
      ...(cfg.contacts || {})
    },
    rating: {
      score: '5.0',
      votesCount: '278 оценок',
      reviewsCount: '237 отзывов',
      platform: '2ГИС',
      ...(cfg.rating || {})
    },
    images: {
      heroHall: './images/hero-hall.jpg',
      studioLounge: './images/studio-lounge.jpg',
      craftProcess: './images/craft-blackwork.jpg',
      merchArtifacts: './images/artifacts-merch.jpg',
      ...(cfg.images || {})
    },
    hall: {
      eyebrow: 'Пространство студии',
      title: 'Интерьер как музей скандинавской мифологии',
      lead: '',
      facts: [],
      ...(cfg.hall || {})
    },
    services: Array.isArray(cfg.services) ? cfg.services : [],
    craft: {
      eyebrow: 'Подход и забота',
      title: 'Марс и Ирина: длительный сеанс без спешки',
      text: '',
      highlights: [],
      ...(cfg.craft || {})
    },
    merch: {
      eyebrow: 'Мерч и сертификаты',
      title: 'Собственный мерч с характером Вальхаллы',
      text: '',
      ...(cfg.merch || {})
    }
  };
}

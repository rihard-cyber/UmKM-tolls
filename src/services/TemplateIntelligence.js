const HOOK_TEMPLATES = {
  question: [
    'Kamu tahu nggak sih {topic} yang bikin {audience} langsung {benefit}?',
    'Apa yang terjadi kalau {topic} kamu ternyata {result}?',
    'Sudah tahu {topic} yang {benefit} ini?',
  ],
  statistic: [
    '{percent}% orang gagal {action} karena {reason}',
    'Dalam {time}, {topic} bisa {benefit} — ini caranya',
  ],
  curiosity: [
    'Ini dia {topic} yang {audience} tunggu-tunggu',
    'Kebanyakan orang nggak tahu {topic} ini — sampai sekarang',
    'Stop {bad_action} kalau kamu mau {benefit}',
  ],
  bold: [
    'Ini {topic} TERBAIK yang pernah saya coba',
    'Jangan mulai {action} sebelum nonton ini!',
    'Kesalahan #{number} yang bikin {topic} kamu gagal',
  ],
};

const CAPTION_TEMPLATES = {
  review: {
    indonesia: [
      'Hari ini aku cobain {product} yang lagi viral di {platform}!\n\nHasilnya? {result}\n\nYang aku suka:\n✅ {pro1}\n✅ {pro2}\n\nKurangnya:\n❌ {con1}\n\n{cta}\n\n{hashtags}',
      'Review jujur: {product} setelah {duration} pemakaian.\n\n{result}\n\n{cta}\n\n{hashtags}',
    ],
    english: [
      'Testing out {product} — here\'s my honest review!\n\nPros:\n✅ {pro1}\n✅ {pro2}\n\nCons:\n❌ {con1}\n\n{cta}\n\n{hashtags}',
    ],
  },
  tutorial: {
    indonesia: [
      'Cara {action} dalam {steps} langkah mudah:\n\n{step1}\n{step2}\n{step3}\n\nSimak videonya sampai habis ya!\n\n{cta}\n\n{hashtags}',
      'Tutorial {topic} untuk pemula:\n\n{step1}\n{step2}\n{step3}\n\n{cta}\n\n{hashtags}',
    ],
    english: [
      'How to {action} in just {steps} simple steps:\n\n{step1}\n{step2}\n{step3}\n\n{cta}\n\n{hashtags}',
    ],
  },
  promo: {
    indonesia: [
      'PROMO TERBATAS! 🚀\n\n{product} sekarang cuma {price}\n\nApa yang kamu dapat:\n✅ {benefit1}\n✅ {benefit2}\n✅ {benefit3}\n\n{cta}\n\n{hashtags}',
      'FLASH SALE! ⚡\n\nHarga spesial {product} hanya {price}\n\nJangan sampai kehabisan!\n\n{cta}\n\n{hashtags}',
    ],
    english: [
      'LIMITED OFFER! 🚀\n\nGet {product} for only {price}\n\nWhat you get:\n✅ {benefit1}\n✅ {benefit2}\n\n{cta}\n\n{hashtags}',
    ],
  },
  personal: {
    indonesia: [
      'Hari ini aku mau cerita tentang {topic}.\n\n{story}\n\nPesan buat kamu: {message}\n\n{cta}\n\n{hashtags}',
      'Ini pengalaman pribadi aku dengan {topic}.\n\n{story}\n\nKalau kamu pernah ngerasain ini, komen di bawah ya! 👇\n\n{cta}\n\n{hashtags}',
    ],
    english: [
      'Let me share my personal experience with {topic}.\n\n{story}\n\nMy advice: {message}\n\n{cta}\n\n{hashtags}',
    ],
  },
  educational: {
    indonesia: [
      '{fact} — ini yang perlu kamu tahu tentang {topic}\n\n{explanation}\n\n{tip}\n\n{cta}\n\n{hashtags}',
      'Mitos atau fakta? 🤔\n\n{myth}\n\nFaktanya: {fact}\n\n{cta}\n\n{hashtags}',
    ],
    english: [
      '{fact} — here\'s what you need to know about {topic}\n\n{explanation}\n\n{tip}\n\n{cta}\n\n{hashtags}',
    ],
  },
};

const HASHTAG_SETS = {
  umum: ['#fyp', '#viral', '#trending', '#indonesia'],
  skincare: ['#skincare', '#skincareindonesia', '#skincareroutine', '#kecantikan'],
  kuliner: ['#kuliner', '#makanan', '#foodie', '#indonesiafood'],
  fashion: ['#fashion', '#style', '#ootd', '#fashionindonesia'],
  travel: ['#travel', '#wisata', '#liburan', '#exploreindonesia'],
  teknologi: ['#teknologi', '#gadget', '#techindonesia', '#review'],
  edukasi: ['#edukasi', '#belajar', '#tips', '#knowledge'],
  bisnis: ['#bisnis', '#usaha', '#entrepreneur', '#marketing'],
  gaming: ['#gaming', '#game', '#mlbb', '#freefire'],
  olahraga: ['#fitnes', '#gym', '#olahraga', '#workout'],
};

const CTA_TEMPLATES = [
  'Follow @{username} untuk konten {topic} setiap hari!',
  'Jangan lupa like, comment, dan share! 🔥',
  'Komen di bawah, mana yang paling relate buat kamu? 👇',
  'Tag teman kamu yang perlu lihat ini!',
  'Simak video selengkapnya di atas! 👆',
  'Subscribe untuk tips {topic} setiap minggu!',
  'Share ke 3 teman kamu kalau ini bermanfaat!',
  'Save dulu, praktekkan nanti! 📌',
];

function fillTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] !== undefined ? vars[key] : `{${key}}`);
}

function getHooks(tone, topic, vars = {}) {
  const pool = HOOK_TEMPLATES[tone] || HOOK_TEMPLATES.curiosity;
  return pool.map(t => fillTemplate(t, { topic, audience: vars.audience || 'kamu', benefit: vars.benefit || 'hasil maksimal', result: vars.result || 'luar biasa', action: vars.action || topic, reason: vars.reason || 'nggak tahu caranya', time: vars.time || 'seminggu', bad_action: vars.bad_action || 'lakukan ini', number: vars.number || '1', ...vars }));
}

function getCaption(niche, tone = 'kasual', lang = 'indonesia', vars = {}) {
  const templates = CAPTION_TEMPLATES[niche];
  if (!templates) return getCaption('review', tone, lang, vars);
  const langTemplates = templates[lang] || templates.indonesia;
  if (!langTemplates || langTemplates.length === 0) return getCaption('review', tone, lang, vars);
  return langTemplates.map(t => fillTemplate(t, vars));
}

function getHashtags(niche, count = 8) {
  const base = HASHTAG_SETS[niche] || HASHTAG_SETS.umum;
  const extra = HASHTAG_SETS.umum;
  const combined = [...new Set([...base, ...extra])];
  return combined.slice(0, count);
}

function getCTA(ctaText, username, topic) {
  if (ctaText) return ctaText;
  const vars = { username: username || 'clipperai', topic: topic || 'menarik' };
  return fillTemplate(CTA_TEMPLATES[Math.floor(Math.random() * CTA_TEMPLATES.length)], vars);
}

function buildFromTemplate({ niche, tone, lang, audience, ctaText, username, hashtagCount, ...vars }) {
  const hooks = getHooks(tone, vars.topic || '', vars);
  const captions = getCaption(niche, tone, lang, vars);
  const hashtags = getHashtags(niche, hashtagCount || 8);
  const cta = getCTA(ctaText, username, vars.topic);
  return { hooks: hooks.slice(0, 5), captions: captions.slice(0, 3), hashtags, cta };
}

function enhanceWithAI(caption) {
  return { original: caption, revised: caption, premium: false, message: 'Gunakan AI premium untuk variasi unik dan gaya storytelling.' };
}

export const TemplateIntelligence = {
  getHooks, getCaption, getHashtags, getCTA, buildFromTemplate, enhanceWithAI,
  HOOK_TEMPLATES, CAPTION_TEMPLATES, HASHTAG_SETS, CTA_TEMPLATES,
};

const WEIGHTS = {
  hookInFirst3s: 0.20,
  idealDuration: 0.10,
  noLongSilence: 0.10,
  highEnergy: 0.10,
  questionOrOpinion: 0.15,
  trendingKeywords: 0.10,
  subtitleReadable: 0.10,
  hasCTA: 0.05,
  historicalRetention: 0.10,
};

const PLATFORM_CONFIG = {
  tiktok: { idealDuration: [15, 60], maxDuration: 180, weightBonus: 1.1 },
  reels: { idealDuration: [15, 60], maxDuration: 90, weightBonus: 1.05 },
  shorts: { idealDuration: [15, 60], maxDuration: 60, weightBonus: 1.05 },
  youtube: { idealDuration: [480, 1200], maxDuration: 3600, weightBonus: 0.9 },
  instagram: { idealDuration: [15, 60], maxDuration: 120, weightBonus: 1.0 },
};

const TRENDING_KEYWORDS_ID = [
  'viral', 'trending', 'fyp', 'tips', 'tutorial', 'review', 'baru', 'rekomendasi',
  'pemula', 'rahasia', 'cara', 'ubah', 'ubah hidup', 'menit', 'detik', 'gampang',
  'wajib', 'tonton', 'shock', 'hasil', 'test', 'coba', 'murah', 'dijamin',
];

const QUESTION_MARKERS = ['apa', 'bagaimana', 'kenapa', 'siapa', 'kapan', 'dimana', 'berapa', 'apa itu', 'how', 'why', 'what', 'tip', 'tricks'];

function scoreHook(text, duration) {
  if (!text) return 0;
  const first30 = text.slice(0, 200).toLowerCase();
  const hasHookWord = QUESTION_MARKERS.some(q => first30.includes(q));
  const firstFewWords = first30.split(/\s+/).slice(0, 10).join(' ');
  const hookImpact = hasHookWord ? 1 : 0.3;
  const engagementBait = ['ini', 'ini dia', 'cek', 'lihat', 'watch', 'jangan', 'stop'].some(w => firstFewWords.includes(w));
  return hookImpact * 0.8 + (engagementBait ? 0.2 : 0);
}

function scoreDuration(durationSec, platform) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.tiktok;
  const [idealMin, idealMax] = config.idealDuration;
  if (durationSec >= idealMin && durationSec <= idealMax) return 1;
  if (durationSec < idealMin * 0.5 || durationSec > idealMax * 1.5) return 0.2;
  return 0.6;
}

function scoreSilence(segments) {
  if (!segments || segments.length === 0) return 0.5;
  const totalSilence = segments.reduce((s, seg) => s + (seg.silenceDuration || 0), 0);
  const totalDuration = segments[segments.length - 1]?.end || 1;
  const silenceRatio = totalSilence / totalDuration;
  if (silenceRatio < 0.05) return 1;
  if (silenceRatio < 0.15) return 0.7;
  if (silenceRatio < 0.3) return 0.4;
  return 0.1;
}

function scoreEnergy(audioFeatures) {
  if (!audioFeatures) return 0.5;
  const { rms, zeroCrossingRate, spectralCentroid } = audioFeatures;
  let score = 0.5;
  if (rms > 0.1) score += 0.2;
  if (zeroCrossingRate > 0.1) score += 0.15;
  if (spectralCentroid > 2000) score += 0.15;
  return Math.min(score, 1);
}

function scoreQuestionOrOpinion(transcript) {
  if (!transcript) return 0.3;
  const text = transcript.toLowerCase();
  const hasQuestion = QUESTION_MARKERS.some(q => text.includes(q));
  const hasOpinion = ['saya rasa', 'menurut', 'recommended', 'best', 'worst', 'lebih baik', 'harus'].some(w => text.includes(w));
  return (hasQuestion ? 0.5 : 0.2) + (hasOpinion ? 0.5 : 0.1);
}

function scoreTrendingKeywords(transcript, niche) {
  if (!transcript) return 0.3;
  const text = transcript.toLowerCase();
  const matches = TRENDING_KEYWORDS_ID.filter(k => text.includes(k)).length;
  const nicheKeywords = getNicheKeywords(niche);
  const nicheMatches = nicheKeywords.filter(k => text.includes(k)).length;
  return Math.min(0.5 + matches * 0.05 + nicheMatches * 0.05, 1);
}

function scoreSubtitle(style) {
  if (!style) return 0.6;
  const readableStyles = ['default', 'minimal', 'bold', 'cinematic'];
  return readableStyles.includes(style) ? 0.9 : 0.6;
}

function scoreCTA(hasCTA) {
  return hasCTA ? 1 : 0;
}

function scoreHistorical(historicalData) {
  if (!historicalData) return 0.5;
  const { avgRetention, avgCompletionRate } = historicalData;
  return (avgRetention || 0.5) * 0.6 + (avgCompletionRate || 0.5) * 0.4;
}

function getNicheKeywords(niche) {
  const keywords = {
    skincare: ['skincare', 'wajah', 'jerawat', 'glowing', 'review skincare', 'produk kecantikan'],
    kuliner: ['makanan', 'resep', 'masak', 'enak', 'street food', 'review makanan'],
    fashion: ['fashion', 'style', 'outfit', 'oop', 'lookbook', 'trend fashion'],
    travel: ['travel', 'liburan', 'tips travel', 'destinasi', 'wisata'],
    teknologi: ['teknologi', 'gadget', 'review', 'hp', 'apps', 'tips teknologi'],
    edukasi: ['belajar', 'tips', 'tutorial', 'panduan', 'edukasi', 'pelajaran'],
    bisnis: ['bisnis', 'usaha', 'tips bisnis', 'entrepreneur', 'marketing', 'startup'],
    gaming: ['game', 'gaming', 'gameplay', 'tips game', 'ml', 'pubg', 'freefire'],
    olahraga: ['olahraga', 'fitnes', 'gym', 'workout', 'tips fitnes', 'sehat'],
  };
  return keywords[niche] || [];
}

export function calculateViralScore({ duration, platform, transcript, audioFeatures, segments, subtitleStyle, hasCTA, niche, historicalData, text }) {
  const scores = {
    hook: scoreHook(text || transcript, duration),
    duration: scoreDuration(duration || 30, platform),
    silence: scoreSilence(segments),
    energy: scoreEnergy(audioFeatures),
    questionOpinion: scoreQuestionOrOpinion(transcript),
    trendingKeywords: scoreTrendingKeywords(transcript, niche),
    subtitle: scoreSubtitle(subtitleStyle),
    cta: scoreCTA(hasCTA),
    historical: scoreHistorical(historicalData),
  };

  const raw = Object.entries(scores).reduce((total, [key, val]) => total + val * (WEIGHTS[key] || 0), 0);
  const platformBonus = (PLATFORM_CONFIG[platform]?.weightBonus || 1);
  const final = Math.round(Math.min(raw * platformBonus * 100, 100));

  return { score: final, breakdown: scores, weights: WEIGHTS };
}

export function classifyViralPotential(score) {
  if (score >= 85) return { tier: '🔥 Viral', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (score >= 70) return { tier: '💥 High Potential', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (score >= 50) return { tier: '📈 Moderate', color: 'text-amber-600', bg: 'bg-amber-50' };
  return { tier: '📉 Low', color: 'text-slate-500', bg: 'bg-slate-50' };
}

export const ViralScore = { calculateViralScore, classifyViralPotential };

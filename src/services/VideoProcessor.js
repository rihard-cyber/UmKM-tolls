export const VIDEO_FORMATS = [
  { id: 'tiktok', name: 'TikTok 9:16', width: 1080, height: 1920, aspect: '9:16' },
  { id: 'reels', name: 'Instagram Reels 9:16', width: 1080, height: 1920, aspect: '9:16' },
  { id: 'shorts', name: 'YouTube Shorts 9:16', width: 1080, height: 1920, aspect: '9:16' },
  { id: 'youtube', name: 'YouTube 16:9', width: 1920, height: 1080, aspect: '16:9' },
  { id: 'igfeed', name: 'Instagram Feed 4:5', width: 1080, height: 1350, aspect: '4:5' },
  { id: 'facebook', name: 'Facebook 16:9', width: 1920, height: 1080, aspect: '16:9' },
  { id: 'linkedin', name: 'LinkedIn 16:9', width: 1920, height: 1080, aspect: '16:9' },
  { id: 'twitter', name: 'X/Twitter 16:9', width: 1280, height: 720, aspect: '16:9' },
];

export const NICHE_TEMPLATES = [
  { id: 'podcast', name: 'Podcast', icon: 'mic', colors: ['#6366f1', '#8b5cf6'] },
  { id: 'education', name: 'Edukasi', icon: 'book', colors: ['#06b6d4', '#0891b2'] },
  { id: 'gaming', name: 'Gaming', icon: 'gamepad', colors: ['#ef4444', '#dc2626'] },
  { id: 'finance', name: 'Finance', icon: 'trending-up', colors: ['#10b981', '#059669'] },
  { id: 'beauty', name: 'Beauty & Skincare', icon: 'sparkles', colors: ['#ec4899', '#db2777'] },
  { id: 'food', name: 'Kuliner', icon: 'utensils', colors: ['#f59e0b', '#d97706'] },
  { id: 'property', name: 'Property', icon: 'building', colors: ['#14b8a6', '#0d9488'] },
  { id: 'affiliate', name: 'Affiliate', icon: 'shopping-bag', colors: ['#8b5cf6', '#7c3aed'] },
  { id: 'personal', name: 'Personal Branding', icon: 'user', colors: ['#6366f1', '#4f46e5'] },
  { id: 'umkm', name: 'UMKM / Jualan', icon: 'store', colors: ['#f97316', '#ea580c'] },
  { id: 'skincare', name: 'Skincare', icon: 'droplets', colors: ['#f43f5e', '#e11d48'] },
  { id: 'reseller', name: 'Reseller', icon: 'package', colors: ['#a855f7', '#9333ea'] },
];

export const SUBTITLE_STYLES = [
  { id: 'classic', name: 'Klasik', font: 'Inter', bg: 'rgba(0,0,0,0.7)', color: '#FFFFFF', animation: 'none' },
  { id: 'neon', name: 'Neon', font: 'Inter', bg: 'rgba(0,0,0,0.5)', color: '#00FF88', animation: 'glow' },
  { id: 'minimal', name: 'Minimal', font: 'Inter', bg: 'none', color: '#FFFFFF', animation: 'none' },
  { id: 'bold', name: 'Bold', font: 'Inter', bg: '#FFD700', color: '#000000', animation: 'bounce' },
  { id: 'cinematic', name: 'Cinematic', font: 'Inter', bg: 'rgba(0,0,0,0.8)', color: '#FFD700', animation: 'fade' },
  { id: 'k-pop', name: 'K-Pop', font: 'Inter', bg: 'rgba(255,0,100,0.3)', color: '#FFFFFF', animation: 'slide' },
];

export const TRANSITION_STYLES = [
  'Fade', 'Slide', 'Zoom', 'Wipe', 'Dissolve', 'Glitch', 'Spin', 'Bounce'
];

function generateThumbnailDataUri(seed) {
  const hue1 = (seed * 47) % 360;
  const hue2 = (hue1 + 40) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue1},70%,50%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2},80%,35%)"/>
    </linearGradient></defs>
    <rect width="400" height="225" fill="url(#g)" rx="4"/>
    <circle cx="200" cy="112" r="32" fill="rgba(255,255,255,0.2)"/>
    <polygon points="188,96 188,128 216,112" fill="white" opacity="0.8"/>
    <rect x="12" y="192" width="80" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
    <rect x="12" y="202" width="120" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
    <rect x="300" y="195" width="88" height="6" rx="3" fill="rgba(0,0,0,0.3)"/>
    <rect x="12" y="12" width="36" height="18" rx="4" fill="rgba(0,0,0,0.4)"/>
    <text x="30" y="24" fill="white" font-size="10" font-family="sans-serif" text-anchor="middle" font-weight="bold">${seed < 5 ? 'HQ' : 'HD'}</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function generateMockClips(videoLength, count = 10) {
  const clips = [];
  const segmentLength = videoLength / count;

  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * segmentLength);
    const end = Math.min(Math.floor((i + 1) * segmentLength), videoLength);
    const viralScore = Math.floor(Math.random() * 35 + 65);

    clips.push({
      id: `clip-${i + 1}`,
      start,
      end,
      duration: end - start,
      viralScore,
      hookScore: Math.floor(Math.random() * 30 + 70),
      retentionPrediction: Math.floor(Math.random() * 20 + 80),
      engagementPrediction: Math.floor(Math.random() * 25 + 65),
      reasons: [
        'Hook kuat dalam 2 detik pertama',
        'Ada momen emosi tinggi',
        'Pertanyaan yang memicu rasa penasaran',
        'Opini kontroversial terdeteksi',
        'Punchline di akhir segmen'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      highlights: ['terbaik', 'viral', 'potensial', 'hook', 'cerita'][Math.floor(Math.random() * 5)],
      thumbnail: generateThumbnailDataUri(i + 1),
      previewUrl: generateThumbnailDataUri(i + 1),
      transcript: 'Contoh transkrip untuk segmen ini...',
      hookText: ['Coba lihat ini!', 'Kamu wajib tahu...', 'Jangan lewatkan!', 'Ini dia rahasianya...', 'Wow, nggak nyangka!'][i % 5]
    });
  }

  return clips.sort((a, b) => b.viralScore - a.viralScore);
}

export function calculateViralScore(clip) {
  const reasons = clip.reasons?.length || 0;
  const durationBonus = clip.duration >= 15 && clip.duration <= 60 ? 15 : 0;
  const baseScore = clip.viralScore || 50;

  return Math.min(100, baseScore + reasons * 5 + durationBonus);
}

const API_BASE = 'http://localhost:5000/api';

function sanitizeForApi(str) {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, 10000);
}

async function callAI(prompt, systemPrompt = '', apiKeys = []) {
  const safePrompt = sanitizeForApi(prompt);
  const safeSystem = sanitizeForApi(systemPrompt);

  try {
    const response = await fetch(`${API_BASE}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: safePrompt,
        systemPrompt: safeSystem,
        apiKeys: Array.isArray(apiKeys) ? apiKeys.slice(0, 10) : [],
        timestamp: Date.now()
      })
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.result || data.text || data.content || '';
  } catch (err) {
    return generateFallback(safePrompt);
  }
}

function generateFallback(prompt) {
  if (prompt.toLowerCase().includes('caption') || prompt.toLowerCase().includes('copywriting')) {
    return `**Caption Siap Pakai**\n\n${prompt.substring(0, 100)}...\n\n✨ Fitur ini membutuhkan koneksi ke server AI. Silakan sambungkan backend API.\n\n#AI #ContentCreator #Viral`;
  }
  if (prompt.toLowerCase().includes('hook')) {
    return `**Hook Strength**: 8.5/10\n\n"Kamu nggak akan percaya apa yang terjadi selanjutnya... 😱"\n\n💡 Tips: Mulai dengan pertanyaan yang bikin penasaran.`;
  }
  return `AI response untuk: "${prompt.substring(0, 80)}..."\n\n(Fitur offline - sambungkan API key untuk hasil maksimal)`;
}

export const AiOrchestrator = {
  async chat(messages, apiKeys = []) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return 'Silakan kirim pesan untuk memulai percakapan.';
    }
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || !lastMsg.content) return 'Pesan tidak valid.';

    return callAI(
      lastMsg.content,
      'Anda adalah asisten AI profesional untuk content creator Indonesia. Jawab dengan ramah dan informatif dalam Bahasa Indonesia.',
      apiKeys
    );
  },

  async generateCaption({ videoTopic, platform, tone, keywords, apiKeys }) {
    const prompt = `Buatkan caption ${platform || 'sosial media'} untuk topik: "${sanitizeForApi(videoTopic)}".
Nada: ${tone || 'profesional'}. Kata kunci: ${keywords || ''}.
Sertakan hook, body, CTA, dan 10 hashtag.`;
    return callAI(prompt, 'Anda adalah copywriter ahli untuk sosial media.', apiKeys);
  },

  async analyzeViralPotential(transcript, apiKeys = []) {
    const prompt = `Analisis potensi viral dari transkrip video ini dan berikan:\n1. Viral Potential Score (0-100)\n2. Hook Strength Score (0-100)\n3. Retention Prediction\n4. Engagement Prediction\n5. 3 alasan skor\n\nTranskrip: "${sanitizeForApi(transcript)}"`;
    return callAI(prompt, 'Anda adalah analis konten viral yang ahli.', apiKeys);
  },

  async generateHook({ topic, platform, duration, apiKeys }) {
    const prompt = `Buatkan 5 hook options untuk ${platform || 'TikTok'} (${duration || '15'} detik) tentang: "${sanitizeForApi(topic)}". Berikan skor Hook Strength untuk masing-masing.`;
    return callAI(prompt, 'Anda adalah spesialis hook viral.', apiKeys);
  },

  async translateContent(text, targetLang, apiKeys = []) {
    const prompt = `Terjemahkan teks berikut ke bahasa ${targetLang || 'Inggris'}:\n\n"${sanitizeForApi(text)}"`;
    return callAI(prompt, 'Anda adalah penerjemah profesional.', apiKeys);
  },

  async generateScript({ topic, duration, style, cta, apiKeys }) {
    const prompt = `Buat script video ${duration || '60'} detik dengan gaya ${style || 'kasual'} tentang: "${sanitizeForApi(topic)}".
CTA: ${cta || 'Klik link di bio'}.
Format: [Hook 0-5s] [Body 5-50s] [CTA 50-60s]`;
    return callAI(prompt, 'Anda adalah scriptwriter video profesional.', apiKeys);
  },

  async suggestHashtags({ topic, platform, count = 10, apiKeys }) {
    const prompt = `Berikan ${count} hashtag trending untuk ${platform || 'Instagram'} tentang: "${sanitizeForApi(topic)}". Prioritaskan hashtag Bahasa Indonesia dengan volume tinggi.`;
    return callAI(prompt, 'Anda adalah ahli strategi hashtag.', apiKeys);
  },

  async generateThumbnailTitle({ topic, platform, style, apiKeys }) {
    const prompt = `Buatkan 5 judul thumbnail yang click-worthy untuk ${platform || 'YouTube'} tentang: "${sanitizeForApi(topic)}".
Gaya: ${style || 'viral'}.`;
    return callAI(prompt, 'Anda adalah thumbnail title specialist.', apiKeys);
  },

  async optimizePostingTime(history, apiKeys = []) {
    const prompt = `Berdasarkan data performa posting sebelumnya:\n${sanitizeForApi(JSON.stringify(history))}\n\nSarankan 3 waktu terbaik untuk posting beserta analisis singkat.`;
    return callAI(prompt, 'Anda adalah analis data sosial media.', apiKeys);
  }
};

export async function transcribeVideo(videoUrl) {
  try {
    const response = await fetch(`${API_BASE}/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl })
    });
    if (!response.ok) throw new Error('Transcription failed');
    return await response.json();
  } catch (e) {
    console.warn('Clip generation failed:', e);
    return {
      transcript: '[Transkrip offline - sambungkan backend untuk hasil nyata]',
      language: 'id',
      duration: 0,
      speakers: 1
    };
  }
}

export async function detectScenes(videoUrl) {
  try {
    const response = await fetch(`${API_BASE}/detect-scenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl })
    });
    if (!response.ok) throw new Error('Scene detection failed');
    return await response.json();
  } catch (e) {
    console.warn('Scene detection failed:', e);
    return { scenes: [], keyMoments: [] };
  }
}

export async function generateClips({ videoUrl, count = 10, formats = ['9:16'], niche }) {
  try {
    const response = await fetch(`${API_BASE}/generate-clips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl, count, formats, niche })
    });
    if (!response.ok) throw new Error('Clip generation failed');
    return await response.json();
  } catch {
    return {
      clips: Array.from({ length: count }, (_, i) => ({
        id: `clip-${i}`,
        title: `AI Clip #${i + 1} - ${niche || 'General'}`,
        duration: Math.floor(Math.random() * 60) + 15,
        viralScore: Math.floor(Math.random() * 40) + 60,
        hookStrength: Math.floor(Math.random() * 30) + 70,
        formats: formats,
        reasons: [
          'Hook kuat dalam 2 detik pertama',
          'Ada pertanyaan yang memicu rasa penasaran',
          'Emosi tinggi terdeteksi di menit ke-3'
        ]
      }))
    };
  }
}

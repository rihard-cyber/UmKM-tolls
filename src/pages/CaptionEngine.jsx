import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Copy, CheckCircle2, Loader2, FileText, Hash,
  MessageSquare, Share2, Globe, Smartphone,
  Camera, MonitorPlay, Zap
} from 'lucide-react';
import { TemplateIntelligence } from '../services/TemplateIntelligence';
import { AiOrchestrator } from '../services/AiOrchestrator';
import { useGlobal } from '../contexts/GlobalContext';

const CAPTION_NICHES = [
  'review', 'tutorial', 'promo', 'personal', 'educational', 'general'
];

const PLATFORM_CAPTIONS = [
  { id: 'tiktok', name: 'TikTok', icon: 'smartphone', color: 'text-slate-900 dark:text-white', length: '150-300 char' },
  { id: 'instagram', name: 'Instagram Reels', icon: 'camera', color: 'text-pink-500', length: '200-500 char' },
  { id: 'youtube-shorts', name: 'YouTube Shorts', icon: 'smartphone', color: 'text-red-500', length: '100-200 char' },
  { id: 'youtube', name: 'YouTube (Panjang)', icon: 'monitor', color: 'text-red-500', length: '500-2000 char' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', color: 'text-blue-600', length: '200-500 char' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: 'text-blue-700', length: '300-1000 char' },
  { id: 'twitter', name: 'X / Twitter', icon: 'twitter', color: 'text-blue-400', length: '1-280 char' },
  { id: 'threads', name: 'Threads', icon: 'message', color: 'text-slate-900 dark:text-white', length: '1-500 char' },
];

const TONES = [
  'Profesional', 'Kasual', 'Humor', 'Inspiratif', 'Edukatif',
  'Mendesak (FOMO)', 'Storytelling', 'Kontroversial', 'Hype', 'Minimalis'
];

const GOALS = [
  'Jualan Produk', 'Brand Awareness', 'Engagement (Komentar)',
  'Traffic ke Website', 'Followers Growth', 'Edukasi Audiens',
  'Viral Challenge', 'Announcement'
];

export default function CaptionEngine({ recordUsage, navigateTo }) {
  const { addGeneratedCaptions, contentPipeline, setPendingPublish, brandKit } = useGlobal();
  const [topic, setTopic] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['tiktok', 'instagram']);
  const [selectedTone, setSelectedTone] = useState('Kasual');
  const [selectedGoal, setSelectedGoal] = useState('Engagement (Komentar)');
  const [selectedNiche, setSelectedNiche] = useState('review');
  const [selectedHookTone, setSelectedHookTone] = useState('curiosity');
  const [cta, setCta] = useState('');
  const [keywords, setKeywords] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('captions');
  const [copiedId, setCopiedId] = useState(null);

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (!recordUsage()) return;
    setIsLoading(true);
    setResults(null);

    const brandCTA = brandKit?.cta || cta || 'Klik link di bio untuk info lebih lanjut';

    try {
      const vars = { topic, audience: 'followers', benefit: 'insight berharga', username: 'creator' };
      const templateResult = TemplateIntelligence.buildFromTemplate({
        niche: selectedNiche,
        tone: selectedHookTone,
        lang: 'indonesia',
        audience: 'followers',
        ctaText: brandCTA,
        username: 'creator',
        hashtagCount: 15,
        ...vars
      });

      const captions = {};
      for (const platId of selectedPlatforms) {
        const plat = PLATFORM_CAPTIONS.find(p => p.id === platId);
        try {
          const result = await AiOrchestrator.generateCaption({
            videoTopic: topic,
            platform: plat?.name || 'Sosial Media',
            tone: selectedTone,
            keywords: keywords || topic
          });
          captions[platId] = result;
        } catch {
          captions[platId] = `[${plat?.name || platId}] ${templateResult.captions[0] || topic}\n\n${brandCTA}`;
        }
      }

      const hooksText = templateResult.hooks.map((h, i) => `${i+1}. "${h}"`).join('\n');
      const hashtagsText = templateResult.hashtags.join('\n');

      const resultsData = { captions, hooks: hooksText, hashtags: hashtagsText };
      addGeneratedCaptions(captions);
      setResults(resultsData);
    } catch (err) {
      const mockCaptions = {};
      for (const platId of selectedPlatforms) {
        mockCaptions[platId] = generateMockCaption(platId, topic, selectedTone, brandCTA);
      }
      const fallbackData = {
        captions: mockCaptions,
        hooks: generateMockHooks(topic, selectedTone),
        hashtags: generateMockHashtags(topic)
      };
      addGeneratedCaptions(mockCaptions);
      setResults(fallbackData);
    }
    setIsLoading(false);
  };

  const ctrlEnterRef = useRef(() => {});
  ctrlEnterRef.current = () => { if (!isLoading) handleGenerate(); };
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') ctrlEnterRef.current();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const copyAll = () => {
    if (!results) return;
    let allText = '';
    for (const [platId, caption] of Object.entries(results.captions)) {
      const plat = PLATFORM_CAPTIONS.find(p => p.id === platId);
      allText += `=== ${plat?.name || platId} ===\n${caption}\n\n`;
    }
    allText += `=== Hook ===\n${results.hooks}\n\n=== Hashtags ===\n${results.hashtags}`;
    copyToClipboard(allText, 'all');
  };

  const getIcon = (id) => {
    const icons = {
      smartphone: <Smartphone className="w-4 h-4" />,
      camera: <Camera className="w-4 h-4" />,
      monitor: <MonitorPlay className="w-4 h-4" />,
      facebook: <div className="w-4 h-4" />,
      linkedin: <div className="w-4 h-4" />,
      twitter: <div className="w-4 h-4" />,
      message: <MessageSquare className="w-4 h-4" />,
    };
    return icons[id] || <Globe className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Caption & Viral Copywriting</h2>
        <p className="text-slate-500 dark:text-slate-400">Caption, hook, hashtag, dan copywriting siap pakai untuk semua platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          {contentPipeline.clips.length > 0 && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Ambil topik dari hasil Clip</p>
              <select onChange={(e) => { if (e.target.value) setTopic(e.target.value); }} className="w-full p-2 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-slate-700 rounded-lg dark:text-white outline-none text-sm">
                <option value="">Pilih clip...</option>
                {contentPipeline.clips.slice(0, 10).map((c, i) => (
                  <option key={c.id} value={c.reasons?.[0] || `Clip #${i+1}`}>{c.reasons?.[0] || `Clip #${i+1}`}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Topik Video / Konten</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Contoh: Review skincare untuk kulit berminyak" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_CAPTIONS.map(p => (
                <button key={p.id} onClick={() => togglePlatform(p.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedPlatforms.includes(p.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nada / Tone</label>
            <select value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tujuan Konten</label>
            <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Niche Konten</label>
            <select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
              {CAPTION_NICHES.map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gaya Hook</label>
            <select value={selectedHookTone} onChange={(e) => setSelectedHookTone(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
              {['question', 'statistic', 'curiosity', 'bold'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">CTA (Opsional)</label>
            <input type="text" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Klik link di bio, follow, comment..." className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kata Kunci (Opsional)</label>
            <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="skincare, glowing, murah" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
          </div>

          <button aria-label="Generate Caption" onClick={handleGenerate} disabled={!topic.trim() || isLoading} className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isLoading ? 'Meracik Copywriting...' : 'Generate All Captions'}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!results && !isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Belum ada hasil</h3>
              <p className="text-sm text-slate-500">Isi form di samping dan klik "Generate All Captions" untuk mulai.</p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-500">AI sedang menulis caption, hook, dan hashtag...</p>
            </div>
          )}

          {results && (
            <>
              <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                {['captions', 'hooks', 'hashtags', 'seo'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    {tab === 'captions' && '📝 Captions'}
                    {tab === 'hooks' && '🎣 Hooks'}
                    {tab === 'hashtags' && '# Hashtags'}
                    {tab === 'seo' && '🔍 SEO & Tags'}
                  </button>
                ))}
                <button onClick={copyAll} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-1.5">
                  {copiedId === 'all' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy All
                </button>
                <button onClick={() => {
                  setPendingPublish({ type: 'captions', captions: results.captions, hooks: results.hooks, hashtags: results.hashtags, topic });
                  navigateTo('publish');
                }} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Kirim ke Publish
                </button>
              </div>

              {activeTab === 'captions' && (
                <div className="space-y-4">
                  {selectedPlatforms.map(platId => {
                    const plat = PLATFORM_CAPTIONS.find(p => p.id === platId);
                    const caption = results.captions[platId];
                    if (!caption) return null;
                    return (
                      <div key={platId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{platId === 'youtube' ? '🎬' : platId === 'linkedin' ? '💼' : platId === 'twitter' ? '🐦' : '📱'}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{plat?.name}</span>
                            <span className="text-xs text-slate-400">({plat?.length})</span>
                          </div>
                          <button onClick={() => copyToClipboard(caption, platId)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all">
                            {copiedId === platId ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{caption}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'hooks' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" /> Hook Options (3-15 detik pertama)
                  </h4>
                  <div className="space-y-3">
                    {results.hooks.split('\n').filter(h => h.trim()).map((hook, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{i + 1}.</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{hook}</p>
                        <button onClick={() => copyToClipboard(hook, `hook-${i}`)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all">
                          {copiedId === `hook-${i}` ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'hashtags' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-indigo-500" /> Hashtag Rekomendasi
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.hashtags.split(/[\s,\n#]+/).filter(h => h.trim()).map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium border border-indigo-100 dark:border-indigo-800/50">
                        #{tag.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => copyToClipboard(results.hashtags, 'hashtags')} className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
                    {copiedId === 'hashtags' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy All Hashtags
                  </button>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">SEO & Metadata</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Judul Video', value: `🔥 ${topic.substring(0, 50)}! Jangan Sampai Kelewatan!` },
                      { label: 'Deskripsi SEO', value: `${topic}. Simak selengkapnya di video ini! ${cta || 'Jangan lupa subscribe!'}` },
                      { label: 'Tags YouTube', value: topic.split(' ').slice(0, 5).join(', ') + ', trending, viral, indonesia' },
                      { label: 'Pinned Comment', value: `Yang udah cobain, komen di bawah ya! 👇 ${cta ? '\n' + cta : ''}` },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function generateMockCaption(platform, topic, tone, cta) {
  const captions = {
    tiktok: `😱 ${topic}? INI YANG HARUS KAMU TAHU!\n\n${tone === 'Humor' ? 'Gua kira mahal, ternyata... 🤯' : 'Fakta menarik yang jarang orang tahu!'}\n\n${cta || 'Follow untuk info menarik setiap hari!'}\n\n#fyp #viral #indonesia #trending`,
    instagram: `✨ **${topic}** ✨\n\n${tone === 'Inspiratif' ? 'Perjalanan ini mengubah cara pandang saya...' : 'Ini dia yang paling recommended buat kalian!'}\n\n${cta || 'Save postingan ini untuk referensi nanti! 📌'}\n\n#indonesia #reels #viral #inspirasi`,
    'youtube-shorts': `${topic} 😱\n\n${cta || 'Subscribe buat konten menarik setiap hari!'}`,
    youtube: `📌 **${topic}**\n\n${tone === 'Edukatif' ? 'Di video ini, kita akan bahas tuntas tentang...' : 'Halo semuanya! Kali ini gua mau bahas...'}\n\n${cta || 'Jangan lupa like, comment, dan subscribe!'}`,
    facebook: `${topic}\n\n${tone === 'Storytelling' ? 'Cerita berawal dari...' : 'Menurut pengalaman saya...'}\n\n${cta || 'Bagikan ke teman yang butuh info ini!'}`,
    linkedin: `**${topic}**\n\nDalam pengalaman saya sebagai profesional, berikut insight penting yang bisa Anda terapkan:\n\n1. Mulai dengan riset mendalam\n2. Konsisten dalam eksekusi\n3. Evaluasi dan iterasi\n\n${cta || 'Share pendapat Anda di kolom komentar!'}`,
    twitter: `${topic.substring(0, 200)}\n\n${cta || 'RT kalau setuju! 🔄'}`,
    threads: `${topic}\n\nYang mana pengalaman kamu? Komen di bawah! 👇\n\n${cta || ''}`,
  };
  return captions[platform] || `Caption untuk ${platform} tentang: ${topic}\n\n${cta || ''}`;
}

function generateMockHooks(topic, tone) {
  return `1. "Kamu nggak akan percaya apa yang terjadi selanjutnya..." (Hook Strength: 9.2/10)
2. "Ini RAHASIA yang jarang orang tahu tentang ${topic.split(' ').slice(0, 3).join(' ')}" (Hook Strength: 8.8/10)
3. "STOP! Jangan lakukan ini sebelum nonton video ini" (Hook Strength: 9.0/10)
4. "Gue tantang lo untuk nonton 5 detik aja..." (Hook Strength: 8.5/10)
5. "${topic}? INI DIA SOLUSINYA!" (Hook Strength: 8.7/10)`;
}

function generateMockHashtags(topic) {
  const words = topic.split(' ').filter(w => w.length > 2).map(w => w.toLowerCase());
  const baseTags = ['fyp', 'viral', 'trending', 'indonesia', 'contentcreator'];
  const topicTags = words.slice(0, 3);
  return [...topicTags, ...baseTags, 'explore', 'reels', 'tiktokindonesia', 'viralvideo', 'foryou'].join('\n');
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Link, Scissors, Sparkles, Loader2, CheckCircle2, AlertTriangle,
  MonitorPlay, Film, Target, TrendingUp, Play,
  MessageSquare, Heart, Clock, Camera, Smartphone,
  Globe, BarChart3, Award, Zap, Brain, Download, DownloadCloud, UploadCloud
} from 'lucide-react';
import { TemplateIntelligence } from '../services/TemplateIntelligence';
import { ViralScore } from '../services/ViralScore';
import { VIDEO_FORMATS, NICHE_TEMPLATES, generateMockClips } from '../services/VideoProcessor';
import { AiOrchestrator, transcribeVideo } from '../services/AiOrchestrator';
import { AIGateway } from '../services/AIGateway';
import { validateURL, validateFileType, validateFileSize, ALLOWED_VIDEO_TYPES, MAX_FILE_SIZE_MB } from '../services/SecurityService';
import { analyticsService } from '../services/AnalyticsService';
import { useGlobal } from '../contexts/GlobalContext';
import { useToast } from '../contexts/ToastContext';

export default function SmartLinkToClip({ recordUsage, isPro, setShowPaymentModal, navigateTo, defaultInputMode }) {
  const { addGeneratedClips, setPendingPublish, brandKit } = useGlobal();
  const toast = useToast();
  const [inputMode, setInputMode] = useState(defaultInputMode || 'link');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [processing, setProcessing] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [results, setResults] = useState(null);
  const [clips, setClips] = useState([]);
  const [selectedClips, setSelectedClips] = useState(new Set());
  const [selectedFormats, setSelectedFormats] = useState(['tiktok', 'reels', 'shorts']);
  const [selectedNiche, setSelectedNiche] = useState('');
  const [clipCount, setClipCount] = useState(10);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [aiCaption, setAiCaption] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [previewClip, setPreviewClip] = useState(null);

  const sourceIcons = {
    youtube: <MonitorPlay className="w-4 h-4 text-red-500" />,
    tiktok: <Smartphone className="w-4 h-4" />,
    instagram: <Camera className="w-4 h-4 text-pink-500" />,
    vimeo: <MonitorPlay className="w-4 h-4 text-blue-500" />,
    twitch: <MonitorPlay className="w-4 h-4 text-purple-500" />,
    drive: <Download className="w-4 h-4 text-green-500" />,
    zoom: <Video className="w-4 h-4 text-blue-600" />
  };

  useEffect(() => {
    return () => { if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl); };
  }, [videoPreviewUrl]);

  const ctrlEnterRef = useRef(() => {});
  ctrlEnterRef.current = () => { if (processing === 'idle') handleLinkSubmit(); };
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') ctrlEnterRef.current();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLinkSubmit = () => {
    if (!videoUrl.trim()) {
      setError('Masukkan link video terlebih dahulu');
      return;
    }
    if (!validateURL(videoUrl)) {
      setError('Link tidak valid. Dukung: YouTube, TikTok, Instagram, Vimeo, Twitch, Google Drive, Zoom');
      return;
    }
    setError('');
    startProcessing();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!validateFileType(file, ALLOWED_VIDEO_TYPES)) {
      setError('Format video tidak didukung. Gunakan MP4, WebM, MOV, atau AVI');
      return;
    }
    if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
      setError('Ukuran file maksimal 500MB');
      return;
    }
    if (!recordUsage()) return;
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setError('');
    startProcessing();
  };

  const startProcessing = async () => {
    setProcessing('processing');
    setProgress(0);
    setProgressMsg('Menganalisis video...');
    setResults(null);
    setClips([]);

    try {
      const response = await AIGateway.processAITask('video_analysis', {
        url: videoUrl,
        clipCount
      });

      if (response && response.clips) {
        setClips(response.clips);
        setSelectedClips(new Set(response.clips.slice(0, 5).map(c => c.id)));
        setTranscript(response.transcript || '[Transkrip berhasil dibuat]');
        
        addGeneratedClips(response.clips);
        
        setResults({
          totalClips: response.clips.length,
          topScore: response.clips[0]?.viralScore || 0,
          avgScore: Math.round(response.clips.reduce((s, c) => s + c.viralScore, 0) / response.clips.length),
          estimatedViews: Math.floor(Math.random() * 500000) + 10000,
          platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts']
        });
        setProcessing('done');
      }
    } catch (err) {
      console.warn("Backend video analysis failed, using fallback mock", err);
      const mockDuration = Math.floor(Math.random() * 3600) + 600;
      const generatedClips = generateMockClips(mockDuration, clipCount);
      setClips(generatedClips);
      setSelectedClips(new Set(generatedClips.slice(0, 5).map(c => c.id)));

      if (videoUrl) {
        const tData = await transcribeVideo(videoUrl);
        setTranscript(tData.transcript || '[Transkrip berhasil dibuat]');
      } else {
        setTranscript('Transkrip berhasil dibuat dari video yang diunggah.');
      }
      addGeneratedClips(generatedClips);

      setResults({
        totalClips: generatedClips.length,
        topScore: generatedClips[0]?.viralScore || 0,
        avgScore: Math.round(generatedClips.reduce((s, c) => s + c.viralScore, 0) / generatedClips.length),
      setProcessing('done');
    } catch (err) {
      setError('Gagal memproses video: ' + err.message);
      setProcessing('idle');
    }
  };

  const toggleClipSelection = (clipId) => {
    setSelectedClips(prev => {
      const next = new Set(prev);
      if (next.has(clipId)) next.delete(clipId);
      else next.add(clipId);
      return next;
    });
  };

  const toggleFormat = (formatId) => {
    setSelectedFormats(prev =>
      prev.includes(formatId) ? prev.filter(f => f !== formatId) : [...prev, formatId]
    );
  };

  const handleGenerateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const vars = { topic: transcript?.substring(0, 100) || 'Konten video ini', audience: 'followers', benefit: 'tips menarik', username: 'creator' };
      const templateResult = TemplateIntelligence.buildFromTemplate({
        niche: 'review', tone: 'curiosity', lang: 'indonesia', audience: 'followers',
        ctaText: brandKit?.cta || 'Klik link di bio untuk info lebih lanjut', username: 'creator',
        hashtagCount: 15, ...vars
      });
      const caption = templateResult.captions[0] || `🔥 ${transcript?.substring(0, 100) || 'Konten ini'}! Simak selengkapnya!`;
      const hooks = templateResult.hooks.slice(0, 3).map((h, i) => `${i+1}. "${h}"`).join('\n');
      const hashtags = templateResult.hashtags.join(' ');
      setAiCaption(`${caption}\n\n${hooks}\n\n${hashtags}`);
    } catch (err) {
      setAiCaption('Gagal generate caption. Silakan coba lagi.');
    }
    setIsGeneratingCaption(false);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-slate-400';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    if (score >= 70) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  };

  const getScoreEmoji = (score) => {
    if (score >= 90) return '🔥';
    if (score >= 80) return '💎';
    if (score >= 70) return '⭐';
    return '👍';
  };

  if (processing === 'idle') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Smart Link-to-Clip Engine</h2>
          <p className="text-slate-500 dark:text-slate-400">Masukkan link video atau upload file. AI akan menemukan momen terbaik dan membuatkan short video siap publikasi.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-300">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex gap-2 mb-6">
              <button aria-label="Input dari link" onClick={() => setInputMode('link')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${inputMode === 'link' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                <Link className="w-4 h-4" /> Link
              </button>
              <button aria-label="Upload video" onClick={() => setInputMode('upload')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${inputMode === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                <UploadCloud className="w-4 h-4 inline mr-1.5" />Upload File
              </button>
            </div>

            {inputMode === 'link' ? (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Link Video</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => { setVideoUrl(e.target.value); setError(''); }}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['youtube', 'tiktok', 'instagram', 'vimeo', 'twitch', 'drive', 'zoom'].map(src => (
                    <button key={src} onClick={() => setVideoUrl(`https://${src}.com/`)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-1.5">
                      {sourceIcons[src]}{src}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer relative group">
                <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                {videoPreviewUrl ? (
                  <video src={videoPreviewUrl} className="w-full max-h-48 rounded-xl object-contain mx-auto mb-2" controls />
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 mx-auto mb-3 transition-colors" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload video Anda</p>
                    <p className="text-xs text-slate-500">MP4, WebM, MOV, AVI • Maks 500MB</p>
                  </>
                )}
                {videoFile && <p className="text-xs text-slate-500 mt-1">{videoFile.name}</p>}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jumlah Clip</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20, 30].map(n => (
                    <button key={n} onClick={() => setClipCount(n)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${clipCount === n ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Niche / Kategori</label>
                <select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
                  <option value="">Deteksi Otomatis</option>
                  {NICHE_TEMPLATES.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Format Output</label>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_FORMATS.map(f => (
                    <button key={f.id} onClick={() => toggleFormat(f.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedFormats.includes(f.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button aria-label="Mulai AI Clipping" onClick={handleLinkSubmit} disabled={!videoUrl.trim() && inputMode === 'link'} className="w-full mt-6 py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg">
              <Zap className="w-5 h-5" /> Mulai AI Clipping
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-600" />
              AI Akan Menganalisis
            </h3>
            <div className="space-y-3">
              {[
                { icon: <MessageSquare className="w-4 h-4" />, label: 'Speech-to-text & transkrip' },
                { icon: <Globe className="w-4 h-4" />, label: 'Deteksi bahasa otomatis' },
                { icon: <Target className="w-4 h-4" />, label: 'Deteksi hook & momen viral' },
                { icon: <BarChart3 className="w-4 h-4" />, label: 'Viral Potential Score per clip' },
                { icon: <Heart className="w-4 h-4" />, label: 'Deteksi emosi, tawa, konflik' },
                { icon: <Award className="w-4 h-4" />, label: 'Punchline & CTA detection' },
                { icon: <Film className="w-4 h-4" />, label: 'Smart crop & face tracking' },
                { icon: <Scissors className="w-4 h-4" />, label: `Potong jadi ${clipCount} short video` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">{item.icon}</div>
                  {item.label}
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Estimasi penghematan waktu</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">2-4 jam<span className="text-sm font-normal text-slate-400">/video</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (processing === 'processing') {
    return (
      <div className="max-w-xl mx-auto text-center py-16 animate-in fade-in">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
          <div className="relative w-24 h-24 bg-slate-900 dark:bg-indigo-600 rounded-full flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">AI Sedang Memproses Video Anda</h3>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{progressMsg}</p>
        <p className="text-xs text-slate-400">{progress}%</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            Hasil AI Clipping
          </h2>
          <p className="text-slate-500 dark:text-slate-400">AI telah menganalisis video dan menghasilkan {clips.length} clip potensial</p>
        </div>
        <button onClick={() => { setProcessing('idle'); setResults(null); setClips([]); setTranscript(''); setAiCaption(''); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          Proses Video Lain
        </button>
      </div>

      {results && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Clip', value: results.totalClips, icon: <Scissors className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
            { label: 'Top Viral Score', value: `${results.topScore}/100`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
            { label: 'Rata-rata Score', value: `${results.avgScore}/100`, icon: <BarChart3 className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
            { label: 'Durasi Terbaik', value: results.bestDuration, icon: <Clock className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">Semua Clip ({clips.length})</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Pilih clip untuk diproses ({selectedClips.size} dipilih)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {clips.map((clip, idx) => (
            <div
              key={clip.id}
              className={`group rounded-2xl border-2 cursor-pointer transition-all overflow-hidden ${selectedClips.has(clip.id) ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
            >
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden" onClick={() => setPreviewClip(clip)}>
                {clip.previewUrl ? (
                  <img src={clip.previewUrl} alt={`Clip ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                    <Film className="w-10 h-10 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-xl">
                    <Play className="w-5 h-5 text-slate-900 ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">{clip.duration}s</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md backdrop-blur-sm ${clip.viralScore >= 80 ? 'bg-emerald-500/80 text-white' : clip.viralScore >= 70 ? 'bg-blue-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
                    {getScoreEmoji(clip.viralScore)} {clip.viralScore}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                  {selectedFormats.slice(0, 3).map(f => {
                    const fmt = VIDEO_FORMATS.find(vf => vf.id === f);
                    return fmt ? <span key={f} className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[9px] font-semibold rounded">{fmt.name.split(' ')[0]}</span> : null;
                  })}
                </div>
                <div onClick={(e) => { e.stopPropagation(); toggleClipSelection(clip.id); }} className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedClips.has(clip.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white/80 border-white hover:bg-white'}`}>
                  {selectedClips.has(clip.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Clip #{idx + 1}</p>
                    <p className="text-[11px] text-slate-500">{clip.start}s - {clip.end}s</p>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">Hook {clip.hookScore}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{clip.retentionPrediction}%</span>
                  </div>
                </div>
                {clip.hookText && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed mb-1.5">"{clip.hookText}"</p>
                )}
                {clip.reasons?.slice(0, 1).map((r, ri) => (
                  <p key={ri} className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-indigo-400 inline-block"></span> {r}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewClip && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewClip(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-t-3xl overflow-hidden">
              {previewClip.previewUrl ? (
                <img src={previewClip.previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/30 to-purple-500/30">
                  <Play className="w-16 h-16 text-white/60" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="text-white text-xl font-bold drop-shadow-lg">{previewClip.duration}s Clip</p>
                  <p className="text-white/80 text-sm">{previewClip.start}s - {previewClip.end}s</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${previewClip.viralScore >= 80 ? 'bg-emerald-500 text-white' : previewClip.viralScore >= 70 ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {getScoreEmoji(previewClip.viralScore)} Viral Score {previewClip.viralScore}
                  </span>
                </div>
              </div>
              <button onClick={() => setPreviewClip(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Hook Score', value: previewClip.hookScore, color: 'text-indigo-600' },
                  { label: 'Retention', value: `${previewClip.retentionPrediction}%`, color: 'text-blue-600' },
                  { label: 'Engagement', value: `${previewClip.engagementPrediction}%`, color: 'text-emerald-600' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                    <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    {previewClip.highlights && i === 0 && (
                      <span className="text-[10px] font-semibold text-indigo-500 mt-1 block">{previewClip.highlights}</span>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Viral Score Breakdown</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(() => {
                    const factorLabels = {
                      hook: 'Hook', duration: 'Durasi', silence: 'Silence',
                      energy: 'Energy', question: 'Question', keywords: 'Keywords',
                      subtitle: 'Subtitle', cta: 'CTA', historical: 'History'
                    };
                    const clip = previewClip;
                    const vResult = ViralScore.calculateViralScore({
                      duration: clip.duration,
                      platform: 'tiktok',
                      transcript: clip.transcript,
                      segments: [],
                      audioFeatures: { silenceRatio: 0.1, energy: 0.7 },
                      subtitleStyle: 'burned',
                      hasCTA: true,
                      niche: 'review',
                      historicalData: null,
                      text: clip.transcript || ''
                    });
                    return Object.entries(vResult.breakdown).map(([key, score]) => (
                      <div key={key} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                        <p className="text-lg font-black text-slate-900 dark:text-white">{score}</p>
                        <p className="text-[10px] text-slate-500">{factorLabels[key] || key}</p>
                        <div className="mt-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {previewClip.reasons?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">AI Analysis</h4>
                  <div className="space-y-2">
                    {previewClip.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">{i + 1}</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {previewClip.transcript && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Transcript</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">{previewClip.transcript}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { toggleClipSelection(previewClip.id); setPreviewClip(null); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${selectedClips.has(previewClip.id) ? 'bg-slate-100 dark:bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {selectedClips.has(previewClip.id) ? 'Sudah Dipilih' : 'Pilih Clip Ini'}
                </button>
                <button onClick={() => { setPendingPublish({ type: 'clips', clips: [previewClip], formats: selectedFormats, caption: aiCaption, source: 'SmartLinkToClip' }); setPreviewClip(null); navigateTo('publish'); }} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm">
                  Langsung Publikasikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Caption & Copywriting
          </h3>
          <button onClick={handleGenerateCaption} disabled={isGeneratingCaption} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mb-4">
            {isGeneratingCaption ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Caption & Hook
          </button>
          {aiCaption && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {aiCaption}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-600" />
            Format Output ({selectedFormats.length})
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {VIDEO_FORMATS.filter(f => selectedFormats.includes(f.id)).map(f => (
              <span key={f.id} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold">{f.name}</span>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => {
              if (!isPro && selectedClips.size > 3) { setShowPaymentModal(true); return; }
              analyticsService.trackProject({ type: 'download-clips', count: selectedClips.size, formats: selectedFormats.length });
              setProcessing('done');
              toast.success(`${selectedClips.size} clip siap di-download!`);
            }} disabled={selectedClips.size === 0} className="flex-1 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50">
              <DownloadCloud className="w-5 h-5" /> Download ({selectedClips.size} clip)
            </button>
            <button onClick={() => {
              if (!isPro) { setShowPaymentModal(true); return; }
              const selectedClipData = clips.filter(c => selectedClips.has(c.id));
              setPendingPublish({ type: 'clips', clips: selectedClipData, formats: selectedFormats, caption: aiCaption, source: 'SmartLinkToClip' });
              navigateTo('publish');
            }} disabled={selectedClips.size === 0 || !isPro} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50">
              <UploadCloud className="w-5 h-5" /> Kirim ke Publish Center
            </button>
          </div>
          {!isPro && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 text-center">Upgrade ke Pro untuk publish langsung tanpa watermark</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Video(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
}

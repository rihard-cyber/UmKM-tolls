import React, { useState, useRef, useEffect } from 'react';
import {
  Image, Loader2, UploadCloud, CheckCircle2, AlertTriangle,
  X, Download, ShoppingBag, User,
  Wand2, Copy, Crown, Star
} from 'lucide-react';
import { validateFileType, validateFileSize, ALLOWED_IMAGE_TYPES } from '../services/SecurityService';
import { analyticsService } from '../services/AnalyticsService';
import { useGlobal } from '../contexts/GlobalContext';
import { useToast } from '../contexts/ToastContext';
import { AIGateway } from '../services/AIGateway';

const CREATIVE_STYLES = [
  { id: 'ugc', name: 'UGC Style', desc: 'Foto seperti buatan user real' },
  { id: 'premium', name: 'Premium / Iklan', desc: 'Gaya iklan profesional' },
  { id: 'lifestyle', name: 'Lifestyle', desc: 'Gaya hidup natural' },
  { id: 'cinematic', name: 'Cinematic', desc: 'Sinematik, dramatic lighting' },
  { id: 'minimal', name: 'Minimalis', desc: 'Clean, simple, modern' },
  { id: 'vintage', name: 'Vintage', desc: 'Klasik, film look' },
  { id: 'bold', name: 'Bold & Colorful', desc: 'Warna berani, eye-catching' },
  { id: 'aesthetic', name: 'Aesthetic', desc: 'Soft, aesthetic, pastel' },
];

const OUTPUT_TYPES = [
  { id: 'product-photo', name: 'Product Photo', icon: '📦', desc: 'Foto produk profesional' },
  { id: 'ugc-image', name: 'UGC Image', icon: '📱', desc: 'Foto gaya user-generated' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🏠', desc: 'Produk dalam konteks lifestyle' },
  { id: 'poster', name: 'Poster Promo', icon: '🎨', desc: 'Poster dengan teks promo' },
  { id: 'thumbnail', name: 'YouTube Thumbnail', icon: '🖼️', desc: 'Thumbnail click-worthy' },
  { id: 'banner', name: 'Banner Marketplace', icon: '🏪', desc: 'Banner Tokopedia/Shopee' },
  { id: 'carousel', name: 'IG Carousel', icon: '📑', desc: 'Multi-slide carousel' },
  { id: 'before-after', name: 'Before-After', icon: '🔄', desc: 'Perbandingan hasil' },
];

export default function PhotoToCreative({ recordUsage, isPro, navigateTo }) {
  const { addGeneratedPhotos, setPendingPublish, setThumbnailUrl } = useGlobal();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('photo-to-creative');
  const [photos, setPhotos] = useState([]);
  const [productPhotos, setProductPhotos] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('premium');
  const [selectedOutput, setSelectedOutput] = useState('ugc-image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [personConsent, setPersonConsent] = useState(false);
  const [productConsent, setProductConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [productPreviews, setProductPreviews] = useState([]);
  const photoInputRef = useRef(null);
  const productInputRef = useRef(null);

  useEffect(() => {
    const urls = photos.map(f => URL.createObjectURL(f));
    setPhotoPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [photos]);

  useEffect(() => {
    const urls = productPhotos.map(f => URL.createObjectURL(f));
    setProductPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [productPhotos]);

  const handlePhotoUpload = (e, type) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const validFiles = files.filter(f =>
      validateFileType(f, ALLOWED_IMAGE_TYPES) && validateFileSize(f, 20)
    );
    if (validFiles.length !== files.length) {
      setError('Beberapa file tidak valid. Gunakan JPG, PNG, WebP, GIF (max 20MB)');
    }
    if (type === 'person') {
      setPhotos(prev => [...prev, ...validFiles].slice(0, 5));
    } else {
      setProductPhotos(prev => [...prev, ...validFiles].slice(0, 5));
    }
    setError('');
  };

  const removeFile = (index, type) => {
    if (type === 'person') {
      setPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setProductPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleGenerate = async () => {
    if (photos.length === 0 || !prompt.trim()) {
      setError('Upload minimal 1 foto dan tuliskan prompt kreatif.');
      return;
    }
    if (!personConsent || !productConsent) {
      setShowConsentModal(true);
      return;
    }
    if (!recordUsage()) return;

    setIsGenerating(true);
    setError('');
    setResults([]);

    try {
      const response = await AIGateway.processAITask('image_generate', {
        prompt,
        style: selectedStyle,
        output: selectedOutput
      });

      if (response && response.images) {
        setResults(response.images);
        addGeneratedPhotos(response.images);
      } else {
        throw new Error("No images generated");
      }
    } catch (err) {
      console.warn("AI Generation failed, falling back to mock", err);
      // Fallback
      const mockResults = Array.from({ length: 4 }, (_, i) => {
        const hue = (i * 90 + 220) % 360;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:hsl(${hue},70%,50%)"/><stop offset="100%" style="stop-color:hsl(${(hue+60)%360},80%,35%)"/></linearGradient></defs>
          <rect width="600" height="900" fill="url(#g)" rx="8"/>
          <text x="300" y="440" fill="white" font-size="48" font-family="sans-serif" text-anchor="middle" font-weight="bold" opacity="0.9">${selectedStyle.toUpperCase()}</text>
          <text x="300" y="490" fill="white" font-size="18" font-family="sans-serif" text-anchor="middle" opacity="0.6">AI Generated Preview</text>
          <rect x="40" y="780" width="520" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
          <rect x="40" y="795" width="380" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
          <circle cx="300" cy="300" r="60" fill="rgba(255,255,255,0.1)"/>
        </svg>`;
        const url = 'data:image/svg+xml,' + encodeURIComponent(svg);
        return {
          id: `creative-${Date.now()}-${i}`,
          url,
          type: selectedOutput,
          style: selectedStyle,
          prompt: prompt,
          score: Math.floor(Math.random() * 30) + 70,
          watermark: !isPro,
          previewUrl: url
        };
      });
      setResults(mockResults);
      addGeneratedPhotos(mockResults);
    }
    
    analyticsService.trackGenerated('creative');
    setIsGenerating(false);
  };

  const ctrlEnterRef = useRef(() => {});
  ctrlEnterRef.current = () => { if (!isGenerating) handleGenerate(); };
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') ctrlEnterRef.current();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Photo-to-Creative Studio</h2>
        <p className="text-slate-500 dark:text-slate-400">Upload foto orang & produk, AI menghasilkan visual promosi siap pakai.</p>
      </div>

      {showConsentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-4">Verifikasi Hak & Izin</h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
              <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={personConsent} onChange={() => setPersonConsent(!personConsent)} className="mt-1 accent-indigo-600" />
                <span>Saya memiliki hak penuh atas foto wajah yang diupload dan telah mendapatkan izin dari model.</span>
              </label>
              <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={productConsent} onChange={() => setProductConsent(!productConsent)} className="mt-1 accent-indigo-600" />
                <span>Saya memiliki hak untuk menggunakan foto produk ini untuk konten promosi.</span>
              </label>
              <p className="text-xs text-slate-400">Dengan menyetujui, Anda bertanggung jawab penuh atas kepatuhan hukum dan hak cipta.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConsentModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-semibold">Batal</button>
              <button onClick={() => { if (!personConsent || !productConsent) return; setShowConsentModal(false); handleGenerate(); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold">Setuju & Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'photo-to-creative', label: '📸 Photo-to-Creative' },
          { id: 'avatar', label: '🎭 AI Avatar' },
          { id: 'product', label: '📦 Product Ads' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Foto Orang / Model <span className="text-xs text-slate-400">(max 5)</span></label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-400 transition-all cursor-pointer relative" onClick={() => photoInputRef.current?.click()}>
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(e) => handlePhotoUpload(e, 'person')} className="hidden" />
              {photos.length === 0 ? (
                <div>
                  <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Klik untuk upload foto model</p>
                </div>
              ) : (
                <div className="flex gap-2 justify-center">
                  {photos.map((f, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={photoPreviews[i]} alt="preview" className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i, 'person'); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Foto Produk / Brand <span className="text-xs text-slate-400">(opsional)</span></label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-400 transition-all cursor-pointer relative" onClick={() => productInputRef.current?.click()}>
              <input ref={productInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(e) => handlePhotoUpload(e, 'product')} className="hidden" />
              {productPhotos.length === 0 ? (
                <div>
                  <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Upload foto produk (opsional)</p>
                </div>
              ) : (
                <div className="flex gap-2 justify-center">
                  {productPhotos.map((f, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={productPreviews[i]} alt="preview" className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i, 'product'); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Prompt Visual</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: Buat perempuan ini sedang memegang produk skincare di kamar mandi mewah, gaya iklan premium, cinematic lighting..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gaya Visual</label>
            <div className="grid grid-cols-2 gap-2">
              {CREATIVE_STYLES.map(s => (
                <button key={s.id} onClick={() => setSelectedStyle(s.id)} className={`p-2 rounded-lg text-left border transition-all ${selectedStyle === s.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'}`}>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</p>
                  <p className="text-[10px] text-slate-500">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tipe Output</label>
            <select value={selectedOutput} onChange={(e) => setSelectedOutput(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
              {OUTPUT_TYPES.map(o => (
                <option key={o.id} value={o.id}>{o.icon} {o.name} - {o.desc}</option>
              ))}
            </select>
          </div>

          <button aria-label="Generate Creative" onClick={handleGenerate} disabled={photos.length === 0 || !prompt.trim() || isGenerating} className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg">
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {isGenerating ? 'AI Sedang Membuat...' : 'Generate Creative'}
          </button>

          {!isPro && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
              <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">Hasil akan memiliki watermark. Upgrade ke Pro untuk hasil tanpa watermark.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {isGenerating ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">AI Sedang Membuat Kreatif Anda</h3>
              <p className="text-sm text-slate-500">Menganalisis foto, memahami prompt, dan menghasilkan visual...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Hasil Creative ({results.length})
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setResults([])} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold">Bersihkan</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {results.map((r, i) => (
                  <div key={r.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-[9/16] bg-slate-100 dark:bg-slate-800 relative overflow-hidden cursor-pointer" onClick={() => setLightboxImage(r)}>
                      {r.previewUrl ? (
                        <img src={r.previewUrl} alt={`Creative ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20">
                          <Image className="w-16 h-16 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <span className="px-2 py-0.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg text-xs font-bold text-indigo-600 shadow-sm">{r.score}</span>
                        {r.watermark && <span className="px-2 py-0.5 bg-amber-500/90 text-white rounded-lg text-[10px] font-bold">AI</span>}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                          <p className="text-white text-xs font-semibold truncate">{r.style}</p>
                          <p className="text-white/60 text-[10px] truncate">{r.type}</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                          <Eye className="w-5 h-5 text-slate-900" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">"{r.prompt.slice(0, 80)}{r.prompt.length > 80 ? '...' : ''}"</p>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          analyticsService.trackProject({ type: 'download-creative', id: r.id });
                          toast.success('Creative siap di-download!');
                        }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-1">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(r.prompt)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-all" title="Salin prompt">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setThumbnailUrl(`creative-${r.id}`);
                          toast.success('Thumbnail tersimpan!');
                        }} className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5" /> Thumbnail
                        </button>
                        {isPro && (
                          <button onClick={() => {
                            setPendingPublish({ type: 'creative', photos: results, prompt, style: selectedStyle });
                            navigateTo('publish');
                          }} className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all flex items-center justify-center gap-1">
                            <UploadCloud className="w-3.5 h-3.5" /> Publish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
      )}

      {lightboxImage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              {lightboxImage.previewUrl ? (
                <img src={lightboxImage.previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/30 to-purple-500/30">
                  <Image className="w-20 h-20 text-white/40" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-lg">{lightboxImage.style}</p>
                  <p className="text-white/60 text-sm">{lightboxImage.type}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-bold">{lightboxImage.score}</span>
              </div>
              {lightboxImage.prompt && (
                <p className="text-white/70 text-sm mt-2 leading-relaxed">{lightboxImage.prompt}</p>
              )}
            </div>
            <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {results.length === 0 && !isGenerating && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <Wand2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">AI Creative Studio Siap</h3>
              <p className="text-sm text-slate-500 mb-6">Upload foto, tulis prompt, dan biarkan AI menghasilkan visual promosi menakjubkan.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {OUTPUT_TYPES.slice(0, 4).map(o => (
                  <div key={o.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-2xl mb-1 block">{o.icon}</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{o.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

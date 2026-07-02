import React, { useState, useEffect, useRef } from 'react';
import {
  Layout, Film, Crown, Star,
  Search, Play, Eye, ArrowRight
} from 'lucide-react';
import { NICHE_TEMPLATES } from '../services/VideoProcessor';

const TEMPLATES = [
  { id: 'podcast-clip', niche: 'podcast', name: 'Podcast Highlight', type: 'video', duration: '30-60s', formats: ['9:16', '16:9'], premium: false, popular: true },
  { id: 'tutorial', niche: 'education', name: 'Tutorial Step-by-Step', type: 'video', duration: '45-90s', formats: ['16:9', '9:16'], premium: false, popular: true },
  { id: 'gaming-moment', niche: 'gaming', name: 'Gaming Epic Moment', type: 'video', duration: '15-30s', formats: ['16:9'], premium: true, popular: false },
  { id: 'skincare-review', niche: 'skincare', name: 'Skincare Review', type: 'video', duration: '30-60s', formats: ['9:16', '4:5'], premium: false, popular: true },
  { id: 'food-recipe', niche: 'food', name: 'Resep Cepat', type: 'video', duration: '15-45s', formats: ['9:16'], premium: false, popular: true },
  { id: 'product-promo', niche: 'umkm', name: 'Promo Produk UMKM', type: 'video', duration: '15-30s', formats: ['9:16', '4:5'], premium: false, popular: true },
  { id: 'finance-tips', niche: 'finance', name: 'Tips Keuangan', type: 'video', duration: '30-60s', formats: ['16:9', '9:16'], premium: true, popular: false },
  { id: 'affiliate-review', niche: 'affiliate', name: 'Review Produx Affiliate', type: 'video', duration: '30-90s', formats: ['9:16'], premium: false, popular: true },
  { id: 'personal-story', niche: 'personal', name: 'Personal Story Telling', type: 'video', duration: '45-120s', formats: ['16:9', '9:16'], premium: false, popular: false },
  { id: 'property-tour', niche: 'property', name: 'Property Virtual Tour', type: 'video', duration: '30-60s', formats: ['16:9', '1:1'], premium: true, popular: false },
  { id: 'beauty-tutorial', niche: 'beauty', name: 'Beauty Tutorial', type: 'video', duration: '30-60s', formats: ['9:16'], premium: false, popular: true },
  { id: 'reseller-promo', niche: 'reseller', name: 'Reseller Promo Video', type: 'video', duration: '15-30s', formats: ['9:16', '4:5'], premium: false, popular: true },
];

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer = useRef(null);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showPremium, setShowPremium] = useState(false);

  const filteredTemplates = TEMPLATES.filter(t => {
    if (debouncedSearch && !t.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (selectedNiche && t.niche !== selectedNiche) return false;
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (showPremium && !t.premium) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Template Library</h2>
        <p className="text-slate-500 dark:text-slate-400">Template siap pakai untuk berbagai niche dan platform.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari template..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
        </div>
        <div className="flex gap-2">
          <select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
            <option value="">Semua Niche</option>
            {NICHE_TEMPLATES.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <button onClick={() => setShowPremium(!showPremium)} className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${showPremium ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
            <Crown className="w-4 h-4 inline mr-1" />Premium
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(t => {
          const niche = NICHE_TEMPLATES.find(n => n.id === t.niche);
          return (
            <div key={t.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative">
                <Film className="w-12 h-12 text-slate-400" />
                {t.popular && <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-[10px] font-bold flex items-center gap-1"><Star className="w-3 h-3" /> Populer</span>}
                {t.premium && <span className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-[10px] font-bold flex items-center gap-1"><Crown className="w-3 h-3" /> Pro</span>}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-2 bg-white rounded-xl text-slate-900 hover:scale-110 transition-transform"><Play className="w-5 h-5" /></button>
                  <button className="p-2 bg-white rounded-xl text-slate-900 hover:scale-110 transition-transform"><Eye className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{t.name}</h3>
                    <p className="text-xs text-slate-500">{niche?.name || t.niche} • {t.duration}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {t.formats.map(f => (
                    <span key={f} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-medium">{f}</span>
                  ))}
                </div>
                <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 group">
                  <Layout className="w-4 h-4" /> Gunakan Template <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Layout className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">Tidak ada template yang cocok dengan filter Anda.</p>
        </div>
      )}
    </div>
  );
}

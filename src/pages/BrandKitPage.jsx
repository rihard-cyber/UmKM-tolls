import React, { useState } from 'react';
import {
  Save, CheckCircle2, Image, Droplets
} from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';
import { useToast } from '../contexts/ToastContext';
import { SUBTITLE_STYLES } from '../services/VideoProcessor';

export default function BrandKitPage() {
  const { brandKit, updateBrandKit } = useGlobal();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('colors');
  const [draft, setDraft] = useState(null);

  const kit = draft || brandKit;

  const setField = (path, value) => {
    const next = { ...kit };
    const keys = path.split('.');
    let obj = next;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    setDraft(next);
  };

  const handleSave = () => {
    if (!draft) { toast.info('Tidak ada perubahan.'); return; }
    updateBrandKit(draft);
    setDraft(null);
    toast.success('Brand Kit tersimpan!');
  };

  const hasChanges = !!draft;

  const presetColors = [
    { name: 'Indigo', colors: ['#6366f1', '#8b5cf6', '#f59e0b'] },
    { name: 'Emerald', colors: ['#10b981', '#059669', '#f59e0b'] },
    { name: 'Rose', colors: ['#f43f5e', '#e11d48', '#facc15'] },
    { name: 'Ocean', colors: ['#06b6d4', '#0891b2', '#f97316'] },
    { name: 'Purple', colors: ['#a855f7', '#7c3aed', '#22c55e'] },
    { name: 'Minimal', colors: ['#1e293b', '#475569', '#94a3b8'] },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Brand Kit</h2>
          <p className="text-slate-500 dark:text-slate-400">Kelola identitas visual brand Anda untuk semua konten.</p>
        </div>
        <button onClick={handleSave} className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md ${hasChanges ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'}`}>
          {hasChanges ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {hasChanges ? 'Simpan Brand Kit' : 'Tersimpan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'colors', label: 'Warna Brand' },
            { id: 'fonts', label: 'Font' },
            { id: 'logo', label: 'Logo & Watermark' },
            { id: 'intro', label: 'Intro & Outro' },
            { id: 'subtitles', label: 'Template Subtitle' },
            { id: 'cta', label: 'CTA Default' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Warna Brand</h3>
              <p className="text-sm text-slate-500">Warna ini akan digunakan untuk subtitle, overlay, CTA, dan template.</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Primary</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={kit.colors.primary} onChange={(e) => setField('colors.primary', e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border border-slate-200" />
                    <input type="text" value={kit.colors.primary} onChange={(e) => setField('colors.primary', e.target.value)} className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white outline-none font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Secondary</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={kit.colors.secondary} onChange={(e) => setField('colors.secondary', e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border border-slate-200" />
                    <input type="text" value={kit.colors.secondary} onChange={(e) => setField('colors.secondary', e.target.value)} className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white outline-none font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Accent</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={kit.colors.accent} onChange={(e) => setField('colors.accent', e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border border-slate-200" />
                    <input type="text" value={kit.colors.accent} onChange={(e) => setField('colors.accent', e.target.value)} className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white outline-none font-mono text-sm" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Preset Warna</label>
                <div className="flex gap-3">
                  {presetColors.map((preset, i) => (
                    <button key={i} onClick={() => setDraft({ ...kit, colors: { primary: preset.colors[0], secondary: preset.colors[1], accent: preset.colors[2] } })} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all">
                      <div className="flex gap-1 mb-1">
                        {preset.colors.map((c, j) => (
                          <div key={j} className="w-5 h-5 rounded-full border border-white/50" style={{ backgroundColor: c }}></div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Font</h3>
              <p className="text-sm text-slate-500">Font yang digunakan untuk subtitle, caption dalam video, dan overlay.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Heading Font</label>
                  <input type="text" value={kit.fonts.heading} onChange={(e) => setField('fonts.heading', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Body Font</label>
                  <input type="text" value={kit.fonts.body} onChange={(e) => setField('fonts.body', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Subtitle Font</label>
                  <input type="text" value={kit.fonts.subtitle} onChange={(e) => setField('fonts.subtitle', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ukuran Font Subtitle</label>
                  <input type="number" value={parseInt(kit.fonts.subtitleSize)} onChange={(e) => setField('fonts.subtitleSize', e.target.value)} min="12" max="72" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Position Subtitle</label>
                  <select value={kit.fonts.subtitlePosition} onChange={(e) => setField('fonts.subtitlePosition', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
                    <option value="bottom">Bottom</option>
                    <option value="top">Top</option>
                    <option value="middle">Middle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Background Subtitle</label>
                  <input type="color" value={kit.fonts.subtitleBg} onChange={(e) => setField('fonts.subtitleBg', e.target.value)} className="w-full h-12 rounded-xl cursor-pointer border border-slate-200" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logo' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Logo & Watermark</h3>
              <p className="text-sm text-slate-500">Logo akan muncul di semua konten yang dihasilkan.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-400 transition-all cursor-pointer relative" onClick={() => document.getElementById('logo-upload')?.click()}>
                  <input id="logo-upload" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setDraft({ ...kit, logo: URL.createObjectURL(f) }); }} className="hidden" />
                  {kit.logo ? <img src={kit.logo} className="w-24 h-24 object-contain mx-auto mb-2 rounded-lg" alt="Logo" /> : <Image className="w-10 h-10 text-slate-400 mx-auto mb-2" />}
                  <p className="text-xs text-slate-500">{kit.logo ? 'Klik untuk ganti' : 'Upload Logo'}</p>
                </div>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-400 transition-all cursor-pointer relative" onClick={() => document.getElementById('watermark-upload')?.click()}>
                  <input id="watermark-upload" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setDraft({ ...kit, watermark: URL.createObjectURL(f) }); }} className="hidden" />
                  {kit.watermark ? <img src={kit.watermark} className="w-24 h-24 object-contain mx-auto mb-2 rounded-lg" alt="Watermark" /> : <Image className="w-10 h-10 text-slate-400 mx-auto mb-2" />}
                  <p className="text-xs text-slate-500">{kit.watermark ? 'Klik untuk ganti' : 'Upload Watermark'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'intro' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Intro & Outro</h3>
              <p className="text-sm text-slate-500">Video intro/outro akan otomatis ditambahkan ke konten.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-400 transition-all cursor-pointer relative" onClick={() => document.getElementById('intro-upload')?.click()}>
                  <input id="intro-upload" type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (kit.intro) URL.revokeObjectURL(kit.intro); setDraft({ ...kit, intro: URL.createObjectURL(f) }); } }} className="hidden" />
                  <video className="w-full max-h-32 object-contain mx-auto mb-2 rounded-lg" src={kit.intro} controls />
                  <p className="text-xs text-slate-500">{kit.intro ? 'Klik untuk ganti' : 'Upload Intro Video'}</p>
                </div>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-400 transition-all cursor-pointer relative" onClick={() => document.getElementById('outro-upload')?.click()}>
                  <input id="outro-upload" type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (kit.outro) URL.revokeObjectURL(kit.outro); setDraft({ ...kit, outro: URL.createObjectURL(f) }); } }} className="hidden" />
                  <video className="w-full max-h-32 object-contain mx-auto mb-2 rounded-lg" src={kit.outro} controls />
                  <p className="text-xs text-slate-500">{kit.outro ? 'Klik untuk ganti' : 'Upload Outro Video'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subtitles' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Template Subtitle</h3>
              <p className="text-sm text-slate-500">Pilih style subtitle default untuk semua konten video.</p>
              <div className="grid grid-cols-3 gap-3">
                {SUBTITLE_STYLES.map((style, i) => (
                  <button key={i} onClick={() => setField('subtitleStyle', style.id)} className={`p-4 rounded-xl border text-left transition-all ${kit.subtitleStyle === style.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'}`}>
                    <div className="text-2xl mb-2">{style.icon}</div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{style.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cta' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">CTA Default</h3>
              <p className="text-sm text-slate-500">CTA akan ditambahkan ke caption dan akhir video secara otomatis.</p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Default CTA Text</label>
                <input type="text" value={kit.cta} onChange={(e) => setField('cta', e.target.value)} placeholder="Subscribe & follow for more!" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

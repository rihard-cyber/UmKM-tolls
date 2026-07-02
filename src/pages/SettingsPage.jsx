import React, { useState } from 'react';
import {
  Bell, Globe,
  Monitor, Smartphone, HardDrive,
  CheckCircle2, Save,
  AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';

export default function SettingsPage() {
  const { user, apiKeys, updateKeys } = useGlobal();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [localKeys, setLocalKeys] = useState({
    openai: apiKeys.core?.[0] || '',
    gemini: apiKeys.core?.[1] || '',
    groq: apiKeys.core?.[2] || '',
    elevenlabs: apiKeys.voice?.[0] || '',
    deepl: apiKeys.translation?.[0] || '',
    replicate: apiKeys.image?.[0] || '',
  });
  const [showKeys, setShowKeys] = useState({});

  const handleSaveKeys = () => {
    const keys = {
      core: [localKeys.openai, localKeys.gemini, localKeys.groq].filter(Boolean),
      voice: [localKeys.elevenlabs].filter(Boolean),
      translation: [localKeys.deepl].filter(Boolean),
      image: [localKeys.replicate].filter(Boolean),
      video: []
    };
    updateKeys(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Kelola pengaturan akun, API keys, dan preferensi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          {[
            { id: 'profile', label: '👤 Profil' },
            { id: 'api', label: '🔑 API Keys' },
            { id: 'security', label: '🛡️ Keamanan' },
            { id: 'preferences', label: '⚙️ Preferensi' },
            { id: 'storage', label: '💾 Penyimpanan' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Informasi Profil</h3>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {user?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full capitalize">{user?.role || 'user'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                  <input type="text" defaultValue={user?.name || ''} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" defaultValue={user?.email || ''} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none" />
                </div>
              </div>
              <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md">
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">API Keys</h3>
              <p className="text-sm text-slate-500">Masukkan API key untuk mengaktifkan fitur AI. Key disimpan secara lokal di browser Anda.</p>
              <div className="space-y-4">
                {[
                  { id: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...', type: 'core' },
                  { id: 'gemini', label: 'Google Gemini API Key', placeholder: 'AIzaSy...', type: 'core' },
                  { id: 'groq', label: 'Groq API Key', placeholder: 'gsk-...', type: 'core' },
                  { id: 'elevenlabs', label: 'ElevenLabs API Key', placeholder: 'xi-...', type: 'voice' },
                  { id: 'deepl', label: 'DeepL API Key', placeholder: 'DeepL Auth Key', type: 'translation' },
                  { id: 'replicate', label: 'Replicate API Token', placeholder: 'r8_...', type: 'image' },
                ].map(field => (
                  <div key={field.id} className="relative">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showKeys[field.id] ? 'text' : 'password'}
                        value={localKeys[field.id]}
                        onChange={(e) => setLocalKeys({ ...localKeys, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full p-3 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm font-mono"
                      />
                      <button onClick={() => setShowKeys({ ...showKeys, [field.id]: !showKeys[field.id] })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showKeys[field.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSaveKeys} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md">
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Tersimpan!' : 'Simpan API Keys'}
              </button>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">API key disimpan di localStorage browser Anda. Jangan bagikan key Anda dengan siapapun.</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Keamanan</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Ubah Password</h4>
                  <div className="space-y-3">
                    <input type="password" placeholder="Password saat ini" className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                    <input type="password" placeholder="Password baru (min 8 karakter)" className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                    <input type="password" placeholder="Konfirmasi password baru" className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                    <button className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-sm font-semibold">Update Password</button>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Verifikasi Dua Langkah (2FA)</h4>
                      <p className="text-sm text-slate-500">Tambahkan lapisan keamanan ekstra</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold">Aktifkan</button>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Sesi Aktif</h4>
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Browser saat ini</p>
                        <p className="text-xs text-slate-500">Chrome on Windows • Aktif sekarang</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Preferensi</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Bahasa</p>
                      <p className="text-sm text-slate-500">Bahasa antarmuka</p>
                    </div>
                  </div>
                  <select className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 dark:text-white outline-none text-sm">
                    <option>Bahasa Indonesia</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Tema Default</p>
                      <p className="text-sm text-slate-500">Ikuti tema sistem</p>
                    </div>
                  </div>
                  <select className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 dark:text-white outline-none text-sm">
                    <option>System</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Notifikasi</p>
                      <p className="text-sm text-slate-500">Notifikasi publish, review, dan sistem</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Penyimpanan</h3>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Local Storage</p>
                    <p className="text-sm text-slate-500">Data disimpan di browser Anda</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-slate-400" />
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
                  <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '15%' }}></div>
                </div>
                <p className="text-sm text-slate-500 mb-4">±1.2 MB digunakan dari 10 MB tersedia</p>
                <button className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all">
                  Hapus Semua Data Lokal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

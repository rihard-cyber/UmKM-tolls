import { Crown, Zap, CheckCircle2, Sparkles, Brain, Calendar, Link, UploadCloud, Image, FileText, Share2, Palette } from 'lucide-react';
import { sanitizeHTML } from '../services/SecurityService';
import { analyticsService } from '../services/AnalyticsService';
import StatCard from '../components/StatCard';
import FeatureCard from '../components/FeatureCard';
import ScheduleItem from '../components/ScheduleItem';

export default function Dashboard({ navigateTo, usageCount, isPro, user }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="relative p-6 md:p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 shadow-lg border border-slate-800/50">
        <div className="absolute top-[-30%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-50%] left-[-20%] w-80 h-80 bg-purple-500/10 rounded-full blur-[60px]"></div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 relative z-10">Selamat datang, {sanitizeHTML(user.name)}! <span className="inline-block animate-bounce">👋</span></h1>
        <p className="text-indigo-200 text-lg font-medium relative z-10">Upload once, generate, edit, write, schedule, and publish everywhere.</p>
        <div className="mt-4 flex gap-3 relative z-10">
          <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-indigo-200 border border-white/10">AI-Powered</span>
          <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-indigo-200 border border-white/10">All-in-One Studio</span>
          <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-indigo-200 border border-white/10">Auto-Publish</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Status Akun" value={isPro || user.role === 'admin' ? 'PRO' : 'Free'} icon={Crown} color={isPro || user.role === 'admin' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"} />
        <StatCard title="Content Generated" value={analyticsService.getSummary().totalContentGenerated} icon={Zap} color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
        <StatCard title="Published" value={analyticsService.getSummary().totalPublished} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <StatCard title="AI Kuota" value={isPro || user.role === 'admin' ? 'Unlimited' : 3 - usageCount} icon={Sparkles} color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureCard title="Clip from Link" desc="Paste link video, AI langsung memotong dan membuat short video siap publikasi." icon={Link} onClick={() => navigateTo('link-to-clip')} gradient="from-indigo-500 to-purple-600" />
          <FeatureCard title="Upload Video" desc="Upload file video, AI mendeteksi momen terbaik dan membuat 5-30 clip." icon={UploadCloud} onClick={() => navigateTo('upload-video')} gradient="from-purple-500 to-pink-600" />
          <FeatureCard title="AI Photo Studio" desc="Upload foto, AI membuat visual promosi, UGC, thumbnail, dan iklan." icon={Image} onClick={() => navigateTo('photo-studio')} gradient="from-pink-500 to-rose-600" />
          <FeatureCard title="Caption Generator" desc="AI menulis caption, hook, hashtag, dan SEO untuk semua platform." icon={FileText} onClick={() => navigateTo('caption')} gradient="from-emerald-500 to-teal-600" />
          <FeatureCard title="Publish Center" desc="Jadwalkan dan publish konten ke semua platform sosial media." icon={Share2} onClick={() => navigateTo('publish')} gradient="from-blue-500 to-indigo-600" />
          <FeatureCard title="Brand Kit" desc="Atur warna, font, logo, watermark, dan CTA brand Anda." icon={Palette} onClick={() => navigateTo('brand-kit')} gradient="from-amber-500 to-orange-600" />
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Brain className="w-5 h-5 text-indigo-500" /> AI Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Tip Hari Ini</p>
                <p className="text-sm text-indigo-800 dark:text-indigo-200 mt-1">Video dengan hook pertanyaan di 3 detik pertama meningkatkan retention 40%.</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Performa</p>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">Konten short video (15-30 detik) performa 2x lebih baik.</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500" /> Jadwal Terdekat</h3>
              <button onClick={() => navigateTo('calendar')} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Lihat</button>
            </div>
            <div className="space-y-3">
              <ScheduleItem time="14:00" title="Skincare Reels" platform="Instagram" status="scheduled" />
              <ScheduleItem time="19:00" title="Tutorial AI Part 1" platform="TikTok" status="scheduled" />
              <ScheduleItem time="Selesai" title="Review Produk" platform="YouTube" status="published" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

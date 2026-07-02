import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Eye, Heart, Zap, Brain, Sparkles,
  RefreshCw, Activity, Globe
} from 'lucide-react';
import { analyticsService } from '../services/AnalyticsService';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(analyticsService.getSummary());
  const [insights, setInsights] = useState(analyticsService.getContentInsights());
  const [weeklyStats, setWeeklyStats] = useState(analyticsService.getWeeklyStats());
  const [period, setPeriod] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSummary(analyticsService.getSummary());
      setInsights(analyticsService.getContentInsights());
      setWeeklyStats(analyticsService.getWeeklyStats());
      setIsRefreshing(false);
    }, 500);
  };

  const maxWeeklyValue = Math.max(1, ...weeklyStats.map(d => d.generated + d.published));

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Content Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400">Pantau performa konten dan dapatkan insight berbasis AI.</p>
        </div>
        <button onClick={refresh} disabled={isRefreshing} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Dibuat', value: summary.totalContentGenerated, icon: <Zap className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' },
          { label: 'Total Dipublikasi', value: summary.totalPublished, icon: <Globe className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' },
          { label: 'Total Views', value: summary.totalViews.toLocaleString(), icon: <Eye className="w-4 h-4" />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' },
          { label: 'Total Engagement', value: summary.totalEngagement.toLocaleString(), icon: <Heart className="w-4 h-4" />, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500" /> Aktivitas 7 Hari Terakhir</h3>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 dark:text-white outline-none">
              <option value="7d">7 Hari</option>
              <option value="30d">30 Hari</option>
              <option value="90d">90 Hari</option>
            </select>
          </div>
          <div className="flex items-end gap-2 h-48">
            {weeklyStats.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center justify-end h-40 gap-0.5">
                  <div className="w-full bg-indigo-500 rounded-t-md transition-all duration-500 hover:bg-indigo-600" style={{ height: `${(day.generated / maxWeeklyValue) * 100}%`, minHeight: day.generated > 0 ? '4px' : '0' }}></div>
                  <div className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 hover:bg-emerald-600" style={{ height: `${(day.published / maxWeeklyValue) * 100}%`, minHeight: day.published > 0 ? '4px' : '0' }}></div>
                </div>
                <span className="text-xs text-slate-500">{new Date(day.date).getDate()}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-500 rounded"></div> Dibuat</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded"></div> Dipublikasi</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4"><Brain className="w-5 h-5 text-amber-500" /> AI Content Insights</h3>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-500">Rata-rata konten/hari</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{insights.averageDailyContent}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-500">Total minggu ini</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{insights.totalThisWeek}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-500">Growth</p>
              <p className={`text-xl font-bold flex items-center gap-1 ${insights.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {insights.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {insights.growth}%
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Rekomendasi</p>
              <ul className="space-y-1">
                {insights.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                    <span>•</span> {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Top Platform</h3>
          <div className="space-y-3">
            {Object.entries(summary.videosByPlatform || {}).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).slice(0, 5).map(([platform, count]) => (
              <div key={platform} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-indigo-600">{platform.charAt(0).toUpperCase()}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{platform}</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(count / Math.max(1, Object.values(summary.videosByPlatform || {}).reduce((a, b) => a + b, 0))) * 100}%` }}></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
              </div>
            ))}
            {Object.values(summary.videosByPlatform || {}).reduce((a, b) => a + b, 0) === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data platform. Mulai publikasi konten!</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Proyek Terbaru</h3>
          <div className="space-y-3">
            {summary.recentProjects.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada proyek.</p>
            ) : (
              summary.recentProjects.map((project, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                    {project.type === 'link-to-clip' ? <Globe className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{project.type?.replace(/-/g, ' ') || 'Proyek'}</p>
                    <p className="text-xs text-slate-500">{new Date(project.timestamp).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className="text-xs text-slate-400">{project.clips || ''}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

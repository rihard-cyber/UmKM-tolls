import React, { useState, useEffect } from 'react';
import {
  Calendar, UploadCloud, CheckCircle2, Clock,
  Globe, Plus, X, RefreshCw,
  Link, Trash2, Share2
} from 'lucide-react';
import { socialMediaService, PLATFORMS } from '../services/SocialMediaService';
import { analyticsService } from '../services/AnalyticsService';
import { useGlobal } from '../contexts/GlobalContext';

export default function PublishCenter({ isPro, setShowPaymentModal }) {
  const { contentPipeline, addScheduledPost, removeScheduledPost, clearPendingPublish } = useGlobal();
  const [activeTab, setActiveTab] = useState(contentPipeline.pendingPublish ? 'pending' : 'calendar');
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ title: '', platform: 'tiktok', caption: '', scheduledDate: '', scheduledTime: '' });
  const [notification, setNotification] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);

  useEffect(() => {
    setConnectedAccounts(socialMediaService.getConnectedAccounts());
    if (contentPipeline.pendingPublish) setActiveTab('pending');
  }, [contentPipeline.pendingPublish]);

  const showNotif = (msg, type = 'emerald') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConnect = async (platform) => {
    if (!isPro) { setShowPaymentModal(true); return; }
    setIsConnecting(true);
    try {
      await socialMediaService.connectAccount(platform);
      setConnectedAccounts(socialMediaService.getConnectedAccounts());
    } catch (err) {
      showNotif('Gagal menghubungkan akun: ' + err.message, 'red');
    }
    setIsConnecting(false);
  };

  const handleDisconnect = (accountId) => {
    if (!window.confirm('Yakin ingin memutuskan akun ini? Semua jadwal publikasi ke akun ini akan dibatalkan.')) return;
    socialMediaService.disconnectAccount(accountId);
    setConnectedAccounts(socialMediaService.getConnectedAccounts());
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleForm.title.trim()) return;
    const scheduledTime = scheduleForm.scheduledDate && scheduleForm.scheduledTime
      ? `${scheduleForm.scheduledDate} ${scheduleForm.scheduledTime}`
      : 'Segera';
    addScheduledPost({
      title: scheduleForm.title,
      platform: PLATFORMS.find(p => p.id === scheduleForm.platform)?.name || scheduleForm.platform,
      platformId: scheduleForm.platform,
      caption: scheduleForm.caption,
      scheduledTime,
      status: 'scheduled'
    });
    setScheduleForm({ title: '', platform: 'tiktok', caption: '', scheduledDate: '', scheduledTime: '' });
    setShowScheduleModal(false);
    showNotif('Konten berhasil dijadwalkan!');
  };

  const handlePublishNow = async (post) => {
    setIsPublishing(true);
    setPublishStatus(null);
    try {
      const targetPlatform = post.platformId || post.platform || 'tiktok';
      const caption = post.caption || '';
      const account = connectedAccounts.find(a => a.platform === targetPlatform);
      await socialMediaService.publishContent({ videoBlob: null, caption, platform: targetPlatform, accountId: account?.id || null, scheduleTime: null });
      addScheduledPost({ title: post.title || 'Posting Baru', platform: PLATFORMS.find(p => p.id === targetPlatform)?.name || targetPlatform, platformId: targetPlatform, caption, scheduledTime: new Date().toLocaleString('id-ID'), status: 'published' });
      analyticsService.trackProject({ type: 'publish', platform: targetPlatform });
      setPublishStatus('success');
      showNotif('Konten berhasil dipublikasi!');
    } catch (err) {
      setPublishStatus('error');
      showNotif('Gagal publikasi: ' + err.message, 'red');
    }
    setIsPublishing(false);
  };

  const handlePublishPending = async () => {
    const pp = contentPipeline.pendingPublish;
    if (!pp) return;
    const title = pp.type === 'clips' ? `${pp.clips.length} clip` : pp.type === 'captions' ? (pp.topic || 'Caption') : 'Creative';
    const targetPlatform = connectedAccounts[0]?.platform || 'tiktok';
    await handlePublishNow({ title, platform: targetPlatform, platformId: targetPlatform, caption: pp.caption || pp.prompt || '' });
    clearPendingPublish();
  };

  const handleAcceptPending = () => {
    if (!contentPipeline.pendingPublish) return;
    const pp = contentPipeline.pendingPublish;
    if (pp.type === 'clips') {
      setScheduleForm(prev => ({
        ...prev,
        title: `${pp.clips.length} clip dari SmartLinkToClip`,
        caption: pp.caption || ''
      }));
    } else if (pp.type === 'captions') {
      const firstCaption = Object.values(pp.captions)[0] || '';
      setScheduleForm(prev => ({
        ...prev,
        title: pp.topic || 'Caption dari CaptionEngine',
        caption: firstCaption
      }));
    } else if (pp.type === 'creative') {
      setScheduleForm(prev => ({
        ...prev,
        title: `Creative dari Photo Studio`,
        caption: pp.prompt || ''
      }));
    }
    setShowScheduleModal(true);
  };

  const scheduledPosts = contentPipeline.scheduledPosts;
  const totalScheduled = scheduledPosts.filter(p => p.status === 'scheduled').length;
  const totalPublished = scheduledPosts.filter(p => p.status === 'published').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
      {notification && (
        <div className={`fixed bottom-4 right-4 ${notification.type === 'red' ? 'bg-red-600' : 'bg-emerald-600'} text-white px-6 py-3 rounded-xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4`}>
          {notification.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Publish Center</h2>
          <p className="text-slate-500 dark:text-slate-400">Kelola jadwal posting, akun terhubung, dan publikasi konten.</p>
        </div>
        <button onClick={() => setShowScheduleModal(true)} disabled={!isPro} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md">
          <Plus className="w-4 h-4" /> Jadwalkan Konten
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Akun Terhubung', value: connectedAccounts.length, icon: <Globe className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Terjadwal', value: totalScheduled, icon: <Calendar className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
          { label: 'Telah Dipublikasi', value: totalPublished, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
          { label: 'Menunggu', value: contentPipeline.pendingPublish ? 1 : 0, icon: <Clock className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'calendar', label: '📅 Content Calendar' },
          { id: 'pending', label: `⏳ Menunggu (${contentPipeline.pendingPublish ? 1 : 0})` },
          { id: 'accounts', label: '🔗 Akun Terhubung' },
          { id: 'queue', label: '📤 Queue & History' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && contentPipeline.pendingPublish && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-amber-500" /> Konten Menunggu Publikasi
            </h3>
            <button onClick={() => { clearPendingPublish(); setActiveTab('calendar'); }} className="text-xs text-slate-400 hover:text-red-500 transition-all flex items-center gap-1"><X className="w-3.5 h-3.5" /> Hapus</button>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              {contentPipeline.pendingPublish.type === 'clips' && `${contentPipeline.pendingPublish.clips.length} clip siap dipublikasi`}
              {contentPipeline.pendingPublish.type === 'captions' && `Caption untuk "${contentPipeline.pendingPublish.topic}" siap`}
              {contentPipeline.pendingPublish.type === 'creative' && 'Creative visual siap dipublikasi'}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAcceptPending} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all">
              <Calendar className="w-4 h-4" /> Jadwalkan
            </button>
            <button onClick={handlePublishPending} disabled={isPublishing} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50">
              {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              {isPublishing ? 'Mempublikasi...' : 'Publikasi Sekarang'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white">Kalender Konten - {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-all"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-500 py-2">{day}</div>
            ))}
            {(() => {
              const now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const today = now.getDate();
              const offset = firstDay === 0 ? 6 : firstDay - 1;
              const cells = [];
              for (let i = 0; i < offset; i++) {
                cells.push(<div key={`pad-${i}`} className="p-2" />);
              }
              for (let d = 1; d <= daysInMonth; d++) {
                const isToday = d === today;
                const hasPost = scheduledPosts.some(p => {
                  const dt = new Date(p.scheduledTime);
                  return dt.getDate() === d && dt.getMonth() === month;
                });
                cells.push(
                  <div key={`day-${d}`} className={`p-2 rounded-xl text-center text-sm transition-all ${isToday ? 'bg-indigo-600 text-white font-bold shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    <span>{d}</span>
                    {hasPost && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1"></div>}
                  </div>
                );
              }
              return cells;
            })()}
          </div>
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Postingan Terjadwal</h4>
            {scheduledPosts.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                Belum ada jadwal. Klik "Jadwalkan Konten" untuk mulai.
              </div>
            ) : (
              scheduledPosts.map(post => (
                <div key={post.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className={`p-2 rounded-lg ${post.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {post.status === 'published' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{post.title}</p>
                    <p className="text-xs text-slate-500">{post.platform} • {post.scheduledTime}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {post.status === 'published' ? 'Published' : 'Scheduled'}
                  </span>
                  {post.status === 'scheduled' && (
                    <button onClick={() => { if (window.confirm('Hapus jadwal posting ini?')) removeScheduledPost(post.id); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Hubungkan Akun Baru</h3>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => handleConnect(p.id)} disabled={isConnecting || connectedAccounts.some(a => a.platform === p.id)} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all disabled:opacity-50 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: p.color }}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {connectedAccounts.some(a => a.platform === p.id) ? '✓ Terhubung' : 'Klik untuk hubungkan'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Akun Terhubung ({connectedAccounts.length})</h3>
            {connectedAccounts.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Link className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                Belum ada akun terhubung
              </div>
            ) : (
              <div className="space-y-3">
                {connectedAccounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: PLATFORMS.find(p => p.id === acc.platform)?.color || '#6366f1' }}>
                        {acc.platformName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{acc.platformName}</p>
                        <p className="text-xs text-slate-500">@{acc.username}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDisconnect(acc.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Queue & Riwayat Publikasi</h3>
          {scheduledPosts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              <UploadCloud className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>Belum ada konten yang dipublikasi atau dijadwalkan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.map(post => (
                <div key={post.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{post.title}</p>
                    <p className="text-xs text-slate-500">{post.platform} • {post.scheduledTime}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {post.status === 'published' ? 'Published' : 'Scheduled'}
                  </span>
                  {post.status === 'scheduled' && (
                    <button onClick={() => { if (window.confirm('Hapus jadwal posting ini?')) removeScheduledPost(post.id); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Jadwalkan Konten Baru</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Konten</label>
                <input type="text" value={scheduleForm.title} onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} required placeholder="Contoh: Review Skincare" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                <select value={scheduleForm.platform} onChange={(e) => setScheduleForm({ ...scheduleForm, platform: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm">
                  {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Caption</label>
                <textarea value={scheduleForm.caption} onChange={(e) => setScheduleForm({ ...scheduleForm, caption: e.target.value })} rows={4} placeholder="Caption untuk postingan..." className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                  <input type="date" value={scheduleForm.scheduledDate} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Waktu</label>
                  <input type="time" value={scheduleForm.scheduledTime} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white outline-none text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button aria-label="Jadwalkan posting" type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all">Jadwalkan</button>
                <button aria-label="Publikasi sekarang" type="button" disabled={isPublishing} onClick={async () => {
                  setScheduleForm(prev => ({ ...prev, ...scheduleForm }));
                  await handlePublishNow({
                    title: scheduleForm.title || 'Posting Baru',
                    platform: scheduleForm.platform,
                    platformId: scheduleForm.platform,
                    caption: scheduleForm.caption
                  });
                  setShowScheduleModal(false);
                }} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50">
                  {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Publikasi Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

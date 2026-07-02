import { MonitorPlay, Camera, Smartphone, Globe, CheckCircle2 } from 'lucide-react';

export default function ScheduleItem({ time, title, platform, status }) {
  const getIcon = () => {
    if (platform === 'YouTube') return <MonitorPlay className="w-4 h-4 text-red-500" />;
    if (platform === 'Instagram') return <Camera className="w-4 h-4 text-pink-500" />;
    if (platform === 'TikTok') return <Smartphone className="w-4 h-4 text-slate-900 dark:text-white" />;
    return <Globe className="w-4 h-4 text-blue-500" />;
  };
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{time}</p>
      </div>
      <div>
        {status === 'published' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full uppercase">Jadwal</span>
        )}
      </div>
    </div>
  );
}

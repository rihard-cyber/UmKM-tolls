export default function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

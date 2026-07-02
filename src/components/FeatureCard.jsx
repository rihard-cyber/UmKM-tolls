import { ChevronRight } from 'lucide-react';

export default function FeatureCard({ icon: Icon, title, desc, color, onClick }) {
  return (
    <button onClick={onClick} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all text-left group">
      <div className={`p-3 rounded-xl ${color} w-fit mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
      <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
        Buka <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </button>
  );
}

import React from 'react';
import { LayoutDashboard, Calendar, Menu, Plus, Share2 } from 'lucide-react';

export default function MobileBottomNav({ currentPage, navigateTo, onOpenMenu, user }) {
  const isActive = (pages) => pages.includes(currentPage);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] transition-colors duration-300" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className={`flex items-center h-16 px-2 relative ${isAdmin ? 'justify-center gap-16' : 'justify-around'}`}>
        
        {/* Home / Dashboard */}
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
            isActive(['home']) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 mb-1 ${isActive(['home']) ? 'fill-indigo-50 dark:fill-indigo-900/30' : ''}`} />
          <span className="text-[10px] font-semibold">{isAdmin ? 'Dashboard' : 'Home'}</span>
        </button>

        {!isAdmin && (
          <>
            {/* Publish / Calendar */}
            <button
              onClick={() => navigateTo('calendar')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive(['calendar', 'publish']) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500'
              }`}
            >
              <Calendar className={`w-5 h-5 mb-1 ${isActive(['calendar', 'publish']) ? 'fill-indigo-50 dark:fill-indigo-900/30' : ''}`} />
              <span className="text-[10px] font-semibold">Jadwal</span>
            </button>

            {/* Floating Action Button (Create) */}
            <div className="relative -top-6 flex justify-center w-16">
              <button
                onClick={() => onOpenMenu('create')}
                className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(99,102,241,0.4)] active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            {/* Studio / Templates */}
            <button
              onClick={() => navigateTo('photo-studio')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive(['photo-studio', 'templates']) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500'
              }`}
            >
              <Share2 className={`w-5 h-5 mb-1 ${isActive(['photo-studio', 'templates']) ? 'fill-indigo-50 dark:fill-indigo-900/30' : ''}`} />
              <span className="text-[10px] font-semibold">Studio</span>
            </button>
          </>
        )}

        {/* Menu (More) */}
        <button
          onClick={() => onOpenMenu('more')}
          className="flex flex-col items-center justify-center w-16 h-full text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <Menu className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Menu</span>
        </button>

      </div>
    </div>
  );
}

import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Crown, Sparkles, CheckCircle2, Loader2, UploadCloud,
  Menu, X, Moon, Sun, LogOut,
  Calendar, Smartphone, CreditCard,
  QrCode, Building, Mail, Lock, UserCircle, Settings,
  Image, Palette, Users, BarChart3, Link, Zap, Layers,
  Share2, Brain, Key, FileText, LayoutDashboard, AlertTriangle
} from 'lucide-react';

import { GlobalProvider, useGlobal } from './contexts/GlobalContext';
import { validateEmail, validatePassword, sanitizeHTML, logSecurityEvent } from './services/SecurityService';
import { supabase } from './services/supabase';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import Dashboard from './pages/Dashboard';
import NavItem from './components/NavItem';
import NavSection from './components/NavSection';
import MobileBottomNav from './components/MobileBottomNav';
import StatCard from './components/StatCard';

const SmartLinkToClip = lazy(() => import('./pages/SmartLinkToClip'));
const CaptionEngine = lazy(() => import('./pages/CaptionEngine'));
const PhotoToCreative = lazy(() => import('./pages/PhotoToCreative'));
const PublishCenter = lazy(() => import('./pages/PublishCenter'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const BrandKitPage = lazy(() => import('./pages/BrandKitPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const TeamWorkspace = lazy(() => import('./pages/TeamWorkspace'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const PAGE_LOADER = (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
  </div>
);

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'link-to-clip', label: 'Clip from Link', icon: Link },
  { id: 'upload-video', label: 'Upload Video', icon: UploadCloud },
  { id: 'photo-studio', label: 'AI Photo Studio', icon: Image },
  { id: 'caption', label: 'Caption Generator', icon: FileText },
  { id: 'brand-kit', label: 'Brand Kit', icon: Palette },
  { id: 'templates', label: 'Templates', icon: Layers },
  { id: 'calendar', label: 'Content Calendar', icon: Calendar },
  { id: 'publish', label: 'Publish Center', icon: Share2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'team', label: 'Team Workspace', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <GlobalProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </GlobalProvider>
    </ErrorBoundary>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem('clipperai_dark') === 'true'; }
    catch { return false; }
  });
  const { user, login, logout, creditState, syncCredits } = useGlobal();
  const [currentPage, setCurrentPage] = useState('home');
  const [usageCount, setUsageCount] = useState(() => {
    try { return parseInt(localStorage.getItem('clipperai_usage') || '0', 10); }
    catch { return 0; }
  });
  const [isPro, setIsPro] = useState(() => {
    try { return localStorage.getItem('clipperai_pro') === 'true'; }
    catch { return false; }
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mobileMenuState, setMobileMenuState] = useState(null); // 'more', 'create', null
  const [paymentSettings, setPaymentSettings] = useState({
    bankBCA: '3901 8829 1102',
    bankBRI: '',
    bankMandiri: '',
    bankBNI: '',
    ewalletType: 'GoPay',
    ewalletNumber: '0812-xxxx-xxxx',
    qrisUrl: ''
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try { localStorage.setItem('clipperai_dark', String(isDarkMode)); }
    catch {}
  }, [isDarkMode]);

  useEffect(() => {
    try { localStorage.setItem('clipperai_usage', String(usageCount)); }
    catch {}
  }, [usageCount]);

  useEffect(() => {
    try { localStorage.setItem('clipperai_pro', String(isPro)); }
    catch {}
  }, [isPro]);

  useEffect(() => {
    if (user) {
      logSecurityEvent('login', { email: user.email, role: user.role });
    }
  }, [user]);

  if (!user) {
    return (
      <AuthScreen onLogin={login} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
    );
  }

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuState(null);
  };

  const recordUsage = () => {
    if (isPro || user.role === 'admin') return true;
    if (usageCount >= 3) {
      setShowPaymentModal(true);
      return false;
    }
    setUsageCount(prev => prev + 1);
    return true;
  };

  const handleLogout = () => {
    logSecurityEvent('logout', { email: user.email });
    logout();
    setIsPro(false);
    setUsageCount(0);
    setCurrentPage('home');
  };

  const renderPage = () => {
    if (user.role === 'admin') {
      return <AdminDashboard paymentSettings={paymentSettings} setPaymentSettings={setPaymentSettings} />;
    }

    switch (currentPage) {
      case 'home': return <Dashboard navigateTo={navigateTo} usageCount={usageCount} isPro={isPro} user={user} />;
      case 'link-to-clip': return <SmartLinkToClip recordUsage={recordUsage} isPro={isPro} setShowPaymentModal={setShowPaymentModal} navigateTo={navigateTo} />;
      case 'upload-video': return <SmartLinkToClip recordUsage={recordUsage} isPro={isPro} setShowPaymentModal={setShowPaymentModal} navigateTo={navigateTo} defaultInputMode="upload" />;
      case 'photo-studio': return <PhotoToCreative recordUsage={recordUsage} isPro={isPro} navigateTo={navigateTo} />;
      case 'caption': return <CaptionEngine recordUsage={recordUsage} isPro={isPro} navigateTo={navigateTo} />;
      case 'brand-kit': return <BrandKitPage />;
      case 'templates': return <TemplatesPage />;
      case 'calendar': return <PublishCenter isPro={isPro} setShowPaymentModal={setShowPaymentModal} />;
      case 'publish': return <PublishCenter isPro={isPro} setShowPaymentModal={setShowPaymentModal} />;
      case 'analytics': return <AnalyticsPage />;
      case 'team': return <TeamWorkspace isPro={isPro} setShowPaymentModal={setShowPaymentModal} />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard navigateTo={navigateTo} usageCount={usageCount} isPro={isPro} user={user} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">

      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm z-10 transition-colors relative">
        <div className="p-6 relative z-10">
          <h1 className="text-2xl font-black running-text flex items-center gap-2 drop-shadow-lg">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
            ClipperAI Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium tracking-wide uppercase">
            {user.role === 'admin' ? 'Admin Portal' : 'AI Content Studio'}
          </p>
        </div>

        <div className="px-6 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.role === 'admin' ? 'bg-slate-900 text-white dark:bg-slate-800' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>
              {sanitizeHTML(user.name?.charAt(0) || '?')}
            </div>
            <div>
              <p className="text-sm font-bold dark:text-white">{sanitizeHTML(user.name)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role === 'admin' ? 'Pemilik Sistem' : 'Creator'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {user.role === 'admin' ? (
            <NavItem active={true} onClick={() => {}} icon={Settings} label="Dashboard Pusat" />
          ) : (
            <>
              <NavSection label="Utama" />
              {NAV_ITEMS.slice(0, 3).map(item => (
                <NavItem key={item.id} active={currentPage === item.id} onClick={() => navigateTo(item.id)} icon={item.icon} label={item.label} />
              ))}
              <NavSection label="Kreatif" />
              {NAV_ITEMS.slice(3, 8).map(item => (
                <NavItem key={item.id} active={currentPage === item.id} onClick={() => navigateTo(item.id)} icon={item.icon} label={item.label} />
              ))}
              <NavSection label="Publikasi" />
              {NAV_ITEMS.slice(8, 11).map(item => (
                <NavItem key={item.id} active={currentPage === item.id} onClick={() => navigateTo(item.id)} icon={item.icon} label={item.label} />
              ))}
              <NavSection label="Tim & Pengaturan" />
              {NAV_ITEMS.slice(11).map(item => (
                <NavItem key={item.id} active={currentPage === item.id} onClick={() => navigateTo(item.id)} icon={item.icon} label={item.label} />
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <span className="flex items-center gap-2">{isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</span>
          </button>
          {user.role !== 'admin' && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Crown className={`w-5 h-5 ${isPro ? 'text-amber-500' : 'text-indigo-600 dark:text-indigo-400'}`} />
                <span className="font-semibold text-sm text-indigo-900 dark:text-indigo-300">{isPro ? 'Pro Plan' : 'Free Plan'}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">Credits</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{creditState?.credits ?? 0}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-500 ${isPro ? 'bg-amber-500' : 'bg-indigo-600 dark:bg-indigo-500'}`} style={{ width: `${Math.min(((creditState?.credits ?? 0) / 500) * 100, 100)}%` }}></div>
              </div>
              {isPro ? (
                <p className="text-xs text-slate-500 mb-3">{creditState?.credits ?? 0} credits remaining this month</p>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">🔥 {creditState?.credits ?? 0} credits — {3 - usageCount} free uses left</p>
              )}
              {!isPro && (
                <button onClick={() => setShowPaymentModal(true)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">Upgrade to Pro</button>
              )}
              <details className="mt-3 group">
                <summary className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none">Biaya Credit per Fitur</summary>
                <div className="mt-2 space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Caption AI</span><span>5 credits</span></div>
                  <div className="flex justify-between"><span>Generate Hook</span><span>3 credits</span></div>
                  <div className="flex justify-between"><span>Image Generate</span><span>15 credits</span></div>
                  <div className="flex justify-between"><span>Transcribe/menit</span><span>1 credit</span></div>
                  <div className="flex justify-between"><span>Render/menit</span><span>2 credits</span></div>
                  <div className="flex justify-between"><span>AI Copywriting</span><span>5 credits</span></div>
                </div>
              </details>
            </div>
          )}
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between p-4 shadow-sm transition-colors">
        <h1 className="text-xl font-black running-text flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          ClipperAI
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
            {sanitizeHTML(user.name?.charAt(0) || '?')}
          </div>
        </div>
      </div>

      {mobileMenuState && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuState(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            
            {mobileMenuState === 'more' && (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Menu Lainnya</h3>
                <nav className="space-y-1 mb-8">
                  {NAV_ITEMS.map(item => (
                    <NavItem key={item.id} active={currentPage === item.id} onClick={() => navigateTo(item.id)} icon={item.icon} label={item.label} />
                  ))}
                </nav>
                <button aria-label="Logout" onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl font-semibold transition-colors">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            )}

            {mobileMenuState === 'create' && (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Buat Konten Baru</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button onClick={() => navigateTo('link-to-clip')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg"><Link className="w-6 h-6" /></div>
                    <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Dari Link</span>
                  </button>
                  <button onClick={() => navigateTo('upload-video')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 hover:bg-purple-100 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg"><UploadCloud className="w-6 h-6" /></div>
                    <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Upload Video</span>
                  </button>
                  <button onClick={() => navigateTo('photo-studio')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800/50 hover:bg-pink-100 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg"><Image className="w-6 h-6" /></div>
                    <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">Photo Studio</span>
                  </button>
                  <button onClick={() => navigateTo('caption')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"><FileText className="w-6 h-6" /></div>
                    <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">AI Caption</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pt-16 pb-20 md:pt-0 md:pb-0 bg-slate-50 dark:bg-slate-950 relative transition-colors">
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-full">
          <Suspense fallback={PAGE_LOADER}>
            {renderPage()}
          </Suspense>
        </div>
      </main>

      {showPaymentModal && (
        <PaymentGatewayModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => { setIsPro(true); setShowPaymentModal(false); }}
          paymentSettings={paymentSettings}
        />
      )}

      <MobileBottomNav currentPage={currentPage} navigateTo={navigateTo} onOpenMenu={setMobileMenuState} user={user} />
    </div>
  );
}


function AuthScreen({ onLogin, isDarkMode, toggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [secretClickCount, setSecretClickCount] = useState(0);

  const handleSecretClick = () => {
    if (secretClickCount >= 4) { setIsAdminPortal(true); setSecretClickCount(0); }
    else setSecretClickCount(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Format email tidak valid');
      return;
    }
    if (!validatePassword(formData.password)) {
      setError('Password minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka');
      return;
    }

    setIsLoading(true);
    try {
      const isSuperAdmin = formData.email === 'richardpl.meha@gmail.com';
      const finalRole = (isAdminPortal || isSuperAdmin) ? 'admin' : 'user';
      const finalName = finalRole === 'admin' ? 'Administrator' : (isLogin ? (formData.email.split('@')[0] || 'User') : formData.name);

      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
        onLogin({ name: sanitizeHTML(finalName), email: sanitizeHTML(formData.email), role: finalRole });
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { name: finalName, role: finalRole } }
        });
        if (signUpError) throw signUpError;
        onLogin({ name: sanitizeHTML(finalName), email: sanitizeHTML(formData.email), role: finalRole });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Terjadi kesalahan saat login/register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <button onClick={toggleTheme} className="absolute top-6 right-6 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-300 z-50 hover:rotate-180 transition-transform duration-500">
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md relative group animate-in zoom-in-95 duration-500 rounded-3xl p-[3px] overflow-hidden shadow-2xl">
        <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite]" style={{ backgroundImage: 'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)' }}></div>
        <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] blur-md opacity-70" style={{ backgroundImage: 'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)' }}></div>

        <div className="relative bg-white dark:bg-slate-900 rounded-[22px] overflow-hidden h-full z-10 flex flex-col">
          <div className={`p-8 text-center transition-colors relative overflow-hidden bg-slate-900`}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-700/20 animate-pulse"></div>
            <div onClick={handleSecretClick} className="relative w-16 h-16 bg-white/10 rounded-2xl backdrop-blur flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-pointer anim-float border border-white/20">
              {isAdminPortal ? <Building className="w-8 h-8 text-white" /> : <Sparkles className="w-8 h-8 text-white" />}
            </div>
            <h1 className="relative text-3xl font-black running-text tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {isAdminPortal ? 'Admin Portal' : 'ClipperAI Studio'}
            </h1>
            <p className="relative text-indigo-200 text-sm mt-2 font-medium">
              {isAdminPortal ? 'Sistem Pemantauan Pusat' : 'Upload Once, Generate, Edit, Write, Schedule & Publish Everywhere'}
            </p>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center running-text">
              {isAdminPortal ? 'Login Pemilik Sistem' : (isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru')}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-20">
              {(!isLogin && !isAdminPortal) && (
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input id="name" required type="text" onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none" placeholder="Nama Lengkap" />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input id="email" required type="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none" placeholder={isAdminPortal ? "richardpl.meha@gmail.com" : "email@contoh.com"} />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input id="password" required type="password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none" placeholder="Min 8 karakter, huruf besar, kecil & angka" />
                </div>
              </div>
              <button disabled={isLoading} type="submit" className={`w-full py-3 text-white rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2 ${isAdminPortal ? 'bg-slate-900 hover:bg-black' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isAdminPortal ? 'Masuk Dashboard' : (isLogin ? 'Masuk' : 'Daftar Sekarang'))}
              </button>
            </form>

            {!isAdminPortal && (
              <>
                <div className="mt-6 relative z-20">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Atau lanjutkan dengan</span></div>
                  </div>
                  <button type="button" onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => { onLogin({ name: 'Google User', email: 'user@gmail.com', role: 'user' }); setIsLoading(false); }, 1000);
                  }} disabled={isLoading} className="mt-4 w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold transition-all flex justify-center items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Login menggunakan Google
                  </button>
                </div>
                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 relative z-20">
                  {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                  <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{isLogin ? 'Daftar' : 'Masuk'}</button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ paymentSettings, setPaymentSettings }) {
  const [transactions, setTransactions] = useState([
    { id: 1, user: 'Budi Santoso', method: 'QRIS', date: 'Hari ini, 10:30', status: 'pending' },
    { id: 2, user: 'Siti Aminah', method: 'Transfer BCA', date: 'Kemarin, 14:15', status: 'approved' },
    { id: 3, user: 'Ahmad Fauzi', method: 'GoPay', date: '2 Hari lalu, 09:00', status: 'rejected' },
  ]);
  const { apiKeys, updateKeys } = useGlobal();
  const [localKeys, setLocalKeys] = useState({
    core: apiKeys?.core?.join(', ') || '',
    translation: apiKeys?.translation?.join(', ') || '',
    voice: apiKeys?.voice?.join(', ') || ''
  });

  const handleSaveKeys = (e) => {
    e.preventDefault();
    updateKeys({
      core: localKeys.core.split(',').map(k => k.trim()).filter(Boolean),
      translation: localKeys.translation.split(',').map(k => k.trim()).filter(Boolean),
      voice: localKeys.voice.split(',').map(k => k.trim()).filter(Boolean)
    });
    alert("API Keys berhasil disimpan!");
  };

  const handleApprove = (id) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
  const handleReject = (id) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
  const handleUpdatePayment = (e) => { e.preventDefault(); alert("Pengaturan pembayaran berhasil diperbarui!"); };

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Admin</h2>
        <p className="text-slate-500 dark:text-slate-400">Pantau aktivitas pengguna dan konfirmasi pembayaran.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Pendapatan" value="Rp 12.500.000" icon={CreditCard} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <StatCard title="Total Pengguna Aktif" value="1,245" icon={Users} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
        <StatCard title="Server Load" value="42 Video" icon={Loader2} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-500" /> Manajemen API Keys AI (Failover System)
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Masukkan API key dipisahkan koma. Sistem akan failover jika key terkena rate limit.</p>
        <form onSubmit={handleSaveKeys} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Core AI (OpenAI, Gemini, Groq)</label>
            <textarea value={localKeys.core} onChange={(e) => setLocalKeys({ ...localKeys, core: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white outline-none font-mono text-sm" rows="2" placeholder="sk-xxx, AIzaSy..., gsk-xxx" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Translation (DeepL)</label>
            <textarea value={localKeys.translation} onChange={(e) => setLocalKeys({ ...localKeys, translation: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white outline-none font-mono text-sm" rows="2" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Voice (ElevenLabs, Google TTS)</label>
            <textarea value={localKeys.voice} onChange={(e) => setLocalKeys({ ...localKeys, voice: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white outline-none font-mono text-sm" rows="2" />
          </div>
          <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">Simpan API Keys</button>
        </form>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" /> Pengaturan Pembayaran
        </h3>
        <form onSubmit={handleUpdatePayment} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Building className="w-4 h-4" /> Transfer Bank</h4>
            <div className="space-y-3">
              {[
                { label: 'BCA', key: 'bankBCA' },
                { label: 'BRI', key: 'bankBRI' },
                { label: 'Mandiri', key: 'bankMandiri' },
                { label: 'BNI', key: 'bankBNI' },
              ].map(bank => (
                <div key={bank.key}>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">{bank.label}</label>
                  <input type="text" value={paymentSettings[bank.key]} onChange={(e) => setPaymentSettings({ ...paymentSettings, [bank.key]: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none text-sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Smartphone className="w-4 h-4" /> E-Wallet</h4>
            <select value={paymentSettings.ewalletType} onChange={(e) => setPaymentSettings({ ...paymentSettings, ewalletType: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none">
              <option value="GoPay">GoPay</option>
              <option value="DANA">DANA</option>
              <option value="OVO">OVO</option>
              <option value="LinkAja">LinkAja</option>
            </select>
            <input type="text" value={paymentSettings.ewalletNumber} onChange={(e) => setPaymentSettings({ ...paymentSettings, ewalletNumber: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none" placeholder="0812..." />
          </div>
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4"><QrCode className="w-4 h-4" /> QRIS</h4>
              <input type="text" value={paymentSettings.qrisUrl} onChange={(e) => setPaymentSettings({ ...paymentSettings, qrisUrl: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none text-xs" placeholder="URL gambar QRIS" />
            </div>
            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors mt-4">Simpan</button>
          </div>
        </form>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Transaksi</h3>
          <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
            {transactions.filter(t => t.status === 'pending').length} Pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-semibold">Pengguna</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Metode</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{t.user}</td>
                  <td className="p-4">{t.date}</td>
                  <td className="p-4">{t.method}</td>
                  <td className="p-4">
                    {t.status === 'pending' && <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-xs font-bold">Pending</span>}
                    {t.status === 'approved' && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-bold">Approved</span>}
                    {t.status === 'rejected' && <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-bold">Rejected</span>}
                  </td>
                  <td className="p-4 text-right">
                    {t.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleApprove(t.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">Approve</button>
                        <button onClick={() => handleReject(t.id)} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg text-xs font-bold transition-colors">Reject</button>
                      </div>
                    ) : <span className="text-xs text-slate-400 italic">Selesai</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PaymentGatewayModal({ onClose, onSuccess, paymentSettings }) {
  const [method, setMethod] = useState('qris');
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePayment = () => {
    setIsVerifying(true);
    setTimeout(() => { setIsVerifying(false); onSuccess(); }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 md:w-2/5 text-white flex flex-col justify-between">
          <div>
            <Crown className="w-10 h-10 text-amber-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
            <p className="text-slate-300 text-sm mb-6">Buka semua fitur premium platform.</p>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Unlimited AI Generations</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Auto-Publish All Platforms</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> No Watermark</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Team Collaboration</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Priority Support</li>
            </ul>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Mulai dari</p>
            <p className="text-3xl font-black text-white">Rp 99.000<span className="text-lg font-normal text-slate-400">/bulan</span></p>
          </div>
        </div>
        <div className="p-8 md:w-3/5 bg-slate-50 dark:bg-slate-900 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-6 h-6" /></button>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Pilih Pembayaran</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { id: 'qris', icon: QrCode, label: 'QRIS' },
              { id: 'ewallet', icon: Smartphone, label: 'E-Wallet' },
              { id: 'bank', icon: Building, label: 'Transfer' },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === m.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                <m.icon className="w-6 h-6" />
                <span className="text-xs font-bold">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center mb-6 min-h-[10rem] flex flex-col justify-center items-center">
            {method === 'qris' && (
              <div>
                <QrCode className="w-24 h-24 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Scan QRIS untuk pembayaran</p>
              </div>
            )}
            {method === 'ewallet' && (
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{paymentSettings?.ewalletType || 'GoPay'}</p>
                <p className="font-mono font-bold text-lg dark:text-white">{paymentSettings?.ewalletNumber || '0812-xxxx-xxxx'}</p>
              </div>
            )}
            {method === 'bank' && (
              <div className="w-full text-left">
                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full p-3 mb-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none">
                  <option value="BCA">BCA</option>
                  <option value="BRI">BRI</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                </select>
                <p className="font-mono font-bold text-lg dark:text-white tracking-widest">
                  {selectedBank === 'BCA' ? paymentSettings?.bankBCA : selectedBank === 'BRI' ? paymentSettings?.bankBRI : selectedBank === 'Mandiri' ? paymentSettings?.bankMandiri : paymentSettings?.bankBNI || '-'}
                </p>
              </div>
            )}
          </div>
          <button onClick={handlePayment} disabled={isVerifying} className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all">
            {isVerifying ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifikasi...</> : 'Saya Sudah Bayar'}
          </button>
        </div>
      </div>
    </div>
  );
}



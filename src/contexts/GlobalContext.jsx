import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { creditSystem } from '../services/CreditSystem';
import { AIGateway } from '../services/AIGateway';
import { queueSystem } from '../services/QueueSystem';
import { supabase } from '../services/supabase';

const GlobalContext = createContext(null);

const STORAGE_KEY = 'clipperai_session';
const PIPELINE_KEY = 'clipperai_pipeline';
const BRANDKIT_KEY = 'clipperai_brandkit';
const USAGE_KEY = 'clipperai_usage';
const PRO_KEY = 'clipperai_pro';
const CREDIT_KEY = 'clipperai_credits';

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&#x27;';
      default: return c;
    }
  });
}

export function GlobalProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch (e) { console.warn('Session load failed', e); }
    return null;
  });

  useEffect(() => {
    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const u = session.user;
        const safeData = {
          name: sanitizeInput(u.user_metadata?.name || u.email.split('@')[0] || 'User'),
          email: sanitizeInput(u.email || ''),
          role: u.user_metadata?.role === 'admin' || u.email === 'richardpl.meha@gmail.com' ? 'admin' : 'user',
          avatar: null
        };
        setUser(safeData);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const [apiKeys, setApiKeys] = useState({
    core: [],
    translation: [],
    voice: [],
    image: [],
    video: []
  });

  const [creditState, setCreditState] = useState(() => {
    try {
      const saved = localStorage.getItem(CREDIT_KEY);
      if (saved) creditSystem.load(JSON.parse(saved));
    } catch {}
    return creditSystem.save();
  });

  const syncCredits = useCallback(() => {
    setCreditState(creditSystem.save());
    try { localStorage.setItem(CREDIT_KEY, JSON.stringify(creditSystem.save())); }
    catch {}
  }, []);

  const [brandKit, setBrandKit] = useState(() => {
    try {
      const saved = localStorage.getItem(BRANDKIT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      logo: null,
      colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#f59e0b' },
      fonts: { heading: 'Inter', body: 'Inter' },
      watermark: null,
      intro: null,
      outro: null,
      cta: 'Klik link di bio untuk info lebih lanjut'
    };
  });

  const [workspace, setWorkspace] = useState({
    currentProject: null,
    projects: [],
    team: [],
    recentActivity: []
  });

  const [contentPipeline, setContentPipeline] = useState(() => {
    try {
      const saved = localStorage.getItem(PIPELINE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      clips: [],
      captions: {},
      photos: [],
      scheduledPosts: [],
      pendingPublish: null,
      thumbnailUrl: null
    };
  });

  const addGeneratedClips = useCallback((clips) => {
    setContentPipeline(prev => ({ ...prev, clips }));
  }, []);

  const addGeneratedCaptions = useCallback((captions) => {
    setContentPipeline(prev => ({ ...prev, captions }));
  }, []);

  const addGeneratedPhotos = useCallback((photos) => {
    setContentPipeline(prev => ({ ...prev, photos }));
  }, []);

  const addScheduledPost = useCallback((post) => {
    setContentPipeline(prev => ({
      ...prev,
      scheduledPosts: [...prev.scheduledPosts, { ...post, id: Date.now(), status: post.status || 'scheduled' }]
    }));
  }, []);

  const removeScheduledPost = useCallback((id) => {
    setContentPipeline(prev => ({
      ...prev,
      scheduledPosts: prev.scheduledPosts.filter(p => p.id !== id)
    }));
  }, []);

  const setPendingPublish = useCallback((item) => {
    setContentPipeline(prev => ({ ...prev, pendingPublish: item }));
  }, []);

  const clearPendingPublish = useCallback(() => {
    setContentPipeline(prev => ({ ...prev, pendingPublish: null }));
  }, []);

  const setThumbnailUrl = useCallback((url) => {
    setContentPipeline(prev => ({ ...prev, thumbnailUrl: url }));
  }, []);

  const login = useCallback((userData) => {
    // With Supabase, we mostly rely on onAuthStateChange.
    // This is kept for immediate state update during dev/mock scenarios.
    const safeData = {
      name: sanitizeInput(userData.name || 'User'),
      email: sanitizeInput(userData.email || ''),
      role: userData.role === 'admin' ? 'admin' : 'user',
      avatar: userData.avatar || null
    };
    setUser(safeData);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    } catch (e) { console.warn('Session save failed', e); }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) { console.warn('Session clear failed', e); }
  }, []);

  const updateKeys = useCallback((keys) => {
    const safeKeys = {};
    for (const [k, v] of Object.entries(keys)) {
      safeKeys[k] = Array.isArray(v) ? v.map(i => sanitizeInput(i)).filter(Boolean) : [];
    }
    setApiKeys(prev => ({ ...prev, ...safeKeys }));
  }, []);

  const updateBrandKit = useCallback((updates) => {
    setBrandKit(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(PIPELINE_KEY, JSON.stringify(contentPipeline)); }
    catch {}
  }, [contentPipeline]);

  useEffect(() => {
    try { localStorage.setItem(BRANDKIT_KEY, JSON.stringify(brandKit)); }
    catch {}
  }, [brandKit]);

  const value = {
    user, login, logout,
    apiKeys, updateKeys,
    brandKit, updateBrandKit,
    workspace, setWorkspace,
    contentPipeline, setContentPipeline,
    addGeneratedClips, addGeneratedCaptions,
    addGeneratedPhotos, addScheduledPost,
    removeScheduledPost, setPendingPublish,
    clearPendingPublish, setThumbnailUrl,
    creditSystem, creditState, syncCredits,
    AIGateway, queueSystem,
  };

  useEffect(() => {
    if (user) {
      document.documentElement.setAttribute('data-user-role', user.role);
    }
  }, [user]);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobal must be used within GlobalProvider');
  return ctx;
}

export { sanitizeInput };

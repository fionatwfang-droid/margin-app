
import React, { useState, useEffect } from 'react';
import { ICON_MAP } from '../constants';
import { Database, Cloud, CloudOff, LogOut, Smartphone, Share } from 'lucide-react';
import { supabase } from '../services/supabaseService';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LogoIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="160" fill="#22333b"/>
    <path d="M160 352h160M320 352V192" stroke="#c6ac8f" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="160" cy="160" r="32" fill="#c6ac8f"/>
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [session, setSession] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isPWA = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isPWA);

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session));
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => setSession(session));
      return () => subscription.unsubscribe();
    }
  }, []);

  const navItems = [
    { id: 'dashboard', label: '財務總覽', en: 'Dashboard', icon: 'TrendingUp' },
    { id: 'history', label: '收支清單', en: 'Ledger', icon: 'Calendar' },
    { id: 'analysis', label: '收支分析', en: 'Analytics', icon: 'PieChart' },
    { id: 'accounts', label: '資產帳戶', en: 'Assets', icon: 'Wallet' },
    { id: 'ai', label: '智慧分析', en: 'AI Coach', icon: 'BrainCircuit' },
  ];

  const activeItem = navItems.find(n => n.id === activeTab);

  return (
    <div className="flex bg-fin-paper h-[100dvh] w-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-80 bg-fin-paper border-r border-fin-ink/5 overflow-y-auto no-scrollbar">
        <div className="p-12 pb-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-5 mb-5">
            <LogoIcon className="w-14 h-14 shadow-2xl rounded-[1.5rem]" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-fin-ink tracking-tight flex items-baseline gap-1">
                留白 <span className="text-xs font-light italic text-fin-linen">Margin</span>
              </h1>
            </div>
          </div>
          
          {/* Brand Subtitles - Identity section */}
          <div className="mb-10 space-y-1.5 pl-1">
            <p className="text-[7px] font-black text-fin-linen uppercase tracking-[0.35em] leading-tight">
              AT THE EDGE OF BALANCE
            </p>
            <p className="text-[10px] font-medium text-fin-wood/60 italic leading-relaxed">
              於繁雜帳目中，尋一份生活餘裕。
            </p>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-fin-midnight/5 border border-fin-midnight/10 rounded-full w-fit">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-bold uppercase text-fin-midnight/60 tracking-widest flex items-center gap-1">
                <Database className="w-2.5 h-2.5" /> Local Vault Active
              </span>
            </div>
            {session ? (
               <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full w-fit">
                <Cloud className="w-2.5 h-2.5 text-blue-500" />
                <span className="text-[8px] font-bold uppercase text-blue-500 tracking-widest">Cloud Synced</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-fin-wood/5 border border-fin-wood/10 rounded-full w-fit">
                <CloudOff className="w-2.5 h-2.5 text-fin-wood/40" />
                <span className="text-[8px] font-bold uppercase text-fin-wood/40 tracking-widest">Offline Mode</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Tabs (Functional Tabs) */}
        <nav className="flex-1 px-8 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 px-7 py-5 rounded-[1.8rem] transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-fin-midnight text-fin-paper scale-[1.02]' 
                  : 'text-fin-ink/50 hover:text-fin-ink hover:bg-fin-linen/10'
              }`}
            >
              <div className={`${activeTab === item.id ? 'scale-125' : 'group-hover:scale-110'} transition-transform duration-500`}>
                {ICON_MAP[item.icon]}
              </div>
              <span className="font-bold tracking-[0.1em] text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 space-y-4">
          {!isStandalone && (
            <div className="p-6 bg-fin-linen/10 border border-fin-linen/20 rounded-[2rem] animate-pulse">
               <p className="text-[8px] font-black uppercase text-fin-linen tracking-widest mb-2 flex items-center gap-2">
                 <Smartphone className="w-3 h-3" /> PWA 安裝建議
               </p>
               <p className="text-[9px] text-fin-wood/60 leading-relaxed font-medium">
                 點擊分享並選擇「加入主畫面」，即可獲得原生 App 體驗。
               </p>
            </div>
          )}

          {session ? (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-fin-paper shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`} className="w-8 h-8 rounded-xl flex-shrink-0" />
                <span className="text-[10px] font-bold text-fin-ink truncate">{session.user.email}</span>
              </div>
              <button onClick={() => supabase?.auth.signOut()} className="p-2 text-fin-wood/40 hover:text-red-800 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-fin-midnight/5 border border-fin-midnight/10 rounded-[2rem] p-6 text-fin-ink">
              <p className="text-[9px] font-bold uppercase tracking-widest text-fin-linen mb-2">同步狀態</p>
              <p className="text-[9px] font-semibold text-fin-wood/40 leading-relaxed">
                尚未登入。數據僅保存在此裝置。
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-0 relative h-[100dvh]">
        <header className="shrink-0 bg-fin-paper/90 backdrop-blur-lg flex items-center justify-between px-6 md:px-12 pt-[env(safe-area-inset-top)] pb-4 z-30 border-b border-fin-ink/5">
          <div className="flex items-center gap-4 mt-2">
            <div className="md:hidden">
               <LogoIcon className="w-9 h-9 shadow-md rounded-xl" />
            </div>
            <div className="flex flex-col">
              <p className="text-[7px] font-black text-fin-linen uppercase tracking-[0.3em] mb-0.5">
                NAVIGATION / {activeItem?.en || 'SYSTEM'}
              </p>
              <h2 className="text-lg md:text-xl font-black text-fin-ink tracking-tight">
                {activeItem?.label}
              </h2>
            </div>
          </div>
          
          {!isStandalone && (
            <div className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-fin-linen/20 rounded-full border border-fin-linen/30 mt-2">
               <Share className="w-2.5 h-2.5 text-fin-midnight" />
               <span className="text-[7px] font-black uppercase text-fin-midnight tracking-widest">Install</span>
            </div>
          )}
        </header>
        
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 pt-6 pb-[calc(110px+env(safe-area-inset-bottom))]">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-fin-midnight/95 backdrop-blur-xl text-fin-paper rounded-[2.5rem] flex justify-around p-3 z-50 shadow-2xl border border-fin-linen/10 mb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 transition-all min-w-[55px] py-1 ${
                activeTab === item.id ? 'text-fin-linen scale-110' : 'text-fin-paper/30'
              }`}
            >
              <div className="scale-[0.85]">{ICON_MAP[item.icon]}</div>
              <span className="text-[7px] font-black tracking-widest mt-0.5">{item.label.substring(0,4)}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;

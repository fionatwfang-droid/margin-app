
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

    supabase?.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => setSession(session)) || { data: { subscription: { unsubscribe: () => {} } } };
    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { id: 'dashboard', label: '財務總覽', icon: 'TrendingUp' },
    { id: 'history', label: '收支清單', icon: 'Calendar' },
    { id: 'analysis', label: '收支分析', icon: 'PieChart' },
    { id: 'accounts', label: '資產帳戶', icon: 'Wallet' },
    { id: 'ai', label: '智慧分析', icon: 'BrainCircuit' },
  ];

  return (
    <div className="flex min-h-screen bg-fin-paper overflow-hidden h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-80 bg-fin-paper border-r border-fin-ink/5 overflow-y-auto no-scrollbar">
        <div className="p-12">
          <div className="flex items-center gap-5 mb-8">
            <LogoIcon className="w-14 h-14 shadow-2xl rounded-[1.5rem]" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-fin-ink tracking-tight flex items-baseline gap-1">
                留白 <span className="text-xs font-light italic text-fin-linen">Margin</span>
              </h1>
              <p className="text-[8px] font-bold text-fin-wood/30 uppercase tracking-[0.4em]">Essence of Flow</p>
            </div>
          </div>
          
          <div className="space-y-2">
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
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-24 md:h-28 bg-fin-paper/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 pt-[env(safe-area-inset-top)] shrink-0 z-30">
          <div className="flex items-center gap-5">
            <div className="md:hidden">
               <LogoIcon className="w-10 h-10 shadow-lg rounded-xl" />
            </div>
            <div className="flex flex-col">
              <p className="text-[8px] font-bold text-fin-linen uppercase tracking-[0.3em] mb-1">Navigation / {activeTab}</p>
              <h2 className="text-lg md:text-xl font-bold text-fin-ink tracking-tight">
                {navItems.find(n => n.id === activeTab)?.label}
              </h2>
            </div>
          </div>
          
          {!isStandalone && (
            <div className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-fin-linen/20 rounded-full border border-fin-linen/30 animate-bounce">
               <Share className="w-3 h-3 text-fin-midnight" />
               <span className="text-[7px] font-black uppercase text-fin-midnight tracking-widest">Install</span>
            </div>
          )}
        </header>
        
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 pb-36 md:pb-12 pt-4">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-8 left-4 right-4 bg-fin-midnight/95 backdrop-blur-xl text-fin-paper rounded-[2.8rem] flex justify-around p-4 z-50 shadow-2xl border border-fin-linen/10 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all min-w-[50px] ${
                activeTab === item.id ? 'text-fin-linen scale-110' : 'text-fin-paper/30'
              }`}
            >
              <div className="scale-90">{ICON_MAP[item.icon]}</div>
              <span className="text-[7px] font-bold tracking-widest mt-0.5">{item.label.substring(0,4)}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;

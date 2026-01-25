
import React from 'react';
import { ICON_MAP } from '../constants';

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
  const navItems = [
    { id: 'dashboard', label: '財務總覽', icon: 'TrendingUp' },
    { id: 'history', label: '收支清單', icon: 'Calendar' },
    { id: 'analysis', label: '收支分析', icon: 'PieChart' },
    { id: 'accounts', label: '資產帳戶', icon: 'Wallet' },
    { id: 'ai', label: '智慧分析', icon: 'BrainCircuit' },
  ];

  return (
    <div className="flex min-h-screen bg-fin-paper">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-80 bg-fin-paper border-r border-fin-ink/5">
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
          <div className="space-y-1.5 opacity-80">
            <p className="text-[11px] font-medium text-fin-ink tracking-wider">
              於繁雜帳目中，尋一份生活餘裕。
            </p>
            <p className="text-[9px] font-bold text-fin-wood/40 tracking-[0.25em] uppercase">
              AT THE EDGE OF BALANCE.
            </p>
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

        <div className="p-10">
          <div className="bg-fin-midnight/5 border border-fin-midnight/10 rounded-[2.8rem] p-8 text-fin-ink">
            <p className="text-[9px] font-bold uppercase tracking-widest text-fin-linen mb-4">年度預算進度</p>
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-3xl font-bold">78%</span>
              <span className="text-[10px] text-fin-ink/40 font-semibold tracking-tight">剩餘 $45,200</span>
            </div>
            <div className="w-full bg-fin-midnight/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-fin-linen h-full rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-28 bg-transparent flex items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-5">
            <div className="md:hidden">
               <LogoIcon className="w-12 h-12 shadow-lg rounded-2xl" />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-fin-linen uppercase tracking-[0.3em] mb-1">Navigation / {activeTab}</p>
              <h2 className="text-xl font-bold text-fin-ink tracking-tight">
                {navItems.find(n => n.id === activeTab)?.label}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button className="hidden sm:block text-fin-ink/30 hover:text-fin-ink transition-colors">
              {ICON_MAP.Settings}
            </button>
            <div className="flex items-center gap-4 pl-4 md:pl-8 border-l border-fin-ink/5">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-fin-ink">生活策劃者</p>
                <p className="text-[9px] text-fin-linen font-semibold uppercase tracking-widest">心流方案 / Flow Essence</p>
              </div>
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-fin-linen/20 border border-fin-linen/40 overflow-hidden shadow-sm">
                <img src="https://picsum.photos/seed/minimal/48/48" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 pb-32 md:pb-12">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-8 left-4 right-4 bg-fin-midnight/95 backdrop-blur-lg text-fin-paper rounded-[2.8rem] flex justify-around p-5 z-50 shadow-2xl border border-fin-linen/10 overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-2 transition-all min-w-[60px] ${
              activeTab === item.id ? 'text-fin-linen scale-110' : 'text-fin-paper/30'
            }`}
          >
            {ICON_MAP[item.icon]}
            <span className="text-[8px] font-bold tracking-widest mt-1">{item.label.substring(0,4)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;

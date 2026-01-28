
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import AccountList from './components/AccountList';
import AICoach from './components/AICoach';
import TransactionModal from './components/TransactionModal';
import AccountModal from './components/AccountModal';
import CSVImporterModal from './components/CSVImporterModal';
import SyncModal from './components/SyncModal';
import AuthModal from './components/AuthModal';
import { Transaction, Account, TransactionType, Budget } from './types';
import { INITIAL_ACCOUNTS, CATEGORIES } from './constants';
import { supabase, fetchCloudData, syncDataToCloud } from './services/supabaseService';
import { Plus, RefreshCw, Search, X, Pencil, Trash2, FileDown, FileUp, Cloud, CloudOff } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('accounts');
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch { return INITIAL_ACCOUNTS; }
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem('budgets');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [totalBudget, setTotalBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('totalBudget');
      return saved ? parseFloat(saved) : 0;
    } catch { return 0; }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // 初始化 Auth 狀態
  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 當 User 登入時，從雲端抓取數據
  useEffect(() => {
    if (user) {
      const loadCloud = async () => {
        setCloudSyncing(true);
        const data = await fetchCloudData(user.id);
        if (data && data.accounts?.length) {
          setAccounts(data.accounts);
          setTransactions(data.transactions || []);
          setBudgets(data.budgets || []);
        }
        setCloudSyncing(false);
      };
      loadCloud();
    }
  }, [user]);

  // 儲存與同步邏輯
  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budgets', JSON.stringify(budgets));
    localStorage.setItem('totalBudget', totalBudget.toString());

    if (user && !cloudSyncing) {
      syncDataToCloud(user.id, accounts, transactions, budgets);
    }
  }, [accounts, transactions, budgets, totalBudget, user, cloudSyncing]);

  const applyTxToAccounts = (accs: Account[], tx: Partial<Transaction>, multiply: number = 1) => {
    return accs.map(acc => {
      if (acc.id === tx.accountId) {
        let change = 0;
        if (tx.type === TransactionType.INCOME) change = tx.amount!;
        else change = -tx.amount!;
        return { ...acc, balance: acc.balance + (change * multiply) };
      }
      if (tx.type === TransactionType.TRANSFER && acc.id === tx.toAccountId) {
        return { ...acc, balance: acc.balance + (tx.amount! * multiply) };
      }
      return acc;
    });
  };

  const handleAddTransaction = (newTx: Partial<Transaction>) => {
    const tx = { ...newTx, id: Math.random().toString(36).substring(2, 11) } as Transaction;
    setTransactions(prev => [tx, ...prev]);
    setAccounts(prev => applyTxToAccounts(prev, tx, 1));
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (!oldTx) return;
    setAccounts(prev => {
      const reverted = applyTxToAccounts(prev, oldTx, -1);
      return applyTxToAccounts(reverted, updatedTx, 1);
    });
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;
    if (window.confirm('確定要刪除這筆紀錄嗎？')) {
      setAccounts(prev => applyTxToAccounts(prev, txToDelete, -1));
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddAccount = (accountData: Partial<Account>) => {
    const newAccount = { ...accountData, id: `acc-${Date.now()}` } as Account;
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('確定要刪除此帳戶嗎？交易紀錄仍會保留但可能顯示異常。')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <Dashboard transactions={transactions} accounts={accounts} budgets={budgets} totalBudget={totalBudget} onUpdateBudgets={(b, t) => { setBudgets(b); setTotalBudget(t); }} />;
      case 'analysis': 
        return <Analysis transactions={transactions} accounts={accounts} />;
      case 'accounts': 
        return <AccountList accounts={accounts} onAddClick={() => setIsAccountModalOpen(true)} onDelete={handleDeleteAccount} />;
      case 'history': {
        const filtered = transactions.filter(tx => 
          (tx.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          CATEGORIES.find(c => c.id === tx.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="bg-white rounded-[2rem] shadow-sm border border-fin-ink/5 overflow-hidden fade-up">
            <div className="p-6 md:p-10">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
                <h2 className="text-xl font-bold text-fin-ink tracking-tight uppercase">收支明細</h2>
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-fin-linen w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜尋備註或分類..."
                    className="w-full bg-fin-paper/20 border border-fin-paper rounded-xl py-3.5 pl-12 pr-12 text-xs font-bold text-fin-ink focus:border-fin-midnight outline-none"
                  />
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                   <button onClick={() => setIsCSVModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-fin-midnight text-fin-paper rounded-xl font-bold text-[9px] uppercase tracking-widest"><FileUp className="w-4 h-4" />匯入</button>
                </div>
              </div>
              <div className="space-y-3">
                {filtered.map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const cat = CATEGORIES.find(c => c.id === tx.categoryId);
                  return (
                    <div key={tx.id} className="p-4 bg-fin-paper/5 border border-fin-paper/20 rounded-[1.25rem] flex justify-between items-center group">
                      <div className="flex gap-3">
                        <div className={`w-9 h-9 ${cat?.color || 'bg-fin-linen'} rounded-lg text-white flex items-center justify-center font-black text-xs`}>{cat?.name.charAt(0)}</div>
                        <div className="min-w-0">
                          <p className="font-bold text-fin-ink text-sm truncate max-w-[120px]">{tx.note || cat?.name}</p>
                          <p className="text-[8px] text-fin-wood/40 uppercase font-black tracking-widest truncate">{acc?.name} • {tx.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`text-sm font-black ${tx.type === TransactionType.EXPENSE ? 'text-fin-ink' : 'text-fin-linen'}`}>
                          {tx.type === TransactionType.EXPENSE ? '-' : '+'}${tx.amount.toLocaleString()}
                        </p>
                        <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingTransaction(tx); setIsModalOpen(true); }} className="p-1.5 bg-fin-paper/20 rounded-lg"><Pencil className="w-3 h-3" /></button>
                          <button onClick={() => handleDeleteTransaction(tx.id)} className="p-1.5 bg-fin-paper/20 text-red-800 rounded-lg"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
      case 'ai': 
        return <AICoach transactions={transactions} accounts={accounts} onSmartAdd={handleAddTransaction} />;
      default: return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-7xl mx-auto">
        {/* Responsive Header for Mobile */}
        <div className="flex flex-row justify-between items-start mb-8 gap-4 fade-up">
          <div className="flex-1 space-y-1">
            <p className="text-fin-linen font-black text-[7px] md:text-[9px] uppercase tracking-[0.4em]">Journal Flow</p>
            <h2 className="text-2xl md:text-4xl font-black text-fin-ink tracking-tight leading-none">今日財務覺醒</h2>
            
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-all">
                <RefreshCw className="w-2.5 h-2.5" />
                <span className="text-[7px] font-black uppercase tracking-widest">Sync</span>
              </button>
              {user ? (
                <div className="flex items-center gap-1.5 text-fin-midnight text-[7px] font-black uppercase tracking-widest">
                  <Cloud className="w-3 h-3 text-blue-500" /> Cloud
                </div>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-1.5 text-fin-wood/40 hover:text-fin-midnight transition-all text-[7px] font-black uppercase tracking-widest">
                  <CloudOff className="w-3 h-3" /> Enable
                </button>
              )}
            </div>
          </div>

          <button 
            onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} 
            className="shrink-0 bg-fin-midnight hover:bg-fin-ink text-fin-paper font-black py-3 px-6 md:py-4 md:px-10 rounded-2xl flex items-center gap-2 transition-all shadow-xl active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="uppercase tracking-[0.2em] text-[8px] md:text-[10px]">錄入 ENTRY</span>
          </button>
        </div>

        {renderContent()}
      </div>
      
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} 
        onAdd={editingTransaction ? (tx) => handleUpdateTransaction({ ...editingTransaction, ...tx } as Transaction) : handleAddTransaction} 
        accounts={accounts} 
        initialTransaction={editingTransaction || undefined}
      />
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onAdd={handleAddAccount} />
      <CSVImporterModal isOpen={isCSVModalOpen} onClose={() => setIsCSVModalOpen(false)} onImport={(txs) => txs.forEach(handleAddTransaction)} accounts={accounts} />
      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} onImportAll={(data) => { setAccounts(data.accounts); setTransactions(data.transactions); }} currentData={{ accounts, transactions }} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Layout>
  );
};

export default App;

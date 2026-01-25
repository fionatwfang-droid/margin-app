
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Analysis from './components/Analysis.tsx';
import AccountList from './components/AccountList.tsx';
import AICoach from './components/AICoach.tsx';
import TransactionModal from './components/TransactionModal.tsx';
import AccountModal from './components/AccountModal.tsx';
import CSVImporterModal from './components/CSVImporterModal.tsx';
import SyncModal from './components/SyncModal.tsx';
import { Transaction, Account, TransactionType, Budget, AccountType } from './types.ts';
import { INITIAL_ACCOUNTS, CATEGORIES } from './constants.tsx';
import { Plus, RefreshCw, Search, X, Pencil, Trash2, FileDown, FileUp } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('accounts');
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem('budgets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [totalBudget, setTotalBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('totalBudget');
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budgets', JSON.stringify(budgets));
    localStorage.setItem('totalBudget', totalBudget.toString());
  }, [accounts, transactions, budgets, totalBudget]);

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

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['日期', '類型', '分類', '金額', '帳戶', '備註'];
    const rows = transactions.map(tx => [
      tx.date,
      tx.type,
      CATEGORIES.find(c => c.id === tx.categoryId)?.name || '未分類',
      tx.amount,
      accounts.find(a => a.id === tx.accountId)?.name || '未知',
      tx.note || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Margin_Records.csv`;
    link.click();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <Dashboard transactions={transactions} accounts={accounts} budgets={budgets} totalBudget={totalBudget} onUpdateBudgets={(b, t) => { setBudgets(b); setTotalBudget(t); }} />;
      
      case 'analysis': 
        return <Analysis transactions={transactions} accounts={accounts} />;
      
      case 'accounts': 
        return <AccountList accounts={accounts} onAddClick={() => setIsAccountModalOpen(true)} />;
      
      case 'history': {
        const filtered = transactions.filter(tx => 
          (tx.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          CATEGORIES.find(c => c.id === tx.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-fin-ink/5 overflow-hidden fade-up">
            <div className="p-10">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12">
                <h2 className="text-2xl font-bold text-fin-ink tracking-tight uppercase">收支明細</h2>
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-fin-linen w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜尋備註或分類..."
                    className="w-full bg-fin-paper/20 border border-fin-paper rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-fin-ink focus:border-fin-midnight outline-none"
                  />
                  {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-fin-wood/30"><X className="w-4 h-4" /></button>}
                </div>
                <div className="flex gap-4">
                  <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-4 bg-fin-paper text-fin-ink rounded-xl font-bold text-[10px] uppercase tracking-widest border border-fin-ink/5"><FileDown className="w-4 h-4" />匯出</button>
                  <button onClick={() => setIsCSVModalOpen(true)} className="flex items-center gap-2 px-6 py-4 bg-fin-midnight text-fin-paper rounded-xl font-bold text-[10px] uppercase tracking-widest"><FileUp className="w-4 h-4" />匯入</button>
                </div>
              </div>
              <div className="space-y-4">
                {filtered.map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const cat = CATEGORIES.find(c => c.id === tx.categoryId);
                  return (
                    <div key={tx.id} className="p-6 bg-fin-paper/5 border border-fin-paper/20 rounded-[1.75rem] flex justify-between items-center group">
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 ${cat?.color || 'bg-fin-linen'} rounded-xl text-white flex items-center justify-center font-bold`}>{cat?.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-fin-ink">{tx.note || cat?.name}</p>
                          <p className="text-[9px] text-fin-wood/40 uppercase font-bold tracking-widest">{acc?.name} • {tx.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className={`text-lg font-bold ${tx.type === TransactionType.EXPENSE ? 'text-fin-ink' : 'text-fin-linen'}`}>
                          {tx.type === TransactionType.EXPENSE ? '-' : '+'}${tx.amount.toLocaleString()}
                        </p>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingTransaction(tx); setIsModalOpen(true); }} className="p-2 bg-fin-paper/20 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteTransaction(tx.id)} className="p-2 bg-fin-paper/20 text-red-800 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
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
        <div className="flex justify-between items-end mb-12 fade-up">
          <div className="space-y-2">
            <p className="text-fin-linen font-bold text-[10px] uppercase tracking-[0.4em]">Journal Flow</p>
            <h2 className="text-4xl font-bold text-fin-ink tracking-tight">今日財務覺醒</h2>
            <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-all">
              <RefreshCw className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase">Cross-Sync</span>
            </button>
          </div>
          <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="bg-fin-midnight hover:bg-fin-ink text-fin-paper font-bold py-4 px-10 rounded-[1.5rem] flex items-center gap-3 transition-all shadow-xl">
            <Plus className="w-5 h-5" />
            <span className="uppercase tracking-[0.2em] text-[10px]">錄入 Entry</span>
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
    </Layout>
  );
};

export default App;

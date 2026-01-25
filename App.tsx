
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
import { Transaction, Account, TransactionType, Budget, AccountType } from './types';
import { INITIAL_ACCOUNTS, CATEGORIES } from './constants';
import { FileUp, FileDown, Plus, RefreshCw, Search, X, Pencil, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [totalBudget, setTotalBudget] = useState<number>(() => {
    const saved = localStorage.getItem('totalBudget');
    return saved ? parseFloat(saved) : 0;
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
        if (tx.type === TransactionType.EXPENSE) change = -tx.amount!;
        if (tx.type === TransactionType.TRANSFER) change = -tx.amount!;
        return { ...acc, balance: acc.balance + (change * multiply) };
      }
      if (tx.type === TransactionType.TRANSFER && acc.id === tx.toAccountId) {
        // 特別處理：如果轉帳目標是信用卡，增加餘額代表減少欠款（因為信用卡餘額通常為負）
        return { ...acc, balance: acc.balance + (tx.amount! * multiply) };
      }
      return acc;
    });
  };

  const handleAddTransaction = (newTx: Partial<Transaction>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const tx = { ...newTx, id } as Transaction;
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

    if (window.confirm('確定要刪除這筆紀錄嗎？帳戶餘額將會自動校正。')) {
      setAccounts(prev => applyTxToAccounts(prev, txToDelete, -1));
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddAccount = (accountData: Partial<Account>) => {
    const id = `acc-${Math.random().toString(36).substring(2, 9)}`;
    const newAccount = { ...accountData, id } as Account;
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleUpdateBudgets = (updatedBudgets: Budget[], newTotal: number) => {
    setBudgets(updatedBudgets);
    setTotalBudget(newTotal);
  };

  const handleImportAllData = (data: any) => {
    if (data.accounts) setAccounts(data.accounts);
    if (data.transactions) setTransactions(data.transactions);
    if (data.budgets) setBudgets(data.budgets);
    if (data.totalBudget !== undefined) setTotalBudget(data.totalBudget);
  };

  const handleImportTransactions = (importedList: Partial<Transaction>[]) => {
    const newTransactions = importedList.map(tx => ({
      ...tx,
      id: Math.random().toString(36).substring(2, 11)
    })) as Transaction[];
    setTransactions(prev => [...newTransactions, ...prev]);
    setAccounts(prev => {
      let updatedAccounts = [...prev];
      newTransactions.forEach(tx => {
        updatedAccounts = applyTxToAccounts(updatedAccounts, tx, 1);
      });
      return updatedAccounts;
    });
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['日期', '類型', '分類', '金額', '帳戶', '目標帳戶(轉帳)', '備註'];
    const rows = transactions.map(tx => [
      tx.date,
      tx.type === TransactionType.EXPENSE ? '支出' : tx.type === TransactionType.INCOME ? '收入' : '轉帳',
      CATEGORIES.find(c => c.id === tx.categoryId)?.name || '未分類',
      tx.amount,
      accounts.find(a => a.id === tx.accountId)?.name || '未知帳戶',
      tx.toAccountId ? (accounts.find(a => a.id === tx.toAccountId)?.name || '') : '',
      tx.note || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Margin_Records_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return '深夜好，享受寧靜的記帳時刻。';
    if (hour < 12) return '晨安，開始一天的財務覺醒。';
    if (hour < 18) return '午安，整理早晨的消費流向。';
    return '晚安，回顧今天的收支心流。';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard transactions={transactions} accounts={accounts} budgets={budgets} totalBudget={totalBudget} onUpdateBudgets={handleUpdateBudgets} />;
      case 'analysis': return <Analysis transactions={transactions} accounts={accounts} />;
      case 'accounts': return <AccountList accounts={accounts} onAddClick={() => setIsAccountModalOpen(true)} />;
      case 'history': {
        const filteredTransactions = transactions.filter(tx => {
          const categoryName = CATEGORIES.find(c => c.id === tx.categoryId)?.name || '';
          const searchLower = searchTerm.toLowerCase();
          const amountStr = tx.amount.toString();
          return (
            tx.note?.toLowerCase().includes(searchLower) ||
            categoryName.toLowerCase().includes(searchLower) ||
            amountStr.includes(searchLower)
          );
        });

        return (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-fin-ink/5 overflow-hidden fade-up">
            <div className="p-6 md:p-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-fin-ink tracking-tight uppercase">收支明細 / Archive</h2>
                  <p className="text-[10px] text-fin-wood font-semibold uppercase tracking-widest mt-2">Historical Records</p>
                </div>
                <div className="relative w-full lg:max-w-md group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-fin-linen group-focus-within:text-fin-midnight transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜尋備註或分類..."
                    className="w-full bg-fin-paper/20 border border-fin-paper rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-fin-ink focus:border-fin-midnight outline-none transition-all placeholder:text-fin-wood/30"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-fin-paper rounded-full text-fin-wood/40 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-3 md:gap-4 w-full lg:w-auto">
                  <button onClick={exportToCSV} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-4 bg-fin-paper text-fin-ink hover:bg-fin-linen/10 rounded-[1.25rem] transition-all font-bold text-[10px] uppercase tracking-widest border border-fin-ink/5">
                    <FileDown className="w-4 h-4" /><span>匯出</span>
                  </button>
                  <button onClick={() => setIsCSVModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-4 bg-fin-midnight text-fin-paper hover:bg-fin-ink rounded-[1.25rem] transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg">
                    <FileUp className="w-4 h-4" /><span>匯入</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTransactions.map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const toAcc = accounts.find(a => a.id === tx.toAccountId);
                  const cat = CATEGORIES.find(c => c.id === tx.categoryId);
                  return (
                    <div key={tx.id} className="p-5 md:p-7 bg-fin-paper/5 border border-fin-paper/20 rounded-[1.75rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-fin-paper/20 transition-all group relative">
                      <div className="flex gap-4 md:gap-6 min-w-0 flex-1">
                        <div className={`w-10 h-10 md:w-11 md:h-11 flex-shrink-0 ${cat?.color || 'bg-white'} rounded-2xl text-white shadow-sm flex items-center justify-center font-bold`}>
                          {tx.type === TransactionType.TRANSFER ? '⇄' : (cat?.name.charAt(0) || '•')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-fin-ink text-base md:text-lg leading-tight mb-1 uppercase truncate">
                            {tx.type === TransactionType.TRANSFER ? `轉帳: ${tx.note || '內部互轉'}` : (tx.note || cat?.name || '無備註')}
                          </p>
                          <p className="text-[9px] md:text-[10px] text-fin-wood font-semibold uppercase tracking-widest opacity-40 truncate">
                            {acc?.name} 
                            {tx.type === TransactionType.TRANSFER && toAcc ? ` → ${toAcc.name}` : ''}
                            {tx.type !== TransactionType.TRANSFER && ` • ${tx.type === TransactionType.EXPENSE ? '支出' : '收入'}`} • {tx.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 self-end sm:self-auto">
                        <p className={`text-lg md:text-xl font-bold ${tx.type === TransactionType.EXPENSE ? 'text-fin-ink' : tx.type === TransactionType.INCOME ? 'text-fin-linen' : 'text-fin-wood'}`}>
                          {tx.type === TransactionType.EXPENSE ? '-' : tx.type === TransactionType.INCOME ? '+' : ''}${tx.amount.toLocaleString()}
                        </p>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingTransaction(tx); setIsModalOpen(true); }} className="p-2.5 bg-white text-fin-midnight hover:text-fin-linen rounded-xl shadow-sm border border-fin-paper transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteTransaction(tx.id)} className="p-2.5 bg-white text-fin-midnight hover:text-red-800 rounded-xl shadow-sm border border-fin-paper transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
      case 'ai': return <AICoach transactions={transactions} accounts={accounts} onSmartAdd={handleAddTransaction} />;
      default: return null;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-8 md:mb-12 fade-up">
          <div className="space-y-3">
            <p className="text-fin-linen font-bold text-[10px] uppercase tracking-[0.4em] leading-none">Journal Flow / {new Date().toLocaleDateString()}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-fin-ink tracking-tight leading-tight">
              {getGreeting()}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 opacity-60">
                <div className="w-1.5 h-1.5 bg-fin-linen rounded-full animate-pulse"></div>
                <p className="text-fin-ink font-bold text-[10px] uppercase tracking-[0.2em]">
                  {activeTab === 'dashboard' ? "REAL-TIME FLOW" : "VAULT MANAGEMENT"}
                </p>
              </div>
              <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-2 px-3 py-1 bg-fin-midnight/5 hover:bg-fin-midnight/10 rounded-full transition-all group">
                <RefreshCw className="w-3 h-3 text-fin-linen group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[9px] font-bold text-fin-midnight uppercase tracking-widest">同步</span>
              </button>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="group bg-fin-midnight hover:bg-fin-ink text-fin-paper font-bold py-4 md:py-4.5 px-8 md:px-10 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02]">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            <span className="uppercase tracking-[0.2em] text-[10px]">錄入 Entry</span>
          </button>
        </div>
        {renderContent()}
      </div>
      <TransactionModal isOpen={isModalOpen} onClose={handleModalClose} onAdd={editingTransaction ? (tx) => handleUpdateTransaction({ ...editingTransaction, ...tx } as Transaction) : handleAddTransaction} accounts={accounts} initialTransaction={editingTransaction || undefined} />
      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onAdd={handleAddAccount} />
      <CSVImporterModal isOpen={isCSVModalOpen} onClose={() => setIsCSVModalOpen(false)} onImport={handleImportTransactions} accounts={accounts} />
      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} onImportAll={handleImportAllData} currentData={{ accounts, transactions, budgets, totalBudget }} />
    </Layout>
  );
};

export default App;

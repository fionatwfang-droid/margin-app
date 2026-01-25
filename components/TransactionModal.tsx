
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Frequency, Account, Category } from '../types';
import { CATEGORIES, ICON_MAP } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Partial<Transaction>) => void;
  accounts: Account[];
  initialTransaction?: Transaction;
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onAdd, accounts, initialTransaction }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');

  // 取得當前類型可用的分類
  const availableCategories = CATEGORIES.filter(c => c.type === type);

  // 當 modal 打開或切換編輯對象時初始化資料
  useEffect(() => {
    if (isOpen) {
      if (initialTransaction) {
        setType(initialTransaction.type);
        setAmount(initialTransaction.amount.toString());
        setDate(initialTransaction.date);
        setAccountId(initialTransaction.accountId);
        setToAccountId(initialTransaction.toAccountId || (accounts[1]?.id || accounts[0]?.id || ''));
        setCategoryId(initialTransaction.categoryId);
        setNote(initialTransaction.note || '');
      } else {
        // 新增模式
        setType(TransactionType.EXPENSE);
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        if (accounts.length > 0) {
          setAccountId(accounts[0].id);
          setToAccountId(accounts[1]?.id || accounts[0].id);
        }
        setCategoryId(CATEGORIES.find(c => c.type === TransactionType.EXPENSE)?.id || '');
        setNote('');
      }
    }
  }, [isOpen, initialTransaction, accounts]);

  // 當 type 切換時，重置預設分類
  useEffect(() => {
    if (!initialTransaction && isOpen) {
       const firstInType = CATEGORIES.find(c => c.type === type);
       if (firstInType) setCategoryId(firstInType.id);
    }
  }, [type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === TransactionType.TRANSFER && accountId === toAccountId) {
      alert("來源帳戶與目標帳戶不能相同。");
      return;
    }

    onAdd({
      amount: parseFloat(amount),
      type,
      date,
      accountId,
      toAccountId: type === TransactionType.TRANSFER ? toAccountId : undefined,
      categoryId: type === TransactionType.TRANSFER ? '9' : categoryId,
      note,
      isRecurring: false,
      isInstallment: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-fin-midnight/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-fin-paper overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
        <div className="px-12 py-10 border-b border-fin-paper flex justify-between items-center bg-fin-paper/10">
          <h2 className="text-2xl font-bold text-fin-midnight tracking-tight uppercase">
            {initialTransaction ? '編輯紀錄 / Edit' : '新增紀錄 / Entry'}
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-fin-paper rounded-2xl text-fin-midnight/30 hover:text-fin-midnight transition-all text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          <div className="flex p-1.5 bg-fin-paper/40 rounded-[1.5rem]">
            {[
              { id: TransactionType.EXPENSE, label: '支出 DEBIT' },
              { id: TransactionType.INCOME, label: '收入 CREDIT' },
              { id: TransactionType.TRANSFER, label: '轉帳 MOVE' }
            ].map(btn => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setType(btn.id)}
                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] rounded-[1rem] transition-all ${
                  type === btn.id ? 'bg-fin-midnight text-fin-paper shadow-lg' : 'text-fin-midnight/40 hover:text-fin-midnight'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-2 px-1">Amount 金額</label>
              <div className="relative border-b-2 border-fin-paper group-focus-within:border-fin-midnight transition-colors">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-fin-midnight font-bold text-3xl">$</span>
                <input
                  type="number"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent py-4 pl-10 pr-6 text-5xl font-bold text-fin-midnight outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-3">Date 日期</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-fin-paper/30 border border-fin-paper rounded-[1rem] px-5 py-4 text-xs font-bold text-fin-midnight focus:border-fin-midnight outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-3">
                    {type === TransactionType.TRANSFER ? 'From 來源' : 'Account 帳戶'}
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-fin-paper/30 border border-fin-paper rounded-[1rem] px-5 py-4 text-xs font-bold text-fin-midnight focus:border-fin-midnight outline-none appearance-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                    ))}
                  </select>
                </div>
            </div>

            {type === TransactionType.TRANSFER && (
              <div className="animate-in fade-in slide-in-from-top-4">
                <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-3">To 目標帳戶</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-fin-paper/30 border border-fin-paper rounded-[1rem] px-5 py-4 text-xs font-bold text-fin-midnight focus:border-fin-midnight outline-none appearance-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {type !== TransactionType.TRANSFER && (
            <div className="animate-in fade-in duration-500">
              <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-5">Category {type === TransactionType.EXPENSE ? '支出' : '收入'}類別</label>
              <div className="grid grid-cols-4 gap-3">
                {availableCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-[1.25rem] border transition-all ${
                      categoryId === cat.id 
                        ? 'border-fin-midnight bg-fin-paper/30' 
                        : 'border-transparent bg-fin-paper/10 hover:bg-fin-paper/20'
                    }`}
                  >
                    <div className={`${cat.color} p-2.5 rounded-xl text-white shadow-sm`}>
                      {ICON_MAP[cat.icon]}
                    </div>
                    <span className="text-[9px] font-bold text-fin-midnight/60 uppercase truncate w-full text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-3 px-1">Note 備註</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-fin-paper/30 border border-fin-paper rounded-[1rem] px-5 py-4 text-xs font-bold text-fin-midnight focus:border-fin-midnight outline-none"
                placeholder={type === TransactionType.TRANSFER ? "例如：繳卡費" : "點擊輸入內容..."}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-fin-midnight hover:bg-fin-ink text-fin-paper font-bold py-6 rounded-[1.5rem] transition-all shadow-xl uppercase tracking-[0.3em] text-xs"
            >
              {initialTransaction ? '更新紀錄 UPDATE' : '完成儲存 STORE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;

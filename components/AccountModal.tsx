
import React, { useState } from 'react';
import { Account, AccountType } from '../types';
import { ICON_MAP } from '../constants';
import { CreditCard, Wallet, Landmark, CalendarDays } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (account: Partial<Account>) => void;
}

const AccountModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [type, setType] = useState<AccountType>(AccountType.BANK);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');
  const [billingDate, setBillingDate] = useState('10');
  const [dueDate, setDueDate] = useState('25');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    const newAccount: Partial<Account> = {
      name,
      type,
      balance: parseFloat(balance),
      ...(type === AccountType.CREDIT_CARD ? {
        limit: parseFloat(limit) || 0,
        billingCycleDate: parseInt(billingDate),
        paymentDueDate: parseInt(dueDate)
      } : {})
    };

    onAdd(newAccount);
    // Reset fields
    setName('');
    setBalance('');
    setLimit('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-fin-midnight/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl border border-fin-paper overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
        <div className="px-10 py-8 border-b border-fin-paper flex justify-between items-center bg-fin-paper/10">
          <h2 className="text-xl font-bold text-fin-midnight tracking-tight uppercase">開設新帳戶 / New Vault</h2>
          <button onClick={onClose} className="p-2 hover:bg-fin-paper rounded-xl text-fin-midnight/30 hover:text-fin-midnight transition-all">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* Type Selector */}
          <div className="flex p-1.5 bg-fin-paper/40 rounded-[1.5rem]">
            {[
              { id: AccountType.CASH, label: '現金', icon: <Wallet className="w-3.5 h-3.5" /> },
              { id: AccountType.BANK, label: '銀行', icon: <Landmark className="w-3.5 h-3.5" /> },
              { id: AccountType.CREDIT_CARD, label: '信用卡', icon: <CreditCard className="w-3.5 h-3.5" /> }
            ].map(btn => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setType(btn.id)}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] rounded-[1rem] transition-all ${
                  type === btn.id ? 'bg-fin-midnight text-fin-paper shadow-lg' : 'text-fin-midnight/40 hover:text-fin-midnight'
                }`}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-2 px-1">Vault Name 帳戶名稱</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-fin-paper/20 border-b-2 border-fin-paper focus:border-fin-midnight py-3 px-1 text-xl font-bold text-fin-ink outline-none transition-colors"
                placeholder="例如：渣打理財、日常錢包..."
              />
            </div>

            <div className="relative group">
              <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-2 px-1">Initial Balance 初始餘額</label>
              <div className="relative border-b-2 border-fin-paper group-focus-within:border-fin-midnight transition-colors">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-fin-midnight/40 font-bold text-2xl">$</span>
                <input
                  type="number"
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-transparent py-4 pl-8 pr-4 text-3xl font-bold text-fin-ink outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Credit Card Extra Fields */}
            {type === AccountType.CREDIT_CARD && (
              <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-2">Credit Limit 額度</label>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      className="w-full bg-fin-paper/20 border border-fin-paper rounded-xl px-4 py-3 text-sm font-bold text-fin-ink outline-none focus:border-fin-midnight"
                      placeholder="例如：100000"
                    />
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-fin-midnight uppercase tracking-[0.4em] mb-2">Cycle Date 結算日</label>
                     <select 
                        value={billingDate} 
                        onChange={(e) => setBillingDate(e.target.value)}
                        className="w-full bg-fin-paper/20 border border-fin-paper rounded-xl px-4 py-3 text-sm font-bold text-fin-ink outline-none focus:border-fin-midnight appearance-none"
                     >
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d} 日</option>)}
                     </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-fin-paper/10 rounded-2xl border border-fin-linen/20">
                  <CalendarDays className="w-5 h-5 text-fin-linen" />
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-fin-wood uppercase tracking-widest mb-1">Payment Due 繳款日設定</p>
                    <select 
                        value={dueDate} 
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-fin-midnight outline-none appearance-none"
                    >
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>每月 {d} 日前繳納</option>)}
                     </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-fin-midnight hover:bg-fin-ink text-fin-paper font-bold py-5 rounded-[1.5rem] transition-all shadow-xl uppercase tracking-[0.3em] text-[11px]"
          >
            建立帳戶 CREATE VAULT
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;

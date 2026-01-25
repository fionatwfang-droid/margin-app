
import React, { useState } from 'react';
import { Budget, Category } from '../types';
import { CATEGORIES, ICON_MAP } from '../constants';
import { Target, List } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  budgets: Budget[];
  totalBudget: number;
  onSave: (budgets: Budget[], total: number) => void;
}

const BudgetModal: React.FC<Props> = ({ isOpen, onClose, budgets, totalBudget, onSave }) => {
  const [localTotalBudget, setLocalTotalBudget] = useState<string>(totalBudget > 0 ? totalBudget.toString() : '');
  const [localBudgets, setLocalBudgets] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    budgets.forEach(b => {
      map[b.categoryId] = b.amount.toString();
    });
    return map;
  });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const entries = Object.entries(localBudgets) as [string, string][];
    const updatedBudgets: Budget[] = entries
      .filter(([_, val]) => val !== '' && !isNaN(parseFloat(val)) && parseFloat(val) > 0)
      .map(([catId, val]) => ({
        categoryId: catId,
        amount: parseFloat(val)
      }));
    
    const finalTotal = localTotalBudget === '' ? 0 : parseFloat(localTotalBudget);
    onSave(updatedBudgets, finalTotal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-fin-midnight/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-fin-paper overflow-hidden animate-in slide-in-from-bottom-12 duration-500 flex flex-col max-h-[85vh]">
        <div className="px-8 md:px-12 py-8 md:py-10 border-b border-fin-paper flex justify-between items-center bg-fin-paper/10">
          <h2 className="text-xl md:text-2xl font-bold text-fin-midnight tracking-tight uppercase">預算規劃 / Budgeting</h2>
          <button onClick={onClose} className="p-3 hover:bg-fin-paper rounded-2xl text-fin-midnight/30 hover:text-fin-midnight transition-all text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 no-scrollbar">
          {/* 全域總預算設定區塊 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-fin-midnight" />
              <h3 className="text-sm font-black text-fin-midnight uppercase tracking-[0.2em]">每月總額控管 / Global Limit</h3>
            </div>
            <div className="bg-fin-midnight p-8 md:p-10 rounded-[2rem] text-fin-paper shadow-xl relative overflow-hidden group">
              <p className="text-[10px] font-bold text-fin-linen uppercase tracking-[0.3em] mb-4">Total Monthly Budget</p>
              <div className="relative border-b border-fin-paper/20 focus-within:border-fin-linen transition-colors">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-fin-linen font-black text-2xl">$</span>
                <input
                  type="number"
                  value={localTotalBudget}
                  onChange={(e) => setLocalTotalBudget(e.target.value)}
                  className="w-full bg-transparent py-4 pl-10 pr-6 text-4xl font-black text-fin-paper outline-none placeholder:text-fin-paper/10"
                  placeholder="0"
                />
              </div>
              <p className="mt-6 text-[10px] font-semibold text-fin-paper/40 leading-relaxed">
                若設定總預算，系統將以此數值作為首頁進度條的主要依據。
              </p>
              <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform">
                <Target className="w-32 h-32" />
              </div>
            </div>
          </section>

          {/* 分類預算設定區塊 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <List className="w-5 h-5 text-fin-midnight" />
              <h3 className="text-sm font-black text-fin-midnight uppercase tracking-[0.2em]">分類預算明細 / Categories</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {CATEGORIES.filter(c => c.id !== '9').map(cat => (
                <div key={cat.id} className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-fin-paper/5 rounded-[1.5rem] border border-fin-paper/20 hover:bg-fin-paper/10 transition-colors">
                  <div className={`${cat.color} p-2.5 md:p-3 rounded-xl text-white shadow-sm flex-shrink-0`}>
                    {ICON_MAP[cat.icon]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] md:text-[10px] font-bold text-fin-midnight uppercase tracking-widest mb-1 truncate">{cat.name}</p>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-fin-wood/40 font-bold text-sm md:text-base">$</span>
                      <input
                        type="number"
                        value={localBudgets[cat.id] || ''}
                        onChange={(e) => setLocalBudgets(prev => ({ ...prev, [cat.id]: e.target.value }))}
                        className="w-full bg-transparent border-b border-fin-paper focus:border-fin-midnight py-1 md:py-2 pl-5 md:pl-6 text-lg md:text-xl font-bold text-fin-midnight outline-none transition-colors"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </form>

        <div className="p-8 md:p-10 border-t border-fin-paper bg-white">
          <button
            type="submit"
            onClick={handleSave}
            className="w-full bg-fin-midnight hover:bg-fin-ink text-fin-paper font-bold py-5 md:py-6 rounded-[1.5rem] transition-all shadow-xl uppercase tracking-[0.3em] text-[10px] md:text-xs"
          >
            儲存規劃並套用 SAVE PLAN
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;

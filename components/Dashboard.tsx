
import React, { useState } from 'react';
import { Transaction, Account, TransactionType, Budget, AccountType } from '../types';
import { ICON_MAP } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard as CreditIcon, TrendingDown } from 'lucide-react';
import BudgetModal from './BudgetModal';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  totalBudget: number;
  onUpdateBudgets: (budgets: Budget[], total: number) => void;
}

const Dashboard: React.FC<Props> = ({ transactions, accounts, budgets, totalBudget, onUpdateBudgets }) => {
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const cashAssets = accounts.filter(a => a.type === AccountType.CASH || a.type === AccountType.BANK).reduce((s, a) => s + a.balance, 0);
  const creditDebt = accounts.filter(a => a.type === AccountType.CREDIT_CARD).reduce((s, a) => s + a.balance, 0);
  const totalBalance = cashAssets + creditDebt;

  const now = new Date();
  const today = now.getDate();
  const thisMonth = now.getMonth();
  
  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === thisMonth && d.getFullYear() === now.getFullYear();
  });

  const thisMonthSpending = thisMonthTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const creditCards = accounts.filter(a => a.type === AccountType.CREDIT_CARD);
  const creditReminders = creditCards
    .map(a => {
      const daysUntilDue = a.paymentDueDate! >= today ? a.paymentDueDate! - today : 30 - today + a.paymentDueDate!;
      const utilization = a.limit ? (Math.abs(a.balance) / a.limit) * 100 : 0;
      return { ...a, daysUntilDue, utilization };
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const amount = transactions
      .filter(t => t.date === dateStr && t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), value: amount };
  });

  const displayTotalBudget = totalBudget > 0 ? totalBudget : budgets.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBudgetProgress = displayTotalBudget === 0 ? 0 : (thisMonthSpending / displayTotalBudget) * 100;

  return (
    <div className="space-y-6 md:space-y-10 fade-up pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-fin-ink/5 relative overflow-hidden group">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-fin-linen mb-3">NET WORTH / 總資產</p>
          <h3 className="text-2xl md:text-3xl font-black text-fin-ink tracking-tight mb-1">${totalBalance.toLocaleString()}</h3>
          <div className="mt-5 space-y-2.5">
             <div className="flex justify-between items-center text-[8px] font-black text-fin-wood/40 uppercase">
                <span>LIQUIDITY 現金</span>
                <span className="text-fin-midnight">${cashAssets.toLocaleString()}</span>
             </div>
             <div className="w-full bg-fin-paper h-1 rounded-full overflow-hidden">
                <div className="bg-fin-midnight h-full" style={{ width: `${(cashAssets / (cashAssets + Math.abs(creditDebt) || 1)) * 100}%` }}></div>
             </div>
          </div>
        </div>

        <div className="bg-fin-midnight p-6 md:p-8 rounded-[2rem] shadow-xl text-fin-paper relative overflow-hidden">
          <div className="flex justify-between items-center mb-5">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-fin-linen">CREDIT BILL / 帳單支援</p>
            <CreditIcon className="w-3.5 h-3.5 text-fin-linen" />
          </div>
          {creditReminders.length > 0 ? (
            <div className="space-y-2">
              <span className="text-sm font-black tracking-tight">{creditReminders[0].name}</span>
              <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl border border-white/10">
                <TrendingDown className="w-3 h-3 text-fin-linen" />
                <p className="text-[9px] font-black tracking-widest">還款倒數 <span className="text-fin-linen">{creditReminders[0].daysUntilDue}</span> 天</p>
              </div>
            </div>
          ) : (
            <p className="text-[9px] font-black text-white/20 italic py-4">無信用卡數據</p>
          )}
        </div>

        <div className="bg-fin-paper p-6 md:p-8 rounded-[2rem] border border-fin-linen/20 cursor-pointer active:scale-[0.98] transition-all" onClick={() => setIsBudgetModalOpen(true)}>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-fin-midnight mb-5">BUDGET / 預算進度</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-3xl md:text-4xl font-black text-fin-ink">{Math.floor(totalBudgetProgress)}%</h3>
            <span className="text-[9px] font-black text-fin-wood/40 mb-1.5 uppercase tracking-widest">Spent / 已支出</span>
          </div>
          <div className="w-full bg-white/50 h-1 rounded-full overflow-hidden">
             <div className={`h-full ${totalBudgetProgress > 90 ? 'bg-red-600' : 'bg-fin-midnight'}`} style={{ width: `${Math.min(totalBudgetProgress, 100)}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-fin-ink/5 overflow-hidden h-[350px]">
          <h4 className="text-lg font-black text-fin-ink tracking-tight mb-2 uppercase">VELOCITY / 支出流速</h4>
          <p className="text-[7px] font-black text-fin-wood/30 uppercase tracking-[0.2em] mb-6">Spending Trends / 趨勢分析</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c6ac8f" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#c6ac8f" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 5" vertical={false} stroke="#0a0908" strokeOpacity={0.05} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#0a0908', fontSize: 9, fontWeight: 900, opacity: 0.2}} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '15px', border: 'none', background: '#22333b', color: '#eae0d5', fontSize: '10px', fontWeight: '900', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: '#c6ac8f', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area type="monotone" dataKey="value" stroke="#c6ac8f" strokeWidth={3} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <BudgetModal 
        isOpen={isBudgetModalOpen} 
        onClose={() => setIsBudgetModalOpen(false)} 
        budgets={budgets} 
        totalBudget={totalBudget}
        onSave={onUpdateBudgets}
      />
    </div>
  );
};

export default Dashboard;

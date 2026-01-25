
import React, { useState } from 'react';
import { Transaction, Account, TransactionType, Budget, AccountType } from '../types';
import { ICON_MAP, CATEGORIES } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Info, Settings2, AlertTriangle, Target, ArrowRightLeft, CreditCard as CreditIcon, TrendingDown, Wallet } from 'lucide-react';
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
  const thisYear = now.getFullYear();
  
  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const thisMonthSpending = thisMonthTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 信用卡特別提醒：找出最近要繳款的卡與使用率
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
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const amount = transactions
      .filter(t => t.date === dateStr && t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: dayName, value: amount };
  });

  const displayTotalBudget = totalBudget > 0 ? totalBudget : budgets.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBudgetProgress = displayTotalBudget === 0 ? 0 : (thisMonthSpending / displayTotalBudget) * 100;

  return (
    <div className="space-y-6 md:space-y-10 fade-up">
      {/* 核心資產看板 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-fin-ink/5 relative overflow-hidden group">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fin-linen mb-4">Net Worth / 總資產</p>
          <h3 className="text-3xl font-black text-fin-ink tracking-tight mb-2">
            ${totalBalance.toLocaleString()}
          </h3>
          <div className="mt-6 space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-fin-wood/40 uppercase">Liquidity 現金資產</span>
                <span className="text-xs font-black text-fin-midnight">${cashAssets.toLocaleString()}</span>
             </div>
             <div className="w-full bg-fin-paper h-1 rounded-full overflow-hidden">
                <div className="bg-fin-midnight h-full" style={{ width: `${(cashAssets / (cashAssets + Math.abs(creditDebt) || 1)) * 100}%` }}></div>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-fin-wood/40 uppercase">Total Debt 信用卡負債</span>
                <span className="text-xs font-black text-red-600">${Math.abs(creditDebt).toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* 信用卡支援模組：還款計畫與額度警示 */}
        <div className="bg-fin-midnight p-8 rounded-[2.5rem] shadow-xl text-fin-paper relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fin-linen">Credit Support / 信用支援</p>
            <CreditIcon className="w-4 h-4 text-fin-linen" />
          </div>
          <div className="space-y-5">
            {creditReminders.length > 0 ? (
              creditReminders.slice(0, 1).map(card => (
                <div key={card.id}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-black">{card.name}</span>
                    <span className={`text-[10px] font-bold ${card.utilization > 80 ? 'text-red-400' : 'text-fin-linen'}`}>
                      額度使用率 {card.utilization.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mb-4">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${card.utilization > 80 ? 'bg-red-500' : 'bg-fin-linen'}`} 
                      style={{ width: `${Math.min(card.utilization, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <TrendingDown className="w-3.5 h-3.5 text-fin-linen" />
                    <p className="text-[10px] font-bold">
                      距離 {card.paymentDueDate} 日還款還有 <span className="text-fin-linen">{card.daysUntilDue}</span> 天
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-bold text-fin-paper/20 italic py-6 text-center">尚未串接信用卡工具</p>
            )}
          </div>
        </div>

        <div className="bg-fin-paper p-8 rounded-[2.5rem] border border-fin-linen/20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fin-midnight mb-6">Budget Health / 預算健康</p>
          <div className="flex items-end gap-3 mb-6">
            <h3 className="text-4xl font-black text-fin-ink">{Math.floor(totalBudgetProgress)}%</h3>
            <span className="text-[10px] font-bold text-fin-wood/40 mb-2 uppercase tracking-widest">Spent</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-fin-wood leading-tight">
            {totalBudgetProgress > 90 ? (
               <><AlertTriangle className="w-4 h-4 text-red-600" /> <span className="text-red-600">本月支出已接近飽和</span></>
            ) : (
               <><Target className="w-4 h-4 text-fin-midnight" /> <span>支出節奏在控制範圍內</span></>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-fin-ink/5 overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-xl font-bold text-fin-ink tracking-tight">每日支出流速</h4>
              <p className="text-[10px] text-fin-wood font-semibold uppercase tracking-[0.2em] mt-1">Velocity Tracking</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c6ac8f" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#c6ac8f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 5" vertical={false} stroke="#0a0908" strokeOpacity={0.05} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#0a0908', fontSize: 10, fontWeight: 700, opacity: 0.2}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', background: '#22333b', color: '#eae0d5', fontSize: '11px', fontWeight: '700' }}
                  cursor={{ stroke: '#c6ac8f', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="value" stroke="#c6ac8f" strokeWidth={3} fillOpacity={1} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-fin-ink/5 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-xl font-bold text-fin-ink tracking-tight">快速工具</h4>
            <ArrowRightLeft className="w-5 h-5 text-fin-linen" />
          </div>
          <div className="space-y-4">
             <button className="w-full flex items-center justify-between p-5 bg-fin-paper/20 hover:bg-fin-paper/40 rounded-2xl border border-fin-paper/50 transition-all group text-left">
                <div>
                   <p className="text-[11px] font-black text-fin-midnight uppercase">Pay Credit Bill / 繳卡費</p>
                   <p className="text-[8px] font-bold text-fin-wood/40 mt-1">快速平衡銀行資產與負債</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <CreditIcon className="w-3.5 h-3.5" />
                </div>
             </button>

             <button className="w-full flex items-center justify-between p-5 bg-fin-paper/20 hover:bg-fin-paper/40 rounded-2xl border border-fin-paper/50 transition-all group text-left">
                <div>
                   <p className="text-[11px] font-black text-fin-midnight uppercase">Cash Out / 提領現金</p>
                   <p className="text-[8px] font-bold text-fin-wood/40 mt-1">從銀行轉為錢包餘額</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <Wallet className="w-3.5 h-3.5" />
                </div>
             </button>
             
             <div className="mt-8">
                <p className="text-[10px] font-bold text-fin-linen uppercase tracking-widest mb-4">預算警戒</p>
                <div className="space-y-5 overflow-y-auto no-scrollbar max-h-[180px]">
                   {budgets.slice(0, 3).map(b => {
                      const cat = CATEGORIES.find(c => c.id === b.categoryId);
                      const spent = thisMonthTransactions.filter(t => t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0);
                      const prog = (spent / b.amount) * 100;
                      return (
                         <div key={b.categoryId}>
                            <div className="flex justify-between text-[9px] font-bold mb-1.5 uppercase">
                               <span className="text-fin-midnight">{cat?.name}</span>
                               <span className={prog > 90 ? 'text-red-600' : 'text-fin-linen'}>{prog.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-fin-paper h-1 rounded-full overflow-hidden">
                               <div className={`h-full ${prog > 90 ? 'bg-red-600' : 'bg-fin-linen'}`} style={{ width: `${Math.min(prog, 100)}%` }}></div>
                            </div>
                         </div>
                      )
                   })}
                </div>
             </div>
          </div>
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

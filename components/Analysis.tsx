
import React, { useState, useMemo } from 'react';
import { Transaction, Account, TransactionType } from '../types';
import { CATEGORIES } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Calendar, Filter, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
}

type RangeType = 'thisWeek' | 'thisMonth' | 'last30' | 'thisYear' | 'custom';

const Analysis: React.FC<Props> = ({ transactions, accounts }) => {
  const [rangeType, setRangeType] = useState<RangeType>('thisMonth');
  const [showExpenseBreakdown, setShowExpenseBreakdown] = useState(true);
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [customRange, setCustomRange] = useState({
    start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
    end: todayStr
  });

  const dateRange = useMemo(() => {
    const end = todayStr;
    let start = "";
    switch (rangeType) {
      case 'thisWeek': {
        const d = new Date(today);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(d.setDate(diff)).toISOString().split('T')[0];
        break;
      }
      case 'thisMonth': {
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      }
      case 'last30': {
        const d = new Date(today);
        start = new Date(d.setDate(d.getDate() - 30)).toISOString().split('T')[0];
        break;
      }
      case 'thisYear': {
        start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      }
      case 'custom': {
        return customRange;
      }
    }
    return { start, end };
  }, [rangeType, customRange, todayStr]);

  const filteredTxs = transactions.filter(t => 
    t.date >= dateRange.start && t.date <= dateRange.end
  );

  const totalExpense = filteredTxs
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncome = filteredTxs
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 根據顯示類型 (支出/收入) 計算比例數據
  const targetType = showExpenseBreakdown ? TransactionType.EXPENSE : TransactionType.INCOME;
  const targetTotal = showExpenseBreakdown ? totalExpense : totalIncome;

  const categoryData = CATEGORIES.filter(c => c.type === targetType).map(cat => {
    const amount = filteredTxs
      .filter(t => t.categoryId === cat.id && t.type === targetType)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const hex = cat.color.includes('#') ? cat.color.replace('bg-[', '').replace(']', '') : '#c6ac8f';
    
    return {
      name: cat.name,
      value: amount,
      color: hex,
      percent: targetTotal > 0 ? (amount / targetTotal) * 100 : 0
    };
  }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString('zh-TW', { month: 'short' });
    const exp = transactions
      .filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.type === TransactionType.EXPENSE;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    const inc = transactions
      .filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.type === TransactionType.INCOME;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: label, 支出: exp, 收入: inc };
  });

  const rangeOptions: { id: RangeType; label: string }[] = [
    { id: 'thisWeek', label: '本週' },
    { id: 'thisMonth', label: '本月' },
    { id: 'last30', label: '近 30 天' },
    { id: 'thisYear', label: '今年' },
    { id: 'custom', label: '自定義' },
  ];

  return (
    <div className="space-y-10 fade-up">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div>
          <h2 className="text-2xl font-bold text-fin-ink tracking-tight uppercase">分析 Insight</h2>
          <p className="text-[10px] text-fin-wood font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-fin-linen" />
            {dateRange.start} — {dateRange.end}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
          <div className="flex bg-white rounded-2xl shadow-sm border border-fin-ink/5 p-1 overflow-x-auto no-scrollbar">
            {rangeOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setRangeType(opt.id)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  rangeType === opt.id ? 'bg-fin-midnight text-fin-paper shadow-md' : 'text-fin-wood/40 hover:text-fin-midnight'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {rangeType === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-white border border-fin-ink/5 rounded-xl px-4 py-2.5 text-xs font-bold text-fin-midnight outline-none"
              />
              <span className="text-fin-wood/20">—</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-white border border-fin-ink/5 rounded-xl px-4 py-2.5 text-xs font-bold text-fin-midnight outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-fin-ink/5 flex flex-col items-center">
          <div className="w-full mb-8 flex justify-between items-center">
            <div>
              <h4 className="text-lg font-bold text-fin-ink uppercase tracking-tight">
                {showExpenseBreakdown ? '支出比例分佈' : '收入類別分佈'}
              </h4>
              <p className="text-[9px] text-fin-wood font-semibold uppercase tracking-widest mt-1 opacity-40">
                {showExpenseBreakdown ? 'Expense Distribution' : 'Income Distribution'}
              </p>
            </div>
            
            <div className="flex bg-fin-paper/20 rounded-2xl p-1 shadow-inner border border-fin-paper/50">
              <button 
                onClick={() => setShowExpenseBreakdown(true)}
                className={`p-2.5 rounded-xl transition-all ${showExpenseBreakdown ? 'bg-fin-midnight text-white shadow-md' : 'text-fin-wood/30'}`}
                title="查看支出"
              >
                <ArrowDownCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowExpenseBreakdown(false)}
                className={`p-2.5 rounded-xl transition-all ${!showExpenseBreakdown ? 'bg-fin-linen text-white shadow-md' : 'text-fin-wood/30'}`}
                title="查看收入"
              >
                <ArrowUpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="h-[320px] w-full relative">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', background: '#0a0908', color: '#eae0d5', fontSize: '11px', fontWeight: '700' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-fin-wood/20 font-bold uppercase tracking-widest text-xs">No data for this range</div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] font-bold text-fin-wood uppercase tracking-widest mb-1 opacity-50">
                {showExpenseBreakdown ? 'Range Expense' : 'Range Income'}
              </p>
              <p className="text-3xl font-black text-fin-midnight">${targetTotal.toLocaleString()}</p>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mt-8">
             <div className="p-6 bg-fin-paper/20 rounded-[2rem] border border-fin-paper/40">
                <p className="text-[8px] font-bold text-fin-wood uppercase tracking-widest mb-1">Total Income</p>
                <p className="text-xl font-bold text-fin-linen">+${totalIncome.toLocaleString()}</p>
             </div>
             <div className="p-6 bg-fin-midnight/5 rounded-[2rem] border border-fin-midnight/10">
                <p className="text-[8px] font-bold text-fin-wood uppercase tracking-widest mb-1">Total Expense</p>
                <p className="text-xl font-bold text-fin-midnight">-${totalExpense.toLocaleString()}</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-fin-ink/5 overflow-hidden flex flex-col">
          <div className="mb-8">
            <h4 className="text-lg font-bold text-fin-ink uppercase tracking-tight">
              {showExpenseBreakdown ? '支出明細 Ranking' : '收入明細 Ranking'}
            </h4>
            <p className="text-[9px] text-fin-wood font-semibold uppercase tracking-widest mt-1 opacity-40">Breakdown Ranking</p>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-5 p-5 bg-fin-paper/5 hover:bg-fin-paper/20 rounded-[1.75rem] transition-all group">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: item.color }}>
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-bold text-fin-ink text-sm uppercase truncate">{item.name}</span>
                    <span className="text-[10px] font-bold text-fin-wood/40">{item.percent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-fin-paper h-1.5 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000" style={{ width: `${item.percent}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-4">
                  <p className="font-bold text-fin-midnight text-base">${item.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {categoryData.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-20">
                <Calendar className="w-10 h-10 mb-4" />
                <p className="font-bold uppercase tracking-[0.5em] text-xs">No Records</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-fin-ink/5">
        <div className="mb-10">
          <h4 className="text-lg font-bold text-fin-ink uppercase tracking-tight">收支趨勢 (半年)</h4>
          <p className="text-[9px] text-fin-wood font-semibold uppercase tracking-widest mt-1 opacity-40">6-Month Trend Context</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last6Months} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0a0908" strokeOpacity={0.05} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#0a0908', fontSize: 10, fontWeight: 700, opacity: 0.3}} dy={10} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#eae0d5', opacity: 0.4}}
                contentStyle={{ borderRadius: '15px', border: 'none', background: '#0a0908', color: '#eae0d5', fontSize: '11px' }}
              />
              <Bar dataKey="收入" fill="#c6ac8f" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="支出" fill="#22333b" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analysis;


import React, { useState, useEffect } from 'react';
import { Transaction, Account, Category, SpendingInsight } from '../types';
import { generateSpendingInsights, parseSmartTransaction } from '../services/geminiService';
import { ICON_MAP, CATEGORIES } from '../constants';
import { Sparkles, Send, BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  onSmartAdd: (parsedTx: any) => void;
}

const AICoach: React.FC<Props> = ({ transactions, accounts, onSmartAdd }) => {
  const [insight, setInsight] = useState<SpendingInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await generateSpendingInsights(transactions, accounts, CATEGORIES);
    if (result) setInsight(result);
    setLoading(false);
  };

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsParsing(true);
    const parsed = await parseSmartTransaction(userInput, accounts, CATEGORIES);
    if (parsed) {
      onSmartAdd(parsed);
      setUserInput('');
    }
    setIsParsing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-xl relative overflow-hidden border border-fin-ink/5">
        <div className="flex items-center gap-5 mb-10">
          <div className="bg-fin-midnight p-4 rounded-2xl text-fin-paper shadow-lg">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-fin-ink tracking-tight">智慧語義記帳</h2>
            <div className="h-0.5 w-8 bg-fin-linen rounded-full mt-1.5"></div>
          </div>
        </div>
        
        <p className="text-fin-wood/60 mb-10 font-semibold text-sm tracking-wide leading-relaxed">
          您可以直接與教練對話。例如：「昨天在百貨公司刷了黑卡買了三千元的衣服」
        </p>

        <form onSubmit={handleSmartSubmit} className="relative group">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isParsing}
            placeholder="請以口語輸入您的交易詳情..."
            className="w-full bg-fin-paper/20 border-2 border-fin-paper rounded-[2rem] py-7 pl-10 pr-44 text-xl font-bold text-fin-ink focus:border-fin-midnight outline-none transition-all placeholder:text-fin-wood/20"
          />
          <button
            type="submit"
            disabled={isParsing || !userInput.trim()}
            className="absolute right-3.5 top-3.5 bottom-3.5 bg-fin-midnight hover:bg-fin-ink disabled:bg-fin-wood/20 text-fin-paper font-bold px-10 rounded-2xl flex items-center gap-3 transition-all shadow-lg"
          >
            {isParsing ? <div className="w-5 h-5 border-2 border-fin-paper/30 border-t-fin-paper rounded-full animate-spin"></div> : <><Send className="w-4 h-4" /><span>發送分析</span></>}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-10">
          <div className="bg-fin-paper p-10 rounded-[3rem] text-fin-ink shadow-inner border-r-4 border-fin-linen relative">
            <div className="flex items-center gap-2.5 mb-8">
              <Sparkles className="w-5 h-5 text-fin-midnight" />
              <span className="text-fin-midnight font-bold uppercase tracking-[0.2em] text-[9px]">AI Financial Insight Summary</span>
            </div>
            
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-white/50 rounded w-3/4"></div>
                <div className="h-4 bg-white/50 rounded w-full"></div>
              </div>
            ) : insight ? (
              <p className="text-2xl font-bold leading-relaxed tracking-tight">「{insight.summary}」</p>
            ) : (
              <p className="text-fin-wood/20 font-bold italic tracking-widest">等待數據分析載入中...</p>
            )}
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-fin-ink/5 shadow-sm">
            <h3 className="text-xl font-bold text-fin-ink mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-fin-midnight rounded-full"></div>
              留白理財結構建議
            </h3>
            <div className="space-y-5">
              {insight?.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-5 p-7 bg-fin-paper/10 rounded-[2rem] border border-fin-paper/50 hover:border-fin-midnight/10 transition-all group">
                  <div className="bg-fin-midnight/5 p-2.5 rounded-xl text-fin-midnight h-fit group-hover:rotate-6 transition-transform"><CheckCircle2 className="w-5 h-5" /></div>
                  <p className="text-fin-ink font-semibold leading-relaxed text-base">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-fin-midnight p-8 rounded-[2.5rem] shadow-xl">
            <h4 className="font-bold text-fin-linen mb-4 tracking-widest uppercase text-[9px]">教練指南 Tip</h4>
            <p className="text-fin-paper text-sm leading-relaxed font-semibold">
              「建立良好的緊急備用金是核心指標。根據分析，您可以從本月的餐飲支出中撥出 10% 轉入儲蓄。」
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-fin-ink/5 shadow-sm">
            <h4 className="font-bold text-fin-ink mb-6 text-[11px] uppercase tracking-widest">異常數據監測報告</h4>
            {insight?.unusualActivity && insight.unusualActivity.length > 0 ? insight.unusualActivity.map((act, i) => (
              <div key={i} className="flex gap-4 p-4 bg-fin-paper/20 rounded-2xl mb-3 border border-fin-paper/40">
                <AlertCircle className="w-5 h-5 text-red-800 flex-shrink-0" />
                <p className="text-fin-ink text-xs font-semibold leading-tight">{act}</p>
              </div>
            )) : (
              <div className="py-8 text-center text-fin-wood/10 font-bold uppercase tracking-widest text-[10px]">目前無異常活動回報</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;

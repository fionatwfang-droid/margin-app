
import React from 'react';
import { Account, AccountType } from '../types';
import { ICON_MAP } from '../constants';
import { CalendarClock, ArrowUpRight, ShieldCheck, Wallet, Globe, Trash2 } from 'lucide-react';

interface Props {
  accounts: Account[];
  onAddClick: () => void;
  onDelete: (id: string) => void;
}

const AccountList: React.FC<Props> = ({ accounts, onAddClick, onDelete }) => {
  const getAccountStyles = (type: AccountType) => {
    switch(type) {
      case AccountType.BANK: 
        return {
          label: 'Savings / 銀行儲蓄',
          bg: 'bg-white',
          accent: 'text-fin-midnight',
          icon: ICON_MAP.Banknote,
          badge: <ShieldCheck className="w-3 h-3" />
        };
      case AccountType.CREDIT_CARD: 
        return {
          label: 'Credit / 信用融通',
          bg: 'bg-fin-midnight',
          accent: 'text-fin-paper',
          icon: ICON_MAP.CreditCard,
          badge: <ArrowUpRight className="w-3 h-3" />
        };
      case AccountType.CASH: 
        return {
          label: 'Liquidity / 流動現金',
          bg: 'bg-[#f8f5f2]',
          accent: 'text-fin-wood',
          icon: ICON_MAP.Wallet,
          badge: <Wallet className="w-3 h-3" />
        };
      case AccountType.FOREIGN_CURRENCY:
        return {
          label: 'Foreign / 外幣資產',
          bg: 'bg-[#e9f1f5]',
          accent: 'text-[#2b4c5e]',
          icon: <Globe className="w-5 h-5" />,
          badge: <Globe className="w-3 h-3" />
        };
      default: return { label: 'Other', bg: 'bg-white', accent: 'text-fin-ink', icon: ICON_MAP.MoreHorizontal, badge: null };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {accounts.map((acc) => {
        const style = getAccountStyles(acc.type);
        const isCredit = acc.type === AccountType.CREDIT_CARD;
        const isForeign = acc.type === AccountType.FOREIGN_CURRENCY;
        
        return (
          <div key={acc.id} className="group h-full relative">
            {/* Delete Button */}
            <button 
              onClick={() => onDelete(acc.id)}
              className="absolute top-6 right-6 z-20 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className={`p-10 rounded-[3rem] ${style.bg} border border-fin-wood/5 shadow-xl transition-all duration-500 group-hover:shadow-fin-linen/20 group-hover:-translate-y-2 relative overflow-hidden h-full flex flex-col`}>
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={`p-5 rounded-2xl ${isCredit ? 'bg-white/10 text-fin-linen' : 'bg-fin-paper text-fin-midnight'} shadow-sm`}>
                  {style.icon}
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-1 ${isCredit ? 'text-fin-linen' : 'text-fin-wood'}`}>
                    {style.label}
                  </span>
                  <div className={`h-1 w-8 rounded-full ${isCredit ? 'bg-fin-linen' : (isForeign ? 'bg-[#5e8ba2]' : 'bg-fin-midnight')}`}></div>
                </div>
              </div>

              <div className="mb-8 relative z-10">
                <h3 className={`text-2xl font-black mb-1 tracking-tight truncate ${style.accent}`}>{acc.name}</h3>
                <div className="flex items-center gap-2 opacity-40">
                  {style.badge}
                  <span className={`text-[8px] font-bold uppercase tracking-[0.3em] ${style.accent}`}>
                    {isForeign ? `Currency: ${acc.currency || 'USD'}` : 'Secure Vault'}
                  </span>
                </div>
              </div>

              {isCredit && (
                <div className="mb-10 p-5 bg-white/5 rounded-[1.5rem] border border-white/10 backdrop-blur-sm relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-fin-linen/60 font-bold uppercase tracking-widest text-[8px]">
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>Billing Intelligence / 帳單情報</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[7px] font-bold text-fin-paper/30 uppercase tracking-tighter mb-1">Statement Date</p>
                      <p className="text-sm font-black text-fin-paper">每月 {acc.billingCycleDate} 日</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-bold text-fin-paper/30 uppercase tracking-tighter mb-1">Payment Due</p>
                      <p className="text-sm font-black text-fin-linen">每月 {acc.paymentDueDate} 日</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-6 flex justify-between items-end relative z-10">
                <div className="min-w-0 flex-1">
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isCredit ? 'text-fin-paper/40' : 'text-fin-wood/40'}`}>
                    {isForeign ? '持幣餘額' : '可用資產/欠款'}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <p className={`text-3xl font-black truncate ${acc.balance < 0 ? (isCredit ? 'text-fin-paper' : 'text-red-800') : style.accent}`}>
                      {isForeign ? '' : '$'}{Math.abs(acc.balance).toLocaleString()}
                    </p>
                    {isForeign && <span className="text-xs font-black opacity-40">{acc.currency || 'USD'}</span>}
                  </div>
                </div>
                {isCredit && acc.limit && (
                  <div className="text-right pl-4">
                    <p className="text-[8px] font-bold text-fin-paper/30 uppercase mb-2">Limit</p>
                    <div className="px-3 py-1 bg-fin-linen/20 rounded-lg border border-fin-linen/30">
                       <span className="text-xs font-black text-fin-linen">${(acc.limit/1000).toFixed(0)}K</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 背景裝飾元素 */}
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none opacity-20 ${isCredit ? 'bg-fin-linen' : (isForeign ? 'bg-[#5e8ba2]' : 'bg-fin-midnight')}`}></div>
            </div>
          </div>
        );
      })}

      <button 
        onClick={onAddClick}
        className="p-10 rounded-[3rem] border-2 border-dashed border-fin-linen flex flex-col items-center justify-center gap-6 text-fin-linen hover:text-fin-midnight hover:border-fin-midnight hover:bg-white transition-all duration-300 group min-h-[350px]"
      >
        <div className="p-6 bg-fin-paper rounded-3xl group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
          {ICON_MAP.PlusCircle}
        </div>
        <div className="text-center">
           <span className="font-black text-xs uppercase tracking-[0.3em] block mb-2">開設金融帳戶</span>
           <p className="text-[9px] font-bold text-fin-wood/40 uppercase tracking-widest">Connect New Asset</p>
        </div>
      </button>
    </div>
  );
};

export default AccountList;

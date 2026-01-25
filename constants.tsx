
import React from 'react';
import { 
  Home, Wallet, CreditCard, Banknote, ShoppingBag, 
  Utensils, Car, HeartPulse, GraduationCap, 
  MoreHorizontal, PlusCircle, PieChart, BrainCircuit,
  Settings, TrendingUp, Calendar, Zap, ArrowRightLeft,
  Sparkles, Receipt, HandCoins, Landmark, Coins
} from 'lucide-react';
import { Category, AccountType, TransactionType, Account } from './types';

export const CATEGORIES: Category[] = [
  // 支出類別 (Expense)
  { id: '1', name: '餐飲美食', icon: 'Utensils', color: 'bg-[#5e503f]', type: TransactionType.EXPENSE },
  { id: '2', name: '購物消費', icon: 'ShoppingBag', color: 'bg-[#c6ac8f]', type: TransactionType.EXPENSE },
  { id: '3', name: '交通出行', icon: 'Car', color: 'bg-[#22333b]', type: TransactionType.EXPENSE },
  { id: '4', name: '生活繳費', icon: 'Zap', color: 'bg-[#5e503f]', type: TransactionType.EXPENSE },
  { id: '5', name: '醫療保健', icon: 'HeartPulse', color: 'bg-[#0a0908]', type: TransactionType.EXPENSE },
  { id: '6', name: '教育學習', icon: 'GraduationCap', color: 'bg-[#c6ac8f]', type: TransactionType.EXPENSE },
  { id: '7', name: '居住房屋', icon: 'Home', color: 'bg-[#22333b]', type: TransactionType.EXPENSE },
  { id: '8', name: '其他支出', icon: 'MoreHorizontal', color: 'bg-[#7f8c8d]', type: TransactionType.EXPENSE },

  // 收入類別 (Income)
  { id: '10', name: '薪資收入', icon: 'Banknote', color: 'bg-[#22333b]', type: TransactionType.INCOME },
  { id: '11', name: '獎金收入', icon: 'Sparkles', color: 'bg-[#c6ac8f]', type: TransactionType.INCOME },
  { id: '12', name: '投資回報', icon: 'TrendingUp', color: 'bg-[#0a0908]', type: TransactionType.INCOME },
  { id: '13', name: '退稅/款', icon: 'Receipt', color: 'bg-[#5e503f]', type: TransactionType.INCOME },
  { id: '14', name: '他人還款', icon: 'HandCoins', color: 'bg-[#c6ac8f]', type: TransactionType.INCOME },
  { id: '15', name: '其他收入', icon: 'PlusCircle', color: 'bg-[#22333b]', type: TransactionType.INCOME },

  // 特殊類別 (Transfer)
  { id: '9', name: '帳戶轉帳', icon: 'ArrowRightLeft', color: 'bg-[#c6ac8f]', type: TransactionType.TRANSFER }, 
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc1', name: '個人錢包', type: AccountType.CASH, balance: 1250 },
  { id: 'acc2', name: '台銀儲蓄', type: AccountType.BANK, balance: 45000 },
  { id: 'acc3', name: '黑卡信用卡', type: AccountType.CREDIT_CARD, balance: -2400, limit: 100000, billingCycleDate: 10, paymentDueDate: 25 },
];

export const ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  HeartPulse: <HeartPulse className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  MoreHorizontal: <MoreHorizontal className="w-5 h-5" />,
  Wallet: <Wallet className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  Banknote: <Banknote className="w-5 h-5" />,
  PieChart: <PieChart className="w-5 h-5" />,
  BrainCircuit: <BrainCircuit className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  PlusCircle: <PlusCircle className="w-5 h-5" />,
  ArrowRightLeft: <ArrowRightLeft className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Receipt: <Receipt className="w-5 h-5" />,
  HandCoins: <HandCoins className="w-5 h-5" />,
  Landmark: <Landmark className="w-5 h-5" />,
  Coins: <Coins className="w-5 h-5" />,
};

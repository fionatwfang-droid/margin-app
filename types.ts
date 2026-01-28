
export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT_CARD = 'CREDIT_CARD',
  FOREIGN_CURRENCY = 'FOREIGN_CURRENCY'
}

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER'
}

export enum Frequency {
  ONCE = 'ONCE',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency?: string; // 預設 TWD
  limit?: number; // 信用卡額度
  billingCycleDate?: number; // 結算日 (1-31)
  paymentDueDate?: number;   // 繳款日 (1-31)
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Budget {
  categoryId: string;
  amount: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  accountId: string;
  toAccountId?: string; 
  categoryId: string;
  note: string;
  isRecurring: boolean;
  isInstallment: boolean;
}

export interface SpendingInsight {
  summary: string;
  recommendations: string[];
  unusualActivity: string[];
}

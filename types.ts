
export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT_CARD = 'CREDIT_CARD'
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
  limit?: number; // For credit cards
  billingCycleDate?: number; // 帳單結算日 (1-31)
  paymentDueDate?: number;   // 帳單繳款日 (1-31)
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType; // 區分支出、收入或轉帳
}

export interface Budget {
  categoryId: string;
  amount: number;
}

export interface InstallmentInfo {
  totalMonths: number;
  currentMonth: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  accountId: string;
  toAccountId?: string; // For transfers
  categoryId: string;
  note: string;
  isRecurring: boolean;
  frequency?: Frequency;
  isInstallment: boolean;
  installmentInfo?: InstallmentInfo;
}

export interface SpendingInsight {
  summary: string;
  recommendations: string[];
  unusualActivity: string[];
}


export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export type PaymentMode = 'CASH' | 'BANK';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  paymentMode: PaymentMode;
  bankId?: string;
  cashierName?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  items: InvoiceItem[];
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  cashierName?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
}

export interface Bank {
  id: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  balance: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

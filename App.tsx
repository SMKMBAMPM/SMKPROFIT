
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accounting from './pages/Accounting';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Master from './pages/Master';
import Login from './pages/Login';
import { Transaction, Invoice, TransactionType, FinancialSummary, Staff, Bank, InventoryItem, PaymentMode } from './types';

// Initial Mock Data
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-01', description: 'Monthly Subscription Sales', category: 'Sales', amount: 5000, type: TransactionType.INCOME, paymentMode: 'BANK', bankId: 'bank1' },
  { id: '2', date: '2023-10-05', description: 'Office Rent', category: 'Rent', amount: 1200, type: TransactionType.EXPENSE, paymentMode: 'BANK', bankId: 'bank1' },
];

const App: React.FC = () => {
  // Financial State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('invoices');
    return saved ? JSON.parse(saved) : [];
  });

  // Master Data State
  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('staff');
    return saved ? JSON.parse(saved) : [];
  });
  const [banks, setBanks] = useState<Bank[]>(() => {
    const saved = localStorage.getItem('banks');
    return saved ? JSON.parse(saved) : [{ id: 'bank1', bankName: 'Main Corporate Account', accountNumber: '88990011', branch: 'Mumbai', balance: 15000 }];
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('invoices', JSON.stringify(invoices));
    localStorage.setItem('staff', JSON.stringify(staff));
    localStorage.setItem('banks', JSON.stringify(banks));
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [transactions, invoices, staff, banks, inventory]);

  const summary = useMemo((): FinancialSummary => {
    const revenue = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    const netProfit = revenue - expenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return { totalRevenue: revenue, totalExpenses: expenses, netProfit, profitMargin };
  }, [transactions]);

  const addTransaction = (t: Transaction) => setTransactions(prev => [...prev, t]);
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  
  const addInvoice = (inv: Invoice) => {
    setInvoices(prev => [...prev, inv]);
    // Auto-record transaction if paid
    if (inv.status === 'PAID') {
      const total = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      addTransaction({
        id: `auto-${inv.id}`,
        date: inv.date,
        description: `Invoice ${inv.invoiceNumber} - ${inv.clientName}`,
        category: 'Sales',
        amount: total,
        type: TransactionType.INCOME,
        paymentMode: 'CASH', // Default to cash for auto-entries unless specified
        cashierName: inv.cashierName
      });
    }
  };

  const updateInvoice = (updatedInv: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInv.id ? updatedInv : inv));
    // If status changed to PAID, ensure transaction exists
    if (updatedInv.status === 'PAID' && !transactions.some(t => t.id === `auto-${updatedInv.id}`)) {
       const total = updatedInv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
       addTransaction({
        id: `auto-${updatedInv.id}`,
        date: updatedInv.date,
        description: `Invoice ${updatedInv.invoiceNumber} - ${updatedInv.clientName}`,
        category: 'Sales',
        amount: total,
        type: TransactionType.INCOME,
        paymentMode: 'CASH',
        cashierName: updatedInv.cashierName
      });
    }
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    deleteTransaction(`auto-${id}`);
  };

  const addStaff = (s: Staff) => setStaff(prev => [...prev, s]);
  const deleteStaff = (id: string) => setStaff(prev => prev.filter(s => s.id !== id));
  const addBank = (b: Bank) => setBanks(prev => [...prev, b]);
  const deleteBank = (id: string) => setBanks(prev => prev.filter(b => b.id !== id));
  const addInventory = (i: InventoryItem) => setInventory(prev => [...prev, i]);
  const deleteInventory = (id: string) => setInventory(prev => prev.filter(i => i.id !== id));

  const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    return localStorage.getItem('isLoggedIn') === 'true' ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard transactions={transactions} invoices={invoices} />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/accounting" element={
          <PrivateRoute>
            <Layout>
              <Accounting 
                transactions={transactions} 
                banks={banks}
                onAddTransaction={addTransaction} 
                onDeleteTransaction={deleteTransaction} 
              />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/invoices" element={
          <PrivateRoute>
            <Layout>
              <Invoices 
                invoices={invoices} 
                staff={staff}
                inventory={inventory}
                onAddInvoice={addInvoice} 
                onUpdateInvoice={updateInvoice}
                onDeleteInvoice={deleteInvoice}
              />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/master" element={
          <PrivateRoute>
            <Layout>
              <Master 
                staff={staff}
                onAddStaff={addStaff}
                onDeleteStaff={deleteStaff}
                banks={banks}
                onAddBank={addBank}
                onDeleteBank={deleteBank}
                inventory={inventory}
                onAddInventory={addInventory}
                onDeleteInventory={deleteInventory}
              />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <Layout>
              <Reports transactions={transactions} invoices={invoices} summary={summary} />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

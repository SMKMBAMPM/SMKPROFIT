
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Bank, PaymentMode } from '../types';

interface AccountingProps {
  transactions: Transaction[];
  banks: Bank[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const Accounting: React.FC<AccountingProps> = ({ transactions, banks, onAddTransaction, onDeleteTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"username": "Admin"}');

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Sales',
    type: TransactionType.INCOME,
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH' as PaymentMode,
    bankId: '',
    cashierName: currentUser.username
  });

  const balances = useMemo(() => {
    let cash = 0;
    let bankTotal = 0;

    transactions.forEach(t => {
      const amount = t.type === TransactionType.INCOME ? t.amount : -t.amount;
      if (t.paymentMode === 'CASH') {
        cash += amount;
      } else {
        bankTotal += amount;
      }
    });

    // Add initial bank balances from master data
    banks.forEach(b => {
      bankTotal += b.balance;
    });

    return { cash, bankTotal };
  }, [transactions, banks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: formData.date,
      paymentMode: formData.paymentMode,
      bankId: formData.paymentMode === 'BANK' ? formData.bankId : undefined,
      cashierName: formData.cashierName
    };
    onAddTransaction(newTransaction);
    setIsModalOpen(false);
    setFormData({
      description: '',
      amount: '',
      category: 'Sales',
      type: TransactionType.INCOME,
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH',
      bankId: '',
      cashierName: currentUser.username
    });
  };

  const getBankName = (id?: string) => {
    if (!id) return '-';
    const bank = banks.find(b => b.id === id);
    return bank ? bank.bankName : 'Unknown Bank';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Ledger</h2>
          <p className="text-slate-500">Dual-ledger system for Cash and Bank tracking</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          + Add Transaction
        </button>
      </div>

      {/* Balance Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cash in Hand</p>
            <p className="text-3xl font-black text-slate-900 mt-1">₹{balances.cash.toLocaleString()}</p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">💵</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Bank Balance</p>
            <p className="text-3xl font-black text-slate-900 mt-1">₹{balances.bankTotal.toLocaleString()}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">🏦</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{t.date}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{t.description}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{t.category}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tighter uppercase ${
                      t.paymentMode === 'CASH' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {t.paymentMode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {t.paymentMode === 'BANK' ? getBankName(t.bankId) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                      t.type === TransactionType.INCOME 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-600'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-right whitespace-nowrap ${
                      t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => onDeleteTransaction(t.id)}
                      className="text-slate-300 hover:text-rose-600 transition-colors text-xs font-bold uppercase"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic">
                    The ledger is empty. Record your first transaction to start tracking balances.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Add Ledger Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. Sales Collection"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as TransactionType})}
                  >
                    <option value={TransactionType.INCOME}>Income (+)</option>
                    <option value={TransactionType.EXPENSE}>Expense (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Payment Mode</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({...formData, paymentMode: e.target.value as PaymentMode})}
                  >
                    <option value="CASH">Physical Cash</option>
                    <option value="BANK">Bank / Transfer</option>
                  </select>
                </div>
              </div>

              {formData.paymentMode === 'BANK' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Select Bank Account</label>
                  <select
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-800"
                    value={formData.bankId}
                    onChange={(e) => setFormData({...formData, bankId: e.target.value})}
                    required
                  >
                    <option value="">Choose a bank...</option>
                    {banks.map(b => (
                      <option key={b.id} value={b.id}>{b.bankName} (...{b.accountNumber.slice(-4)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g. Sales, Marketing, Utilities"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;

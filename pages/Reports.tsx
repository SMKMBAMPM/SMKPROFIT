
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, FinancialSummary, Invoice } from '../types';
import { getFinancialInsights } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from 'recharts';

interface ReportsProps {
  transactions: Transaction[];
  invoices: Invoice[];
  summary: FinancialSummary;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Reports: React.FC<ReportsProps> = ({ transactions, invoices, summary }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Date Filtering State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Filtered Data Sets
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => inv.date >= startDate && inv.date <= endDate);
  }, [invoices, startDate, endDate]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
  }, [filteredTransactions]);

  // Expense Category Aggregation
  const expenseCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const totalFilteredExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleGenerateInsight = async () => {
    setIsLoading(true);
    const result = await getFinancialInsights(transactions, summary);
    setInsight(result || "No data available.");
    setIsLoading(false);
  };

  const profitTrendData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    
    // Use filtered transactions for the chart to match the selected range
    filteredTransactions.forEach(t => {
      const amount = t.type === TransactionType.INCOME ? t.amount : -t.amount;
      dailyData[t.date] = (dailyData[t.date] || 0) + amount;
    });

    return Object.entries(dailyData)
      .map(([date, profit]) => ({
        date,
        profit,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredTransactions]);

  // Invoice-wise Profit Calculation
  const invoiceProfitData = useMemo(() => {
    return filteredInvoices.map(inv => {
      const revenue = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const cost = inv.items.reduce((sum, item) => sum + (item.quantity * (item.unitCost || 0)), 0);
      const profit = revenue - cost;
      return {
        id: inv.id,
        number: inv.invoiceNumber,
        client: inv.clientName,
        date: inv.date,
        revenue,
        profit,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    }).sort((a, b) => b.profit - a.profit);
  }, [filteredInvoices]);

  // Item-wise Profit Aggregation
  const itemProfitData = useMemo(() => {
    const itemsMap: Record<string, { qty: number; revenue: number; profit: number }> = {};

    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const key = item.description;
        if (!itemsMap[key]) {
          itemsMap[key] = { qty: 0, revenue: 0, profit: 0 };
        }
        const revenue = item.quantity * item.unitPrice;
        const cost = item.quantity * (item.unitCost || 0);
        itemsMap[key].qty += item.quantity;
        itemsMap[key].revenue += revenue;
        itemsMap[key].profit += (revenue - cost);
      });
    });

    return Object.entries(itemsMap).map(([name, data]) => ({
      name,
      ...data,
      margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
    })).sort((a, b) => b.profit - a.profit);
  }, [filteredInvoices]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Reports</h2>
          <p className="text-slate-500">Advanced analysis and AI-driven growth recommendations</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={handleGenerateInsight}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center min-w-[180px]"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              <>✨ Generate AI Insights</>
            )}
          </button>
        </div>
      </div>

      {/* Report Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Master Date Range Control</h4>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
            <span className="text-slate-300">to</span>
            <input 
              type="date" 
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Profit (Invoices)</p>
            <p className="text-xl font-bold text-emerald-600">₹{invoiceProfitData.reduce((sum, i) => sum + i.profit, 0).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Period Expenses</p>
            <p className="text-xl font-bold text-rose-600">₹{totalFilteredExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Expense Ledger Section - New Date Wise Expense Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Expense Breakdown</h3>
          {expenseCategoryData.length > 0 ? (
            <div className="space-y-6">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total']}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {expenseCategoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="text-sm font-medium text-slate-600">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">₹{cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 italic text-sm">No expenses recorded in this period.</div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Detailed Expense Ledger</h3>
            <span className="text-[10px] bg-rose-50 text-rose-600 font-black px-2 py-1 rounded-full uppercase tracking-tighter">Period Wise List</span>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 sticky top-0 bg-white z-10">
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="pb-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-xs text-slate-500 whitespace-nowrap">{exp.date}</td>
                    <td className="py-4">
                      <p className="text-sm font-bold text-slate-900">{exp.description}</p>
                    </td>
                    <td className="py-4">
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">{exp.category}</span>
                    </td>
                    <td className="py-4 text-right text-sm font-black text-rose-600">₹{exp.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 italic text-sm">No specific expenses found for the selected range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice-wise Profit Breakdown */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Invoice-wise Profit</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-2 py-1 rounded-full uppercase tracking-tighter">By Date Range</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice / Client</th>
                  <th className="pb-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                  <th className="pb-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Profit</th>
                  <th className="pb-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoiceProfitData.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <p className="text-sm font-bold text-slate-900">{item.number}</p>
                      <p className="text-xs text-slate-500">{item.client}</p>
                    </td>
                    <td className="py-4 text-right text-sm text-slate-600 font-medium">₹{item.revenue.toLocaleString()}</td>
                    <td className="py-4 text-right text-sm font-bold text-emerald-600">₹{item.profit.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <span className="text-xs font-black text-slate-400">{item.margin.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
                {invoiceProfitData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 italic text-sm">No invoices found for this date range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Item-wise Profit Breakdown */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Item-wise Profit</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-2 py-1 rounded-full uppercase tracking-tighter">By Product/Service</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description / Qty</th>
                  <th className="pb-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                  <th className="pb-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Profit</th>
                  <th className="pb-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {itemProfitData.map(item => (
                  <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{item.name}</p>
                      <p className="text-xs text-slate-500">Sold: {item.qty}</p>
                    </td>
                    <td className="py-4 text-right text-sm text-slate-600 font-medium">₹{item.revenue.toLocaleString()}</td>
                    <td className="py-4 text-right text-sm font-bold text-indigo-600">₹{item.profit.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <div className="w-16 ml-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(item.margin, 100)}%` }}></div>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 mt-1 uppercase">{item.margin.toFixed(0)}% Margin</p>
                    </td>
                  </tr>
                ))}
                {itemProfitData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 italic text-sm">No items found for this date range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Net Profit Trend (Selected Period)</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Net Profit']}
              />
              <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center space-x-6 text-xs font-medium text-slate-500">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></span>
            Daily Net Profit Trend (₹)
          </div>
        </div>
      </div>

      {insight && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl">🤖</span>
            <h3 className="text-xl font-bold text-indigo-900">AI Business Insights</h3>
          </div>
          <div className="prose prose-indigo max-w-none text-indigo-800 whitespace-pre-wrap">
            {insight}
          </div>
          <div className="mt-8 pt-6 border-t border-indigo-100 flex items-center text-xs text-indigo-400">
            Analysis generated using Gemini 3 Flash Preview. For informational purposes only.
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

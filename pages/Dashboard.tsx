
import React, { useMemo } from 'react';
import { Transaction, TransactionType, FinancialSummary, Invoice } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  invoices: Invoice[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, invoices }) => {
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

  const trendData = useMemo(() => {
    const daily: Record<string, number> = {};
    transactions.slice(-15).forEach(t => {
      const amount = t.type === TransactionType.INCOME ? t.amount : -t.amount;
      daily[t.date] = (daily[t.date] || 0) + amount;
    });
    return Object.entries(daily).map(([date, val]) => ({ 
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      val 
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h2>
          <p className="text-slate-500 font-medium">Real-time business performance overview</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-emerald-600">Operations Normal</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${summary.totalRevenue.toLocaleString()}`} icon="💰" color="text-blue-600" bg="bg-blue-50" detail="+12% from last month" />
        <StatCard title="Total Expenses" value={`₹${summary.totalExpenses.toLocaleString()}`} icon="💸" color="text-rose-600" bg="bg-rose-50" detail="7 categories tracked" />
        <StatCard title="Net Profit" value={`₹${summary.netProfit.toLocaleString()}`} icon="📈" color="text-emerald-600" bg="bg-emerald-50" detail="After operational costs" />
        <StatCard title="Profit Margin" value={`${summary.profitMargin.toFixed(1)}%`} icon="🎯" color="text-amber-600" bg="bg-amber-50" detail="Healthy range: >15%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Area Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-8 text-slate-800">Cash Flow Trend</h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Daily Net']}
                  />
                  <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply opacity-20 filter blur-3xl"></div>
        </div>

        {/* Recent Ledger Entries */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Live Ledger</h3>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase">Realtime</span>
          </div>
          <div className="space-y-6">
            {recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {t.description[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.date} • {t.paymentMode}</p>
                  </div>
                </div>
                <span className={`text-sm font-black ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}₹{t.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="py-20 text-center text-slate-400 italic text-sm">No activity recorded yet.</div>
            )}
          </div>
          <button className="w-full mt-10 py-3 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">
            Full Ledger Review
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string; bg: string; detail: string }> = ({ title, value, icon, color, bg, detail }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
      </div>
    </div>
    <div className="pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">
      {detail}
    </div>
  </div>
);

export default Dashboard;

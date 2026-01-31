
import React, { useState } from 'react';
import { Invoice, InvoiceItem, Staff, InventoryItem } from '../types';

interface InvoicesProps {
  invoices: Invoice[];
  staff: Staff[];
  inventory: InventoryItem[];
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoice: (inv: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
}

interface FormItem {
  id?: string;
  description: string;
  unitPrice: string;
  unitCost: string;
  quantity: string;
}

const Invoices: React.FC<InvoicesProps> = ({ invoices, staff, inventory, onAddInvoice, onUpdateInvoice, onDeleteInvoice }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"username": "Admin"}');

  const initialItem: FormItem = {
    description: '',
    unitPrice: '',
    unitCost: '',
    quantity: '1'
  };

  const [formData, setFormData] = useState({
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    cashierName: currentUser.username,
    status: 'PENDING' as any,
    items: [initialItem] as FormItem[]
  });

  const resetForm = () => {
    setFormData({
      clientName: '',
      date: new Date().toISOString().split('T')[0],
      cashierName: currentUser.username,
      status: 'PENDING',
      items: [{ ...initialItem }]
    });
    setEditInvoiceId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditInvoiceId(inv.id);
    setFormData({
      clientName: inv.clientName,
      date: inv.date,
      cashierName: inv.cashierName || currentUser.username,
      status: inv.status,
      items: inv.items.map(item => ({
        id: item.id,
        description: item.description,
        unitPrice: item.unitPrice.toString(),
        unitCost: item.unitCost.toString(),
        quantity: item.quantity.toString()
      }))
    });
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: string) => {
    const newItems = [...formData.items];
    
    // Auto-fill logic for description lookup
    if (field === 'description') {
      const match = inventory.find(i => i.name === value);
      if (match) {
        newItems[index] = {
          ...newItems[index],
          description: value,
          unitPrice: match.sellingPrice.toString(),
          unitCost: match.purchasePrice.toString()
        };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    const invoiceItems: InvoiceItem[] = formData.items.map(item => ({
      id: item.id || Math.random().toString(),
      description: item.description,
      quantity: parseInt(item.quantity) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      unitCost: parseFloat(item.unitCost) || 0
    }));

    if (editInvoiceId) {
      const existing = invoices.find(i => i.id === editInvoiceId);
      const updatedInvoice: Invoice = {
        ...existing!,
        clientName: formData.clientName,
        date: formData.date,
        cashierName: formData.cashierName,
        status: formData.status,
        items: invoiceItems,
      };
      onUpdateInvoice(updatedInvoice);
      setLastCreatedInvoice(updatedInvoice);
    } else {
      const newInvoice: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        clientName: formData.clientName,
        date: formData.date,
        cashierName: formData.cashierName,
        items: invoiceItems,
        status: formData.status
      };
      onAddInvoice(newInvoice);
      setLastCreatedInvoice(newInvoice);
    }
    setIsSuccess(true);
  };

  const calculateTotal = (items: InvoiceItem[]) => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Invoices</h2>
          <p className="text-slate-500 font-medium">Professional billing & revenue tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95">
            + New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {invoices.map((inv) => (
          <div key={inv.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer relative group" onClick={() => setSelectedInvoice(inv)}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{inv.invoiceNumber}</span>
                <h3 className="text-xl font-black text-slate-900 truncate max-w-[180px]">{inv.clientName}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>{inv.status}</span>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-xs font-medium"><span className="text-slate-400">Date</span><span className="text-slate-700">{inv.date}</span></div>
              <div className="flex justify-between text-xs font-medium"><span className="text-slate-400">Staff</span><span className="text-slate-700 font-bold">👤 {inv.cashierName || 'Admin'}</span></div>
            </div>
            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
              <span className="text-2xl font-black text-slate-900">₹{calculateTotal(inv.items).toLocaleString()}</span>
            </div>
            <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={(e) => handleOpenEdit(inv, e)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">✏️</button>
               <button onClick={(e) => { e.stopPropagation(); onDeleteInvoice(inv.id); }} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-5xl p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            {isSuccess ? (
              <div className="text-center py-20 animate-in zoom-in">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">✓</div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Invoice Synchronized!</h3>
                <p className="text-slate-500 font-medium mb-12">Entry recorded in master ledger and client database.</p>
                <div className="flex flex-col gap-4 max-w-xs mx-auto">
                  <button onClick={() => { setSelectedInvoice(lastCreatedInvoice); setIsModalOpen(false); }} className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Print & Share</button>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600">Return to Terminal</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveInvoice} className="space-y-10">
                <div className="flex justify-between items-center border-b border-slate-100 pb-8">
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{editInvoiceId ? 'Modify Record' : 'Generate Invoice'}</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors text-3xl">×</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Client Identity</label>
                    <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Transaction Date</label>
                    <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-blue-600" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service / Product Items</h4><button type="button" onClick={() => setFormData({...formData, items: [...formData.items, {...initialItem}]})} className="text-blue-600 font-black text-sm uppercase tracking-tighter hover:underline">+ New Row</button></div>
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-6 rounded-3xl group border-2 border-transparent hover:border-blue-100 transition-all">
                        <div className="md:col-span-5 relative">
                          <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Description / Master Lookup</label>
                          <input list="inventory-list" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none font-bold" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} required />
                          <datalist id="inventory-list">{inventory.map(i => <option key={i.id} value={i.name} />)}</datalist>
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Sell Price (₹)</label>
                           <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none font-black text-emerald-600" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} required />
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Base Cost (₹)</label>
                           <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none font-medium text-rose-400" value={item.unitCost} onChange={e => handleItemChange(index, 'unitCost', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Quantity</label>
                           <input type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none font-bold" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} required />
                        </div>
                        <div className="md:col-span-1 text-center">
                           <button type="button" onClick={() => setFormData({...formData, items: formData.items.filter((_, i) => i !== index)})} className="text-rose-400 hover:text-rose-600 mb-2">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-slate-100">
                  <div className="text-left mb-6 md:mb-0">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aggregate Total</p>
                     <p className="text-5xl font-black text-slate-900 tracking-tighter">₹{formData.items.reduce((s,i) => s + (parseFloat(i.quantity)*parseFloat(i.unitPrice)||0), 0).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 md:flex-none px-12 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest transition-all">Cancel</button>
                    <button type="submit" className="flex-1 md:flex-none px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all hover:bg-blue-700">Finalize & Save</button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

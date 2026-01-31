
import React, { useState, useEffect } from 'react';
import { Staff, Bank, InventoryItem, User } from '../types';

interface MasterProps {
  staff: Staff[];
  onAddStaff: (s: Staff) => void;
  onDeleteStaff: (id: string) => void;
  banks: Bank[];
  onAddBank: (b: Bank) => void;
  onDeleteBank: (id: string) => void;
  inventory: InventoryItem[];
  onAddInventory: (i: InventoryItem) => void;
  onDeleteInventory: (id: string) => void;
}

const Master: React.FC<MasterProps> = ({ 
  staff, onAddStaff, onDeleteStaff, 
  banks, onAddBank, onDeleteBank, 
  inventory, onAddInventory, onDeleteInventory 
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'bank' | 'inventory'>('staff');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedStaffForAuth, setSelectedStaffForAuth] = useState<Staff | null>(null);

  // Form states
  const [staffForm, setStaffForm] = useState({ name: '', role: '', phone: '', salary: '' });
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', branch: '', balance: '' });
  const [inventoryForm, setInventoryForm] = useState({ name: '', unit: 'Pcs', purchasePrice: '', sellingPrice: '', stock: '' });
  const [authForm, setAuthForm] = useState({ username: '', password: '' });

  // Users from localStorage to track who has login
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    setRegisteredUsers(users);
  }, [isAuthModalOpen]);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleOpenAuth = (s: Staff) => {
    setSelectedStaffForAuth(s);
    const existingUser = registeredUsers.find(u => u.username.toLowerCase() === s.name.replace(/\s+/g, '').toLowerCase());
    setAuthForm({ 
      username: existingUser ? existingUser.username : s.name.replace(/\s+/g, '').toLowerCase(), 
      password: '' 
    });
    setIsAuthModalOpen(true);
  };

  const handleSaveAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForAuth) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.username.toLowerCase() === authForm.username.toLowerCase());

    const newUserObj = { 
      username: authForm.username, 
      password: authForm.password,
      role: 'user' 
    };

    if (userIndex > -1) {
      users[userIndex] = newUserObj;
    } else {
      users.push(newUserObj);
    }

    localStorage.setItem('users', JSON.stringify(users));
    setRegisteredUsers(users);
    setIsAuthModalOpen(false);
    alert(`Login credentials for ${selectedStaffForAuth.name} have been updated.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);

    if (activeTab === 'staff') {
      onAddStaff({ ...staffForm, id, salary: parseFloat(staffForm.salary) || 0 });
      setStaffForm({ name: '', role: '', phone: '', salary: '' });
    } else if (activeTab === 'bank') {
      onAddBank({ ...bankForm, id, balance: parseFloat(bankForm.balance) || 0 });
      setBankForm({ bankName: '', accountNumber: '', branch: '', balance: '' });
    } else if (activeTab === 'inventory') {
      onAddInventory({ 
        ...inventoryForm, 
        id, 
        purchasePrice: parseFloat(inventoryForm.purchasePrice) || 0,
        sellingPrice: parseFloat(inventoryForm.sellingPrice) || 0,
        stock: parseFloat(inventoryForm.stock) || 0 
      });
      setInventoryForm({ name: '', unit: 'Pcs', purchasePrice: '', sellingPrice: '', stock: '' });
    }
    setIsModalOpen(false);
  };

  const hasLogin = (name: string) => {
    return registeredUsers.some(u => u.username.toLowerCase() === name.replace(/\s+/g, '').toLowerCase());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Master Configuration</h2>
          <p className="text-slate-500">Global settings for personnel, assets, and capital</p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
        >
          + Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </button>
      </div>

      {/* Custom Tabs */}
      <div className="flex p-1 bg-slate-200 rounded-2xl w-full max-w-md">
        {(['staff', 'bank', 'inventory'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all uppercase tracking-widest ${
              activeTab === tab 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {activeTab === 'staff' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & Role</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Login Access</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monthly Salary</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-lg font-bold text-slate-900">{s.name}</p>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-tighter">{s.role}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {hasLogin(s.name) ? (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-2 py-1 rounded-full border border-emerald-100">Authorized</span>
                      ) : (
                        <span className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase px-2 py-1 rounded-full border border-slate-100">No Access</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-600 font-medium">{s.phone}</td>
                    <td className="px-8 py-6 text-right text-lg font-black text-slate-900">₹{s.salary.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleOpenAuth(s)}
                          className="text-blue-500 hover:text-blue-700 transition-colors font-bold text-xs uppercase"
                        >
                          {hasLogin(s.name) ? 'Edit Login' : 'Set Login'}
                        </button>
                        <button 
                          onClick={() => onDeleteStaff(s.id)} 
                          className="text-rose-400 hover:text-rose-600 transition-colors font-bold text-xs uppercase"
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">No staff members registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank & Branch</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">A/C Number</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Current Balance</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {banks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-lg font-bold text-slate-900">{b.bankName}</p>
                      <p className="text-xs text-slate-500 font-medium">{b.branch}</p>
                    </td>
                    <td className="px-8 py-6 font-mono text-sm text-slate-600">{b.accountNumber}</td>
                    <td className="px-8 py-6 text-right text-lg font-black text-emerald-600">₹{b.balance.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => onDeleteBank(b.id)} className="text-rose-400 hover:text-rose-600 transition-colors font-bold text-xs uppercase">Remove</button>
                    </td>
                  </tr>
                ))}
                {banks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">No bank accounts linked.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item & Stock</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price (P/S)</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Potential Profit</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inventory.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-lg font-bold text-slate-900">{i.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{i.stock} {i.unit} in stock</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">P: ₹{i.purchasePrice}</span>
                        <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 font-bold">S: ₹{i.sellingPrice}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-lg font-black text-emerald-600">₹{((i.sellingPrice - i.purchasePrice) * i.stock).toLocaleString()}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Margin: {(((i.sellingPrice - i.purchasePrice) / i.sellingPrice) * 100).toFixed(0)}%</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => onDeleteInventory(i.id)} className="text-rose-400 hover:text-rose-600 transition-colors font-bold text-xs uppercase">Delete</button>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">Inventory is empty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Add New {activeTab}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} required />
                  <input type="text" placeholder="Designation / Role" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="tel" placeholder="Phone Number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} required />
                    <input type="number" placeholder="Monthly Salary" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={staffForm.salary} onChange={e => setStaffForm({...staffForm, salary: e.target.value})} required />
                  </div>
                </div>
              )}

              {activeTab === 'bank' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Bank Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} required />
                  <input type="text" placeholder="Account Number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Branch Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={bankForm.branch} onChange={e => setBankForm({...bankForm, branch: e.target.value})} required />
                    <input type="number" placeholder="Opening Balance" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={bankForm.balance} onChange={e => setBankForm({...bankForm, balance: e.target.value})} required />
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                      <input type="text" placeholder="Product/Service Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={inventoryForm.name} onChange={e => setInventoryForm({...inventoryForm, name: e.target.value})} required />
                    </div>
                    <div className="col-span-1">
                      <select className="w-full px-3 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                        value={inventoryForm.unit} onChange={e => setInventoryForm({...inventoryForm, unit: e.target.value})}>
                        <option>Pcs</option>
                        <option>Kg</option>
                        <option>Ltr</option>
                        <option>Mtr</option>
                        <option>Srv</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Purchase Price" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={inventoryForm.purchasePrice} onChange={e => setInventoryForm({...inventoryForm, purchasePrice: e.target.value})} required />
                    <input type="number" placeholder="Selling Price" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={inventoryForm.sellingPrice} onChange={e => setInventoryForm({...inventoryForm, sellingPrice: e.target.value})} required />
                  </div>
                  <input type="number" placeholder="Initial Stock Quantity" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={inventoryForm.stock} onChange={e => setInventoryForm({...inventoryForm, stock: e.target.value})} required />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Discard</button>
                <button type="submit" className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all">Confirm Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && selectedStaffForAuth && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔐</div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Staff Login Credentials</h3>
              <p className="text-slate-500 text-sm mt-2">Generate portal access for <b>{selectedStaffForAuth.name}</b></p>
            </div>
            <form onSubmit={handleSaveAuth} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700" 
                  value={authForm.username} 
                  onChange={e => setAuthForm({...authForm, username: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Set Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                  value={authForm.password} 
                  onChange={e => setAuthForm({...authForm, password: e.target.value})} 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAuthModalOpen(false)} className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all">Assign Access</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Master;

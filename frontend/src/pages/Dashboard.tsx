import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  Info, 
  MoreVertical, 
  Copy, 
  Eye, 
  EyeOff, 
  X,
  Globe,
  CreditCard,
  User,
  FileText,
  Terminal,
  Folder,
  Layers,
  Star,
  ChevronDown,
  LayoutGrid,
  Lock
} from 'lucide-react';
import LDPLogo from '../components/LDPLogo';
import { encrypt, decrypt } from '../utils/crypto';

interface VaultItem {
  id: string;
  name: string;
  username: string;
  password?: string;
  url: string;
  notes: string;
  isHidden: boolean;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);

  // New Item State
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newIsHidden, setNewIsHidden] = useState(false);
  const [isVerifyingMaster, setIsVerifyingMaster] = useState(false);
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/vault', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (err) {
      console.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async () => {
    if (showPassword) {
      setShowPassword(false);
      return;
    }
    
    // Always require master password for reveal
    setIsVerifyingMaster(true);
    setVerificationError('');
    setMasterPasswordInput('');
  };

  const verifyAndReveal = async () => {
    try {
      const response = await api.post('/api/auth/verify-master', {
        userId: user?.id,
        password: masterPasswordInput
      });

      if (response.data.valid) {
        setShowPassword(true);
        setIsVerifyingMaster(false);
        // Log the reveal
        await api.post('/api/logs', {
           action: 'REVEAL',
           itemId: selectedItem?.id,
           details: `Password revealed for ${selectedItem?.name}`
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        setVerificationError('Invalid master password');
      }
    } catch (err) {
      setVerificationError('Verification failed');
    }
  };

  useEffect(() => {
    if (token) fetchItems();
  }, [token]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const masterPassword = sessionStorage.getItem('masterPassword') || '';
    
    try {
      const encryptedPassword = encrypt(newPassword, masterPassword);
      const encryptedNotes = encrypt(newNotes, masterPassword);

      await api.post('/api/vault', {
        name: newName,
        username: newUsername,
        password: encryptedPassword,
        url: newUrl,
        notes: encryptedNotes,
        isHidden: newIsHidden
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsAdding(false);
      resetNewItemForm();
      fetchItems();
    } catch (err) {
      alert('Failed to add item');
    }
  };

  const resetNewItemForm = () => {
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setNewUrl('');
    setNewNotes('');
  };

  const getDecryptedValue = (ciphertext: string) => {
    const masterPassword = sessionStorage.getItem('masterPassword') || '';
    return decrypt(ciphertext, masterPassword);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-medium text-gray-800">All vaults</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="bg-[#175ddc] hover:bg-[#134db8] text-white px-4 py-1.5 rounded flex items-center gap-2 text-sm font-bold shadow-sm transition-colors"
            >
              <Plus size={16} />
              New
              <ChevronDown size={14} className="opacity-60" />
            </button>
            {showNewMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                <button onClick={() => { setIsAdding(true); setShowNewMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <Globe size={16} className="text-gray-400" /> Login
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <CreditCard size={16} className="text-gray-400" /> Card
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <User size={16} className="text-gray-400" /> Identity
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <FileText size={16} className="text-gray-400" /> Note
                </button>
              </div>
            )}
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded">
            <LayoutGrid size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#175ddc] flex items-center justify-center text-white font-bold text-xs">
            {user?.name?.[0].toUpperCase()}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto px-6 py-6 flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between group cursor-pointer">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Filters</h3>
              <Info size={14} className="text-gray-300 group-hover:text-blue-500" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search vault" 
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:border-blue-500 text-sm outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
             <div className="flex items-center gap-3 px-2 py-1.5 rounded bg-blue-50 text-blue-700 font-medium text-sm cursor-pointer">
               <ChevronDown size={14} /> All vaults
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <User size={14} /> My vault
             </div>
             <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4 group">
               <div className="flex items-center gap-3">
                 <Layers size={14} /> LDP Logistics, Inc
               </div>
               <MoreVertical size={14} className="opacity-0 group-hover:opacity-40" />
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-400 text-sm cursor-pointer ml-4">
               <Plus size={14} /> New organization
             </div>
          </div>

          <div className="space-y-1">
             <div className="flex items-center gap-3 px-2 py-1.5 rounded bg-blue-50 text-blue-700 font-medium text-sm cursor-pointer">
               <ChevronDown size={14} /> All items
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <Star size={14} /> Favorites
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <Globe size={14} /> Login
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <CreditCard size={14} /> Card
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <User size={14} /> Identity
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <FileText size={14} /> Note
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <Terminal size={14} /> SSH key
             </div>
          </div>

          <div className="space-y-1">
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer">
               <ChevronDown size={14} /> Folders
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <Folder size={14} /> No folder
             </div>
          </div>

          <div className="space-y-1">
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer">
               <ChevronDown size={14} /> Collections
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <Layers size={14} /> Operations
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <Layers size={14} /> Sales
             </div>
             <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 text-sm cursor-pointer ml-4">
               <Layers size={14} /> Compliance
             </div>
          </div>
        </div>

        {/* Items List Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 border-l border-gray-100 relative">
          <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-2 text-sm text-gray-500 font-medium">
             <input type="checkbox" className="rounded" />
             <div className="w-10"></div>
             <div className="flex-1">Name</div>
             <div className="w-48 text-right">Owner</div>
             <div className="w-10"></div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <LDPLogo className="mb-6 opacity-20 w-16 h-16 grayscale" />
              <p className="text-gray-400">Nothing to show here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 py-3 group hover:bg-gray-50 cursor-pointer px-2 rounded"
                  onClick={() => { setSelectedItem(item); setIsAdding(false); }}
                >
                  <input type="checkbox" className="rounded" />
                  <div className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center text-gray-400 bg-white">
                    <Globe size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.username}</p>
                  </div>
                  <div className="w-48 text-right text-xs text-gray-400">
                    My vault
                  </div>
                  <div className="w-10 flex justify-end">
                    <MoreVertical size={16} className="text-gray-300 group-hover:text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Details Sidebar overlay */}
          {(selectedItem || isAdding) && (
            <div className="absolute inset-y-0 right-0 w-[450px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">{isAdding ? 'New Login' : 'Item Details'}</h3>
                  <button onClick={() => { setSelectedItem(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {isAdding ? (
                    <form onSubmit={handleAddItem} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Name</label>
                          <input type="text" className="input-field mt-1" value={newName} onChange={e => setNewName(e.target.value)} required />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Username</label>
                          <input type="text" className="input-field mt-1" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Password</label>
                          <div className="relative">
                            <input type={showPassword ? "text" : "password"} className="input-field mt-1" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400">
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">URL</label>
                          <input type="text" className="input-field mt-1" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Notes</label>
                          <textarea className="input-field mt-1 h-32" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-3 py-2">
                           <input 
                             type="checkbox" 
                             id="isHidden" 
                             className="rounded w-4 h-4 text-[#175ddc] focus:ring-[#175ddc]"
                             checked={newIsHidden}
                             onChange={e => setNewIsHidden(e.target.checked)}
                           />
                           <label htmlFor="isHidden" className="text-xs font-bold text-gray-700 cursor-pointer">
                             Hide password from users (Hidden Password Mode)
                           </label>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-[#175ddc] text-white font-bold py-3 rounded hover:bg-[#134db8] transition-colors">
                        Save
                      </button>
                    </form>
                  ) : selectedItem && (
                    <div className="space-y-8">
                       <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-400">
                            <Globe size={32} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800 leading-tight">{selectedItem.name}</h2>
                            <p className="text-sm text-gray-500 uppercase mt-1">Login</p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="group border-b border-gray-100 pb-4">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Username</label>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-gray-800 font-medium">{selectedItem.username || 'None'}</span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-gray-100 rounded text-blue-600"><Copy size={16} /></button>
                              </div>
                            </div>
                          </div>

                          <div className="group border-b border-gray-100 pb-4">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-gray-800 font-medium tracking-widest">
                                {selectedItem.isHidden && user?.role !== 'ADMIN' ? '••••••••••••' : (showPassword ? getDecryptedValue(selectedItem.password || '') : '••••••••••••')}
                              </span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {selectedItem.isHidden && user?.role !== 'ADMIN' ? (
                                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold uppercase">Hidden</span>
                                ) : (
                                  <>
                                    <button onClick={handleReveal} className="p-1.5 hover:bg-gray-100 rounded text-blue-600">
                                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button className="p-1.5 hover:bg-gray-100 rounded text-blue-600"><Copy size={16} /></button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="group border-b border-gray-100 pb-4">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">URI</label>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-blue-600 hover:underline cursor-pointer text-sm truncate max-w-xs">{selectedItem.url || 'None'}</span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-gray-100 rounded text-blue-600"><Globe size={16} /></button>
                                <button className="p-1.5 hover:bg-gray-100 rounded text-blue-600"><Copy size={16} /></button>
                              </div>
                            </div>
                          </div>

                          <div className="group border-b border-gray-100 pb-4">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Notes</label>
                            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                              {selectedItem.notes ? getDecryptedValue(selectedItem.notes) : 'None'}
                            </p>
                          </div>
                       </div>
                       
                       <div className="flex gap-3 pt-8 border-t border-gray-100">
                         <button className="flex-1 bg-white border border-gray-300 py-2.5 rounded font-bold text-gray-700 hover:bg-gray-50">Edit</button>
                         <button className="flex-1 bg-red-50 border border-red-100 py-2.5 rounded font-bold text-red-600 hover:bg-red-100">Delete</button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
      {/* Master Password Verification Modal */}
      {isVerifyingMaster && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
              <div className="flex items-center gap-3 mb-6">
                 <Lock className="text-[#175ddc]" size={24} />
                 <h2 className="text-xl font-bold text-gray-800">Master Password Required</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                 To reveal this password, please re-enter your master password for security.
              </p>
              <div className="space-y-4">
                 <div>
                    <input 
                      type="password" 
                      placeholder="Master Password" 
                      className="input-field"
                      autoFocus
                      value={masterPasswordInput}
                      onChange={e => setMasterPasswordInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && verifyAndReveal()}
                    />
                    {verificationError && <p className="text-red-500 text-xs mt-1 font-bold">{verificationError}</p>}
                 </div>
                 <div className="flex gap-3 mt-8">
                    <button 
                      onClick={() => setIsVerifyingMaster(false)}
                      className="flex-1 px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={verifyAndReveal}
                      className="flex-1 bg-[#175ddc] text-white font-bold py-2 rounded hover:bg-[#134db8]"
                    >
                      Unlock
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

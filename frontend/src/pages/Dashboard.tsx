// LDP Vault Production Deployment - Neon DB Cloud Architecture Finalized
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
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
  Lock,
  Trash2,
  Shield,
  LogOut,
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
  type: string;
  isFavorite: boolean;
  folderId?: string;
  collectionId?: string;
  cardholderName?: string;
  cardNumber?: string;
  expirationMonth?: string;
  expirationYear?: string;
  cvv?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  licenseNumber?: string;
  customFields?: {name: string, value: string}[];
  updatedAt: string;
}

interface FolderItem {
  id: string;
  name: string;
}

interface CollectionItem {
  id: string;
  name: string;
}

const Dashboard: React.FC = () => {
  const { token, user, unlock, lock, logout } = useAuth();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Filters State
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'login' | 'card' | 'identity' | 'note' | 'ssh' | 'folder' | 'collection'>('all');
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  // Folder / Collection creation inputs
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // New Item State
  const [newType, setNewType] = useState<string>('login');
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newIsHidden, setNewIsHidden] = useState(false);
  const [newIsFavorite, setNewIsFavorite] = useState(false);
  const [newFolderId, setNewFolderId] = useState('');
  const [newCollectionId, setNewCollectionId] = useState('');

  // Card-specific State
  const [newCardholderName, setNewCardholderName] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newExpirationMonth, setNewExpirationMonth] = useState('');
  const [newExpirationYear, setNewExpirationYear] = useState('');
  const [newCvv, setNewCvv] = useState('');

  // Identity-specific State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLicenseNumber, setNewLicenseNumber] = useState('');
  const [newCustomFields, setNewCustomFields] = useState<{name: string, value: string}[]>([]);

  // Verification modal state
  const [isVerifyingMaster, setIsVerifyingMaster] = useState(false);
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [revealField, setRevealField] = useState<'password' | 'cardNumber' | 'cvv' | 'licenseNumber'>('password');

  // Delete Confirmation State
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);


  const fetchItems = async () => {
    try {
      const response = await api.get('/api/vault');
      setItems(response.data);
    } catch (err) {
      console.error('Failed to fetch items');
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await api.get('/api/folder');
      setFolders(response.data);
    } catch (err) {
      console.error('Failed to fetch folders');
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await api.get('/api/collection');
      setCollections(response.data);
    } catch (err) {
      console.error('Failed to fetch collections');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchFolders(), fetchCollections()]);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  const handleReveal = async (field: 'password' | 'cardNumber' | 'cvv' | 'licenseNumber') => {
    if (showPassword && revealField === field) {
      setShowPassword(false);
      return;
    }
    setRevealField(field);
    setIsVerifyingMaster(true);
    setVerificationError('');
    setMasterPasswordInput('');
  };

  const verifyMasterPassword = async () => {
    try {
      // 1. Verify against server (for security)
      const response = await api.post('/api/auth/verify-master', {
        userId: user?.id,
        password: masterPasswordInput
      });

      if (response.data.valid) {
        // 2. Unlock in context (stores in sessionStorage)
        await unlock(masterPasswordInput);
        
        setIsVerifyingMaster(false);
        setMasterPasswordInput('');
        setVerificationError('');

        // 3. If it was a reveal request
        if (revealField) {
          setShowPassword(true);
          await api.post('/api/logs', {
             action: 'REVEAL',
             itemId: selectedItem?.id,
             details: `${revealField} revealed for ${selectedItem?.name}`
          }, { /* Global headers handled by api.ts */ });
        }

      } else {
        setVerificationError('Invalid master password');
      }
    } catch (err) {
      setVerificationError('Verification failed');
    }
  };



  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const masterPassword = sessionStorage.getItem('masterPassword') || '';
    
    try {
      const encryptedPassword = newPassword ? encrypt(newPassword, masterPassword) : '';
      const encryptedNotes = newNotes ? encrypt(newNotes, masterPassword) : '';
      const encryptedCardNumber = newCardNumber ? encrypt(newCardNumber, masterPassword) : '';
      const encryptedCvv = newCvv ? encrypt(newCvv, masterPassword) : '';
      const encryptedLicense = newLicenseNumber ? encrypt(newLicenseNumber, masterPassword) : '';

      await api.post('/api/vault', {
        name: newName,
        type: newType,
        username: newUsername,
        password: encryptedPassword,
        url: newUrl,
        notes: encryptedNotes,
        isHidden: newIsHidden,
        isFavorite: newIsFavorite,
        folderId: newFolderId || undefined,
        collectionId: newCollectionId || undefined,
        cardholderName: newCardholderName,
        cardNumber: encryptedCardNumber,
        expirationMonth: newExpirationMonth,
        expirationYear: newExpirationYear,
        cvv: encryptedCvv,
        firstName: newFirstName,
        lastName: newLastName,
        address: newAddress,
        phone: newPhone,
        licenseNumber: encryptedLicense,
        customFields: newCustomFields.map(f => ({ name: f.name, value: f.value ? encrypt(f.value, masterPassword) : '' }))
      });

      setIsAdding(false);
      resetNewItemForm();
      await fetchItems();
    } catch (err) {
      alert('Failed to add item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    setItemToDelete(id);
    setIsDeleting(true);
  };


  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeletingLoading(true);
    try {
      console.log('Attempting to delete item:', itemToDelete);
      const response = await api.delete(`/api/vault/${itemToDelete}`);
      
      console.log('Delete response:', response.status);
      setSelectedItem(null);
      setIsDeleting(false);
      setItemToDelete(null);
      await fetchItems();
    } catch (err: any) {
      console.error('Delete failed:', err.response?.data || err.message);
      alert('Failed to delete item: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleToggleFavorite = async (item: VaultItem) => {
    try {
      await api.put(`/api/vault/${item.id}`, {
        isFavorite: !item.isFavorite
      });
      if (selectedItem?.id === item.id) {
        setSelectedItem({ ...item, isFavorite: !item.isFavorite });
      }
      await fetchItems();
    } catch (err) {
      console.error('Failed to toggle favorite');
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post('/api/folder', { name: newFolderName });
      setNewFolderName('');
      setShowFolderInput(false);
      await fetchFolders();
    } catch (err) {
      alert('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this folder?')) return;
    try {
      await api.delete(`/api/folder/${id}`);
      if (activeFilter === 'folder' && activeFilterId === id) {
        setActiveFilter('all');
      }
      await fetchFolders();
      await fetchItems();
    } catch (err) {
      alert('Failed to delete folder');
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      await api.post('/api/collection', { name: newCollectionName });
      setNewCollectionName('');
      setShowCollectionInput(false);
      await fetchCollections();
    } catch (err) {
      alert('Failed to create collection');
    }
  };

  const handleDeleteCollection = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      await api.delete(`/api/collection/${id}`);
      if (activeFilter === 'collection' && activeFilterId === id) {
        setActiveFilter('all');
      }
      await fetchCollections();
      await fetchItems();
    } catch (err) {
      alert('Failed to delete collection');
    }
  };

  const resetNewItemForm = () => {
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setNewUrl('');
    setNewNotes('');
    setNewIsHidden(false);
    setNewIsFavorite(false);
    setNewFolderId('');
    setNewCollectionId('');
    setNewCardholderName('');
    setNewCardNumber('');
    setNewExpirationMonth('');
    setNewExpirationYear('');
    setNewCvv('');
    setNewFirstName('');
    setNewLastName('');
    setNewAddress('');
    setNewPhone('');
    setNewLicenseNumber('');
    setNewCustomFields([]);
    loadAllData();
  };

  const getDecryptedValue = (ciphertext: string) => {
    if (!ciphertext) return '';
    const masterPassword = sessionStorage.getItem('masterPassword') || '';
    return decrypt(ciphertext, masterPassword);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.username && item.username.toLowerCase().includes(searchTerm.toLowerCase()));
      
    if (!matchesSearch) return false;

    if (activeFilter === 'favorites') return item.isFavorite;
    if (activeFilter === 'login') return item.type === 'login';
    if (activeFilter === 'card') return item.type === 'card';
    if (activeFilter === 'identity') return item.type === 'identity';
    if (activeFilter === 'note') return item.type === 'note';
    if (activeFilter === 'ssh') return item.type === 'ssh';
    if (activeFilter === 'folder') {
      if (activeFilterId === 'none') return !item.folderId;
      return item.folderId === activeFilterId;
    }
    if (activeFilter === 'collection') return item.collectionId === activeFilterId;

    return true;
  });

  const getIcon = (type: string, url?: string) => {
    let domain = '';
    if (url) {
      try {
        // Handle emails slightly differently to extract the domain
        if (url.includes('@') && !url.includes('/')) {
           domain = url.split('@')[1].toLowerCase();
        } else {
           domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
        }
      } catch (e) {
        domain = url.toLowerCase();
      }
    }

    if (domain && domain !== 'None') {
      return (
        <img 
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} 
          className="w-4 h-4 rounded-sm" 
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?domain=google.com&sz=64'; // very generic fallback
          }}
        />
      );
    }

    switch (type) {
      case 'card': return <CreditCard size={18} />;
      case 'identity': return <User size={18} />;
      case 'note': return <FileText size={18} />;
      case 'ssh': return <Terminal size={18} />;
      default: return <Globe size={18} />;
    }
  };

  if (!user?.portals?.includes('vault')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-12 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-amber-100">
          <Shield size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Vault Access Required</h2>
        <p className="text-gray-500 max-w-sm mb-8 font-medium">Your account does not have permission to access the Secure Vault portal. Please use the Admin Console or contact support.</p>
        {(user?.role === 'ADMIN' || user?.portals?.includes('admin')) && (
          <Link to="/admin" className="px-8 py-3 bg-[#0d43af] text-white font-bold rounded-xl hover:bg-[#0a358a] transition-all text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20">
            Go to Admin Console
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-medium text-gray-800">
          {activeFilter === 'all' && 'All Vaults'}
          {activeFilter === 'favorites' && 'Favorites'}
          {activeFilter === 'login' && 'Logins'}
          {activeFilter === 'card' && 'Cards'}
          {activeFilter === 'identity' && 'Identities'}
          {activeFilter === 'note' && 'Secure Notes'}
          {activeFilter === 'ssh' && 'SSH Keys'}
          {activeFilter === 'folder' && (activeFilterId === 'none' ? 'Unassigned Folder' : `Folder: ${folders.find(f => f.id === activeFilterId)?.name}`)}
          {activeFilter === 'collection' && `Collection: ${collections.find(c => c.id === activeFilterId)?.name}`}
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="bg-[#0d43af] hover:bg-[#0a358a] text-white px-4 py-1.5 rounded flex items-center gap-2 text-sm font-bold shadow-sm transition-colors"
            >
              <Plus size={16} />
              New
              <ChevronDown size={14} className="opacity-60" />
            </button>
            {showNewMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                <button onClick={() => { setNewType('login'); setIsAdding(true); setShowNewMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <Globe size={16} className="text-gray-400" /> Login
                </button>
                <button onClick={() => { setNewType('card'); setIsAdding(true); setShowNewMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <CreditCard size={16} className="text-gray-400" /> Card
                </button>
                <button onClick={() => { setNewType('identity'); setIsAdding(true); setShowNewMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <User size={16} className="text-gray-400" /> Identity
                </button>
                <button onClick={() => { setNewType('note'); setIsAdding(true); setShowNewMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <FileText size={16} className="text-gray-400" /> Secure Note
                </button>
                <button onClick={() => { setNewType('ssh'); setIsAdding(true); setShowNewMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3">
                  <Terminal size={16} className="text-gray-400" /> SSH Key
                </button>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg flex items-center justify-center text-white font-black text-sm shrink-0 border border-white/20 cursor-pointer hover:scale-105 transition-transform"
              title="Profile & Settings"
            >
              {user?.name?.[0].toUpperCase()}
            </div>

            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                      {user?.name?.[0].toUpperCase()}
                    </div>
                    <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tighter">{user?.name}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold truncate pl-11">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => { lock(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Lock size={16} className="text-slate-400" />
                    Lock Vault
                  </button>
                  <div className="h-px bg-gray-50 mx-2 my-1"></div>
                  <button 
                    onClick={() => { logout(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-[#0d43af] hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <LogOut size={16} className="text-[#0d43af]" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto px-6 py-6 flex flex-col gap-6 select-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between group">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Filters</h3>
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
             <div 
               onClick={() => { setActiveFilter('all'); setActiveFilterId(null); }}
               className={`flex items-center gap-3 px-2 py-1.5 rounded text-sm cursor-pointer font-medium ${activeFilter === 'all' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
             >
               <Layers size={14} /> All vaults
             </div>
             <div 
               onClick={() => { setActiveFilter('favorites'); setActiveFilterId(null); }}
               className={`flex items-center gap-3 px-2 py-1.5 rounded text-sm cursor-pointer font-medium ml-4 ${activeFilter === 'favorites' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
             >
               <Star size={14} /> Favorites
             </div>
          </div>

          {/* Types Section */}
          <div className="space-y-1">
             <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Types</h4>
             <div 
               onClick={() => { setActiveFilter('login'); setActiveFilterId(null); }}
               className={`flex items-center gap-3 px-2 py-1.5 rounded text-sm cursor-pointer ml-2 ${activeFilter === 'login' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
             >
               <Globe size={14} /> Logins
             </div>
             <div 
               onClick={() => { setActiveFilter('card'); setActiveFilterId(null); }}
               className={`flex items-center gap-3 px-2 py-1.5 rounded text-sm cursor-pointer ml-2 ${activeFilter === 'card' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
             >
               <CreditCard size={14} /> Cards
             </div>
             <div 
               onClick={() => { setActiveFilter('identity'); setActiveFilterId(null); }}
               className={`flex items-center gap-3 px-2 py-1.5 rounded text-sm cursor-pointer ml-2 ${activeFilter === 'identity' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
             >
               <User size={14} /> Identities
             </div>
             <div 
               onClick={() => { setActiveFilter('note'); setActiveFilterId(null); }}
               className={`flex items-center gap-3 px-2 py-1.5 rounded text-sm cursor-pointer ml-2 ${activeFilter === 'note' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
             >
               <FileText size={14} /> Secure Notes
             </div>
             <div 
               onClick={() => { setActiveFilter('ssh'); setActiveFilterId(null); }}
               className={`flex items-center gap-3 px-2 py-1.5 rounded text-sm cursor-pointer ml-2 ${activeFilter === 'ssh' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
             >
               <Terminal size={14} /> SSH Keys
             </div>
          </div>

          {/* Folders Section */}
          <div className="space-y-1">
             <div className="flex items-center justify-between px-2 mb-2">
               <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Folders</h4>
               <button onClick={() => setShowFolderInput(!showFolderInput)} className="text-gray-400 hover:text-blue-600">
                 <Plus size={14} />
               </button>
             </div>

             {showFolderInput && (
               <form onSubmit={handleCreateFolder} className="px-2 mb-2">
                 <input 
                   type="text" 
                   placeholder="New folder name..." 
                   className="w-full px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:border-blue-500"
                   value={newFolderName}
                   onChange={e => setNewFolderName(e.target.value)}
                   autoFocus
                 />
               </form>
             )}

             <div 
               onClick={() => { setActiveFilter('folder'); setActiveFilterId('none'); }}
               className={`flex items-center gap-3 px-2 py-1.5 rounded text-sm cursor-pointer ml-2 ${activeFilter === 'folder' && activeFilterId === 'none' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
             >
               <Folder size={14} /> Unassigned
             </div>

             {folders.map(folder => (
               <div 
                 key={folder.id}
                 onClick={() => { setActiveFilter('folder'); setActiveFilterId(folder.id); }}
                 className={`flex items-center justify-between px-2 py-1.5 rounded text-sm cursor-pointer ml-2 group ${activeFilter === 'folder' && activeFilterId === folder.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
               >
                 <div className="flex items-center gap-3">
                   <Folder size={14} /> {folder.name}
                 </div>
                 <button onClick={(e) => handleDeleteFolder(folder.id, e)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Trash2 size={12} />
                 </button>
               </div>
             ))}
          </div>

          {/* Collections Section */}
          <div className="space-y-1">
             <div className="flex items-center justify-between px-2 mb-2">
               <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Collections</h4>
               <button onClick={() => setShowCollectionInput(!showCollectionInput)} className="text-gray-400 hover:text-blue-600">
                 <Plus size={14} />
               </button>
             </div>

             {showCollectionInput && (
               <form onSubmit={handleCreateCollection} className="px-2 mb-2">
                 <input 
                   type="text" 
                   placeholder="New collection name..." 
                   className="w-full px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:border-blue-500"
                   value={newCollectionName}
                   onChange={e => setNewCollectionName(e.target.value)}
                   autoFocus
                 />
               </form>
             )}

             {collections.map(collection => (
               <div 
                 key={collection.id}
                 onClick={() => { setActiveFilter('collection'); setActiveFilterId(collection.id); }}
                 className={`flex items-center justify-between px-2 py-1.5 rounded text-sm cursor-pointer ml-2 group ${activeFilter === 'collection' && activeFilterId === collection.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
               >
                 <div className="flex items-center gap-3">
                   <Layers size={14} /> {collection.name}
                 </div>
                 <button onClick={(e) => handleDeleteCollection(collection.id, e)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Trash2 size={12} />
                 </button>
               </div>
             ))}
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d43af]"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <LDPLogo className="mb-6 opacity-20 h-12 w-auto grayscale" />
              <p className="text-gray-400">Nothing to show here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-4 py-3 group hover:bg-gray-50 cursor-pointer px-2 rounded ${selectedItem?.id === item.id ? 'bg-blue-50/50 border border-blue-100' : ''}`}
                  onClick={() => { setSelectedItem(item); setIsAdding(false); setShowPassword(false); }}
                >
                  <input type="checkbox" className="rounded" />
                  <div className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center text-gray-400 bg-white overflow-hidden">
                    {getIcon(item.type, item.url)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.username || item.url || 'No Details'}</p>
                  </div>
                  <div className="w-10 flex justify-end gap-2 pr-4">
                    {item.url && (
                      <a 
                        href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-white hover:shadow-sm text-blue-600 transition-all border border-transparent hover:border-blue-100"
                        title={`Launch ${item.name}`}
                        onClick={e => e.stopPropagation()}
                      >
                        <Globe size={14} />
                      </a>
                    )}
                  </div>
                  <div className="w-48 text-right text-xs text-gray-400">
                    My vault
                  </div>
                  <div className="w-10 flex justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item); }}
                      className={`p-1 rounded hover:bg-gray-100 ${item.isFavorite ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star size={14} fill={item.isFavorite ? 'currentColor' : 'none'} />
                    </button>
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
                  <h3 className="text-lg font-bold text-gray-800">
                    {isAdding ? `New ${newType.toUpperCase()}` : 'Item Details'}
                  </h3>
                  <button onClick={() => { setSelectedItem(null); setIsAdding(false); setShowPassword(false); }} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {isAdding ? (
                    <form onSubmit={handleAddItem} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Item Type</label>
                          <select 
                            className="input-field mt-1 h-10"
                            value={newType}
                            onChange={e => setNewType(e.target.value)}
                          >
                            <option value="login">Login</option>
                            <option value="card">Card</option>
                            <option value="identity">Identity</option>
                            <option value="note">Secure Note</option>
                            <option value="ssh">SSH Key</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Name</label>
                          <input type="text" className="input-field mt-1" value={newName} onChange={e => setNewName(e.target.value)} required />
                        </div>

                        {/* Login / SSH Specific Fields */}
                        {(newType === 'login' || newType === 'ssh') && (
                          <>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase">Username</label>
                              <input type="text" className="input-field mt-1" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase">Password / Key Content</label>
                              <div className="relative">
                                <input type={showPassword ? "text" : "password"} className="input-field mt-1" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400">
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                            <div className="relative">
                          <label className="text-[11px] font-bold text-gray-500 uppercase">URI / Website</label>
                          <div className="flex gap-2 items-center mt-1">
                            <input type="text" className="input-field" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="e.g. google.com" />
                            {newUrl && (
                               <div className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden" title="Icon Preview">
                                 {getIcon('login', newUrl)}
                               </div>
                            )}
                          </div>
                        </div>
                          </>
                        )}

                        {/* Card-specific fields */}
                        {newType === 'card' && (
                          <>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase">Cardholder Name</label>
                              <input type="text" className="input-field mt-1" value={newCardholderName} onChange={e => setNewCardholderName(e.target.value)} />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase">Card Number</label>
                              <input type="text" className="input-field mt-1" value={newCardNumber} onChange={e => setNewCardNumber(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Exp Month</label>
                                <input type="text" placeholder="MM" className="input-field mt-1" value={newExpirationMonth} onChange={e => setNewExpirationMonth(e.target.value)} />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Exp Year</label>
                                <input type="text" placeholder="YYYY" className="input-field mt-1" value={newExpirationYear} onChange={e => setNewExpirationYear(e.target.value)} />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase">CVV</label>
                                <input type="password" placeholder="***" className="input-field mt-1" value={newCvv} onChange={e => setNewCvv(e.target.value)} />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Identity-specific fields */}
                        {newType === 'identity' && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase">First Name</label>
                                <input type="text" className="input-field mt-1" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Last Name</label>
                                <input type="text" className="input-field mt-1" value={newLastName} onChange={e => setNewLastName(e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase">Address</label>
                              <input type="text" className="input-field mt-1" value={newAddress} onChange={e => setNewAddress(e.target.value)} />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase">Phone</label>
                              <input type="text" className="input-field mt-1" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase">License Number</label>
                              <input type="text" className="input-field mt-1" value={newLicenseNumber} onChange={e => setNewLicenseNumber(e.target.value)} />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Notes</label>
                          <textarea className="input-field mt-1 h-24" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
                        </div>

                        {/* Folder selection */}
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Folder</label>
                          <select 
                            className="input-field mt-1 h-10" 
                            value={newFolderId} 
                            onChange={e => setNewFolderId(e.target.value)}
                          >
                            <option value="">No Folder</option>
                            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                        </div>

                        {/* Collection selection */}
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Collection</label>
                          <select 
                            className="input-field mt-1 h-10" 
                            value={newCollectionId} 
                            onChange={e => setNewCollectionId(e.target.value)}
                          >
                            <option value="">No Collection</option>
                            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        {/* Custom Fields Section */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Custom Fields</label>
                            <button 
                              type="button" 
                              onClick={() => setNewCustomFields([...newCustomFields, { name: '', value: '' }])}
                              className="text-[10px] font-bold text-[#175ddc] hover:underline uppercase flex items-center gap-1"
                            >
                              <Plus size={10} /> Add Field
                            </button>
                          </div>
                          {newCustomFields.map((field, index) => (
                            <div key={index} className="flex gap-2 items-end group">
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase">Field Name</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Pin Code" 
                                  className="input-field mt-0.5 h-9 text-xs" 
                                  value={field.name} 
                                  onChange={e => {
                                    const updated = [...newCustomFields];
                                    updated[index].name = e.target.value;
                                    setNewCustomFields(updated);
                                  }}
                                />
                              </div>
                              <div className="flex-[2]">
                                <label className="text-[9px] font-bold text-gray-400 uppercase">Value</label>
                                <input 
                                  type="text" 
                                  placeholder="Value..." 
                                  className="input-field mt-0.5 h-9 text-xs" 
                                  value={field.value} 
                                  onChange={e => {
                                    const updated = [...newCustomFields];
                                    updated[index].value = e.target.value;
                                    setNewCustomFields(updated);
                                  }}
                                />
                              </div>
                              <button 
                                type="button" 
                                onClick={() => setNewCustomFields(newCustomFields.filter((_, i) => i !== index))}
                                className="p-2 mb-0.5 text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 py-2">
                           <input 
                             type="checkbox" 
                             id="isHidden" 
                             className="rounded w-4 h-4 text-[#175ddc] focus:ring-[#175ddc]"
                             checked={newIsHidden}
                             onChange={e => setNewIsHidden(e.target.checked)}
                           />
                           <label htmlFor="isHidden" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                             Hide password from users (Hidden Password Mode)
                           </label>
                        </div>

                        <div className="flex items-center gap-3 py-1">
                           <input 
                             type="checkbox" 
                             id="isFavorite" 
                             className="rounded w-4 h-4 text-[#175ddc] focus:ring-[#175ddc]"
                             checked={newIsFavorite}
                             onChange={e => setNewIsFavorite(e.target.checked)}
                           />
                           <label htmlFor="isFavorite" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                             Mark as Favorite
                           </label>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-[#175ddc] text-white font-bold py-3 rounded hover:bg-[#134db8] transition-colors mt-4">
                        Save
                      </button>
                    </form>
                  ) : selectedItem && (
                    <div className="space-y-8">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-white transition-colors overflow-hidden">
                          {getIcon(selectedItem.type, selectedItem.url)}
                        </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800 leading-tight">{selectedItem.name}</h2>
                            <p className="text-sm text-gray-500 uppercase mt-1">{selectedItem.type}</p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          {/* Login specific details */}
                          {(selectedItem.type === 'login' || selectedItem.type === 'ssh') && (
                            <>
                              <div className="group border-b border-gray-100 pb-4">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Username</label>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-gray-800 font-medium">{selectedItem.username || 'None'}</span>
                                  {selectedItem.username && (
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(selectedItem.username || '');
                                        api.post('/api/logs', {
                                          action: 'COPY_USERNAME',
                                          itemId: selectedItem.id,
                                          details: `User copied username for ${selectedItem.name}`
                                        });
                                      }} 
                                      className="p-1.5 hover:bg-gray-100 rounded text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Copy size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="group border-b border-gray-100 pb-4">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-gray-800 font-medium tracking-widest font-mono">
                                    {selectedItem.isHidden && user?.role !== 'ADMIN' ? '••••••••••••' : (showPassword && revealField === 'password' ? getDecryptedValue(selectedItem.password || '') : '••••••••••••')}
                                  </span>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {selectedItem.isHidden && user?.role !== 'ADMIN' ? (
                                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold uppercase">Hidden</span>
                                    ) : (
                                      <>
                                        <button onClick={() => handleReveal('password')} className="p-1.5 hover:bg-gray-100 rounded text-blue-600">
                                          {showPassword && revealField === 'password' ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button 
                                          onClick={() => {
                                            navigator.clipboard.writeText(getDecryptedValue(selectedItem.password || ''));
                                            api.post('/api/logs', {
                                              action: 'COPY_PASSWORD',
                                              itemId: selectedItem.id,
                                              details: `User copied password for ${selectedItem.name}`
                                            });
                                          }} 
                                          className="p-1.5 hover:bg-gray-100 rounded text-blue-600"
                                        >
                                          <Copy size={16} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                               <div className="group border-b border-gray-100 pb-4">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">URI</label>
                                <div className="flex items-center justify-between mt-1">
                                  <a 
                                    href={selectedItem.url?.startsWith('http') ? selectedItem.url : `https://${selectedItem.url}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm truncate max-w-xs font-bold"
                                  >
                                    {selectedItem.url || 'None'}
                                  </a>
                                </div>
                              </div>

                              {/* Custom Fields in Details */}
                              {selectedItem.customFields && (selectedItem.customFields as any[]).length > 0 && (
                                <div className="pt-2 space-y-4">
                                  {(selectedItem.customFields as any[]).map((field: any, idx: number) => (
                                    <div key={idx} className="group border-b border-gray-100 pb-4">
                                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{field.name}</label>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-gray-800 font-medium">
                                          {getDecryptedValue(field.value)}
                                        </span>
                                        <button 
                                          onClick={() => navigator.clipboard.writeText(getDecryptedValue(field.value))}
                                          className="p-1.5 hover:bg-gray-100 rounded text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Copy size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            </>
                          )}

                          {/* Card specific details */}
                          {selectedItem.type === 'card' && (
                            <>
                              <div className="group border-b border-gray-100 pb-4">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cardholder Name</label>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-gray-800 font-medium">{selectedItem.cardholderName || 'None'}</span>
                                </div>
                              </div>

                              <div className="group border-b border-gray-100 pb-4">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Card Number</label>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-gray-800 font-medium font-mono">
                                    {showPassword && revealField === 'cardNumber' ? getDecryptedValue(selectedItem.cardNumber || '') : '•••• •••• •••• ••••'}
                                  </span>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleReveal('cardNumber')} className="p-1.5 hover:bg-gray-100 rounded text-blue-600">
                                      {showPassword && revealField === 'cardNumber' ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                                <div>
                                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Expiration Date</label>
                                  <div className="text-gray-800 font-medium mt-1">
                                    {selectedItem.expirationMonth && selectedItem.expirationYear ? `${selectedItem.expirationMonth}/${selectedItem.expirationYear}` : 'None'}
                                  </div>
                                </div>
                                <div className="group">
                                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CVV</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-800 font-medium font-mono">
                                      {showPassword && revealField === 'cvv' ? getDecryptedValue(selectedItem.cvv || '') : '•••'}
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleReveal('cvv')} className="p-1.5 hover:bg-gray-100 rounded text-blue-600">
                                        {showPassword && revealField === 'cvv' ? <EyeOff size={12} /> : <Eye size={12} />}
                                      </button>
                                      <button 
                                        onClick={() => {
                                          navigator.clipboard.writeText(getDecryptedValue(selectedItem.cvv || ''));
                                          api.post('/api/logs', {
                                            action: 'COPY_CVV',
                                            itemId: selectedItem.id,
                                            details: `User copied CVV for ${selectedItem.name}`
                                          });
                                        }} 
                                        className="p-1.5 hover:bg-gray-100 rounded text-blue-600"
                                      >
                                        <Copy size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Identity specific details */}
                          {selectedItem.type === 'identity' && (
                            <>
                              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                                <div>
                                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                                  <div className="text-gray-800 font-medium mt-1">{selectedItem.firstName || 'None'}</div>
                                </div>
                                <div>
                                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                                  <div className="text-gray-800 font-medium mt-1">{selectedItem.lastName || 'None'}</div>
                                </div>
                              </div>

                              <div className="group border-b border-gray-100 pb-4">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Address</label>
                                <div className="text-gray-800 font-medium mt-1">{selectedItem.address || 'None'}</div>
                              </div>

                              <div className="group border-b border-gray-100 pb-4">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                                <div className="text-gray-800 font-medium mt-1">{selectedItem.phone || 'None'}</div>
                              </div>

                              <div className="group border-b border-gray-100 pb-4">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">License Number</label>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-gray-800 font-medium">
                                    {showPassword && revealField === 'licenseNumber' ? getDecryptedValue(selectedItem.licenseNumber || '') : '••••••••••••'}
                                  </span>
                                  <button onClick={() => handleReveal('licenseNumber')} className="p-1.5 hover:bg-gray-100 rounded text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {showPassword && revealField === 'licenseNumber' ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}

                           <div className="group border-b border-gray-100 pb-4">
                             <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Notes</label>
                                {selectedItem.notes && (
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(getDecryptedValue(selectedItem.notes));
                                      api.post('/api/logs', {
                                        action: 'COPY_NOTES',
                                        itemId: selectedItem.id,
                                        details: `User copied notes for ${selectedItem.name}`
                                      });
                                    }} 
                                    className="p-1 hover:bg-gray-100 rounded text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Copy size={14} />
                                  </button>
                                )}
                             </div>
                             <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                               {selectedItem.notes ? getDecryptedValue(selectedItem.notes) : 'None'}
                             </p>
                           </div>
                       </div>
                       
                       <div className="flex gap-3 pt-8 border-t border-gray-100">
                         <button onClick={() => handleDeleteItem(selectedItem.id)} className="flex-1 bg-red-50 border border-red-100 py-2.5 rounded font-bold text-red-600 hover:bg-red-100 transition-colors">
                           Delete Item
                         </button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-red-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Delete Vault Item</h2>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{items.find(i => i.id === itemToDelete)?.name}"</span>? 
              This will permanently remove the credentials and all associated history.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => { setIsDeleting(false); setItemToDelete(null); }}
                className="flex-1 px-4 py-3 text-gray-600 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeletingLoading}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 font-sans disabled:opacity-50"
              >
                {isDeletingLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Password Verification Modal */}
      {isVerifyingMaster && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
              <div className="flex items-center gap-3 mb-6">
                 <Lock className="text-[#175ddc]" size={24} />
                 <h2 className="text-xl font-bold text-gray-800">Master Password Required</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                 To reveal this secure data, please re-enter your master password for security.
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
                      onKeyDown={e => e.key === 'Enter' && verifyMasterPassword()}
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
                      onClick={verifyMasterPassword}
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

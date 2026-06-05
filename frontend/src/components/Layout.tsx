import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Send, 
  Wrench, 
  BarChart2, 
  Settings, 
  LayoutDashboard, 
  LogOut,
  Lock
} from 'lucide-react';
import LDPLogo from './LDPLogo';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, lock, user } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.portals?.includes('admin');
  const hasVault = user?.portals?.includes('vault');

  const navItems = [
    { to: '/dashboard', icon: Shield, label: 'Vaults', active: location.pathname === '/dashboard' || location.pathname === '/' },
    { to: '/send', icon: Send, label: 'Send', active: location.pathname === '/send' },
    { to: '/tools', icon: Wrench, label: 'Tools', active: location.pathname === '/tools' },
    { to: '/reports', icon: BarChart2, label: 'Reports', active: location.pathname === '/reports' },
    { to: '/settings', icon: Settings, label: 'Settings', active: location.pathname === '/settings' },
  ].filter(item => hasVault || item.to === '/settings'); // Always allow settings if somehow in layout

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d43af] flex flex-col shrink-0 relative overflow-hidden">
        {/* Sidebar background decorative blobs */}
        <div className="absolute top-[-10%] left-[-20%] w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="py-10 flex flex-col items-center justify-center border-b border-white/10 mb-6 z-10">
          <LDPLogo className="h-28 w-auto drop-shadow-xl" variant="white" />
          <p className="text-[9px] text-white/40 font-black tracking-[0.3em] uppercase mt-4">Enterprise Edition</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 z-10">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                item.active 
                ? 'bg-white/15 text-white shadow-lg shadow-black/5 backdrop-blur-md' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} className={`${item.active ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'} transition-opacity`} />
              <span className={`text-sm ${item.active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation Sections */}
        <div className="mt-auto p-4 space-y-3 z-10">
          {hasVault && (
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white/90 border border-white/5 hover:bg-white/15 transition-all group"
            >
              <Lock size={16} className="opacity-70 group-hover:opacity-100" />
              <span className="text-xs font-bold uppercase tracking-wider">Secure Vault</span>
            </Link>
          )}
          
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname.startsWith('/admin') 
                ? 'bg-white shadow-xl text-[#0d43af]' 
                : 'bg-black/10 text-white/70 hover:bg-black/20'
              }`}
            >
              <LayoutDashboard size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Admin Console</span>
            </Link>
          )}

          {/* Premium User Widget with Dropdown */}
          <div className="pt-6 pb-2 px-1 relative">
             {showProfileMenu && (
               <div className="absolute bottom-full left-4 mb-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-bottom-2 duration-200">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tighter">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => { lock(); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Lock size={14} className="text-slate-400" />
                      Lock Vault
                    </button>
                    <button 
                      onClick={() => { logout(); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={14} className="text-red-400" />
                      Log Out
                    </button>
                  </div>
               </div>
             )}

             <div 
               onClick={() => setShowProfileMenu(!showProfileMenu)}
               className={`bg-black/15 backdrop-blur-md p-3 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer transition-all ${showProfileMenu ? 'ring-2 ring-white/20 bg-black/25' : 'hover:bg-black/20'}`}
             >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg flex items-center justify-center text-white font-black text-sm shrink-0 border border-white/20">
                    {user?.name?.[0].toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-black text-white truncate uppercase tracking-tighter">{user?.name}</p>
                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Premium User</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center text-white/40 group-hover:text-white transition-colors">
                  <Settings size={14} className={showProfileMenu ? 'rotate-90 transition-transform' : ''} />
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;

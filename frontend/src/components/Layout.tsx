import React from 'react';
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

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#175ddc] text-white flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-2 mb-4">
          <LDPLogo className="w-8 h-8 brightness-0 invert" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Bitlocker LDP</h1>
            <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Password Manager</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              location.pathname === '/dashboard' || location.pathname === '/' ? 'bg-[#0047AB]' : 'hover:bg-[#134db8]'
            }`}
          >
            <Shield size={18} />
            <span className="text-sm font-medium">Vaults</span>
          </Link>
          <Link
            to="/send"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              location.pathname === '/send' ? 'bg-[#0047AB]' : 'hover:bg-[#134db8]'
            }`}
          >
            <Send size={18} />
            <span className="text-sm font-medium">Send</span>
          </Link>
          <Link
            to="/tools"
            className={`flex items-center justify-between px-3 py-2 rounded transition-colors ${
              location.pathname === '/tools' ? 'bg-[#0047AB]' : 'hover:bg-[#134db8]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wrench size={18} />
              <span className="text-sm font-medium">Tools</span>
            </div>
          </Link>
          <Link
            to="/reports"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              location.pathname === '/reports' ? 'bg-[#0047AB]' : 'hover:bg-[#134db8]'
            }`}
          >
            <BarChart2 size={18} />
            <span className="text-sm font-medium">Reports</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#134db8] transition-colors"
          >
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </nav>

        {/* Bottom Navigation Sections */}
        <div className="mt-auto p-2 space-y-2 border-t border-[#134db8]">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded bg-[#0047AB] transition-colors"
          >
            <Lock size={16} />
            <span className="text-sm font-medium">Password Manager</span>
          </Link>
          
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                location.pathname.startsWith('/admin') ? 'bg-[#0047AB]' : 'hover:bg-[#134db8]'
              }`}
            >
              <LayoutDashboard size={16} />
              <span className="text-sm font-medium">Admin Console</span>
            </Link>
          )}

          <div className="pt-4 pb-2 px-3">
             <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {user?.name?.[0].toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.preventDefault(); lock(); }} title="Lock Vault">
                    <Lock size={12} className="opacity-60 hover:opacity-100" />
                  </button>
                  <button onClick={(e) => { e.preventDefault(); logout(); }} title="Log Out">
                    <LogOut size={12} className="opacity-60 hover:opacity-100" />
                  </button>
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

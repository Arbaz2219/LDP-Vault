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
  Lock,
  Terminal
} from 'lucide-react';
import LDPLogo from './LDPLogo';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

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
          
          {user?.portals?.includes('terminal') && (
             <Link
               to="/dashboard"
               onClick={() => alert('Terminal Portal is being initialized... Please ensure LDP Terminal service is running.')}
               className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all group"
             >
               <Terminal size={16} className="opacity-70 group-hover:opacity-100" />
               <span className="text-xs font-bold uppercase tracking-wider">Terminal Portal</span>
             </Link>
          )}

          {isAdmin && (
            <div className="space-y-3">
              <Link
                to="/security"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === '/security' 
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg text-white' 
                  : 'bg-white/5 text-cyan-400 hover:bg-white/10 border border-cyan-400/20'
                }`}
              >
                <Shield size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Security Dashboard</span>
              </Link>

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
            </div>
          )}

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

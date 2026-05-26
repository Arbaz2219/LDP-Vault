import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import LDPLogo from '../components/LDPLogo';
import { API_URL } from '../api';

const VaultLock: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user, unlock, logout } = useAuth();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await unlock(password);
    if (!success) {
      setError('Incorrect master password');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans relative overflow-hidden select-none">
      
      {/* Left Sidebar - Premium Mesh Section */}
      <div className="hidden lg:flex w-1/3 mesh-gradient flex-col items-center justify-start pt-32 p-12 relative">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
        
        <div className="z-10 animate-fade-in flex flex-col items-center drop-shadow-2xl">
          <LDPLogo className="h-80 w-auto" variant="white" />
        </div>
        
        <div className="mt-16 text-center z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-white/60 text-xs font-bold tracking-[0.4em] uppercase">Enterprise Vault System</h2>
          <div className="h-px w-12 bg-white/20 mx-auto mt-4"></div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col justify-between h-screen overflow-y-auto bg-white lg:bg-[#f8f9fc] py-8">
        
        {/* Mobile Header */}
        <header className="px-6 py-2 z-10 lg:hidden text-[#175ddc]">
          <LDPLogo className="h-10 w-auto" />
        </header>

        {/* Center Main Content Container */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
          
          <div className="mb-10 flex flex-col items-center lg:hidden">
            <LDPLogo className="h-28 w-auto" hideText={true} />
          </div>

          <div className="w-full max-w-[440px] animate-fade-in">
            {/* Heading Section */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-[#1d2736] tracking-tight mb-3">
                Vault Locked
              </h1>
              <p className="text-sm text-[#677489] font-medium">
                {user?.email}
              </p>
            </div>

            {/* Unlock Form Card */}
            <div className="glass-card p-10 rounded-2xl border border-white relative">
              {/* Subtle top light effect */}
              <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#175ddc]/20 to-transparent"></div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-xs text-center border border-red-100 font-bold animate-shake flex items-center justify-center gap-2">
                   <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                   {error}
                </div>
              )}

              <form onSubmit={handleUnlock} className="space-y-8">
                {/* Master Password Field */}
                <div className="space-y-2 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-[#1d2736] uppercase tracking-wider opacity-60">Master Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-5 pr-14 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#175ddc] focus:ring-4 focus:ring-[#175ddc]/5 text-[#1d2736] text-sm font-semibold transition-all"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#175ddc] transition-colors p-2"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Unlock Button */}
                <button 
                  type="submit" 
                  className="w-full py-4 bg-[#175ddc] hover:bg-[#134db8] text-white font-bold rounded-xl transition-all text-sm tracking-widest uppercase shadow-xl shadow-blue-500/20 active:scale-[0.97] transform"
                >
                  Unlock Vault
                </button>

                <div className="pt-2">
                  <div className="w-full border-t border-gray-100 relative mb-8">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">OR</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => window.location.href = `${API_URL}/api/auth/microsoft`}
                    className="w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all text-sm shadow-sm active:scale-[0.98] mb-4"
                  >
                    <svg width="21" height="21" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7fbb00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00a1f1"/>
                      <rect x="11" y="11" width="9" height="9" fill="#ffbb00"/>
                    </svg>
                    Sign in with Microsoft
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full py-4 border border-gray-200 bg-white hover:bg-gray-50 text-[#1d2736] font-bold rounded-xl transition-all text-xs tracking-widest uppercase"
                  >
                    Use Different Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-[10px] text-[#6b778c] z-10">
          <p>© 2026 LDP Logistics Inc.</p>
        </footer>
      </div>
    </div>
  );
};

export default VaultLock;

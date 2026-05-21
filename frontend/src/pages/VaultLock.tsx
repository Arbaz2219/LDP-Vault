import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import LDPLogo from '../components/LDPLogo';

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
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col justify-between font-sans relative overflow-y-auto select-none">
      
      {/* Top Left Brand Header */}
      <header className="p-4 z-10">
        <div className="flex items-center gap-2 text-[#175ddc] hover:opacity-90 transition-opacity cursor-pointer">
          <LDPLogo className="h-14 w-auto" />
        </div>
      </header>

      {/* Center Main Content Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 z-10">
        
        {/* Center Brand Logo */}
        <div className="mb-8 flex flex-col items-center scale-110">
          <LDPLogo className="h-32 w-auto" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-[#172b4d] tracking-tight mb-1 text-center">
          Your vault is locked
        </h1>

        {/* Dynamic Subheading */}
        <p className="text-xs text-[#5e6c84] mb-6 font-medium text-center">
          {user?.email}
        </p>

        {/* Unlock Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e2e8f0] w-full max-w-[400px] transition-all">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-xs text-center border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-6">
            {/* Master Password Field */}
            <div className="relative group">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-bold text-[#6b778c] group-focus-within:text-[#175ddc] z-10 transition-colors">
                Master password <span className="text-[#a5adba] font-normal">(required)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-3.5 pr-12 py-3 border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#175ddc] focus:ring-1 focus:ring-[#175ddc] text-gray-900 text-sm transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b778c] hover:text-[#175ddc] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Unlock Button */}
            <button 
              type="submit" 
              className="w-full py-3 bg-[#175ddc] hover:bg-[#134db8] text-white font-semibold rounded-lg transition-colors text-sm tracking-wide shadow-sm hover:shadow active:scale-[0.99] transform"
            >
              Unlock
            </button>
          </form>

          {/* Action toggle / logout option */}
          <div className="mt-6 flex flex-col items-center">
            <span className="text-xs text-[#8993a4] mb-4">or</span>
            <button 
              onClick={logout}
              className="w-full py-3 border border-[#dfe1e6] bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d] font-semibold rounded-lg transition-colors text-sm tracking-wide"
            >
              Log out
            </button>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-4 text-center text-[10px] text-[#6b778c] leading-relaxed z-10">
        <p className="hover:underline cursor-pointer font-medium hover:text-[#175ddc] transition-colors">
          Accessing vault.ldplogistics.com
        </p>
        <p className="mt-0.5">© 2026 LDP Logistics Inc.</p>
      </footer>

      {/* Bottom Left Vector Shapes Decoration */}
      <div className="absolute bottom-0 left-0 w-80 h-80 text-gray-300/40 pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="60" width="100" height="70" rx="6" stroke="currentColor" strokeWidth="2.5"/>
          <line x1="15" y1="130" x2="125" y2="130" stroke="currentColor" strokeWidth="3"/>
          <circle cx="70" cy="90" r="14" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M45 118C45 110 55 106 70 106C85 106 95 110 95 118" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="140" cy="150" r="20" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 4"/>
        </svg>
      </div>

      {/* Bottom Right Vector Shapes Decoration */}
      <div className="absolute bottom-0 right-0 w-80 h-80 text-gray-300/40 pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="140" cy="140" r="32" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M128 132L120 140L128 148" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M152 132L160 140L152 148" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M142 128L138 152" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="60" cy="150" r="14" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M74 150H95" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M88 150V157" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M93 150V157" stroke="currentColor" strokeWidth="2.5"/>
        </svg>
      </div>
    </div>
  );
};

export default VaultLock;

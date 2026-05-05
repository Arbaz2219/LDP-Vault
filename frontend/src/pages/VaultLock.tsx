import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Eye, EyeOff } from 'lucide-react';
import BitwardenLockIcon from '../components/LockIcon';
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
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans">
      {/* Top Left Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-[#175ddc]">
          <LDPLogo className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight">ldplogistics</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-4">
        {/* Center Lock Icon */}
        <div className="mb-2 flex flex-col items-center">
          <BitwardenLockIcon />
          <h1 className="text-2xl font-bold text-[#172b4d] mt-2">Your vault is locked</h1>
          <p className="text-sm text-[#677489] mt-2">{user?.email}</p>
        </div>

        {/* Input Card */}
        <div className="bg-white p-10 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#e2e8f0] w-full max-w-[448px] mt-4">
          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="relative group">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-semibold text-[#677489] group-focus-within:text-[#175ddc] z-10 transition-colors">
                Master password <span className="text-gray-400 font-normal">(required)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2.5 border border-[#ced4da] rounded focus:outline-none focus:border-[#175ddc] focus:ring-1 focus:ring-[#175ddc] text-gray-900 text-sm transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#677489] hover:text-[#172b4d]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="text-red-500 text-xs text-center">{error}</div>}

            <button type="submit" className="w-full py-2.5 bg-[#175ddc] hover:bg-[#134db8] text-white font-bold rounded transition-colors text-sm tracking-wide uppercase">
              UNLOCK
            </button>
          </form>
          
          <div className="mt-6 flex flex-col items-center">
            <span className="text-[11px] font-bold text-[#677489] mb-4 uppercase">or</span>
            <button 
              onClick={logout}
              className="w-full py-2.5 bg-[#f0f3f8] hover:bg-[#e4e9f2] text-[#172b4d] font-bold rounded transition-colors text-sm tracking-wide border border-transparent"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mt-12 text-center text-[11px] text-[#677489] leading-relaxed">
          <p className="hover:underline cursor-pointer">Accessing ldplogistics.com</p>
          <p>© 2026 LDP Logistics Inc.</p>
          <p>2026.4.1</p>
        </div>
      </div>
    </div>
  );
};

export default VaultLock;

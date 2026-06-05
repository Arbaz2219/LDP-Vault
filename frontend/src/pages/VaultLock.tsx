import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import LDPLogo from '../components/LDPLogo';
import api, { API_URL } from '../api';

const VaultLock: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, unlock, setIsMasterPasswordSet } = useAuth();

  const isSetupMode = user && user.isMasterPasswordSet === false;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const success = await unlock(password);
      if (!success) {
        setError('Incorrect master password');
      }
    } catch (err) {
      setError('Unlock failed. Please check your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Master password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/auth/set-master', { 
        userId: user?.id, 
        password 
      });
      // Update local state
      setIsMasterPasswordSet(true);
      // Now unlock immediately
      await unlock(password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set master password');
    } finally {
      setIsSubmitting(false);
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
      <div className="flex-1 flex flex-col justify-between h-screen overflow-y-auto bg-white lg:bg-[#f8f9fc]">
        
        <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#0d43af]/5 to-transparent hidden lg:block"></div>
        
        <header className="px-6 py-2 z-10 lg:hidden text-[#175ddc]">
          <LDPLogo className="h-10 w-auto" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
          
          <div className="mb-10 flex flex-col items-center lg:hidden">
            <LDPLogo className="h-28 w-auto" hideText={true} />
          </div>

          <div className="w-full max-w-[440px] animate-fade-in">
            {/* Heading Section */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-[#1d2736] tracking-tight mb-3">
                {isSetupMode ? 'Security Setup' : 'Vault Locked'}
              </h1>
              <p className="text-sm text-[#677489] font-medium max-w-xs mx-auto">
                {isSetupMode 
                  ? 'Set your Master Password to begin encrypting your data.' 
                  : `Authenticated as ${user?.email}`}
              </p>
            </div>

            {/* Main Action Card */}
            <div className="glass-card p-10 rounded-3xl border border-white relative shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent ${isSetupMode ? 'via-emerald-500/30' : 'via-[#175ddc]/30'} to-transparent`}></div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-xs text-center border border-red-100 font-bold animate-shake flex items-center justify-center gap-2">
                   <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                   {error}
                </div>
              )}

              <form onSubmit={isSetupMode ? handleSetMaster : handleUnlock} className="space-y-6">
                
                {/* Master Password Field */}
                <div className="space-y-2 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-[#1d2736] uppercase tracking-wider opacity-60">
                      {isSetupMode ? 'Create Master Password' : 'Master Password'}
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-5 pr-14 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#175ddc] focus:ring-4 focus:ring-[#175ddc]/5 text-[#1d2736] text-sm font-semibold transition-all placeholder:text-gray-300"
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

                {isSetupMode && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="text-[11px] font-black text-[#1d2736] uppercase tracking-wider opacity-60 px-1">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 text-[#1d2736] text-sm font-semibold transition-all placeholder:text-gray-300"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Primary Action Button */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-4 ${isSetupMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#175ddc] hover:bg-[#134db8]'} text-white font-bold rounded-2xl transition-all text-sm tracking-widest uppercase shadow-xl ${isSetupMode ? 'shadow-emerald-500/20' : 'shadow-blue-500/20'} active:scale-[0.97] transform flex items-center justify-center gap-2 disabled:opacity-70`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isSetupMode ? <ShieldCheck size={18} /> : null}
                      {isSetupMode ? 'Initialize Vault' : 'Unlock Vault'}
                    </>
                  )}
                </button>

                {!isSetupMode && (
                  <div className="pt-2">
                    <div className="w-full border-t border-gray-100 relative mb-8">
                      <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">OR</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => window.location.href = `${API_URL}/api/auth/microsoft`}
                      className="w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl transition-all text-sm shadow-sm active:scale-[0.98] mb-4"
                    >
                      <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                        <rect x="11" y="1" width="9" height="9" fill="#7fbb00"/>
                        <rect x="1" y="11" width="9" height="9" fill="#00a1f1"/>
                        <rect x="11" y="11" width="9" height="9" fill="#ffbb00"/>
                      </svg>
                      Switch Microsoft Account
                    </button>
                  </div>
                )}
              </form>
            </div>
            
            {isSetupMode && (
               <p className="mt-8 text-[11px] text-gray-400 text-center leading-relaxed max-w-sm mx-auto font-medium">
                 Your Master Password is the key to your vault. <span className="text-gray-600 font-bold underline">LDP Logistics cannot recover this password</span> if you lose it. Store it safely.
               </p>
            )}
          </div>
        </main>

        <footer className="py-4 text-center text-[10px] text-[#6b778c] z-10 font-bold tracking-widest uppercase opacity-50">
          <p>© 2026 LDP Logistics Inc.</p>
        </footer>
      </div>
    </div>
  );
};

export default VaultLock;

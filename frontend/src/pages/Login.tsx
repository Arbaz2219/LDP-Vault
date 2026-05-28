import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { API_URL } from '../api';
import { Eye, EyeOff } from 'lucide-react';
import LDPLogo from '../components/LDPLogo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const { login, logout, user } = useAuth();

  // Handle SSO Redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        login(token, userData);
        // Clean up URL and force navigation to dashboard
        window.history.replaceState({}, document.title, '/dashboard');
        window.location.reload(); // Force refresh to Dashboard state
      } catch (e) {
        console.error('Failed to parse SSO data:', e);
      }
    }
  }, [login]);

  // If a user is already in state but we show login, we can offer the "Unlock" screen
  useEffect(() => {
    const savedEmail = localStorage.getItem('last_user_email') || (user?.email);
    if (savedEmail) {
      setEmail(savedEmail);
      setIsLocked(true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', { email, password });
      // Save last email to localStorage for the locked vault state
      localStorage.setItem('last_user_email', email);
      login(response.data.token, response.data.user, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('last_user_email');
    setEmail('');
    setPassword('');
    setError('');
    setIsLocked(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans relative overflow-hidden select-none">
      
      {/* Left Sidebar - Premium Mesh Section */}
      <div className="hidden lg:flex w-1/3 mesh-gradient flex-col items-center justify-start pt-32 p-12 relative">
        {/* Animated accent lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
        
        {/* White Logo in the Sidebar */}
        <div className="z-10 animate-fade-in flex flex-col items-center drop-shadow-2xl">
          <LDPLogo className="h-80 w-auto" variant="white" />
        </div>
        
        {/* Branding Subtitle */}
        <div className="mt-16 text-center z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-white/60 text-xs font-bold tracking-[0.4em] uppercase">Enterprise Vault System</h2>
          <div className="h-px w-12 bg-white/20 mx-auto mt-4"></div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col justify-between h-screen overflow-y-auto bg-white lg:bg-[#f8f9fc] py-8">
        
        {/* Mobile Header */}
        <header className="px-6 py-2 z-10 lg:hidden">
          <div className="flex items-center gap-2 text-[#0d43af]">
            <LDPLogo className="h-10 w-auto" />
          </div>
        </header>

        {/* Center Main Content Container */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
          
          {/* Mobile Center Brand Logo */}
          <div className="mb-10 flex flex-col items-center lg:hidden">
            <LDPLogo className="h-28 w-auto" hideText={true} />
          </div>

          <div className="w-full max-w-[440px] animate-fade-in">
            {/* Heading Section */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-[#1d2736] tracking-tight mb-3">
                {isLocked ? 'Vault Locked' : 'Sign in to LDP Vault'}
              </h1>
              <p className="text-sm text-[#677489] font-medium">
                {isLocked ? email : 'Secure your digital identity with military-grade encryption.'}
              </p>
            </div>

            {/* Login Form Card */}
            <div className="glass-card p-10 rounded-2xl border border-white relative">
              {/* Subtle top light effect */}
              <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#0d43af]/20 to-transparent"></div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-xs text-center border border-red-100 font-bold animate-shake flex items-center justify-center gap-2">
                   <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                   {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Email Address Field */}
                {!isLocked && (
                  <div className="space-y-2 group">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-black text-[#1d2736] uppercase tracking-wider opacity-60">Email Address</label>
                    </div>
                    <input
                      type="email"
                      className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0d43af] focus:ring-4 focus:ring-[#0d43af]/5 text-[#1d2736] text-sm font-medium transition-all"
                      placeholder="e.g. name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Master Password Field */}
                <div className="space-y-2 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-[#1d2736] uppercase tracking-wider opacity-60">Master Password</label>
                    <button type="button" className="text-[10px] font-bold text-[#0d43af] hover:underline uppercase tracking-tight">Forgot?</button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-5 pr-14 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0d43af] focus:ring-4 focus:ring-[#0d43af]/5 text-[#1d2736] text-sm font-semibold transition-all"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0d43af] transition-colors p-2"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full py-4 bg-[#0d43af] hover:bg-[#0a358a] text-white font-bold rounded-xl transition-all text-sm tracking-widest uppercase shadow-xl shadow-blue-500/20 active:scale-[0.97] transform"
                >
                  {isLocked ? 'Unlock Vault' : 'Access Vault'}
                </button>

                {/* SSO Section */}
                {!isLocked && (
                  <div className="pt-2">
                    <div className="w-full border-t border-gray-100 relative mb-8">
                      <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">OR</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => window.location.href = `${API_URL}/api/auth/microsoft`}
                      className="w-full py-3.5 px-4 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all text-sm shadow-sm active:scale-[0.98]"
                    >
                      <svg width="21" height="21" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                        <rect x="11" y="1" width="9" height="9" fill="#7fbb00"/>
                        <rect x="1" y="11" width="9" height="9" fill="#00a1f1"/>
                        <rect x="11" y="11" width="9" height="9" fill="#ffbb00"/>
                      </svg>
                      Sign in with Microsoft
                    </button>
                    <p className="mt-4 text-[10px] text-center text-gray-400 font-medium leading-relaxed">
                      Enterprise users can sign in using their corporate Azure AD / Microsoft 365 account.
                    </p>
                  </div>
                )}
              </form>


              {/* Action toggle / logout option */}
              {isLocked && (
                <div className="mt-10 flex flex-col items-center">
                  <div className="w-full border-t border-gray-100 relative mb-8">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Switch</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-4 border border-gray-200 bg-white hover:bg-gray-50 text-[#1d2736] font-bold rounded-xl transition-all text-xs tracking-widest uppercase"
                  >
                    Use Different Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>



      {/* Footer Branding */}
      <footer className="py-4 text-center text-[10px] text-[#6b778c] leading-relaxed z-10">
        <p className="hover:underline cursor-pointer font-medium hover:text-[#11347a] transition-colors">
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
    </div>
  );
};

export default Login;

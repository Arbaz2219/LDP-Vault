import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { API_URL } from '../api';
import LDPLogo from '../components/LDPLogo';

const Login: React.FC = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  // Standard Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (user && !loading) {
      console.log('[DEBUG] User is already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleMicrosoftLogin = () => {
    window.location.href = `${API_URL}/api/auth/microsoft`;
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      login(response.data.token, response.data.user);
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans relative overflow-hidden select-none">
      
      {/* Left Sidebar - Premium Mesh Section */}
      <div className="hidden lg:flex w-1/3 mesh-gradient flex-col items-center justify-start pt-32 p-12 relative">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
        
        <div className="z-10 animate-fade-in flex flex-col items-center drop-shadow-2xl scale-95 opacity-90">
          <LDPLogo className="h-64 w-auto" variant="white" />
        </div>
        
        <div className="mt-16 text-center z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-white/60 text-xs font-bold tracking-[0.4em] uppercase">Enterprise Vault System</h2>
          <div className="h-px w-12 bg-white/20 mx-auto mt-4"></div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col justify-between h-screen overflow-y-auto bg-white lg:bg-[#f8f9fc] py-8">
        
        <header className="px-6 py-2 z-10 lg:hidden text-center">
            <LDPLogo className="h-20 w-auto" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
          <div className="w-full max-w-[440px] animate-fade-in">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-[#1d2736] tracking-tight mb-3">
                Vault Access
              </h1>
              <p className="text-[#677489] font-medium">
                Select your preferred method to access your secure workspace.
              </p>
            </div>

            {/* Standard Login Form - Now on Top */}
            <form onSubmit={handleStandardLogin} className="space-y-5 mb-8">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-[#677489] ml-1 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@ldplogistics.com"
                  className="w-full px-5 py-4 bg-white border border-[#e6ebf1] rounded-2xl focus:border-[#0d43af] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-[#677489]/30 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-[#677489] ml-1 uppercase tracking-wider">Master Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-5 py-4 bg-white border border-[#e6ebf1] rounded-2xl focus:border-[#0d43af] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-[#677489]/30 text-sm font-medium"
                />
              </div>

              {loginError && (
                <p className="text-red-500 text-xs font-bold text-center animate-pulse">{loginError}</p>
              )}

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#0d43af] hover:bg-[#0a358a] text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/10 active:scale-95 disabled:opacity-50"
              >
                {isLoggingIn ? 'Authenticating...' : 'Unlock Vault'}
              </button>
            </form>

            {/* Aesthetic Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-[#e6ebf1] flex-1"></div>
              <span className="text-[#677489] text-[10px] font-bold uppercase tracking-widest opacity-60">or continue with</span>
              <div className="h-px bg-[#e6ebf1] flex-1"></div>
            </div>

            {/* Microsoft SSO - Official Branding Style */}
            <button 
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-50 text-[#1d2736] font-bold py-5 px-8 rounded-2xl border-2 border-[#e6ebf1] transition-all hover:border-[#cbd5e1] hover:shadow-lg active:scale-95 group mb-4"
            >
               <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" className="w-6 h-6 transition-all" alt="Microsoft" />
               <span className="text-sm uppercase tracking-widest">Sign in with Microsoft</span>
            </button>
            
            <p className="mt-12 text-center text-[10px] font-bold text-[#677489] uppercase tracking-[0.3em] opacity-40">
              Secured by Azure Active Directory & AES-256
            </p>
          </div>
        </main>

        <footer className="px-6 py-8 border-t border-[#e6ebf1] lg:border-none">
           <div className="max-w-[440px] mx-auto flex flex-col items-center gap-4">
              <p className="text-[10px] text-[#677489] font-bold uppercase tracking-widest text-center">
                &copy; 2026 LDP Logistics &bull; Advanced Security Gateway
              </p>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;

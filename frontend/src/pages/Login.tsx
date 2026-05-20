import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Eye, EyeOff } from 'lucide-react';
import LDPLogo from '../components/LDPLogo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const { login, logout, user } = useAuth();

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
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col justify-between font-sans relative overflow-hidden select-none">
      
      {/* Top Left Brand Header */}
      <header className="p-6 z-10">
        <div className="flex items-center gap-2 text-[#175ddc] hover:opacity-90 transition-opacity cursor-pointer">
          <LDPLogo className="h-8 w-auto" />
          <span className="text-2xl font-bold tracking-tight text-[#175ddc]">LDP Vault</span>
        </div>
      </header>

      {/* Center Main Content Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 z-10">
        
        {/* Animated Locked Padlock SVG Illustration */}
        <div className="mb-6 flex flex-col items-center">
          <svg className="w-24 h-24 drop-shadow-[0_4px_6px_rgba(0,0,0,0.05)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Padlock shackle */}
            <path 
              d="M32 42V28C32 17.5 40.5 9.5 50 9.5C59.5 9.5 68 17.5 68 28V42" 
              stroke="#175ddc" 
              strokeWidth="4.5" 
              strokeLinecap="round"
            />
            {/* Padlock body */}
            <rect 
              x="20" 
              y="40" 
              width="60" 
              height="46" 
              rx="12" 
              fill="#ffffff" 
              stroke="#1d2736" 
              strokeWidth="4"
            />
            {/* Padlock inner plate */}
            <rect 
              x="28" 
              y="48" 
              width="44" 
              height="20" 
              rx="6" 
              fill="#fecb2f" 
              stroke="#1d2736" 
              strokeWidth="3.5"
            />
            {/* Keyhole or Password Dots representation */}
            <text 
              x="50" 
              y="62" 
              fontFamily="monospace" 
              fontSize="16" 
              fontWeight="900" 
              fill="#1d2736" 
              textAnchor="middle" 
              letterSpacing="2"
            >
              ***--
            </text>
            {/* Base shackle support */}
            <rect x="29" y="38" width="6" height="5" rx="1" fill="#1d2736" />
            <rect x="65" y="38" width="6" height="5" rx="1" fill="#1d2736" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-[28px] font-semibold text-[#172b4d] tracking-tight mb-1 text-center">
          {isLocked ? 'Your vault is locked' : 'Log in to your vault'}
        </h1>

        {/* Dynamic Subheading */}
        <p className="text-sm text-[#5e6c84] mb-8 font-medium text-center">
          {isLocked ? email : 'Access your secure credentials'}
        </p>

        {/* Login/Unlock Form Card */}
        <div className="bg-white p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e2e8f0] w-full max-w-[448px] transition-all">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-xs text-center border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Address Field (Only visible when NOT locked) */}
            {!isLocked && (
              <div className="relative group">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-bold text-[#6b778c] group-focus-within:text-[#175ddc] z-10 transition-colors">
                  Email address <span className="text-[#a5adba] font-normal">(required)</span>
                </label>
                <input
                  type="email"
                  className="w-full px-3.5 py-3 border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#175ddc] focus:ring-1 focus:ring-[#175ddc] text-gray-900 text-sm transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

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

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full py-3 bg-[#175ddc] hover:bg-[#134db8] text-white font-semibold rounded-lg transition-colors text-sm tracking-wide shadow-sm hover:shadow active:scale-[0.99] transform"
            >
              {isLocked ? 'Unlock' : 'Log In'}
            </button>
          </form>

          {/* Action toggle / logout option */}
          {isLocked && (
            <div className="mt-6 flex flex-col items-center">
              <span className="text-xs text-[#8993a4] mb-4">or</span>
              <button 
                onClick={handleLogout}
                className="w-full py-3 border border-[#dfe1e6] bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d] font-semibold rounded-lg transition-colors text-sm tracking-wide"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-8 text-center text-[11px] text-[#6b778c] leading-relaxed z-10">
        <p className="hover:underline cursor-pointer font-medium hover:text-[#175ddc] transition-colors">
          Accessing ldpvault.com
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

export default Login;

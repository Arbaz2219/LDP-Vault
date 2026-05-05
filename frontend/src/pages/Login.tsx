import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import LDPLogo from '../components/LDPLogo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(response.data.token, response.data.user, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
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
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#172b4d]">Log in</h1>
        </div>

        <div className="bg-white p-10 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-[#e2e8f0] w-full max-w-[448px]">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-xs text-center border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-semibold text-[#677489] group-focus-within:text-[#175ddc] z-10 transition-colors">
                Email address <span className="text-gray-400 font-normal">(required)</span>
              </label>
              <input
                type="email"
                className="w-full px-3 py-2.5 border border-[#ced4da] rounded focus:outline-none focus:border-[#175ddc] focus:ring-1 focus:ring-[#175ddc] text-gray-900 text-sm transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

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

            <button type="submit" className="w-full py-2.5 bg-[#175ddc] hover:bg-[#134db8] text-white font-bold rounded transition-colors text-sm tracking-wide uppercase">
              LOG IN
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-[11px] text-[#677489] leading-relaxed">
          <p className="hover:underline cursor-pointer">Accessing ldplogistics.com</p>
          <p>© 2026 LDP Logistics Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

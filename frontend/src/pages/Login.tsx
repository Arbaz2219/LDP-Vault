import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Eye, EyeOff, Lock, Mail, Server } from 'lucide-react';
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
      const response = await api.post('/api/auth/login', { email, password });
      login(response.data.token, response.data.user, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients & Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#175ddc]/30 to-purple-600/20 blur-[120px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-600/20 to-teal-500/25 blur-[120px] animate-pulse duration-[8000ms]" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Main glassmorphic container */}
      <div className="w-full max-w-[480px] p-6 z-10">
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-2xl p-8 md:p-10 w-full relative overflow-hidden">
          
          {/* Subtle top edge highlighting glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#175ddc]/60 to-transparent" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center mb-4 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
              <LDPLogo className="w-9 h-9" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight text-center">
              Bitlooker <span className="text-[#175ddc]">Vault</span>
            </h1>
            <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide uppercase">
              LDP Logistics Security Portal
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs py-3 px-4 rounded-lg mb-6 text-center shadow-inner">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#175ddc] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.1] rounded-xl focus:outline-none focus:border-[#175ddc] focus:ring-1 focus:ring-[#175ddc] text-white text-sm transition-all placeholder-gray-500 shadow-inner"
                  placeholder="name@ldplogistics.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Master Password
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#175ddc] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-11 pr-12 py-3 bg-white/[0.02] border border-white/[0.1] rounded-xl focus:outline-none focus:border-[#175ddc] focus:ring-1 focus:ring-[#175ddc] text-white text-sm transition-all placeholder-gray-500 shadow-inner"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-[#175ddc] to-[#124cb4] hover:from-[#1b6aff] hover:to-[#175ddc] text-white font-bold rounded-xl transition-all duration-300 text-sm tracking-wider uppercase shadow-[0_4px_12px_rgba(23,93,220,0.3)] hover:shadow-[0_6px_20px_rgba(23,93,220,0.5)] active:scale-[0.98]"
            >
              Sign In to Vault
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Server size={14} className="text-[#175ddc]" />
            <span>Secure Connection: bitlooker.ldplogistics.com</span>
          </div>
          <p className="text-[10px] text-gray-500">
            © 2026 LDP Logistics Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

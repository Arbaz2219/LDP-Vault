import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LDPLogo from '../components/LDPLogo';

const SSOCallback: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      console.log('[SSO] Callback detected. Processing token...');
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        // Pass userData exactly as it came from backend
        login(token, userData);
        
        console.log('[SSO] Login success. Determining next route...');
        
        console.log('[SSO] Login successful, navigating to dashboard.');
        
        // Wait a tiny bit to ensure context re-render has happened
        setTimeout(() => {
            navigate('/dashboard', { replace: true });
        }, 150);

      } catch (e) {
        console.error('[SSO] Parsing failed:', e);
        setError('Failed to process authentication data.');
      }
    } else {
      setError('No authentication token found in URL.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  }, [login, navigate]);

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-8 animate-fade-in text-center">
        <LDPLogo className="h-40 w-auto drop-shadow-2xl mb-4" variant="white" />
        
        {error ? (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 p-6 rounded-2xl max-w-sm">
            <p className="text-white font-bold mb-2">Authentication Error</p>
            <p className="text-white/70 text-xs">{error}</p>
            <p className="text-white/40 text-[10px] mt-4 uppercase tracking-widest font-bold">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-white/10 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-1">
              <p className="text-white text-lg font-black tracking-[0.5em] uppercase">LDP VAULT</p>
              <p className="text-white/40 text-[9px] font-bold tracking-[0.3em] uppercase">Completing SSO Handshake</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSOCallback;

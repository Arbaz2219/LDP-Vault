import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminConsole from './pages/AdminConsole';
import Send from './pages/Send';
import Tools from './pages/Tools';
import Reports from './pages/Reports';
import SSOCallback from './pages/SSOCallback';
import Layout from './components/Layout';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const hasToken = !!localStorage.getItem('token');
  
  if ((loading && hasToken) || (hasToken && !user)) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-8 animate-fade-in">
           <div className="relative">
             <div className="w-24 h-24 border-4 border-white/20 rounded-full"></div>
             <div className="absolute top-0 left-0 w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
           </div>
           <div className="text-center">
             <p className="text-white text-lg font-black tracking-[0.5em] uppercase mb-2">LDP Vault</p>
             <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">Initializing Secure Session</p>
           </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const hasVaultAccess = user.portals?.includes('vault');
  const hasAdminAccess = user.portals?.includes('admin') || user.role === 'ADMIN';

  // If user has NO portal access, show a restricted access state or logout

  // If user has NO portal access, show a restricted access state or logout
  if (!hasVaultAccess && !hasAdminAccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">Your account does not have any assigned portal access. Please contact your system administrator.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin" element={hasAdminAccess ? <AdminConsole /> : <Navigate to="/dashboard" replace />} />
      <Route path="*" element={
        hasVaultAccess ? (
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/send" element={<Send />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        ) : (
          <Navigate to="/admin" replace />
        )
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;

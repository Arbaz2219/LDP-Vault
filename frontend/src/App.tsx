import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import VaultLock from './pages/VaultLock';
import Dashboard from './pages/Dashboard';
import AdminConsole from './pages/AdminConsole';
import Send from './pages/Send';
import Tools from './pages/Tools';
import Reports from './pages/Reports';
import Layout from './components/Layout';

const AppContent: React.FC = () => {
  const { user, isLocked } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (isLocked) {
    return <VaultLock />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminConsole />} />
        <Route path="/send" element={<Send />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
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

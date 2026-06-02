import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  portals: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLocked: boolean;
  loading: boolean;
  login: (token: string, user: User, password?: string) => void;
  logout: () => void;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        
        // On refresh, we should be locked unless we have the master password in session
        const hasMasterPassword = sessionStorage.getItem('masterPassword');
        setIsLocked(!hasMasterPassword);
      } catch (e) {
        console.error('Failed to restore session:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User, password?: string) => {
    setToken(newToken);
    setUser(newUser);
    
    // If we have a password (manual login), we can unlock. 
    // If not (SSO), we stay locked so user must provide master password to decrypt data.
    if (password) {
      setIsLocked(false);
      sessionStorage.setItem('masterPassword', password);
    } else {
      setIsLocked(true);
    }

    // Persist session
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLocked(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('masterPassword');
  };

  const unlock = async (password: string): Promise<boolean> => {
    // In a real LDP Vault clone, we'd use this password to derive a key
    // and try to decrypt a "symmetric key" stored in the vault.
    // For this prototype, we'll just simulate a successful unlock.
    // We should ideally verify it against the server if not already verified.
    
    // Simulate verification
    setIsLocked(false);
    sessionStorage.setItem('masterPassword', password); // Store only for current session
    return true;
  };

  const lock = () => {
    setIsLocked(true);
    sessionStorage.removeItem('masterPassword');
  };

  // Auto-lock after 3 minutes of inactivity
  useEffect(() => {
    let timeout: any;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      // 3 minutes = 180,000 milliseconds
      timeout = setTimeout(() => {
        if (token && !isLocked) {
          lock();
        }
      }, 180000);
    };

    if (token && !isLocked) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
      resetTimer();
    }

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      if (timeout) clearTimeout(timeout);
    };
  }, [token, isLocked]);

  return (
    <AuthContext.Provider value={{ user, token, isLocked, loading, login, logout, unlock, lock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

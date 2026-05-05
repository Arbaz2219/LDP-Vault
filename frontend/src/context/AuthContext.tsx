import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLocked: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLocked(true);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (newToken: string, newUser: User, password?: string) => {
    setToken(newToken);
    setUser(newUser);
    setIsLocked(false);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (password) {
      sessionStorage.setItem('masterPassword', password);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLocked(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('masterPassword'); // Never store this long-term
  };

  const unlock = async (password: string): Promise<boolean> => {
    // In a real Bitwarden clone, we'd use this password to derive a key
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
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      // 3 minutes = 180,000 milliseconds
      timeout = setTimeout(() => {
        if (token && !isLocked) {
          console.log('Auto-locking due to inactivity');
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
    <AuthContext.Provider value={{ user, token, isLocked, login, logout, unlock, lock }}>
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

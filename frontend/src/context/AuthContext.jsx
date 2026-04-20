import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Mock admin user — swap with real API auth later
const MOCK_ADMIN = {
  id: 1,
  name: 'Admin ISTA',
  email: 'admin@ista.ma',
  role: 'admin',
  avatar: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Mock credentials
    if (email === 'admin@ista.ma' && password === 'admin123') {
      setUser(MOCK_ADMIN);
      return true;
    }
    return false;
  };
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

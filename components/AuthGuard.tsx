import React, { useState, useEffect } from 'react';
import Login from './Login';
import { getStoredUser, getStoredToken, logout, type UserInfo } from '../implicitAuthService';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: UserInfo) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl mb-4 shadow-lg shadow-primary/30 animate-pulse">
            <span className="material-symbols-outlined text-white text-3xl">dashboard_customize</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render children with auth context
  return (
    <AuthContext.Provider value={{ user, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth Context for accessing user info and logout function
export const AuthContext = React.createContext<{
  user: UserInfo | null;
  logout: () => void;
}>({
  user: null,
  logout: () => {},
});

export const useAuth = () => React.useContext(AuthContext);

export default AuthGuard;

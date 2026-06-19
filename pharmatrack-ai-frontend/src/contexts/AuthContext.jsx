import { createContext, useState, useEffect } from 'react';
import * as authService from '@/services/authService';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start with the cached user for instant render; isInitializing blocks protected routes
  // until the silent refresh confirms the session is still valid.
  const [user, setUser] = useState(authService.getCurrentUser);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    authService
      .refreshToken()
      .then(({ user: freshUser }) => {
        setUser(freshUser ?? authService.getCurrentUser());
      })
      .catch(() => {
        // No valid refresh-token cookie — treat as logged out.
        setUser(null);
        authService.logout().catch(() => {});
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const login = async (email, password) => {
    const { user: loggedInUser } = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = async (payload) => {
    const updatedUser = await authService.updateProfile(payload);
    setUser(updatedUser);
    return updatedUser;
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.flat().includes(user.role);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    logout,
    updateUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

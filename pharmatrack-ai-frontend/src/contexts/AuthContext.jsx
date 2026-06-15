import { createContext, useState } from 'react';
import * as authService from '@/services/authService';
import { decodeToken } from '@/utils/jwt';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

function getInitialUser() {
  const token = authService.getToken();
  const storedUser = authService.getCurrentUser();

  if (token && storedUser && decodeToken(token)) {
    return storedUser;
  }

  authService.logout();
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  const login = async (email, password) => {
    const { user: loggedInUser } = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = async (payload) => {
    const updatedUser = await authService.updateProfile(payload);
    setUser(updatedUser);
    return updatedUser;
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    const allowed = roles.flat();
    return allowed.includes(user.role);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing: false,
    login,
    logout,
    updateUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

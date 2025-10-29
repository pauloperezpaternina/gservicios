
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContextType, User, Role, Permission } from '../types';
import {
  findUserByCredentials,
  getUserById,
  getRoleById,
  setCurrentUserId,
  getCurrentUserId,
} from '../services/localStorageService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    const user = findUserByCredentials(username, password); // In a real app, hash password before comparing
    if (user) {
      const role = getRoleById(user.roleId);
      if (role) {
        setCurrentUser(user);
        setCurrentRole(role);
        setCurrentUserId(user.id);
        setLoading(false);
        return true;
      }
    }
    setCurrentUser(null);
    setCurrentRole(null);
    setCurrentUserId(null);
    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentRole(null);
    setCurrentUserId(null);
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    return currentRole?.permissions.includes(permission) || false;
  }, [currentRole]);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setLoading(true);
      const userId = getCurrentUserId();
      if (userId) {
        const user = getUserById(userId);
        if (user) {
          const role = getRoleById(user.roleId);
          if (role) {
            setCurrentUser(user);
            setCurrentRole(role);
          }
        }
      }
      setLoading(false);
    };
    loadUserFromStorage();
  }, []);

  const contextValue = {
    currentUser,
    currentRole,
    login,
    logout,
    hasPermission,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
    
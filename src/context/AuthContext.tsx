import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types/api';
import authService from '@/services/auth.service';
import { getAccessToken, clearTokens } from '@/services/api';

// ============================================
// CONTEXT TYPES
// ============================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    organizationType?: string;
    organizationName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

// ============================================
// CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            clearTokens();
          }
        } catch {
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await authService.login({ email, password });

    if ('user' in result) {
      setUser(result.user);
      return { success: true };
    }

    return { success: false, error: result.error };
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    organizationType?: string;
    organizationName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const result = await authService.register(data);

    if ('user' in result) {
      setUser(result.user);
      return { success: true };
    }

    return { success: false, error: result.error };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

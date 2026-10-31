import { createContext, useContext } from 'react';

export interface AuthUser { nombre: string; id?: number; correo?: string; }
interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  loading: boolean;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requiere AuthProvider');
  return context;
}
export const hasToken = () => !!localStorage.getItem('token');

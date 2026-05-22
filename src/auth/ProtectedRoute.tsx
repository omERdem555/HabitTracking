import { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { LoginPage } from '../pages/Login';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
};
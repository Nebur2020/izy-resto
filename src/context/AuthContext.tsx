import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth/auth.service';
import { staffService } from '../services/staff/staff.service';
import { StaffMember } from '../types/staff';
import toast from 'react-hot-toast';
import { anonymousAuthService } from '../services/auth/anonymousAuth.service';
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  user: User | null;
  staffData: StaffMember | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [staffData, setStaffData] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged(async user => {
      if (
        user &&
        user.isAnonymous &&
        window.location.pathname.startsWith('/dashboard')
      ) {
        navigate('/login', { replace: true });
        return setLoading(false);
      }

      setUser(user);
      setIsAuthenticated(!!user);

      if (user) {
        try {
          const staff = await staffService.getStaffByEmail(user.email!);
          setStaffData(staff);
        } catch (error) {
          console.error('Error fetching staff data:', error);
          setStaffData(null);
        }
      } else {
        setStaffData(null);
        await anonymousAuthService.signInAnonymously();
        // Redirect to home if logged out
        if (window.location.pathname.startsWith('/dashboard')) {
          navigate('/', { replace: true });
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);

      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
      sessionStorage.removeItem('redirectUrl');

      navigate(redirectUrl, { replace: true });
      toast.success(t('common:login-success'));
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || t('common:login-failed'));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();

      const hasAcceptedCookies = localStorage.getItem('cookiesAccepted')
        ? localStorage.getItem('cookiesAccepted') === 'true'
        : false;

      // Clear all session/local storage data
      sessionStorage.clear();
      localStorage.clear();

      if (hasAcceptedCookies) {
        localStorage.setItem('cookiesAccepted', `${hasAcceptedCookies}`);
      }

      // Reset states
      setUser(null);
      setStaffData(null);
      setIsAuthenticated(false);

      // Redirect to landing page
      navigate('/', { replace: true });
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Échec de la déconnexion');
    }
  };

  const value = {
    user,
    staffData,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

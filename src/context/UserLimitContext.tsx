import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services';

interface UserLimitContextType {
  accessAllowed: boolean | null;
  loading: boolean;
  error: string | null;
}

const UserLimitContext = createContext<UserLimitContextType>({
  accessAllowed: null,
  loading: true,
  error: null,
});

export const UserLimitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const result = await settingsService.checkUserLimit();
        setAccessAllowed(result.allowed);
      } catch (error) {
        console.error('Error checking user limit:', error);
        setError("Une erreur est survenue lors de la vérification de l'accès.");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return (
    <UserLimitContext.Provider value={{ accessAllowed, loading, error }}>
      {children}
    </UserLimitContext.Provider>
  );
};

export const useUserLimit = () => useContext(UserLimitContext);

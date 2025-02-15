import { useState } from 'react';
import { launchDeployment } from '../services/deployment/deployment.service';

export const useDeployment = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState('');

  const redeploy = async (version: string) => {
    try {
      setIsDeploying(true);
      await launchDeployment({
        siteId: import.meta.env.VITE_APP_SITE_ID,
        version,
      });
    } catch (error: any) {
      console.log(error);
      setError(error?.message || 'une erruer est survenue...');
      throw error;
    } finally {
      setIsDeploying(false);
    }
  };

  return { redeploy, isDeploying, error };
};

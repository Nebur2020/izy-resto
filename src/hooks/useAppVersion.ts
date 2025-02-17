import { useEffect, useState } from 'react';
import { getSettings, Version } from '../services/version/version.service';

export const useAppVersion = () => {
  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState('');
  const [version, setVersion] = useState<Version | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);

  const getVersion = async () => {
    try {
      setLoading(true);
      setErrorLoading('');
      const versionSettings = await getSettings('version');

      if (!Array.isArray(versionSettings) && !!versionSettings) {
        setVersion(versionSettings);
        setVersions([versionSettings]);
        return;
      }

      const lastestVersion = versionSettings.find(
        versionSettings => versionSettings.isLatest
      );

      if (lastestVersion) setVersion(lastestVersion);
      setVersions(versionSettings.filter((_, i) => i < 4));
    } catch (error: any) {
      console.log(error);
      setErrorLoading(error.message || 'Une erreur est survenue...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVersion();
  }, []);

  return {
    loading,
    errorLoading,
    version,
    refresh: getVersion,
    versions,
  };
};

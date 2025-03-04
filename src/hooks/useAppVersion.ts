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

      const lastestVersion = (versionSettings || []).find(
        versionSettings => versionSettings.isLatest
      );

      if (lastestVersion) setVersion(lastestVersion);
      setVersions([
        ...versionSettings.filter((_, i) => i < 3).filter(v => !v.isStable),
        ...versionSettings.filter(v => v.isStable),
      ]);
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

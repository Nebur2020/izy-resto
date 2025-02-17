import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Layout,
  Sun,
  Moon,
  MenuSquare,
  LayoutGrid,
  Rows,
  Columns,
  LayoutDashboard,
  LayoutList,
} from 'lucide-react';
import { useTheme } from '../../../../../context/ThemeContext';
import { RestaurantSettings } from '../../../../../types/settings';
import { ThemeOption } from './components/ThemeOption';
import { HeaderOption } from './components/HeaderOption';
import { TemplateOption } from './components/TemplateOption';
import { useAppVersion } from '../../../../../hooks/useAppVersion';
import { useDeployment } from '../../../../../hooks/useDeployment';
import packageJson from '../../../../../../package.json';
import { Version } from '../../../../../services/version/version.service';

const COOLDOWN_DURATION = 6 * 60; // 10 minutes in seconds
const DEPLOY_STORAGE_KEY = 'deploymentCooldown';

interface DeploymentCooldown {
  timestamp: number;
  version: string;
}

const getStoredCooldown = (): DeploymentCooldown | null => {
  try {
    const stored = localStorage.getItem(DEPLOY_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as DeploymentCooldown;
    const now = Date.now();
    const elapsed = Math.floor((now - data.timestamp) / 1000);

    // If cooldown has expired or it's for a different version, clear it
    if (elapsed >= COOLDOWN_DURATION || data.version !== packageJson.version) {
      localStorage.removeItem(DEPLOY_STORAGE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading deployment cooldown:', error);
    localStorage.removeItem(DEPLOY_STORAGE_KEY);
    return null;
  }
};

const setStoredCooldown = (version: string) => {
  try {
    const cooldownData: DeploymentCooldown = {
      timestamp: Date.now(),
      version: version,
    };
    localStorage.setItem(DEPLOY_STORAGE_KEY, JSON.stringify(cooldownData));
  } catch (error) {
    console.error('Error storing deployment cooldown:', error);
  }
};

export function AppearanceSettings() {
  const { register, watch, setValue } = useFormContext<RestaurantSettings>();
  const { theme, toggleTheme } = useTheme();

  const { version, loading, errorLoading, versions } = useAppVersion();
  const { redeploy, isDeploying, error } = useDeployment();

  const [cooldownTime, setCooldownTime] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  // Initialize cooldown state from localStorage
  useEffect(() => {
    const storedCooldown = getStoredCooldown();
    if (storedCooldown) {
      const elapsed = Math.floor(
        (Date.now() - storedCooldown.timestamp) / 1000
      );
      const remaining = COOLDOWN_DURATION - elapsed;
      if (remaining > 0) {
        setCooldownTime(remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (versions.length > 0) {
      const vers = versions.find(v => v.value === packageJson.version);
      setSelectedVersion(vers || null);
    }
  }, [versions]);

  // Update cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            localStorage.removeItem(DEPLOY_STORAGE_KEY);
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [cooldownTime]);

  // Synchronize cooldown across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DEPLOY_STORAGE_KEY) {
        if (e.newValue === null) {
          setCooldownTime(0);
        } else {
          const storedCooldown = JSON.parse(e.newValue) as DeploymentCooldown;
          const elapsed = Math.floor(
            (Date.now() - storedCooldown.timestamp) / 1000
          );
          const remaining = COOLDOWN_DURATION - elapsed;
          if (remaining > 0) {
            setCooldownTime(remaining);
          } else {
            setCooldownTime(0);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRedeploy = async () => {
    try {
      if (
        !selectedVersion?.value ||
        packageJson.version === selectedVersion?.value
      ) {
        return;
      }

      await redeploy(selectedVersion.value);
      // Only set cooldown if deployment was successful
      setStoredCooldown(packageJson.version);
      setCooldownTime(COOLDOWN_DURATION);
    } catch (e) {
      console.error('Deployment failed:', e);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setValue('defaultTheme', newTheme, { shouldDirty: true });
    localStorage.removeItem('theme-preference');

    if (theme !== newTheme) {
      toggleTheme();
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">Thème par défaut</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ThemeOption
            icon={Sun}
            title="Mode Clair"
            description="Interface lumineuse avec un contraste optimal"
            value="light"
            selected={watch('defaultTheme') === 'light'}
            onChange={handleThemeChange}
            register={register}
          />

          <ThemeOption
            icon={Moon}
            title="Mode Sombre"
            description="Interface sombre pour une meilleure visibilité nocturne"
            value="dark"
            selected={watch('defaultTheme') === 'dark'}
            onChange={handleThemeChange}
            register={register}
          />
        </div>
      </section>
      {/* Header Style */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <MenuSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">Style d'en-tête</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HeaderOption
            icon={LayoutDashboard}
            title="En-tête Moderne"
            description="Design moderne avec une mise en page élégante"
            value="modern"
            selected={watch('activeHeader') === 'modern'}
            onChange={value =>
              setValue('activeHeader', value, { shouldDirty: true })
            }
            register={register}
          />

          <HeaderOption
            icon={LayoutList}
            title="En-tête Classique"
            description="Design traditionnel avec navigation simple"
            value="classic"
            selected={watch('activeHeader') === 'classic'}
            onChange={value =>
              setValue('activeHeader', value, { shouldDirty: true })
            }
            register={register}
          />
        </div>
      </section>
      {/* Landing Template */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">Template de Page d'Accueil</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TemplateOption
            icon={Rows}
            title="Modern"
            description="Design moderne avec une grande image d'en-tête"
            value="modern"
            selected={watch('activeLanding') === 'modern'}
            onChange={value =>
              setValue('activeLanding', value, { shouldDirty: true })
            }
            register={register}
            imageUrl="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=500&q=60"
          />

          <TemplateOption
            icon={Columns}
            title="Minimal"
            description="Design épuré et minimaliste"
            value="minimal"
            selected={watch('activeLanding') === 'minimal'}
            onChange={value =>
              setValue('activeLanding', value, { shouldDirty: true })
            }
            register={register}
            imageUrl="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=500&q=60"
          />

          <TemplateOption
            icon={LayoutGrid}
            title="Grid"
            description="Mise en page en grille avec images"
            value="grid"
            selected={watch('activeLanding') === 'grid'}
            onChange={value =>
              setValue('activeLanding', value, { shouldDirty: true })
            }
            register={register}
            imageUrl="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60"
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">Mise à jour du site</h2>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Version actuelle:{' '}
              {packageJson.version
                ? `v${packageJson.version}`
                : 'Chargement...'}
            </p>
            <select
              value={`${selectedVersion?.value}`}
              className={`rounded-lg border p-2 dark:bg-gray-700`}
              onChange={vers => {
                const value = versions.find(v => v.value === vers.target.value);
                setSelectedVersion(value || null);
              }}
            >
              <option value="">Selectionner une version</option>
              {versions.map(vers => (
                <option key={vers.id} value={vers.value}>
                  v{vers.value}
                </option>
              ))}
            </select>
            {version?.value && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                derniere versions: v{version?.value}
              </p>
            )}
            {cooldownTime > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Déploiement en cours, rafraichissez votre site dans exactement:{' '}
                {formatTimeRemaining(cooldownTime)}
              </p>
            )}
          </div>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                Erreur lors du redéploiement: {error}
              </p>
            </div>
          )}

          <button
            onClick={handleRedeploy}
            disabled={
              isDeploying ||
              loading ||
              !!errorLoading ||
              cooldownTime > 0 ||
              packageJson.version === selectedVersion?.value ||
              !selectedVersion
            }
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                disabled:pointer-events-none disabled:opacity-50
                bg-blue-600 text-white hover:bg-blue-700
                dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isDeploying ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Redéploiement en cours...
              </>
            ) : cooldownTime > 0 ? (
              `Disponible dans ${formatTimeRemaining(cooldownTime)}`
            ) : packageJson.version === version?.value ? (
              'Votre site est à jour'
            ) : (
              'Mettre à jour le site'
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

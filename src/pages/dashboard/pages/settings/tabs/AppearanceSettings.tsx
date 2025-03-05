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
  Store,
  X,
} from 'lucide-react';
import { useTheme } from '../../../../../context/ThemeContext';
import { RestaurantSettings } from '../../../../../types/settings';
import { ThemeOption } from './components/ThemeOption';
import { HeaderOption } from './components/HeaderOption';
import { TemplateOption } from './components/TemplateOption';
import { useAppVersion } from '../../../../../hooks/useAppVersion';
import { useDeployment } from '../../../../../hooks/useDeployment';
import packageJson from '../../../../../../package.json';
import { useTranslation } from 'react-i18next';
import { Version } from '../../../../../services/version/version.service';

const COOLDOWN_DURATION = 6 * 60;
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
  const { t } = useTranslation();
  const { register, watch, setValue } = useFormContext<RestaurantSettings>();
  const { theme, toggleTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const { version, loading, errorLoading, versions } = useAppVersion();
  const { redeploy, isDeploying, error } = useDeployment();

  const [cooldownTime, setCooldownTime] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

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

  useEffect(() => {
    if (versions.length > 0) {
      const vers = versions.find(v => v.value === packageJson.version);
      setSelectedVersion(vers || null);
    }
  }, [versions]);

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
      if (!version?.value || packageJson.version === selectedVersion?.value)
        return;
      await redeploy(version?.value);
      if (
        !selectedVersion?.value ||
        packageJson.version === selectedVersion?.value
      ) {
        return;
      }

      await redeploy(selectedVersion.value);
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

  const themeData = [
    {
      ImgUrl:
        'https://res.cloudinary.com/dp8d8jxxd/image/upload/v1740908360/izirestau/uc9uptbzyrsuoy4grdes.png',
      themeName: t('settingAppearence:theme-name'),
      themeDescription: t('settingAppearence:theme-description'),
      value: 'pizzaTheme',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingAppearence:display-mode')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ThemeOption
            icon={Sun}
            title={t('settingAppearence:light-mode')}
            description={t('settingAppearence:light-mode-description')}
            value="light"
            selected={watch('defaultTheme') === 'light'}
            onChange={handleThemeChange}
            register={register}
          />
          <ThemeOption
            icon={Moon}
            title={t('settingAppearence:dark-mode')}
            description={t('settingAppearence:dark-mode-description')}
            value="dark"
            selected={watch('defaultTheme') === 'dark'}
            onChange={handleThemeChange}
            register={register}
          />
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <MenuSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingAppearence:header')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HeaderOption
            icon={LayoutDashboard}
            title={t('settingAppearence:modern-header')}
            description={t('settingAppearence:modern-header-description')}
            value="modern"
            selected={watch('activeHeader') === 'modern'}
            onChange={value =>
              setValue('activeHeader', value, { shouldDirty: true })
            }
            register={register}
          />
          <HeaderOption
            icon={LayoutList}
            title={t('settingAppearence:classic-header')}
            description={t('settingAppearence:classic-header-description')}
            value="classic"
            selected={watch('activeHeader') === 'classic'}
            onChange={value =>
              setValue('activeHeader', value, { shouldDirty: true })
            }
            register={register}
          />
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingAppearence:landing-page')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TemplateOption
            icon={Rows}
            title={t('settingAppearence:modern')}
            description={t('settingAppearence:modern-description')}
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
            title={t('settingAppearence:minimal')}
            description={t('settingAppearence:minimal-description')}
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
            title={t('settingAppearence:grid')}
            description={t('settingAppearence:grid-description')}
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

      {/* <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingAppearence:premium-theme-title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themeData.map((theme, index) => (
            <TemplateOption
              key={index}
              icon={Sun}
              title={theme.themeName}
              description={theme.themeDescription}
              value={theme.value}
              selected={watch('activeLanding') === 'pizzaTheme'}
              onChange={value =>
                setValue('activeLanding', value, { shouldDirty: true })
              }
              register={register}
              imageUrl={theme.ImgUrl}
              setShowModal={setShowModal}
            />
          ))}
        </div>
      </section> */}

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingAppearence:premium-theme-title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themeData.map((theme, index) => (
            <TemplateOption
              key={index}
              icon={Sun}
              title={theme.themeName}
              description={theme.themeDescription}
              value={theme.value}
              selected={watch('activeLanding') === 'pizzaTheme'}
              onChange={value =>
                setValue('activeLanding', value, { shouldDirty: true })
              }
              register={register}
              imageUrl={theme.ImgUrl}
              setShowModal={setShowModal}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingAppearence:deployment')}
          </h2>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('settingAppearence:version')}{' '}
              {packageJson.version || t('common:loading')}
            </p>
            <select
              value={`${selectedVersion?.value}`}
              className={`rounded-lg border p-2 dark:bg-gray-700`}
              onChange={vers => {
                const value = versions.find(v => v.value === vers.target.value);
                setSelectedVersion(value || null);
              }}
            >
              <option value="">{t('settingAppearence:select-version')}</option>
              {versions.map(vers => (
                <option key={vers.id} value={vers.value}>
                  v{vers.value}{' '}
                  {vers.isLatest
                    ? `(${t('common:latest')})`
                    : vers.isStable
                    ? `(${t('common:stable')})`
                    : ''}
                </option>
              ))}
            </select>
            {version?.value && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settingAppearence:new-version')} {version?.value}
              </p>
            )}
            {cooldownTime > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {t('settingAppearence:deployment-inprogress')}{' '}
                {formatTimeRemaining(cooldownTime)}
              </p>
            )}
          </div>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                {t('settingAppearence:error-during-deployment')} {error}
              </p>
            </div>
          )}

          <button
            type="button"
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
                {t('settingAppearence:re-deployment-inprogress')}
              </>
            ) : cooldownTime > 0 ? (
              `${t('settingAppearence:available-in')} ${formatTimeRemaining(
                cooldownTime
              )}`
            ) : packageJson.version === selectedVersion?.value ? (
              t('settingAppearence:up-to-date')
            ) : (
              t('settingAppearence:re-deploy')
            )}
          </button>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm !mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <span className="flex justify-end">
              <X
                className="cursor-pointer text-black"
                onClick={() => setShowModal(false)}
                role="button"
              />
            </span>

            <h3 className="text-xl font-semibold">
              {t('settingAppearence:activate-theme')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('settingAppearence:activate-theme-key')}
            </p>
            <input
              type="text"
              placeholder={t('settingAppearence:activate-theme-key')}
              className="w-full rounded-lg border p-2 dark:bg-gray-700 mb-4"
            />
            <div className="flex gap-4">
              <button
                type="button"
                className="rounded-lg bg-blue-500 text-white px-4 py-2 w-full"
                onClick={() => setShowModal(false)}
              >
                {t('common:confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

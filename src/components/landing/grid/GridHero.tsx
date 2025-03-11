import { motion } from 'framer-motion';
import { useSettings } from '../../../hooks/useSettings';
import { Button } from '../../ui/Button';
import { ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type GridHeroProps = {
  palette?: {
    primary: string;
    secondary: string;
  };
  isDarkMode?: boolean;
};

export function GridHero({
  palette = {
    primary: '#2563EB',
    secondary: '#4D48E5',
  },
  isDarkMode = false,
}: GridHeroProps) {
  const { settings } = useSettings();
  const coverImage =
    settings?.coverImage ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';

  const { t } = useTranslation('hero');

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">
            {t(settings?.name || 'grid-hero-title')}
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            {t(settings?.description || 'grid-hero-description')}
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={scrollToMenu}
              className="group relative rounded-full px-8 py-3 text-base font-medium transition-all hover:shadow-lg hover:opacity-90 sm:text-lg
             bg-gradient-to-r from-gray-200 to-white hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300
             dark:bg-gradient-to-r dark:hover:from-blue-600 dark:hover:to-blue-500"
              style={{
                color: isDarkMode ? '#FFFFFF' : palette.primary,
                background: isDarkMode
                  ? `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`
                  : undefined,
              }}
              spanStyle={{
                color: isDarkMode ? '#FFFFFF' : palette.primary,
              }}
            >
              {t('view-menu')}
              <ArrowDown className="ml-2 inline-block h-4 w-4 transition-transform group-hover:translate-y-1 group-hover:animate-bounce" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

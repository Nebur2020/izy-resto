import { motion, AnimatePresence } from 'framer-motion';
import { HeaderWrapper } from '../layout/HeaderWrapper';
import { GridHero } from './grid/GridHero';
import { GridMenuSection } from './grid/GridMenuSection';
import { Container } from '../ui/Container';
import { Cart } from '../cart/Cart';
import { Footer } from '../layout/Footer';
import { LoadingScreen } from '../ui/LoadingScreen';
import { useLayoutMount } from '../../hooks/useLayoutMount';
import { useSettings } from '../../hooks';
import { useTheme } from '../../context/ThemeContext';

export function LandingGrid() {
  const { isLoading, isLayoutMounted } = useLayoutMount();
  const { settings } = useSettings();
  const { theme } = useTheme();

  const isDarkMode = theme === 'dark';

  return (
    <>
      <AnimatePresence>
        {isLoading && !settings && <LoadingScreen isLoading={true} />}
      </AnimatePresence>

      <AnimatePresence>
        {isLayoutMounted && settings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
          >
            <HeaderWrapper />
            <GridHero palette={settings.palette} isDarkMode={isDarkMode} />
            <main className="py-16 md:py-24">
              <Container>
                <section id="menu">
                  <GridMenuSection
                    palette={settings.palette}
                    isDarkMode={isDarkMode}
                  />
                </section>
              </Container>
            </main>
            <Footer palette={settings.palette} />
            <Cart
              primaryColor={settings.palette.primary}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

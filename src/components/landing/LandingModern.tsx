import { motion, AnimatePresence } from 'framer-motion';
import { HeaderWrapper } from '../layout/HeaderWrapper';
import { Hero } from '../layout/Hero';
import { MenuSection } from '../menu/MenuSection';
import { Container } from '../ui/Container';
import { Cart } from '../cart/Cart';
import { LoadingScreen } from '../ui/LoadingScreen';
import { useLayoutMount } from '../../hooks/useLayoutMount';
import { Footer } from '../layout/Footer';
import { useSettings } from '../../hooks';
import { useTheme } from '../../context/ThemeContext';

export function LandingModern() {
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
            <Hero palette={settings.palette} isDarkMode={isDarkMode} />
            <main className="pt-10">
              <Container>
                <section id="menu" className="py-5">
                  <MenuSection
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

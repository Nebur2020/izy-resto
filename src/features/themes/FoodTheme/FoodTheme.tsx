import { useState, useEffect } from 'react';
import { Header } from '../../../components/layout';
import Banner from './Banner';
import AboutUs from './AboutUs';
import Footer from './Footer';
import ProductList from './ProductList';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { AnimatePresence } from 'framer-motion';
import { Cart } from '../../../components/cart/Cart';
import { useTheme } from '../../../context/ThemeContext';
import { useSettings } from '../../../hooks/useSettings';
import {
  FoodThemeConfig,
  fooThemDefaultConfig,
} from '../../../pages/dashboard/pages/settings/theme/editor/food';
import { FoodThemeProvider } from './context/FoodThemeContext';
import { useLayoutMount } from '../../../hooks/useLayoutMount';
import OrderNow from './OrderNow';

export default function FoodTheme() {
  const [themeConfig, setThemeConfig] =
    useState<FoodThemeConfig>(fooThemDefaultConfig);
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { isLoading, isLayoutMounted } = useLayoutMount();

  useEffect(() => {
    if (settings) {
      if (
        (settings?.activeTheme?.configuration as FoodThemeConfig)?.banner
          ?.images
      ) {
        setThemeConfig(settings.activeTheme.configuration as any);
      }
    }
  }, [settings]);

  const primaryColor = settings?.palette.primary;
  const secondaryColor = settings?.palette.secondary;
  const backgroundColor = settings?.palette.background;

  const themeColors = {
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
    '--background-color': backgroundColor,
    '--dark-background': '#1a1a1a',
    '--dark-surface': '#2d2d2d',
    '--dark-text': '#ffffff',
    '--dark-text-secondary': '#cccccc',
  };

  const isDarkMode = theme === 'dark';

  return (
    <>
      <AnimatePresence>
        {isLoading && !settings && <LoadingScreen isLoading={true} />}
      </AnimatePresence>

      <FoodThemeProvider value={{ ...themeConfig }}>
        {isLayoutMounted && settings && (
          <div
            className={`pizza-theme ${isDarkMode ? 'dark' : ''}`}
            style={themeColors as React.CSSProperties}
          >
            <AnimatePresence>
              {isLoading && <LoadingScreen isLoading={true} />}
            </AnimatePresence>

            <Header
              logo={settings.logo}
              siteName={settings.name}
              defaultHeaderStyle={`border-b ${
                isDarkMode ? 'border-gray-800' : 'border-[#eddfc6]'
              }`}
              scrollHeaderStyle={
                isDarkMode ? 'bg-gray-900/90' : `bg-[${backgroundColor}]`
              }
            />

            <Banner
              buttonText={themeConfig.banner.buttonText}
              images={themeConfig.banner.images}
              slides={themeConfig.banner.slides}
              isDarkMode={isDarkMode}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />

            {themeConfig.aboutUs.display && (
              <AboutUs
                sectionTitle={themeConfig.aboutUs.sectionTitle}
                contentTitle={themeConfig.aboutUs.contentTitle}
                description={themeConfig.aboutUs.description}
                image={themeConfig.aboutUs.image}
                isDarkMode={isDarkMode}
                primaryColor={primaryColor}
              />
            )}

            <ProductList primaryColor={primaryColor} isDarkMode={isDarkMode} />

            {themeConfig.discount?.general?.display && (
              <OrderNow
                discountTitle={themeConfig.discount.discountTitle}
                description={themeConfig.discount.description}
                buttonText={themeConfig.discount.buttonText}
                isDarkMode={isDarkMode}
                primaryColor={primaryColor}
              />
            )}

            {themeConfig?.footer.general.display && (
              <>
                <Footer
                  logo={settings.logo}
                  siteName={settings.name}
                  location={themeConfig.footer.location}
                  copyrightText={themeConfig.footer.copyrightText}
                  showOpeningHours={themeConfig.footer.showOpeningHours}
                  isDarkMode={isDarkMode}
                  primaryColor={primaryColor}
                />
              </>
            )}

            <Cart
              primaryColor={primaryColor}
              backgroundColor={backgroundColor}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </FoodThemeProvider>
    </>
  );
}

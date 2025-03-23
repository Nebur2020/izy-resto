import { useState, useEffect } from 'react';
import { Header } from '../../../components/layout';
import Banner from './Banner';
import FooterBanner from './FooterBanner';
import OrderNow from './OrderNow';
import Partner from './partner';
import Cta from './Cta';
import Footer from './Footer';
import ProductList from './ProductList';
import { LoadingScreen } from '../../../components/ui/LoadingScreen';
import { AnimatePresence } from 'framer-motion';
import { Cart } from '../../../components/cart/Cart';
import { useTheme } from '../../../context/ThemeContext';
import { useSettings } from '../../../hooks/useSettings';
import {
  PizzaThemeConfig,
  defaultConfig,
} from '../../../pages/dashboard/pages/settings/theme/editor/pizza';
import { PizzaThemeProvider } from './context/PizzaThemeContext';
import { useLayoutMount } from '../../../hooks/useLayoutMount';

export default function PizzaTheme() {
  const [themeConfig, setThemeConfig] =
    useState<PizzaThemeConfig>(defaultConfig);
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { isLoading, isLayoutMounted } = useLayoutMount();

  useEffect(() => {
    if (settings) {
      setThemeConfig(settings.activeTheme.configuration as PizzaThemeConfig);
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

      <PizzaThemeProvider value={{ ...themeConfig }}>
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
              deliveryText={themeConfig.header.deliveryText}
              mainHeading={themeConfig.header.mainHeading}
              taglines={themeConfig.header.taglines}
              buttonText={themeConfig.header.buttonText}
              image={themeConfig.header.image}
              isDarkMode={isDarkMode}
              primaryColor={primaryColor}
              backgroundColor={backgroundColor}
              secondaryColor={secondaryColor}
            />

            <ProductList
              tagline={themeConfig.menuSection.tagline}
              title={themeConfig.menuSection.title}
              primaryColor={primaryColor}
              isDarkMode={isDarkMode}
            />

            {themeConfig.features.general?.display && (
              <FooterBanner
                showExcellentQuality={themeConfig.features.showExcellentQuality}
                discountPercentage={themeConfig.features.discountPercentage}
                excellentQualityHeading={
                  themeConfig.features.excellentQualityHeading
                }
                image={themeConfig.features.image}
                backgroundImage={themeConfig.features.backgroundImage}
                isDarkMode={isDarkMode}
                primaryColor={primaryColor}
              />
            )}

            {
              themeConfig.specialItem?.general?.display && (
                <OrderNow
                  title={themeConfig.specialItem.title}
                  description={themeConfig.specialItem.description}
                  price={themeConfig.specialItem.price}
                  priceText={themeConfig.specialItem.priceText}
                  image={themeConfig.specialItem.image}
                  buttonText={themeConfig.specialItem.buttonText}
                  backgroundImage={themeConfig.specialItem.backgroundImage}
                  isDarkMode={isDarkMode}
                  primaryColor={primaryColor}
                />
              )
            }
            {
              // Display the call to action section if enabled
              themeConfig.delivery?.general?.display && (
                <Cta
                  title={themeConfig.delivery.title}
                  description={themeConfig.delivery.description}
                  showPhoneNumber={themeConfig.delivery.showPhoneNumber}
                  phoneNumber={themeConfig.delivery.phoneNumber}
                  isDarkMode={isDarkMode}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              )
            }

            {themeConfig?.footer.general.display && (
              <>
                {themeConfig.footer.logoPartners.length > 0 && (
                  <Partner
                    logoPartners={themeConfig.footer.logoPartners}
                    isDarkMode={isDarkMode}
                  />
                )}

                <Footer
                  logo={settings.logo}
                  siteName={settings.name}
                  location={themeConfig.footer.location}
                  copyrightText={themeConfig.footer.copyrightText}
                  showOpeningHours={themeConfig.footer.showOpeningHours}
                  backgroundImage={themeConfig.footer.backgroundImage}
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
      </PizzaThemeProvider>
    </>
  );
}

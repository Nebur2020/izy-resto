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
import { useLayoutMount } from '../../../hooks/useLayoutMount';
import { Cart } from '../../../components/cart/Cart';
import { useThemeConfig } from './context/useThemeConfig';
import { useTheme } from '../../../context/ThemeContext';
import { useSettings } from '../../../hooks/useSettings';
import {
  PizzaThemeConfig,
  defaultConfig,
} from '../../../pages/dashboard/pages/settings/theme/editor/pizza';
import { PizzaThemeProvider } from './context/PizzaThemeContext';

export default function PizzaTheme() {
  const { isLoading } = useLayoutMount();
  const [themeConfig, setThemeConfig] =
    useState<PizzaThemeConfig>(defaultConfig);
  const { config, isConfigLoading } = useThemeConfig();
  const { theme } = useTheme();
  const { settings } = useSettings();

  // Sync theme with settings and configuration
  useEffect(() => {
    if (config) {
      setThemeConfig(config);

      // // Set theme based on config's darkMode property or settings' defaultTheme
      // if (settings?.defaultTheme) {
      //   setTheme(settings.defaultTheme);
      // } else if (config.general.darkMode) {
      //   setTheme('dark');
      // } else {
      //   setTheme('light');
      // }
    }
  }, [config, settings]);

  if (!config) return null;

  const primaryColor = themeConfig.general.primaryColor;
  const secondaryColor = themeConfig.general.secondaryColor;
  const backgroundColor = themeConfig.general.backgroundColor;

  // Derive CSS variables for dynamic styling
  const themeColors = {
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
    '--background-color': backgroundColor,
    '--font-family': themeConfig.general.fontFamily,
    // Add dark mode variables
    '--dark-background': '#1a1a1a',
    '--dark-surface': '#2d2d2d',
    '--dark-text': '#ffffff',
    '--dark-text-secondary': '#cccccc',
  };

  // Determine if current theme is dark
  const isDarkMode = theme === 'dark';

  return (
    <PizzaThemeProvider value={{ ...themeConfig }}>
      <div
        className={`pizza-theme ${isDarkMode ? 'dark' : ''}`}
        style={themeColors as React.CSSProperties}
      >
        <AnimatePresence>
          {(isLoading || isConfigLoading) && <LoadingScreen isLoading={true} />}
        </AnimatePresence>

        <Header
          logo={themeConfig.general.logo}
          siteName={themeConfig.general.siteName}
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
        />

        <ProductList
          tagline={themeConfig.menuSection.tagline}
          title={themeConfig.menuSection.title}
          primaryColor={primaryColor}
          isDarkMode={isDarkMode}
        />
        {/* 
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
          />
        )} */}
        <FooterBanner
          showExcellentQuality={themeConfig.features.showExcellentQuality}
          discountPercentage={themeConfig.features.discountPercentage}
          excellentQualityHeading={themeConfig.features.excellentQualityHeading}
          image={themeConfig.features.image}
          backgroundImage={themeConfig.features.backgroundImage}
          isDarkMode={isDarkMode}
        />

        {
          // Display the special item section if enabled
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
            />
          )
        }

        <Cta
          title={themeConfig.delivery.title}
          description={themeConfig.delivery.description}
          showPhoneNumber={themeConfig.delivery.showPhoneNumber}
          phoneNumber={themeConfig.delivery.phoneNumber}
          isDarkMode={isDarkMode}
        />

        <Partner
          logoPartners={themeConfig.footer.logoPartners}
          isDarkMode={isDarkMode}
        />

        <Footer
          logo={themeConfig.general.logo}
          siteName={themeConfig.general.siteName}
          location={themeConfig.footer.location}
          copyrightText={themeConfig.footer.copyrightText}
          showOpeningHours={themeConfig.footer.showOpeningHours}
          backgroundImage={themeConfig.footer.backgroundImage}
          isDarkMode={isDarkMode}
        />

        <Cart
          cartBgColor={`bg-[${primaryColor}] hover:bg-[${primaryColor}]`}
          orderBgColor={`bg-[${primaryColor}] hover:bg-[${primaryColor}]`}
          totalCartAmount={`text-[${primaryColor}]`}
          deliveryTitleStyle={`border-[${primaryColor}] ${
            isDarkMode ? 'bg-gray-800' : `bg-[${backgroundColor}]`
          }`}
          deliveryHoverStyle={`${
            isDarkMode
              ? 'border-gray-700 hover:bg-gray-800'
              : `border-[${backgroundColor}] hover:bg-[${backgroundColor}]`
          }`}
          truckStyle={`text-[${primaryColor}]`}
          dinInUstensilsStyle={`text-[${primaryColor}]`}
          dinInHoverUstensilsStyle={`text-[${primaryColor}]`}
          dinInOptionStyle={`border-[${primaryColor}] ${
            isDarkMode ? 'bg-gray-800' : `bg-[${backgroundColor}]`
          }`}
          dinInHoverOptionStyle={`${
            isDarkMode
              ? 'border-gray-700 hover:bg-gray-800'
              : `border-[${backgroundColor}] hover:bg-[${backgroundColor}]`
          }`}
          nextButtonStyle={`bg-[${primaryColor}] hover:bg-[${primaryColor}]`}
          totalPriceStyle={`text-[${primaryColor}]`}
          selectedPyamentMethod={`${
            isDarkMode
              ? 'border-gray-700 bg-gray-800'
              : `border-[${backgroundColor}] bg-[${backgroundColor}]`
          }`}
          selectedHoverPaymentMethod={`${
            isDarkMode
              ? 'border-gray-700 hover:border-gray-600'
              : `border-gray-200 hover:border-[${backgroundColor}]`
          }`}
          selectRoundedDiv={`rounded-xl border-[${primaryColor}]`}
          selectRoundedDivHover={`rounded-xl border-[${primaryColor}] hover:border-[${primaryColor}]`}
          confirmOrderButtonStyle={`bg-gradient-to-r from-[${primaryColor}] to-[${
            isDarkMode ? '#3a3a3a' : backgroundColor
          }] hover:from-[${primaryColor}] hover:to-[${
            isDarkMode ? '#4a4a4a' : backgroundColor
          }] flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>
    </PizzaThemeProvider>
  );
}

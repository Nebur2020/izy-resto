import { ShoppingCart, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePizzaTheme } from './context/PizzaThemeContext';

const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

interface BannerProps {
  deliveryText?: string;
  mainHeading?: string;
  taglines?: string[];
  buttonText?: string;
  image: string;
  isDarkMode?: boolean;
  primaryColor?: string;
  backgroundColor?: string;
  secondaryColor?: string;
}

export default function Banner({
  deliveryText,
  mainHeading,
  taglines,
  buttonText,
  image,
  isDarkMode,
  primaryColor,
  backgroundColor,
}: BannerProps) {
  const { t } = useTranslation('pizzatheme');
  const themeConfig = usePizzaTheme();
  const maxLength = 40;

  // Use props if provided, otherwise fall back to theme context values
  const bannerDeliveryText = deliveryText || themeConfig.header.deliveryText;
  const bannerMainHeading = mainHeading || themeConfig.header.mainHeading;
  const bannerTaglines = taglines || themeConfig.header.taglines;
  const bannerButtonText =
    buttonText || themeConfig.header.buttonText || t('hero:view-menu');

  // Default to theme context isDarkMode if not provided as prop
  const isDarkModeActive = isDarkMode;

  return (
    <section
      style={{
        backgroundColor: isDarkModeActive
          ? '#1a1a1a'
          : backgroundColor || 'white',
      }}
    >
      <div className="container mx-auto">
        <div
          className={`flex flex-col-reverse lg:flex-row justify-between items-center h-auto lg:h-screen py-10 pt-20`}
        >
          <div className="w-full lg:w-[40%] text-center lg:text-left lg:ml-10">
            {bannerDeliveryText && (
              <span
                className="text-white px-4 py-2 mb-3 inline-block rounded-md text-sm lg:text-base"
                style={{ backgroundColor: primaryColor }}
              >
                {bannerDeliveryText}
              </span>
            )}
            <motion.h1
              className={`my-5 text-4xl lg:text-6xl font-extrabold leading-tight ${
                isDarkModeActive ? 'text-white' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              {truncateText(bannerMainHeading, maxLength)}
            </motion.h1>
            <ul className="py-5 space-y-2">
              {bannerTaglines.map((tagline, index) => (
                <motion.li
                  key={index}
                  className="flex justify-center lg:justify-start items-center"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 * index, duration: 0.5 }}
                >
                  <CheckCircle color={primaryColor} />
                  <span
                    className={`ml-2 font-semibold text-sm lg:text-lg ${
                      isDarkModeActive ? 'text-gray-300' : ''
                    }`}
                  >
                    {tagline}
                  </span>
                </motion.li>
              ))}
            </ul>
            <motion.button
              className="flex justify-center lg:justify-start items-center font-bold text-lg rounded-full mt-4 px-5 lg:px-7 py-4 lg:py-5 mx-auto lg:mx-0"
              style={{ backgroundColor: primaryColor }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={() => {
                document
                  .getElementById('product-list')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ShoppingCart color="#fff" />
              <span className="text-white ml-2">{bannerButtonText}</span>
            </motion.button>
          </div>
          <div className="w-full lg:w-[50%] mt-10 lg:mt-0 flex justify-center relative mb-11">
            <div
              className={`
          relative 
          max-w-[70%] 
          rounded-lg
          overflow-hidden
          `}
            >
              <motion.img
                src={image}
                alt="Pizza"
                className="object-contain w-[300px] sm:w-[400px] md:w-[500px] lg:w-[1000px] max-w-full h-auto relative z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

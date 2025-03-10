import { useTranslation } from 'react-i18next';
import { Language } from '../../../types';
import { usePizzaTheme } from './context/PizzaThemeContext';

interface FooterBannerProps {
  showExcellentQuality?: boolean;
  discountPercentage?: string;
  excellentQualityHeading?: string;
  image?: string;
  backgroundImage?: string;
  isDarkMode?: boolean;
}

export default function FooterBanner({
  showExcellentQuality,
  discountPercentage,
  excellentQualityHeading,
  image,
  backgroundImage,
  isDarkMode,
}: FooterBannerProps) {
  const { t, i18n } = useTranslation('pizzatheme');
  const lng = i18n.language as Language;
  const themeConfig = usePizzaTheme();

  // Default to theme context isDarkMode if not provided as prop
  const isDarkModeActive = isDarkMode;

  // Use props if provided, otherwise fall back to theme context values
  const showSection =
    showExcellentQuality !== undefined
      ? showExcellentQuality
      : themeConfig.features.showExcellentQuality;

  const discount =
    discountPercentage || themeConfig.features.discountPercentage;
  const heading =
    excellentQualityHeading || themeConfig.features.excellentQualityHeading;
  const discountImage = image || themeConfig.features.image;
  const bannerBgImage = backgroundImage || themeConfig.features.backgroundImage;

  if (!showSection) {
    return null;
  }

  // Add a dark overlay for dark mode
  const darkModeOverlay = isDarkModeActive
    ? 'before:absolute before:inset-0 before:bg-black before:opacity-50 before:z-[1]'
    : '';

  return (
    <section
      className={`flex flex-col-reverse lg:flex-row items-center justify-between px-6 sm:px-12 lg:px-44 pt-12 py-16 sm:py-16 lg:py-16 relative text-center lg:text-left bg-cover bg-center bg-fixed ${darkModeOverlay} after:absolute after:top-[50px] after:left-[600px] after:w-[245px] after:h-[230px] after:bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/shape21.png')] after:bg-no-repeat after:bg-cover after:z-0 z-10 after:hidden lg:after:block`}
      style={{ backgroundImage: `url(${bannerBgImage})` }}
    >
      <p
        className="absolute top-[100px] left-[670px] text-[40px] font-bold z-10 hidden lg:block"
        style={{ color: themeConfig.general.primaryColor }}
      >
        {discount}%
        <p className={`text-black pt-0 mt-0 ${lng === 'fr' && 'text-xl'}`}>
          {t('discount')}
        </p>
      </p>
      <div className="w-full lg:w-1/2 space-y-6 max-w-2xl z-[2]">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
          {heading}
        </h1>
      </div>
      <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end z-[2]">
        <div className="banner-footer-container">
          <img
            src={discountImage}
            alt="Discount Offer"
            className="object-cover w-[80%] sm:w-[60%] md:w-full max-w-sm sm:max-w-md lg:max-w-xl relative rounded-full"
          />
        </div>
      </div>
    </section>
  );
}

import { MoveRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePizzaTheme } from './context/PizzaThemeContext';

interface OrderNowProps {
  title?: string;
  description?: string;
  price?: string;
  priceText?: string;
  image?: string;
  buttonText?: string;
  backgroundImage?: string;
  isDarkMode?: boolean;
}

export default function OrderNow({
  title,
  description,
  price,
  priceText,
  image,
  buttonText,
  backgroundImage,
  isDarkMode,
}: OrderNowProps) {
  const { t } = useTranslation('pizzatheme');
  const themeConfig = usePizzaTheme();

  // Default to theme context isDarkMode if not provided as prop
  const isDarkModeActive = isDarkMode;

  // Use props if provided, otherwise fall back to theme context values
  const itemTitle = title || themeConfig.specialItem.title;
  const itemDescription = description || themeConfig.specialItem.description;
  const itemPrice = price || themeConfig.specialItem.price;
  const itemPriceText = priceText || themeConfig.specialItem.priceText;
  const itemImage = image || themeConfig.specialItem.image;
  const itemButtonText =
    buttonText || themeConfig.specialItem.buttonText || t('order-now');
  const sectionBg = backgroundImage || themeConfig.specialItem.backgroundImage;

  // Create a semi-transparent overlay for dark mode
  const darkModeOverlay = isDarkModeActive
    ? 'after:absolute after:inset-0 after:bg-black after:opacity-60 after:z-0'
    : '';

  return (
    <section
      className={`flex flex-col md:flex-row items-center justify-between px-6 md:px-40 py-16 bg-cover bg-center relative ${darkModeOverlay} before:absolute before:bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/shape35.png')] before:top-[150px] before:right-[10px] before:w-[200px] before:h-[200px] before:bg-no-repeat before:bg-cover before:z-0 before:transform before:translate-x-[5px] before:translate-y-[225px] after:absolute after:bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/shape34.png')] after:bottom-[250px] after:left-[-150px] after:w-[200px] after:h-[200px] after:bg-no-repeat after:bg-cover after:z-0`}
      style={{
        backgroundImage: isDarkModeActive ? 'none' : `url(${sectionBg})`,
      }}
    >
      <div className="w-full md:w-1/2 space-y-6 z-10">
        <h1
          className={`text-4xl md:text-5xl font-bold leading-tight ${
            isDarkModeActive ? 'text-white' : 'text-gray-900'
          }`}
        >
          {itemTitle}
        </h1>
        <p
          className={`text-lg max-w-md ${
            isDarkModeActive ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {itemDescription}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-3xl font-bold"
            style={{ color: themeConfig.general.primaryColor }}
          >
            ${itemPrice}
          </span>
          <span
            className={
              isDarkModeActive
                ? 'text-sm text-gray-400'
                : 'text-sm text-gray-500'
            }
          >
            {itemPriceText}
          </span>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 text-white text-lg font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
          style={{ backgroundColor: themeConfig.general.primaryColor }}
          onClick={() => {
            document
              .getElementById('product-list')
              ?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {itemButtonText} <MoveRight size={20} />
        </button>
      </div>

      <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0 z-10">
        <img
          src={itemImage}
          alt={itemTitle}
          className="object-cover w-full max-w-lg md:max-w-xl lg:max-w-2xl"
        />
      </div>
    </section>
  );
}

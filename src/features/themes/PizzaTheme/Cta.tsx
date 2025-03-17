import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePizzaTheme } from './context/PizzaThemeContext';

interface CtaProps {
  title?: string;
  description?: string;
  showPhoneNumber?: boolean;
  phoneNumber?: string;
  isDarkMode?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function Cta({
  title,
  description,
  showPhoneNumber,
  phoneNumber,
  isDarkMode,
  primaryColor,
  secondaryColor,
}: CtaProps) {
  const { t } = useTranslation('pizzatheme');
  const themeConfig = usePizzaTheme();

  const ctaTitle = title || themeConfig.delivery.title;
  const ctaDescription = description || themeConfig.delivery.description;
  const showPhone =
    showPhoneNumber !== undefined
      ? showPhoneNumber
      : themeConfig.delivery.showPhoneNumber;
  const phone = phoneNumber || themeConfig.delivery.phoneNumber;

  if (!themeConfig.delivery.general.display) {
    return null;
  }

  return (
    <section className={`w-full ${isDarkMode ? 'bg-[#1A1A1A]' : ''} py-16`}>
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-around px-6 sm:px-11 relative bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/section_bg9.png')] bg-cover bg-center py-9 rounded-lg">
          <div
            className="absolute inset-0 opacity-90 rounded-lg lg:rounded-bl-[100px] lg:rounded-tr-[100px]"
            style={{ backgroundColor: primaryColor }}
          ></div>
          <div className="relative w-[80%] sm:w-[60%] md:w-[50%] lg:w-auto before:absolute before:top-[210px] before:right-[320px] before:w-[100px] before:h-[81px] before:bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/smoke.png')] before:bg-no-repeat before:bg-cover before:z-0 before:hidden lg:before:block z-10 animate-move-horizontal">
            <img
              src="https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2020/09/bike.png"
              alt="call to action image"
              className="object-cover w-full max-w-sm sm:max-w-md lg:max-w-lg"
            />
          </div>
          <div className="relative z-10 text-center lg:text-left max-w-xl mt-8 lg:mt-0 px-4">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              {ctaTitle}
            </h1>
            <p className="text-lg mb-6 text-white">{ctaDescription}</p>
          </div>
          {showPhone && (
            <div className="relative z-10 mt-6 lg:mt-0">
              <a href={`tel:${phone}`}>
                <button
                  className="flex items-center justify-center text-white lg:min-w-[300px] py-3 rounded-full px-8 text-lg"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <Phone className="mr-2 w-5 h-5" />
                  {t('call-us')}: {phone}
                </button>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

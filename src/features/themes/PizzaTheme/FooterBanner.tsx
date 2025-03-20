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
  primaryColor?: string;
}

export default function FooterBanner({
  showExcellentQuality,
  discountPercentage,
  excellentQualityHeading,
  image,
  backgroundImage,
  isDarkMode,
  primaryColor,
}: FooterBannerProps) {
  const { t, i18n } = useTranslation('pizzatheme');
  const lng = i18n.language as Language;
  const themeConfig = usePizzaTheme();

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


  return (
    <section
      className={` md:px-5 lg:px-10 py-16 text-center lg:text-left bg-cover bg-center bg-fixed`}
      style={{ backgroundImage: `url(${bannerBgImage})` }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 space-y-6 max-w-2xl z-[2] relative">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
              {heading}
            </h1>

            <div className="absolute top-0 right-0 lg:flex justify-center hidden">
              <div className="relative">
                <div className="absolute -top-40 -right-8 z-50">
                  <p className="text-4xl relative font-bold z-20 hidden md:flex md:flex-col">
                    <span style={{ color: primaryColor }}>{discount}%</span>
                    <span
                      className={`text-black pt-0 mt-0 ${
                        lng === 'fr' && 'text-xl'
                      }`}
                    >
                      {t('discount')}
                    </span>
                  </p>
                </div>

                <div className="absolute -top-52 -right-24  w-[200px] z-40">
                  <img
                    className=""
                    src="https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/shape21.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end z-[2]">
            <div className="banner-footer-container flex justify-center lg:justify-end">
              <img
                src={discountImage}
                alt="Discount Offer"
                className="object-cover w-[80%] sm:w-[60%] md:w-full max-w-sm sm:max-w-md lg:max-w-xl relative rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

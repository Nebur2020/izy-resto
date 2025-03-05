import { useTranslation } from 'react-i18next';
import { Language } from '../../../types';
import { useSettings } from '../../../hooks/useSettings';

export default function FooterBanner() {
  const { t, i18n } = useTranslation('pizzatheme');
  const lng = i18n.language as Language;

  const { settings } = useSettings();

  return (
    <section className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 sm:px-12 lg:px-44 pt-12 my-16 sm:my-24 lg:my-32 relative text-center lg:text-left bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/section_bg16.jpg')] bg-cover bg-center bg-fixed after:absolute after:top-[50px] after:left-[600px] after:w-[245px] after:h-[230px] after:bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/shape21.png')] after:bg-no-repeat after:bg-cover after:z-0 z-10 after:hidden lg:after:block">
      <p className="text-red-500 absolute top-[100px] left-[670px] text-[40px] font-bold z-10 hidden lg:block">
        {settings && settings.productDiscount}%
        <p className={`text-black pt-0 mt-0 ${lng === 'fr' && 'text-xl'}`}>
          {t('discount')}
        </p>
      </p>
      <div className="w-full lg:w-1/2 space-y-6 max-w-2xl">
        {/* <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
          We Have <span className="text-yellow-500">Excellent</span> Of
          <span className="text-yellow-500"> Quality </span> Pizza
        </h1> */}
        {settings && settings.footerBannerTitle && (
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
            {settings.footerBannerTitle}
          </h1>
        )}
        {/* <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
          {t('footer-banner-title')}
        </h1> */}
      </div>
      <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
        <div className="banner-footer-container">
          <img
            src="https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/40off.png"
            alt="Delicious Pizza"
            className="object-cover w-[80%] sm:w-[60%] md:w-full max-w-sm sm:max-w-md lg:max-w-xl relative"
          />
        </div>
      </div>
    </section>
  );
}

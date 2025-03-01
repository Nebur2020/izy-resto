import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Cta() {
  const { t } = useTranslation('pizzatheme');
  return (
    <section className="w-full px-6 sm:px-12 lg:px-44 mt-16 sm:mt-24 lg:mt-36">
      <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-around px-6 sm:px-11 relative bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/section_bg9.png')] bg-cover bg-center py-9 rounded-lg">
        <div className="absolute inset-0 bg-red-600 opacity-90 rounded-lg lg:rounded-bl-[100px] lg:rounded-tr-[100px]"></div>
        <div className="relative w-[80%] sm:w-[60%] md:w-[50%] lg:w-auto before:absolute before:top-[150px] before:right-[270px] before:w-[100px] before:h-[81px] before:bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/smoke.png')] before:bg-no-repeat before:bg-cover before:z-0 before:hidden lg:before:block z-10 animate-move-horizontal">
          <img
            src="https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2020/09/bike.png"
            alt="call to action image"
            className="object-cover w-full max-w-sm sm:max-w-md lg:max-w-lg"
          />
        </div>
        <div className="relative z-10 text-center lg:text-left max-w-xl mt-8 lg:mt-0 px-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white ">
            {t('cta-title')}
          </h1>
          <p className="text-lg mb-6 text-white ">{t('cta-description')}</p>
        </div>
        <div className="relative z-10 mt-6 lg:mt-0">
          <button className="flex items-center justify-center bg-[#fcb302] text-white py-3 rounded-full w-[180px] sm:w-[250px] text-lg">
            <Phone className="mr-2 w-5 h-5" />
            {t('call-us')}: +123666604
          </button>
        </div>
      </div>
    </section>
  );
}

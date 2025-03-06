import { MoveRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OrderNow() {
  const { t } = useTranslation('pizzatheme');
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-40 py-16 bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/section_bg11.jpg')] bg-cover bg-center relative before:absolute before:bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/shape35.png')] before:top-[150px] before:right-[10px] before:w-[200px] before:h-[200px] before:bg-no-repeat before:bg-cover before:z-0 before:transform before:translate-x-[5px] before:translate-y-[225px] after:absolute after:bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/shape34.png')] after:bottom-[250px] after:left-[-150px] after:w-[200px] after:h-[200px] after:bg-no-repeat after:bg-cover after:z-0">
      <div className="w-full md:w-1/2 space-y-6 z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight dark:text-slate-950">
          {t('product-title')}
        </h1>
        <p className="text-lg text-gray-600 max-w-md dark:text-slate-500">
          {t('product-description')}
        </p>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#fcb302] text-white text-lg font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105">
          {t('order-now')} <MoveRight size={20} />
        </button>
      </div>

      <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0 z-10">
        <img
          src="https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/limit-price-pizzaw.png"
          alt="Delicious Burger"
          className="object-cover w-full max-w-lg md:max-w-xl lg:max-w-2xl"
        />
      </div>
    </section>
  );
}

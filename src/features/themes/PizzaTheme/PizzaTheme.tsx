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

export default function PizzaTheme() {
  const { isLoading } = useLayoutMount();
  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen isLoading={true} />}
      </AnimatePresence>
      <Header
        defaultHeaderStyle="border-b border-[#eddfc6]"
        scrollHeaderStyle="bg-[#f4ecdf]"
      />
      <Banner />
      <ProductList />
      <FooterBanner />
      <OrderNow />
      <Cta />
      <Partner />
      <Footer />
      <Cart
        cartBgColor="bg-[#fcb302] hover:bg-[#fcb302]"
        orderBgColor="bg-[#fcb302] hover:bg-[#fcb302]"
        totalCartAmount="text-[#fcb302]"
        deliveryTitleStyle="border-[#fcb302] bg-[#f4ecdf]"
        deliveryHoverStyle="border-[#f4ecdf] dark:border-[#f4ecdf] hover:bg-[#f4ecdf] dark:hover:border-[#f4ecdf]"
        truckStyle="text-[#fcb302]"
        dinInUstensilsStyle="text-[#fcb302]"
        dinInHoverUstensilsStyle="text-[#fcb302]"
        dinInOptionStyle="border-[#fcb302] bg-[#f4ecdf]"
        dinInHoverOptionStyle="border-[#f4ecdf] dark:border-[#f4ecdf] hover:bg-[#f4ecdf] dark:hover:border-[#f4ecdf]"
        nextButtonStyle="bg-[#fcb302] hover:bg-[#fcb302]"
        totalPriceStyle="text-[#fcb302]"
        selectedPyamentMethod="border-[#f4ecdf] bg-[#f4ecdf] dark:border-[#f4ecdf] dark:bg-[#f4ecdf]"
        selectedHoverPaymentMethod="border-gray-200 dark:border-gray-700 hover:border-[#f4ecdf] dark:hover:border-[#f4ecdf]"
        selectRoundedDiv="rounded-xl border-[#fcb302]"
        selectRoundedDivHover="rounded-xl border-[#fcb302] hover:border-[#fcb302]"
        confirmOrderButtonStyle="bg-gradient-to-r from-[#fcb302]  to-[#f4ecdf] hover:from-[#fcb302] hover:to-[#f4ecdf] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </>
  );
}

import { AppRoutes } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ApiProvider } from './context/ApiContext';
import { useSEO } from './hooks/useSEO';
import { RestaurantClosedModal } from './components/ui/RestaurantClosedModal';
import { CookieBanner } from './components/ui/CookieBanner';
import { HolidayClosureModal } from './components/ui/HolidayClosureModal';
import { ServerCartProvider } from './context/ServerCartContext';
import { Toast } from './components/ui';
import './translations/i18n';

export default function App() {
  // Add SEO hook to update title and favicon
  useSEO();

  return (
    <ThemeProvider>
      <AuthProvider>
        <ApiProvider>
          <CartProvider>
            <ServerCartProvider>
              <OrderProvider>
                <AppRoutes />
                <RestaurantClosedModal />
                <HolidayClosureModal />
                <CookieBanner />
                <Toast />
              </OrderProvider>
            </ServerCartProvider>
          </CartProvider>
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

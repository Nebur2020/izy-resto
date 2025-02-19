import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../../hooks/useSettings';
import { MenuFilters } from '../../../components/menu/MenuFilters';
import { POSMenuGrid } from '../../../components/dashboard/components/pos/POSMenuGrid';
import { POSCartSidebar } from '../../../components/dashboard/components/pos/POSCartSidebar';
import { OrderConfirmationModal } from '../../../components/pos/OrderConfirmationModal';
import toast from 'react-hot-toast';
import { useServerCart } from '../../../context/ServerCartContext';
import { useStaffCheck } from '../../../hooks/useStaffCheck';
import { Order } from '../../../types';
import { orderService } from '../../../services/orders/order.service';
import { menuService } from '../../../services/menu/menu.service';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function POS() {
  const { settings } = useSettings();
  const { staffData } = useStaffCheck();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [customerInfo, setCustomerInfo] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // State for menu items
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(12); // Items per load

  const {
    total,
    addToCart,
    updateQuantity,
    cart,
    clearCart,
    taxTotal,
    taxes,
    tip,
    subtotal,
  } = useServerCart();

  // Load initial menu items based on selected category
  useEffect(() => {
    loadInitialItems();
  }, [selectedCategory]);

  const loadInitialItems = async () => {
    try {
      setIsLoading(true);
      setLastDoc(null);

      if (selectedCategory !== 'all') {
        // For specific category, use direct category filtering
        try {
          const categoryItems = await menuService.getMenuItemsByCategory(
            selectedCategory
          );

          // Show first pageSize items and set hasMore if there are more
          setMenuItems(categoryItems.slice(0, pageSize));
          setHasMore(categoryItems.length > pageSize);

          // Store all category items for pagination
          if (categoryItems.length > pageSize) {
            // We'll use this as a "fake lastDoc" - it's just a number representing
            // how many items we've already loaded
            setLastDoc({ id: pageSize.toString() } as any);
          } else {
            setLastDoc(null);
          }
        } catch (error) {
          console.error('Error loading category items:', error);
          toast.error('Erreur lors du chargement de la catégorie');
        }
      } else {
        // For "all" category, use standard pagination
        try {
          const result = await menuService.getMenuItemsPaginated(
            pageSize,
            null
          );
          setMenuItems(result.items);
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
        } catch (error) {
          console.error('Error loading paginated items:', error);
          // Fallback to getAll if pagination fails
          const allItems = await menuService.getAll();
          setMenuItems(allItems.slice(0, pageSize));
          setHasMore(allItems.length > pageSize);

          // Store all items for pagination
          if (allItems.length > pageSize) {
            setLastDoc({ id: pageSize.toString() } as any);
          } else {
            setLastDoc(null);
          }
        }
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Erreur lors du chargement du menu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreItems = async () => {
    if (!hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);

      if (selectedCategory !== 'all') {
        // For category-specific loads, get all items and slice
        const allCategoryItems = await menuService.getMenuItemsByCategory(
          selectedCategory
        );
        const currentLength = menuItems.length;
        const moreItems = allCategoryItems.slice(
          currentLength,
          currentLength + pageSize
        );

        setMenuItems(prevItems => [...prevItems, ...moreItems]);
        setHasMore(currentLength + pageSize < allCategoryItems.length);

        // Update our "fake lastDoc"
        if (currentLength + pageSize < allCategoryItems.length) {
          setLastDoc({ id: (currentLength + pageSize).toString() } as any);
        } else {
          setLastDoc(null);
        }
      } else {
        // For "all" category with real pagination
        if (typeof lastDoc?.id === 'string' && !isNaN(parseInt(lastDoc.id))) {
          // We're using our fake pagination
          const allItems = await menuService.getAll();
          const currentIndex = parseInt(lastDoc.id);
          const moreItems = allItems.slice(
            currentIndex,
            currentIndex + pageSize
          );

          setMenuItems(prevItems => [...prevItems, ...moreItems]);
          setHasMore(currentIndex + pageSize < allItems.length);

          if (currentIndex + pageSize < allItems.length) {
            setLastDoc({ id: (currentIndex + pageSize).toString() } as any);
          } else {
            setLastDoc(null);
          }
        } else {
          // We're using real Firestore pagination
          const result = await menuService.getMenuItemsPaginated(
            pageSize,
            lastDoc
          );
          setMenuItems(prevItems => [...prevItems, ...result.items]);
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
        }
      }
    } catch (error) {
      console.error('Error loading more menu items:', error);
      toast.error("Erreur lors du chargement de plus d'articles");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const items = useMemo(() => {
    return menuItems.map(item => ({
      ...item,
      variantPrices: [
        ...(item.variantPrices || []),
        ...(item?.defaultVariantPrices || []),
      ],
    }));
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleQuickAmount = (amount: number) => {
    setAmountPaid(amount);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const orderData: Omit<Order, 'id'> = {
        items: cart,
        status: 'pending',
        total,
        customerName: customerInfo.name || `Table ${tableNumber}`,
        customerEmail: customerInfo.email || null,
        customerPhone: customerInfo.phone || '',
        diningOption: 'dine-in',
        tableNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentMethod: {
          name: 'Paiement à la caisse',
          id: 'Paiement à la caisse',
          active: true,
          createdAt: new Date().toDateString(),
          updatedAt: new Date().toDateString(),
        },
        subtotal,
        taxes,
        taxTotal,
        amountPaid,
        change: amountPaid - total,
        tip,
        servedBy: staffData?.name || 'Le gérant',
        delivery: null,
      };

      const orderId = await orderService.createOrder({
        ...orderData,
        taxRates: settings?.taxes.rates || [],
      });
      const createdOrder = await orderService.getOrderById(orderId);

      if (createdOrder) {
        setCompletedOrder(createdOrder);
        clearCart();
        setTableNumber('');
        setAmountPaid(0);
        setCustomerInfo({});
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erreur lors de la création de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Main container */}
      <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
        {/* Left side - menu area */}
        <div className="flex-1 flex flex-col">
          {/* Category filters at top */}
          <div>
            <MenuFilters
              activeCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Menu grid - without internal scrolling */}
          <div>
            <POSMenuGrid
              items={filteredItems}
              onAddToCart={addToCart}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onToggleCart={() => setIsSidebarOpen(true)}
              isLoading={isLoading}
            />

            {/* Load More Button */}
            {!isLoading && hasMore && !searchTerm && (
              <div className="flex justify-center mt-6 mb-6">
                <Button
                  onClick={loadMoreItems}
                  disabled={isLoadingMore}
                  className="px-6 py-2 shadow-md"
                  size="lg"
                >
                  {isLoadingMore ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5 mr-2" />
                  )}
                  {isLoadingMore ? 'Chargement...' : 'Charger plus'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart (Drawer) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Overlay background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />

              {/* Cart sidebar/drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl z-50 lg:hidden"
              >
                <POSCartSidebar
                  onClose={() => setIsSidebarOpen(false)}
                  cart={cart}
                  tableNumber={tableNumber}
                  setTableNumber={setTableNumber}
                  customerInfo={customerInfo}
                  setCustomerInfo={setCustomerInfo}
                  amountPaid={amountPaid}
                  setAmountPaid={setAmountPaid}
                  total={total}
                  onUpdateQuantity={updateQuantity}
                  onQuickAmount={handleQuickAmount}
                  onCheckout={handleCheckout}
                  isSubmitting={isSubmitting}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Cart */}
        <div className="hidden lg:block w-96 bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col">
          <POSCartSidebar
            cart={cart}
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            amountPaid={amountPaid}
            setAmountPaid={setAmountPaid}
            total={total}
            onUpdateQuantity={updateQuantity}
            onQuickAmount={handleQuickAmount}
            onCheckout={handleCheckout}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {completedOrder && (
        <OrderConfirmationModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </>
  );
}

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
import { RefreshCw, Search, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { OrderList } from '../../../components/orders/OrderList';
import { useOrders } from '../../../context/OrderContext';
import { Modal } from '../../../components/ui/Modal';
import { useOrdersRealtime } from '../../../hooks/useOrdersRealtime';

export function POS() {
  const { t } = useTranslation();
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
  const { orders } = useOrdersRealtime();

  const {
    isLoading: isLoadingOrders,
    isLoadingMore: isLoadingMoreOrders,
    hasMore: hasMoreOrders,
    loadMoreOrders,
    searchOrders,
  } = useOrders();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isUpdatedOrder] = useState<boolean>(true);
  const [order, setOrder] = useState<any>(null);
  const [itemsToOrder, setItemsToOrder] = useState<any[]>([]);
  const [isAddItemsToOrder, setIsAddItemsToOrder] = useState<any>(false);
  const [isItemOrderFromOrder, setIsItemOrderFromOrder] = useState<any>(false);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(12);

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

  useEffect(() => {
    loadInitialItems();
  }, [selectedCategory]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        performSearch(searchTerm);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  useEffect(() => {
    if (order) {
      setItemsToOrder(order.items);
    }
  }, [order]);

  useEffect(() => {
    if (activeTab === 'products') {
      clearCart();
      setCustomerInfo({});
      setTableNumber('');
      setOrder(null);
      setItemsToOrder([]);
      setAmountPaid(0);
    }
  }, [activeTab]);

  const loadInitialItems = async () => {
    try {
      setIsLoading(true);
      setLastDoc(null);

      if (selectedCategory !== 'all') {
        try {
          const categoryItems = await menuService.getMenuItemsByCategory(
            selectedCategory
          );

          setMenuItems(categoryItems.slice(0, pageSize));
          setHasMore(categoryItems.length > pageSize);

          if (categoryItems.length > pageSize) {
            setLastDoc({ id: pageSize.toString() } as any);
          } else {
            setLastDoc(null);
          }
        } catch (error) {
          console.error('Error loading category items:', error);
          toast.error(t('common:error-loading-category-items'));
        }
      } else {
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
          const allItems = await menuService.getAll();
          setMenuItems(allItems.slice(0, pageSize));
          setHasMore(allItems.length > pageSize);

          if (allItems.length > pageSize) {
            setLastDoc({ id: pageSize.toString() } as any);
          } else {
            setLastDoc(null);
          }
        }
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error(t('common:error-loading-menu-items'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreItems = async () => {
    if (!hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);

      if (selectedCategory !== 'all') {
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

        if (currentLength + pageSize < allCategoryItems.length) {
          setLastDoc({ id: (currentLength + pageSize).toString() } as any);
        } else {
          setLastDoc(null);
        }
      } else {
        if (typeof lastDoc?.id === 'string' && !isNaN(parseInt(lastDoc.id))) {
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
      toast.error(t('common:error-loading-more-menu-items'));
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
      toast.error(t('common:error-creating-order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const performSearch = async (term: string) => {
    if (term.trim().length < 2) return;

    setSearchLoading(true);
    setIsSearching(true);

    try {
      const results = await searchOrders(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching orders:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchResults([]);
  };

  return (
    <>
      <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col">
          <div>
            <MenuFilters
              activeCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
          <div className="flex border-b dark:border-gray-700 mt-5">
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === 'products'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => {
                clearCart();
                setCustomerInfo({});
                setTableNumber('');
                setOrder(null);
                setItemsToOrder([]);
                setAmountPaid(0);
                setActiveTab('products');
              }}
            >
              {t('common:product-list')}
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => {
                clearCart();
                setCustomerInfo({});
                setTableNumber('');
                setOrder(null);
                setItemsToOrder([]);
                setActiveTab('orders');
                setIsItemOrderFromOrder(true);
              }}
            >
              {t('common:order-list')}
            </button>
          </div>

          <div>
            {activeTab === 'products' && (
              <>
                <POSMenuGrid
                  items={filteredItems}
                  onAddToCart={addToCart}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onToggleCart={() => setIsSidebarOpen(true)}
                  isLoading={isLoading}
                />

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
                      {isLoadingMore
                        ? t('common:loading')
                        : t('common:load-more')}
                    </Button>
                  </div>
                )}
              </>
            )}
            {activeTab === 'orders' && (
              <div className="mt-5">
                <div className="flex flex-col items-start gap-2 mt-3 mb-3">
                  <div className="flex items-center relative flex-1 w-full">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder={t('order:search-orders')}
                        className="w-full pl-12 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-700 
                      bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      shadow-sm hover:shadow-md transition-shadow"
                      />
                      {searchTerm && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div>
                      <button
                        className="flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title={t('common:refresh')}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {isSearching && (
                    <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                      {searchLoading ? (
                        <span className="flex items-center">
                          <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                          {t('order:searching')}
                        </span>
                      ) : (
                        <span>
                          {t('common:search-results', {
                            count: searchResults.length,
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className=" overflow-scroll h-[calc(100vh-6rem)]">
                  <OrderList
                    orders={
                      isSearching
                        ? searchResults
                        : orders.filter(
                            o =>
                              o.status === 'pending' || o.status === 'preparing'
                          )
                    }
                    isLoading={
                      (isLoading || isLoadingOrders) && orders.length === 0
                    }
                    isUpdatedOrder={isUpdatedOrder}
                    setOrder={setOrder}
                  />
                  {hasMoreOrders && !isLoadingMoreOrders && !isLoadingMore && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={loadMoreOrders}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30
                      text-blue-600 dark:text-blue-400 rounded-lg transition-colors font-medium"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {t('common:load-more')}
                      </button>
                    </div>
                  )}

                  {isLoadingMoreOrders && (
                    <div className="flex justify-center mt-6">
                      <div className="animate-spin text-blue-500">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />

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
                  order={order}
                  itemsToOrder={itemsToOrder}
                  setIsAddItemsToOrder={setIsAddItemsToOrder}
                  isItemOrderFromOrder={isItemOrderFromOrder}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
            order={order}
            itemsToOrder={itemsToOrder}
            setIsAddItemsToOrder={setIsAddItemsToOrder}
            isItemOrderFromOrder={isItemOrderFromOrder}
          />
        </div>
      </div>

      {completedOrder && (
        <OrderConfirmationModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}

      <Modal
        isOpen={isAddItemsToOrder}
        onClose={() => setIsAddItemsToOrder(false)}
      >
        <>
          <POSMenuGrid
            items={filteredItems}
            onAddToCart={addToCart}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onToggleCart={() => setIsSidebarOpen(true)}
            isLoading={isLoading}
            setItemsToOrder={setItemsToOrder}
            itemsToOrder={itemsToOrder}
            isItemOrderFromOrder={isItemOrderFromOrder}
          />

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
                {isLoadingMore ? t('common:loading') : t('common:load-more')}
              </Button>
            </div>
          )}
        </>
      </Modal>
    </>
  );
}

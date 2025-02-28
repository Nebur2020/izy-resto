import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Plus, Minus, ShoppingBag, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { MenuItem, MenuItemWithVariants } from '../../types/menu';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { useVariants } from '../../hooks/useVariants';
import UnselectedRequiredVariantType from './UnselectedRequiredVariantType';
import { useTranslation } from 'react-i18next';
import { variantService } from '../../services';
import { Variant } from '../../types';

interface IProductDetailsModalProps {
  item: MenuItemWithVariants | null;
  onClose: () => void;
  onAddToCart?: (item: MenuItem & { quantity: number }) => void;
  addProductToCartBgColor?: string;
  stockAvailableBgColor?: string;
  priceStyle?: string;
}

export function ProductDetailsModal(props: IProductDetailsModalProps) {
  const {
    item,
    onClose,
    onAddToCart,
    addProductToCartBgColor = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-300',
    stockAvailableBgColor = 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    priceStyle = 'text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400',
  } = props;

  const [fullPrice, setFullPrice] = useState(item?.price || 0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [selectedVariantTypes, setSelectedVariantTypes] = useState<
    Record<string, boolean>
  >({});
  const [variantCombinationError, setVariantCombinationError] = useState('');
  const [unselectedRequiredVariantType, setUnselectedRequiredVariantType] =
    useState<string[]>([]);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [categoryVariants, setCategoryVariants] = useState<Variant[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);
  const { addToCart, cart } = useCart();
  const { settings } = useSettings();
  const { variants } = useVariants();
  const { t } = useTranslation(['menu', 'cart']);

  if (!item) return null;

  const isOutOfStock = item.stockQuantity === 0;
  const itemWithVariants = item as MenuItemWithVariants;

  const variantTypes = useMemo(() => {
    return (
      itemWithVariants.variantPrices?.reduce((acc, vp) => {
        vp.variantCombination.forEach(combo => {
          const [type, value] = combo.split(': ');
          if (!acc[type]) {
            acc[type] = new Set();
          }
          acc[type].add(value);
        });
        return acc;
      }, {} as Record<string, Set<string>>) || {}
    );
  }, [itemWithVariants.variantPrices]);

  const getVariantId = useCallback(() => {
    if (!selectedVariants.length) return item.id;
    return `${item.id}-${selectedVariants.sort().join('-')}`;
  }, [item.id, selectedVariants]);

  const getVariantImage = useCallback(() => {
    if (!itemWithVariants.variantPrices?.length) return item.image;

    const variantPrice = itemWithVariants.variantPrices.find(
      vp =>
        JSON.stringify(vp.variantCombination.sort()) ===
        JSON.stringify(selectedVariants.sort())
    );

    return variantPrice?.image || item.image;
  }, [item.image, itemWithVariants.variantPrices, selectedVariants]);

  const getVariantValues = useCallback(() => {
    return selectedVariants
      .map(v => v.split(': ')[1])
      .filter(value => value && value.length > 0)
      .join(' ');
  }, [selectedVariants]);

  const areAllRequiredVariantsSelected = useCallback(() => {
    return categoryVariants
      .filter(variant => variant.isRequired)
      .every(variant => {
        return selectedVariants.some(selected =>
          selected.startsWith(`${variant.name}: `)
        );
      });
  }, [categoryVariants, selectedVariants]);

  const getCartItem = useCallback(() => {
    const variantId = getVariantId();
    return cart.find(item => item.id === variantId);
  }, [cart, getVariantId]);

  useEffect(() => {
    if (item && item.categoryId) {
      const loadCategoryVariants = async () => {
        try {
          const allVariants = await variantService.getAllVariantsByCategory(
            item.categoryId
          );
          setCategoryVariants(allVariants);
        } catch (error) {
          console.error('Error loading category variants:', error);
        }
      };

      loadCategoryVariants();
    }
  }, [item?.categoryId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  useEffect(() => {
    const updatePrice = async () => {
      if (!selectedVariants.length) {
        setFullPrice(item.price);
        setIsLoadingPrice(false);
        return;
      }

      try {
        setIsLoadingPrice(true);

        if (item.variantPrices && item.variantPrices.length > 0) {
          const sorted = selectedVariants.sort();
          const filtered = item.variantPrices.filter(
            vp => vp.variantCombination.length === sorted.length
          );

          const exists = filtered.find(
            vp =>
              JSON.stringify(vp.variantCombination) === JSON.stringify(sorted)
          );

          if (exists) {
            setFullPrice(exists.price);
            setIsLoadingPrice(false);
            return;
          }
        }

        if (categoryVariants.length > 0) {
          const selectedVariantMap = selectedVariants.reduce((acc, curr) => {
            const [name, value] = curr.split(': ');
            acc[name] = value;
            return acc;
          }, {} as Record<string, string>);

          let calculatedPrice = item.price;

          categoryVariants.forEach(variant => {
            const selectedValue = selectedVariantMap[variant.name];
            if (selectedValue && variant.prices) {
              const valueIndex = variant.values.findIndex(
                v => v === selectedValue
              );
              if (
                valueIndex >= 0 &&
                variant.prices[valueIndex] !== undefined &&
                !isNaN(variant.prices[valueIndex]) &&
                typeof variant.prices[valueIndex] === 'number'
              ) {
                calculatedPrice += variant.prices[valueIndex];
              }
            }
          });

          setFullPrice(calculatedPrice);
        } else {
          setFullPrice(item.price);
        }
      } catch (error) {
        console.error('Error updating price:', error);
        setFullPrice(item.price);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    updatePrice();
  }, [selectedVariants, item.price, item.variantPrices, categoryVariants]);

  const handleVariantSelect = useCallback(
    (variant: string) => {
      const [type, value] = variant.split(': ');

      setUnselectedRequiredVariantType([]);
      setVariantCombinationError('');
      setIsLoadingPrice(true);

      setSelectedVariants(prev => {
        if (prev.includes(variant)) {
          const updatedSelection = prev.filter(v => v !== variant);
          const hasOtherOfSameType = updatedSelection.some(v =>
            v.startsWith(`${type}: `)
          );

          setSelectedVariantTypes(current => ({
            ...current,
            [type]: hasOtherOfSameType,
          }));

          return updatedSelection;
        }

        const filtered = prev.filter(v => !v.startsWith(`${type}: `));
        const updatedSelection = [...filtered, variant];

        setSelectedVariantTypes(current => ({
          ...current,
          [type]: true,
        }));

        return updatedSelection;
      });
    },
    [itemWithVariants.variantPrices]
  );

  const handleAddToCart = useCallback(async () => {
    if (isOutOfStock) return;

    setIsLoadingPrice(true);
    setUnselectedRequiredVariantType([]);

    const requiredVariantTypes = variants
      .filter(v =>
        Object.keys(variantTypes)
          .map(vt => vt.toLowerCase())
          .includes(v.name.toLowerCase())
      )
      .filter(v => Boolean(v.isRequired))
      .map(v => v.name);

    const unselectedVariants: string[] = requiredVariantTypes.filter(
      type => !selectedVariantTypes[type]
    );

    setUnselectedRequiredVariantType(unselectedVariants);

    if (unselectedVariants.length > 0) {
      setIsLoadingPrice(false);
      return;
    }

    try {
      const productName = getVariantValues()
        ? `${item.name} ${getVariantValues()}`
        : item.name;

      const variantId = getVariantId();

      const cartItem = {
        ...item,
        id: variantId,
        name: productName,
        price: fullPrice,
        image: getVariantImage(),
        selectedVariants,
        quantity,
      };

      if (onAddToCart) {
        onAddToCart(cartItem);
      } else {
        addToCart(cartItem);
      }
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  }, [
    isOutOfStock,
    variants,
    variantTypes,
    selectedVariantTypes,
    getVariantValues,
    item,
    getVariantId,
    fullPrice,
    getVariantImage,
    selectedVariants,
    quantity,
    onAddToCart,
    addToCart,
    onClose,
  ]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-300 transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="h-48 sm:h-64 w-full overflow-hidden">
          <motion.img
            key={getVariantImage()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={getVariantImage()}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t(item.name)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t(item.description)}
              </p>
            </div>

            <div
              className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg ${
                isOutOfStock
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : item.stockQuantity <= 5
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : stockAvailableBgColor
              }`}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-[10px] sm:text-xs font-medium">
                {isOutOfStock
                  ? `${t('out-of-stock')}`
                  : `${item.stockQuantity} ${t('in-stock')}`}
              </span>
            </div>

            {categoryVariants
              .sort((a, b) => {
                if (a.name < b.name) {
                  return -1;
                }
                if (a.name > b.name) {
                  return 1;
                }
                return 0;
              })
              .map(variant => {
                if (!variant.values.length) {
                  return null;
                }

                const isRequired = !!variant.isRequired;
                const isSelected = selectedVariantTypes[variant.name];

                return (
                  <div key={variant.id} className="relative">
                    <div className="flex items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {variant.name}
                      </h3>

                      {isRequired && (
                        <div className="ml-2">
                          {isSelected ? (
                            <div
                              className="h-2 w-2 rounded-full bg-green-500"
                              title="Selected"
                            />
                          ) : (
                            <div
                              className="h-2 w-2 rounded-full bg-red-500"
                              title="Required but not selected"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {variant.values.map((value, index) => {
                        if (!value.length) return null;

                        const variantString = `${variant.name}: ${value}`;
                        const isSelected =
                          selectedVariants.includes(variantString);

                        return (
                          <button
                            key={`${variant.id}-${value}`}
                            onClick={() => handleVariantSelect(variantString)}
                            className={`
                            px-3 py-1.5 rounded-full text-xs font-medium 
                            transition-all duration-300 ease-in-out
                            ${
                              isSelected
                                ? 'bg-blue-600 text-white scale-105 shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 hover:scale-105'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                            disabled={isOutOfStock}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            {getCartItem() && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 sm:p-2.5 rounded-lg text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-medium text-center">
                {t('already-in-cart')}: {getCartItem()?.quantity}{' '}
                {(getCartItem()?.quantity || 0) > 1 ? t('units') : t('unit')}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between pb-5">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={isOutOfStock}
                className="h-8 w-8 rounded-full p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setQuantity(q => Math.min(item.stockQuantity, q + 1))
                }
                disabled={isOutOfStock || quantity >= item.stockQuantity}
                className="h-8 w-8 rounded-full p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className={`${priceStyle} flex items-center`}>
              {isLoadingPrice ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {formatCurrency(fullPrice * quantity, settings?.currency)}
            </div>
          </div>

          {unselectedRequiredVariantType.length > 0 && (
            <UnselectedRequiredVariantType
              unselectedRequiredVariantType={unselectedRequiredVariantType}
            />
          )}

          <Button
            onClick={handleAddToCart}
            disabled={
              isOutOfStock ||
              isLoadingPrice ||
              !areAllRequiredVariantsSelected()
            }
            className={`${addProductToCartBgColor} w-full rounded-full py-2 sm:py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-700`}
          >
            {isLoadingPrice ? (
              <Loader className="h-5 w-5 animate-spin mr-1" />
            ) : (
              <ShoppingBag className="h-5 w-5 mr-1" />
            )}
            {isOutOfStock
              ? t('out-of-stock')
              : isLoadingPrice
              ? t('loading')
              : !areAllRequiredVariantsSelected()
              ? t('select-required-variants')
              : t('add-to-cart')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

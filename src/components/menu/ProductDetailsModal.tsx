import { useState, useRef, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MenuItem, MenuItemWithVariants } from '../../types/menu';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { useVariants } from '../../hooks/useVariants';
import VariantCombinationError from './VariantCombinationError';
import UnselectedRequiredVariantType from './UnselectedRequiredVariantType';
import { useTranslation } from 'react-i18next';

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
    addProductToCartBgColor = 'bg-blue-600 text-white  hover:bg-blue-700  focus:ring-2 focus:ring-blue-300',
    stockAvailableBgColor = 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    priceStyle = 'text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400',
  } = props;
  const modalRef = useRef<HTMLDivElement>(null);
  const { addToCart, cart } = useCart();
  const { settings } = useSettings();
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [unselectedRequiredVariantType, setUnselectedRequiredVariantType] =
    useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [variantCombinationError, setVariantCombinationError] = useState('');
  const { variants } = useVariants();

  const { t } = useTranslation(['menu', 'cart']);

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

  if (!item) return null;

  const itemWithVariants = item as MenuItemWithVariants;
  const isOutOfStock = item.stockQuantity === 0;

  const getVariantPrice = () => {
    if (!itemWithVariants.variantPrices?.length) return item.price;

    const variantPrice = itemWithVariants.variantPrices.find(
      vp =>
        JSON.stringify(vp.variantCombination.sort()) ===
        JSON.stringify(selectedVariants.sort())
    );

    return variantPrice?.price || item.price;
  };

  const getVariantImage = () => {
    if (!itemWithVariants.variantPrices?.length) return item.image;

    const variantPrice = itemWithVariants.variantPrices.find(
      vp =>
        JSON.stringify(vp.variantCombination.sort()) ===
        JSON.stringify(selectedVariants.sort())
    );

    return variantPrice?.image || item.image;
  };

  const getVariantId = () => {
    if (!selectedVariants.length) return item.id;
    return `${item.id}-${selectedVariants.sort().join('-')}`;
  };

  const variantTypes = itemWithVariants.variantPrices?.reduce((acc, vp) => {
    vp.variantCombination.forEach(combo => {
      const [type, value] = combo.split(': ');
      if (!acc[type]) {
        acc[type] = new Set();
      }
      acc[type].add(value);
    });
    return acc;
  }, {} as Record<string, Set<string>>);

  const handleVariantSelect = (variant: string) => {
    const [type] = variant.split(': ');

    setUnselectedRequiredVariantType([]);

    setVariantCombinationError('');

    setSelectedVariants(prev => {
      if (prev.includes(variant)) {
        return prev.filter(v => v !== variant);
      }

      const filtered = prev.filter(v => !v.startsWith(`${type}: `));

      const updatedSelection = [...filtered, variant];

      const validSelection = updatedSelection.filter(() => {
        return item.variantPrices.some(({ variantCombination }) =>
          updatedSelection.every(v => variantCombination.includes(v))
        );
      });

      if (validSelection.length < 1) {
        setVariantCombinationError('Combinaison inexistante...');
      }

      return validSelection;
    });
  };

  const getVariantValues = () => {
    return selectedVariants
      .map(v => v.split(': ')[1])
      .filter(value => value && value.length > 0)
      .join(' ');
  };

  const getCartItem = () => {
    const variantId = getVariantId();
    return cart.find(item => item.id === variantId);
  };

  const isVariantRequired = (type: string) => {
    return !!variants.find(v => v.name.toLowerCase() === type.toLowerCase())
      ?.isRequired;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setUnselectedRequiredVariantType([]);
    const requiredVariants = variants
      .filter(v =>
        Object.keys(variantTypes)
          .map(v => v.toLowerCase())
          .includes(v.name.toLowerCase())
      )
      .filter(v => Boolean(v.isRequired));

    const unselectedVariants: string[] = requiredVariants
      .filter(
        v =>
          !selectedVariants
            .map(v1 => v1.toLowerCase())
            .some(v2 => v2.includes(v.name.toLowerCase()))
      )
      .map(v => v.name);

    setUnselectedRequiredVariantType(unselectedVariants);

    if (unselectedVariants.length > 0) return;

    const variantValues = getVariantValues();
    const productName = variantValues
      ? `${item.name} ${variantValues}`
      : item.name;
    const variantId = getVariantId();

    const cartItem = {
      ...item,
      id: variantId,
      name: productName,
      price: getVariantPrice(),
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
  };

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
            {variantTypes &&
              Object.entries(variantTypes).map(([type, values]) => {
                if (!values.size || Array.from(values).every(v => !v.length)) {
                  return null;
                }

                return (
                  <div key={type}>
                    <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                      {type} {isVariantRequired(type) ? '*' : ''}
                    </h3>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {Array.from(values).map(value => {
                        if (!value.length) return null;

                        const variantString = `${type}: ${value}`;

                        const isSelected =
                          selectedVariants.includes(variantString);

                        return (
                          <button
                            key={value}
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
            <div className={`${priceStyle}`}>
              {formatCurrency(getVariantPrice() * quantity, settings?.currency)}
            </div>
          </div>

          {variantCombinationError && (
            <VariantCombinationError
              variantCombinationError={variantCombinationError}
            />
          )}
          {unselectedRequiredVariantType.length > 0 && (
            <UnselectedRequiredVariantType
              unselectedRequiredVariantType={unselectedRequiredVariantType}
            />
          )}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`${addProductToCartBgColor} w-full rounded-full py-2 sm:py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-700`}
          >
            <ShoppingBag className="h-5 w-5 mr-1" />
            {isOutOfStock ? t('out-of-stock') : t('add-to-cart')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

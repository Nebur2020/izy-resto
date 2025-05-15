import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProductDetailsModal } from '../../../components/menu/ProductDetailsModal';
import { MenuItemWithVariants } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { useSettings } from '../../../hooks';
import { useTranslation } from 'react-i18next';

interface ItemCardProps {
  item: MenuItemWithVariants;
  primaryColor?: string;
  isDarkMode?: boolean;
}

export default function ItemCard({
  item,
  primaryColor,
  isDarkMode,
}: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isOutOfStock = item.stockQuantity === 0;
  const { settings } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };
  const maxLength = 30;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <>
      <motion.div
        className={`relative w-[300px] rounded-lg overflow-hidden ${
          isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'
        } shadow-md`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative h-[200px] overflow-hidden">
          <motion.img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />

          <AnimatePresence>
            {isHovered && !isOutOfStock && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-[40%] left-[30%] transform -translate-x-1/2 px-6 py-2 rounded-full font-medium"
                style={{
                  backgroundColor: primaryColor,
                  color: 'white',
                }}
                onClick={e => {
                  !isOutOfStock && setShowModal(true);
                }}
              >
                {t('foodtheme:add-to-cart')}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div
          className={`p-4 ${
            isDarkMode ? 'text-white' : 'text-black'
          } max-h-[150px]`}
        >
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-sm mt-1 text-gray-500">
            {truncateText(item.description, maxLength)}
          </p>
          <div className="flex justify-between items-center mt-3">
            <span className="font-bold" style={{ color: primaryColor }}>
              {formatCurrency(item.price, settings?.currency)}
            </span>
            {!isOutOfStock && (
              <span className="text-xs text-gray-500">
                {item.stockQuantity} {t('foodtheme:in-stock')}
              </span>
            )}
          </div>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span
              className="px-4 py-2 rounded-md text-sm font-bold transform rotate-[-15deg]"
              style={{
                backgroundColor: primaryColor || '#f44336',
                color: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {t('foodtheme:out-of-stock')}
            </span>
          </div>
        )}
      </motion.div>

      {showModal && (
        <ProductDetailsModal
          primaryColor={primaryColor}
          isDarkMode={isDarkMode}
          item={item}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

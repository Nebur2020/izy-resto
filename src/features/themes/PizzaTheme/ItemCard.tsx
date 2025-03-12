import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductDetailsModal } from '../../../components/menu/ProductDetailsModal';
import { useTranslation } from 'react-i18next';
import { MenuItemWithVariants } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { useSettings } from '../../../hooks';

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
  const { t } = useTranslation('pizzatheme');
  const [showModal, setShowModal] = useState(false);
  const { settings } = useSettings();

  const isOutOfStock = item.stockQuantity === 0;

  const cardPrimaryColor = primaryColor || '#fcb302';

  const cardClassName = isDarkMode
    ? 'bg-[#1A1A1A] text-white'
    : 'bg-black text-white';

  const titleClassName = isDarkMode ? 'text-gray-100' : 'text-white';

  const descriptionClassName = isDarkMode ? 'text-gray-300' : 'text-white';

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const imageVariants = {
    hover: { scale: 1.1, transition: { duration: 0.3 } },
  };

  return (
    <>
      <motion.div
        className={`flex flex-col items-center w-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative ${
          isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${cardClassName}`}
        role="button"
        onClick={() => !isOutOfStock && setShowModal(true)}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <motion.div
          className="relative w-full h-[300px] lg:h-[300px]"
          whileHover="hover"
        >
          <motion.img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            variants={imageVariants}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          {!isOutOfStock && (
            <div className="absolute top-4 right-4 z-10">
              <span
                className="px-3 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: cardPrimaryColor,
                  color: 'white',
                }}
              >
                {item.stockQuantity} {t('common:in-stock')}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 p-6 text-white w-full">
            <h1 className={`text-2xl font-bold ${titleClassName}`}>
              {item.name}
            </h1>
            <p
              className={`mt-2 text-md text-ellipsis truncate ${descriptionClassName}`}
            >
              {item.description}
            </p>
            <p
              className={`text-xl font-bold mt-4`}
              style={{ color: cardPrimaryColor }}
            >
              {formatCurrency(item.price, settings?.currency)}
            </p>
          </div>
        </motion.div>
        {isOutOfStock && (
          <div
            className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-xl`}
          >
            <span
              className="px-4 py-2 rounded-md text-lg font-bold bg-opacity-80 bg-white dark:bg-[#1A1A1A]"
              style={{ color: cardPrimaryColor }}
            >
              {t('menu:out-of-stock')}
            </span>
          </div>
        )}
      </motion.div>

      {showModal && (
        <ProductDetailsModal
          primaryColor={cardPrimaryColor}
          isDarkMode={isDarkMode}
          item={item}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

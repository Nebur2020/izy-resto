import { useState } from 'react';
import { motion } from 'framer-motion'; // Importez motion
import { ProductDetailsModal } from '../../../components/menu/ProductDetailsModal';
import { useTranslation } from 'react-i18next';
import { MenuItemWithVariants } from '../../../types';

interface IitemCradProps {
  item: MenuItemWithVariants;
}

export default function ItemCard(props: IitemCradProps) {
  const { t } = useTranslation('pizzatheme');
  const { item } = props;
  const [showModal, setShowModal] = useState(false);

  const isOutOfStock = item.stockQuantity === 0;

  console.log('item: ', item);

  // Définissez des animations
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const imageVariants = {
    hover: { scale: 1.1, transition: { duration: 0.3 } },
  };

  return (
    <>
      <motion.div
        className={`flex flex-col items-center w-full sm:w-[45%] md:w-[30%] lg:w-[20%] min-w-[250px] max-w-sm border border-gray-300 rounded-xl mx-3 mb-5 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative ${
          isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        role="button"
        onClick={() => !isOutOfStock && setShowModal(true)}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <motion.div className="relative w-full h-[250px]" whileHover="hover">
          <motion.img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover rounded-t-lg"
            variants={imageVariants}
          />
        </motion.div>
        <div className="flex flex-col items-start w-full px-5 py-4">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            {item.name}
          </h1>
          <div className="min-h-[200px]">
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {item.description}
            </p>
          </div>

          {!isOutOfStock && (
            <div className="mt-4 w-full flex justify-between items-center">
              <span className="text-xl font-semibold text-[#fcb302]">
                {item.price} €
              </span>
              <span className="text-sm text-gray-500 bg-[#f4ecdf] px-3 py-1 rounded-full">
                {item.stockQuantity} {t('common:in-stock')}
              </span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#fcb302] bg-opacity-60 flex items-center justify-center rounded-xl">
              <span className="text-red-500 text-lg font-bold">
                {t('menu:out-of-stock')}
              </span>
            </div>
          )}
        </div>
      </motion.div>
      {showModal && (
        <ProductDetailsModal
          addProductToCartBgColor="bg-yellow-500 text-white"
          stockAvailableBgColor="bg-[#f4ecdf] text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          priceStyle="text-[#fcb302]"
          item={item}
          onClose={() => setShowModal(false)}
          addToCartButtonStyle="!bg-[#fcb302] w-full rounded-full sm:py-2 text-xs sm:text-sm font-semibold flex items-center justify-center transition-all duration-300 ease-in-out disabled:bg-[#fcb302]disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-700"
          variantSelectStyles="!bg-[#fcb302] dark:bg-gray-800 dark:text-gray-200"
        />
      )}
    </>
  );
}

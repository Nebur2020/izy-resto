import { useState } from 'react';
import { ProductDetailsModal } from '../../../components/menu/ProductDetailsModal';

interface IitemCradProps {
  title: string;
  imageUrl: string;
  shortDescription: string;
  price: number;
  size: 'small' | 'medium' | 'large';
}

export default function ItemCard(props: IitemCradProps) {
  const { imageUrl, title, shortDescription, price } = props;
  const [showModal, setShowModal] = useState(false);

  console.log('showModal: ', showModal);

  const item = {
    id: '1',
    categoryId: '2',
    stockQuantity: 10,
    name: title,
    description: shortDescription,
    price,
    image: imageUrl,
    variantPrices: [],
  };

  return (
    <div
      className="flex flex-col items-center w-full sm:w-[45%] md:w-[30%] lg:w-[20%] min-w-[250px] max-w-sm border border-gray-300 rounded-xl mx-3 mb-5"
      role="button"
      onClick={() => setShowModal(true)}
    >
      <div className="relative w-[100%] h-[250px]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
      <div className="flex flex-col items-start my-5 sm:my-11 w-full px-5 sm:px-10">
        <h1 className="text-lg sm:text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm sm:text-base">{shortDescription}</p>
      </div>
      {showModal && (
        <ProductDetailsModal
          addProductToCartBgColor="bg-yellow-500 text-white"
          stockAvailableBgColor="bg-[#f4ecdf] text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          priceStyle="text-[#fcb302]"
          item={item}
          onClose={() =>  setShowModal(false)}
        />
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMenu } from '../../../hooks/useMenu';
import { GridMenuItem } from './GridMenuItem';
import { GridMenuCategories } from './GridMenuCategories';
import { SearchBar } from '../SearchBar';
import { RefreshCw } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

export function GridMenuSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { items: menuItems } = useMenu();

  const items = useMemo(() => {
    return menuItems.map(item => ({
      ...item,
      variantPrices: [
        ...(item.variantPrices || []),
        ...(item?.defaultVariantPrices || []),
      ],
    }));
  }, [menuItems]);

  // Filter items based on both category and search
  const filteredItems = items.filter(item => {
    const matchesCategory =
      activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get current items to display
  const currentItems = filteredItems.slice(0, visibleItems);

  // Determine if there are more items to load
  const hasMore = visibleItems < filteredItems.length;

  // Handle load more
  const handleLoadMore = () => {
    setIsLoadingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleItems(prev => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 500);
  };

  // Reset visible items when category or search changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleItems(ITEMS_PER_PAGE);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setVisibleItems(ITEMS_PER_PAGE);
  };

  return (
    <div className="space-y-12">
      <SearchBar onSearch={handleSearch} />

      <GridMenuCategories
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {currentItems.map(item => (
          <GridMenuItem key={item.id} item={item} />
        ))}
      </motion.div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Aucun produit trouvé
          </p>
        </div>
      ) : (
        hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 
                      dark:bg-blue-900/20 dark:hover:bg-blue-800/30
                      text-blue-600 dark:text-blue-400 rounded-lg 
                      transition-colors font-medium disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Voir plus de produits
                </>
              )}
            </button>
          </div>
        )
      )}
    </div>
  );
}

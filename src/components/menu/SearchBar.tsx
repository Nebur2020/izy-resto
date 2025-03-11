import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (term: string) => void;
  palette?: {
    primary: string;
    secondary: string;
  };
  isDarkMode: boolean;
}

export function SearchBar({
  onSearch,
  palette = {
    primary: '#2563EB',
    secondary: '#4D48E5',
  },
  isDarkMode,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const { t } = useTranslation('menu');

  // Use primary color for focus ring and icon
  const primaryColor = palette.primary;

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
          style={{ color: primaryColor }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={t('search-items')}
          className="w-full pl-12 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-700 
                   bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                   focus:outline-none focus:ring-2
                   shadow-sm hover:shadow-md transition-shadow"
          style={
            {
              '--tw-ring-color': primaryColor,
            } as React.CSSProperties
          }
        />
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, translateY: '-50%' }}
              animate={{ opacity: 1, scale: 1, translateY: '-50%' }}
              exit={{ opacity: 0, scale: 0.5, translateY: '-50%' }}
              onClick={clearSearch}
              className="absolute right-4 top-[50%] -translate-y-[50%] p-1 rounded-full 
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

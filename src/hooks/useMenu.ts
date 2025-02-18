import { useState, useEffect, useCallback } from 'react';
import { MenuFilters, MenuItemWithVariants } from '../types';
import { menuService } from '../services/menu/menu.service';
import { QueryDocumentSnapshot } from 'firebase/firestore';

interface PageData {
  items: MenuItemWithVariants[];
  lastDoc: QueryDocumentSnapshot | null;
}

interface PaginationCache {
  [key: string]: {
    pages: PageData[];
    currentPage: number;
  };
}

export function useMenu(categoryId: string = 'all', pageSize: number = 10) {
  const [items, setItems] = useState<MenuItemWithVariants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cache] = useState<PaginationCache>({});
  const [currentPage, setCurrentPage] = useState(0);

  // Generate cache key based on filters
  const getCacheKey = useCallback(() => {
    return `${categoryId}_${pageSize}`;
  }, [categoryId, pageSize]);

  // Load specific page
  const loadPage = useCallback(
    async (pageIndex: number) => {
      setError(null);
      const cacheKey = getCacheKey();
      const filters: MenuFilters | undefined =
        categoryId && categoryId !== 'all'
          ? { category: categoryId }
          : undefined;

      try {
        setIsLoading(true);

        // Check if page exists in cache
        if (cache[cacheKey]?.pages[pageIndex]) {
          const cachedPage = cache[cacheKey].pages[pageIndex];
          setItems(cachedPage.items);
          setHasMore(!!cachedPage.lastDoc);
          cache[cacheKey].currentPage = pageIndex;
          return;
        }

        // Get the last document from previous page in cache
        const lastDoc =
          pageIndex > 0 ? cache[cacheKey]?.pages[pageIndex - 1]?.lastDoc : null;

        const response = await menuService.getMenuItems(filters, {
          pageSize,
          lastDoc: lastDoc || undefined,
        });

        const newPageData: PageData = {
          items: response.items,
          lastDoc: response.lastDoc,
        };

        // Initialize cache entry if it doesn't exist
        if (!cache[cacheKey]) {
          cache[cacheKey] = {
            pages: [],
            currentPage: pageIndex,
          };
        }

        // Update cache
        cache[cacheKey].pages[pageIndex] = newPageData;
        cache[cacheKey].currentPage = pageIndex;

        setItems(response.items);
        setHasMore(response.hasMore);
      } catch (err) {
        console.error('Error loading menu items:', err);
        setError(err as Error);
        // Clear cache for this category on error
        delete cache[cacheKey];
      } finally {
        setIsLoading(false);
      }
    },
    [categoryId, pageSize, cache, getCacheKey]
  );

  // Initial load and category change handler
  useEffect(() => {
    setCurrentPage(0);
    // Clear cache when category changes
    const cacheKey = getCacheKey();
    if (cache[cacheKey]) {
      delete cache[cacheKey];
    }
    loadPage(0);
  }, [categoryId, pageSize, loadPage, getCacheKey]);

  // Navigation functions
  const nextPage = useCallback(async () => {
    if (!hasMore) return;
    const nextPageIndex = currentPage + 1;
    await loadPage(nextPageIndex);
    setCurrentPage(nextPageIndex);
  }, [currentPage, hasMore, loadPage]);

  const prevPage = useCallback(async () => {
    if (currentPage <= 0) return;
    const prevPageIndex = currentPage - 1;
    await loadPage(prevPageIndex);
    setCurrentPage(prevPageIndex);
  }, [currentPage, loadPage]);

  return {
    items,
    isLoading,
    error,
    hasMore,
    currentPage,
    nextPage,
    prevPage,
    loadPage,
    hasPrevPage: currentPage > 0,
    hasNextPage: hasMore,
    totalItems: items.length,
    pageSize,
  };
}

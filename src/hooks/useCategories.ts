import { useState, useEffect } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/categories/category.service';
import toast from 'react-hot-toast';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(10); // Default page size

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async (reset: boolean = true) => {
    try {
      setIsLoading(true);

      if (reset) {
        setCategories([]);
        setLastDoc(null);
      }

      const result = await categoryService.getCategoriesPaginated(
        pageSize,
        reset ? null : lastDoc
      );

      if (reset) {
        setCategories(result.items);
      } else {
        setCategories(prev => [...prev, ...result.items]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Echec de chargement des catégories');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreCategories = () => {
    loadCategories(false);
  };

  const searchCategories = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const searchResults = await categoryService.searchCategories(searchTerm);
      return searchResults;
    } catch (error) {
      console.error('Error searching categories:', error);
      toast.error('Echec de recherche des catégories');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const id = await categoryService.create(category);
      setCategories(prev => [...prev, { ...category, id }]);
      return id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      await categoryService.update(id, data);
      setCategories(prev =>
        prev.map(cat => (cat.id === id ? { ...cat, ...data } : cat))
      );
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return {
    categories,
    isLoading,
    hasMore,
    loadMoreCategories,
    searchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories,
  };
}

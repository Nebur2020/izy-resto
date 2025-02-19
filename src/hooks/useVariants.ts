import { useState, useEffect } from 'react';
import { Variant } from '../types/variant';
import { variantService } from '../services/variants/variant.service';
import toast from 'react-hot-toast';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export function useVariants(categoryId?: string) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(10); // Default page size

  useEffect(() => {
    // Reset pagination state when category changes
    setVariants([]);
    setLastDoc(null);
    setHasMore(false);

    if (categoryId) {
      loadVariantsByCategory(categoryId);
    } else {
      loadAllVariants();
    }
  }, [categoryId]);

  const loadAllVariants = async (reset: boolean = true) => {
    try {
      setIsLoading(true);

      if (reset) {
        setVariants([]);
        setLastDoc(null);
      }

      const result = await variantService.getAllVariantsPaginated(
        pageSize,
        reset ? null : lastDoc
      );

      if (reset) {
        setVariants(result.items);
      } else {
        setVariants(prev => [...prev, ...result.items]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Erreur chargement variants:', error);
      toast.error('Failed to load variants');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreVariants = () => {
    if (categoryId) {
      loadMoreVariantsByCategory(categoryId);
    } else {
      loadAllVariants(false);
    }
  };

  const loadVariantsByCategory = async (
    catId: string,
    reset: boolean = true
  ) => {
    try {
      setIsLoading(true);

      if (reset) {
        setVariants([]);
        setLastDoc(null);
      }

      const result = await variantService.getVariantsByCategory(
        catId,
        pageSize,
        reset ? null : lastDoc
      );

      if (reset) {
        setVariants(result.items);
      } else {
        setVariants(prev => [...prev, ...result.items]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Erreur chargement variants:', error);
      toast.error('Failed to load variants');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreVariantsByCategory = (catId: string) => {
    loadVariantsByCategory(catId, false);
  };

  const addVariant = async (variant: Omit<Variant, 'id'>) => {
    try {
      const id = await variantService.create(variant);
      setVariants(prev => [{ ...variant, id } as Variant, ...prev]);
      toast.success('Variante ajoutée avec succès');
      return id;
    } catch (error) {
      console.error('Erreur ajout variant:', error);
      toast.error("Impossible d'ajouter une variante");
      throw error;
    }
  };

  const updateVariant = async (id: string, data: Partial<Variant>) => {
    try {
      await variantService.update(id, data);
      setVariants(prev => prev.map(v => (v.id === id ? { ...v, ...data } : v)));
      toast.success('Variante mise à jour avec succès');
    } catch (error) {
      console.error('Echec mise à jour variant:', error);
      toast.error('Échec de la mise à jour de la variante');
      throw error;
    }
  };

  const deleteVariant = async (id: string) => {
    try {
      await variantService.delete(id);
      setVariants(prev => prev.filter(v => v.id !== id));
      toast.success('Variante supprimée avec succès');
    } catch (error) {
      console.error('Echec suppression variant:', error);
      toast.error('Impossible de supprimer la variante');
      throw error;
    }
  };

  const refreshVariants = () => {
    if (categoryId) {
      loadVariantsByCategory(categoryId);
    } else {
      loadAllVariants();
    }
  };

  return {
    variants,
    isLoading,
    hasMore,
    loadMoreVariants,
    addVariant,
    updateVariant,
    deleteVariant,
    refreshVariants,
  };
}

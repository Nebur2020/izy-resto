import { useState, useEffect } from 'react';
import { Variant } from '../types/variant';
import { variantService } from '../services/variants/variant.service';
import toast from 'react-hot-toast';

export function useVariants(categoryId?: string) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      loadVariantsByCategory(categoryId);
    } else {
      loadAllVariants();
    }
  }, [categoryId]);

  const loadAllVariants = async () => {
    try {
      setIsLoading(true);
      const data = await variantService.getAll();
      setVariants(data as any);
    } catch (error) {
      console.error('Erreur chargement variants:', error);
      toast.error('Failed to load variants');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVariantsByCategory = async (catId: string) => {
    try {
      setIsLoading(true);
      const data = await variantService.getVariantsByCategory(catId);
      setVariants(data);
    } catch (error) {
      console.error('Erreur chargement variants:', error);
      toast.error('Failed to load variants');
    } finally {
      setIsLoading(false);
    }
  };

  const addVariant = async (variant: Omit<Variant, 'id'>) => {
    try {
      const id = await variantService.create(variant);
      setVariants(prev => [...prev, { ...variant, id }]);
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

  return {
    variants,
    isLoading,
    addVariant,
    updateVariant,
    deleteVariant,
    refreshVariants: loadAllVariants,
  };
}

import { InventoryConnection } from './menu';

export interface Variant {
  id: string;
  name: string;
  type: string;
  prices?: number[];
  values: string[];
  categoryIds: string[];
  isRequired?: boolean;
  createdAt: string;
  updatedAt: string;
  inventory?: InventoryConnection[];
}

export interface VariantOption {
  variantId: string;
  value: string;
}

export interface MenuItemVariant {
  menuItemId: string;
  variants: VariantOption[];
}

export interface VariantCombination {
  id: string;
  values: string[];
  price: number;
  image?: string;
}

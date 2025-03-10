import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { VariantOption } from './variant';

export interface InventoryConnection {
  itemId: string;
  ratio: number; // How many menu items can be made from 1 inventory item
}

export interface PaginatedResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  stockQuantity: number;
  variants?: VariantOption[];
  inventoryConnections?: InventoryConnection[]; // Add inventory connections
}

export interface MenuFilters {
  category?: string;
  search?: string;
}

export interface MenuItemVariantPrice {
  variantCombination: string[];
  price: number;
  image?: string;
  stockQuantity?: number;
}

export interface MenuItemWithVariants extends MenuItem {
  variantPrices: MenuItemVariantPrice[];
  defaultVariantPrices: MenuItemVariantPrice[];
}

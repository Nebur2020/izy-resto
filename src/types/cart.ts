import { MenuItem } from './menu';

export interface CartItem extends MenuItem {
  options: any;
  specialInstructions: any;
  selectedVariants: any;
  quantity: number;
}

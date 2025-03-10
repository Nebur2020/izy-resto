import { PizzaThemeConfig } from '../pages/dashboard/pages/settings/theme/editor/pizza';
import { HeaderStyle, LandingTemplate } from './theme';

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  enabled: boolean;
  appliesTo: 'all' | string; // all items or specific categories
  order: number; // For controlling calculation order
}

export interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
}

export interface DeliverySettings {
  enabled: boolean;
  defaultZone?: string;
  zones: DeliveryZone[];
}

export interface SocialMediaProfile {
  platform:
    | 'facebook'
    | 'instagram'
    | 'twitter'
    | 'linkedin'
    | 'youtube'
    | 'tiktok'
    | 'whatsapp';
  url: string;
  active: boolean;
}

export type Currency =
  | 'USD'
  | 'EUR'
  | 'CAD'
  | 'MAD'
  | 'XOF'
  | 'XAF'
  | 'CDF'
  | 'UM';

export type Language = 'fr' | 'en' | (string & {});

export interface SEOSettings {
  title: string;
  favicon: string;
  description: string;
  keywords: string[];
  ogImage: string;
  twitterHandle: string;
  googleSiteVerification?: string;
}

export interface RestaurantSettings {
  name: string;
  description: string;
  email: string;
  logo: string;
  logoWidth?: number;
  logoHeight?: number;
  coverImage: string;
  currency: Currency;
  defaultTheme: 'light' | 'dark'; // Add defaultTheme
  hasOpeningHours: boolean;
  openingHours: {
    timezone: string; // Required timezone
  } & {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  address: string;
  phone: string;
  activeLanding: LandingTemplate;
  activeHeader: HeaderStyle;
  socialMedia: SocialMediaProfile[];
  seo: SEOSettings;
  canDeliver: boolean;
  canDineIn: boolean;
  paymentOnDineInActivated: boolean;
  rateLimits: {
    maxOrders: number;
    timeWindowHours: number;
  };
  termsOfService?: string;
  holidayClosure?: {
    enabled: boolean;
    startDate: string;
    endDate: string;
    reason?: string;
  };
  taxes: {
    enabled: boolean;
    includedInPrice: boolean;
    rates: TaxRate[];
  };
  tips: {
    enabled: boolean;
    defaultPercentages: string[];
    allowCustom: boolean;
    label: string;
  };
  staffPermissions: string[];
  delivery: DeliverySettings;
  language: Language;
  country: {
    dialCode: string;
    countryCode: string;
    name: string;
  };
  restaurantCharacteristics: string[];
  freeHomeDelivery: string;
  productListTitle: string;
  productListDescription: string;
  footerBannerTitle: string;
  productDiscount: number;
  freeDeliveryTitle: string;
  freeDeliveryDescription: string;
  activeTheme:
    | {
        key: 'pizza';
        configuration: PizzaThemeConfig;
      }
    | {
        key: string;
        configuration: Record<string, unknown>;
      };
}

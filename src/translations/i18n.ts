import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCart from './locales/en/cart.json';
import frCart from './locales/fr/cart.json';

import enCommon from './locales/en/common.json';
import frCommon from './locales/fr/common.json';

import enDashboardTranslation from './locales/en/dashboard.json';
import frDashboardTranslation from './locales/fr/dashboard.json';

import enFooter from './locales/en/footer.json';
import frFooter from './locales/fr/footer.json';

import enHero from './locales/en/hero.json';
import frHero from './locales/fr/hero.json';

import frMenu from './locales/fr/menu.json';
import enMenu from './locales/en/menu.json';

import enOrder from './locales/en/order.json';
import frOrder from './locales/fr/order.json';

import frTicket from './locales/fr/ticket.json';
import enTicket from './locales/en/ticket.json';

import frAnalyse from './locales/fr/analyse.json';
import enAnalyse from './locales/en/analyse.json';

import enCategory from './locales/en/category.json';
import frCategory from './locales/fr/category.json';

import enVariant from './locales/en/variant.json';
import frVariant from './locales/fr/variant.json';

import enInventory from './locales/en/inventory.json';
import frInventory from './locales/fr/inventory.json';

import enPyament from './locales/en/payment.json';
import frPayment from './locales/fr/payment.json';

import frComptability from './locales/fr/comptability.json';
import enComptability from './locales/en/comptability.json';

import enClient from './locales/en/client.json';
import frClient from './locales/fr/client.json';

import enQrCode from './locales/en/qr-code.json';
import frQrCode from './locales/fr/qr-code.json';

import enSetting from './locales/en/setting.json';
import frSetting from './locales/fr/setting.json';

import frSettingAppearence from './locales/fr/setting-appearence.json';
import enSettingAppearence from './locales/en/setting-appearence.json';

import frSettingBusiness from './locales/fr/setting-business.json';
import enSettingBusiness from './locales/en/setting-business.json';

import frTaxAndTips from './locales/fr/setting-tax-and-tips.json';
import enTaxAndTips from './locales/en/setting-tax-and-tips.json';

import frSettingDelivery from './locales/fr/setting-delivery.json';
import enSettingDelivery from './locales/en/setting-delivery.json';

import frSettingSeo from './locales/fr/setting-seo.json';
import enSettingSeo from './locales/en/setting-seo.json';

import frSettingLegal from './locales/fr/setting-legal.json';
import enSettingLegal from './locales/en/setting-legal.json';

import frSettingIntegration from './locales/fr/setting-integration.json';
import enSettingIntegration from './locales/en/setting-integration.json';

import frSettingData from './locales/fr/setting-data.json';
import enSettingData from './locales/en/setting-data.json';

import enPersonal from './locales/en/personal.json';
import frPersonal from './locales/fr/personal.json';

import frMedia from './locales/fr/media.json';
import enMedia from './locales/en/media.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      cart: enCart,
      common: enCommon,
      dashboard: enDashboardTranslation,
      menu: enMenu,
      footer: enFooter,
      hero: enHero,
      order: enOrder,
      ticket: enTicket,
      analyse: enAnalyse,
      category: enCategory,
      variant: enVariant,
      inventory: enInventory,
      payment: enPyament,
      comptability: enComptability,
      client: enClient,
      qrCode: enQrCode,
      setting: enSetting,
      settingAppearence: enSettingAppearence,
      settingBusiness: enSettingBusiness,
      taxAndTips: enTaxAndTips,
      settingDelivery: enSettingDelivery,
      settingSeo: enSettingSeo,
      settingLegal: enSettingLegal,
      settingIntegration: enSettingIntegration,
      settingData: enSettingData,
      personal: enPersonal,
      media: enMedia,
    },
    fr: {
      cart: frCart,
      common: frCommon,
      dashboard: frDashboardTranslation,
      menu: frMenu,
      footer: frFooter,
      hero: frHero,
      order: frOrder,
      ticket: frTicket,
      analyse: frAnalyse,
      category: frCategory,
      variant: frVariant,
      inventory: frInventory,
      payment: frPayment,
      comptability: frComptability,
      client: frClient,
      qrCode: frQrCode,
      setting: frSetting,
      settingAppearence: frSettingAppearence,
      settingBusiness: frSettingBusiness,
      taxAndTips: frTaxAndTips,
      settingDelivery: frSettingDelivery,
      settingSeo: frSettingSeo,
      settingLegal: frSettingLegal,
      settingIntegration: frSettingIntegration,
      settingData: frSettingData,
      personal: frPersonal,
      media: frMedia,
    },
  },
  fallbackLng: 'fr',
  saveMissing: true,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

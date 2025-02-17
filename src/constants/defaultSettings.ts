import { RestaurantSettings } from '../types/settings';

export const API_URI = window.location.hostname.includes('localhost')
  ? 'https://restaurants-project-backend-solitary-brook-2574.fly.dev/api/v1'
  : 'https://restaurants-project-backend-solitary-brook-2574.fly.dev/api/v1';

export const termsOfService = `
<h1>Conditions d'Utilisation</h1>

<p>Bienvenue sur le site web de notre restaurant. En accédant à ce site ou en utilisant nos services, vous acceptez les conditions d'utilisation suivantes :</p>

<h2>1. Généralités</h2>
<p>
    Ce site est exploité par [Nom du Restaurant]. Les termes "nous", "notre" et "nos" font référence à [Nom du Restaurant]. En utilisant ce site, vous acceptez nos conditions d'utilisation, y compris toutes les politiques mentionnées ici.
</p>

<h2>2. Utilisation du Site</h2>
<ul>
    <li>Ce site est destiné à un usage personnel et non commercial.</li>
    <li>Vous vous engagez à ne pas utiliser ce site à des fins illégales ou interdites par ces conditions.</li>
</ul>

<h2>3. Réservations</h2>
<ul>
    <li>Les réservations effectuées via ce site sont soumises à disponibilité.</li>
    <li>Nous nous réservons le droit d'annuler ou de modifier une réservation si nécessaire.</li>
</ul>

<h2>4. Politique de Confidentialité</h2>
<p>Vos informations personnelles seront traitées conformément à notre <a href="#">Politique de Confidentialité</a>.</p>

<h2>5. Propriété Intellectuelle</h2>
<p>Tous les contenus de ce site (textes, images, logos) sont la propriété de [Nom du Restaurant], sauf mention contraire. Toute reproduction est strictement interdite sans autorisation préalable.</p>

<h2>6. Responsabilité</h2>
<ul>
    <li>Nous nous efforçons de fournir des informations exactes, mais nous ne garantissons pas l'exactitude ou l'exhaustivité des contenus.</li>
    <li>Nous ne sommes pas responsables des dommages directs ou indirects résultant de l'utilisation de ce site.</li>
</ul>

<h2>7. Modifications des Conditions</h2>
<p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur cette page.</p>

<h2>8. Contact</h2>
<p>Pour toute question concernant ces conditions, veuillez nous contacter à l'adresse : <a href="mailto:contact@restaurant.com">contact@restaurant.com</a>.</p>`;

export const DEFAULT_SETTINGS: RestaurantSettings = {
  name: 'Restaurant',
  description: 'Welcome to our restaurant',
  logo: '',
  logoWidth: 100,
  logoHeight: 100,
  coverImage:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  currency: 'XOF',
  defaultTheme: 'dark',
  hasOpeningHours: false,
  openingHours: {
    monday: { open: '11:00', close: '22:00', closed: false },
    tuesday: { open: '11:00', close: '22:00', closed: false },
    wednesday: { open: '11:00', close: '22:00', closed: false },
    thursday: { open: '11:00', close: '22:00', closed: false },
    friday: { open: '11:00', close: '23:00', closed: false },
    saturday: { open: '11:00', close: '23:00', closed: false },
    sunday: { open: '11:00', close: '22:00', closed: false },
  },
  address: '123 Restaurant Street',
  phone: '+1 234 567 890',
  activeLanding: 'modern',
  activeHeader: 'classic',
  socialMedia: [],
  seo: {
    title: 'Restaurant',
    favicon: '',
    description: 'Experience culinary excellence at our restaurant',
    keywords: ['restaurant', 'food', 'dining'],
    ogImage: '',
    twitterHandle: '',
    googleSiteVerification: '',
  },
  email: '',
  canDeliver: true,
  canDineIn: true,
  paymentOnDineInActivated: false,
  rateLimits: {
    maxOrders: 2,
    timeWindowHours: 1,
  },
  termsOfService,
  holidayClosure: {
    enabled: false,
    startDate: '',
    endDate: '',
    reason: '',
  },
  taxes: {
    enabled: false,
    includedInPrice: false,
    rates: [],
  },
  tips: {
    enabled: false,
    defaultPercentages: ['5', '10', '15', '20'],
    allowCustom: true,
    label: 'Pourboire',
  },
  staffPermissions: ['pos', 'staff', 'orders'],
  delivery: {
    enabled: false,
    zones: [],
  },
  language: 'fr',
};

const defaultCurrencyInfo =
  "Cette devise n'est pas encore supportée par les système de paiement: Wave, Paytech, CinetPay, Stripe";

type AllCurrency = {
  label: string;
  value: string;
  infos: string;
  display: string;
  acceptedPaymentMethods: (
    | 'PayTech'
    | 'Wave'
    | 'Stripe'
    | 'CinetPay'
    | 'Money Fusion'
  )[];
};

export const allCurrencies: AllCurrency[] = [
  {
    label: 'XOF (FCFA)',
    value: 'XOF',
    display: 'FCFA',
    infos: '',
    acceptedPaymentMethods: ['PayTech', 'Wave', 'CinetPay', 'Money Fusion'],
  },
  {
    label: 'XAF (FCFA)',
    value: 'XAF',
    display: 'FCFA',
    infos: '',
    acceptedPaymentMethods: ['PayTech', 'CinetPay', 'Money Fusion'],
  },
  {
    label: 'CVE (CVE)',
    value: 'CVE',
    display: 'CVE',
    infos: '',
    acceptedPaymentMethods: ['PayTech', 'Wave', 'Money Fusion'],
  },
  {
    label: 'MRU (UM)',
    value: 'UM',
    display: 'MRU',
    infos: defaultCurrencyInfo,
    acceptedPaymentMethods: [],
  },
  {
    label: 'MAD (DH)',
    value: 'MAD',
    display: 'DH',
    infos: '',
    acceptedPaymentMethods: ['PayTech', 'Stripe', 'Money Fusion'],
  },
  {
    label: 'GMD (GMD)',
    value: 'GMD',
    display: 'GMD',
    infos: defaultCurrencyInfo,
    acceptedPaymentMethods: [],
  },

  {
    label: 'GOUD (HTG)',
    value: 'HTG',
    display: 'HTG',
    infos: defaultCurrencyInfo,
    acceptedPaymentMethods: [],
  },
  {
    label: 'Franc (GNF)',
    value: 'GNF',
    infos: '',
    display: 'GNF',
    acceptedPaymentMethods: ['CinetPay'],
  },
  {
    label: 'Franc (CDF)',
    value: 'CDF',
    display: 'CDF',
    infos: defaultCurrencyInfo,
    acceptedPaymentMethods: ['CinetPay'],
  },
  {
    label: 'USD ($)',
    value: 'USD',
    infos: '',
    display: 'USD',
    acceptedPaymentMethods: ['Stripe', 'PayTech', 'CinetPay', 'Money Fusion'],
  },
  {
    label: 'EUR (€)',
    value: 'EUR',
    infos: '',
    display: '€',
    acceptedPaymentMethods: ['Stripe', 'PayTech', 'Money Fusion'],
  },
  {
    label: 'CAD ($)',
    value: 'CAD',
    infos: '',
    display: '$',
    acceptedPaymentMethods: ['Stripe', 'PayTech', 'Money Fusion'],
  },
  {
    label: 'GBP (£)',
    value: 'GBP',
    infos: '',
    display: 'GBP',
    acceptedPaymentMethods: ['Stripe'],
  },
  {
    label: 'RUB (₽)',
    value: 'RUB',
    infos: '',
    display: '₽',
    acceptedPaymentMethods: ['Stripe'],
  },
  {
    label: 'DZD (DA)',
    value: 'DZD',
    infos: '',
    display: 'DA',
    acceptedPaymentMethods: ['Stripe'],
  },
  {
    label: 'Cedi (₵)',
    value: 'CEDI',
    infos: '',
    display: '₵',
    acceptedPaymentMethods: [],
  },
  {
    label: 'KMF',
    value: 'KMF',
    infos: '',
    display: 'FC',
    acceptedPaymentMethods: [],
  },
  {
    label: 'Ariary',
    value: 'AR',
    infos: '',
    display: 'AR',
    acceptedPaymentMethods: [],
  },
  {
    label: 'MUR',
    value: 'RS',
    infos: '',
    display: 'RS',
    acceptedPaymentMethods: [],
  },
  {
    label: 'DJF',
    value: 'DJF',
    infos: '',
    display: 'Franc',
    acceptedPaymentMethods: [],
  },
  {
    label: 'Riyal',
    value: 'SAR',
    infos: '',
    display: 'Riyal',
    acceptedPaymentMethods: [],
  },
  {
    label: 'CFP Franc',
    value: 'XPF',
    infos: '',
    display: 'CFP',
    acceptedPaymentMethods: [],
  },
  {
    label: 'Franc burundais (BIF)',
    value: 'BIF',
    infos: '',
    display: 'BIF',
    acceptedPaymentMethods: [],
  },
];

export const getCurrencyObject = (currency: string) => {
  return allCurrencies.find(
    curr => curr.value.toLowerCase() === currency.toLowerCase()
  );
};

import { useState, useCallback, useMemo } from 'react';
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Layout,
  ShoppingBag,
  Star,
  Tag,
  Clock,
  Plus,
  Trash2,
  Save,
  Check,
} from 'lucide-react';
import { Button } from '../../../../../../../components/ui';
import { LogoUploader } from '../../../../../../../components/settings';

import toast from 'react-hot-toast';
import { useSettings } from '../../../../../../../hooks';

// Define the theme configuration structure
export interface PizzaThemeConfig {
  header: {
    deliveryText: string;
    mainHeading: string;
    taglines: string[];
    showSpecialOffer: boolean;
    specialOfferPrice: string;
    buttonText: string;
    image: string;
    general: {
      display: boolean;
    };
  };
  menuSection: {
    tagline: string;
    title: string;
    general: {
      display: boolean;
    };
  };
  features: {
    showExcellentQuality: boolean;
    discountPercentage: string;
    excellentQualityHeading: string;
    image: string;
    backgroundImage: string;
    general: {
      display: boolean;
    };
  };
  specialItem: {
    title: string;
    description: string;
    price: string;
    priceText: string;
    image: string;
    buttonText: string;
    backgroundImage: string;
    general: {
      display: boolean;
    };
  };
  delivery: {
    title: string;
    description: string;
    phoneNumber: string;
    showPhoneNumber: boolean;
    general: {
      display: boolean;
    };
  };
  footer: {
    logoPartners: string[];
    location: string;
    copyrightText: string;
    showOpeningHours: boolean;
    backgroundImage: string;
    general: {
      display: boolean;
    };
    partnerTitle: string;
  };
}

// Default configuration with placeholder values
export const defaultConfig: PizzaThemeConfig = {
  header: {
    deliveryText: 'Free Home delivery 48 Hours',
    mainHeading: 'Lorem Ipsum is simply dummy text of the ...',
    taglines: [
      'Generous, Authentic, Delicious!',
      'Tasty Pizzas, Crispy Crust!',
      'Taste of Italy in Every Bite!',
    ],
    showSpecialOffer: true,
    specialOfferPrice: '39',
    buttonText: 'See Menu',
    image:
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/slide01-1.png',
    general: {
      display: true,
    },
  },
  menuSection: {
    tagline: 'FRESH FROM PANPIE',
    title: 'We offer people best way to eat best food',
    general: {
      display: true,
    },
  },
  features: {
    showExcellentQuality: true,
    discountPercentage: '40',
    excellentQualityHeading: 'We Have Excellent Quality Pizza',
    image:
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/40off.png',
    backgroundImage:
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/section_bg16.jpg',
    general: {
      display: true,
    },
  },
  specialItem: {
    title: 'Chicken King Burger',
    description:
      'The burger that will make your taste buds go wild! Soft bread, juicy steak grilled to perfection, melting cheese and a gourmet sauce.',
    price: '29',
    priceText: 'Limited Time',
    image:
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/limit-price-pizzaw.png',
    buttonText: 'Order Now',
    backgroundImage:
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/section_bg11.jpg',
    general: {
      display: true,
    },
  },
  delivery: {
    general: {
      display: true,
    },
    title: 'Get Free Delivery!',
    description:
      'A tasty burger, crispy fries and a refreshing drink... All delivered to your door for free! Why wait?',
    phoneNumber: '+1 234 567 890',
    showPhoneNumber: true,
  },
  footer: {
    partnerTitle: 'Our Partners',
    logoPartners: [
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/brand5.png',
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/brand4.png',
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/brand3.png',
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/brand2.png',
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/brand1.png',
    ],
    location: 'grand dakar',
    copyrightText: 'All Right Reserved',
    showOpeningHours: true,
    backgroundImage:
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/footer_shape03.png',
    general: {
      display: true,
    },
  },
};

// Header tab component
function HeaderTab() {
  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<PizzaThemeConfig>();
  const { t } = useTranslation();
  const image = watch('header.image');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:delivery-text')}
        </label>
        <input
          type="text"
          {...register('header.deliveryText')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:main-heading')}
        </label>
        <textarea
          {...register('header.mainHeading')}
          rows={2}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:taglines')}
        </label>
        <Controller
          control={control}
          name="header.taglines"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div className="space-y-2">
              {value.map((tagline, index) => (
                <div key={`tagline-${index}`} className="flex gap-2">
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => {
                      const newTaglines = [...value];
                      newTaglines[index] = e.target.value;
                      onChange(newTaglines);
                    }}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder={`${t('setting:tagline')} ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newTaglines = [...value];
                      newTaglines.splice(index, 1);
                      onChange(newTaglines);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onChange([...value, ''])}
                className="flex items-center text-blue-600 gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('setting:add-tagline')}
              </button>
              {error && <p className="text-sm text-red-500">{error.message}</p>}
            </div>
          )}
        />
      </div>

      <div>
        <LogoUploader
          value={image}
          onChange={(url: string) =>
            setValue('header.image', url, { shouldDirty: true })
          }
          label={t('setting:image')}
          description={t('setting:logo-description')}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:button-text')}
        </label>
        <input
          type="text"
          {...register('header.buttonText')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
    </div>
  );
}
// Menu items tab component
function MenuItemsTab() {
  const { t } = useTranslation();
  const { register } = useFormContext<PizzaThemeConfig>();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium border-b pb-2 dark:border-gray-700/80">
        {t('setting:food-menu-items')}
      </h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:tagline')}
        </label>
        <input
          type="text"
          {...register('menuSection.tagline')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:title')}
        </label>
        <input
          type="text"
          {...register('menuSection.title')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
    </div>
  );
}

// Features tab component
function FeaturesTab() {
  const { register, watch, setValue } = useFormContext<PizzaThemeConfig>();
  const { t } = useTranslation();
  const showExcellentQuality = watch('features.showExcellentQuality');
  const featuresImage = watch('features.image');
  const featuresBackgroundImage = watch('features.backgroundImage');

  return (
    <div className="space-y-6">
      {/* Display checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featuresDisplay"
          {...register('features.general.display')}
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor="featuresDisplay"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('setting:display-section')}
        </label>
      </div>

      {showExcellentQuality && (
        <>
          <div className="space-y-2 ml-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('setting:excellent-quality-heading')}
            </label>
            <input
              type="text"
              {...register('features.excellentQualityHeading')}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2 ml-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('setting:discount-percentage')}
            </label>
            <input
              type="text"
              {...register('features.discountPercentage')}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="ml-6">
            <LogoUploader
              value={featuresImage}
              onChange={url =>
                setValue('features.image', url, { shouldDirty: true })
              }
              label={t('setting:discount-image')}
              description={t('setting:discount-image-description')}
            />
          </div>

          <div className="ml-6">
            <LogoUploader
              value={featuresBackgroundImage}
              onChange={url =>
                setValue('features.backgroundImage', url, { shouldDirty: true })
              }
              label={t('setting:background-image')}
              description={t('setting:feature-background-image-description')}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Special item tab component
function SpecialItemTab() {
  const { register, setValue, watch } = useFormContext<PizzaThemeConfig>();
  const { t } = useTranslation();

  const specialItemImage = watch('specialItem.image');
  const specialItemBackgroundImage = watch('specialItem.backgroundImage');

  return (
    <div className="space-y-6">
      {/* Display checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="specialItemDisplay"
          {...register('specialItem.general.display')}
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor="specialItemDisplay"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('setting:display-section')}
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:title')}
        </label>
        <input
          type="text"
          {...register('specialItem.title')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:description')}
        </label>
        <textarea
          {...register('specialItem.description')}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('setting:price')}
          </label>
          <input
            type="text"
            {...register('specialItem.price')}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('setting:price-text')}
          </label>
          <input
            type="text"
            {...register('specialItem.priceText')}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div>
        <LogoUploader
          value={specialItemImage}
          onChange={url =>
            setValue('specialItem.image', url, { shouldDirty: true })
          }
          label={t('setting:special-item-image')}
          description={t('setting:special-item-image-description')}
        />
      </div>

      <div>
        <LogoUploader
          value={specialItemBackgroundImage}
          onChange={url =>
            setValue('specialItem.backgroundImage', url, { shouldDirty: true })
          }
          label={t('setting:special-item-background')}
          description={t('setting:special-item-background-description')}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:button-text')}
        </label>
        <input
          type="text"
          {...register('specialItem.buttonText')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
    </div>
  );
}

const FooterDeliveryTab = () => {
  const { register, watch, control, setValue } =
    useFormContext<PizzaThemeConfig>();
  const { t } = useTranslation();
  const showPhoneNumber = watch('delivery.showPhoneNumber');
  const footerBackgroundImage = watch('footer.backgroundImage');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium border-b pb-2 dark:border-gray-700/80">
        {t('setting:delivery-settings')}
      </h3>

      {/* Display checkbox for delivery */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="deliveryDisplay"
          {...register('delivery.general.display')}
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor="deliveryDisplay"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('setting:display-delivery-section')}
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:delivery-title')}
        </label>
        <input
          type="text"
          {...register('delivery.title')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:delivery-description')}
        </label>
        <textarea
          {...register('delivery.description')}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="showPhoneNumber"
          {...register('delivery.showPhoneNumber')}
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor="showPhoneNumber"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('setting:show-phone-number')}
        </label>
      </div>

      {showPhoneNumber && (
        <div className="space-y-2 ml-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('setting:phone-number')}
          </label>
          <input
            type="text"
            {...register('delivery.phoneNumber')}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      )}

      <h3 className="text-lg font-medium border-b pb-2 dark:border-gray-700/80">
        {t('setting:footer-settings')}
      </h3>

      {/* Display checkbox for footer */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="footerDisplay"
          {...register('footer.general.display')}
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor="footerDisplay"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('setting:display-footer-section')}
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:location')}
        </label>
        <input
          type="text"
          {...register('footer.location')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:copyright-text')}
        </label>
        <input
          type="text"
          {...register('footer.copyrightText')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="showOpeningHours"
          {...register('footer.showOpeningHours')}
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor="showOpeningHours"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('setting:show-opening-hours')}
        </label>
      </div>

      <div>
        <LogoUploader
          value={footerBackgroundImage}
          onChange={url =>
            setValue('footer.backgroundImage', url, { shouldDirty: true })
          }
          label={t('setting:footer-background')}
          description={t('setting:footer-background-description')}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:partner-title')}
        </label>
        <input
          type="text"
          {...register('footer.partnerTitle')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:partner-logos')}
        </label>
        <Controller
          control={control}
          name="footer.logoPartners"
          render={({ field: { onChange, value } }) => (
            <div className="space-y-4">
              {value.map((logo, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <LogoUploader
                    value={logo}
                    onChange={url => {
                      const newLogos = [...value];
                      newLogos[index] = url;
                      onChange(newLogos);
                    }}
                    label={`${t('setting:partner-logo')} ${index + 1}`}
                    description={t('setting:partner-logo-description')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newLogos = [...value];
                      newLogos.splice(index, 1);
                      onChange(newLogos);
                    }}
                    className="self-end p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onChange([...value, ''])}
                className="flex items-center text-blue-600 gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('setting:add-partner-logo')}
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

type PizzaThemeEditorProps = {
  onSave: (data: {
    configuration: PizzaThemeConfig;
    key: 'pizza';
  }) => Promise<void>;
  config: PizzaThemeConfig;
};

export default function PizzaThemeEditor(props: PizzaThemeEditorProps) {
  const [activeTab, setActiveTab] = useState('header');
  const [isSaved, setIsSaved] = useState(false);
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const { settings } = useSettings();

  //   if (!settings) return null;

  const methods = useForm<PizzaThemeConfig>({
    defaultValues: props.config,
    mode: 'onChange',
  });

  const { handleSubmit, reset, formState } = methods;

  const onSubmit = useCallback(async (data: PizzaThemeConfig) => {
    // Here you would save to Firebase
    try {
      setIsUpdating(true);
      await props.onSave({ key: 'pizza', configuration: data });
      setIsUpdating(false);
      toast.success(t('setting:theme-saved'));
    } catch (error) {
      console.error('Error saving theme', error);
      toast.error(t('setting:theme-saved-error'));
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Define tabs
  const tabs = useMemo(
    () => [
      {
        id: 'header',
        label: t('setting:header'),
        icon: <Layout className="h-4 w-4" />,
      },
      {
        id: 'menuItems',
        label: t('setting:menu-items'),
        icon: <ShoppingBag className="h-4 w-4" />,
      },
      {
        id: 'features',
        label: t('setting:features'),
        icon: <Star className="h-4 w-4" />,
      },
      {
        id: 'specialItem',
        label: t('setting:special-item'),
        icon: <Tag className="h-4 w-4" />,
      },
      {
        id: 'footer',
        label: t('setting:footer-delivery'),
        icon: <Clock className="h-4 w-4" />,
      },
    ],
    [t]
  );

  // Render tab content based on active tab
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'header':
        return <HeaderTab />;
      case 'menuItems':
        return <MenuItemsTab />;
      case 'features':
        return <FeaturesTab />;
      case 'specialItem':
        return <SpecialItemTab />;
      case 'footer':
        return <FooterDeliveryTab />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('setting:theme-customizer')}</h1>
        <div className="flex gap-2">
          {formState.isDirty && (
            <Button
              type="button"
              // variant="outline"
              onClick={() => reset()}
              className="border-gray-300 text-gray-600"
            >
              {t('common:discard')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isUpdating}
            onClick={handleSubmit(onSubmit)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {t('common:save')}
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center gap-2">
          <Check className="w-5 h-5" />
          {t('setting:theme-saved')}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border dark:border-gray-700 overflow-hidden">
              <ul className="divide-y dark:divide-gray-700">
                {tabs.map(tab => (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                          w-full flex items-center gap-3 px-4 py-3 text-left
                          transition-colors duration-200
                          ${
                            activeTab === tab.id
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-5">
                {renderTabContent()}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

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

export interface FoodThemeConfig {
  banner: {
    slides: Array<{
      title: string;
      subtitle: string;
    }>;
    buttonText: string;
    images: string[];
    general: {
      display: boolean;
    };
  };
  aboutUs: {
    display: string;
    sectionTitle: string;
    contentTitle: string;
    image: string;
    description: string;
    general: {
      display: boolean;
    };
  };
  discount: {
    discountTitle: string;
    buttonText: string;
    description: string;
    general: {
      display: boolean;
    };
  };
  footer: {
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

export const foodThemDefaultConfig: FoodThemeConfig = {
  banner: {
    slides: [
      {
        title: 'Welcome to PanPie',
        subtitle: 'The best pizza in town',
      },
      {
        title: 'Order now and get 40% off',
        subtitle: 'Use code PANPIE40',
      },
    ],
    buttonText: 'Order Now',
    images: [
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/slider1.jpg',
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/01/slider2.jpg',
    ],
    general: {
      display: true,
    },
  },
  footer: {
    partnerTitle: 'Our Partners',
    location: 'grand dakar',
    copyrightText: 'All Right Reserved',
    showOpeningHours: true,
    backgroundImage:
      'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/footer_shape03.png',
    general: {
      display: true,
    },
  },
  aboutUs: {
    display: '',
    sectionTitle: 'Notre Histoire',
    contentTitle: "Où puis-je m'en procurer?",
    image:
      'https://res.cloudinary.com/dgnwy0dnt/image/upload/v1742929484/restaurant/spqd98buopla8bkfxewu.png',
    description:
      "Plusieurs variations de Lorem Ipsum peuvent être trouvées ici ou là, mais la majeure partie d'entre elles a été altérée par l'addition d'humour ou de mots aléatoires qui ne ressemblent pas une seconde à du texte standard. Si vous voulez utiliser un passage du Lorem Ipsum,",
    general: {
      display: true,
    },
  },
  discount: {
    discountTitle: 'Obtenez 25% de reduction',
    description: 'Iil utilise un dictionnaire de plus de 200 mots latins.',
    buttonText: 'Commandez maintenant',
    general: {
      display: true,
    },
  },
};

function BannerTab() {
  const { register, watch, setValue, control } =
    useFormContext<FoodThemeConfig>();
  const { t } = useTranslation();

  const bannerImages = watch('banner.images', []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:slides')}
        </label>

        <Controller
          control={control}
          name="banner.slides"
          defaultValue={[]}
          render={({ field: { onChange, value = [] } }) => (
            <div className="space-y-4">
              {value.map((_, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg dark:border-gray-700 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Slide {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newSlides = [...value];
                        newSlides.splice(index, 1);
                        onChange(newSlides);

                        const newImages = [...bannerImages];
                        newImages.splice(index, 1);
                        setValue('banner.images', newImages);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('setting:title')}
                    </label>
                    <input
                      type="text"
                      {...register(`banner.slides.${index}.title` as const)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('setting:subtitle')}
                    </label>
                    <input
                      type="text"
                      {...register(`banner.slides.${index}.subtitle` as const)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <LogoUploader
                    value={bannerImages[index] || ''}
                    onChange={(url: string) => {
                      const newImages = [...bannerImages];
                      newImages[index] = url;
                      setValue('banner.images', newImages, {
                        shouldDirty: true,
                      });
                    }}
                    label={t('setting:slide-image')}
                    description={t('setting:slide-image-description')}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  onChange([...value, { title: '', subtitle: '' }]);
                  setValue('banner.images', [...bannerImages, '']);
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('setting:add-slide')}
              </button>
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:button-text')}
        </label>
        <input
          type="text"
          {...register('banner.buttonText')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="bannerDisplay"
          {...register('banner.general.display')}
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor="bannerDisplay"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('setting:display-section')}
        </label>
      </div>
    </div>
  );
}

function AboutUsTab() {
  const { register, watch, setValue } = useFormContext<FoodThemeConfig>();
  const { t } = useTranslation();
  const displayAboutUs = watch('aboutUs.display');
  const aboutUsImage = watch('aboutUs.image');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="aboutUsDisplay"
          {...register('aboutUs.display')}
          className="w-4 h-4 rounded"
        />
        <label
          htmlFor="aboutUsDisplay"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('setting:display-section')}
        </label>
      </div>

      {displayAboutUs && (
        <>
          <div className="space-y-2 ml-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('setting:about-us-section-title')}
            </label>
            <input
              type="text"
              {...register('aboutUs.sectionTitle')}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder={t('setting:about-us-section-title-placeholder')}
            />
          </div>

          <div className="space-y-2 ml-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('setting:about-us-content-title')}
            </label>
            <input
              type="text"
              {...register('aboutUs.contentTitle')}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder={t('setting:about-us-content-title-placeholder')}
            />
          </div>

          <div className="space-y-2 ml-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('setting:about-us-description')}
            </label>
            <textarea
              {...register('aboutUs.description')}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={4}
              placeholder={t('setting:about-us-description-placeholder')}
            />
          </div>

          <div className="ml-6">
            <LogoUploader
              value={aboutUsImage}
              onChange={url =>
                setValue('aboutUs.image', url, { shouldDirty: true })
              }
              label={t('setting:about-us-image')}
              description={t('setting:about-us-image-description')}
            />
          </div>
        </>
      )}
    </div>
  );
}

function DiscountTab() {
  const { register } = useFormContext<FoodThemeConfig>();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="specialItemDisplay"
          {...register('discount.general.display')}
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
          {...register('discount.discountTitle')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:description')}
        </label>
        <textarea
          {...register('discount.description')}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('setting:button-text')}
        </label>
        <input
          type="text"
          {...register('discount.buttonText')}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
    </div>
  );
}

const FooterDeliveryTab = () => {
  const { register } = useFormContext<FoodThemeConfig>();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium border-b pb-2 dark:border-gray-700/80">
        {t('setting:delivery-settings')}
      </h3>

      <h3 className="text-lg font-medium border-b pb-2 dark:border-gray-700/80">
        {t('setting:footer-settings')}
      </h3>

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
    </div>
  );
};

type FoodThemEditorProps = {
  onSave: (data: {
    configuration: FoodThemeConfig;
    key: 'food';
  }) => Promise<void>;
  config: FoodThemeConfig;
};

export default function FoodThemeEditor(props: FoodThemEditorProps) {
  const [activeTab, setActiveTab] = useState('banner');
  const [isSaved, setIsSaved] = useState(false);
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);

  const methods = useForm<FoodThemeConfig>({
    defaultValues: props.config,
    mode: 'onChange',
  });

  const { handleSubmit, reset, formState } = methods;

  const onSubmit = useCallback(async (data: FoodThemeConfig) => {
    try {
      setIsUpdating(true);
      await props.onSave({ key: 'food', configuration: data });
      setIsUpdating(false);
      toast.success(t('setting:theme-saved'));
    } catch (error) {
      console.error('Error saving theme', error);
      toast.error(t('setting:theme-saved-error'));
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const tabs = useMemo(
    () => [
      {
        id: 'banner',
        label: t('setting:banner'),
        icon: <Layout className="h-4 w-4" />,
      },
      {
        id: 'aboutUs',
        label: t('setting:about-us'),
        icon: <Star className="h-4 w-4" />,
      },
      {
        id: 'discount',
        label: t('setting:discount-item'),
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

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'banner':
        return <BannerTab />;
      case 'aboutUs':
        return <AboutUsTab />;
      case 'discount':
        return <DiscountTab />;
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

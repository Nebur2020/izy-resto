import { useForm } from 'react-hook-form';
import { X, Hash, Type, AlignLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Category } from '../../../types';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../hooks';

interface CategoryFormProps {
  category: Category | null;
  onSave: (data: Omit<Category, 'id'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function CategoryForm(props: CategoryFormProps) {
  const { category, onSave, onCancel, isLoading } = props;
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Omit<Category, 'id'>>({
    defaultValues: category || {
      name: '',
      description: '',
      order: 0,
    },
  });
  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative border-b dark:border-gray-700/80">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category
                ? t('category:update-category')
                : t('category:new-category')}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {category
                ? t('category:update-category-details')
                : t('category:add-new-category')}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={e => {
            e.stopPropagation();
            handleSubmit(onSave)(e);
          }}
          className="p-6 space-y-5"
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Type className="w-4 h-4" />
              {t('common:name')}
            </label>
            <div className="relative">
              <input
                {...register('name', { required: 'Le nom est requis' })}
                className={`
                  w-full rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2.5 pl-4
                  border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-white
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500
                  transition-shadow
                  ${errors.name ? 'border-red-500 dark:border-red-500' : ''}
                `}
                placeholder="Ex: Entrées"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <AlignLeft className="w-4 h-4" />
              {t('common:description')}
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="
                w-full rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2.5
                border border-gray-200 dark:border-gray-700
                text-gray-900 dark:text-white
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500
                transition-shadow resize-none
              "
              placeholder={t('category:description-placeholder')}
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Hash className="w-4 h-4" />
              {t('category:display-order')}
            </label>
            <input
              type="number"
              {...register('order', {
                valueAsNumber: true,
                min: { value: 0, message: "L'ordre doit être positif" },
              })}
              className="
                w-full rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2.5
                border border-gray-200 dark:border-gray-700
                text-gray-900 dark:text-white
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500
                transition-shadow
              "
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="px-4"
            >
              {t('common:cancel')}
            </Button>
            <Button
              type="submit"
              variant='custom'
              disabled={!isDirty || isLoading}
              className="px-6"
              style={{ background: primaryColor }}
              spanClassName='text-white'
            >
              {category ? t("common:update") : t("common:add")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

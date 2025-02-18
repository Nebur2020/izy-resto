import { useFieldArray, useFormContext } from 'react-hook-form';
import { Receipt, Coins, Plus, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RestaurantSettings } from '../../../../../types/settings';
import { Button } from '../../../../../components/ui/Button';
import { useCategories } from '../../../../../hooks/useCategories';
import { KeywordsInput } from '../../../../../components/settings/seo/KeywordsInput';
import { useTranslation } from 'react-i18next';

export function TaxSettings() {
  const { t } = useTranslation();
  const { register, watch, control, setValue } =
    useFormContext<RestaurantSettings>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'taxes.rates',
  });

  const { categories } = useCategories();
  const taxEnabled = watch('taxes.enabled');
  const tipsEnabled = watch('tips.enabled');

  const CategorySelect = ({ index }: { index: number }) => {
    const currentValue = watch(`taxes.rates.${index}.appliesTo`);

    return (
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">
          {t('taxAndTips:apply-to')}
        </label>
        <select
          value={currentValue}
          onChange={e =>
            setValue(`taxes.rates.${index}.appliesTo`, e.target.value, {
              shouldDirty: true,
            })
          }
          className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
        >
          <option value="all">
            {t('taxAndTips:apply-to-all-categories')}
          </option>
          {categories?.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const handleAddTax = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    append({
      id: crypto.randomUUID(),
      name: '',
      rate: 0,
      enabled: true,
      appliesTo: 'all',
      order: fields.length,
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const updatedFields = [...fields];
    const [movedItem] = updatedFields.splice(sourceIndex, 1);
    updatedFields.splice(destinationIndex, 0, movedItem);

    updatedFields.forEach((field, index) => {
      setValue(`taxes.rates.${index}.order`, index);
    });

    move(sourceIndex, destinationIndex);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold">Taxes</h2>
          </div>
          {taxEnabled && (
            <Button onClick={handleAddTax}>
              <Plus className="w-4 h-4 mr-2" />
              {t('taxAndTips:add-tax')}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('taxes.enabled')}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <label className="text-sm font-medium">
              {t('taxAndTips:enable-taxes')}
            </label>
          </div>

          {taxEnabled && (
            <>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tax-rates">
                  {provided => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {fields.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`
                                bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4
                                ${
                                  snapshot.isDragging
                                    ? 'shadow-lg ring-2 ring-blue-500'
                                    : ''
                                }
                              `}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move hover:text-blue-500 transition-colors"
                                >
                                  <GripVertical className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">
                                      {t('taxAndTips:tax-name')}
                                    </label>
                                    <input
                                      type="text"
                                      {...register(`taxes.rates.${index}.name`)}
                                      placeholder="Ex: TVA"
                                      className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium mb-1">
                                      {t('taxAndTips:tax-rate')}
                                    </label>
                                    <input
                                      type="number"
                                      step="0.001"
                                      min="0"
                                      max="100"
                                      {...register(`taxes.rates.${index}.rate`)}
                                      className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                                    />
                                  </div>

                                  <CategorySelect index={index} />

                                  <div className="md:col-span-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        {...register(
                                          `taxes.rates.${index}.enabled`
                                        )}
                                        className="rounded border-gray-300 dark:border-gray-600"
                                      />
                                      <label className="text-sm font-medium">
                                        {t('taxAndTips:enable-tax')}
                                      </label>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      onClick={() => remove(index)}
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </>
          )}
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('taxAndTips:tips')}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('tips.enabled')}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <label className="text-sm font-medium">
              {t('taxAndTips:enable-tips')}
            </label>
          </div>

          {tipsEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('taxAndTips:default-tips')}
                </label>
                <KeywordsInput
                  type="number"
                  value={watch('tips.defaultPercentages') || []}
                  onChange={keywords =>
                    setValue('tips.defaultPercentages', keywords, {
                      shouldDirty: true,
                    })
                  }
                />
                <p className="mt-1 text-sm text-gray-500">
                  {t('taxAndTips:default-tips-description')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('taxAndTips:tips-label')}
                </label>
                <input
                  type="text"
                  {...register('tips.label')}
                  placeholder={t('taxAndTips:tips-placeholder')}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

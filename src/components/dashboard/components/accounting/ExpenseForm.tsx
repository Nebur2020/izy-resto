import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../ui/Button';
import { Expense } from '../../../../types/accounting';
import { useSettings } from '../../../../hooks/useSettings';

interface ExpenseFormProps {
  expense?: Expense;
  onSave: (data: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

export function ExpenseForm({ expense, onSave, onCancel }: ExpenseFormProps) {
  const { settings } = useSettings();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: expense || {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      category: 'ingredients',
      description: '',
      paymentMethod: 'cash'
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {expense ? 'Modifier la dépense' : 'Ajouter une dépense'}
          </h2>
          <button onClick={onCancel}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <input
                type="date"
                {...register('date', { required: 'La date est requise' })}
                className="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Montant ({settings?.currency})
              </label>
              <input
                type="number"
                step={settings?.currency === 'XOF' ? '1' : '0.01'}
                {...register('amount', {
                  required: 'Le montant est requis',
                  min: { value: 0, message: 'Le montant doit être positif' }
                })}
                className="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Catégorie</label>
              <select
                {...register('category', { required: 'La catégorie est requise' })}
                className="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="ingredients">Ingrédients</option>
                <option value="equipment">Équipement</option>
                <option value="utilities">Charges</option>
                <option value="salaries">Salaires</option>
                <option value="rent">Loyer</option>
                <option value="maintenance">Maintenance</option>
                <option value="marketing">Marketing</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Mode de Paiement
              </label>
              <select
                {...register('paymentMethod', { required: 'Le mode de paiement est requis' })}
                className="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="cash">Espèces</option>
                <option value="card">Carte</option>
                <option value="transfer">Virement</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                {...register('description', { required: 'La description est requise' })}
                rows={3}
                className="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Fournisseur (Optionnel)
              </label>
              <input
                type="text"
                {...register('supplier')}
                className="w-full rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              {expense ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
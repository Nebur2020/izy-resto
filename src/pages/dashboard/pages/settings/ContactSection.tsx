import { UseFormRegister } from 'react-hook-form';
import { Globe } from 'lucide-react';
import { RestaurantSettings } from '../../../../types';

interface ContactSectionProps {
  register: UseFormRegister<RestaurantSettings>;
}

export function ContactSection({ register }: ContactSectionProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold">Contact & Emplacement</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Adresse</label>
          <input
            type="text"
            {...register('address', { required: true })}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            type="tel"
            {...register('phone', { required: true })}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          />
        </div>
      </div>
    </section>
  );
}
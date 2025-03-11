import React from 'react';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Button } from '../../../../components/ui/Button';
import { RestaurantSettings } from '../../../../types';

interface SettingsFormProps {
  register: UseFormRegister<RestaurantSettings>;
  onSubmit: (e: React.FormEvent) => void;
  watch: UseFormWatch<RestaurantSettings>;
}

export function SettingsForm({ register, onSubmit, watch }: SettingsFormProps) {
  const days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Basic Information */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold mb-2">Restaurant Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              {...register('name', { required: true })}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              placeholder="Enter restaurant name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...register('description', { required: true })}
              rows={3}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              placeholder="Short description of your restaurant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Landing Page Template
            </label>
            <select
              {...register('activeLanding')}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
            >
              <option value="modern">Modern (Default)</option>
              <option value="minimal">Minimal</option>
              <option value="grid">Grid</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Choose which landing page template to display on your website.
            </p>
          </div>

          {/* Other form fields... */}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
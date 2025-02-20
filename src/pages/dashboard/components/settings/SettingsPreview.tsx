import React from 'react';
import { UseFormWatch } from 'react-hook-form';
import { Clock, MapPin, Phone } from 'lucide-react';
import { RestaurantSettings } from '../../../../types';

interface SettingsPreviewProps {
  watch: UseFormWatch<RestaurantSettings>;
}

interface IInfoCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function InfoCard(props: IInfoCardProps) {
  const { icon: Icon, title, description } = props;
  return (
    <div className="bg-white dark:bg-gray-700/30 border dark:border-gray-600 rounded-lg p-4 text-gray-800 dark:text-gray-100 flex items-start space-x-4">
      <div className="flex-shrink-0">
        <Icon className="w-8 h-8 text-blue-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}

export function SettingsPreview({ watch }: SettingsPreviewProps) {
  const openingHours = watch('openingHours');
  const address = watch('address');
  const phone = watch('phone');

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Preview</h2>
      
      <p className="text-sm text-gray-500 dark:text-gray-300 mb-8">
        This is how your information may appear on the homepage.
      </p>
      
      <div className="space-y-4">
        <InfoCard
          icon={Clock}
          title="Opening Hours"
          description={
            openingHours?.monday && !openingHours.monday.closed 
              ? `${openingHours.monday.open || '11:00'} - ${openingHours.monday.close || '22:00'}`
              : 'Closed on Monday'
          }
        />
        <InfoCard
          icon={MapPin}
          title="Location"
          description={address || '123 Gourmet Street'}
        />
        <InfoCard
          icon={Phone}
          title="Contact"
          description={phone || 'Call us to book'}
        />
      </div>
    </section>
  );
}
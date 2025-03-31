import { motion } from 'framer-motion';
import { useSettings } from '../../hooks';

interface Tab {
  id: string;
  label: string;
}

interface ITabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs(props: ITabsProps) {
  const { tabs, activeTab, onChange } = props;
  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button"
            className={`relative py-4 px-1 ${
              activeTab === tab.id
                ? 'text-primary-color'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            style={{
              color: activeTab === tab.id ? primaryColor : undefined,
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  backgroundColor: primaryColor,
                }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

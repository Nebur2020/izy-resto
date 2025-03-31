import React from 'react';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/Button';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../hooks';

interface IKeywordsInputProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  type?: 'text' | 'number';
}

export function KeywordsInput(props: IKeywordsInputProps) {
  const { value, onChange, type = 'text' } = props;
  const { t } = useTranslation();
  const [input, setInput] = React.useState('');

  const {settings} = useSettings();
  const primaryColor = settings?.palette.primary;

  const handleAdd = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!input.trim()) return;

    const newKeyword = input.trim().toLowerCase();
    if (!value.includes(newKeyword)) {
      onChange([...value, newKeyword]);
    }
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (keyword: string) => {
    onChange(value.filter(k => k !== keyword));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type={type}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('settingSeo:seo-keywords-placeholder')}
          className="flex-1 rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
        />
        <Button
          type="button"
          onClick={() => handleAdd()}
          disabled={!input.trim()}
          style={{ backgroundColor: primaryColor }}
          variant='custom'
          spanClassName='text-white'
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('common:add')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {value.map(keyword => (
            <motion.span
              key={keyword}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              style={{ backgroundColor: primaryColor, color: "#fff" }}
            >
              {keyword}
              <button
                type="button"
                onClick={() => handleRemove(keyword)}
                className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

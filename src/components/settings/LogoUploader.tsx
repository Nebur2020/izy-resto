import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { MediaLibraryModal } from './MediaLibraryModal';
import { useMedia } from '../../hooks/useMedia';
import { useTranslation } from 'react-i18next';

interface ILogoUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

export function LogoUploader(props: ILogoUploaderProps) {
  const { t } = useTranslation();
  const {
    value = '',
    onChange,
    label = 'Logo',
    description = t('settingSeo:add-restaurent-logo'),
  } = props;
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const { files, uploadFile } = useMedia();

  const handleMediaSelect = (url: string) => {
    onChange(url);
    setIsMediaLibraryOpen(false);
  };

  const handleMediaLibraryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMediaLibraryOpen(true);
  };

  return (
    <div className="space-y-4">
      <label className="block text-base font-semibold text-gray-900 dark:text-gray-100">
        {label}
      </label>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div
          className={`relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl 
          border-2 border-dashed 
          ${
            value
              ? 'border-blue-500/30 bg-blue-50/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
          } 
          flex items-center justify-center transition-all duration-300 hover:border-blue-500`}
        >
          <AnimatePresence mode="wait">
            {value ? (
              <motion.img
                key="logo"
                src={value}
                alt="Logo preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full w-full object-contain p-4"
                onError={() => onChange('')}
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500"
              >
                <ImageIcon className="h-10 w-10 mb-2" />
                <span className="text-xs text-center px-2">
                  {t('common:no-logo-placeholder')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="w-full md:flex-1 space-y-4">
          <Button
            type="button"
            onClick={handleMediaLibraryClick}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 
              bg-blue-50 dark:bg-blue-900/30 
              text-blue-600 dark:text-blue-400 
              hover:bg-blue-100 dark:hover:bg-blue-900/50 
              border border-blue-100 dark:border-blue-900/40
              transition-all duration-300 
              group"
          >
            <Upload className="h-5 w-5 transition-transform group-hover:rotate-6" />
            {t('common:select-upload-image')}
          </Button>

          <AnimatePresence>
            {value && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Button
                  type="button"
                  variant="danger"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange('');
                  }}
                  className="w-full flex items-center justify-center gap-2 
                    bg-red-50 dark:bg-red-900/30 
                    text-red-600 dark:text-red-400 
                    hover:bg-red-100 dark:hover:bg-red-900/50 
                    border border-red-100 dark:border-red-900/40
                    transition-all duration-300 
                    group"
                >
                  <X className="h-5 w-5 transition-transform group-hover:rotate-6" />
                  {t('common:remove-image')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
        {description}
      </p>

      {/* Media Library Modal */}
      {isMediaLibraryOpen && (
        <MediaLibraryModal
          onSelect={handleMediaSelect}
          onClose={() => setIsMediaLibraryOpen(false)}
          files={files}
          onUpload={uploadFile}
        />
      )}
    </div>
  );
}

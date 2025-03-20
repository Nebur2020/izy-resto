import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink, Check } from 'lucide-react';
import { MediaFile } from '../../../../types/media';
import { Button } from '../../../ui/Button';
import {
  formatFileSize,
  formatDate,
  localeDateMatch,
} from '../../../../utils/format';
import { Language } from '../../../../types';
import { useTranslation } from 'react-i18next';

interface MediaListProps {
  files: MediaFile[];
  isLoading: boolean;
  onDelete: (fileId: string) => void;
  onSelect?: (url: string) => void;
  selectedFiles: Set<string>;
  onToggleSelect: (fileId: string) => void;
}

export function MediaList(props: MediaListProps) {
  const {
    files,
    isLoading,
    onDelete,
    onSelect,
    selectedFiles,
    onToggleSelect,
  } = props;

  const { t, i18n } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <ExternalLink className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {t('common:media-empty')}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('common:media-empty-desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {
        files.map(file => (
          <motion.div
            key={file.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => onToggleSelect(file.id)}
            className={`
              group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden
              border border-gray-200 dark:border-gray-700
              transition-all duration-200
              hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600
              cursor-pointer
              ${
                selectedFiles.has(file.id)
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                  : ''
              }
            `}
          >
            <div className="flex items-center p-4">
              <div
                className={`
                w-6 h-6 rounded-full border-2 mr-4
                transition-colors duration-200 
                ${
                  selectedFiles.has(file.id)
                    ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
                    : 'border-gray-300 dark:border-gray-600'
                }
                flex items-center justify-center
              `}
              >
                {selectedFiles.has(file.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>

              <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex-1 min-w-0 ml-4">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(
                      file.createdAt,
                      localeDateMatch[i18n.language as Language]
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {onSelect ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      onSelect(file.url);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white dark:bg-gray-700/90 dark:hover:bg-gray-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      window.open(file.url, '_blank');
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white dark:bg-gray-700/90 dark:hover:bg-gray-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))
        }
      </AnimatePresence>
    </div>
  );
}

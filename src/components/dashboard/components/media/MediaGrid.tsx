import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink, Check, ImageIcon } from 'lucide-react';
import { MediaFile } from '../../../../types/media';
import { Button } from '../../../ui/Button';

interface MediaGridProps {
  files: MediaFile[];
  isLoading: boolean;
  onDelete: (fileId: string) => void;
  onSelect?: (url: string) => void;
  selectedFiles?: Set<string>;
  onToggleSelect?: (fileId: string) => void;
}

export function MediaGrid(props: MediaGridProps) {
  const {
    files,
    isLoading,
    onDelete,
    onSelect,
    selectedFiles = new Set(),
    onToggleSelect,
  } = props;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden"
          >
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-600 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Aucun fichier trouvé</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {files.map(file => (
          <motion.div
            key={file.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onToggleSelect?.(file.id)}
            className={`
              group relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 
              dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden shadow-sm 
              hover:shadow-md transition-all duration-200 cursor-pointer
              ${
                selectedFiles.has(file.id)
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                  : ''
              }
            `}
          >
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-white font-medium truncate mb-1">
                  {file.name}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    {onSelect ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          onSelect(file.url);
                        }}
                        className="bg-white/20 hover:bg-white/30"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          window.open(file.url, '_blank');
                        }}
                        className="bg-white/20 hover:bg-white/30"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(file.id);
                      }}
                      className="bg-red-500/80 hover:bg-red-500"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

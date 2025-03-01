import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Grid } from 'lucide-react';
import { Button } from '../ui/Button';
import { MediaGrid } from '../dashboard/components/media/MediaGrid';
import { MediaUploader } from '../dashboard/components/media/MediaUploader';
import { MediaFile } from '../../types/media';
import { Pagination } from '../ui/Pagination';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 12;

interface IMediaLibraryModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  files: MediaFile[];
  onUpload: (file: File) => Promise<string>;
}

export function MediaLibraryModal(props: IMediaLibraryModalProps) {
  const { t } = useTranslation();
  const { onSelect, onClose, files, onUpload } = props;
  const [isGridView, setIsGridView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleUpload = async (file: File) => {
    try {
      await onUpload(file);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl max-h-[80vh] rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800 overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('media:media-title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {files.length} {t('media:media-files')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`${t('common:search-placeholder')}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border pl-10 pr-4 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={isGridView ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsGridView(true)}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <MediaGrid
            files={paginatedFiles}
            isLoading={false}
            onDelete={() => {}}
            onSelect={onSelect}
          />
        </div>

        {totalPages > 1 && (
          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {isUploadModalOpen && (
          <MediaUploader
            onClose={() => setIsUploadModalOpen(false)}
            onUpload={handleUpload}
          />
        )}
      </motion.div>
    </div>
  );
}

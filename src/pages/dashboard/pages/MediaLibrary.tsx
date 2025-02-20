import { useState } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { MediaGrid } from '../../../components/dashboard/components/media/MediaGrid';
import { MediaList } from '../../../components/dashboard/components/media/MediaList';
import { BulkUploader } from '../../../components/dashboard/components/media/BulkUploader';
import { BulkActions } from '../../../components/dashboard/components/media/BulkActions';
import { useMediaGallery } from '../../../hooks/useMediaGallery';
import { Pagination } from '../../../components/ui/Pagination';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 12;

export function MediaLibrary() {
  const { t } = useTranslation();
  const [isGridView, setIsGridView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    isBulk: boolean;
    fileIds?: string[];
  }>({ isOpen: false, isBulk: false });

  const {
    files,
    totalFiles,
    currentPage,
    totalPages,
    setCurrentPage,
    isLoading,
    uploadFiles,
    deleteFiles,
  } = useMediaGallery(ITEMS_PER_PAGE);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = async (files: File[]) => {
    try {
      await uploadFiles(files);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.fileIds?.length) return;

    try {
      await deleteFiles(deleteConfirmation.fileIds);
      setSelectedFiles(new Set());
      toast.success(
        deleteConfirmation.isBulk
          ? t('media:files-deleted')
          : t('media:file-deleted')
      );
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleteConfirmation({ isOpen: false, isBulk: false });
    }
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('media:media-title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalFiles} {t('media:media-files')}
          </p>
        </div>

        <BulkActions
          selectedCount={selectedFiles.size}
          onUpload={() => setIsUploadModalOpen(true)}
          onDelete={() =>
            setDeleteConfirmation({
              isOpen: true,
              isBulk: true,
              fileIds: Array.from(selectedFiles),
            })
          }
          onClearSelection={() => setSelectedFiles(new Set())}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('common:search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border pl-10 pr-4 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsGridView(true)}
            className={`p-2 rounded-lg ${
              isGridView
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsGridView(false)}
            className={`p-2 rounded-lg ${
              !isGridView
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        {isGridView ? (
          <MediaGrid
            files={filteredFiles}
            isLoading={isLoading}
            onDelete={id =>
              setDeleteConfirmation({
                isOpen: true,
                isBulk: false,
                fileIds: [id],
              })
            }
            selectedFiles={selectedFiles}
            onToggleSelect={toggleFileSelection}
          />
        ) : (
          <MediaList
            files={filteredFiles}
            isLoading={isLoading}
            onDelete={id =>
              setDeleteConfirmation({
                isOpen: true,
                isBulk: false,
                fileIds: [id],
              })
            }
            selectedFiles={selectedFiles}
            onToggleSelect={toggleFileSelection}
          />
        )}
        {totalPages > 1 && (
          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      {isUploadModalOpen && (
        <BulkUploader
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
          maxSizeMB={5}
          acceptedFileTypes={['.png', '.jpg', '.jpeg', '.gif']}
        />
      )}
      <ConfirmDialog
        isOpen={deleteConfirmation.isOpen}
        title={
          deleteConfirmation.isBulk
            ? t('media:delete-files')
            : t('media:delete-file')
        }
        message={
          deleteConfirmation.isBulk
            ? t('media:deleting-files-confirmation', {
                count: deleteConfirmation.fileIds?.length,
              })
            : t('media:deleting-confirmation')
        }
        confirmLabel={t('common:delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, isBulk: false })}
      />
    </div>
  );
}

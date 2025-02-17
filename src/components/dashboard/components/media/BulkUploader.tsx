import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, AlertCircle } from 'lucide-react';
import { ProgressBar } from '../../../ui/ProgressBar';
import { useTranslation } from 'react-i18next';

interface IBulkUploaderProps {
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
}

interface UploadStatus {
  [key: string]: {
    progress: number;
    error?: string;
    complete?: boolean;
  };
}

export function BulkUploader(props: IBulkUploaderProps) {
  const { t } = useTranslation();
  const { onClose, onUpload, maxSizeMB = 10, acceptedFileTypes = ['image/*'] } = props;
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      const initialStatus: UploadStatus = {};
      acceptedFiles.forEach(file => {
        initialStatus[file.name] = { progress: 0 };
      });
      setUploadStatus(initialStatus);

      try {
        const uploadPromises = acceptedFiles.map(async file => {
          const interval = setInterval(() => {
            setUploadStatus(prev => {
              const currentProgress = prev[file.name]?.progress || 0;
              if (currentProgress < 90) {
                return {
                  ...prev,
                  [file.name]: {
                    ...prev[file.name],
                    progress: Math.min(currentProgress + 10, 90),
                  },
                };
              }
              return prev;
            });
          }, 500);

          try {
            await onUpload([file]);
            clearInterval(interval);
            setUploadStatus(prev => ({
              ...prev,
              [file.name]: { progress: 100, complete: true },
            }));
          } catch (error) {
            clearInterval(interval);
            setUploadStatus(prev => ({
              ...prev,
              [file.name]: {
                progress: 0,
                error: 'Failed to upload file',
              },
            }));
          }
        });

        await Promise.all(uploadPromises);

        setTimeout(onClose, 1500);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onClose]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFileTypes,
    },
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: isUploading,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          disabled={isUploading}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">
          {t('media:add-media')}
        </h2>

        <div
          {...getRootProps()}
          className={`
            relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8
            transition-all
            ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />

          <Upload
            className={`h-12 w-12 mb-4 ${
              isDragActive
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-400'
            }`}
          />

          <p className="text-center text-gray-900 dark:text-gray-100">
            {isDragActive ? (
              'Déposez les fichiers ici...'
            ) : (
              <>
                {t('media:dnd-descrption')}
                <br />
                <span className="text-blue-500 dark:text-blue-400">
                  {t('media:select-files')}
                </span>
              </>
            )}
          </p>

          <p className="text-sm text-amber-700 dark:text-amber-300 font-bold">
            {t('media:file-type', { maxSize: maxSizeMB })}
          </p>
        </div>
        <AnimatePresence>
          {Object.entries(uploadStatus).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-4 overflow-hidden"
            >
              {Object.entries(uploadStatus).map(([filename, status]) => (
                <div key={filename} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {filename}
                    </span>
                    {status.error ? (
                      <span className="text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {status.error}
                      </span>
                    ) : (
                      <span className="text-gray-500">{status.progress}%</span>
                    )}
                  </div>
                  <ProgressBar
                    progress={status.progress}
                    isComplete={status.complete}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

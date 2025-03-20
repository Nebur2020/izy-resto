import { useState, useEffect } from 'react';
import { mediaService } from '../services/media/media.service';
import { MediaFile } from '../types/media';
import toast from 'react-hot-toast';

export function useMediaGallery(itemsPerLoad: number = 12) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [lastLoadedIndex, setLastLoadedIndex] = useState(0);

  useEffect(() => {
    loadInitialFiles();
  }, []);

  const loadInitialFiles = async () => {
    try {
      setIsLoading(true);
      const mediaFiles = await mediaService.getAllMedia();
      setFiles(mediaFiles.slice(0, itemsPerLoad));
      setLastLoadedIndex(itemsPerLoad);
      setHasMore(mediaFiles.length > itemsPerLoad);
    } catch (error) {
      console.error('Error loading media files:', error);
      toast.error('Erreur chargement gallerie');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreFiles = async () => {
    if (!hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const mediaFiles = await mediaService.getAllMedia();
      const nextFiles = mediaFiles.slice(
        lastLoadedIndex,
        lastLoadedIndex + itemsPerLoad
      );
      setFiles(prevFiles => [...prevFiles, ...nextFiles]);
      setLastLoadedIndex(lastLoadedIndex + itemsPerLoad);
      setHasMore(mediaFiles.length > lastLoadedIndex + itemsPerLoad);
    } catch (error) {
      console.error('Error loading more files:', error);
      toast.error('Erreur chargement fichiers supplémentaires');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const uploadFiles = async (files: File[]) => {
    try {
      const uploadPromises = files.map(file => {
        return mediaService.uploadFile(file, progress => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress,
          }));
        });
      });

      await Promise.all(uploadPromises);
      await loadInitialFiles();
      setUploadProgress({});
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({});
      throw error;
    }
  };

  const deleteFiles = async (fileIds: string[]) => {
    try {
      await mediaService.deleteFiles(fileIds);
      await loadInitialFiles();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  return {
    files,
    totalFiles: files.length,
    isLoading,
    isLoadingMore,
    hasMore,
    uploadFiles,
    deleteFiles,
    uploadProgress,
    loadMoreFiles,
    refreshFiles: loadInitialFiles,
  };
}
